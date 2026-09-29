/* Short editorial lenses. These are never presented as reviews by real players. */
(function(root){
  const split=text=>String(text||'').replace(/\s+/g,' ').trim().match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map(s=>s.trim()).filter(s=>s.length>=24)||[];
  const unique=xs=>[...new Set(xs.filter(Boolean))];
  const lensNames=['Điều gây tò mò','Trong lúc chơi','Chi tiết đáng nhớ','Trước khi chọn'];
  function sectionAngles(g,section,index){
    const own=unique(section.paragraphs.flatMap(split));
    const surrounding=unique(g.sections.filter((_,i)=>i!==index).flatMap(s=>s.paragraphs.flatMap(split)));
    const choices=[
      [own[0],own[1]||surrounding[index%surrounding.length]],
      [own[1]||own[0],own[2]||surrounding[(index+1)%surrounding.length]],
      [own[2]||own[0],own[3]||surrounding[(index+2)%surrounding.length]],
      [own[3]||own[1]||own[0],surrounding[(index+3)%surrounding.length]]
    ];
    return choices.map(([a,b],i)=>({title:lensNames[i]+' · '+section.title,body:unique([a,b]).join(' ')}));
  }
  function cards(g){
    const intro=split(g.lede)[0]||g.pitch;
    const end=split(g.verdict)[0]||g.verdict;
    const out=[
      {title:'Ấn tượng đầu',body:intro,stars:4,kind:'MỞ ĐẦU'},
      {title:'Khi đúng gu',body:g.fit,stars:5,kind:'HỢP GU'},
      {title:'Khi cần cân nhắc',body:g.caution,stars:1,kind:'ĐIỂM NGẠI'},
      {title:'Điều còn ở lại',body:end,stars:4,kind:'SAU CÙNG'}
    ];
    g.sections.forEach((s,i)=>sectionAngles(g,s,i).forEach((angle,j)=>out.push({
      title:angle.title,body:angle.body,stars:[4,5,3,2][j],kind:'GÓC '+(i+1).toString().padStart(2,'0')+' · '+(j+1)
    })));
    if(out.length!==20)throw Error('Game '+g.slug+' needs 20 editorial angles; got '+out.length);
    const used=new Set();
    return out.map((r,i)=>{let body=r.body;const group=i===2||i===3?3:Math.max(0,Math.floor((i-4)/4))%4;const related=g.sections[group];if(body.length<95){const extra=split(related.paragraphs.join(' ')).find(s=>!body.includes(s));if(extra)body+=' '+extra;}for(let step=0;used.has(body)&&step<4;step++){const next=g.sections[(group+step+1)%g.sections.length],other=split(next.paragraphs[0])[0]||next.title;body=r.body+' '+other;}used.add(body);return {...r,body,id:i+1};});
  }
  function render(g,esc){const rows=cards(g);return `<section class="iv-lenses" id="reader-perspectives" data-visible="6" data-stars="all"><div class="iv-lenses-head"><div><span class="eyebrow">20 GÓC NHÌN / ${esc(g.name)}</span><h2>Đọc nhanh trước khi chơi.</h2><p>20 nhận định ngắn do bàn biên tập Indieverse viết từ bài phân tích của chính game này. Đây không phải đánh giá của 20 người chơi.</p></div><a href="https://store.steampowered.com/app/${g.app}/#app_reviews_hash" target="_blank" rel="noopener">Đánh giá người chơi thật trên Steam ↗</a></div><div class="iv-lenses-scale"><strong>Sao hợp gu</strong><span>1 = nên cân nhắc kỹ · 5 = rất hợp với góc nhìn này. Không phải điểm chất lượng hay điểm cộng đồng.</span></div><div class="iv-lenses-filter" role="group" aria-label="Lọc góc nhìn theo số sao">${[['all','Tất cả'],[5,'5 sao'],[4,'4 sao'],[3,'3 sao'],[2,'2 sao'],[1,'1 sao']].map(([n,t])=>`<button type="button" data-lens-stars="${n}" aria-pressed="${n==='all'}">${t}</button>`).join('')}</div><div class="iv-lenses-grid">${rows.map((r,i)=>`<article class="iv-lens" data-stars="${r.stars}" ${i>=6?'hidden':''}><div class="iv-lens-head"><span class="iv-lens-avatar" aria-hidden="true">${String(r.id).padStart(2,'0')}</span><div><span class="iv-lens-author">Góc nhìn biên tập ${String(r.id).padStart(2,'0')}</span><small>${esc(r.kind)} · ${esc(g.name)}</small></div></div><div class="iv-lens-stars" aria-label="${r.stars} trên 5 sao hợp gu"><span>${'★'.repeat(r.stars)}</span><i>${'☆'.repeat(5-r.stars)}</i><b>${r.stars}/5</b></div><h3>${esc(r.title)}</h3><p>${esc(r.body)}</p></article>`).join('')}</div><button class="iv-lenses-more outline-button" type="button" data-lens-more>Xem thêm góc nhìn ↓</button><p class="iv-lenses-count" aria-live="polite">Đang xem 6 / 20 góc nhìn biên tập.</p></section>`;}
  if(typeof document!=='undefined')document.addEventListener('click',e=>{const button=e.target.closest('[data-lens-stars],[data-lens-more]');if(!button)return;const section=button.closest('.iv-lenses');if(!section)return;if(button.hasAttribute('data-lens-stars')){section.dataset.stars=button.dataset.lensStars;section.dataset.visible='6';}else section.dataset.visible=String(Number(section.dataset.visible)+6);const star=section.dataset.stars,matching=[...section.querySelectorAll('.iv-lens')].filter(card=>star==='all'||card.dataset.stars===star),limit=Number(section.dataset.visible);for(const card of section.querySelectorAll('.iv-lens'))card.hidden=true;matching.forEach((card,i)=>card.hidden=i>=limit);section.querySelectorAll('[data-lens-stars]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.lensStars===star)));section.querySelector('[data-lens-more]').hidden=matching.length<=limit;section.querySelector('.iv-lenses-count').textContent='Đang xem '+Math.min(limit,matching.length)+' / '+matching.length+' góc nhìn biên tập.';});
  const api={cards,render};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.IVPerspectives=api;
})(typeof window!=='undefined'?window:globalThis);
