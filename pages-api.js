// GitHub Pages adapter: personal data stays in this browser.
const pagesStorageKey='indieverse-pages-state-v1';
function pagesFresh(){return {profile:{name:'Người chơi indie',bio:'Mỗi game là một thế giới. Đây là hành trình của tôi.',favorite:'Phiêu lưu'},library:{},collections:[],comments:[],activity:[]};}
function pagesState(){try{const stored=JSON.parse(localStorage.getItem(pagesStorageKey));return stored&&stored.profile&&stored.library&&Array.isArray(stored.collections)&&Array.isArray(stored.comments)?stored:pagesFresh();}catch{return pagesFresh();}}
function pagesText(value,max=200){return typeof value==='string'?value.trim().slice(0,max):'';}
function pagesAssert(value,message){if(!value)throw Error(message);}
async function indieversePagesApi(path,data){
 if(path==='/api/catalog'){const response=await fetch((window.INDIEVERSE_BASE||'')+'/catalog.json');if(!response.ok)throw Error('Không tải được danh mục game.');return response.json();}
 const current=pagesState();
 if(path==='/api/state')return current;
 if(path==='/api/contact'||path==='/api/newsletter')throw Error('Bản GitHub Pages chưa có dịch vụ nhận thư. Vui lòng chưa gửi thông tin qua biểu mẫu này.');
 const catalog=window.indieversePagesCatalog;
 const activity=message=>{current.activity.unshift({message,date:new Date().toISOString()});current.activity=current.activity.slice(0,30);};
 switch(path){
  case '/api/library':{
   const game=catalog.games.find(g=>g.id===data.gameId);pagesAssert(game,'Không tìm thấy game.');
   if(data.remove){delete current.library[game.id];for(const collection of current.collections)collection.ids=collection.ids.filter(id=>id!==game.id);activity(`Đã bỏ ${game.name} khỏi thư viện.`);}
   else{pagesAssert(['wishlist','playing','completed','paused'].includes(data.status),'Trạng thái không hợp lệ.');const rating=data.rating===''||data.rating==null?null:Number(data.rating);pagesAssert(rating===null||(Number.isFinite(rating)&&rating>=0&&rating<=10),'Điểm phải từ 0 đến 10.');current.library[game.id]={status:data.status,note:pagesText(data.note,1000),rating,updated:new Date().toISOString()};activity(`Đã cập nhật ${game.name} trong thư viện.`);}break;
  }
  case '/api/profile':pagesAssert(pagesText(data.name,40),'Hãy nhập tên hiển thị.');current.profile={name:pagesText(data.name,40),bio:pagesText(data.bio,300),favorite:pagesText(data.favorite,40)};activity('Đã cập nhật hồ sơ người chơi.');break;
  case '/api/comments':pagesAssert(catalog.games.some(g=>g.id===data.gameId),'Không tìm thấy bài viết.');pagesAssert(pagesText(data.content,2000).length>=3,'Cảm nhận cần ít nhất 3 ký tự.');pagesAssert(current.comments.length<500,'Đã đạt giới hạn cảm nhận trên trình duyệt.');current.comments.unshift({id:crypto.randomUUID(),gameId:data.gameId,name:current.profile.name,content:pagesText(data.content,2000),spoiler:!!data.spoiler,date:new Date().toISOString()});activity('Đã viết một cảm nhận mới.');break;
  case '/api/comment-remove':current.comments=current.comments.filter(comment=>comment.id!==data.id);break;
  case '/api/collections':{
   if(data.remove){current.collections=current.collections.filter(collection=>collection.id!==data.id);break;}
   const existing=current.collections.find(collection=>collection.id===data.id);pagesAssert(existing||current.collections.length<50,'Bạn đã có 50 bộ sưu tập.');pagesAssert(pagesText(data.title,80),'Hãy đặt tên bộ sưu tập.');const ids=[...new Set(Array.isArray(data.ids)?data.ids:[])].filter(id=>catalog.games.some(g=>g.id===id));const collection={id:existing?.id||crypto.randomUUID(),title:pagesText(data.title,80),description:pagesText(data.description,500),ids};if(existing)Object.assign(existing,collection);else current.collections.push(collection);activity(`Đã lưu bộ sưu tập ${collection.title}.`);break;
  }
  default:throw Error('Không tìm thấy chức năng.');
 }
 try{localStorage.setItem(pagesStorageKey,JSON.stringify(current));}catch{throw Error('Trình duyệt không lưu được dữ liệu. Hãy kiểm tra dung lượng hoặc chế độ riêng tư.');}
 return current;
}
