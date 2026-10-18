const DB_NAME = 'vehicle-inspection-360-capture';
const DB_VERSION = 1;
const STORE = 'recordings';
export function openRecordingDB() {
  return new Promise((resolve,reject)=>{
    if (!('indexedDB' in window)) { reject(new Error('IndexedDB unavailable')); return; }
    const req = indexedDB.open(DB_NAME,DB_VERSION);
    req.onupgradeneeded = ()=>{
      const db=req.result;
      if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE,{keyPath:'id'});
    };
    req.onerror=()=>reject(req.error);
    req.onsuccess=()=>resolve(req.result);
  });
}
export async function persistRecording(record){
  const db=await openRecordingDB();
  try { await new Promise((resolve,reject)=>{
    const tx=db.transaction(STORE,'readwrite');
    tx.objectStore(STORE).put(record);
    tx.oncomplete=resolve;
    tx.onerror=()=>reject(tx.error);
    tx.onabort=()=>reject(tx.error||new Error('Persistence aborted'));
  }); }finally{db.close()}
  return record.id;
}
export async function readRecording(id){
  const db=await openRecordingDB();
  try {return await new Promise((resolve,reject)=>{
    const tx=db.transaction(STORE,'readonly');
    const req=tx.objectStore(STORE).get(id);
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(req.error);
  })} finally{db.close()}
}

/** Accepted local blobs not yet durably handed to the host's idempotent queue. */
export async function listPendingRecordings(){
  const db=await openRecordingDB();
  try{return await new Promise((resolve,reject)=>{
    const req=db.transaction(STORE,'readonly').objectStore(STORE).getAll();
    req.onsuccess=()=>resolve((req.result||[]).filter(r=>r.uploadStatus==='pending-handoff'));
    req.onerror=()=>reject(req.error);
  });}finally{db.close();}
}
export async function markRecordingQueued(id,jobId){
  const db=await openRecordingDB();
  try{return await new Promise((resolve,reject)=>{
    const tx=db.transaction(STORE,'readwrite');const store=tx.objectStore(STORE);
    const req=store.get(id);
    req.onsuccess=()=>{
      if(!req.result){tx.abort();return;}
      store.put({...req.result,uploadStatus:'queued',jobId:jobId??null});
    };
    tx.oncomplete=()=>resolve();
    tx.onerror=()=>reject(tx.error);
    tx.onabort=()=>reject(tx.error||new Error('Queue metadata update failed'));
  });}finally{db.close();}
}
