from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
root=Path(__file__).resolve().parents[1]
labels=[('front','جلو'),('front-45-right','جلو ۴۵ درجه راست'),('right','راست'),('rear-45-left','عقب ۴۵ درجه چپ'),('rear','عقب'),('rear-45-right','عقب ۴۵ درجه راست'),('left','چپ'),('front-45-left','جلو ۴۵ درجه چپ')]
w,h=1000,1140
im=Image.new('RGB',(w,h),'#F4F7FC');d=ImageDraw.Draw(im)
f=ImageFont.truetype('/usr/share/fonts/truetype/noto/NotoSansArabic-Regular.ttf',22)
for j,(slug,name) in enumerate(labels):
 x=18+(j%2)*490;y=18+(j//2)*278
 d.rounded_rectangle((x,y,x+473,y+263),radius=18,fill='#142235')
 car=Image.open(root/'assets/360-recording/ghost-guides'/('ghost-'+slug+'.webp')).convert('RGBA')
 car.thumbnail((440,203))
 im.paste(car,(x+(473-car.width)//2,y+(206-car.height)//2),car)
 d.text((x+450,y+226),name,font=f,fill='white',anchor='rt',direction='rtl')
im.save(root/'mockups/ghost-guides-preview.png')
print('Eight WebP guide preview generated')
