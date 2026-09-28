const {test}=require('node:test');
const assert=require('node:assert/strict');
const {spawn}=require('node:child_process');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
test('Routes, session isolation, validation and durable personal data',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'indieverse-test-'));
 const store=path.join(dir,'store.json');
 let processHandle;
 async function start(){processHandle=spawn(process.execPath,['server.cjs'],{cwd:__dirname,env:{...process.env,PORT:'5174',IV_STORE_PATH:store},stdio:['ignore','pipe','pipe']});await new Promise((resolve,reject)=>{processHandle.stdout.once('data',resolve);processHandle.once('error',reject);processHandle.once('exit',code=>reject(new Error('Server exited '+code)));});}
 async function stop(){if(processHandle.exitCode!==null)return;await new Promise(resolve=>{processHandle.once('exit',resolve);processHandle.kill();});}
 const base='http://127.0.0.1:5174';let cookie;
 async function post(route,data,origin=base){return fetch(base+'/api/'+route,{method:'POST',headers:{'Content-Type':'application/json',Origin:origin,Cookie:cookie},body:JSON.stringify(data)});}
 try{
  await start();const first=await fetch(base+'/api/state');cookie=first.headers.get('set-cookie').split(';')[0];assert.equal(Object.keys((await first.json()).library).length,0);
  const catalog=await (await fetch(base+'/api/catalog')).json();assert.equal(catalog.games.length,250);assert.equal(new Set(catalog.games.map(g=>g.slug)).size,250);
  for(const route of ['/reviews/tunic','/games/celeste','/collections','/library','/profile','/settings','/authors','/features','/contact','/faq']){const response=await fetch(base+route);assert.equal(response.status,200);assert.match(await response.text(),/id="page"/);}
  assert.equal((await fetch(base+'/data/store.json')).status,404);
  assert.equal((await post('library',{gameId:2,status:'playing',rating:15})).status,400);
  assert.equal((await post('library',{gameId:2,status:'playing'},'https://other.example')).status,403);
  let state=await (await post('library',{gameId:2,status:'playing',rating:9,note:'A saved note'})).json();assert.equal(state.library[2].note,'A saved note');
  state=await (await post('collections',{title:'Test collection',ids:[2,2,999]})).json();assert.deepEqual(state.collections[0].ids,[2]);
  state=await (await post('comments',{gameId:2,content:'A thoughtful test comment',spoiler:true})).json();assert.equal(state.comments[0].spoiler,true);
  assert.equal((await post('profile',{name:''})).status,400);
  state=await (await post('profile',{name:'Test player',bio:'Test bio',favorite:'Cozy'})).json();assert.equal(state.profile.name,'Test player');
  const separate=await (await fetch(base+'/api/state')).json();assert.equal(Object.keys(separate.library).length,0);
  await stop();await start();state=await (await fetch(base+'/api/state',{headers:{Cookie:cookie}})).json();assert.equal(state.profile.name,'Test player');assert.equal(state.library[2].rating,9);assert.equal(state.collections.length,1);assert.equal(state.comments.length,1);
  assert.equal((await post('contact',{name:'Tester',email:'invalid',message:'Test contact form.'})).status,400);
  assert.equal((await post('contact',{name:'Tester',email:'test@example.com',message:'Test contact form.'})).status,201);
  assert.equal((await post('newsletter',{email:'test@example.com'})).status,201);
  state=await (await post('library',{gameId:2,remove:true})).json();assert.equal(Object.keys(state.library).length,0);
 }finally{await stop();fs.rmSync(dir,{recursive:true,force:true});}
});
