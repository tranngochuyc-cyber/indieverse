const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'dist');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml'};
http.createServer((request,response)=>{
 const url=new URL(request.url,'http://localhost');
 const pathname=url.pathname.startsWith('/indieverse/')?url.pathname.slice('/indieverse'.length):url.pathname==='/indieverse'?'/':url.pathname;
 const resolved=path.resolve(root,'.'+decodeURIComponent(pathname));
 if(!resolved.startsWith(root+path.sep)&&resolved!==root){response.writeHead(403);return response.end();}
 const file=resolved===root?path.join(root,'index.html'):fs.existsSync(resolved)&&fs.statSync(resolved).isFile()?resolved:path.extname(resolved)?null:path.join(root,'404.html');
 if(!file){response.writeHead(404);return response.end();}
 response.writeHead(fs.existsSync(resolved)?200:404,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});
 fs.createReadStream(file).pipe(response);
}).listen(5174,'127.0.0.1',()=>console.log('GitHub Pages preview: http://localhost:5174'));
