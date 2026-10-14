from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import io,math
base=Path(__file__).resolve().parents[1]
ref=Image.open(base/'mockups/concept-journey.png').convert('RGB')
# This is illustration-only artwork from the generated image. It is NEVER used by the live camera.
photoref=ref.crop((38,190,246,348))
size=(390,844)
S=2
FONTS='/usr/share/fonts/truetype/noto/'
def f(sz,bold=False):return ImageFont.truetype(FONTS+('NotoSansArabic-Bold.ttf' if bold else 'NotoSansArabic-Regular.ttf'),int(sz*S))
def rect(d,box,fill,r=0,outline=None,w=1):
 x1,y1,x2,y2=box; bb=(int(x1*S),int(y1*S),int(x2*S),int(y2*S));d.rounded_rectangle(bb,radius=int(r*S),fill=fill,outline=outline,width=int(w*S))
def text(d,xy,t,sz=12,col='#12233B',bold=False,anchor='ra'):
 d.text((int(xy[0]*S),int(xy[1]*S)),t,font=f(sz,bold),fill=col,direction='rtl',anchor=anchor)
def line(d,points,fill,width=1):d.line([(int(x*S),int(y*S)) for x,y in points],fill=fill,width=int(width*S))
def circ(d,cx,cy,r,fill=None,outline=None,w=1):d.ellipse(((cx-r)*S,(cy-r)*S,(cx+r)*S,(cy+r)*S),fill=fill,outline=outline,width=int(w*S))
def mockup(name,elapsed,ring_pct,status,alert=False,complete=False,paused=False):
 im=Image.new('RGB',(size[0]*S,size[1]*S),'#ffffff');d=ImageDraw.Draw(im)
 rect(d,(0,0,390,66),'#FFFFFF');line(d,[(14,65),(376,65)],'#EAEFF6')
 rect(d,(332,12,374,54),'#F4F7FB',12);line(d,[(346,25),(360,39)],'#29425F',2);line(d,[(360,25),(346,39)],'#29425F',2)
 rect(d,(15,12,57,54),'#F4F7FB',12);text(d,(36,24),'؟',15,'#223A57',True,'ma')
 text(d,(195,17),'بازدید خودرو',9,'#7888A1',False,'ma')
 text(d,(195,31),'ویدیوی ۳۶۰ درجه',16,'#132741',True,'ma')
 text(d,(373,81),'ـ  ثبت تصویر بدنه خودرو',10,'#2563EB',True)
 text(d,(373,101),'یک دور کامل اطراف خودرو حرکت کنید',17,'#152842',True)
 text(d,(373,129),'خودرو را در محدوده راهنما نگه دارید.',11,'#74849A')
 sx,sy,ex,ey=14,156,376,551
 rect(d,(sx,sy,ex,ey),'#0E1C2F',20)
 # image/photo is a visual mockup example ONLY
 photo=photoref.resize((362*S,260*S),Image.Resampling.LANCZOS)
 im.paste(photo,(14*S,216*S)); d=ImageDraw.Draw(im)
 # darkening overlay top and bottom without blurring actual SVG guide
 rect(d,(14,156,376,220),'#15263B',20)
 # ghost separate vector layer, as it is in code
 ghost=Image.open(base/'assets/360-recording/ghost-guides/ghost-front.webp').convert('RGBA')
 ghost=ghost.resize((300*S,173*S),Image.Resampling.LANCZOS)
 ghost.putalpha(ghost.getchannel('A').point(lambda a:int(a*.29)))
 im.paste(ghost,(44*S,253*S),ghost);d=ImageDraw.Draw(im)
 # stage top overlay
 rect(d,(24,170,145,199),'#0F233B',15)
 circ(d,133,184,3.7, '#EF4444' if status=='در حال ضبط' else '#F59E0B' if paused else '#9DB1C8')
 text(d,(122,173),status,10,'#F9FBFF',True)
 rect(d,(248,170,363,199),'#0F233B',15)
 text(d,(352,174),'راهنما روشن',10,'#F3F7FC',True);circ(d,261,184,6,outline='#E6F2FF',w=1)
 # frame corners
 for xx,xxs in [(35,1),(356,-1)]:
  for yy,yys in [(233,1),(474,-1)]:
   line(d,[(xx,yy+20*yys),(xx,yy),(xx+19*xxs,yy)],'#EAF3FF',2)
 # bottom stage pill
 rect(d,(59,493,331,536),'#0E1D32',14)
 text(d,(195,495),'زاویه راهنمای فعلی   ۱ / ۸',9,'#AFC8E9',False,'ma')
 text(d,(195,513),'نمای جلو',11,'#FFFFFF',True,'ma')
 # ring
 ringcolor='#EF4444' if alert else '#10B981' if complete else '#2563EB'
 cx,cy,r=75,612,40
 circ(d,cx,cy,r,outline='#E9EFF6',w=9)
 if ring_pct>0:
  d.arc([(cx-r)*S,(cy-r)*S,(cx+r)*S,(cy+r)*S],-90,-90+max(1,ring_pct*3.6),fill=ringcolor,width=9*S)
 text(d,(cx,585),elapsed,19,'#142640',True,'ma')
 text(d,(cx,615),'از ۰۱:۰۰',9,'#8393A8',False,'ma')
 label= 'ویدیو ذخیره شد' if complete else 'خطا در ضبط ویدیو' if alert else 'زمان پیشنهادی تکمیل شد' if ring_pct>=100 else 'ضبط موقتاً متوقف است' if paused else 'در حال ضبط ویدیو' if ring_pct>0 else 'آماده شروع'
 text(d,(370,573),label,13,'#059669' if complete else '#DC2626' if alert else '#1E2F48',True)
 text(d,(370,603),'پیشرفت زمانی ضبط',10,'#7B8A9F')
 text(d,(370,629),'تأیید پوشش کامل خودرو انجام نشده است.',9,'#8291A5')
 rect(d,(14,673,376,762),'#F5F8FD',14,outline='#E6EDF6')
 text(d,(365,680),'نکات تصویربرداری',11,'#264369',True);circ(d,225,690,5,'#2563EB')
 text(d,(365,708),'حرکت آهسته، نور کافی و فاصله ثابت با خودرو',10,'#6C7F98')
 for j,(ch,b) in enumerate([('نور مناسب',365),('تصویر ثابت',265),('حرکت آهسته',165)]):
  rect(d,(b-86,737,b,757),'#E9F0FB',10)
  text(d,(b-8,738),ch,8,'#647C9F',True)
 if status=='در حال ضبط':
  rect(d,(14,778,187,830),'#F2F6FC',15);text(d,(101,789),'مکث ضبط',12,'#143254',True,'ma')
  rect(d,(197,778,376,830),'#FDEBEC',15);text(d,(286,789),'پایان ضبط',12,'#D33336',True,'ma')
 elif paused:
  rect(d,(14,778,187,830),'#2563EB',15);text(d,(101,789),'ادامه ضبط',12,'#FFFFFF',True,'ma')
  rect(d,(197,778,376,830),'#FDEBEC',15);text(d,(286,789),'پایان ضبط',12,'#D33336',True,'ma')
 elif complete:
  rect(d,(14,778,376,830),'#2563EB',15);text(d,(195,789),'ثبت ویدیو انجام شد',12,'#FFFFFF',True,'ma')
 elif alert:
  rect(d,(14,778,376,830),'#2563EB',15);text(d,(195,789),'تلاش دوباره',12,'#FFFFFF',True,'ma')
 else:
  rect(d,(14,778,376,830),'#2563EB',15);text(d,(195,789),'شروع ضبط ویدیو',12,'#FFFFFF',True,'ma')
 path=base/'mockups'/name;im.save(path)
 return im
