// N · Otto Neurath (avec Marie Reidemeister et Gerd Arntz) — Isotype.
// On part de la MAUVAISE méthode : un seul dessin par chiffre, plus ou moins gros. Un bouton, « Faire comme Neurath » :
// chaque gros dessin éclate en signes identiques qui se rangent et se comptent (un signe = toujours la même quantité).
//
// Deux tableaux, relevés le 13/11 sur les images d'Eliott (img/n/) :
//  - « Births and Deaths in Germany in a Year » (International Picture Language, 1936) : img/n/ref.jpg
//  - « Pig Iron Produced » (même série) : img/n/01.jpg
// Les quantités (nombre de signes par ligne) sont celles des tableaux. Les textes sont traduits en français.
// Les signes sont redessinés très simplement pour l'exercice : ce ne sont pas les dessins de Gerd Arntz,
// les tableaux d'origine sont montrés dans la page de gauche. Pour les remplacer : l'objet P ci-dessous.

const PAPIER = '#f5f3ee', ROUGE = '#e4381c', NOIR = '#22211f', TRAIT = '#5c1d16';

// Signes : boîte l × h, dessin plein, sans détail.
const P = {
  bebe: { l: 100, h: 70, d: c => `<g fill="${c}"><circle cx="23" cy="23" r="20"/><path d="M38 32h30c12 0 20 8 20 18v6H38z"/><path d="M40 42h12v26H40z"/><path d="M68 46h16v12h12v10H68z"/></g>` },
  cercueil: { l: 100, h: 70, d: c => `<path fill="${c}" d="M3 25 24 9l73 12v28L24 61 3 45z"/><g fill="${PAPIER}"><path d="M18 32.5h50v5H18z"/><path d="M33 20h5v30h-5z"/></g>` },
  lingot: { l: 60, h: 64, d: c => `<path fill="${c}" d="M4 60h52L47 6H13z"/><text x="30" y="46" text-anchor="middle" font-family="Archivo,Arial,sans-serif" font-weight="800" font-size="25" fill="${PAPIER}">Fe</text>` },
};

/* Chaque tableau donne : sa taille, ses textes, et la liste de ses séries.
   Une série = n signes ; bon = où va le signe i ; gros = où se tient le dessin unique de la mauvaise méthode. */
function naissances() {
  const L = 1300, H = 1040, AX = 440, PAS = 108, RANG = 205, Y0 = 122, MAX = 7, G = 2.08;
  const lignes = [['1911-14', 7, 4], ['1915-18', 4, 6], ['1919-22', 6, 4], ['1923-26', 5, 3]];
  const series = [], textes = [`<text x="88" y="76" font-size="42">Naissances et décès en Allemagne, par an</text>`];
  // à gauche du trait, on laisse le même écart qu'à droite
  const col = k => k >= 0 ? AX + 18 + k * PAS : AX - 18 - 100 + (k + 1) * PAS;
  lignes.forEach(([an, nais, dec], r) => {
    const y = Y0 + r * RANG, bas = y + 150, sn = nais / MAX * G, sd = dec / MAX * G;
    textes.push(`<text x="88" y="${y + 50}" font-size="42">${an}</text>`);
    series.push({ p: 'bebe', c: ROUGE, n: nais, u: 1, bon: i => [col(i), y], gros: [AX + 18, bas - 70 * sn, sn] });
    // les décès sont calés à droite sous les naissances : ce qui dépasse à gauche du trait, ce sont les morts en plus
    series.push({ p: 'cercueil', c: NOIR, n: dec, u: 1, bon: i => [col(nais - dec + i), y + 78], gros: [AX + 18 + 100 * sn + 34, bas - 70 * sd, sd] });
  });
  return {
    nom: 'Naissances et décès', L, H, series, textes,
    trait: `<path d="M${AX} 108V${Y0 + 3 * RANG + 162}" stroke="${TRAIT}" stroke-width="4"/>`,
    legende: {
      bon: ['1 signe rouge = 250 000 naissances par an', '1 signe noir = 250 000 décès par an'],
      mauvais: ['rouge : les naissances · noir : les décès', 'plus le dessin est gros, plus il y en a'],
      x: 88, y: 962, corps: 31,
    },
    question: '1915-18 : plus de naissances ou plus de décès ? Et combien ?',
    faux: 'Un chiffre plus grand, un dessin plus gros : c’est ce qu’on fait d’habitude. On voit que ça change, pas de combien. Faut-il comparer les hauteurs ou les surfaces ?',
    reponse: '1915-18 : 4 signes rouges, 6 noirs.',
    vrai: 'Un signe vaut toujours 250 000 personnes. Pour dire plus, Neurath ne grossit jamais le signe : il le répète, et on compte. Les décès sont calés à droite, sous les naissances. Pendant la guerre, deux cercueils passent de l’autre côté du trait : 500 000 morts de plus que de naissances, chaque année.',
    source: 'D’après Births and Deaths in Germany in a Year, International Picture Language, 1936.',
  };
}

