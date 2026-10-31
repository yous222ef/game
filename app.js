import {createSounds} from './sound.js';
import {parseImageList,pickPicture,bluffWinner,matchWinner} from './core.js';
const $=s=>document.querySelector(s),KEY='picture-duel-v1';
let stored={};try{stored=JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch{}
let seen=new Set(Array.isArray(stored.seen)?stored.seen:[]),names=['Player 1','Player 2'];
let deck,demo,custom=null,state='home',round=0,scores=[0,0],current,currentWasLie=null,deadline=0,clock=null,loadToken=0;
let soundEnabled=stored.soundEnabled!==false;
const sounds=createSounds(soundEnabled);
function updateSoundButton(){const b=$('#sound');b.textContent=soundEnabled?'Sound on':'Sound off';b.setAttribute('aria-pressed',String(soundEnabled));}
updateSoundButton();
document.addEventListener('click',e=>{if(e.target.closest('button, a, input, label')){sounds.unlock();if(!e.target.closest('#sound'))sounds.tap();}},true);
$('#sound').onclick=()=>{soundEnabled=!soundEnabled;sounds.setEnabled(soundEnabled);updateSoundButton();save();if(soundEnabled)sounds.tap();};
function message(title,text){$('#message-title').textContent=title;$('#message-body').textContent=text;if(!$('#message-dialog').open)$('#message-dialog').showModal();}
function notice(s){message('Game notice',s);}
function save(){try{localStorage.setItem(KEY,JSON.stringify({seen:[...seen],imageList:custom,soundEnabled}));}catch{notice('Browser storage is unavailable or full. History may not survive closing this page.');}}
function el(tag,text,cls){const x=document.createElement(tag);if(text!==undefined)x.textContent=text;if(cls)x.className=cls;return x;}
function copy(eyebrow,title,body,art='◈'){const d=el('div',undefined,'copy');if(art)d.append(el('div',art,'art'));d.append(el('span',eyebrow,'eyebrow'),el('h1',title),el('p',body));$('#stage').replaceChildren(d);return d;}
function actions(list){$('#actions').replaceChildren(...list.map(([label,handler,disabled=false])=>{const b=el('button',label);b.disabled=disabled;b.onclick=handler;return b;}));}
function roles(){const describer=(round-1)%2,guesser=1-describer;return {describer,guesser};}
function setVerdictMode(on){document.body.classList.toggle('verdict-mode',on);}
function syncSettingsNames(){names.forEach((n,i)=>{$('#input'+(i+1)).value=n;});}
function header(){names.forEach((n,i)=>{$('#name'+(i+1)).textContent=n;$('#score'+(i+1)).textContent=scores[i];});$('#round').textContent=round?`ROUND ${round} / 10`:'READY TO PLAY';$('#dots').replaceChildren(...Array.from({length:10},(_,i)=>el('i',undefined,i<round-(state==='result'||state==='finished'?0:1)?'done':'')));$('#deck-count').textContent=deck?`${deck.pictures.filter(p=>!seen.has(p.id)).length} unseen`:'';}
function phase(label,hint,time=''){ $('#phase').textContent=label;$('#hint').textContent=hint;$('#timer').textContent=time;$('#timer').classList.remove('urgent');$('#timer').classList.toggle('countdown',/^\d+:\d{2}$/.test(time));header();}
function stop(){clearInterval(clock);clock=null;deadline=0;}
function startTimer(seconds,onEnd){
 stop();sounds.unlock();deadline=Date.now()+seconds*1000;let previous=null;
 $('#timer').classList.add('countdown');
 const tick=()=>{
  const s=Math.max(0,Math.ceil((deadline-Date.now())/1000));
  $('#timer').textContent=`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;
  $('#timer').classList.toggle('urgent',s<=10);
  if(s!==previous){if(s>0&&s<=10)sounds.warning(s);previous=s;}
  if(!s){stop();sounds.finish();onEnd();}
 };
 tick();clock=setInterval(tick,100);
}
function home(){
 stop();loadToken++;setVerdictMode(false);state='home';round=0;scores=[0,0];current=null;currentWasLie=null;
 phase('A GAME OF WORDS & INSTINCT','Enter the two names, then start. Names reset after every refresh.','10 rounds');
 const d=copy('THE TWO-PLAYER BLUFFING GAME','Who is telling the truth?','Player 1 describes first. The phone stays with the describer through the picture, description and questions. Only the final LIAR / NOT A LIAR choice is handed to the other player.');
 const fields=el('div',undefined,'name-entry');
 names.forEach((name,i)=>{const label=el('label',`Player ${i+1}`);const input=el('input');input.maxLength=24;input.value=name;input.autocomplete='off';input.oninput=e=>{names[i]=e.target.value.trim()||`Player ${i+1}`;syncSettingsNames();header();};label.append(input);fields.append(label);});
 d.append(fields);
 const chips=el('div',undefined,'chips');['60s to describe','90s for questions','roles swap every round'].forEach(t=>chips.append(el('span',t)));d.append(chips);
 actions([['Let’s play →',()=>{names=names.map((n,i)=>n.trim()||`Player ${i+1}`);syncSettingsNames();nextRound();}],['How to play',()=>$('#settings-dialog').showModal()]]);
}
function nextRound(){
 stop();setVerdictMode(false);state='ready';currentWasLie=null;
 const p=pickPicture(deck.pictures,seen);
 if(!p){phase('DECK COMPLETE','Your history is saved. Import more pictures, or deliberately replay this deck.');copy('ALL PICTURES SEEN','A fresh deck?','You’ve seen every picture in this deck. Reset its history to continue; your current score is preserved.');actions([['Replay this deck',()=>{deck.pictures.forEach(p=>seen.delete(p.id));save();nextRound();}],['Game settings',()=>$('#settings-dialog').showModal()]]);return;}
 current=p;round++;const {describer,guesser}=roles();
 phase('01 / THE SECRET PICTURE',`Only ${names[describer]} should look at the screen.`,'READY');
 copy(`FOR ${names[describer]}`,'Keep the phone with you.',`Reveal the picture. Then privately choose whether you will tell the truth or lie. ${names[guesser]} should not see the screen.`,'▧');
 actions([['Reveal picture →',reveal]]);
}
async function reveal(){
 if(state!=='ready')return;state='loading';const token=++loadToken;actions([['Loading picture…',()=>{},true]]);const img=new Image();img.alt=current.alt;
 try{
  await new Promise((resolve,reject)=>{const t=setTimeout(()=>reject(Error('Image load timed out.')),20000);img.onload=()=>{clearTimeout(t);resolve();};img.onerror=()=>{clearTimeout(t);reject(Error('Image could not be loaded.'));};img.src=current.image;});
  if(token!==loadToken)return;seen.add(current.id);save();state='commit';const {describer}=roles();$('#stage').replaceChildren(img);
  phase('02 / CHOOSE YOUR STORY',`${names[describer]}, make this choice privately. The picture stays on screen.`,'PRIVATE');
  actions([['I’ll tell the truth',()=>beginDescribe(false)],['I’ll tell a lie',()=>beginDescribe(true)]]);
 }catch(e){if(token!==loadToken)return;state='ready';copy('PICTURE UNAVAILABLE','Let’s try that again.',e.message+' Check the image path or your connection. This picture has not been marked as shown.');actions([['Retry image',reveal],['Choose another picture',()=>{round--;nextRound();}]]);}
}
function beginDescribe(wasLie){
 if(state!=='commit')return;currentWasLie=wasLie;state='describe';const {describer,guesser}=roles();
 phase('03 / DESCRIBE THE PICTURE',`${names[describer]} describes. Keep the picture visible and do not show the screen to ${names[guesser]}.`);
 actions([['Done describing · start questions →',startQuestions]]);
 startTimer(60,startQuestions);
}
function startQuestions(){
 if(state!=='describe')return;stop();state='questions';const {describer,guesser}=roles();
 phase('04 / QUESTION TIME',`${names[guesser]} asks questions aloud. ${names[describer]} keeps the phone and the picture stays visible.`);
 actions([['No more questions →',showVerdict]]);
 startTimer(90,showVerdict);
}
function showVerdict(){
 if(state!=='questions')return;stop();state='verdict';const {guesser}=roles();
 $('#stage').replaceChildren();phase('05 / YOUR VERDICT',`${names[guesser]} gets the phone now.`,'');
 setVerdictMode(true);
 actions([['LIAR',()=>resolveVerdict(true)],['NOT A LIAR',()=>resolveVerdict(false)]]);
}
function resolveVerdict(guessedLiar){
 if(state!=='verdict')return;setVerdictMode(false);state='result';const {describer,guesser}=roles();
 const relativeWinner=bluffWinner(guessedLiar,currentWasLie),winner=relativeWinner===0?describer:guesser;scores[winner]++;
 const correct=relativeWinner===1,actual=currentWasLie?'LIAR':'NOT A LIAR',guess=guessedLiar?'LIAR':'NOT A LIAR';
 phase('06 / THE RESULT',round===10?'The final point is in.':`${names[guesser]} already has the phone and becomes the next describer.`,'ROUND COMPLETE');
 const d=copy(correct?'GOOD CALL':'FOOLED YOU',`${names[winner]} gets the point.`,`${names[guesser]} chose ${guess}. ${names[describer]} was actually ${actual}.`,'');d.classList.add('result');
 if(round===10)actions([['See final scores →',finish]]);else actions([[`Start Round ${round+1} · ${names[guesser]} describes →`,nextRound]]);
}
function finish(){setVerdictMode(false);state='finished';const winner=matchWinner(scores);phase('THE FINAL SCORE','Ten pictures. One great game.','MATCH COMPLETE');copy('THAT’S A WRAP',winner===null?'An even match!':`${names[winner]} wins!`,`${names[0]} ${scores[0]} — ${scores[1]} ${names[1]}. ${winner===null?'A 5–5 draw. Time for a rematch?':'Ready to run it back?'}`,'✦');actions([['Play again →',home],['Game settings',()=>$('#settings-dialog').showModal()]]);}
$('#settings').onclick=()=>{if(['loading','describe','questions','verdict'].includes(state)){notice('Finish this timed round before opening settings.');return;}syncSettingsNames();$('#settings-dialog').showModal();};
$('#fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();else message('Fullscreen isn’t available','Your browser does not support fullscreen here. The game still fits this window. On supported phones, use your browser’s Add to Home Screen option for an immersive view.');}catch{message('Fullscreen couldn’t start','Your browser blocked the fullscreen request. You can keep playing in this window—the game automatically fits the available display.');}};
[0,1].forEach(i=>{$('#input'+(i+1)).oninput=e=>{names[i]=e.target.value.trim()||`Player ${i+1}`;header();};});
$('#settings-dialog').addEventListener('close',()=>{if(state==='home')home();});
$('#clear').onclick=()=>{if(confirm('Clear all shown-picture history? Previously seen pictures can appear again.')){seen.clear();save();header();$('#settings-status').textContent='Shown-picture history cleared.';}};
$('#restart').onclick=()=>{if(confirm('End the current match and reset scores? Picture history will be kept.')){home();$('#settings-dialog').close();}};
$('#restore').onclick=()=>{if(confirm('Use the built-in image list and restart the match?')){deck=demo;custom=null;save();home();$('#settings-dialog').close();}};
$('#import').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{if(f.size>10*1024*1024)throw Error('Please use an image list smaller than 10 MB.');const text=await f.text(),next=parseImageList(text);if(!confirm(`Load ${next.pictures.length} pictures and reset the current match?`))return;deck=next;custom=text;save();home();$('#settings-dialog').close();notice('Image list loaded.');}catch(err){$('#settings-status').textContent=err.message;}finally{e.target.value='';}};
try{const r=await fetch('./images.txt');if(!r.ok)throw Error('Cannot load images.txt.');demo=parseImageList(await r.text());deck=demo;
for(const id of [...seen])if(/^demo-\d+$/.test(id)){seen.add(`images/${id}.svg`);seen.delete(id);}
if(typeof stored.imageList==='string'){try{deck=parseImageList(stored.imageList);custom=stored.imageList;}catch{notice('Saved image list was invalid. Using the built-in list.');}}
save();syncSettingsNames();home();}catch(e){copy('SETUP NEEDED','The pictures couldn’t load.',`${e.message} Serve this folder using GitHub Pages or a local web server.`);actions([['Reload',()=>location.reload()]]);}
