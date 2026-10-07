const fs=require('node:fs'),path=require('node:path'),{randomBytes,createHash}=require('node:crypto'),cms=require('../backend/cms.cjs');
const email=process.argv[2],origin=process.env.PUBLIC_ORIGIN||'http://localhost:5173';
if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email||''))throw Error('Cần nhập email quản trị.');
if(cms.db.prepare('SELECT id FROM admins LIMIT 1').get())throw Error('Đã có admin. Dùng admin:create để đặt lại mật khẩu.');
const token=randomBytes(32).toString('hex');cms.put('first-setup',{email,hash:createHash('sha256').update(token).digest('hex'),expires:Date.now()+20*60*1000});
fs.writeFileSync(path.join(cms.dir,'setup-link.txt'),origin+'/admin#setup='+token,{mode:0o600});console.log('Đã tạo liên kết thiết lập một lần trong thư mục dữ liệu; hết hạn sau 20 phút.');cms.db.close();
