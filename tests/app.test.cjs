const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
function harness({blocked=false,stored={},speech=false}={}){
  const elements = new Map(), values = new Map(Object.entries(stored));
  function elem(id){if(!elements.has(id))elements.set(id,{id,innerHTML:'',textContent:'',hidden:true,value:'all',handlers:{},focus(){},addEventListener(name,fn){this.handlers[name]=fn},querySelector(){return elem('audio-button')}});return elements.get(id)}
  const document={hidden:false,getElementById:elem,contains:()=>true,addEventListener(){}};
  const window={scrollTo(){},addEventListener(){}};
  const storage={getItem(k){if(blocked)throw Error('disabled');return values.get(k)||null},setItem(k,v){if(blocked)throw Error('disabled');values.set(k,v)},removeItem(k){if(blocked)throw Error('disabled');values.delete(k)}};
  if(speech) window.speechSynthesis={cancel(){},getVoices(){return[]},speak(u){u.onerror()}};
  const context=vm.createContext({document,window,localStorage:storage,navigator:{},location:{protocol:'https:'},console,SpeechSynthesisUtterance:speech?class{constructor(text){this.text=text}}:undefined});
  if(speech)window.SpeechSynthesisUtterance=context.SpeechSynthesisUtterance;
  for(const file of ['content.js','math-content.js','core.js','visuals.js','app.js'])vm.runInContext(fs.readFileSync(path.resolve(__dirname,'..',file),'utf8'),context,{filename:file});
  const click=(action,data={})=>{const b={disabled:false,dataset:{action,...data}};elem('main').handlers.click({target:{closest:()=>b}})};
  return {elem,values,click,context};
}
test('aplikacja startuje i przechodzi sesję przy zablokowanym localStorage',()=>{
  const h=harness({blocked:true});
  assert.match(h.elem('main').innerHTML,/Cześć, Haniu/); assert.equal(h.elem('storage-notice').hidden,false);
  h.click('start-quiz'); assert.match(h.elem('main').innerHTML,/Szybki test/);
  h.click('answer',{index:'0'}); assert.match(h.elem('main').innerHTML,/Następny krok/);
  h.click('next'); assert.match(h.elem('main').innerHTML,/ukończono 1 z 15/);
});
test('nieprawidłowy zapis sesji i postępu nie blokuje ekranu głównego',()=>{
  for(const value of ['{broken','[]','{"evil":true}','null']){
    const h=harness({stored:{'male-kroki-v1:session':value,'male-kroki-v1:progress':value}});
    assert.match(h.elem('main').innerHTML,/Poprawnie przećwiczone: 0/);
    assert.ok(!h.elem('main').innerHTML.includes('Kontynuuj'));
  }
});
test('brak Web Speech API ma czytelny komunikat i nie blokuje nauki',()=>{
  const h=harness();h.elem('learn-length').value='5';h.elem('learn-category').value='language';h.click('start-learn');h.click('audio');
  assert.match(h.elem('audio-status').textContent,/nie obsługuje/);
  h.click('recall');assert.match(h.elem('main').innerHTML,/Teraz Twoimi słowami/);
  assert.ok(!h.elem('main').innerHTML.includes('class="theory"'));
  h.click('question');assert.match(h.elem('main').innerHTML,/class="answers"/);
});
test('błąd syntezatora daje komunikat, a pytanie pozostaje dostępne',()=>{
  const h=harness({speech:true});h.elem('learn-category').value='language';h.click('start-learn');h.click('audio');
  assert.match(h.elem('audio-status').textContent,/Czytanie niedostępne/);
  h.click('recall');h.click('question');h.click('answer',{index:'0'});
  assert.match(h.elem('main').innerHTML,/Następny krok/);
});
test('powtórne kliknięcie odpowiedzi nie nalicza dodatkowego wyniku',()=>{
  const h=harness();h.click('start-quiz');h.click('answer',{index:'0'});
  const before=h.values.get('male-kroki-v1:session');h.click('answer',{index:'1'});
  assert.equal(h.values.get('male-kroki-v1:session'),before);
  const s=JSON.parse(before);assert.equal(Object.keys(s.results).length,1);
});
test('wznowienie interfejsu po odpowiedzi zachowuje zablokowane przyciski',()=>{
  const h=harness();h.click('start-quiz');h.click('answer',{index:'0'});
  const restored=harness({stored:Object.fromEntries(h.values)});
  assert.match(restored.elem('main').innerHTML,/Kontynuuj/);restored.click('resume');
  assert.match(restored.elem('main').innerHTML,/disabled/);assert.match(restored.elem('main').innerHTML,/Następny krok/);
});

test('test z matematyki losuje 30 różnych pytań wyłącznie z matematyki', () => {
  const h = harness();
  h.click('start-math-quiz');
  const session = JSON.parse(h.values.get('male-kroki-v1:session'));
  assert.equal(session.mode, 'quiz');
  assert.equal(session.stage, 'question');
  assert.doesNotMatch(h.elem('main').innerHTML, /class="math-hint"/);
  assert.equal(session.ids.length, 30);
  assert.equal(new Set(session.ids).size, 30);
  assert.ok(session.ids.every(id => id.startsWith('math-')));
  assert.match(h.elem('main').innerHTML, /Test z matematyki · ukończono 0 z 30/);
  h.click('answer', { index: '0' });
  const resumed = harness({ stored: Object.fromEntries(h.values) });
  resumed.click('resume');
  assert.match(resumed.elem('main').innerHTML, /Test z matematyki · ukończono 1 z 30/);
});

test('matematyka od podstaw pokazuje tablicę, podpowiedź i rozwiązanie w tej kolejności', () => {
  const h = harness();
  h.click('start-math-basics');
  const saved = () => JSON.parse(h.values.get('male-kroki-v1:session'));
  assert.deepEqual(saved().ids, ['math-03', 'math-04', 'math-89']);
  assert.match(h.elem('main').innerHTML, /Rozwiąż podobne zadanie/);
  h.click('question');
  assert.equal(saved().stage, 'question');
  assert.match(h.elem('main').innerHTML, /<details class="math-hint">/);
  assert.doesNotMatch(h.elem('main').innerHTML, /class="math-feedback/);
  h.click('answer', {index: '0'});
  assert.equal(saved().stage, 'feedback');
  assert.match(h.elem('main').innerHTML, /4, 0 i 7/);
  h.click('next');
  assert.equal(saved().current, 'math-04');
});

test('z biblioteczki można przejść prosto z tablicy do ćwiczenia', () => {
  const h = harness();
  h.click('open-item', {id: 'math-89'});
  assert.match(h.elem('main').innerHTML, /class="board-columns"/);
  assert.match(h.elem('main').innerHTML, /2 \+ 4 = 6/);
  h.click('practice-item');
  assert.match(h.elem('main').innerHTML, /Oblicz 243 \+ 25/);
  assert.match(h.elem('main').innerHTML, /Zobacz przykład z tablicy/);
});
