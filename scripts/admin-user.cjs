const readline=require('node:readline'),{Writable}=require('node:stream');
const email=process.argv[2],role=process.argv[3]||'admin';
if(!email){console.error('Dùng: npm run admin:create -- email@example.com [admin|editor]');process.exit(1);}
let muted=false;const output=new Writable({write(chunk,encoding,done){if(!muted)process.stdout.write(chunk,encoding);done();}});
const rl=readline.createInterface({input:process.stdin,output,terminal:!!process.stdin.isTTY});
rl.question('Mật khẩu mới (ít nhất 14 ký tự; không hiển thị): ',password=>{muted=false;process.stdout.write('\n');rl.close();try{require('../backend/cms.cjs').setAdmin(email,password,role);console.log('Đã lưu tài khoản quản trị. Các phiên cũ của tài khoản này đã bị thu hồi.');}catch(e){console.error(e.message);process.exitCode=1;}});muted=true;
