const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const {randomUUID}=require('node:crypto');
const catalog=require('./data/catalog.cjs');
const root=__dirname;
const storePath=process.env.IV_STORE_PATH||path.join(root,'data','store.json');
let store={sessions:{},messages:[],newsletter:[]};
if(fs.existsSync(storePath))store=JSON.parse(fs.readFileSync(storePath,'utf8'));
function persist(){fs.writeFileSync(storePath+'.tmp',JSON.stringify(store,null,2));fs.renameSync(storePath+'.tmp',storePath);}
function fresh(){return {profile:{name:'Người chơi indie',bio:'Mỗi game là một thế giới. Đây là hành trình của tôi.',favorite:'Phiêu lưu'},library:{},collections:[],comments:[],activity:[]};}
function json(res,status,data){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(data));}
function text(value,max=200){return typeof value==='string'?value.trim().slice(0,max):'';}
function assert(condition,message){if(!condition)throw new Error(message);}
function activity(s,message){s.activity.unshift({message,date:new Date().toISOString()});s.activity=s.activity.slice(0,30);}
async function body(req){let bytes=0,parts=[];for await(const chunk of req){bytes+=chunk.length;if(bytes>32768)throw new Error('Nội dung quá dài.');parts.push(chunk);}return JSON.parse(Buffer.concat(parts).toString()||'{}');}
function session(req,res){let id=/\biv_session=([a-f0-9-]{36})(?:;|$)/.exec(req.headers.cookie||'')?.[1];if(!id||!store.sessions[id]){id=randomUUID();store.sessions[id]=fresh();persist();res.setHeader('Set-Cookie',`iv_session=${id}; HttpOnly; SameSite=Lax; Path=/; Max-Age=31536000`);}return store.sessions[id];}
const statuses=['wishlist','playing','completed','paused'];
const server=http.createServer(async(req,res)=>{try{
 res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');
 const url=new URL(req.url,'http://localhost');
 if(url.pathname.startsWith('/api/')){
  if(req.method==='GET'&&url.pathname==='/api/catalog')return json(res,200,catalog);
  const s=session(req,res);
  if(req.method==='GET'&&url.pathname==='/api/state')return json(res,200,s);
  if(req.method!=='POST')return json(res,404,{error:'Không tìm thấy chức năng.'});
  if(req.headers.origin!==`http://${req.headers.host}`)return json(res,403,{error:'Yêu cầu không hợp lệ.'});
  const b=await body(req);
  switch(url.pathname){
   case '/api/library':{
    const g=catalog.games.find(g=>g.id===b.gameId);assert(g,'Không tìm thấy game.');
    if(b.remove){delete s.library[g.id];for(const c of s.collections)c.ids=c.ids.filter(id=>id!==g.id);activity(s,`Đã bỏ ${g.name} khỏi thư viện.`);}
    else {assert(statuses.includes(b.status),'Trạng thái không hợp lệ.');const rating=b.rating===''||b.rating==null?null:Number(b.rating);assert(rating===null||(Number.isFinite(rating)&&rating>=0&&rating<=10),'Điểm phải từ 0 đến 10.');s.library[g.id]={status:b.status,note:text(b.note,1000),rating,updated:new Date().toISOString()};activity(s,`Đã cập nhật ${g.name} trong thư viện.`);}
    break;
   }
   case '/api/profile':assert(text(b.name,40),'Hãy nhập tên hiển thị.');s.profile={name:text(b.name,40),bio:text(b.bio,300),favorite:text(b.favorite,40)};activity(s,'Đã cập nhật hồ sơ người chơi.');break;
   case '/api/comments':{
    assert(catalog.games.some(g=>g.id===b.gameId),'Không tìm thấy bài viết.');assert(text(b.content,2000).length>=3,'Cảm nhận cần ít nhất 3 ký tự.');assert(s.comments.length<500,'Đã đạt giới hạn bình luận cục bộ.');
    s.comments.unshift({id:randomUUID(),gameId:b.gameId,name:s.profile.name,content:text(b.content,2000),spoiler:!!b.spoiler,date:new Date().toISOString()});activity(s,'Đã viết một cảm nhận mới.');break;
   }
   case '/api/comment-remove':s.comments=s.comments.filter(c=>c.id!==b.id);break;
   case '/api/collections':{
    if(b.remove){s.collections=s.collections.filter(c=>c.id!==b.id);break;}
    const existing=s.collections.find(c=>c.id===b.id);assert(existing||s.collections.length<50,'Bạn đã có 50 bộ sưu tập.');assert(text(b.title,80),'Hãy đặt tên bộ sưu tập.');const ids=[...new Set(Array.isArray(b.ids)?b.ids:[])].filter(id=>catalog.games.some(g=>g.id===id));const c={id:existing?.id||randomUUID(),title:text(b.title,80),description:text(b.description,500),ids};if(existing)Object.assign(existing,c);else s.collections.push(c);activity(s,`Đã lưu bộ sưu tập ${c.title}.`);break;
   }
   case '/api/contact':{
    assert(text(b.name,80)&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text(b.email,254))&&text(b.message,3000).length>=10,'Hãy kiểm tra tên, email và nội dung (ít nhất 10 ký tự).');store.messages.push({id:randomUUID(),name:text(b.name,80),email:text(b.email,254),topic:text(b.topic,80),message:text(b.message,3000),date:new Date().toISOString()});persist();return json(res,201,{message:'Nội dung đã được lưu tại máy này. Chưa chuyển đến một địa chỉ email bên ngoài.'});
   }
   case '/api/newsletter':{
    const email=text(b.email,254);assert(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),'Email chưa hợp lệ.');if(!store.newsletter.some(n=>n.email===email))store.newsletter.push({email,date:new Date().toISOString()});persist();return json(res,201,{message:'Đã lưu đăng ký tại máy này. Bản chạy cục bộ chưa gửi bản tin qua email.'});
   }
   default:return json(res,404,{error:'Không tìm thấy chức năng.'});
  }
  persist();return json(res,200,s);
 }
 if(!['GET','HEAD'].includes(req.method))return json(res,405,{error:'Phương thức không được hỗ trợ.'});
 const publicFiles={"/review-perspectives.js":["review-perspectives.js","text/javascript; charset=utf-8"],"/discovery-engine.js":["discovery-engine.js","text/javascript; charset=utf-8"],"/community-config.js":["community-config.js","text/javascript; charset=utf-8"],"/community.js":["community.js","text/javascript; charset=utf-8"],"/experience-v8.js":["experience-v8.js","text/javascript; charset=utf-8"],"/experience-v8.css":["experience-v8.css","text/css; charset=utf-8"],'/indie-hub.js':['indie-hub.js','text/javascript; charset=utf-8'],'/interiors.css':['interiors.css','text/css; charset=utf-8'],'/interiors.js':['interiors.js','text/javascript; charset=utf-8'],'/motion.js':['motion.js','text/javascript; charset=utf-8'],'/style.css':['style.css','text/css; charset=utf-8'],'/pages.css':['pages.css','text/css; charset=utf-8'],'/app.js':['app.js','text/javascript; charset=utf-8'],'/favicon.svg':['favicon.svg','image/svg+xml']};
 for(const [folder,count] of [['oxenfree',4],['rewinder',7]])for(let i=1;i<=count;i++)publicFiles[`/assets/${folder}/scene-${i}.jpg`]=[`assets/${folder}/scene-${i}.jpg`,'image/jpeg'];
 const file=publicFiles[url.pathname]||(path.extname(url.pathname)?null:['index.html','text/html; charset=utf-8']);
 if(!file){res.writeHead(404);return res.end('Not found');}
 res.setHeader('Content-Type',file[1]);res.setHeader('Cache-Control','no-cache');
 fs.readFile(path.join(root,file[0]),(err,data)=>{if(err){res.writeHead(404);return res.end('Not found');}res.end(req.method==='HEAD'?undefined:data);});
}catch(e){json(res,400,{error:e instanceof SyntaxError?'Dữ liệu chưa hợp lệ.':e.message});}});
server.listen(Number(process.env.PORT)||5173,'127.0.0.1',()=>console.log(`Indieverse: http://localhost:${Number(process.env.PORT)||5173}`));
