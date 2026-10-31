import test from 'node:test';import assert from 'node:assert/strict';import {createSounds} from './sound.js';
test('tap, warning and finish synthesize tones; mute prevents new tones',()=>{
 const starts=[];globalThis.window={AudioContext:class{state='running';currentTime=0;destination={};createOscillator(){return {frequency:{value:0},connect(){},start(at){starts.push(at)},stop(){},disconnect(){}}}createGain(){return {gain:{setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},disconnect(){}}}}};
 const audio=createSounds();audio.unlock();audio.tap();assert.equal(starts.length,1);audio.warning(10);assert.equal(starts.length,2);audio.finish();assert.deepEqual(starts.slice(2),[0,.23,.46]);audio.setEnabled(false);audio.tap();audio.warning(1);audio.finish();assert.equal(starts.length,5);delete globalThis.window;
});
test('unsupported audio does not break game',()=>{globalThis.window={};const a=createSounds();a.unlock();a.tap();a.finish();delete globalThis.window;});
