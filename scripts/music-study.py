"""Reproducible offline ensemble studies from original score + pinned CC0 samples.

Run with the isolated requirements in art/music/studies/v2/requirements.txt.
No original-game media, credentials, paid services or runtime changes are used.
"""
import argparse
import concurrent.futures
import hashlib
import json
import math
import re
import runpy
import shutil
import subprocess
import urllib.parse
import urllib.request
from fractions import Fraction
from pathlib import Path

import imageio_ffmpeg
import mido
import numpy as np
import soundfile as sf
from scipy import signal

ROOT = Path(__file__).resolve().parents[1]
STUDY = ROOT / 'art/music/studies/v2'
META = ('facebookincubator/Meta-open-sound', '251c0be57d5d1b3242b91f53e0cde62ab1cb42d9')
VCSL = ('sgossner/VCSL', 'c1ea7bcc3c7309650ab0da9d15c9cd1fbc4a4c7e')
RATE = 44100
NOTES = {'C':0,'Cs':1,'C#':1,'D':2,'Ds':3,'D#':3,'E':4,'F':5,'Fs':6,'F#':6,'G':7,'Gs':8,'G#':8,'A':9,'As':10,'A#':10,'B':11}


def pitch(name):
    m = re.fullmatch(r'([A-G](?:s|#)?)(-?\d+)', name)
    return 12 * (int(m[2]) + 1) + NOTES[m[1]]


def raw_url(repo, sha, path):
    return 'https://raw.githubusercontent.com/' + repo + '/' + sha + '/' + urllib.parse.quote(path, safe='/')


def read_url(url):
    return urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'WillowLaneMusicStudy'}),timeout=45).read()


def fetch_samples(cache):
    cache.mkdir(parents=True, exist_ok=True)
    items = []
    def item(repo, location, instrument, note, variant=0):
        items.append(dict(url=raw_url(*repo,location),instrument=instrument,note=note,variant=variant,
                          file=instrument+'-'+str(note)+'-'+str(variant)+Path(location).suffix,
                          upstreamPath=location,upstreamCommit=repo[1],license='CC0-1.0'))
    for note in ['C2','G2','C3','E3','G3','B3','D4','F4','A4','C5','E5']:
        for velocity in [2,3]:
            item(META,'systems/instruments/meta-piano/ogg/INSPiano_Vel0'+str(velocity)+'_'+note+'_01.ogg','piano',pitch(note),velocity-2)
    manifest=json.loads(read_url(raw_url(*META,'systems/instruments/meta-nylon-guitar/manifest.json')))
    for note in ['E2','A2','C3','E3','G3','B3','D4','F4','A4','C5']:
        name=next(s['file'] for s in manifest['samples'] if '_Vel01Finger_'+note+'_01.wav' in s['file'])
        item(META,'systems/instruments/meta-nylon-guitar/ogg/'+name.replace('.wav','.ogg'),'guitar',pitch(note))
    tree=json.loads(read_url('https://api.github.com/repos/'+VCSL[0]+'/git/trees/'+VCSL[1]+'?recursive=1'))['tree']
    # Choose existing soft-mallet roots; no proprietary preset bank involved.
    for t in tree:
        name=t['path']
        if '/Vibraphone/Soft Mallets/' in name and '_v1_' in name and name.endswith('.wav'):
            note=re.search(r'Vibes_soft_([A-G]#?\d)_',name)[1]
            item(VCSL,name,'vibes',pitch(note))
    percussion = {
      'rim':'Membranophones/Struck Membranophones/Snare Drum, Modern 3/Snare4_Xstick_v2_rr1_Mid.wav',
      'hat':'Idiophones/Struck Idiophones/Hi-Hat Cymbal/HiHat_Close_rr1_Mid.wav',
      'shaker':'Idiophones/Struck Idiophones/Shaker, Small/Mid_ShakerDouble_Down_rr1.wav',
      'kick':'Membranophones/Struck Membranophones/Bass Drum 1/BDrumNew_hit_v2_rr1_Sum.wav',
    }
    for instrument,location in percussion.items(): item(VCSL,location,instrument,0)
    pinned_path=STUDY/'sample-sources.json'
    pinned={r['file']:r for r in json.loads(pinned_path.read_text())} if pinned_path.exists() else {}
    def download(row):
        target=cache/row['file']
        if not target.exists(): target.write_bytes(read_url(row['url']))
        data=target.read_bytes()
        if row['file'] in pinned:
            assert hashlib.sha256(data).hexdigest()==pinned[row['file']]['sha256'], 'Pinned sample differs: '+row['file']
        return {**row,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()}
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        records=list(executor.map(download,items))
    for title,repo in [('meta',META),('vcsl',VCSL)]:
        data=read_url(raw_url(*repo,'LICENSE'))
        (STUDY/(title+'-LICENSE-CC0.txt')).write_bytes(data)
    (STUDY/'sample-sources.json').write_text(json.dumps(records,indent=2)+'\n',encoding='utf8')
    return records


