/* Runtime configuration is present only on the managed Node website. */
window.IndieverseCMS={prepare(c){if(!c.site)return;if(c.site.community)Object.assign(window.INDIEVERSE_COMMUNITY,c.site.community);for(const key of Object.keys(IVDiscovery.profiles))delete IVDiscovery.profiles[key];Object.assign(IVDiscovery.profiles,c.site.profiles);if(c.site.visualStyles){for(const key of Object.keys(IVDiscovery.visualStyles))delete IVDiscovery.visualStyles[key];Object.assign(IVDiscovery.visualStyles,c.site.visualStyles);}}};
const cmsOriginalHome=home;
home=function(){const html=cmsOriginalHome();if(!catalog.site)return html;const t=document.createElement('template');t.innerHTML=html;const s=catalog.site;
 t.content.querySelector('.intro h1').textContent=s.title;t.content.querySelector('.intro>div>p').textContent=s.description;t.content.querySelector('.intro .eyebrow').textContent=s.eyebrow;
 const gs=discoveryCatalog.games,g=gs[heroIndex];t.content.querySelector('.hero-content>p').textContent=g.pitch;
 t.content.querySelectorAll('.side-card').forEach((el,i)=>{el.querySelector('.side-content p').textContent=gs[i+1].pitch;});return t.innerHTML;};
const cmsOriginalRender=render;
render=function(){cmsOriginalRender();const s=catalog.site;if(!s)return;
 for(const [k,v]of Object.entries(s.colors))document.documentElement.style.setProperty('--'+k,v);
 let theme=document.querySelector('#cms-theme');if(!theme){theme=document.createElement('style');theme.id='cms-theme';document.head.append(theme);}theme.textContent='body{background:var(--bg)!important;color:var(--text)!important}.hero .label,.primary{background:var(--gold)}';
 const nav=document.querySelector('#site-header nav');if(nav){nav.innerHTML=s.navigation.map(n=>`<a href="${esc(n.href)}" ${route()===n.href?'class="active" aria-current="page"':''}>${esc(n.label)}</a>`).join('');}
 document.querySelectorAll('.logo').forEach(el=>{el.innerHTML=(s.logo?`<img src="${esc(s.logo)}" alt="" width="38" height="38" style="object-fit:contain">`:'<span class="logo-icon">✣</span>')+`<span>${esc(s.name)}<b>.</b></span>`;});
 const custom=s.pages.find(p=>p.path===route());if(custom){document.querySelector('#page').innerHTML=`<article class="policy-document"><h1>${esc(custom.title)}</h1>${custom.paragraphs.map(p=>`<p>${esc(p)}</p>`).join('')}</article>`;document.title=custom.title+' — '+s.name;}else document.title=document.title.replace(/Indieverse$/,s.name);
 if(route()==='/')document.title=s.title+' — '+s.name;
 document.querySelector('meta[name="description"]').content=s.description;
 if(!s.playEnabled){document.querySelectorAll('.v8-launch').forEach(e=>e.remove());if(route().startsWith('/play/'))document.querySelector('#page').innerHTML='<div class="empty-state"><h1>Play Lab đang được cập nhật.</h1><a href="/games">Khám phá kho game →</a></div>';}
 if(!s.communityEnabled)document.querySelectorAll('.v8-forum').forEach(e=>e.remove());
 if(sessionStorage.getItem('cms-preview')==='1'){let b=document.querySelector('#cms-preview-banner');if(!b){b=document.createElement('div');b.id='cms-preview-banner';b.style.cssText='position:fixed;bottom:12px;left:12px;z-index:1000;background:#eee0ff;color:#24182e;padding:12px 20px;border-radius:8px;font:14px system-ui';b.innerHTML='BẢN NHÁP — chỉ quản trị viên thấy · <a href="/admin">Về Studio</a> · <button id="cms-exit-preview">Thoát xem trước</button>';document.body.append(b);document.querySelector('#cms-exit-preview').onclick=()=>{sessionStorage.removeItem('cms-preview');location.href='/';};}}
};
const cmsOriginalApi=api;
api=function(url,data){if(!window.INDIEVERSE_PAGES&&url==='/api/catalog'){if(new URLSearchParams(location.search).get('cms-preview')==='1')sessionStorage.setItem('cms-preview','1');if(sessionStorage.getItem('cms-preview')==='1')url+='?preview=1';}return cmsOriginalApi(url,data);};
