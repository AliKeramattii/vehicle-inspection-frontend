import { Box3, PerspectiveCamera, Vector3 } from "three";

export function boundsCorners(box: Box3): Vector3[] {
  return [box.min.x,box.max.x].flatMap(x=>[box.min.y,box.max.y].flatMap(y=>[box.min.z,box.max.z].map(z=>new Vector3(x,y,z))));
}
/** Preserve the silhouette during orbit/zoom; constrained to the existing maximum distance.
 * Uses real model bounds, not an arbitrary unit cube or RTL-dependent orientation. */
export function keepVehicleInFrame(camera: PerspectiveCamera, corners: readonly Vector3[], target: Vector3, maxDistance: number) {
  const projected=new Vector3(), direction=new Vector3();let changed=false;
  for(let pass=0;pass<12;pass++) {
    camera.updateMatrixWorld();
    let overflow=0;
    for(const corner of corners) {projected.copy(corner).project(camera);overflow=Math.max(overflow,Math.abs(projected.x),Math.abs(projected.y));}
    if(overflow<=.94)break;
    direction.copy(camera.position).sub(target);const distance=direction.length(), next=Math.min(maxDistance,distance*Math.min(1.15,overflow/.9));
    if(next<=distance+.001)break;
    camera.position.copy(target).add(direction.multiplyScalar(next/distance));changed=true;
  }
  return changed;
}
