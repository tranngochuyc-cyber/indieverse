const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {spawn,spawnSync}=require('node:child_process'),{randomBytes}=require('node:crypto');
test('CMS authenticates, isolates drafts, validates content, publishes, restores and persists',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'iv-admin-')),base='http://127.0.0.1:5189',password=randomBytes(24).toString('hex');
 const env={...process.env,PORT:'5189',IV_DATA_DIR:dir,IV_STORE_PATH:path.join(dir,'legacy.json'),PUBLIC_ORIGIN:base};
 const bootstrap=spawnSync(process.execPath,['-e',"const fs=require('fs'),c=require('./backend/cms.cjs');c.setAdmin('owner@example.com',fs.readFileSync(0,'utf8'));c.db.close()"],{cwd:__dirname,env,input:password,encoding:'utf8'});assert.equal(bootstrap.status,0,bootstrap.stderr);
 let proc,cookie='',csrf='';
 const start=async()=>{proc=spawn(process.execPath,['server.cjs'],{cwd:__dirname,env,stdio:['ignore','pipe','pipe']});await new Promise((resolve,reject)=>{proc.stdout.once('data',resolve);proc.once('error',reject);proc.once('exit',c=>reject(Error('Server exit '+c)));});};
 const stop=async()=>{if(proc&&proc.exitCode===null)await new Promise(r=>{proc.once('exit',r);proc.kill();});};
 async function request(action,data,options={}){return fetch(base+'/api/admin/'+action,{method:data===undefined?'GET':'POST',headers:{Cookie:cookie,Origin:base,'X-CSRF-Token':csrf,'Content-Type':'application/json',...options.headers},body:data===undefined?undefined:JSON.stringify(data)});}
 async function login(email='owner@example.com'){const r=await request('login',{email,password});assert.equal(r.status,200);cookie=r.headers.get('set-cookie').split(';')[0];csrf=(await r.json()).csrf;}
 try{await start();assert.equal((await request('draft')).status,401);assert.equal((await fetch(base+'/api/catalog?preview=1')).status,401);assert.equal((await fetch(base+'/var/indieverse.sqlite')).status,404);
  const html=await fetch(base+'/admin');assert.equal(html.status,200);assert.match(html.headers.get('content-security-policy'),/frame-ancestors 'none'/);
  assert.equal((await request('login',{email:'owner@example.com',password:'bad'})).status,401);await login();
  const oldPublic=await (await fetch(base+'/api/catalog')).json();let draft=await (await request('draft')).json();const doc=draft.document;let version=draft.version;
  doc.site.title='Một thế giới mới từ Studio';doc.catalog.games[0].title='Bài Core Keeper đã chỉnh';doc.site.homeImages['0']='https://example.com/hero.jpg';
  assert.equal((await request('draft',{document:doc,version},{headers:{'X-CSRF-Token':'wrong'}})).status,403);
  assert.equal((await request('draft',{document:doc,version},{headers:{Origin:'https://evil.example'}})).status,403);
  let r=await request('draft',{document:doc,version});assert.equal(r.status,200,await r.clone().text());version=(await r.json()).version;
  assert.equal((await request('draft',{document:doc,version:version-1})).status,409);
  assert.equal((await (await fetch(base+'/api/catalog')).json()).games[0].title,oldPublic.games[0].title);
  assert.equal((await (await fetch(base+'/api/catalog?preview=1',{headers:{Cookie:cookie}})).json()).games[0].title,doc.catalog.games[0].title);
  const invalid=structuredClone(doc);invalid.catalog.games[0].source='javascript:alert(1)';assert.equal((await request('draft',{document:invalid,version})).status,400);
  invalid.catalog.games[0].source=doc.catalog.games[0].source;invalid.catalog.games[0].sections=[];assert.equal((await request('draft',{document:invalid,version})).status,400);
  r=await request('publish',{version});assert.equal(r.status,200);version=(await r.json()).version;let live=await (await fetch(base+'/api/catalog')).json();assert.equal(live.site.title,doc.site.title);assert.equal(live.home.games[0].title,doc.catalog.games[0].title);
  const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=','base64');
  r=await fetch(base+'/api/admin/upload',{method:'POST',headers:{Cookie:cookie,Origin:base,'X-CSRF-Token':csrf,'X-File-Name':'test.png'},body:png});assert.equal(r.status,201);const media=await r.json();assert.equal((await fetch(base+media.src)).headers.get('content-type'),'image/png');
  assert.equal((await fetch(base+'/api/admin/upload',{method:'POST',headers:{Cookie:cookie,Origin:base,'X-CSRF-Token':csrf},body:'<svg onload="alert(1)"/>'})).status,400);
  await request('users',{email:'editor@example.com',password,role:'editor'});const ownerCookie=cookie,ownerCsrf=csrf;await login('editor@example.com');assert.equal((await request('publish',{version})).status,403);assert.equal((await request('users')).status,404);assert.equal((await request('inbox')).status,404);cookie=ownerCookie;csrf=ownerCsrf;
  const history=await (await request('history')).json();assert.equal(history.length,2);r=await request('restore',{id:history.at(-1).id,version});assert.equal(r.status,200);version=(await r.json()).version;
  assert.equal((await (await fetch(base+'/api/catalog')).json()).site.title,doc.site.title);assert.equal((await (await request('draft')).json()).document.catalog.games[0].title,oldPublic.games[0].title);
  await stop();await start();assert.equal((await (await fetch(base+'/api/catalog')).json()).site.title,doc.site.title);assert.equal((await fetch(base+media.src)).status,200);assert.equal((await request('me')).status,200);
  const exported=await (await request('export')).json();assert.equal(exported.format,1);assert(!JSON.stringify(exported).includes(password));
  await request('logout',{});assert.equal((await request('draft')).status,401);
 }finally{await stop();fs.rmSync(dir,{recursive:true,force:true});}
});
test('first-admin setup token is single use and never creates a default password',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'iv-setup-')),base='http://127.0.0.1:5192',env={...process.env,PORT:'5192',IV_DATA_DIR:dir,PUBLIC_ORIGIN:base};let proc;
 try{const r=spawnSync(process.execPath,['scripts/admin-setup.cjs','first@example.com'],{cwd:__dirname,env,encoding:'utf8'});assert.equal(r.status,0,r.stderr);const token=new URL(fs.readFileSync(path.join(dir,'setup-link.txt'),'utf8')).hash.slice(7);assert(!r.stdout.includes(token));proc=spawn(process.execPath,['server.cjs'],{cwd:__dirname,env,stdio:['ignore','pipe','pipe']});await new Promise((resolve,reject)=>{proc.stdout.once('data',resolve);proc.once('error',reject);});
  assert.equal((await fetch(base+'/api/admin/setup')).status,403);const headers={'X-Setup-Token':token,Origin:base,'Content-Type':'application/json'};assert.equal((await (await fetch(base+'/api/admin/setup',{headers})).json()).email,'first@example.com');
  const created=await fetch(base+'/api/admin/setup',{method:'POST',headers,body:JSON.stringify({password:randomBytes(24).toString('hex')})});assert.equal(created.status,201);assert.equal((await fetch(base+'/api/admin/setup',{headers})).status,403);
  const backup=spawnSync(process.execPath,['scripts/backup.cjs'],{cwd:__dirname,env,encoding:'utf8'});assert.equal(backup.status,0,backup.stderr);const folder=fs.readdirSync(path.join(dir,'backups'))[0];assert(fs.statSync(path.join(dir,'backups',folder,'indieverse.sqlite')).size>0);
 }finally{if(proc&&proc.exitCode===null)await new Promise(r=>{proc.once('exit',r);proc.kill();});fs.rmSync(dir,{recursive:true,force:true});}
});