class Sampler:
    def __init__(self,cache,records):
        self.cache,self.records,self.raw,self.notes=cache,records,{},{}
    def sample(self,part,note,velocity):
        instrument = 'piano' if part in ['lead','bass'] else part
        roots=[r for r in self.records if r['instrument']==instrument]
        selected=min(roots,key=lambda r:abs(r['note']-note)+(.1*abs(r['variant']-(1 if velocity>75 else 0))))
        key=(selected['file'],note)
        if key in self.notes:return self.notes[key]
        if selected['file'] not in self.raw:
            path=self.cache/selected['file']
            assert hashlib.sha256(path.read_bytes()).hexdigest()==selected['sha256']
            data,rate=sf.read(path,dtype='float32',always_2d=True)
            data=data.mean(axis=1);data-=data.mean()
            peak=float(np.max(np.abs(data)));assert peak>1e-6
            # Remove recording pre-roll only; retain natural attack and decay.
            active=np.flatnonzero(np.abs(data)>peak*.001)
            data=data[max(0,int(active[0])-int(rate*.003)):]
            if rate!=RATE:data=signal.resample_poly(data,RATE,rate).astype('float32')
            data=data/np.max(np.abs(data))*.7
            if instrument=='kick':data=signal.sosfilt(signal.butter(2,220,fs=RATE,output='sos'),data).astype('float32')
            self.raw[selected['file']]=data
        data=self.raw[selected['file']]
        if instrument not in ['rim','hat','shaker','kick']:
            ratio=Fraction(2**((selected['note']-note)/12)).limit_denominator(500)
            data=signal.resample_poly(data,ratio.numerator,ratio.denominator).astype('float32')
        self.notes[key]=data
        return data


def render(score,sampler):
    count=round(score['bars']*4*60/score['bpm']*RATE)
    mix=np.zeros((count,2),dtype='float32')
    gains={'lead':.34,'piano':.19,'guitar':.16,'vibes':.28,'bass':.36,'rim':.075,'hat':.036,'shaker':.035,'kick':.16}
    pans={'lead':-.12,'piano':-.18,'guitar':.22,'vibes':.12,'bass':0,'rim':.18,'hat':-.25,'shaker':.28,'kick':0}
    def put(offset,note):
        if score['loop']:
            positions=(np.arange(len(note))+offset)%count
            np.add.at(mix[:,0],positions,note[:,0]);np.add.at(mix[:,1],positions,note[:,1])
        else:
            lo=max(0,offset);hi=min(count,offset+len(note))
            if hi>lo:mix[lo:hi]+=note[lo-offset:hi-offset]
    for event in score['events']:
        part=event['part'];data=sampler.sample(part,event['note'],event['velocity'])
        duration=event['duration']*60/score['bpm'];release=.17 if part in ['lead','piano','vibes'] else .09
        length=min(len(data),round((duration+release)*RATE))
        data=data[:length].copy()
        gate=min(length,round(duration*RATE));tail=length-gate
        if tail:data[gate:]*=np.linspace(1,0,tail,dtype='float32')**2
        attack=min(round(.002*RATE),length);data[:attack]*=np.linspace(0,1,attack,dtype='float32')
        data*=gains[part]*(event['velocity']/90)**1.3
        pan=pans[part];stereo=np.stack([data*math.sqrt((1-pan)/2),data*math.sqrt((1+pan)/2)],axis=1)
        put(round(event['beat']*60/score['bpm']*RATE),stereo)
    # Small room, periodic tails wrap for loops instead of cutting/fading the whole mix.
    room=mix.copy()
    for delay,amount in [(.031,.065),(.047,.045),(.079,.035),(.113,.02)]:
        frames=round(delay*RATE)
        if score['loop']:mix+=np.roll(room[:,::-1],frames,axis=0)*amount
        else:mix[frames:]+=room[:-frames,::-1]*amount
    return mix


