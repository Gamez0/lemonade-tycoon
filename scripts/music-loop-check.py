"""Correlate recorded production MusicPlayer seam output against our decoded source."""
import json
from pathlib import Path
import numpy as np
import soundfile as sf
from scipy import signal
import imageio_ffmpeg
import subprocess
root=Path(__file__).resolve().parents[1];out=root/'.local-m4/music-segment-qa'
rows=json.loads((out/'capture.json').read_text());rate=44100
for row in rows:
    cue=row['cue'];name=cue+'-'+row['seam'];wav=out/(name+'.wav')
    subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(),'-hide_banner','-loglevel','error','-y','-i',str(out/(name+'.webm')),'-ar',str(rate),'-ac','2','-c:a','pcm_f32le',str(wav)],check=True)
    recorded,_=sf.read(wav,always_2d=True);recorded=recorded.mean(axis=1)
    source,_=sf.read(root/f'.local-m4/m7-audio/{cue}.wav',always_2d=True);source=source.mean(axis=1)
    def locate(start):
        target=source[round(start*rate):round((start+.6)*rate)]
        expected=(start-row['startTime'])%row['duration']
        lo=max(0,round((expected-.4)*rate));hi=min(len(recorded),round((expected+1)*rate))
        data=recorded[lo:hi]
        corr=signal.correlate(data,target,mode='valid',method='fft')
        cumulative=np.concatenate(([0.],np.cumsum(data**2)))
        energy=cumulative[len(target):]-cumulative[:-len(target)]
        normalized=corr/np.sqrt(np.maximum(energy*np.sum(target**2),1e-20))
        index=int(np.argmax(normalized))
        return (lo+index)/rate,float(normalized[index])
    tail_start=row['boundary']-1.5;head_start=(row['boundary']+.65)%row['duration']
    tail,tail_corr=locate(tail_start);head,head_corr=locate(head_start)
    row.update(tailCorrelation=tail_corr,headCorrelation=head_corr,loopTimingErrorMs=((head-tail)-((head_start-tail_start)%row['duration']))*1000)
    assert min(tail_corr,head_corr)>.9,(cue,'Capture correlation too low',row)
    assert abs(row['loopTimingErrorMs'])<30,(cue,'Loop gap/overlap exceeds30ms',row)
(out/'loop-check.json').write_text(json.dumps(rows,indent=2)+'\n')
print(json.dumps(rows,indent=2))
