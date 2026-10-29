"""Create fixed-size, loop-safe action animations from the existing key poses.
Development dependency: opencv-python-headless, numpy, Pillow.
The website only loads the generated WebP files; it needs no video runtime.
"""
from pathlib import Path
import cv2
import numpy as np
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
SOURCES={**{k:f'actor-{k}-v34.webp' for k in ['books','medical','retail','drawer','tools','vehicle','rubble','observe']},**{k:f'actor-{k}-v33.webp' for k in ['eat','drink','sleep','repair','sew','treat','garden','care','bike']},'read':'actor-read-v331.webp'}

def generate(kind,source):
    im=Image.open(ROOT/'assets'/source)
    frames=[]
    for i in range(im.n_frames):
        im.seek(i)
        rgba=im.convert('RGBA')
        # The source poses have different horizontal origins. Anchor the feet/props
        # before interpolation so the entire seated character does not slide.
        arr=np.array(rgba); mask=arr[:,:,3]>128
        yy0,xx0=np.where(mask & (np.arange(arr.shape[0])[:,None]>=int(arr.shape[0]*.65)))
        if len(xx0):
            cx=(np.quantile(xx0,.01)+np.quantile(xx0,.99))/2
            bottom=np.quantile(yy0,.995)
            affine=np.float32([[1,0,arr.shape[1]/2-cx],[0,1,arr.shape[0]-6-bottom]])
            arr=cv2.warpAffine(arr,affine,(arr.shape[1],arr.shape[0]),flags=cv2.INTER_LINEAR,borderMode=cv2.BORDER_CONSTANT,borderValue=(0,0,0,0))
            rgba=Image.fromarray(arr)
        bg=Image.new('RGBA',rgba.size,'#213027')
        bg.alpha_composite(rgba)
        frames.append(cv2.cvtColor(np.array(bg.convert('RGB')),cv2.COLOR_RGB2BGR))
    h,w=frames[0].shape[:2]
    xx,yy=np.meshgrid(np.arange(w,dtype=np.float32),np.arange(h,dtype=np.float32))
    grid=np.dstack([xx,yy])
    dis=cv2.DISOpticalFlow_create(cv2.DISOPTICAL_FLOW_PRESET_MEDIUM)
    dis.setFinestScale(0)
    result=[]
    steps=16 if kind=='sleep' else 12
    for i,a in enumerate(frames):
        b=frames[(i+1)%len(frames)] # interpolate the loop seam as well
        ga,gb=(cv2.cvtColor(f,cv2.COLOR_BGR2GRAY) for f in [a,b])
        f=dis.calc(ga,gb,None)
        r=dis.calc(gb,ga,None)
        for j in range(steps):
            t=j/steps
            t=t*t*(3-2*t) # continuous acceleration at the key poses
            ma,mb=grid.copy(),grid.copy()
            for _ in range(6):
                ma=grid-t*cv2.remap(f,ma[:,:,0],ma[:,:,1],cv2.INTER_LINEAR,borderMode=cv2.BORDER_REPLICATE)
                mb=grid-(1-t)*cv2.remap(r,mb[:,:,0],mb[:,:,1],cv2.INTER_LINEAR,borderMode=cv2.BORDER_REPLICATE)
            wa=cv2.remap(a,ma[:,:,0],ma[:,:,1],cv2.INTER_LINEAR,borderMode=cv2.BORDER_REPLICATE)
            wb=cv2.remap(b,mb[:,:,0],mb[:,:,1],cv2.INTER_LINEAR,borderMode=cv2.BORDER_REPLICATE)
            blend=np.uint8(np.clip((1-t)*wa+t*wb,0,255))
            result.append(Image.fromarray(cv2.cvtColor(blend,cv2.COLOR_BGR2RGB)))
    target=ROOT/'assets'/f'actor-{kind}-v350.webp'
    result[0].save(target,save_all=True,append_images=result[1:],duration=40,loop=0,quality=82,method=6,minimize_size=True)
    print(f'{target.name}: {len(result)} frames, {target.stat().st_size} bytes',flush=True)

if __name__=='__main__':
    for kind,source in SOURCES.items():generate(kind,source)
