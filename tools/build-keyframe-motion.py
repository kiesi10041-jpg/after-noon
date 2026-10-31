"""Build motion atlases from sixteen individually authored chronological key poses."""
from pathlib import Path
import json,sys
import cv2,numpy as np
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]; SOURCES=ROOT/'motion-sources/v036'; OUT=ROOT/'assets'; BG=(33,48,39); CELL=192; SIZE=256; STEPS=6

def extract(path):
    board=Image.open(path).convert('RGB');frames=[];masks=[]
    for i in range(16):
        x=i%4;y=i//4;f=board.crop((round(x*board.width/4),round(y*board.height/4),round((x+1)*board.width/4),round((y+1)*board.height/4))).resize((SIZE,SIZE),Image.Resampling.LANCZOS)
        rgb=np.array(f);hsv=cv2.cvtColor(rgb,cv2.COLOR_RGB2HSV)
        candidate=((hsv[:,:,0]>=45)&(hsv[:,:,0]<=98)&(hsv[:,:,1]>35)&(hsv[:,:,2]<115)).astype(np.uint8)
        _,labels=cv2.connectedComponents(candidate,connectivity=8)
        ids=np.unique(np.concatenate([labels[0],labels[-1],labels[:,0],labels[:,-1]]));ids=ids[ids!=0]
        mask=(~np.isin(labels,ids)).astype(np.uint8);mask[:2]=mask[-2:]=0;mask[:,:2]=mask[:,-2:]=0
        frames.append(rgb);masks.append(mask)
    anchors=[]
    for mask in masks:
        yy,xx=np.where((mask>0)&(np.arange(SIZE)[:,None]>SIZE*.76));anchors.append(((np.quantile(xx,.03)+np.quantile(xx,.97))/2,np.quantile(yy,.995)))
    target=np.median(anchors,axis=0);fixed=[]
    for rgb,mask,(x,y) in zip(frames,masks,anchors):
        m=np.float32([[1,0,np.clip(target[0]-x,-12,12)],[0,1,np.clip(target[1]-y,-12,12)]])
        a=cv2.GaussianBlur(mask.astype(np.float32),(3,3),.45)
        rgb=rgb*a[:,:,None]+np.array(BG)*(1-a[:,:,None]);rgb=cv2.warpAffine(rgb.astype(np.uint8),m,(SIZE,SIZE),flags=cv2.INTER_LINEAR,borderMode=cv2.BORDER_CONSTANT,borderValue=BG)
        fixed.append(cv2.cvtColor(rgb,cv2.COLOR_RGB2BGR))
    return fixed

def build(path):
    kind=path.stem;frames=extract(path);h,w=frames[0].shape[:2];xx,yy=np.meshgrid(np.arange(w,dtype=np.float32),np.arange(h,dtype=np.float32));grid=np.dstack([xx,yy]);dis=cv2.DISOpticalFlow_create(cv2.DISOPTICAL_FLOW_PRESET_MEDIUM);dis.setFinestScale(0);result=[]
    for i,a in enumerate(frames):
        b=frames[(i+1)%16] if i<15 or kind in ['sleep','rest','observe','read','bike'] else frames[-1];ga=cv2.cvtColor(a,cv2.COLOR_BGR2GRAY);gb=cv2.cvtColor(b,cv2.COLOR_BGR2GRAY);forward=dis.calc(ga,gb,None);back=dis.calc(gb,ga,None)
        for j in range(STEPS):
            t=j/STEPS;ma=grid.copy();mb=grid.copy()
            for _ in range(4):
                ma=grid-t*cv2.remap(forward,ma[:,:,0],ma[:,:,1],cv2.INTER_LINEAR,borderMode=cv2.BORDER_REPLICATE)
                mb=grid-(1-t)*cv2.remap(back,mb[:,:,0],mb[:,:,1],cv2.INTER_LINEAR,borderMode=cv2.BORDER_REPLICATE)
            wa=cv2.remap(a,ma[:,:,0],ma[:,:,1],cv2.INTER_LINEAR,borderMode=cv2.BORDER_REPLICATE);wb=cv2.remap(b,mb[:,:,0],mb[:,:,1],cv2.INTER_LINEAR,borderMode=cv2.BORDER_REPLICATE)
            f=Image.fromarray(cv2.cvtColor(np.uint8(np.clip((1-t)*wa+t*wb,0,255)),cv2.COLOR_BGR2RGB)).resize((CELL,CELL),Image.Resampling.LANCZOS);result.append(f)
    atlas=Image.new('RGB',(8*CELL,12*CELL),BG)
    for i,f in enumerate(result):atlas.paste(f,((i%8)*CELL,(i//8)*CELL))
    p=OUT/f'actor-{kind}-atlas-v360.webp';temporary=p.with_suffix('.tmp.webp');atlas.save(temporary,quality=85,method=6);temporary.replace(p)
    # Preserve the authored source at high quality outside the deployable assets directory.
    source=SOURCES/(kind+'.webp');temporary=source.with_suffix('.tmp.webp');Image.open(path).convert('RGB').save(temporary,quality=95,method=6);temporary.replace(source)
    meta={'kind':kind,'keyframes':16,'frames':96,'cell':CELL,'columns':8,'frameMs':40,'cycleMs':3840,'loop':kind in ['sleep','rest','observe','read','bike'],'source':f'motion-sources/v036/{kind}.webp','atlas':str(p.relative_to(ROOT))}
    (SOURCES/(kind+'.json')).write_text(json.dumps(meta,ensure_ascii=False)+'\n')
    print(kind,'16 authored poses -> 96 playback frames',p.stat().st_size,flush=True)

if __name__=='__main__':
    chosen=sys.argv[1:]
    for p in sorted(SOURCES.glob('*.png')):
        if not chosen or p.stem in chosen:build(p)
