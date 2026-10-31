export function validateDeck(data){
 if(!data||!Array.isArray(data.pictures)||data.pictures.length<10)throw Error('A deck needs at least 10 pictures.');
 const ids=new Set();
 const pictures=data.pictures.map(p=>{
  if(!p||typeof p.id!=='string'||!p.id.trim()||ids.has(p.id))throw Error('Every picture needs a unique nonempty id.');
  ids.add(p.id);
  if(typeof p.image!=='string'||!p.image.trim()||!Array.isArray(p.options)||p.options.length!==2||p.options.some(s=>typeof s!=='string'||!s.trim()||s.length>100))throw Error('Each picture needs an image and exactly two labels (1–100 characters).');
  const url=new URL(p.image,'https://example.org/');if(!['https:','http:'].includes(url.protocol))throw Error('Use relative image paths or HTTP(S) URLs.');
  const answer=data.answers?.[p.id];if(answer!==0&&answer!==1)throw Error('Each answer must be 0 (left) or 1 (right).');
  return {id:p.id,image:p.image,options:[...p.options],alt:typeof p.alt==='string'?p.alt:'Picture to describe'};
 });return {pictures,answers:Object.fromEntries(pictures.map(p=>[p.id,data.answers[p.id]]))};
}
export function pickPicture(pictures,seen,random=Math.random){const pool=pictures.filter(p=>!seen.has(p.id));return pool.length?pool[Math.floor(random()*pool.length)]:null;}
export function roundWinner(answer,choice){return choice===answer?1:0;}
export function matchWinner(scores){return scores[0]===scores[1]?null:scores[0]>scores[1]?0:1;}
