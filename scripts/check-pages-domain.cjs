const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const dist=path.join(__dirname,'..','dist');
const html=fs.readFileSync(path.join(dist,'index.html'),'utf8');
const fallback=fs.readFileSync(path.join(dist,'404.html'),'utf8');
const base=(process.env.INDIEVERSE_PAGES_BASE||'').replace(/\/$/,'');
assert.equal(html,fallback,'Direct article routes need the same SPA entry in 404.html');
assert(html.includes(`window.INDIEVERSE_BASE=${JSON.stringify(base)}`),'Runtime base does not match the deployed path');
assert(fs.existsSync(path.join(dist,'catalog.json')),'Missing public game catalog');
for(const [,url] of html.matchAll(/(?:src|href)="(\/[^"#?]+)"/g)){
 const asset=url.slice((base||'').length+1);
 assert(!url.startsWith('/indieverse/')||base==='/indieverse','Unexpected project-prefix asset on a custom domain');
 assert(fs.existsSync(path.join(dist,asset)),`Missing Pages asset: ${url}`);
}
assert.equal(fs.readFileSync(path.join(dist,'CNAME'),'utf8').trim(),process.env.INDIEVERSE_PAGES_DOMAIN||'indieverse.id.vn');
console.log(`Pages domain assets and deep-link entry verified for ${base||'/'} .`);
