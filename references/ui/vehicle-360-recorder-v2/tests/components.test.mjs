import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {formatTime} from '../src/components/RecordingTimer.js';
import {CircularRecordingProgress} from '../src/components/CircularRecordingProgress.js';
import {PERSPECTIVES,GhostVehicleOverlay} from '../src/components/GhostVehicleOverlay.js';
import {GhostVisibilityToggle} from '../src/components/GhostVisibilityToggle.js';
import {RecordingControls} from '../src/components/RecordingControls.js';
import {RecorderController} from '../src/recorder-controller.js';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
test('Persian timer uses whole seconds',()=>{
 assert.equal(formatTime(0),'۰۰:۰۰');
 assert.equal(formatTime(59999),'۰۰:۵۹');
 assert.equal(formatTime(60000),'۰۱:۰۰');
});
test('ring clamps time progress at 100 and does not fake verified coverage',()=>{
 const x=CircularRecordingProgress({elapsedMs:25000,targetMs:60000,status:'recording'});
 assert.match(x,/aria-valuenow="42"/);
 const y=CircularRecordingProgress({elapsedMs:80000,targetMs:60000,status:'recording'});
 assert.match(y,/aria-valuenow="100"/);
 assert.match(y,/پیشرفت زمان ضبط/);
 assert.doesNotMatch(y,/تأیید پوشش/);
});
test('paused clock excludes paused time',async()=>{
 const ctrl=new RecorderController();
 ctrl.state='paused';ctrl.durationActiveMs=2500;ctrl.lastActiveStart=1;
 const a=ctrl.elapsedMs;
 await new Promise(r=>setTimeout(r,20));
 assert.equal(ctrl.elapsedMs,a);
 ctrl.dispose();
});
test('eight genuine separate transparent WebP guide images exist in exact requested order',()=>{
 const expected=['front','front-45-right','right','rear-45-left','rear','rear-45-right','left','front-45-left'];
 assert.deepEqual(PERSPECTIVES.map(p=>p.id),expected);
 assert.equal(new Set(PERSPECTIVES.map(p=>p.id)).size,8);
 for(const p of PERSPECTIVES){
  const filename=path.join(root,'assets','360-recording','ghost-guides',`ghost-${p.id}.webp`);
  const bytes=fs.readFileSync(filename);
  assert.equal(bytes.toString('ascii',0,4),'RIFF');
  assert.equal(bytes.toString('ascii',8,12),'WEBP');
  assert.ok(bytes.length>5000,'Ghost should be a real image not an empty placeholder');
  assert.match(GhostVehicleOverlay({visible:true,perspective:p.id}),new RegExp(`ghost-${p.id}\\.webp`));
 }
 assert.equal(fs.readdirSync(path.join(root,'assets','360-recording','ghost-guides')).filter(n=>n.endsWith('.webp')).length,8);
 assert.equal(fs.readdirSync(path.join(root,'assets','360-recording','ghost-guides')).filter(n=>n.endsWith('.svg')).length,0);
 assert.match(GhostVehicleOverlay({visible:false,perspective:'left'}),/ghost-is-hidden/);
 assert.match(GhostVisibilityToggle(true),/aria-pressed="true"/);
});
test('only in-app camera capture actions and no file picker exist',()=>{
 const controls=RecordingControls({status:'ready',canPause:true,canSwitch:true});
 assert.match(controls,/startRecording/);
 assert.doesNotMatch(controls,/upload|type="file"|filePicker|gallery/i);
 const srcs=[path.join(root,'index.html'),...fs.readdirSync(path.join(root,'src')).filter(x=>x.endsWith('.js')).map(x=>path.join(root,'src',x))];
 for(const s of srcs){
  const src=fs.readFileSync(s,'utf8');
  assert.doesNotMatch(src,/<input\s+type=['"]?file|showOpenFilePicker\s*\(|<input\s+[^>]*accept=['"]video/i);
 }
});
test('completed evidence remains time-derived, not automatically 100%',()=>{
 const a=CircularRecordingProgress({elapsedMs:30000,targetMs:60000,status:'completed'});
 assert.match(a,/aria-valuenow="50"/);
});
