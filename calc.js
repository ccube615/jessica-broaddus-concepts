(() => {
  const root = document.getElementById('mc');
  if (!root) return;

  const {
    accent,
    onAccent,
    ink,
    line
  } = root.dataset;

  const pairs = [
    ['price', 'price-n'],
    ['down', 'down-n'],
    ['rate', 'rate-n']
  ];
  const get = id => document.getElementById(`mc-${id}`);

  const parseNum = v => {
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  };
  const money = x => '$' + Math.round(x).toLocaleString('en-US');

  const setBar = (el, pct) => {
    el.style.width = pct.toFixed(2) + '%';
  };

  const termButtons = Array.from(root.querySelectorAll('button.mc-term'));
  const getTerm = () => {
    const sel = termButtons.find(b => b.getAttribute('aria-pressed') === 'true');
    return sel ? +sel.dataset.years : 30;
  };
  const styleTerms = () => {
    termButtons.forEach(b => {
      const sel = b.getAttribute('aria-pressed') === 'true';
      b.style.background = sel ? accent : 'transparent';
      b.style.color = sel ? onAccent : ink;
      b.style.borderColor = sel ? accent : line;
    });
  };
  termButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      termButtons.forEach(b => b.setAttribute('aria-pressed', 'false'));
      btn.setAttribute('aria-pressed', 'true');
      styleTerms();
      recompute();
    });
  });
  styleTerms();

  const syncRange = (range, number) => {
    range.addEventListener('input', () => {
      number.value = range.value;
      recompute();
    });
    number.addEventListener('input', () => {
      range.value = number.value;
      recompute();
    });
  };
  pairs.forEach(([r, n]) => syncRange(get(r), get(n)));

  ['tax', 'ins', 'hoa', 'pmi'].forEach(id => {
    const el = get(id);
    el && el.addEventListener('input', recompute);
  });

  function recompute() {
    const price = parseNum(get('price-n').value);
    const downPct = parseNum(get('down-n').value);
    const rate = parseNum(get('rate-n').value);
    const tax = parseNum(get('tax').value);
    const ins = parseNum(get('ins').value);
    const hoa = parseNum(get('hoa').value);
    const pmi = parseNum(get('pmi').value);
    const term = getTerm();

    const down = price * downPct / 100;
    const loan = Math.max(price - down, 0);
    const r = rate / 1200;
    const n = term * 12;
    const pi = loan === 0 ? 0 : (r === 0 ? loan / n : loan * r / (1 - Math.pow(1 + r, -n)));
    const taxM = tax / 12;
    const insM = ins / 12;
    const hoaM = hoa;
    const pmiM = downPct < 20 ? loan * pmi / 100 / 12 : 0;
    const total = pi + taxM + insM + hoaM + pmiM;

    // outputs
    get('total').textContent = money(total);
    get('loan').textContent = money(loan);
    get('downtext').textContent = `${money(down)} (${downPct}%)`;
    get('v-pi').textContent = money(pi);
    get('v-tax').textContent = money(taxM);
    get('v-ins').textContent = money(insM);
    get('v-pmi').textContent = money(pmiM);
    get('v-hoa').textContent = money(hoaM);
    const lPmi = get('l-pmi');
    if (lPmi) lPmi.textContent = downPct < 20 ? 'PMI' : 'PMI (none at 20% down)';

    // bars
    const set = (id, val) => setBar(get(id), total ? val / total * 100 : 0);
    set('s-pi', pi);
    set('s-tax', taxM);
    set('s-ins', insM);
    set('s-pmi', pmiM);
    set('s-hoa', hoaM);
  }

  recompute();
})();