states=[
 ('recording-idle.png','۰۰:۰۰',0,'آماده شروع'),
 ('recording-active.png','۰۰:۲۴',40,'در حال ضبط'),
 ('recording-paused.png','۰۰:۲۴',40,'مکث',False,False,True),
 ('recording-target-reached.png','۰۱:۰۰',100,'در حال ضبط'),
 ('recording-completed.png','۰۱:۰۸',100,'تکمیل شد',False,True),
 ('recording-failed.png','۰۰:۱۲',20,'خطا',True)
]
images=[mockup(*args) for args in states]
# six-state board, all Persian. smaller than full size mobile, each tile 390x844 native.
board=Image.new('RGB',(390*6*S+28*S,844*S+105*S),'#EDF3FC')
d=ImageDraw.Draw(board)
headings=['شروع','در حال ضبط','مکث','هدف زمانی تکمیل','ضبط تکمیل‌شده','خطای ضبط']
for i,(pic,h) in enumerate(zip(images,headings)):
 x=(14+i*390)*S;board.paste(pic,(x,64*S));text(d,((14+i*390+366),15),f'{i+1}. {h}',17,'#152F56',True)
board.save(base/'mockups'/'persian-state-board.png')
print('Created Persian RTL mockups:',len(images),'plus contact sheet')