def midi_export(score,path):
    midi=mido.MidiFile(ticks_per_beat=480)
    programs={'lead':0,'piano':0,'guitar':24,'vibes':11,'bass':0}
    channels={part:index for index,part in enumerate(programs)}
    conductor=mido.MidiTrack();midi.tracks.append(conductor)
    conductor.append(mido.MetaMessage('set_tempo',tempo=mido.bpm2tempo(score['bpm'])))
    for part in sorted({e['part'] for e in score['events']}):
        track=mido.MidiTrack();midi.tracks.append(track)
        track.append(mido.MetaMessage('track_name',name=part))
        channel=channels.get(part,9)
        if part in programs:track.append(mido.Message('program_change',program=programs[part],channel=channel))
        events=[]
        for e in score['events']:
            if e['part']!=part:continue
            for kind,beat in [('note_on',e['beat']),('note_off',e['beat']+e['duration'])]:
                events.append((round(beat*480),kind,e))
        previous=0
        for tick,kind,e in sorted(events,key=lambda x:(x[0],x[1])):
            track.append(mido.Message(kind,channel=channel,note=e['note'],velocity=e['velocity'] if kind=='note_on' else 0,time=tick-previous));previous=tick
    midi.save(path)


def ffmpeg(args):
    run=subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(),'-hide_banner','-nostats','-y',*map(str,args)],capture_output=True,text=True,check=True)
    return run.stderr


def loudness(path):
    log=ffmpeg(['-i',path,'-af','loudnorm=I=-21:TP=-2:LRA=6:print_format=json','-f','null','-'])
    return json.loads(log[log.rfind('{'):log.rfind('}')+1])


def export(name,data,out):
    raw=out/(name+'-raw.wav');master=out/(name+'.wav');ogg=out/(name+'.ogg')
    sf.write(raw,data,RATE,subtype='FLOAT')
    measured=loudness(raw)
    filt='loudnorm=I=-21:TP=-2:LRA=6:linear=true:measured_I={input_i}:measured_TP={input_tp}:measured_LRA={input_lra}:measured_thresh={input_thresh}:offset={target_offset}'.format(**measured)
    ffmpeg(['-i',raw,'-af',filt,'-ar',RATE,'-c:a','pcm_s24le',master])
    ffmpeg(['-i',master,'-c:a','libvorbis','-q:a',5,ogg])
    pcm,rate=sf.read(master,always_2d=True,dtype='float32')
    decoded,decoded_rate=sf.read(ogg,always_2d=True,dtype='float32')
    assert rate==decoded_rate==RATE and len(pcm)==len(decoded)
    stats={'file':master.name,'seconds':len(pcm)/rate,'frames':len(pcm),'channels':pcm.shape[1],
           'peakDbFS':20*math.log10(float(np.max(np.abs(pcm)))+1e-12),
           'loudness':loudness(master),'decodedOggLoudness':loudness(ogg),
           'boundaryStep':float(np.max(np.abs(decoded[-1]-decoded[0]))),
           'internalStepP999':float(np.quantile(np.abs(np.diff(decoded,axis=0)),.999)),
           'dcOffset':list(map(float,pcm.mean(axis=0))),
           'sha256':{p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in [master,ogg]}}
    raw.unlink()
    return stats


def baseline():
    text=(ROOT/'src/game/content/audio-scores.ts').read_text()
    notes=list(map(int,re.search(r'preparation: \[([^]]+)\]',text,re.S)[1].replace('\n','').split(',')))
    n=math.ceil(len(notes)*.48*RATE);t=np.arange(n)/RATE;index=(t/.48).astype(int);within=t-index*.48
    notes=np.asarray(notes);frequencies=440*2**((notes[index]-69)/12)
    envelope=np.where(within<.015,within/.015,np.exp(np.log(.0001/.12)*(within-.015)/(.32-.015)))
    wave=2/np.pi*np.arcsin(np.sin(2*np.pi*frequencies*within))*envelope*.12
    wave[(notes[index]==0)|(within>=.32)]=0
    return np.repeat(wave.astype('float32')[:,None],2,axis=1)


