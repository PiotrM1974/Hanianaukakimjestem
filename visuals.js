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
  function render(item) {
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
  root.HaniaVisuals = { render, hero, escape, lines };
  if (typeof module !== 'undefined') module.exports = root.HaniaVisuals;
})(typeof globalThis !== 'undefined' ? globalThis : window);
