const {test}=require('node:test'),assert=require('node:assert/strict');
const {cards,render}=require('./review-perspectives.js'),catalog=require('./data/catalog.cjs');
test('every game has twenty distinct, game-specific 1–5 star editorial angles',()=>{
 for(const g of catalog.games){const rows=cards(g);assert.equal(rows.length,20,g.slug);assert.equal(new Set(rows.map(r=>r.body)).size,20,g.slug);assert(rows.every(r=>r.stars>=1&&r.stars<=5&&r.body.length>=70),g.slug);}
});
test('review-like cards disclose editorial origin and link real player reviews',()=>{
 for(const g of [catalog.games[0],catalog.games[249]]){const html=render(g,s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;'));assert.equal((html.match(/class="iv-lens"/g)||[]).length,20);assert.match(html,/không phải đánh giá của 20 người chơi/);assert.match(html,new RegExp('store.steampowered.com/app/'+g.app+'/'));}
});
