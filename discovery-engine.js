(function(root){
  const axes=['Khám phá','Câu chuyện','Thử thách','Xây dựng','Chịu grind','Chịu kinh dị','Đối kháng','Thử nghiệm'];
  // Editorial descriptors, not measured player statistics. Session lengths are suggestions.
  const rows=[
    ['a-short-hike',[5,2,1,0,0,0,0,3],15,'calm','low','explore',false,'Đi bộ, leo và lượn; hợp một chuyến đi ngắn không cần tối ưu.'],
    ['stardew-valley',[3,3,1,5,4,0,0,4],30,'calm','low','build',true,'Một ngày ở nông trại tạo điểm nghỉ tự nhiên; vẫn cần để ý giờ ngủ.'],
    ['core-keeper',[5,1,3,5,4,1,0,5],45,'curious','medium','build',true,'Đào, chế tạo và dựng căn cứ; tiến độ gắn với thu thập tài nguyên.'],
    ['outer-wilds',[5,5,2,0,0,1,0,5],30,'curious','high','explore',false,'Đi theo manh mối trong một chu kỳ; nên có thời gian nhớ và nối chi tiết.'],
    ['tunic',[5,3,4,0,1,1,0,5],45,'curious','high','explore',false,'Đọc cẩm nang và tìm lối ẩn; chiến đấu cần tập trung.'],
    ['hollow-knight',[5,3,5,0,2,2,0,3],45,'intense','high','explore',false,'Đường đi liên thông và boss khó; không phải lựa chọn ít áp lực.'],
    ['celeste',[2,4,5,0,0,0,0,3],15,'intense','high','combat',false,'Thử lại nhanh từng căn phòng; Assist Mode cho phép điều chỉnh thử thách.'],
    ['hades',[2,5,4,0,2,1,0,5],45,'intense','high','combat',false,'Một lượt vượt ngục và các cuộc trò chuyện nối tiếp sau thất bại.'],
    ['dead-cells',[3,1,5,0,3,2,0,5],45,'intense','high','combat',false,'Vũ khí thay đổi nhịp tấn công; lượt chơi cần phản xạ liên tục.'],
    ['nine-sols',[4,5,5,0,1,3,0,3],45,'intense','high','combat',false,'Phản đòn đúng nhịp là trung tâm; truyện có bạo lực và chủ đề nặng.'],
    ['coffee-talk',[0,5,0,0,0,0,0,2],15,'calm','low','story',false,'Pha đồ uống và đọc hội thoại, không có áp lực phản xạ.'],
    ['a-space-for-the-unbound',[3,5,1,0,0,2,0,2],30,'curious','medium','story',false,'Khám phá thị trấn Indonesia và ký ức nhân vật; có chủ đề sức khỏe tinh thần.'],
    ['gris',[3,3,1,0,0,0,0,2],30,'calm','low','explore',false,'Chuyển động và màu sắc kể về mất mát; ít áp lực thất bại.'],
    ['hoa',[3,2,1,0,0,0,0,2],15,'calm','low','explore',false,'Đi qua thiên nhiên vẽ tay bằng các bước nhảy nhẹ nhàng.'],
    ['baba-is-you',[1,0,4,0,0,0,0,5],15,'curious','high','puzzle',false,'Di chuyển câu chữ để sửa luật; ít thao tác nhưng cần suy luận.'],
    ['cocoon',[4,2,2,0,0,1,0,5],30,'curious','high','puzzle',false,'Mang thế giới trong quả cầu và nối các quy luật không gian.'],
    ['return-of-the-obra-dinn',[4,5,3,0,0,3,0,4],45,'curious','high','puzzle',false,'Quan sát hiện trường và xác định danh tính; cần ghi nhớ nhiều người.'],
    ['slay-the-spire',[1,1,4,0,2,1,0,5],45,'curious','high','puzzle',false,'Lựa chọn lá bài và đường đi; mỗi lượt là một bài toán đánh đổi.'],
    ['balatro',[0,0,3,0,1,0,0,5],30,'curious','medium','puzzle',false,'Ghép Joker với tay bài để tạo chuỗi điểm; không chơi poker đối kháng.'],
    ['noita',[5,1,5,0,1,2,0,5],30,'intense','high','combat',false,'Vật liệu và phép thuật tương tác khó lường; thất bại có thể đến rất nhanh.'],
    ['dredge',[4,4,2,0,2,4,0,3],30,'curious','medium','explore',false,'Câu cá, sắp khoang và chọn giờ về cảng trước khi đêm xuống.'],
    ['sifu',[1,3,5,0,1,1,0,4],30,'intense','high','combat',false,'Đọc đòn và giữ vị trí; hệ tuổi tác khiến mỗi lần gục có giá.'],
    ['sanabi',[3,5,4,0,0,2,0,4],30,'intense','high','combat',false,'Móc kéo biến di chuyển thành chuỗi hành động xuyên thành phố.'],
    ['broforce',[1,1,3,0,0,1,0,4],15,'intense','medium','combat',true,'Màn ngắn, môi trường phá hủy và co-op hỗn loạn.']
  ];
  const profiles=Object.fromEntries(rows.map(([slug,vector,minutes,mood,energy,activity,coop,reason])=>[slug,{slug,vector,minutes,mood,energy,activity,coop,reason}]));
  const visualStyles={
    'a-short-hike':['low-poly','pastel','nature'],'stardew-valley':['pixel','warm','nature'],'core-keeper':['pixel','warm','underground'],'outer-wilds':['low-poly','space','warm'],'tunic':['low-poly','pastel','fantasy'],'hollow-knight':['hand-drawn','dark','fantasy'],'celeste':['pixel','pastel','mountain'],'hades':['hand-drawn','high-contrast','fantasy'],'dead-cells':['pixel','dark','fantasy'],'nine-sols':['hand-drawn','dark','fantasy'],'coffee-talk':['pixel','warm','urban'],'a-space-for-the-unbound':['pixel','warm','urban'],'gris':['hand-drawn','pastel','nature'],'hoa':['hand-drawn','pastel','nature'],'baba-is-you':['pixel','minimal'],'cocoon':['low-poly','minimal','fantasy'],'return-of-the-obra-dinn':['monochrome','high-contrast','minimal'],'slay-the-spire':['hand-drawn','fantasy'],'balatro':['pixel','high-contrast'],'noita':['pixel','dark','fantasy'],'dredge':['low-poly','dark','nature'],'sifu':['low-poly','urban','high-contrast'],'sanabi':['pixel','urban','high-contrast'],'broforce':['pixel','urban','high-contrast']
  };
  function visualNeighbor(slug,excluded=[]){const tags=visualStyles[slug]||[];return Object.keys(profiles).filter(s=>s!==slug&&!excluded.includes(s)).map(s=>({slug:s,shared:(visualStyles[s]||[]).filter(t=>tags.includes(t))})).sort((a,b)=>b.shared.length-a.shared.length||a.slug.localeCompare(b.slug))[0];}
  const reasons={'grind':'Quá nhiều grind','repetition':'Lối chơi lặp lại','story':'Truyện chậm','difficulty':'Quá khó','easy':'Quá dễ','ui':'Giao diện khó dùng','technical':'Lỗi kỹ thuật','time':'Không còn thời gian','fit':'Không hợp lối chơi','length':'Game quá dài'};
  function recommend({minutes=60,mood='',energy='',activity='',coop='',like='',positive=0,avoid=-1}={}){
    return rows.map(([slug])=>profiles[slug]).filter(p=>p.slug!==like&&p.minutes<=Number(minutes)&&(!coop||coop!=='yes'||p.coop)).map(p=>{
      let score=(p.mood===mood?4:0)+(p.energy===energy?4:0)+(p.activity===activity?5:0);
      if(like&&profiles[like])score+=5-Math.abs(p.vector[positive]-profiles[like].vector[positive]);
      if(Number(avoid)>=0)score-=p.vector[Number(avoid)]*2;
      return {...p,score};
    }).sort((a,b)=>b.score-a.score||a.slug.localeCompare(b.slug));
  }
  function dna(library={},journal=[],dropped={}){
    const sums=axes.map(()=>0),weights=axes.map(()=>0);let evidence=0;
    for(const [slug,e] of Object.entries(library)){
      const p=profiles[slug];if(!p)continue;
      const hours=journal.filter(j=>j.slug===slug).reduce((n,j)=>Math.max(n,Number(j.hours)||0),0);
      const w=(e.status==='wishlist'?.25:e.status==='completed'?2:1)*(e.rating==null?1:Math.max(.1,Number(e.rating)/5))*(1+Math.min(hours,50)/50);
      const dropAxis={grind:4,difficulty:2,easy:2,story:1};
      p.vector.forEach((v,i)=>{let value=v;const reason=dropped[slug]?.reason;if(dropAxis[reason]===i)value=reason==='easy'?5:Math.max(0,v-2);const favorites=journal.filter(j=>j.slug===slug&&j.focus!==undefined&&j.focus!==''&&Number(j.focus)===i).length;if(favorites)value=Math.min(5,value+Math.min(2,favorites));sums[i]+=value*w;weights[i]+=w;});evidence++;
    }
    return {evidence,values:sums.map((n,i)=>weights[i]?Math.round(n/weights[i]*20):null)};
  }
  const api={axes,profiles,reasons,recommend,dna,visualStyles,visualNeighbor};
  if(typeof module!=='undefined')module.exports=api;else root.IVDiscovery=api;
})(typeof window!=='undefined'?window:globalThis);
