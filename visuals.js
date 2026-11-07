(function (root) {
  'use strict';
  const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function lines(value, width = 24) {
    const words = value.split(' '), result = [''];
    for (const word of words) {
      if (result[result.length - 1].length + word.length + 1 > width && result[result.length - 1]) result.push(word);
      else result[result.length - 1] += (result[result.length - 1] ? ' ' : '') + word;
    }
    return result;
  }
  function text(value, x, y, size = 24, fill = '#2e3046', weight = 650) {
    return `<text x="${x}" y="${y}" text-anchor="middle" fill="${fill}" font-size="${size}" font-weight="${weight}" font-family="system-ui, sans-serif">${escape(value)}</text>`;
  }

  function boardTone(index) {
    return ['board-ones', 'board-tens', 'board-hundreds'][index % 3];
  }

  function boardTable(digits, focus) {
    const names = ['jedności', 'dziesiątki', 'setki', 'tysiące', 'dzies. tys.', 'setki tys.'];
    const columns = [...digits].map((digit, i) => {
      const place = digits.length - 1 - i;
      return { digit, place, cls: boardTone(place) + (place === focus ? ' board-focus' : '') };
    });
    const headers = columns.map(({place, cls}) => '<th scope="col" class="' + cls + '">' + names[place] + '</th>');
    const values = columns.map(({digit, place, cls}) => '<td class="' + cls + '">' + (Number(digit) * 10 ** place).toLocaleString('pl-PL') + '</td>');
    return '<div class="board-scroll"><table class="board-places" aria-label="Wartość cyfr liczby ' + escape(digits) +
      '"><thead><tr>' + headers.join('') + '</tr></thead><tbody><tr class="board-digits">' +
      columns.map(({digit, cls}) => '<td class="' + cls + '">' + escape(digit) + '</td>').join('') +
      '</tr><tr>' + values.join('') + '</tr></tbody></table></div>';
  }

  function boardColumns(a, b, sign, notes, carry = []) {
    const result = sign === '+' ? a + b : a - b;
    const width = Math.max(String(a).length, String(b).length, String(result).length);
    const headings = ['jedności', 'dziesiątki', 'setki', 'tysiące'].slice(0, width).reverse();
    function row(values, label, className = '') {
      return '<tr class="' + className + '"><td>' + label + '</td>' + values.map((value, i) =>
        '<td class="' + boardTone(width - 1 - i) + '">' + escape(value) + '</td>').join('') + '</tr>';
    }
    const digits = number => [...String(number).padStart(width, ' ')];
    return '<div class="board-calculation"><table class="board-columns" aria-label="' + a + ' ' + sign + ' ' + b + ' = ' + result +
      '"><thead><tr><td></td>' + headings.map((name, i) => '<th scope="col" class="' + boardTone(width - 1 - i) + '">' + name + '</th>').join('') +
      '</tr></thead><tbody>' + (carry.length ? row(carry, '<span class="sr-only">Przeniesienie</span>', 'board-carry') : '') +
      row(digits(a), '') + row(digits(b), sign) + row(digits(result), '<span class="sr-only">Wynik</span>', 'board-total') +
      '</tbody></table>' + boardSteps(notes, true) + '</div>';
  }

  function boardAxis(numbers, jumps, excluded) {
    const x = i => 45 + i * 370 / (numbers.length - 1);
    const ticks = numbers.map((number, i) => {
      const label = number.toLocaleString('pl-PL');
      const color = i === excluded ? '#9b3d40' : '#303144';
      return '<path d="M' + x(i) + ' 91v17" stroke="' + color + '" stroke-width="2"/>' +
        '<text x="' + x(i) + '" y="133" fill="' + color + '" text-anchor="middle" font-size="22">' + escape(label) + '</text>';
    });
    const arcs = jumps.map((i, index) => {
      const from = x(i) + 3, to = x(i + 1) - 4, middle = (from + to) / 2;
      const color = index % 2 ? '#7a357d' : '#116648';
      return '<path d="M' + from + ' 83Q' + middle + ' 23 ' + to + ' 83m-2-8 2 8-8-2" fill="none" stroke="' + color + '" stroke-width="2.5"/>' +
        '<text x="' + middle + '" y="45" fill="' + color + '" text-anchor="middle" font-size="20">+' + (numbers[i + 1] - numbers[i]) + '</text>';
    });
    return '<svg class="board-svg" viewBox="0 0 465 145" role="img" aria-label="' +
      escape('Oś liczbowa. ' + numbers.join(', ') + (excluded === undefined ? '' : '. Liczba ' + numbers[excluded] + ' jest poza zakresem.')) +
      '"><path d="M18 100H450m-8-7 8 7-8 7" fill="none" stroke="#464858" stroke-width="2"/>' + ticks.join('') + arcs.join('') + '</svg>';
  }

  function boardPalindrome(value) {
    const x = i => 52 + i * 376 / (value.length - 1);
    const pairs = Math.floor(value.length / 2);
    const arcs = Array.from({ length: pairs }, (_, i) => {
      const color = i === 0 ? '#116648' : '#7a357d';
      const height = 24 + 50 * i;
      return '<path d="M' + x(i) + ' 105C' + x(i) + ' ' + height + ' ' + x(value.length - 1 - i) + ' ' + height + ' ' +
        x(value.length - 1 - i) + ' 105" fill="none" stroke="' + color + '" stroke-width="3"/>' +
        '<text x="240" y="' + (32 + 36 * i) + '" fill="' + color + '" text-anchor="middle" font-size="19" font-weight="700">' +
        (i === 0 ? 'skrajne cyfry' : value.length === 4 ? 'środkowe cyfry' : 'druga para') + '</text>';
    });
    const cells = [...value].map((digit, i) => {
      const pair = Math.min(i, value.length - 1 - i);
      const color = pair === 0 ? '#116648' : pair === 1 && pair < pairs ? '#7a357d' : '#6e501c';
      const pale = pair === 0 ? '#edf6f0' : pair === 1 && pair < pairs ? '#f6edf6' : '#fff3de';
      return '<rect x="' + (x(i) - 33) + '" y="105" width="66" height="66" rx="10" fill="' + pale + '" stroke="' + color + '"/>' +
        '<text x="' + x(i) + '" y="152" fill="' + color + '" text-anchor="middle" font-size="41" font-weight="700">' + escape(digit) + '</text>';
    });
    return '<svg class="board-svg" viewBox="0 0 480 185" role="img" aria-label="' + escape('Pary cyfr w liczbie ' + value) +
      '">' + arcs.join('') + cells.join('') + '</svg>';
  }

  function boardGroups(count, size, remainder) {
    function group(amount, rest = false) {
      const dots = amount <= 20 ? '<span class="board-dots">' + '<i></i>'.repeat(amount) + '</span>' : '';
      return '<span class="board-group' + (rest ? ' board-rest' : '') + '">' + dots + '<b>' + amount + '</b></span>';
    }
    const remainderPanel = remainder ? '<div><p class="board-group-label board-ones">Zostaje ' + remainder +
      '</p>' + group(remainder, true) + '</div>' : '';
    return '<div class="board-groups" aria-hidden="true"><div><p class="board-group-label board-tens">' +
      count + ' ' + (count === 4 ? 'pełne grupy' : 'pełnych grup') + ' po ' + size +
      '</p><div class="board-group-row">' + Array.from({length: count}, () => group(size)).join('') +
      '</div></div>' + remainderPanel + '</div>';
  }

  function boardDiagram(diagram) {
    if (!diagram) return '';
    const [type, ...values] = diagram;
    switch (type) {
      case 'place': return boardTable(...values);
      case 'columns': return boardColumns(...values);
      case 'axis': return boardAxis(...values);
      case 'pal': return boardPalindrome(...values);
      case 'groups': return boardGroups(...values);
      case 'tiles': {
        const [tiles, captions] = values;
        return '<div class="board-tiles">' + tiles.map((tile, i) => '<div class="' + boardTone(i) + '"><b>' +
          escape(tile) + '</b>' + (captions[i] ? '<small>' + escape(captions[i]) + '</small>' : '') + '</div>').join('') + '</div>';
      }
      case 'grid': {
        const [side, value] = values;
        const rows = Array.from({length: side}, () => '<tr>' + ('<td>' + escape(value) + '</td>').repeat(side) + '</tr>');
        return '<table class="board-square" aria-label="' + side + ' na ' + side + ' równych pól"><tbody>' + rows.join('') + '</tbody></table>';
      }
      default: return '';
    }
  }

  function boardSteps(steps, colorful = false) {
    return '<ol class="board-steps">' + steps.map((step, i) =>
      '<li' + (colorful ? ' class="' + boardTone(i) + '"' : '') + '>' + escape(step) + '</li>').join('') + '</ol>';
  }

  function renderMathBoard(visual) {
    const {title, steps, diagram, caption} = visual;
    const content = boardDiagram(diagram);
    let working = diagram?.[0] === 'columns' ? '' : boardSteps(steps);
    if (diagram?.[0] === 'groups' && diagram[3] > 0) {
      const [, count, size, remainder] = diagram;
      const grouped = count * size;
      const total = grouped + remainder;
      const number = value => value.toLocaleString('pl-PL');
      working = '<ol class="board-steps"><li><strong class="board-tens">' + count + ' × ' + size + ' = ' + number(grouped) +
        '</strong> w pełnych grupach</li><li><strong class="board-ones">' + number(total) + ' − ' + number(grouped) + ' = ' + remainder +
        '</strong> zostaje</li></ol><p class="board-equation">' + number(total) + ' : ' + size + ' = <strong class="board-tens">' +
        count + '</strong>, reszta <strong class="board-ones">' + remainder + '</strong></p>';
    }
    return '<figure class="class-board"><figcaption>' + escape(title) + '</figcaption>' + content + working +
      (caption ? '<p class="board-note">' + escape(caption) + '</p>' : '') + '</figure>';
  }

  function render(item) {
    if (item.category === 'math') return renderMathBoard(item.visual);
    const { steps, title, caption } = item.visual;
    const colors = { language: ['#f0ebfc', '#6352a3'], spelling: ['#fff0de', '#9b4e22'], stories: ['#e8f4e9', '#276b54'], writing: ['#e7f2fa', '#235f8b'] };
    const [pale, ink] = colors[item.category];
    function diagram(narrow) {
    const width = narrow ? 330 : 640;
    const count = steps.length, columns = narrow ? 1 : 2, rows = Math.ceil(count / columns), height = 54 + rows * 136;
    let shapes = `<rect width="${width}" height="${height}" rx="24" fill="${pale}"/>`;
    shapes += `<circle cx="31" cy="28" r="7" fill="${ink}"/>`;
    shapes += `<path d="M47 28H${width - 31}" stroke="${ink}" stroke-opacity=".18" stroke-width="2"/>`;
    steps.forEach((step, i) => {
      const [label, note] = step.split('|');
      const x = !narrow && count === 1 ? 170 : 22 + (i % columns) * 310, y = 49 + Math.floor(i / columns) * 136;
      const center = x + 143;
      shapes += `<rect x="${x}" y="${y}" width="286" height="116" rx="17" fill="white" stroke="${ink}" stroke-opacity=".2" stroke-width="2"/>`;
      const wrapped = lines(label);
      wrapped.forEach((line, row) => { shapes += text(line, center, y + (wrapped.length > 1 ? 33 : 45) + row * 26, label.length < 5 ? 32 : 23, ink); });
      shapes += text(note || '', center, y + 94, 18, '#55566b', 450);
    });
    const variant = narrow ? 'narrow' : 'wide';
    return `<svg class="diagram-${variant}" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="visual-title-${item.id}-${variant} visual-desc-${item.id}-${variant}" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}"><title id="visual-title-${item.id}-${variant}">${escape(title)}</title><desc id="visual-desc-${item.id}-${variant}">${escape(steps.map(s => s.replace('|', ': ')).join('. '))}</desc>${shapes}</svg>`;
    }
    return `<figure class="visual">${diagram(false)}${diagram(true)}<figcaption><strong>${escape(title)}</strong><span>${escape(caption)}</span></figcaption></figure>`;
  }
  function hero() {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 280" aria-hidden="true" class="hero-art"><circle cx="182" cy="145" r="112" fill="#e9e2f6"/><path d="M60 92Q122 67 180 98Q239 67 302 92L296 228Q231 208 180 237Q120 208 66 228Z" fill="#fffaf0" stroke="#66528e" stroke-width="4" stroke-linejoin="round"/><path d="M180 99V235" stroke="#b8a8cc" stroke-width="3"/><path d="M83 118Q124 103 162 122M83 141Q124 126 162 145M83 164Q124 149 162 168M200 118Q240 103 280 118M200 141Q240 126 280 141" fill="none" stroke="#ccc0dd" stroke-width="6" stroke-linecap="round"/><path d="M225 203L271 157L282 168L236 214L219 220Z" fill="#e9a05e" stroke="#875830" stroke-width="3"/><path d="M219 220L225 203L236 214Z" fill="#66528e"/><path d="M169 65C155 32 189 18 192 55C205 31 224 52 197 68" fill="#92b39b" stroke="#557e62" stroke-width="3"/><path d="M84 55L88 66L100 70L88 74L84 86L80 74L68 70L80 66Z" fill="#d48c52"/><circle cx="291" cy="57" r="7" fill="#a190c0"/><path d="M310 215L313 223L322 226L313 229L310 238L307 229L298 226L307 223Z" fill="#d48c52"/></svg>`;
  }
  root.HaniaVisuals = { render, hero, escape, lines, boardSteps };
  if (typeof module !== 'undefined') module.exports = root.HaniaVisuals;
})(typeof globalThis !== 'undefined' ? globalThis : window);
