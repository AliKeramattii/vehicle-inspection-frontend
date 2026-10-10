import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { Matrix4, Vector3, Quaternion, Box3 } from 'three';
import sharp from 'sharp';

const source = process.argv[2] ?? 'references/assets/3d/source/kia_sportage_gt_line_2023.glb';
const output = process.argv[3] ?? '.agent/reference-review/phase09/source-audit.json';
const bytes = await readFile(source);
if (bytes.readUInt32LE(0) !== 0x46546c67 || bytes.readUInt32LE(4) !== 2 || bytes.readUInt32LE(8) !== bytes.length) throw new Error('Invalid GLB header');
const jsonLength = bytes.readUInt32LE(12), json = JSON.parse(bytes.subarray(20, 20 + jsonLength).toString('utf8'));
const binary = bytes.subarray(28 + jsonLength);
const world = [], parents = [], bounds = new Box3(), meshReports = [];
const componentReaders = { 5126: ['readFloatLE', 4], 5123: ['readUInt16LE', 2], 5125: ['readUInt32LE', 4] };
function localMatrix(node) {
  return node.matrix ? new Matrix4().fromArray(node.matrix) : new Matrix4().compose(new Vector3().fromArray(node.translation ?? [0,0,0]), new Quaternion().fromArray(node.rotation ?? [0,0,0,1]), new Vector3().fromArray(node.scale ?? [1,1,1]));
}
function walk(index, matrix, parent) {
  const node = json.nodes[index]; parents[index] = parent; world[index] = matrix.clone().multiply(localMatrix(node));
  if (node.mesh !== undefined) {
    const box = new Box3(), mesh = json.meshes[node.mesh]; let triangles = 0;
    for (const primitive of mesh.primitives) {
      const accessor = json.accessors[primitive.attributes.POSITION], view = json.bufferViews[accessor.bufferView];
      const [reader, size] = componentReaders[accessor.componentType];
      for (let i=0; i<accessor.count; i++) {
        const start = (view.byteOffset ?? 0) + (accessor.byteOffset ?? 0) + i * (view.byteStride ?? size*3);
        const position = new Vector3(...[0,1,2].map(c => binary[reader](start + c*size))).applyMatrix4(world[index]);
        box.expandByPoint(position); bounds.expandByPoint(position);
      }
      triangles += (primitive.mode ?? 4) === 4 ? (json.accessors[primitive.indices]?.count ?? accessor.count)/3 : 0;
    }
    const ancestry = []; for(let i=index; i!==undefined; i=parents[i]) ancestry.unshift(json.nodes[i].name ?? `node-${i}`);
    meshReports.push({ node: index, mesh: node.mesh, name: node.name, ancestry, triangles, min: box.min.toArray(), max: box.max.toArray(), materials: mesh.primitives.map(p=>json.materials[p.material]?.name) });
  }
  for (const child of node.children ?? []) walk(child, world[index], index);
}
for (const root of json.scenes[json.scene ?? 0].nodes) walk(root, new Matrix4(), undefined);
const textures = await Promise.all((json.images ?? []).map(async (image, index) => {
  const view = json.bufferViews[image.bufferView], data = binary.subarray(view.byteOffset ?? 0,(view.byteOffset ?? 0)+view.byteLength), meta = await sharp(data).metadata();
  return { index, name:image.name, mime:image.mimeType, bytes:data.length, width:meta.width, height:meta.height, decodedRgbaMipBytes:Math.round((meta.width??0)*(meta.height??0)*4*4/3), sha256:createHash('sha256').update(data).digest('hex') };
}));
const materialSignatures = json.materials.map(material=>JSON.stringify({...material,name:undefined}));
const result = { source, bytes:bytes.length, sha256:createHash('sha256').update(bytes).digest('hex'), asset:json.asset, extensions:json.extensionsUsed, nodes:json.nodes.length, reachableNodes:world.filter(Boolean).length, meshes:json.meshes.length, instances:meshReports.length, primitives:meshReports.reduce((n,m)=>n+json.meshes[m.mesh].primitives.length,0), triangles:meshReports.reduce((n,m)=>n+m.triangles,0), bounds:{min:bounds.min.toArray(),max:bounds.max.toArray(),size:bounds.getSize(new Vector3()).toArray()}, animations:json.animations?.length??0, materials:json.materials.map((m,index)=>({index,...m})), duplicateMaterials:materialSignatures.map((s,i)=>({index:i,duplicateOf:materialSignatures.indexOf(s)})).filter(v=>v.index!==v.duplicateOf), textures, textureRgbaMipBytes:textures.reduce((n,t)=>n+t.decodedRgbaMipBytes,0), hierarchy:json.nodes.map((n,index)=>({index,name:n.name,parent:parents[index],children:n.children,mesh:n.mesh,matrix:n.matrix})), meshReports };
await mkdir(output.substring(0,output.lastIndexOf('/')), {recursive:true}); await writeFile(output,JSON.stringify(result,null,2));
console.log(JSON.stringify({source,bytes:result.bytes,nodes:result.nodes,meshes:result.meshes,triangles:result.triangles,bounds:result.bounds,textures:textures.map(({index,width,height,bytes})=>({index,width,height,bytes})),textureMiB:result.textureRgbaMipBytes/1024**2,duplicates:result.duplicateMaterials},null,2));
