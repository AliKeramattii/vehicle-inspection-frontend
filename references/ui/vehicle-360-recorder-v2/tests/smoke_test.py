import asyncio, json, os, shutil
from pathlib import Path
from playwright.async_api import async_playwright
BASE='http://127.0.0.1:5500/'
OUT=Path(__file__).resolve().parent/'browser-screenshots'
OUT.mkdir(parents=True,exist_ok=True)
async def main():
  async with async_playwright() as p:
    browser=await p.chromium.launch(headless=True,**({'executable_path': os.environ['PLAYWRIGHT_CHROMIUM_PATH']} if os.environ.get('PLAYWRIGHT_CHROMIUM_PATH') else {}),args=['--no-sandbox','--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream','--autoplay-policy=no-user-gesture-required'])
    context=await browser.new_context(viewport={'width':390,'height':844},device_scale_factor=2,permissions=['camera'])
    page=await context.new_page()
    problems=[]
    page.on('pageerror',lambda err:problems.append(str(err)))
    await page.goto(BASE,wait_until='networkidle')
    await page.screenshot(path=str(OUT/'recording-idle.png'),full_page=True)
    assert await page.locator('input[type=file]').count()==0
    assert await page.locator('#activateCamera').count()==1
    await page.click('#activateCamera')
    await page.locator('#startRecording').wait_for(timeout=15000)
    print('Camera ready',await page.locator('.status-title').inner_text())
    await page.click('#ghostToggle')
    assert 'false'==await page.locator('#ghostToggle').get_attribute('aria-pressed')
    await page.click('#ghostToggle')
    assert 'true'==await page.locator('#ghostToggle').get_attribute('aria-pressed')
    await page.click('#nextPerspective')
    assert 'راست' in await page.locator('.perspective-text strong').inner_text()
    await page.click('#startRecording')
    await page.locator('#stopRecording').wait_for()
    await page.wait_for_timeout(2300)
    progress1=int(await page.locator('.circular-progress').get_attribute('aria-valuenow'))
    assert progress1>0,progress1
    await page.screenshot(path=str(OUT/'recording-active.png'),full_page=True)
    if await page.locator('#pauseRecording').count():
      await page.click('#pauseRecording')
      await page.wait_for_timeout(300)
      elapsed1=await page.locator('.time-value').inner_text()
      await page.screenshot(path=str(OUT/'recording-paused.png'),full_page=True)
      await page.wait_for_timeout(1150)
      elapsed2=await page.locator('.time-value').inner_text()
      assert elapsed1==elapsed2,('pause timer advanced',elapsed1,elapsed2)
      await page.click('#resumeRecording')
      await page.wait_for_timeout(1200)
    await page.click('#stopRecording')
    await page.locator('#acceptRecording').wait_for(timeout=15000)
    await page.screenshot(path=str(OUT/'recording-review.png'),full_page=True)
    await page.click('#acceptRecording')
    await page.locator('.text-success').wait_for(timeout=15000)
    print('Saved status:',await page.locator('.status-title').inner_text())
    await page.screenshot(path=str(OUT/'recording-completed.png'),full_page=True)
    db_state=await page.evaluate('''async () => {
      const db = await new Promise((res,rej)=>{let r=indexedDB.open('vehicle-inspection-360-capture');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});
      return await new Promise((resolve,reject)=>{let r=db.transaction('recordings').objectStore('recordings').getAll();r.onsuccess=()=>resolve(r.result.map(x=>({id:x.id,size:x.blob.size,mime:x.mimeType,origin:x.origin})));r.onerror=()=>reject(r.error)});
    }''')
    print('DB:',json.dumps(db_state,ensure_ascii=False))
    assert len(db_state)==1 and db_state[0]['size']>0 and db_state[0]['origin']=='in-app-camera',db_state
    assert not problems,problems
    # responsive no document overflow
    for w,h in [(360,740),(414,896),(390,640)]:
      await page.set_viewport_size({'width':w,'height':h})
      box=await page.evaluate('''() => ({scrollW:document.documentElement.scrollWidth,clientW:document.documentElement.clientWidth,scrollH:document.documentElement.scrollHeight,clientH:document.documentElement.clientHeight})''')
      assert box['scrollW']<=box['clientW'] and box['scrollH']<=box['clientH'],(w,h,box)
    print('Responsive overflow checks passed. Paused progress frozen. Camera-only and IndexedDB tests passed.')
    await browser.close()
if __name__=='__main__':asyncio.run(main())
