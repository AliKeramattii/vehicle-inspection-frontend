// Local tooling only. Requires the user's installed glTF Transform 4.x/meshoptimizer.
// Never writes to public/ or replaces the original; output and render comparisons stay ignored.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { weldPrimitive, simplifyPrimitive, transformPrimitive, joinPrimitives, prune, dedup } from '@gltf-transform/functions';
import { MeshoptSimplifier } from 'meshoptimizer';
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';

const source = 'references/assets/3d/source/kia_sportage_gt_line_2023.glb';
const output = '.agent/vehicle-3d';
await mkdir(output, { recursive:true });
await MeshoptSimplifier.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);

function semantic(path, center) {
  if (/19inch|Wheels_/i.test(path)) return `Wheel_${center[2]<0?'F':'R'}${center[0]<0?'L':'R'}`;
  const door = path.match(/Door_(FL|FR|RL|RR)/i); if (door) return `Door_${door[1].toUpperCase()}`;
  if (/wingmirror/i.test(path)) return 'Mirrors';
  if (/frontlight/i.test(path)) return 'Lights_Front';
  if (/rearlight/i.test(path)) return 'Lights_Rear';
  if (/frontbumper|lowergrill|frontgrill/i.test(path)) return 'Bumper_Front';
  if (/rearbumper/i.test(path)) return 'Bumper_Rear';
  if (/carpaint__front/i.test(path)) return 'Hood_Surface';
  if (/roof/i.test(path)) return 'Roof';
  if (/window|glass/i.test(path)) return 'Glass';
  if (/dash|display/i.test(path)) return 'Interior_Dashboard';
  if (/steeringwheel/i.test(path)) return 'Interior_Steering';
  if (/seats/i.test(path)) return 'Interior_Seats';
  if (/(?:^|\/)(?:Int_|Intt_)/i.test(path)) return 'Interior_Other';
  if (/carpaint/i.test(path)) return 'Body_Main';
  return 'Trim';
}
for (const tier of ['mobile','desktop']) {
  const doc = await io.read(source), root = doc.getRoot(), scene = root.getDefaultScene() ?? root.listScenes()[0];
  const sources = [], buckets = new Map(), decisions = [];
  for (const node of root.listNodes()) if (node.getMesh()) {
    let parent=node; const names=[]; while(parent){names.unshift(parent.getName());parent=parent.getParentNode();}
    sources.push({node,path:names.join('/'),matrix:node.getWorldMatrix()});
  }
  for (const {node,path,matrix} of sources) {
    const interior=/(?:^|\/)(?:Int_|Intt_)/i.test(path), painted=/carpaint/i.test(path), protectedPart=/frontlight|rearlight|grill|window|glass/i.test(path), wheel=/19inch|Wheels_/i.test(path);
    // Body reflections expose small normal changes: keep original painted panel topology.
    // Match complete interior node prefixes, never the "int_" substring of "CarPaint_".
    const ratio=painted?1:tier==='mobile'?(interior?.10:wheel?.30:protectedPart?.55:.30):(interior?.22:wheel?.55:protectedPart?.80:.55);
    const error=tier==='mobile'?(interior?.02:wheel?.008:protectedPart?.002:.008):(interior?.01:wheel?.004:protectedPart?.001:.004);
    for (const primitive of node.getMesh().listPrimitives()) {
      const before=(primitive.getIndices()?.getCount()??primitive.getAttribute('POSITION').getCount())/3;
      transformPrimitive(primitive,matrix); weldPrimitive(primitive);
      // Source wheel vertices may already be offset: node translation is not their centre.
      const positions=primitive.getAttribute('POSITION'), min=positions.getMin([]), max=positions.getMax([]);
      const alias=semantic(path,min.map((value,i)=>(value+max[i])/2));
      simplifyPrimitive(primitive,{simplifier:MeshoptSimplifier,ratio,error,lockBorder:true});
      const after=(primitive.getIndices()?.getCount()??primitive.getAttribute('POSITION').getCount())/3;
      const key=alias+'|'+primitive.getMaterial().getName()+'|'+primitive.listSemantics().sort().join(',');
      const bucket=buckets.get(key)??{alias,primitives:[],names:[]}; bucket.primitives.push(primitive);bucket.names.push(path);buckets.set(key,bucket);
      decisions.push({source:path,alias,before,after,ratio,error});
    }
  }
  // Snapshot source paths before flattening. Door groups stay separate; no hinge animation claimed.
  for (const child of [...scene.listChildren()]) scene.removeChild(child);
  for (const {alias,primitives,names} of buckets.values()) {
    const primitive=primitives.length===1?primitives[0]:joinPrimitives(primitives);
    const mesh=doc.createMesh(alias).addPrimitive(primitive), node=doc.createNode(alias).setMesh(mesh).setExtras({sourcePaths:names,semanticRegion:alias}); scene.addChild(node);
  }
  // Preserve exact author/license/source asset extras and annotate local changes.
  root.getAsset().extras={...root.getAsset().extras,localDerivative:{tier,commercialCleared:false,changes:'Selective error-bounded simplification; world transforms baked; compatible semantic/material batches; purpose-specific texture resize'}};
  for (const texture of root.listTextures()) {
    const image=texture.getImage(); if(!image)continue;
    const meta=await sharp(image).metadata();
    // Large interior pattern/icon sheets can be reduced; small text, dashboard and tire maps retained.
    const limit=tier==='mobile'?1024:2048;
    if((meta.width??0)>limit||(meta.height??0)>limit) texture.setImage(await sharp(image).resize({width:limit,height:limit,fit:'inside',withoutEnlargement:true}).png().toBuffer()).setMimeType('image/png');
  }
  await doc.transform(dedup(),prune());
  await io.write(`${output}/${tier}.glb`,doc);
  const triangles=decisions.reduce((n,d)=>n+d.after,0);
  await writeFile(`${output}/${tier}-decisions.json`,JSON.stringify({tier,triangles,drawCallPrimitives:buckets.size,decisions},null,2));
  console.log(JSON.stringify({tier,triangles,buckets:buckets.size,textures:root.listTextures().length}));
}
