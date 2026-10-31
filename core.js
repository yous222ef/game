export function parseImageList(text){
 if(typeof text!=='string')throw Error('Use a plain-text list of image paths.');
 const paths=[...new Set(text.split(/\r?\n/).map(s=>s.trim()).filter(s=>s&&!s.startsWith('#')))];
 if(paths.length<10)throw Error('Add at least 10 unique image paths, one per line.');
 for(const path of paths){const url=new URL(path,'https://example.org/');if(!['https:','http:'].includes(url.protocol))throw Error('Use relative image paths or HTTP(S) URLs.');}
 return {pictures:paths.map(image=>({id:image,image,alt:'Picture to describe'}))};
}

export function pickPicture(pictures,seen,random=Math.random){
 const pool=pictures.filter(p=>!seen.has(p.id));
 return pool.length?pool[Math.floor(random()*pool.length)]:null;
}

// Returns score changes from the current describer's and guesser's perspectives.
export function scoreBluffRound(actuallyLied,guessedLiar){
 if(actuallyLied && !guessedLiar)return {describer:2,guesser:-1,correct:false};
 if(actuallyLied && guessedLiar)return {describer:-1,guesser:1,correct:true};
 if(!actuallyLied && !guessedLiar)return {describer:0,guesser:1,correct:true};
 return {describer:1,guesser:-1,correct:false};
}

export function reachedTarget(scores,target=5){
 return scores.findIndex(score=>score>=target);
}

export function matchWinner(scores){
 return scores[0]===scores[1]?null:scores[0]>scores[1]?0:1;
}