function fonte() {
  const L = 1010, H = 940, AX = 502, PAS = 42, U = .63, RANG = 110, Y0 = 170, MAX = 11, G = 1.5;
  const lignes = [[1900, 3, 5.5], [1913, 6, 9.5], [1920, 7.5, 5], [1921, 3.5, 3.5], [1929, 8.5, 11], [1932, 2, 5.5]];
  const series = [], textes = [`<text x="${L / 2}" y="84" font-size="40" text-anchor="middle">Production de fonte</text>`];
  lignes.forEach(([an, usa, autres], r) => {
    const y = Y0 + r * RANG, bas = y + 70, su = usa / MAX * G, sa = autres / MAX * G;
    textes.push(`<text x="40" y="${y + 42}" font-size="30">${an}</text>`);
    // les deux côtés partent du même trait ; le demi-signe est au bout de la rangée
    series.push({ p: 'lingot', c: '#c5281c', n: usa, u: U, demi: 'droite', bon: i => [AX - 10 - (i + 1) * PAS + 2, y + 14], gros: [AX - 10 - 60 * su, bas - 64 * su, su] });
    series.push({ p: 'lingot', c: NOIR, n: autres, u: U, demi: 'gauche', bon: i => [AX + 10 + i * PAS + 2, y + 14], gros: [AX + 10, bas - 64 * sa, sa] });
  });
  textes.push(`<text x="${AX - 14}" y="${Y0 + 6 * RANG + 16}" font-size="29" text-anchor="end" fill="#c5281c">aux États-Unis</text>`,
    `<text x="${AX + 14}" y="${Y0 + 6 * RANG + 16}" font-size="29" fill="${NOIR}">dans les autres pays</text>`);
  return {
    nom: 'Fonte', L, H, series, textes, trait: '',
    legende: {
      bon: ['1 signe = 5 millions de tonnes'],
      mauvais: ['plus le lingot est gros, plus on a produit'],
      x: 40, y: Y0 + 6 * RANG + 74, corps: 29,
    },
    question: '1929 : combien de fonte aux États-Unis ? Plus que dans tous les autres pays réunis ?',
    faux: 'Deux lingots par année, plus ou moins gros. Impossible de lire une quantité, et les petites années disparaissent presque.',
    reponse: '1929 : 8 signes et demi rouges, 11 noirs.',
    vrai: 'Un signe vaut toujours 5 millions de tonnes : 42,5 millions aux États-Unis, 55 ailleurs. Les deux côtés partent du même trait, on compare d’un coup d’œil. Et la crise se voit : en 1932, il ne reste que 2 signes rouges.',
    source: 'D’après Pig Iron Produced, tableau Isotype des années 1930.',
  };
}

const TABLEAUX = [naissances, fonte];

