/* Local non-deployed visual/performance review; outputs are deliberately ignored, never baselines. */
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import sharp from 'sharp';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const target = join(tmpdir(), 'vehicle-inspection-phase09', 'screenshots');
const origin = process.env.VEHICLE_PREVIEW_ORIGIN ?? 'http://localhost:3103';
const frames = [['front-right','front-45-right'],['front-left','front-45-left'],['rear-right','back-45-right'],['rear-left','back-45-left'],['front','front-plate'],['rear','rear-plate'],['side','control:right'],['top','car-roof']];
async function entry(page) {
  await page.goto(origin);
  await page.locator('main[data-overflow]').waitFor();
  await page.getByRole('textbox',{name:'کد معرفی / کد ارجاع'}).fill('A4K9P2');await page.getByRole('button',{name:'شروع بازدید'}).click();
  await page.getByRole('textbox',{name:'کد تأیید پنج‌رقمی'}).fill('12345');await page.getByRole('button',{name:'همه چیز آماده است'}).click();
  await page.getByRole('checkbox').check();await page.getByRole('button',{name:'تأیید و ادامه'}).click();await page.getByRole('button',{name:'تأیید این موقعیت'}).click();await page.getByRole('button',{name:'تأیید مشخصات و ادامه'}).click();
  await page.getByRole('progressbar').waitFor();await page.screenshot({path:`${target}/2d-overview.png`});
  await page.getByRole('link',{name:'پیش‌نمایش محلی مدل خودرو'}).click();
}
(async()=>{
  fs.mkdirSync(target,{recursive:true});
  const browser=await chromium.launch({args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  try {
    const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'}), errors=[];
    page.on('pageerror',error=>errors.push(error.message));page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
    await entry(page);const ready=()=>page.locator('.vehicle-3d-preview[data-ready=true]').waitFor({timeout:90000});await ready();
    await page.locator('.vehicle-preview-tools summary').click();await page.getByLabel('نمایش نقاط بازدید').uncheck();
    const metrics={};
    for(const tier of ['original','mobile','desktop']) {
      await page.locator('.photography-shot-card[data-requirement="front-45-left"]').click();
      await page.locator('.photography-shot-card[data-requirement="front-45-right"]').click();
      await page.locator('.vehicle-3d-preview[data-view="front-right"]').waitFor();
      await page.getByLabel('کیفیت مدل').selectOption(tier);await ready();
      metrics[tier]=JSON.parse(await page.getByTestId('vehicle-render-metrics').textContent());
      for(const [name,id] of frames) {
        if(id.startsWith('control:')) await page.getByRole('button',{name:'نمای خودرو: راست',exact:true}).click();
        else {
          // Clear a preset override by selecting a different requirement first, even if the
          // previous tier ended with the same requirement in an explicit side view.
          await page.locator(`.photography-shot-card[data-requirement="${id==='front-45-left'?'front-45-right':'front-45-left'}"]`).click();
          await page.locator(`.photography-shot-card[data-requirement="${id}"]`).click();
        }
        // Two animation frames let demand-rendered camera/material changes settle; no long recording.
        await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))));
        await page.locator('.vehicle-preview-display').screenshot({path:`${target}/${tier}-${name}.png`});
      }
    }
    for(const [name] of frames) {
      const files=['original','mobile','desktop'].map(tier=>`${target}/${tier}-${name}.png`), meta=await sharp(files[0]).metadata();
      const label=Buffer.from(`<svg width="${meta.width*3}" height="28"><rect width="100%" height="100%" fill="#f8fafc"/><text x="12" y="19" font-size="13">Original</text><text x="${meta.width+12}" y="19" font-size="13">Mobile candidate</text><text x="${meta.width*2+12}" y="19" font-size="13">Desktop candidate</text></svg>`);
      await sharp({create:{width:meta.width*3,height:meta.height+28,channels:4,background:'#f8fafc'}}).composite([{input:label,left:0,top:0},...files.map((input,i)=>({input,left:i*meta.width,top:28}))]).png().toFile(`${target}/comparison-${name}.png`);
    }
    await page.getByLabel('نمایش نقاط بازدید').check();await page.locator('.photography-shot-card[data-requirement="front-45-right"]').click();
    const session=await page.context().newCDPSession(page);
    await session.send('Network.enable');await session.send('Network.emulateNetworkConditions',{offline:false,latency:120,downloadThroughput:500000,uploadThroughput:125000});await session.send('Emulation.setCPUThrottlingRate',{rate:4});
    await page.getByLabel('کیفیت مدل').selectOption('mobile');await ready();
    metrics.throttledMobile={...JSON.parse(await page.getByTestId('vehicle-render-metrics').textContent()),network:'500000 bytes/s, 120ms latency',cpuRate:4};
    await session.send('Network.emulateNetworkConditions',{offline:false,latency:0,downloadThroughput:-1,uploadThroughput:-1});await session.send('Emulation.setCPUThrottlingRate',{rate:1});
    await session.detach();
    metrics.errors=errors;fs.writeFileSync(`${target}/browser-metrics.json`,JSON.stringify(metrics,null,2));console.log(JSON.stringify(metrics,null,2));
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
