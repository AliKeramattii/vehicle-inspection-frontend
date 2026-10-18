export function GhostVisibilityToggle(visible){
 return `<button id="ghostToggle" type="button" class="stage-pill ghost-visibility" aria-pressed="${visible}" aria-label="${visible ? 'پنهان‌کردن' : 'نمایش'} راهنمای شفاف">
 <img src="./assets/360-recording/icons/ghost-${visible ? 'visible' : 'hidden'}.svg" alt="" />
 <span>${visible ? 'راهنما روشن' : 'راهنما خاموش'}</span></button>`;
}
