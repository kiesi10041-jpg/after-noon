"""Pack decoded motion frames into one static texture for display-synced playback."""
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
for p in sorted((ROOT/'assets').glob('actor-*-v350.webp')):
    kind=p.name.removeprefix('actor-').removesuffix('-v350.webp')
    im=Image.open(p);frames=[]
    for i in range(im.n_frames):
        im.seek(i);im.load()
        for _ in range(im.info['duration']//40):frames.append(im.convert('RGB').resize((192,192),Image.Resampling.LANCZOS))
    expected=64 if kind=='sleep' else 48
    assert len(frames)==expected,(kind,len(frames))
    atlas=Image.new('RGB',(8*192,((len(frames)+7)//8)*192),'#213027')
    for i,f in enumerate(frames):atlas.paste(f,((i%8)*192,(i//8)*192))
    target=p.with_name('actor-'+kind+'-atlas-v351.webp');atlas.save(target,quality=85,method=6)
    print(target.name,target.stat().st_size,flush=True)
