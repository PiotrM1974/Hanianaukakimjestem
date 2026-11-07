const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
require('../content.js');
require('../math-content.js');
const {items, categories} = globalThis.HaniaContent;
const C = require('../core.js');
const V = require('../visuals.js');
const answers = id => items.find(i=>i.id===id).answers;
const itemFor = s => items.find(i=>i.id===s.current);
const question = s => { s.stage = 'question'; return s; };
test('159 unikalnych zagadnień, pięć kategorii i prawidłowe klucze odpowiedzi',()=>{
  assert.equal(items.length,159);
  assert.equal(new Set(items.map(i=>i.id)).size,159);
  assert.equal(new Set(items.map(i=>i.question)).size,159);
  assert.deepEqual(categories.map(c=>items.filter(i=>i.category===c.id).length),[20,25,15,10,89]);
  for(const i of items){
    assert.ok(i.theory.trim());
    if (i.category === 'math') assert.ok(i.solution.length && i.solution.every(step => step.trim()));
    else assert.ok(i.recall.length > 10);
    assert.equal(i.answers.length,3);
    assert.equal(new Set(i.answers).size,3);
    assert.ok(Number.isInteger(i.correct) && i.correct>=0 && i.correct<3);
    assert.ok(i.sources.length);
  }
});
test('schematy i tablice są kompletne i korzystają tylko z zasobów aplikacji',()=>{
  for(const i of items){
    const svg = V.render(i);
    if (i.category === 'math') {
      assert.match(svg, /class="class-board"/, i.id);
      assert.match(svg, /class="board-steps"/, i.id);
      assert.ok(i.visual.steps.length >= 2, i.id);
      assert.ok(!/<image|<script|<foreignObject|href=|url\(/i.test(svg), i.id);
      continue;
    }
    assert.equal((svg.match(/<svg /g)||[]).length,2,i.id);
    assert.equal((svg.match(/<title /g)||[]).length,2,i.id);
    assert.equal((svg.match(/<desc /g)||[]).length,2,i.id);
    assert.ok(i.visual.title && i.visual.caption && i.visual.steps.length>=2);
    assert.ok(!/<image|<script|<foreignObject|href=|url\(/i.test(svg),i.id);
    for(const s of i.visual.steps){ assert.equal(s.split('|').length,2); assert.ok(V.lines(s.split('|')[0]).length<=2,i.id); assert.ok(s.split('|')[1].length<=27,i.id); }
  }
});
test('tasowanie nie zmienia wejścia, nie gubi elementów i permutuje indeksy',()=>{
  const input=[1,2,3,4,5], output=C.shuffle(input,()=>0);
  assert.deepEqual(input,[1,2,3,4,5]); assert.notDeepEqual(output,input); assert.deepEqual([...output].sort(),input);
});
test('schematy wersów i strofy nie zawijają jednego wersu do dwóch linijek',()=>{
  for(const item of items.filter(i=>['stories-03','stories-04'].includes(i.id))){
    for(const step of item.visual.steps)assert.equal(V.lines(step.split('|')[0]).length,1,item.id);
  }
});
test('pełna sesja 159 pytań kończy się dokładnie wynikiem 159/159',()=>{
  const s=C.createSession(items.map(i=>i.id),'learn'); C.advance(s,answers);
  let visits=0;
  while(s.stage!=='done'){
    const i=itemFor(s); question(s);
    assert.equal(C.answer(s,i.correct,i.correct),true);
    assert.equal(C.answer(s,i.correct,i.correct),false);
    assert.ok(C.restore(JSON.stringify(s),items));
    C.advance(s,answers); visits++; assert.ok(visits<=159);
  }
  assert.equal(visits,159); assert.deepEqual(C.summary(s),{total:159,completed:159,correct:159,wrong:[]});
  assert.ok(C.restore(JSON.stringify(s),items));
});
test('15 pytań testu bez duplikatów, wynik 0/15 i brak automatycznej pętli',()=>{
  const s=C.createSession(C.shuffle(items).slice(0,15).map(i=>i.id),'quiz'); C.advance(s,answers);
  for(let n=0;n<15;n++){
    assert.equal(s.stage,'question'); const i=itemFor(s);
    assert.equal(C.skip(s,answers),false);
    C.answer(s,(i.correct+1)%3,i.correct); C.advance(s,answers);
  }
  assert.equal(s.stage,'done'); assert.equal(C.summary(s).correct,0); assert.equal(C.summary(s).wrong.length,15);
});
test('odłożenie wszystkich 159 pytań: powracają raz, drugie odłożenie zablokowane',()=>{
  const s=C.createSession(items.map(i=>i.id),'learn'); C.advance(s,answers);
  for(let n=0;n<159;n++) assert.equal(C.skip(s,answers),true);
  assert.equal(s.reviewing,true); assert.equal(C.skip(s,answers),false);
  assert.ok(C.restore(JSON.stringify(s),items));
  let n=0;
  while(s.stage!=='done'){
    question(s); const i=itemFor(s); C.answer(s,i.correct,i.correct); C.advance(s,answers); n++;
  }
  assert.equal(n,159); assert.equal(C.summary(s).completed,159);
});
test('mieszana kolejka: poprawna, pominięta i błędna odpowiedź nie zmieniają mianownika',()=>{
  const ids=items.slice(0,3).map(i=>i.id), s=C.createSession(ids,'learn',()=>0);
  C.advance(s,answers); C.skip(s,answers);
  question(s); C.answer(s,itemFor(s).correct,itemFor(s).correct); C.advance(s,answers);
  question(s); C.answer(s,(itemFor(s).correct+1)%3,itemFor(s).correct); C.advance(s,answers);
  assert.equal(s.reviewing,true); question(s); C.answer(s,itemFor(s).correct,itemFor(s).correct); C.advance(s,answers);
  assert.equal(s.stage,'done'); assert.equal(C.summary(s).correct,2); assert.equal(C.summary(s).total,3);
});
test('wznowienie na każdym etapie zachowuje kolejność i ocenę',()=>{
  const s=C.createSession(items.slice(0,5).map(i=>i.id),'learn'); C.advance(s,answers);
  for(const stage of ['theory','recall','question']){s.stage=stage;assert.deepEqual(C.restore(JSON.stringify(s),items),s);}
  C.answer(s,itemFor(s).correct,itemFor(s).correct); assert.deepEqual(C.restore(JSON.stringify(s),items),s);
});
test('uszkodzony lub niezgodny zapis nie psuje uruchomienia',()=>{
  for(const value of [null,'oops','{}','[]','{"version":2}'])assert.equal(C.restore(value,items),null);
  const s=C.createSession(items.slice(0,3).map(i=>i.id),'quiz'); C.advance(s,answers);
  for(const mutate of [x=>x.queue.push(x.current),x=>x.ids.push('missing'),x=>x.order=[0,0,1],x=>x.results[x.current]=true,x=>x.current='missing',x=>x.stage='recall',x=>x.skipped.push(x.queue.pop()),x=>x.queue.pop()]){
    const bad=JSON.parse(JSON.stringify(s)); mutate(bad); assert.equal(C.restore(bad,items),null);
  }
});
test('grafika poprawnie ucieka znaki HTML i zachowuje polskie litery',()=>{
  const item=structuredClone(items[0]); item.visual.title='<script>&"ąę';
  const output=V.render(item); assert.ok(!output.includes('<script>')); assert.ok(output.includes('&lt;script&gt;&amp;&quot;ąę'));
});
test('wszystkie lokalne odnośniki startowe istnieją i działają w podkatalogu',()=>{
  const root=path.resolve(__dirname,'..'), html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  const links=[...html.matchAll(/(?:src|href)="\.\/([^"]+)"/g)].map(m=>m[1]);
  assert.ok(links.length>=7);
  for(const file of links){assert.ok(fs.existsSync(path.join(root,file)),file); assert.equal(new URL('./'+file,'https://example.github.io/repo/').pathname,'/repo/'+file);}
  assert.ok(!/https?:\/\//.test(html)); assert.ok(!/user-scalable=no|maximum-scale=1/.test(html));
});
test('każdy skrypt przechodzi parsowanie',()=>{
  for(const f of ['content.js','core.js','visuals.js','app.js','sw.js'])new vm.Script(fs.readFileSync(path.resolve(__dirname,'..',f),'utf8'),{filename:f});
});






