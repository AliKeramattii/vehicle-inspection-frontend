const act = (id,label,cls,icon) => `<button type="button" id="${id}" class="${cls}">${icon ? `<img src="./assets/360-recording/icons/${icon}.svg" alt="" />` : ''}<span>${label}</span></button>`;
export function RecordingControls({status, canPause, canSwitch, disabled}) {
  switch(status){
    case 'locked': return '<div class="locked-message">این بخش پس از ثبت نهایی قابل ویرایش نیست.</div>';
    case 'idle':
    case 'error':
    case 'unsupported': return `<div class="control-bar">${act('activateCamera','فعال‌سازی دوربین','primary-button','recording')}</div>`;
    case 'starting': return `<div class="control-bar">${act('working','در حال اتصال به دوربین…','primary-button is-loading')}</div>`;
    case 'ready': return `<div class="control-bar">${act('startRecording','شروع ضبط ویدیو','primary-button','recording')}${canSwitch ? act('switchCamera','تعویض دوربین','secondary-button','camera-switch') : ''}</div>`;
    case 'recording': return `<div class="control-bar control-bar--recording">${canPause ? act('pauseRecording','مکث','secondary-button','recording-pause') : ''}${act('stopRecording','پایان ضبط','danger-button','recording-stop')}</div>`;
    case 'paused': return `<div class="control-bar control-bar--recording">${canPause ? act('resumeRecording','ادامه ضبط','primary-button','recording') : ''}${act('stopRecording','پایان ضبط','danger-button','recording-stop')}</div>`;
    case 'stopping': case 'saving': return `<div class="control-bar">${act('working','در حال پردازش…','primary-button is-loading')}</div>`;
    case 'review': return `<div class="control-bar">${act('acceptRecording','تأیید و ذخیره','primary-button','check')}${act('retakeRecording','ضبط دوباره','secondary-button','camera-switch')}</div>`;
    case 'completed': return `<div class="control-bar">${disabled ? '' : act('retakeRecording','ضبط ویدیوی جدید','secondary-button','camera-switch')}</div>`;
    default: return '';
  }
}
