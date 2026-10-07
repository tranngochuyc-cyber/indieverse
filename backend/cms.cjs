const fs=require('node:fs'),path=require('node:path');
const {DatabaseSync}=require('node:sqlite');
const {randomBytes,randomUUID,scryptSync,timingSafeEqual,createHash}=require('node:crypto');
const seed=require('../data/catalog.cjs');
const profiles=require('../discovery-engine.js').profiles;
const dir=process.env.IV_DATA_DIR||(process.env.IV_STORE_PATH?path.dirname(process.env.IV_STORE_PATH):path.join(__dirname,'../var'));
fs.mkdirSync(path.join(dir,'uploads'),{recursive:true});
const db=new DatabaseSync(path.join(dir,'indieverse.sqlite'));
db.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
CREATE TABLE IF NOT EXISTS kv(key TEXT PRIMARY KEY,value TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS admins(id TEXT PRIMARY KEY,email TEXT UNIQUE NOT NULL,password TEXT NOT NULL,role TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS logins(token TEXT PRIMARY KEY,admin TEXT NOT NULL,csrf TEXT NOT NULL,expires INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS revisions(id INTEGER PRIMARY KEY AUTOINCREMENT,created TEXT NOT NULL,actor TEXT NOT NULL,note TEXT NOT NULL,content TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS audit(id INTEGER PRIMARY KEY AUTOINCREMENT,created TEXT NOT NULL,actor TEXT NOT NULL,action TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS media(id TEXT PRIMARY KEY,name TEXT NOT NULL,mime TEXT NOT NULL,bytes INTEGER NOT NULL,created TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS attempts(key TEXT PRIMARY KEY,count INTEGER NOT NULL,until INTEGER NOT NULL);`);
const clone=x=>JSON.parse(JSON.stringify(x));
function get(k,fallback){const r=db.prepare('SELECT value FROM kv WHERE key=?').get(k);return r?JSON.parse(r.value):fallback;}
function put(k,v){db.prepare('INSERT INTO kv VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').run(k,JSON.stringify(v));}
function audit(who,action){db.prepare('INSERT INTO audit(created,actor,action) VALUES(?,?,?)').run(new Date().toISOString(),who,action);}
function fail(message,status=400){throw Object.assign(new Error(message),{status});}
const initial={catalog:clone(seed),site:{name:'Indieverse',title:'Thế giới nhỏ. Trải nghiệm lớn.',description:'Những tựa game độc lập đáng chơi. Những câu chuyện đáng kể.',eyebrow:'DÀNH CHO NHỮNG TÂM HỒN MÊ GAME',logo:'',colors:{bg:'#1b1924',panel:'#282333',text:'#f5f2fa',muted:'#c5bed1',purple:'#c6a8ff',gold:'#f1b65f'},homeGameIds:seed.home.games.map(g=>g.id),homeImages:{},navigation:[{label:'Khám phá',href:'/'},{label:'Kho game',href:'/games'},{label:'Đánh giá',href:'/reviews'},{label:'Chuyên đề',href:'/collections'},{label:'Góc indie',href:'/features'}],pages:[],playEnabled:true,communityEnabled:true,profiles:clone(profiles)}};
if(!get('draft')){put('draft',initial);put('published',initial);put('version',1);}
for(const key of ['draft','published']){const d=get(key);d.site.mechanics??=require('../data/mechanics.cjs');d.site.visualStyles??=clone(require('../discovery-engine.js').visualStyles);d.site.community??={supabaseUrl:'',publishableKey:'',steamLoginUrl:''};put(key,d);}
function passwordHash(password){if(typeof password!=='string'||password.length<14||password.length>256)fail('Mật khẩu cần 14–256 ký tự.');const salt=randomBytes(16).toString('hex');return salt+':'+scryptSync(password,salt,64).toString('hex');}
function verify(password,stored){if(typeof password!=='string'||password.length>256)return false;const [salt,hash]=stored.split(':');return timingSafeEqual(scryptSync(password,salt,64),Buffer.from(hash,'hex'));}
function setAdmin(email,password,role='admin'){email=String(email).trim().toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||!['admin','editor'].includes(role))fail('Email hoặc vai trò không hợp lệ.');const hash=passwordHash(password),old=db.prepare('SELECT id FROM admins WHERE email=?').get(email);if(old){db.prepare('UPDATE admins SET password=?,role=? WHERE id=?').run(hash,role,old.id);db.prepare('DELETE FROM logins WHERE admin=?').run(old.id);}else db.prepare('INSERT INTO admins VALUES(?,?,?,?)').run(randomUUID(),email,hash,role);audit(email,'Cập nhật tài khoản quản trị');}
function safeUrl(s){if(typeof s!=='string')return false;if(!s)return true;if(/^\/(?!\/)[a-zA-Z0-9/_?=&#.%-]*$/.test(s))return true;try{const u=new URL(s);return ['https:','http:'].includes(u.protocol)&&!u.username&&!u.password&&!/[<>"'`\s]/.test(s);}catch{return false;}}
function validate(doc){
 if(!doc||typeof doc!=='object'||!doc.catalog||!doc.site)fail('Thiếu nội dung website.');
 const c=doc.catalog,s=doc.site;
 function walk(x,depth=0){if(depth>14)fail('Dữ liệu lồng quá sâu.');if(typeof x==='string'){if(x.length>30000||/[<>\u0000]/.test(x)||/^\s*(javascript|data|vbscript):/i.test(x))fail('Nội dung chỉ nhận văn bản thuần, không nhận mã HTML.');}else if(x&&typeof x==='object'){for(const [k,v]of Object.entries(x)){if(['__proto__','prototype','constructor'].includes(k))fail('Khóa dữ liệu không hợp lệ.');if(/^(src|source|sourceUrl|coverImage|heroImage|cardImage|website|href|logo|header|background|supabaseUrl|steamLoginUrl)$/.test(k)&&v!=null&&!safeUrl(v))fail('Đường dẫn không hợp lệ: '+k);if(k==='color'&&!/^#[0-9a-f]{6}$/i.test(v))fail('Màu phải có dạng #rrggbb.');walk(v,depth+1);}}}
 walk(doc);
 if(!Array.isArray(c.games)||c.games.length<seed.games.length||c.games.length>3000)fail('Không xóa game gốc; hãy chỉnh sửa hồ sơ hoặc bỏ khỏi trang chủ.');
 const slugs=new Set();
 for(const [i,g]of c.games.entries()){
  if(g.id!==i||!/^[-a-z0-9]+$/.test(g.slug)||slugs.has(g.slug))fail('ID/đường dẫn game không hợp lệ hoặc trùng.');slugs.add(g.slug);
  for(const k of ['name','title','genre','type','displayType','author','authorSlug','country','mode','lede','fit','caution','verdict','pitch','hook','theme','desc'])if(typeof g[k]!=='string'||!g[k].trim())fail(g.slug+': thiếu '+k);
  if(!Number.isSafeInteger(g.app)||g.app<1||!/^https:\/\/store\.steampowered\.com\/app\/\d+\//.test(g.source)||new URL(g.source).pathname.split('/')[2]!==String(g.app))fail(g.slug+': Steam ID và link phải khớp.');
  if(g.score!==null&&(!Number.isFinite(g.score)||g.score<0||g.score>10))fail('Điểm biên tập phải từ 0–10 hoặc bỏ trống.');
  if(!Array.isArray(g.sections)||g.sections.length!==4||g.sections.some(x=>!x.title||!Array.isArray(x.paragraphs)||!x.paragraphs.length||x.paragraphs.some(p=>typeof p!=='string'||!p.trim())))fail(g.slug+': cần đủ bốn chương và nội dung.');
  if(!Array.isArray(g.images)||g.images.length<3||g.images.some(x=>!x.src||!safeUrl(x.src)))fail(g.slug+': cần ít nhất ba ảnh hợp lệ.');
  if(g.steamMedia?.screenshots?.some(x=>!safeUrl(x)))fail('Đường dẫn ảnh không hợp lệ.');
 }
 for(const key of ['authors','features','collections','legacyFeatures','legacyCollections'])if(!Array.isArray(c[key])||!c[key].length)fail('Danh sách '+key+' không được rỗng.');
 for(const g of c.games)if(!c.authors.some(a=>a.slug===g.authorSlug))fail('Tác giả của '+g.name+' không tồn tại.');
 for(const f of [...c.features,...c.legacyFeatures])if(!c.games[f.game]||!f.title||!/^[-a-z0-9]+$/.test(f.slug)||!Array.isArray(f.sections)||!f.sections.length||f.sections.some(a=>!Array.isArray(a)||a.length<2||a.some(v=>typeof v!=='string')))fail('Bài Góc indie thiếu game/chương/đường dẫn.');
 for(const group of [...c.collections,...c.legacyCollections])if(!group.title||!Array.isArray(group.ids)||!group.ids.length||group.ids.some(id=>!c.games[id]))fail('Chuyên đề có game không tồn tại.');
 if(!s.name||!s.title||!s.description||!Array.isArray(s.homeGameIds)||s.homeGameIds.length<12||s.homeGameIds.some(id=>!c.games[id]))fail('Trang chủ cần ít nhất 12 game hợp lệ.');
 for(const v of Object.values(s.homeImages))if(!safeUrl(v))fail('Ảnh trang chủ không hợp lệ.');
 for(const k of ['bg','panel','text','muted','purple','gold'])if(!/^#[0-9a-f]{6}$/i.test(s.colors[k]))fail('Màu phải có dạng #rrggbb.');
 if(!Array.isArray(s.navigation)||!s.navigation.length||s.navigation.some(n=>!n.label||!safeUrl(n.href)))fail('Điều hướng chưa hợp lệ.');
 if(!Array.isArray(s.pages)||s.pages.some(p=>!/^\/[a-z0-9/-]*$/.test(p.path)||!p.title||!Array.isArray(p.paragraphs)||p.paragraphs.some(v=>typeof v!=='string')))fail('Trang thông tin chưa hợp lệ.');
 const axes=8;for(const [slug,p]of Object.entries(s.profiles)){if(!slugs.has(slug)||p.slug!==slug||!Array.isArray(p.vector)||p.vector.length!==axes||p.vector.some(n=>!Number.isFinite(n)||n<0||n>5)||!Number.isFinite(p.minutes)||p.minutes<1)fail('Hồ sơ đề xuất game chưa hợp lệ: '+slug);}
 if(!s.profiles['hollow-knight'])fail('Hồ sơ Hollow Knight được dùng làm điểm bắt đầu của Rabbit Hole.');
 if(!Array.isArray(s.mechanics)||s.mechanics.some(m=>!Array.isArray(m)||m.length!==5||!/^[-a-z0-9]+$/.test(m[0])||typeof m[1]!=='string'||typeof m[2]!=='string'||!Array.isArray(m[3])||m[3].some(slug=>!slugs.has(slug))||!Array.isArray(m[4])||m[4].length!==m[3].length||m[4].some(t=>typeof t!=='string')))fail('Cơ chế cần có game và lời dẫn tương ứng.');
 for(const [slug,tags]of Object.entries(s.visualStyles))if(!slugs.has(slug)||!Array.isArray(tags)||tags.some(t=>typeof t!=='string'))fail('Nhãn phong cách chưa hợp lệ.');
 if(!c.steamChart||!Number.isFinite(c.steamChart.rollupDate)||!Array.isArray(c.steamChart.rows)||c.steamChart.rows.some(r=>!c.games.some(g=>g.app===r.appid)||!Number.isFinite(r.rank)||!Number.isFinite(r.peak_in_game)))fail('Bảng Steam tham chiếu game hoặc dữ liệu không hợp lệ.');
 if(s.pages.some(p=>/^\/(admin|api|uploads|play|games|reviews|login|library|profile|settings)(\/|$)/.test(p.path))||new Set(s.pages.map(p=>p.path)).size!==s.pages.length)fail('Trang thông tin không được ghi đè công cụ hoặc trùng đường dẫn.');
 const key=s.community?.publishableKey||'';if(key&&!key.startsWith('sb_publishable_')){try{if(JSON.parse(Buffer.from(key.split('.')[1],'base64url').toString()).role!=='anon')throw Error();}catch{fail('Chỉ dùng Supabase publishable key / anon key, không dùng khóa bí mật.');}}
 if(s.community?.supabaseUrl&&!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(s.community.supabaseUrl))fail('URL Supabase phải có dạng https://project.supabase.co.');
 return doc;
}
function publicCatalog(preview=false){const d=clone(get(preview?'draft':'published')),c=d.catalog;c.site=d.site;
 c.home={...c.home,games:d.site.homeGameIds.map(id=>c.games[id]),authors:c.authors,collections:c.legacyCollections,features:c.home.features.map(f=>c.legacyFeatures.find(x=>x.slug===f.slug)||c.features.find(x=>x.slug===f.slug)||f)};
 // Home cards reference the same edited records; no stale duplicate of a game.
 return c;
}
const digest=s=>createHash('sha256').update(s).digest('hex');
function auth(req){const token=/\biv_admin=([a-f0-9]{64})(?:;|$)/.exec(req.headers.cookie||'')?.[1];return token?db.prepare('SELECT admins.id,email,role,csrf,token FROM logins JOIN admins ON admins.id=logins.admin WHERE token=? AND expires>?').get(digest(token),Date.now()):null;}
function origin(req){return process.env.PUBLIC_ORIGIN||`http://${req.headers.host}`;}
async function read(req,limit=8*1024*1024){let size=0,parts=[];for await(const p of req){size+=p.length;if(size>limit)fail('Tệp quá lớn (tối đa 8 MB).',413);parts.push(p);}return Buffer.concat(parts);}
function send(res,status,value){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(value));}
function cookie(res,token,req,clear=false){res.setHeader('Set-Cookie',`iv_admin=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${clear?0:28800}${origin(req).startsWith('https:')?'; Secure':''}`);}
function attempt(req,email){const key=digest(req.socket.remoteAddress+'|'+String(email).toLowerCase()),now=Date.now();db.prepare('DELETE FROM attempts WHERE until<?').run(now);const row=db.prepare('SELECT count FROM attempts WHERE key=?').get(key);if(row?.count>=8)fail('Quá nhiều lần đăng nhập. Thử lại sau 15 phút.',429);db.prepare('INSERT INTO attempts VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1').run(key,now+900000);const global=digest(req.socket.remoteAddress);const ip=db.prepare('SELECT count FROM attempts WHERE key=?').get(global);if(ip?.count>=40)fail('Tạm giới hạn đăng nhập. Thử lại sau 15 phút.',429);db.prepare('INSERT INTO attempts VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1').run(global,now+900000);return key;}
async function handle(req,res,url,store,persist){
 if(url.pathname==='/healthz'){send(res,200,{ok:true});return true;}
 if(url.pathname==='/api/catalog'){if(url.searchParams.has('preview')&&!auth(req))fail('Cần đăng nhập để xem bản nháp.',401);send(res,200,publicCatalog(url.searchParams.has('preview')));return true;}
 if(url.pathname.startsWith('/uploads/')){const id=url.pathname.slice(9);const m=db.prepare('SELECT * FROM media WHERE id=?').get(id);if(!m){send(res,404,{error:'Không tìm thấy ảnh.'});return true;}if(!['GET','HEAD'].includes(req.method))fail('Phương thức không hỗ trợ.',405);res.writeHead(200,{'Content-Type':m.mime,'Cache-Control':'public, max-age=31536000, immutable','Content-Security-Policy':"default-src 'none'"});if(req.method==='HEAD')res.end();else fs.createReadStream(path.join(dir,'uploads',id)).pipe(res);return true;}
 if(!url.pathname.startsWith('/api/admin/'))return false;
 const action=url.pathname.slice(11),user=auth(req);
 if(req.method!=='GET'&&req.headers.origin!==origin(req))fail('Nguồn yêu cầu không hợp lệ.',403);
 if(action==='setup'){
  const pending=get('first-setup',null),token=req.headers['x-setup-token'];
  if(db.prepare('SELECT id FROM admins LIMIT 1').get()||!pending||pending.expires<Date.now()||typeof token!=='string'||digest(token)!==pending.hash)fail('Liên kết thiết lập không hợp lệ hoặc đã hết hạn.',403);
  if(req.method==='GET'){send(res,200,{email:pending.email});return true;}
  if(req.method!=='POST')fail('Phương thức không hỗ trợ.',405);
  const b=JSON.parse((await read(req,4096)).toString());setAdmin(pending.email,b.password);put('first-setup',null);send(res,201,{ok:true});return true;
 }
 if(action==='login'&&req.method==='POST'){
  const b=JSON.parse((await read(req,4096)).toString()),key=attempt(req,b.email),row=db.prepare('SELECT * FROM admins WHERE email=?').get(String(b.email).trim().toLowerCase());
  const dummy='00000000000000000000000000000000:'+('00'.repeat(64));const ok=verify(b.password,row?.password||dummy);if(!row||!ok)fail('Email hoặc mật khẩu không đúng.',401);
  db.prepare('DELETE FROM attempts WHERE key=?').run(key);db.prepare('DELETE FROM logins WHERE expires<?').run(Date.now());const token=randomBytes(32).toString('hex'),csrf=randomBytes(24).toString('hex');db.prepare('INSERT INTO logins VALUES(?,?,?,?)').run(digest(token),row.id,csrf,Date.now()+28800000);cookie(res,token,req);audit(row.email,'Đăng nhập');send(res,200,{email:row.email,role:row.role,csrf});return true;
 }
 if(!user)fail('Vui lòng đăng nhập quản trị.',401);
 if(req.method!=='GET'&&req.headers['x-csrf-token']!==user.csrf)fail('Phiên xác thực không hợp lệ. Tải lại trang.',403);
 if(req.method==='GET'){
  if(action==='me')send(res,200,{email:user.email,role:user.role,csrf:user.csrf});
  else if(action==='draft')send(res,200,{document:get('draft'),version:get('version'),publishedAt:get('publishedAt',null)});
  else if(action==='history')send(res,200,db.prepare('SELECT id,created,actor,note FROM revisions ORDER BY id DESC LIMIT 30').all());
  else if(action==='media')send(res,200,db.prepare('SELECT * FROM media ORDER BY created DESC').all());
  else if(action==='audit')send(res,200,db.prepare('SELECT * FROM audit ORDER BY id DESC LIMIT 100').all());
  else if(action==='export'){res.setHeader('Content-Disposition','attachment; filename="indieverse-content.json"');send(res,200,{document:get('draft'),format:1});}
  else if(action==='inbox'&&user.role==='admin')send(res,200,{messages:store.messages,newsletter:store.newsletter,comments:Object.entries(store.sessions).flatMap(([id,s])=>s.comments.map(c=>({...c,owner:digest(id)})))});
  else if(action==='users'&&user.role==='admin')send(res,200,db.prepare('SELECT id,email,role FROM admins').all());
  else fail('Không tìm thấy chức năng.',404);return true;
 }
 if(req.method!=='POST')fail('Phương thức không hỗ trợ.',405);
 if(action==='upload'){
  const bytes=await read(req),name=decodeURIComponent(req.headers['x-file-name']||'image').slice(0,150);let ext,mime;
  if(bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))){ext='png';mime='image/png';}
  else if(bytes[0]===255&&bytes[1]===216&&bytes[2]===255){ext='jpg';mime='image/jpeg';}
  else if(bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP'){ext='webp';mime='image/webp';}
  else fail('Chỉ nhận ảnh PNG, JPEG hoặc WebP. Không nhận SVG/HTML.');
  const total=db.prepare('SELECT COALESCE(SUM(bytes),0) AS total FROM media').get().total;if(total+bytes.length>2*1024**3)fail('Kho ảnh đã đạt giới hạn 2 GB.',413);
  const id=randomUUID()+'.'+ext;fs.writeFileSync(path.join(dir,'uploads',id),bytes,{flag:'wx'});db.prepare('INSERT INTO media VALUES(?,?,?,?,?)').run(id,name,mime,bytes.length,new Date().toISOString());audit(user.email,'Tải ảnh '+id);send(res,201,{src:'/uploads/'+id,id});return true;
 }
 const b=JSON.parse((await read(req)).toString()||'{}');
 if(action==='logout'){db.prepare('DELETE FROM logins WHERE token=?').run(user.token);cookie(res,'',req,true);send(res,200,{ok:true});return true;}
 if(action==='password'){const row=db.prepare('SELECT password FROM admins WHERE id=?').get(user.id);if(!verify(b.current,row.password))fail('Mật khẩu hiện tại không đúng.',403);db.prepare('UPDATE admins SET password=? WHERE id=?').run(passwordHash(b.password),user.id);db.prepare('DELETE FROM logins WHERE admin=?').run(user.id);audit(user.email,'Đổi mật khẩu và thu hồi phiên');send(res,200,{ok:true});return true;}
 if(action==='draft'){
  const doc=validate(b.document);db.exec('BEGIN IMMEDIATE');try{if(b.version!==get('version'))fail('Bản nháp đã được sửa ở cửa sổ khác. Tải lại trước khi lưu.',409);put('draft',doc);put('version',b.version+1);audit(user.email,'Lưu bản nháp');db.exec('COMMIT');}catch(e){db.exec('ROLLBACK');throw e;}send(res,200,{version:get('version')});return true;
 }
 if(user.role!=='admin')fail('Chức năng này dành cho quản trị viên.',403);
 if(action==='publish'||action==='restore'){
  db.exec('BEGIN IMMEDIATE');try{if(b.version!==get('version'))fail('Nội dung đã thay đổi. Tải lại để tiếp tục.',409);
   if(action==='restore'){const r=db.prepare('SELECT content FROM revisions WHERE id=?').get(b.id);if(!r)fail('Không tìm thấy phiên bản.',404);put('draft',validate(JSON.parse(r.content)));put('version',b.version+1);audit(user.email,'Khôi phục về bản nháp #'+b.id);}
   else{const d=validate(get('draft')),now=new Date().toISOString();if(!db.prepare('SELECT id FROM revisions LIMIT 1').get())db.prepare('INSERT INTO revisions(created,actor,note,content) VALUES(?,?,?,?)').run(now,user.email,'Bản trước khi xuất bản lần đầu',JSON.stringify(get('published')));db.prepare('INSERT INTO revisions(created,actor,note,content) VALUES(?,?,?,?)').run(now,user.email,String(b.note||'Xuất bản').slice(0,200),JSON.stringify(d));put('published',d);put('publishedAt',now);put('version',b.version+1);audit(user.email,'Xuất bản website');db.exec('DELETE FROM revisions WHERE id NOT IN (SELECT id FROM revisions ORDER BY id DESC LIMIT 30)');}db.exec('COMMIT');
  }catch(e){db.exec('ROLLBACK');throw e;}send(res,200,{version:get('version')});return true;
 }
 if(action==='users'){setAdmin(b.email,b.password,b.role);send(res,200,{ok:true});return true;}
 if(action==='user-delete'){if(b.id===user.id)fail('Không thể xóa tài khoản đang dùng.');db.prepare('DELETE FROM admins WHERE id=?').run(b.id);db.prepare('DELETE FROM logins WHERE admin=?').run(b.id);audit(user.email,'Xóa tài khoản quản trị');send(res,200,{ok:true});return true;}
 if(action==='inbox-delete'){if(b.type==='messages')store.messages=store.messages.filter(x=>x.id!==b.id);else if(b.type==='newsletter')store.newsletter=store.newsletter.filter(x=>x.email!==b.id);else if(b.type==='comments'){for(const [id,s]of Object.entries(store.sessions))if(digest(id)===b.owner)s.comments=s.comments.filter(x=>x.id!==b.id);}else fail('Mục không hợp lệ.');persist();audit(user.email,'Xóa mục hộp thư / cảm nhận');send(res,200,{ok:true});return true;}
 fail('Không tìm thấy chức năng.',404);
}
module.exports={handle,publicCatalog,setAdmin,get,put,validate,dir,db,origin};
