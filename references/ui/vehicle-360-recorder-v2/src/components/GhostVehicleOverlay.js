const root = './assets/360-recording/ghost-guides/';
// Angles are from the vehicle's point of view. Ordering follows the user's exact eight-item list.
export const PERSPECTIVES = Object.freeze([
  {id:'front', title:'جلو', short:'جلو'},
  {id:'front-45-right', title:'جلو ۴۵ درجه راست', short:'جلو ۴۵° راست'},
  {id:'right', title:'راست', short:'راست'},
  {id:'rear-45-left', title:'عقب ۴۵ درجه چپ', short:'عقب ۴۵° چپ'},
  {id:'rear', title:'عقب', short:'عقب'},
  {id:'rear-45-right', title:'عقب ۴۵ درجه راست', short:'عقب ۴۵° راست'},
  {id:'left', title:'چپ', short:'چپ'},
  {id:'front-45-left', title:'جلو ۴۵ درجه چپ', short:'جلو ۴۵° چپ'}
]);
export function GhostVehicleOverlay({ visible, perspective, recording }) {
  const selected = PERSPECTIVES.find(p=>p.id===perspective) || PERSPECTIVES[0];
  return `<div class="ghost-layer ${visible ? '' : 'ghost-is-hidden'}" aria-hidden="true">
    <div class="viewfinder-corners"><i></i><i></i><i></i><i></i></div>
    <img class="vehicle-ghost" src="${root}ghost-${selected.id}.webp" alt="" draggable="false" decoding="async" />
    <div class="ground-guide"></div>
  </div>`;
}