def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--fetch',action='store_true');args=p.parse_args()
    cache=ROOT/'.local-m4/music-samples';out=ROOT/'.local-m4/music-v2-audition';out.mkdir(parents=True,exist_ok=True)
    records=fetch_samples(cache) if args.fetch else json.loads((STUDY/'sample-sources.json').read_text())
    for record in records:
        sample = cache / record['file']
        if not sample.is_file() or hashlib.sha256(sample.read_bytes()).hexdigest() != record['sha256']:
            raise ValueError('Missing or changed pinned sample: ' + record['file'])
    sampler=Sampler(cache,records);module=runpy.run_path(str(ROOT/'scripts/music-study-score.py'))
    report=[]
    production_a={**module['make_score']('A',64),'id':'preparation'}
    production_b={**module['make_score']('B',64),'id':'selling'}
    for score in [module['make_score']('A'),module['make_score']('B'),module['results_score'](),production_a,production_b]:
        name=score['id'];(STUDY/(name+'-score.json')).write_text(json.dumps(score,indent=2)+'\n')
        midi_export(score,out/(name+'.mid'));stats=export(name,render(score,sampler),out)
        stats['loop']=score['loop'];report.append(stats);print(name,round(stats['seconds'],2),stats['loudness']['input_i'],'LUFS')
        if score['loop']:
            data,rate=sf.read(out/(name+'.wav'),always_2d=True)
            # Four actual decoded cycles, with three real loop crossings and no edit splices.
            if name in ['A','B']:
                data,rate=sf.read(out/(name+'.ogg'),always_2d=True)
                sf.write(out/(name+'-join-review.wav'),np.tile(data,(4,1)),rate,subtype='PCM_16')
    report.append(export('baseline',baseline(),out))
    (out/'measurements.json').write_text(json.dumps(report,indent=2)+'\n')
    (STUDY/'measurements.json').write_text(json.dumps(report,indent=2)+'\n')
    asset_dir=ROOT/'src/game/assets/music';asset_dir.mkdir(parents=True,exist_ok=True)
    manifest = ['// Generated from original project scores; exact four-bar lossless segments.',
                'export type MusicCue = "preparation" | "selling" | "results";',
                'export const MUSIC_TRACKS = {']
    segments = []
    for name, bpm, _seconds, loop in [('preparation',100,153.6,True),('selling',112,128*60/56,True),('results',100,4.8,False)]:
        data, rate = sf.read(out/(name+'.wav'),always_2d=True)
        part_frames = round(16*60/bpm*rate)
        urls=[]
        for index, start in enumerate(range(0,len(data),part_frames)):
            filename='music-'+name+'-v2-part'+str(index).zfill(2)+'.flac'
            sf.write(asset_dir/filename,data[start:start+part_frames],rate,format='FLAC',subtype='PCM_16')
            segments.append({'cue': name, 'file': filename, 'frames': len(data[start:start+part_frames]), 'rate': rate, 'bytes': (asset_dir/filename).stat().st_size, 'sha256': hashlib.sha256((asset_dir/filename).read_bytes()).hexdigest()})
            urls.append('new URL("../assets/music/'+filename+'", import.meta.url).href')
        manifest.append('    '+name+': { seconds: '+str(len(data)/rate)+', segmentSeconds: '+str(part_frames/rate)+', loop: '+str(loop).lower()+', segments: [')
        manifest.extend('        '+url+',' for url in urls)
        manifest.append('    ] },')
    manifest.append('} as const;')
    (ROOT/'src/game/presentation/music-tracks.ts').write_text('\n'.join(manifest)+'\n',encoding='utf8')
    (STUDY/'runtime-segments.json').write_text(json.dumps(segments,indent=2)+'\n')
    shutil.copyfile(STUDY/'audition.html',out/'index.html')
    print('Completed original ensemble studies; human musical acceptance remains open.')

if __name__=='__main__':main()