export default {
  lettre: 'N',
  css: `
.nt{display:grid;grid-template-rows:minmax(0,1fr) auto;gap:clamp(10px,2cqh,18px);height:100cqh;color:#1a1a1a}
.nt-haut{min-height:0;container-type:size;display:grid;place-items:center}
.nt-feuille{height:min(100cqh,calc(100cqw/var(--r)));aspect-ratio:var(--r);background:${PAPIER};box-shadow:0 0 0 1px rgba(0,0,0,.14),0 22px 44px -30px rgba(0,0,0,.5)}
.nt-feuille svg{display:block;width:100%;height:100%}
.nt-feuille text{font-family:"Gill Sans","Gill Sans MT","Gill Sans Nova",Jost,Futura,sans-serif;font-weight:500;fill:${NOIR};letter-spacing:.01em}
.nt-s{transition:transform .8s cubic-bezier(.55,0,.12,1);transition-delay:calc(var(--i)*38ms)}
.nt-fixe .nt-s{transition:none}
.nt-leg{transition:opacity .35s}
.nt-leg[data-l="bon"],.nt-ok .nt-leg[data-l="mauvais"]{opacity:0}
.nt-ok .nt-leg[data-l="bon"]{opacity:1;transition-delay:.7s}
.nt-bas{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,1.35fr) minmax(0,.9fr);gap:clamp(14px,2.6cqw,30px);height:clamp(158px,29cqh,184px);align-items:start}
.nt-bas > div{display:grid;gap:9px;align-content:start;justify-items:start}
.nt-bas p{margin:0}
.nt-etat{padding:6px 11px 5px;font:800 clamp(14px,2.3cqh,17px)/1.1 Archivo,sans-serif;text-transform:uppercase;letter-spacing:.03em;background:${ROUGE};color:#fff}
.nt-ok .nt-etat{background:#1a1a1a}
.nt-question{font:700 clamp(16px,2.8cqh,21px)/1.18 Jost,Futura,sans-serif;min-height:3.54em}
.nt-texte{font-size:clamp(13px,2.05cqh,14.5px);line-height:1.38}
.nt .nt-go{min-height:46px;font-size:15.5px;padding:9px 18px}
.nt-tabs{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.nt .nt-tabs .bouton{min-height:34px;padding:5px 11px;font-size:13px}
.nt .nt-tabs .bouton[aria-pressed="true"]{background:#1a1a1a;border-color:#1a1a1a;color:#efe8d8}
.nt .note{font-size:12px;line-height:1.3}
@media (max-width:760px){.nt{height:auto;grid-template-rows:auto auto}.nt-haut{container-type:inline-size}.nt-feuille{height:auto;width:100%}.nt-bas{grid-template-columns:1fr;height:auto}.nt-question{min-height:0}}
`,
  monter(zone, ctx) {
    zone.innerHTML = `
      <div class="nt${ctx.reduireMouvement ? ' nt-fixe' : ''}">
        <div class="nt-haut"><div class="nt-feuille"></div></div>
        <div class="nt-bas">
          <div>
            <p class="nt-etat" aria-live="polite"></p>
            <p class="nt-question"></p>
            <button type="button" class="bouton plein nt-go" data-go></button>
          </div>
          <div><p class="nt-texte"></p></div>
          <div>
            <div class="nt-tabs"><span class="etiquette">Tableau :</span>${TABLEAUX.map((f, k) => `<button type="button" class="bouton" data-tab="${k}"></button>`).join('')}</div>
            <p class="note"></p>
          </div>
        </div>
      </div>`;
    const racine = zone.querySelector('.nt'), feuille = zone.querySelector('.nt-feuille');
    const etat = zone.querySelector('.nt-etat'), question = zone.querySelector('.nt-question'), texte = zone.querySelector('.nt-texte');
    const go = zone.querySelector('[data-go]'), note = zone.querySelector('.note'), onglets = [...zone.querySelectorAll('[data-tab]')];
    const tableaux = TABLEAUX.map(f => f());
    onglets.forEach((b, k) => { b.textContent = tableaux[k].nom; });
    let t = tableaux[0], isotype = false, signes = [];

    function construire(k) {
      t = tableaux[k]; isotype = false; signes = [];
      feuille.style.setProperty('--r', (t.L / t.H).toFixed(4));
      let svg = `<svg viewBox="0 0 ${t.L} ${t.H}" role="img"><defs>
        <clipPath id="nt-demi-gauche"><rect x="-2" y="-2" width="32" height="70"/></clipPath>
        <clipPath id="nt-demi-droite"><rect x="30" y="-2" width="32" height="70"/></clipPath></defs>${t.trait}${t.textes.join('')}`;
      ['mauvais', 'bon'].forEach(l => {
        svg += `<g class="nt-leg" data-l="${l}">${t.legende[l].map((s, j) => `<text x="${t.legende.x}" y="${t.legende.y + j * t.legende.corps * 1.32}" font-size="${t.legende.corps}">${s}</text>`).join('')}</g>`;
      });
      t.series.forEach((s, si) => {
        const nb = Math.ceil(s.n), demi = nb !== s.n;
        // le demi-signe d'abord : dans la mauvaise méthode, il reste caché sous les signes entiers
        for (let i = nb - 1; i >= 0; i--) {
          const coupe = demi && i === nb - 1 ? ` clip-path="url(#nt-demi-${s.demi})"` : '';
          svg += `<g class="nt-s" data-s="${si}" data-i="${i}" style="--i:${i}"><g${coupe}>${P[s.p].d(s.c)}</g></g>`;
        }
      });
      feuille.innerHTML = svg + '</svg>';
      signes = [...feuille.querySelectorAll('.nt-s')].map(g => ({ g, s: t.series[+g.dataset.s], i: +g.dataset.i }));
      onglets.forEach((b, j) => b.setAttribute('aria-pressed', String(j === k)));
      note.textContent = `${t.source} Signes redessinés simplement pour l’exercice.`;
      // on pose l'état de départ sans animation
      racine.classList.add('nt-fixe'); poser(); void feuille.offsetWidth;
      if (!ctx.reduireMouvement) racine.classList.remove('nt-fixe');
    }
    function poser() {
      signes.forEach(({ g, s, i }) => {
        const [x, y, e] = isotype ? [...s.bon(i), s.u] : s.gros;
        g.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) scale(${e.toFixed(3)})`;
      });
      racine.classList.toggle('nt-ok', isotype);
      etat.textContent = isotype ? 'La méthode de Neurath' : 'La mauvaise méthode';
      question.textContent = isotype ? t.reponse : t.question;
      texte.textContent = isotype ? t.vrai : t.faux;
      go.textContent = isotype ? 'Revoir la mauvaise méthode' : 'Faire comme Neurath';
      go.classList.toggle('plein', !isotype);
      feuille.querySelector('svg').setAttribute('aria-label', `${t.nom}, ${isotype ? 'en signes Isotype que l’on compte' : 'avec un seul dessin par chiffre, plus ou moins gros'}`);
    }
    go.addEventListener('click', () => { isotype = !isotype; poser(); });
    onglets.forEach((b, k) => b.addEventListener('click', () => { if (tableaux[k] !== t) construire(k); }));
    construire(0);
    return () => { feuille.innerHTML = ''; };
  },
};
