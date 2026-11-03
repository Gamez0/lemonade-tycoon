"""Original A/B ensemble studies. Beats are musical time, never game ticks."""
CHORDS = {
 "C6": (36, [52,55,57,60]), "Am9": (33,[48,52,55,59]),
 "Dm9": (38,[53,57,60,64]), "G13": (31,[53,59,64,69]),
 "Em7": (40,[55,59,62,64]), "A7": (33,[55,61,64,67]),
 "Fmaj7": (29,[52,57,60,64]), "Fm6": (29,[53,56,60,62]),
 "G7": (31,[53,55,59,62]),
}
A = ["C6","Am9","Dm9","G13","Em7","A7","Dm9","G7"]
BRIDGE = ["Fmaj7","Fm6","Em7","A7","Dm9","G13","C6","G7"]
MELODIES = [
 [(0,64,.65),(1,67,.4),(1.66,69,.65),(3,67,.65)],
 [(.66,64,.6),(2,62,.4),(2.66,60,.9)],
 [(0,65,.7),(1.66,69,.5),(2.66,72,.7)],
 [(.66,71,.6),(2,69,.4),(2.66,67,.7)],
 [(0,67,.4),(.66,71,.6),(2,74,.7)],
 [(1,73,.4),(1.66,76,.6),(3,67,.5)],
 [(0,65,.65),(1.66,64,.5),(2.66,62,.9)],
 [(.66,62,.5),(2,59,.45),(3,62,.4)],
]
BRIDGE_MELODIES = [
 [(0,69,.8),(1.66,72,.65),(3,76,.55)],
 [(.66,75,.8),(2,72,.6),(3,68,.6)],
 [(0,71,.65),(1.66,67,.7)],
 [(.66,73,.6),(2,76,.5),(3,79,.45)],
 [(0,77,.65),(1.66,76,.7)],
 [(.66,74,.8),(2,71,.45),(3,69,.5)],
 [(0,67,.7),(1.66,64,.7),(3,60,.6)],
 [(.66,62,.6),(2,59,.8)],
]

def make_score(direction, bars=32):
    bossa = direction == "B"
    bpm = 112 if bossa else 100
    events = []
    def add(part,beat,note,duration,velocity):
        events.append(dict(part=part,beat=round(beat,4),note=note,duration=duration,velocity=velocity))
    progression = (A + A + BRIDGE + A) * (bars // 32)
    if bars == 64:
        progression[33] = "Fmaj7"
        progression[41] = "Fmaj7"
    for bar,name in enumerate(progression):
        root,voicing=CHORDS[name]; beat=bar*4
        section=(bar//8)%4
        cycle=bar//32
        # Shared small-ensemble harmony; inversions keep moving voices close.
        comp = ([0,1.5,2.5] if cycle else [0,1.5,3]) if bossa else ([0,2.66] if cycle else [.66,2.66])
        for pulse in comp:
            for index,note in enumerate(voicing):
                add("guitar" if bossa else "piano",beat+pulse+index*.018,note,.54 if bossa else .75,47+index*2)
        # Open room for melody: no nonstop lead and no four-bar audio copy.
        melody = BRIDGE_MELODIES[bar%8] if section==2 else MELODIES[bar%8]
        for index,(offset,note,duration) in enumerate(melody):
            if cycle and index==1 and bar%2==1: continue
            if bossa: offset=round(offset*2)/2
            if section==1 and index==0: note += 12 if bar%4==0 else 0
            if section==3 and index==len(melody)-1: duration += .15
            add("vibes" if bossa else "lead",beat+offset,note,duration,70+(bar%3)*3)
        # Low piano voice, with a quiet approach into the next harmonic root.
        bass_notes = [(0,root),(2,root+7)]
        if section in [1,2] and bar%2==1:
            next_root=CHORDS[progression[(bar+1)%bars]][0]
            bass_notes.append((3.5,next_root-1))
        for offset,note in bass_notes: add("bass",beat+offset,note,.8,64)
        # Acoustic cross-stick and shaker: leave effects room above the bed.
        for offset in [0,2]: add("kick",beat+offset,36,.35,43 if bossa else 37)
        for offset in ([1,2.5] if bossa else [1,3]): add("rim",beat+offset,37,.25,40)
        for index in range(8):
            if cycle and section==0 and index%2: continue
            offset=index*.5 if bossa else index//2+(2/3 if index%2 else 0)
            add("shaker" if bossa else "hat",beat+offset,82 if bossa else 42,.14,23 if index%2 else 30)
        # Replies only in sparse phrase endings, not another constant lead.
        if section in [1,3] and bar%4==3:
            for offset,note in [(2.5,67),(3.25,64)]: add("guitar",beat+offset,note,.35,39)
    return dict(id=direction,title="Porch Ensemble" if not bossa else "Sunny Counter",bpm=bpm,bars=bars,
                form=["A","A variation","bridge","A return"] * (bars//32),events=events,loop=True)


def results_score():
    events=[]
    for beat,notes in [(0,[48,52,55,60]),(2,[50,53,57,62]),(3,[43,53,59,62]),(4,[48,52,55,60,64])]:
        for index,note in enumerate(notes):events.append(dict(part="piano",beat=beat+index*.03,note=note,duration=1.3,velocity=59))
    for beat,note in [(0,67),(1,69),(2,65),(3,62),(4,64),(4.5,60)]:
        events.append(dict(part="vibes",beat=beat,note=note,duration=1.1,velocity=64))
    return dict(id="results",title="Evening Tally",bpm=100,bars=2,events=events,loop=False)
