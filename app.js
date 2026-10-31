import {createSounds} from './sound.js';
import {parseImageList,pickPicture,scoreBluffRound,reachedTarget,matchWinner} from './core.js';

const $=s=>document.querySelector(s),KEY='picture-duel-v1',TARGET=5;
let stored={};try{stored=JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch{}
let language=stored.language==='ar'?'ar':'en';
let seen=new Set(Array.isArray(stored.seen)?stored.seen:[]);
let names=language==='ar'?['اللاعب 1','اللاعب 2']:['Player 1','Player 2']; // Intentionally reset on every refresh.
let deck,demo,custom=null,state='home',round=0,scores=[0,0],current,currentWasLie=null,lastResult=null,deadline=0,clock=null,loadToken=0;
let soundEnabled=stored.soundEnabled!==false;
const sounds=createSounds(soundEnabled);

const S={
 en:{
  title:'Picture Duel · Liar or Truthful?',brand:'PICTURE DUEL',switchLang:'العربية',soundOn:'Sound on',soundOff:'Sound off',fullscreen:'Toggle fullscreen',
  player1:'PLAYER 1',player2:'PLAYER 2',defaultP1:'Player 1',defaultP2:'Player 2',ready:'READY',firstTo5:'FIRST TO 5',round:'ROUND {round} · FIRST TO 5',unseen:'{count} unseen',bottom:'DESCRIBE. QUESTION. BLUFF.',settings:'Game & deck settings',
  homePhase:'A GAME OF WORDS & INSTINCT',homeHint:'Enter the two names, then start.',homeEyebrow:'THE TWO-PLAYER BLUFFING GAME',homeTitle:'Who is telling the truth?',homeBody:'Player 1 describes first. The describer keeps the phone while the picture is visible. After the question timer ends, the other player gets the phone and chooses LIAR or TRUTHFUL.',chip1:'60s to describe',chip2:'90s for questions',chip3:'first to 5 wins',letsPlay:'Let’s play →',howTo:'How to play',
  secretPhase:'01 / THE SECRET PICTURE',onlyLook:'Only {name} should look at the screen.',forName:'FOR {name}',keepPhone:'Keep the phone with you.',secretBody:'Reveal the picture. Then privately choose whether you will tell the truth or lie. {other} should not see the screen.',reveal:'Reveal picture →',loading:'Loading picture…',
  choosePhase:'02 / CHOOSE YOUR STORY',chooseHint:'{name}, make this choice privately. The picture stays on screen.',private:'PRIVATE',truthChoice:'I’ll tell the truth',lieChoice:'I’ll tell a lie',
  describePhase:'03 / DESCRIBE THE PICTURE',describeHint:'{name} describes. Keep the picture visible and do not show the screen to {other}.',doneDescribe:'Done describing · start questions →',
  questionPhase:'04 / QUESTION TIME',questionHint:'{guesser} asks questions aloud. {describer} keeps the phone and the picture stays visible for the full 1:30.',noMore:'No more questions →',
  verdictPhase:'05 / YOUR VERDICT',verdictHint:'Give the phone to {name}. The picture is now hidden.',liar:'LIAR',truthful:'TRUTHFUL',
  resultPhase:'06 / THE RESULT',resultHint:'{name} can see the real picture now before starting their turn.',correct:'CORRECT!',wrong:'WRONG!',actualLiar:'LIAR',actualTruth:'TRUTHFUL',resultBody:'{guesser} chose {guess}. {describer} was actually {actual}. Score change: {describer} {dDelta}, {guesser} {gDelta}.',startNext:'Start Round {round} · {name} describes →',showWinner:'Show winner →',
  finalPhase:'THE FINAL SCORE',finalHint:'First player to 5 wins.',complete:'MATCH COMPLETE',winnerTitle:'{name} wins!',winnerBody:'Final score: {p1} {s1} — {s2} {p2}.',playAgain:'Play again →',
  deckPhase:'DECK COMPLETE',deckHint:'Your history is saved. Replay the deck to keep the same match going.',deckEyebrow:'ALL PICTURES SEEN',deckTitle:'Need more pictures?',deckBody:'Every picture in this deck has been used. You can replay the deck without resetting the current score.',replay:'Replay this deck',
  unavailable:'PICTURE UNAVAILABLE',tryAgain:'Let’s try that again.',retry:'Retry image',another:'Choose another picture',
  settingsTitle:'Game settings',name1Label:'Player 1 name',name2Label:'Player 2 name',namesNote:'Names are not saved. Every refresh starts again with Player 1 and Player 2, and you can change them here at any time between active timed phases.',flowNote:'The picture remains visible during description and the full 90-second question phase. When the timer ends, or the describer presses No more questions, the picture disappears and the phone goes to the guesser for the verdict.',scoringNote:'First to 5 wins. Lie + believed: describer +2, guesser −1. Lie + caught: describer −1, guesser +1. Truth + believed: guesser +1. Truth + doubted: describer +1, guesser −1.',importLabel:'Import image list (.txt)',restore:'Use built-in image list',clear:'Clear shown-picture history',restart:'End match & start again',done:'Done',
  noticeTitle:'Game notice',settingsBlocked:'Finish this active round phase before opening settings.',clearConfirm:'Clear all shown-picture history? Previously seen pictures can appear again.',clearDone:'Shown-picture history cleared.',restartConfirm:'End the current match and reset scores? Picture history will be kept.',restoreConfirm:'Use the built-in image list and restart the match?',importConfirm:'Load {count} pictures and reset the current match?',importDone:'Image list loaded.',tooLarge:'Please use an image list smaller than 10 MB.',
  storageError:'Browser storage is unavailable or full. History may not survive closing this page.',fullscreenUnavailable:'Fullscreen isn’t available',fullscreenUnavailableBody:'Your browser does not support fullscreen here. The game still fits this window.',fullscreenBlocked:'Fullscreen couldn’t start',fullscreenBlockedBody:'Your browser blocked the fullscreen request. You can keep playing in this window.',gotIt:'Got it',setupNeeded:'SETUP NEEDED',picturesLoadFail:'The pictures couldn’t load.',reload:'Reload'
 },
 ar:{
  title:'تحدي الصورة · كذاب ولا صادق؟',brand:'تحدي الصورة',switchLang:'English',soundOn:'الصوت شغال',soundOff:'الصوت مقفول',fullscreen:'ملء الشاشة',
  player1:'اللاعب 1',player2:'اللاعب 2',defaultP1:'اللاعب 1',defaultP2:'اللاعب 2',ready:'جاهز',firstTo5:'أول واحد يوصل 5',round:'الجولة {round} · أول واحد يوصل 5',unseen:'{count} صورة متبقية',bottom:'اوصف. اسأل. اكشف الكدب.',settings:'إعدادات اللعبة والصور',
  homePhase:'لعبة وصف وكدب وتخمين',homeHint:'اكتب اسمي اللاعبين وابدأ.',homeEyebrow:'لعبة خداع لشخصين',homeTitle:'مين بيقول الحقيقة؟',homeBody:'اللاعب 1 يبدأ بالشرح. الشخص اللي بيشرح يحتفظ بالموبايل طول ما الصورة ظاهرة. بعد انتهاء وقت الأسئلة، يدي الموبايل للشخص التاني عشان يختار كذاب أو صادق.',chip1:'60 ثانية للشرح',chip2:'90 ثانية للأسئلة',chip3:'أول واحد يوصل 5 يكسب',letsPlay:'ابدأ اللعبة ←',howTo:'طريقة اللعب',
  secretPhase:'01 / الصورة السرية',onlyLook:'{name} فقط هو اللي يبص على الشاشة.',forName:'لـ {name}',keepPhone:'خلي الموبايل معاك.',secretBody:'اظهر الصورة، وبعدها اختار في السر هل هتقول الحقيقة ولا هتكدب. {other} مايبصش على الشاشة.',reveal:'اظهر الصورة ←',loading:'جاري تحميل الصورة…',
  choosePhase:'02 / اختار هتعمل إيه',chooseHint:'{name}، اختار في السر. الصورة هتفضل ظاهرة.',private:'اختيار سري',truthChoice:'هقول الحقيقة',lieChoice:'هكدب',
  describePhase:'03 / اوصف الصورة',describeHint:'{name} بيشرح. خلي الصورة ظاهرة وماتوريش الشاشة لـ {other}.',doneDescribe:'خلصت الشرح · ابدأ الأسئلة ←',
  questionPhase:'04 / وقت الأسئلة',questionHint:'{guesser} يسأل بصوت عالي. {describer} يحتفظ بالموبايل والصورة تفضل ظاهرة طول الدقيقة ونص.',noMore:'مفيش أسئلة تانية ←',
  verdictPhase:'05 / اختار حكمك',verdictHint:'ادي الموبايل لـ {name}. الصورة اختفت دلوقتي.',liar:'كذاب',truthful:'صادق',
  resultPhase:'06 / النتيجة',resultHint:'{name} يشوف الصورة الحقيقية دلوقتي قبل ما يبدأ دوره.',correct:'اختيار صح!',wrong:'اختيار غلط!',actualLiar:'كذاب',actualTruth:'صادق',resultBody:'{guesser} اختار {guess}. {describer} كان فعلاً {actual}. تغيير النقط: {describer} {dDelta}، {guesser} {gDelta}.',startNext:'ابدأ الجولة {round} · {name} هو اللي هيشرح ←',showWinner:'اعرض الفائز ←',
  finalPhase:'النتيجة النهائية',finalHint:'أول لاعب يوصل 5 نقاط يكسب.',complete:'انتهت المباراة',winnerTitle:'{name} كسب!',winnerBody:'النتيجة النهائية: {p1} {s1} — {s2} {p2}.',playAgain:'العب من جديد ←',
  deckPhase:'الصور خلصت',deckHint:'سجل الصور محفوظ. ممكن تعيد نفس الصور وتكمل بنفس النتيجة.',deckEyebrow:'كل الصور اتعرضت',deckTitle:'محتاج صور أكتر؟',deckBody:'استخدمت كل الصور الموجودة. تقدر تعيد الصور من غير ما تصفر النقط.',replay:'أعد استخدام الصور',
  unavailable:'الصورة مش متاحة',tryAgain:'نجرب تاني.',retry:'حاول تحميل الصورة تاني',another:'اختار صورة تانية',
  settingsTitle:'إعدادات اللعبة',name1Label:'اسم اللاعب 1',name2Label:'اسم اللاعب 2',namesNote:'الأسماء مش بتتحفظ. مع كل Refresh هترجع الأسماء الافتراضية، وتقدر تغيرها من هنا في أي وقت بين المراحل اللي فيها مؤقت.',flowNote:'الصورة تفضل ظاهرة أثناء الشرح وطول الـ90 ثانية بتوع الأسئلة. لما الوقت يخلص، أو اللي بيشرح يدوس مفيش أسئلة تانية، الصورة تختفي والموبايل يروح للشخص التاني عشان يختار كذاب أو صادق.',scoringNote:'أول واحد يوصل 5 يكسب. كدب والتاني صدقه: الشارح +2 والمخمن −1. كدب واتكشف: الشارح −1 والمخمن +1. قال الحقيقة واتصدق: المخمن +1. قال الحقيقة والتاني كذبه: الشارح +1 والمخمن −1.',importLabel:'استيراد قائمة صور (.txt)',restore:'استخدم قائمة الصور الأصلية',clear:'امسح سجل الصور اللي ظهرت',restart:'انهي المباراة وابدأ من جديد',done:'تم',
  noticeTitle:'تنبيه اللعبة',settingsBlocked:'كمّل المرحلة الحالية الأول قبل ما تفتح الإعدادات.',clearConfirm:'تمسح سجل كل الصور اللي ظهرت؟ الصور القديمة ممكن تظهر تاني.',clearDone:'تم مسح سجل الصور.',restartConfirm:'تنهي المباراة الحالية وتصفر النقط؟ سجل الصور هيفضل محفوظ.',restoreConfirm:'تستخدم قائمة الصور الأصلية وتبدأ المباراة من جديد؟',importConfirm:'تحمّل {count} صورة وتبدأ المباراة من جديد؟',importDone:'تم تحميل قائمة الصور.',tooLarge:'استخدم ملف قائمة صور أصغر من 10 MB.',
  storageError:'مساحة التخزين في المتصفح غير متاحة أو ممتلئة. سجل الصور ممكن مايتحفظش بعد قفل الصفحة.',fullscreenUnavailable:'ملء الشاشة غير متاح',fullscreenUnavailableBody:'المتصفح ده لا يدعم ملء الشاشة هنا، لكن اللعبة هتفضل مناسبة لحجم النافذة.',fullscreenBlocked:'تعذر تشغيل ملء الشاشة',fullscreenBlockedBody:'المتصفح منع تشغيل ملء الشاشة. تقدر تكمل اللعب عادي.',gotIt:'تمام',setupNeeded:'محتاج إعداد',picturesLoadFail:'تعذر تحميل الصور.',reload:'إعادة تحميل'
 }
};

function t(key,vars={}){
 let value=(S[language]&&S[language][key])??S.en[key]??key;
 return String(value).replace(/\{(\w+)\}/g,(_,k)=>vars[k]??`{${k}}`);
}
function defaultName(i){return t(i===0?'defaultP1':'defaultP2');}
function signed(n){return n>0?`+${n}`:String(n);}
function save(){try{localStorage.setItem(KEY,JSON.stringify({seen:[...seen],imageList:custom,soundEnabled,language}));}catch{notice(t('storageError'));}}
function el(tag,text,cls){const x=document.createElement(tag);if(text!==undefined)x.textContent=text;if(cls)x.className=cls;return x;}
function copy(eyebrow,title,body,art='◈'){
 const d=el('div',undefined,'copy');
 if(art)d.append(el('div',art,'art'));
 d.append(el('span',eyebrow,'eyebrow'),el('h1',title),el('p',body));
 $('#stage').replaceChildren(d);return d;
}
function actions(list){$('#actions').replaceChildren(...list.map(([label,handler,disabled=false])=>{const b=el('button',label);b.disabled=disabled;b.onclick=handler;return b;}));}
function roles(){const describer=(round-1)%2,guesser=1-describer;return {describer,guesser};}
function setVerdictMode(on){document.body.classList.toggle('verdict-mode',on);}
function syncSettingsNames(){names.forEach((n,i)=>{$('#input'+(i+1)).value=n;});}
function header(){
 names.forEach((n,i)=>{$('#name'+(i+1)).textContent=n;$('#score'+(i+1)).textContent=scores[i];});
 $('#round').textContent=round?t('round',{round}):t('firstTo5');
 $('#dots').replaceChildren();
 $('#deck-count').textContent=deck?t('unseen',{count:deck.pictures.filter(p=>!seen.has(p.id)).length}):'';
}
function phase(label,hint,time){
 $('#phase').textContent=label;$('#hint').textContent=hint;
 if(time!==undefined){$('#timer').textContent=time;$('#timer').classList.remove('urgent');$('#timer').classList.toggle('countdown',/^\d+:\d{2}$/.test(time));}
 header();
}
function stop(){clearInterval(clock);clock=null;deadline=0;}
function startTimer(seconds,onEnd){
 stop();sounds.unlock();deadline=Date.now()+seconds*1000;let previous=null;$('#timer').classList.add('countdown');
 const tick=()=>{
  const s=Math.max(0,Math.ceil((deadline-Date.now())/1000));
  $('#timer').textContent=`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;
  $('#timer').classList.toggle('urgent',s<=10);
  if(s!==previous){if(s>0&&s<=10)sounds.warning(s);previous=s;}
  if(!s){stop();sounds.finish();onEnd();}
 };
 tick();clock=setInterval(tick,100);
}
function updateSoundButton(){const b=$('#sound');b.textContent=t(soundEnabled?'soundOn':'soundOff');b.setAttribute('aria-pressed',String(soundEnabled));}
function applyStaticLanguage(){
 document.documentElement.lang=language;document.documentElement.dir=language==='ar'?'rtl':'ltr';document.body.classList.toggle('rtl',language==='ar');document.title=t('title');
 $('#brand-label').textContent=t('brand');$('#lang-toggle').textContent=t('switchLang');updateSoundButton();$('#fullscreen').setAttribute('aria-label',t('fullscreen'));
 $('#role1').textContent=t('player1');$('#role2').textContent=t('player2');$('#bottom-tag').textContent=t('bottom');$('#settings').textContent=t('settings');
 $('#settings-title').textContent=t('settingsTitle');$('#settings-name1-label').textContent=t('name1Label');$('#settings-name2-label').textContent=t('name2Label');
 $('#settings-names-note').textContent=t('namesNote');$('#settings-flow-note').textContent=t('flowNote');$('#settings-scoring-note').textContent=t('scoringNote');$('#import-label').textContent=t('importLabel');
 $('#restore').textContent=t('restore');$('#clear').textContent=t('clear');$('#restart').textContent=t('restart');$('#settings-done').textContent=t('done');$('#message-ok').textContent=t('gotIt');
 header();
}
function message(title,text){$('#message-title').textContent=title;$('#message-body').textContent=text;if(!$('#message-dialog').open)$('#message-dialog').showModal();}
function notice(s){message(t('noticeTitle'),s);}

function renderHome(){
 phase(t('homePhase'),t('homeHint'),t('firstTo5'));
 const d=copy(t('homeEyebrow'),t('homeTitle'),t('homeBody'));
 const fields=el('div',undefined,'name-entry');
 names.forEach((name,i)=>{const label=el('label',t(i===0?'name1Label':'name2Label'));const input=el('input');input.maxLength=24;input.value=name;input.autocomplete='off';input.oninput=e=>{names[i]=e.target.value.trim()||defaultName(i);syncSettingsNames();header();};label.append(input);fields.append(label);});
 d.append(fields);
 const chips=el('div',undefined,'chips');['chip1','chip2','chip3'].forEach(k=>chips.append(el('span',t(k))));d.append(chips);
 actions([[t('letsPlay'),()=>{names=names.map((n,i)=>n.trim()||defaultName(i));syncSettingsNames();nextRound();}],[t('howTo'),()=>$('#settings-dialog').showModal()]]);
}
function home(){stop();loadToken++;setVerdictMode(false);state='home';round=0;scores=[0,0];current=null;currentWasLie=null;lastResult=null;renderHome();}

function renderReady(){const {describer,guesser}=roles();phase(t('secretPhase'),t('onlyLook',{name:names[describer]}),t('ready'));copy(t('forName',{name:names[describer]}),t('keepPhone'),t('secretBody',{other:names[guesser]}),'▧');actions([[t('reveal'),reveal]]);}
function renderDeckComplete(){phase(t('deckPhase'),t('deckHint'),'');copy(t('deckEyebrow'),t('deckTitle'),t('deckBody'));actions([[t('replay'),()=>{deck.pictures.forEach(p=>seen.delete(p.id));save();nextRound();}],[t('settings'),()=>$('#settings-dialog').showModal()]]);}
function nextRound(){
 stop();setVerdictMode(false);state='ready';currentWasLie=null;lastResult=null;
 const p=pickPicture(deck.pictures,seen);
 if(!p){state='deckcomplete';renderDeckComplete();return;}
 current=p;round++;renderReady();
}

function imageNode(){const img=new Image();img.src=current.image;img.alt=current.alt;return img;}
async function reveal(){
 if(state!=='ready')return;state='loading';const token=++loadToken;actions([[t('loading'),()=>{},true]]);const img=new Image();img.alt=current.alt;
 try{
  await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Image load timed out.')),20000);img.onload=()=>{clearTimeout(timer);resolve();};img.onerror=()=>{clearTimeout(timer);reject(Error('Image could not be loaded.'));};img.src=current.image;});
  if(token!==loadToken)return;seen.add(current.id);save();state='commit';renderCommit(img);
 }catch(e){if(token!==loadToken)return;state='ready';copy(t('unavailable'),t('tryAgain'),e.message);actions([[t('retry'),reveal],[t('another'),()=>{round--;nextRound();}]]);}
}
function renderCommit(existingImg){const {describer}=roles();$('#stage').replaceChildren(existingImg||imageNode());phase(t('choosePhase'),t('chooseHint',{name:names[describer]}),t('private'));actions([[t('truthChoice'),()=>beginDescribe(false)],[t('lieChoice'),()=>beginDescribe(true)]]);}
function beginDescribe(wasLie){if(state!=='commit')return;currentWasLie=wasLie;state='describe';renderDescribe(false);startTimer(60,startQuestions);}
function renderDescribe(preserveTimer=true){const {describer,guesser}=roles();if(!$('#stage img'))$('#stage').replaceChildren(imageNode());phase(t('describePhase'),t('describeHint',{name:names[describer],other:names[guesser]}),preserveTimer?undefined:'1:00');actions([[t('doneDescribe'),startQuestions]]);}
function startQuestions(){if(state!=='describe')return;stop();state='questions';renderQuestions(false);startTimer(90,showVerdict);}
function renderQuestions(preserveTimer=true){const {describer,guesser}=roles();if(!$('#stage img'))$('#stage').replaceChildren(imageNode());phase(t('questionPhase'),t('questionHint',{guesser:names[guesser],describer:names[describer]}),preserveTimer?undefined:'1:30');actions([[t('noMore'),showVerdict]]);}
function showVerdict(){if(state!=='questions')return;stop();state='verdict';renderVerdict();}
function renderVerdict(){const {guesser}=roles();$('#stage').replaceChildren();phase(t('verdictPhase'),t('verdictHint',{name:names[guesser]}),'');setVerdictMode(true);actions([[t('liar'),()=>resolveVerdict(true)],[t('truthful'),()=>resolveVerdict(false)]]);}

function resolveVerdict(guessedLiar){
 if(state!=='verdict')return;setVerdictMode(false);state='result';const {describer,guesser}=roles();
 const delta=scoreBluffRound(currentWasLie,guessedLiar);scores[describer]+=delta.describer;scores[guesser]+=delta.guesser;
 const winnerIndex=reachedTarget(scores,TARGET);
 lastResult={guessedLiar,delta,winnerIndex,describer,guesser};
 renderResult();
}
function renderResult(){
 const {guessedLiar,delta,winnerIndex,describer,guesser}=lastResult;
 const actual=currentWasLie?t('actualLiar'):t('actualTruth'),guess=guessedLiar?t('liar'):t('truthful');
 phase(t('resultPhase'),t('resultHint',{name:names[guesser]}),'');
 const d=copy('',delta.correct?t('correct'):t('wrong'),t('resultBody',{guesser:names[guesser],guess,describer:names[describer],actual,dDelta:signed(delta.describer),gDelta:signed(delta.guesser)}),'');d.classList.add('result');
 const img=imageNode();img.className='result-image';d.prepend(img);
 if(winnerIndex>=0)actions([[t('showWinner'),finish]]);else actions([[t('startNext',{round:round+1,name:names[guesser]}),nextRound]]);
}
function finish(){setVerdictMode(false);state='finished';renderFinish();}
function renderFinish(){let winner=reachedTarget(scores,TARGET);if(winner<0)winner=matchWinner(scores)??0;phase(t('finalPhase'),t('finalHint'),t('complete'));copy(t('complete'),t('winnerTitle',{name:names[winner]}),t('winnerBody',{p1:names[0],s1:scores[0],s2:scores[1],p2:names[1]}),'✦');actions([[t('playAgain'),home],[t('settings'),()=>$('#settings-dialog').showModal()]]);}

function rerenderCurrent(){
 applyStaticLanguage();syncSettingsNames();
 switch(state){
  case 'home':renderHome();break;case 'ready':renderReady();break;case 'commit':renderCommit();break;case 'describe':renderDescribe(true);break;case 'questions':renderQuestions(true);break;case 'verdict':renderVerdict();break;case 'result':renderResult();break;case 'finished':renderFinish();break;case 'deckcomplete':renderDeckComplete();break;
 }
}

$('#lang-toggle').onclick=()=>{language=language==='en'?'ar':'en';save();rerenderCurrent();};
$('#sound').onclick=()=>{soundEnabled=!soundEnabled;sounds.setEnabled(soundEnabled);updateSoundButton();save();if(soundEnabled)sounds.tap();};
document.addEventListener('click',e=>{if(e.target.closest('button, a, input, label')){sounds.unlock();if(!e.target.closest('#sound'))sounds.tap();}},true);
$('#settings').onclick=()=>{if(['loading','commit','describe','questions','verdict'].includes(state)){notice(t('settingsBlocked'));return;}syncSettingsNames();$('#settings-dialog').showModal();};
$('#fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();else message(t('fullscreenUnavailable'),t('fullscreenUnavailableBody'));}catch{message(t('fullscreenBlocked'),t('fullscreenBlockedBody'));}};
[0,1].forEach(i=>{$('#input'+(i+1)).oninput=e=>{names[i]=e.target.value.trim()||defaultName(i);header();};});
$('#settings-dialog').addEventListener('close',()=>{if(!['loading','commit','describe','questions','verdict'].includes(state))rerenderCurrent();});
$('#clear').onclick=()=>{if(confirm(t('clearConfirm'))){seen.clear();save();header();$('#settings-status').textContent=t('clearDone');}};
$('#restart').onclick=()=>{if(confirm(t('restartConfirm'))){home();$('#settings-dialog').close();}};
$('#restore').onclick=()=>{if(confirm(t('restoreConfirm'))){deck=demo;custom=null;save();home();$('#settings-dialog').close();}};
$('#import').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{if(f.size>10*1024*1024)throw Error(t('tooLarge'));const text=await f.text(),next=parseImageList(text);if(!confirm(t('importConfirm',{count:next.pictures.length})))return;deck=next;custom=text;save();home();$('#settings-dialog').close();notice(t('importDone'));}catch(err){$('#settings-status').textContent=err.message;}finally{e.target.value='';}};

applyStaticLanguage();syncSettingsNames();
try{
 const r=await fetch('./images.txt');if(!r.ok)throw Error('Cannot load images.txt.');demo=parseImageList(await r.text());deck=demo;
 for(const id of [...seen])if(/^demo-\d+$/.test(id)){seen.add(`images/${id}.svg`);seen.delete(id);}
 if(typeof stored.imageList==='string'){try{deck=parseImageList(stored.imageList);custom=stored.imageList;}catch{notice('Saved image list was invalid. Using the built-in list.');}}
 save();home();
}catch(e){phase(t('setupNeeded'),'','');copy(t('setupNeeded'),t('picturesLoadFail'),`${e.message} Serve this folder using GitHub Pages or a local web server.`);actions([[t('reload'),()=>location.reload()]]);}
