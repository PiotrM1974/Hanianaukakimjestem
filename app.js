/* Bez zależności, kont, reklam i analityki. */
(function () {
  'use strict';
  const { items, categories } = HaniaContent;
  const C = HaniaCore, V = HaniaVisuals, e = V.escape;
  const main = document.getElementById('main');
  const byId = new Map(items.map(item => [item.id, item]));
  const PREFIX = 'male-kroki-v1:';
  let storageOK = true, speaking = null, currentView = 'home', libraryCategory = 'all', librarySearch = '';
  function read(key) { try { return localStorage.getItem(PREFIX + key); } catch { storageOK = false; return null; } }
  function write(key, value) {
    try { if (value === null) localStorage.removeItem(PREFIX + key); else localStorage.setItem(PREFIX + key, JSON.stringify(value)); }
    catch { storageOK = false; }
    document.getElementById('storage-notice').hidden = storageOK;
  }
  function readProgress() {
    try {
      const value = JSON.parse(read('progress'));
      if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
      return Object.fromEntries(Object.entries(value).filter(([id, val]) => byId.has(id) && val && typeof val.ok === 'boolean' && typeof val.review === 'boolean').map(([id, val]) => [id, { ok: val.ok, review: val.review }]));
    } catch { return {}; }
  }
  let progress = readProgress();
  let session = C.restore(read('session'), items);
  if (session && session.stage === 'done') session = null;
  const getAnswers = id => byId.get(id).answers;
  const categoryOf = item => categories.find(c => c.id === item.category);
  const reviewIds = () => items.filter(x => progress[x.id]?.review).map(x => x.id);
  const learned = list => list.filter(x => progress[x.id]?.ok).length;
  function save() { if (session) write('session', session); }
  function stopAudio() {
    speaking = null;
    try { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); } catch { /* Czytanie jest dodatkiem. */ }
  }
  function draw(html, view) {
    stopAudio(); currentView = view; main.innerHTML = html;
    main.focus({ preventScroll: true }); window.scrollTo(0, 0);
  }
  const action = (label, name, cls = '', extra = '') => `<button class="btn ${cls}" data-action="${name}" ${extra}>${label}</button>`;
  function home() {
    save();
    const count = learned(items), reviews = reviewIds().length;
    const unfinished = session && session.stage !== 'done';
    draw(`${unfinished ? `<aside class="resume"><p><strong>Twój mały krok czeka.</strong><br>Ukończono ${C.summary(session).completed} z ${session.ids.length} pytań. Możesz wrócić do sesji.</p>${action('Kontynuuj →', 'resume', 'secondary')}</aside>` : ''}
      <section class="hero"><div><p class="eyebrow">ROZDZIAŁ 1 · KIM JESTEM?</p><h1>Cześć, Haniu.<br>Czas na <em>mały krok.</em></h1><p class="intro">Odkrywaj słowa, poznawaj opowieści i ćwicz po trochu. Tutaj możesz się zastanowić, pomylić i spróbować jeszcze raz.</p><div class="meta-row"><span><i class="dot" aria-hidden="true"></i>70 zagadnień</span><span>Bez pośpiechu</span><span>Własne schematy</span></div></div>${V.hero()}</section>
      <div class="section-label"><h2>Jak dziś poćwiczymy?</h2><span>Wybierz swój sposób</span></div>
      <div class="path-grid"><section class="path-card primary"><div class="card-top"><span class="small-icon" aria-hidden="true">Aa</span><span class="badge">POLECANE NA POCZĄTEK</span></div><p class="step-label">01 / ODKRYWAM</p><h2>Uczę się krok po kroku</h2><p>Najpierw wyjaśnienie i schemat. Potem chwila na przypomnienie z pamięci i jedno pytanie.</p><div class="settings"><div class="field"><label for="learn-category">Temat</label><select id="learn-category"><option value="all">Wszystkie tematy</option>${categories.map(c => `<option value="${c.id}">${e(c.short)}</option>`).join('')}</select></div><div class="field"><label for="learn-length">Długość sesji</label><select id="learn-length"><option value="10">10 zagadnień</option><option value="5">5 zagadnień</option><option value="all">Cały wybrany temat</option></select></div></div>${action('Zaczynam naukę <span aria-hidden="true">→</span>', 'start-learn')}</section>
      <section class="path-card"><div class="card-top"><span class="small-icon" aria-hidden="true">✓</span><span class="badge">BEZ LIMITU CZASU</span></div><p class="step-label">02 / SPRAWDZAM</p><h2>Co już pamiętam?</h2><p>15 losowych pytań ze wszystkich tematów. Sprawdź, co już umiesz i do czego warto wrócić.</p>${action('Rozwiązuję szybki test →', 'start-quiz', 'secondary')}<p class="micro">Wynik jest wskazówką do nauki, nie szkolną oceną.</p></section></div>
      <div class="section-label"><h2>Twoja mapa odkryć</h2><span>Poprawnie przećwiczone: ${count} / 70</span></div><section class="topics" aria-label="Tematy nauki">${categories.map((c, i) => { const list = items.filter(x => x.category === c.id), n = learned(list); return `<button class="topic" data-action="category" data-id="${c.id}" style="--topic:${c.color}"><span class="topic-index" aria-hidden="true">0${i + 1}</span><strong>${e(c.name)}</strong><small>${n} / ${list.length} przećwiczonych poprawnie</small><div class="progress-track" aria-hidden="true"><span style="width:${n / list.length * 100}%"></span></div></button>`; }).join('')}</section>
      <div class="bottom-strip"><p>${reviews ? `Do spokojnej powtórki: <strong>${reviews}</strong>. Każda próba pomaga w nauce.` : 'Każdy temat możesz otworzyć także w biblioteczce.'}</p><div>${reviews ? `<button class="text-button" data-action="review">Powtarzam trudniejsze (${reviews}) →</button> · ` : ''}<button class="text-button" data-action="library">Biblioteczka 70 tematów →</button></div></div>`, 'home');
  }
  function start(mode, category = 'all', length = 10, ids = null) {
    let pool = ids || items.filter(item => category === 'all' || item.category === category).map(item => item.id);
    if (!pool.length) return home();
    pool = C.shuffle(pool);
    const limit = mode === 'quiz' ? 15 : length === 'all' ? pool.length : Number(length);
    session = C.createSession(pool.slice(0, limit), mode);
    C.advance(session, getAnswers); save(); renderSession();
  }
  function progressHeader() {
    const stats = C.summary(session);
    return `<div class="session-top"><button class="text-button" data-action="home">← Menu <span class="sr-only">(postęp zostanie zapisany)</span></button><span>${session.mode === 'learn' ? 'Nauka' : 'Szybki test'} · ukończono ${stats.completed} z ${stats.total}</span></div><div class="progress-track session-progress" role="progressbar" aria-label="Ukończone pytania" aria-valuemin="0" aria-valuemax="${stats.total}" aria-valuenow="${stats.completed}"><span style="width:${100 * stats.completed / stats.total}%"></span></div>`;
  }
  function audioControl() { return `<div class="audio-row"><button class="text-button" data-action="audio">▷ Posłuchaj wyjaśnienia</button><span class="audio-status" id="audio-status" role="status"></span></div>`; }
  function renderSession() {
    if (!session) return home();
    if (session.stage === 'done') return results();
    const item = byId.get(session.current), cat = categoryOf(item);
    let content = '';
    if (session.stage === 'theory') {
      content = `<h1>${e(item.title)}</h1>${audioControl()}<p class="theory">${e(item.theory)}</p>${V.render(item)}<p class="recall-hint">Przyjrzyj się schematowi. Za chwilę schowamy wyjaśnienie i spróbujesz przypomnieć je sobie własnymi słowami.</p><div class="actions">${session.reviewing ? '<span class="micro">Wracamy do odłożonych pytań — już ich nie odkładamy.</span>' : action('Odkładam na koniec', 'skip', 'ghost')}${action('Rozumiem — sprawdzam pamięć →', 'recall')}</div>`;
    } else if (session.stage === 'recall') {
      content = `<div class="recall-panel"><div class="memory-symbol" aria-hidden="true">?</div><p class="eyebrow">CHWILA DLA PAMIĘCI</p><h1>Teraz Twoimi słowami</h1><p>${e(item.recall)}</p><small>Powiedz odpowiedź na głos lub w myślach. Nie musisz jej wpisywać.</small></div><div class="actions">${action('Potrzebuję przypomnienia', 'back-theory', 'ghost')}${action('Przechodzę do pytania →', 'question')}</div>`;
    } else {
      const answered = session.stage === 'feedback';
      content = `<h1>${e(item.question)}</h1><p class="micro">Wybierz jedną odpowiedź. ${session.mode === 'learn' ? 'Wyjaśnienie jest teraz schowane.' : 'Masz tyle czasu, ile potrzebujesz.'}</p><div class="answers">${session.order.map((original, i) => {
        let cls = '', state = '';
        if (answered && original === item.correct) { cls = 'correct'; state = '✓ Poprawna'; }
        else if (answered && original === session.choice) { cls = 'wrong'; state = 'Twoja'; }
        return `<button class="answer ${cls}" data-action="answer" data-index="${original}" ${answered ? 'disabled' : ''}><span class="answer-letter" aria-hidden="true">${String.fromCharCode(65 + i)}</span><span>${e(item.answers[original])}</span>${state ? `<span class="answer-state">${state}</span>` : ''}</button>`;
      }).join('')}</div>`;
      if (answered) {
        const correct = session.results[item.id];
        content += `<div class="feedback ${correct ? '' : 'error'}" role="status"><strong>${correct ? 'Tak, właśnie tak!' : 'Jeszcze to poćwiczymy. To część nauki.'}</strong><p>${correct ? e(item.theory) : `Poprawna odpowiedź: <strong>${e(item.answers[item.correct])}</strong>${e(item.theory)}`}</p></div>${correct ? '' : V.render(item)}<div class="actions">${action('Następny krok →', 'next')}</div>`;
      }
    }
    draw(`<div class="session-wrap">${progressHeader()}<article class="lesson"><div class="session-header"><p class="eyebrow">${e(cat.short)} · ${e(item.title)}</p><span class="chip">${session.stage === 'theory' ? 'Poznaję' : session.stage === 'recall' ? 'Przypominam' : 'Ćwiczę'}</span></div>${content}</article></div>`, 'session');
  }
  function submitAnswer(index) {
    if (!session) return;
    const item = byId.get(session.current);
    if (!C.answer(session, index, item.correct)) return;
    const ok = session.results[item.id];
    progress[item.id] = { ok: ok || Boolean(progress[item.id]?.ok), review: !ok };
    write('progress', progress); save(); renderSession();
  }
  function results() {
    const s = C.summary(session);
    draw(`<div class="session-wrap"><div class="back-row"><button class="text-button" data-action="home">← Menu</button></div><section class="lesson"><div class="result-heading"><p class="eyebrow">TWÓJ DZISIEJSZY KROK</p><h1>${s.correct === s.total ? 'Dobra robota, Haniu!' : 'Kolejny krok za Tobą.'}</h1><div class="result-score">${s.correct}<small>poprawne odpowiedzi · z ${s.total}</small></div><p>${s.wrong.length ? 'Wiesz już, które zagadnienia warto spokojnie powtórzyć.' : 'Wszystkie odpowiedzi w tej sesji były poprawne. Możesz zrobić przerwę lub odkryć kolejny temat.'}</p></div><h3>Co dziś ćwiczyłaś?</h3><ul class="results-list">${session.ids.map(id => `<li class="${session.results[id] ? 'good' : ''}"><span class="status-word">${session.results[id] ? '✓ Poprawnie' : '↻ Do powtórki'}</span>${e(byId.get(id).title)}</li>`).join('')}</ul><div class="wide-actions">${s.wrong.length ? action(`Powtarzam trudniejsze (${s.wrong.length})`, 'retry') : action('Kolejny mały krok', 'new-learn')}${action('Wracam do menu', 'home', 'secondary')}</div><p class="micro">Wynik dotyczy tej sesji. Powtórka zaczyna nową sesję i nie zmienia tego wyniku.</p></section></div>`, 'results');
  }
  function library() {
    draw(`<div class="back-row"><button class="text-button" data-action="home">← Menu</button></div><div class="page-heading"><p class="eyebrow">TWOJA BIBLIOTECZKA</p><h1>Do którego słowa wrócimy?</h1><p>Otwórz dowolny temat, obejrzyj schemat i przypomnij sobie wyjaśnienie.</p></div><div class="library-toolbar"><div class="field"><label for="library-search">Szukam tematu lub słowa</label><input type="search" id="library-search" value="${e(librarySearch)}" placeholder="Na przykład: sylaby, skuwka, legenda" autocomplete="off"></div><div class="field"><label for="library-category">Temat</label><select id="library-category"><option value="all">Wszystkie tematy</option>${categories.map(c => `<option value="${c.id}" ${c.id === libraryCategory ? 'selected' : ''}>${e(c.short)}</option>`).join('')}</select></div></div><p id="library-count" class="micro" role="status"></p><div id="library-list" class="library-list"></div>`, 'library');
    updateLibrary();
  }
  function updateLibrary() {
    const query = librarySearch.toLocaleLowerCase('pl').trim();
    const found = items.filter(x => (libraryCategory === 'all' || x.category === libraryCategory) && (x.title + ' ' + x.theory + ' ' + x.question).toLocaleLowerCase('pl').includes(query));
    document.getElementById('library-count').textContent = `Znaleziono: ${found.length} z 70 tematów`;
    document.getElementById('library-list').innerHTML = found.length ? found.map(x => `<button class="library-item" data-action="open-item" data-id="${x.id}"><small>${e(categoryOf(x).short)}</small><strong>${e(x.title)}</strong><span>${progress[x.id]?.review ? '↻ Do powtórki' : progress[x.id]?.ok ? '✓ Przećwiczone poprawnie' : 'Odkryj temat →'}</span></button>`).join('') : '<p class="empty">Nie znalazłam takiego tematu. Spróbuj krótszego słowa lub wybierz wszystkie tematy.</p>';
  }
  let libraryItem = null;
  function openItem(id) {
    const item = byId.get(id); if (!item) return;
    libraryItem = item;
    draw(`<div class="session-wrap"><div class="back-row"><button class="text-button" data-action="library">← Biblioteczka</button></div><article class="lesson"><p class="eyebrow">${e(categoryOf(item).name)}</p><h1>${e(item.title)}</h1>${audioControl()}<p class="theory">${e(item.theory)}</p>${V.render(item)}<p class="recall-hint">${e(item.recall)}</p><div class="actions">${action('Ćwiczę ten temat →', 'practice-item')}${action('Wracam do biblioteczki', 'library', 'secondary')}</div></article></div>`, 'item');
  }
  function parent() {
    save();
    draw(`<div class="parent-content"><button class="text-button" data-action="home">← Menu</button><p class="eyebrow">DLA RODZICA LUB OPIEKUNA</p><h1>Spokojna nauka.<br>Jasne zasady.</h1><p>To autorska pomoc do powtórki języka polskiego dla klasy 4, oparta na przekazanym zakresie rozdziału „Kim jestem?”. Nie jest oficjalnym dodatkiem do podręcznika. Nie otrzymaliśmy podręcznika ani materiału bazowego do porównania strona po stronie.</p><h2>Jak korzystać</h2><ul><li>Zacznijcie od 5–10 zagadnień. Po kilku minutach można zrobić przerwę.</li><li>Po teorii aplikacja chowa wyjaśnienie. Dziecko próbuje powiedzieć je własnymi słowami, a potem odpowiada na pytanie.</li><li>Odkładane tematy wracają na końcu sesji. W drugiej kolejce nie można odkładać ich ponownie.</li><li>Po błędzie odpowiedź i wyjaśnienie pozostają na ekranie tak długo, jak potrzeba. Trudniejsze tematy czekają w powtórkach.</li><li>„Przećwiczone poprawnie” oznacza co najmniej jedną poprawną odpowiedź. Nie jest diagnozą trwałego opanowania wiedzy.</li></ul><h2>Treści i ilustracje</h2><p>Baza zawiera 20 zagadnień językowych, 25 ortograficznych, 15 literackich oraz 10 dotyczących pisania i bezpieczeństwa w sieci. Legendy opisano jako opowieści, nie potwierdzone fakty. Każde zagadnienie ma własny podpisany schemat SVG. Schematy przedstawiają reguły i zależności; nie są historycznymi portretami ani mapami.</p><details><summary>Źródła do sprawdzenia zakresu</summary><ul><li><a href="https://zpe.gov.pl/a/wsrod-liter-glosek-i-sylab/D1411aqT6" target="_blank" rel="noopener noreferrer">ZPE: głoski, litery i sylaby</a></li><li><a href="https://rjp.pan.pl/zmiany-pisowni-2026-3/" target="_blank" rel="noopener noreferrer">Rada Języka Polskiego: zasady pisowni obowiązujące od 2026 r.</a></li><li><a href="https://www.prezydent.pl/dla-mediow/materialy-do-pobrania/hymn-rp" target="_blank" rel="noopener noreferrer">Oficjalny tekst hymnu RP</a></li><li><a href="https://zpe.gov.pl/a/legendarne-poczatki/DA9nUxt63" target="_blank" rel="noopener noreferrer">ZPE: legendarne początki</a></li><li><a href="https://wiedza.cert.pl/dobre-praktyki/hasla/" target="_blank" rel="noopener noreferrer">CERT Polska: bezpieczne hasła</a></li></ul><p>Pełniejsze zestawienie i uwagi redakcyjne: plik SOURCES.md w paczce aplikacji.</p></details><h2>Prywatność i zapis</h2><p>Nie ma kont, formularzy danych dziecka, reklam ani analityki. Postęp i bieżąca sesja są zapisywane tylko w pamięci tej przeglądarki. Nie synchronizują się między urządzeniami. Tryb prywatny lub wyczyszczenie danych strony może usunąć zapis. Hosting GitHub Pages może obsługiwać zwykłe dane techniczne połączenia.</p><h2>Czytanie na głos i internet</h2><p>Przycisk czytania korzysta z syntezatora systemu. Dostępność i wymowa polskiego głosu zależą od przeglądarki oraz ustawień urządzenia. Niektóre głosy potrzebują internetu; obsługą tekstu i sieci podczas syntezy zarządza dostawca głosu. Gdy polskiego głosu brakuje, wyjaśnienia pozostają dostępne do czytania.</p><p>Ilustracje i czcionki nie są pobierane z obcych serwerów. Po zapisaniu kompletnej aplikacji w pamięci podręcznej można używać jej offline. Stan gotowości pokazuje stopka; system może później usunąć pamięć strony. Linki do źródeł wymagają internetu.</p><h2>Wyczyść postęp</h2><p>Ta opcja usuwa lokalne odpowiedzi, powtórki i zapisaną sesję z tej przeglądarki.</p><details id="reset-section"><summary>Chcę wyczyścić lokalne postępy</summary><p>Usunięcie nie ma funkcji cofania.</p>${action('Usuwam postępy i sesję', 'clear-progress', 'ghost')}</details><p class="micro">Wersja 1.0 · przegląd treści: 4 listopada 2026 r.</p></div>`, 'parent');
  }
  function audio() {
    const status = document.getElementById('audio-status');
    const button = main.querySelector('[data-action="audio"]');
    if (!status || !button) return;
    if (speaking) { stopAudio(); status.textContent = 'Czytanie zatrzymane.'; button.textContent = '▷ Posłuchaj wyjaśnienia'; return; }
    if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) { status.textContent = 'Ta przeglądarka nie obsługuje czytania na głos.'; return; }
    const text = currentView === 'item' ? libraryItem?.theory : byId.get(session?.current)?.theory;
    if (!text) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pl-PL'; utterance.rate = 0.88;
      const voices = window.speechSynthesis.getVoices();
      const pl = voices.find(v => /^pl(?:-|_)/i.test(v.lang));
      if (pl) utterance.voice = pl;
      utterance.onstart = () => { if (speaking === utterance) status.textContent = 'Czytam…'; };
      const finish = message => { if (speaking === utterance) { speaking = null; if (document.contains(status)) { status.textContent = message; button.textContent = '▷ Posłuchaj wyjaśnienia'; } } };
      utterance.onend = () => finish('Koniec czytania.');
      utterance.onerror = () => finish('Czytanie niedostępne. Wyjaśnienie możesz przeczytać na ekranie.');
      speaking = utterance; button.textContent = '■ Zatrzymaj czytanie';
      status.textContent = pl ? 'Przygotowuję polski głos…' : 'Próbuję uruchomić polski głos systemowy…';
      window.speechSynthesis.speak(utterance);
    } catch { stopAudio(); status.textContent = 'Nie udało się uruchomić czytania na tym urządzeniu.'; button.textContent = '▷ Posłuchaj wyjaśnienia'; }
  }
  document.getElementById('home').addEventListener('click', home);
  document.getElementById('help').addEventListener('click', parent);
  main.addEventListener('click', event => {
    const button = event.target.closest('button[data-action]'); if (!button || button.disabled) return;
    switch (button.dataset.action) {
      case 'home': home(); break;
      case 'resume': renderSession(); break;
      case 'start-learn': start('learn', document.getElementById('learn-category').value, document.getElementById('learn-length').value); break;
      case 'start-quiz': start('quiz'); break;
      case 'new-learn': start('learn'); break;
      case 'category': libraryCategory = button.dataset.id; librarySearch = ''; library(); break;
      case 'library': library(); break;
      case 'open-item': openItem(button.dataset.id); break;
      case 'practice-item': start('learn', 'all', 'all', [libraryItem.id]); break;
      case 'review': start('learn', 'all', 'all', reviewIds()); break;
      case 'retry': { const wrong = C.summary(session).wrong; start('learn', 'all', 'all', wrong); break; }
      case 'skip': if (C.skip(session, getAnswers)) { save(); renderSession(); } break;
      case 'recall': if (session?.stage === 'theory') { session.stage = 'recall'; save(); renderSession(); } break;
      case 'back-theory': if (session?.stage === 'recall') { session.stage = 'theory'; save(); renderSession(); } break;
      case 'question': if (session?.stage === 'recall') { session.stage = 'question'; save(); renderSession(); } break;
      case 'answer': submitAnswer(Number(button.dataset.index)); break;
      case 'next': if (session?.stage === 'feedback') { C.advance(session, getAnswers); save(); renderSession(); } break;
      case 'audio': audio(); break;
      case 'clear-progress': progress = {}; session = null; write('progress', null); write('session', null); home(); break;
    }
  });
  main.addEventListener('input', event => { if (event.target.id === 'library-search') { librarySearch = event.target.value; updateLibrary(); } });
  main.addEventListener('change', event => { if (event.target.id === 'library-category') { libraryCategory = event.target.value; updateLibrary(); } });
  window.addEventListener('pagehide', () => { save(); stopAudio(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { save(); stopAudio(); } });
  async function offline() {
    const label = document.getElementById('offline-status');
    if (!('serviceWorker' in navigator) || !['http:', 'https:'].includes(location.protocol)) { label.textContent = 'Wszystkie schematy są w plikach aplikacji.'; return; }
    try {
      const registration = await navigator.serviceWorker.register('./sw.js');
      const updateStatus = async () => {
        const worker = registration.active;
        if (!worker) return;
        const channel = new MessageChannel();
        channel.port1.onmessage = event => { if (event.data === 'OFFLINE_READY') label.textContent = 'Gotowa do nauki bez internetu.'; };
        worker.postMessage('CHECK_OFFLINE', [channel.port2]);
      };
      navigator.serviceWorker.addEventListener('controllerchange', updateStatus);
      await navigator.serviceWorker.ready; updateStatus();
    } catch { label.textContent = 'Schematy dostępne lokalnie. Zapis offline niedostępny.'; }
  }
  home(); document.getElementById('storage-notice').hidden = storageOK; offline();
})();

