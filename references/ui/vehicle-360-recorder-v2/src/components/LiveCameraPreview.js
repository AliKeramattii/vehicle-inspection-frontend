/** Live HTMLVideoElement is attached once and srcObject assigned only to MediaStream. */
export function LiveCameraPreview() {
  const wrapper = document.createElement('div');
  wrapper.className = 'live-preview';
  const video = document.createElement('video');
  video.id = 'cameraPreview';
  video.setAttribute('autoplay', '');
  video.setAttribute('playsinline','');
  video.muted = true;
  wrapper.append(video);
  return {wrapper, video};
}
