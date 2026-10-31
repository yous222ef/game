import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {parseImageList,pickPicture,scoreBluffRound,reachedTarget,matchWinner} from './core.js';

const text=fs.readFileSync(new URL('./images.txt',import.meta.url),'utf8'),data=parseImageList(text);
test('image list parses without answer metadata',()=>{assert.ok(data.pictures.length>=10);assert.equal(data.answers,undefined);});
test('parser handles comments, blank lines, CRLF and duplicates',()=>{assert.deepEqual(parseImageList(text+'\n# comment\r\nimages/demo-1.svg\r\n'),data);});
test('selection never repeats seen images and reports exhaustion',()=>{const seen=new Set();for(let i=0;i<data.pictures.length;i++){const p=pickPicture(data.pictures,seen);assert.ok(p);assert.ok(!seen.has(p.id));seen.add(p.id);}assert.equal(pickPicture(data.pictures,seen),null);});
test('insufficient pictures and unsafe image schemes rejected',()=>{assert.throws(()=>parseImageList('a.jpg'));assert.throws(()=>parseImageList(text+'\njavascript:alert(1)'));});
test('custom scoring matches all four bluff cases',()=>{
 assert.deepEqual(scoreBluffRound(true,false),{describer:2,guesser:-1,correct:false});
 assert.deepEqual(scoreBluffRound(true,true),{describer:-1,guesser:1,correct:true});
 assert.deepEqual(scoreBluffRound(false,false),{describer:0,guesser:1,correct:true});
 assert.deepEqual(scoreBluffRound(false,true),{describer:1,guesser:-1,correct:false});
});
test('first player reaching at least five wins',()=>{assert.equal(reachedTarget([5,2]),0);assert.equal(reachedTarget([-2,6]),1);assert.equal(reachedTarget([4,4]),-1);});
test('fallback match winner still compares scores',()=>{assert.equal(matchWinner([4,6]),1);assert.equal(matchWinner([6,4]),0);assert.equal(matchWinner([5,5]),null);});
