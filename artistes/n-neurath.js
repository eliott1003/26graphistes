// N · Otto Neurath (avec Gerd Arntz et Marie Reidemeister) — Isotype.
// D'après le tableau « Home and Factory Weaving in England » (Gesellschaft und Wirtschaft, 1930).
// Un curseur des années : les tisserands à domicile disparaissent rangée par rangée, les ouvriers d'usine
// et les pièces de tissu apparaissent. Un bouton montre la « mauvaise méthode » : un seul picto qui grossit.
//
// ⚠ CHIFFRES PROVISOIRES. Ils ont l'allure du tableau mais ne sont pas encore relevés dessus.
// À remplacer par les valeurs du tableau d'origine (image fournie par Eliott), puis passer PROVISOIRE à false.
const PROVISOIRE = true;
const UNITE = { gens: 10000, tissu: 50 }; // 1 picto = 10 000 personnes ; 1 pièce = 50 millions de livres de tissu (à vérifier)
const DONNEES = [
  { an: 1820, main: 24, usine: 1, tissu: 2 },
  { an: 1830, main: 22, usine: 2, tissu: 4 },
  { an: 1840, main: 12, usine: 5, tissu: 7 },
  { an: 1850, main: 4, usine: 8, tissu: 11 },
  { an: 1860, main: 1, usine: 11, tissu: 16 },
  { an: 1870, main: 0, usine: 11, tissu: 18 },
  { an: 1880, main: 0, usine: 12, tissu: 21 },
];

// Pictos dans l'esprit de Gerd Arntz : silhouettes pleines, frontales, sans détail.
const P = {
  main: c => `<svg viewBox="0 0 40 40"><g fill="${c}"><circle cx="11" cy="7" r="5"/><path d="M5 14h12v13h-3v11h-6V27H5z"/><path d="M20 15h18v3H23v19h-3z"/><path d="M23 22h12v2H23z"/></g></svg>`,
  usine: c => `<svg viewBox="0 0 40 40"><g fill="${c}"><circle cx="20" cy="7" r="5"/><path d="M13 14h14v13h-4v11h-6V27h-4z"/></g></svg>`,
  tissu: c => `<svg viewBox="0 0 40 40"><g fill="${c}"><rect x="3" y="11" width="34" height="20" rx="2"/></g><g fill="#efe8d8"><rect x="9" y="11" width="2.5" height="20"/><rect x="28.5" y="11" width="2.5" height="20"/></g></svg>`,
};

export default {
  lettre: 'N',
  css: `
.nt{--noir:#1a1a1a;--rouge:#c4382b;--bleu:#2f5c8f;background:#efe8d8;color:#1a1a1a;padding:clamp(16px,2.4vw,34px);display:grid;gap:18px;font-family:Jost,Futura,sans-serif}
.nt-titre{display:flex;justify-content:space-between;align-items:baseline;gap:16px;flex-wrap:wrap}
.nt-titre h4{margin:0;font:700 clamp(20px,2.2vw,30px)/1.1 Jost,Futura,sans-serif;text-transform:uppercase;letter-spacing:.02em}
.nt-an{font:700 clamp(46px,6vw,92px)/.9 Jost,Futura,sans-serif;font-variant-numeric:tabular-nums}
.nt-rang{display:grid;grid-template-columns:clamp(110px,14vw,200px) 1fr;gap:14px;align-items:center;min-height:clamp(44px,5.4vw,64px);border-top:2px solid var(--noir);padding-top:8px}
.nt-rang b{font:500 15px/1.2 Jost,Futura,sans-serif}
.nt-rang small{display:block;font-size:12.5px;color:#5a554c;margin-top:2px}
.nt-pictos{display:flex;flex-wrap:wrap;gap:2px;align-items:flex-end;min-height:clamp(34px,4.2vw,48px)}
.nt-pictos svg{width:clamp(28px,3.4vw,44px);height:clamp(28px,3.4vw,44px);display:block;transform-origin:50% 100%;transition:transform .32s cubic-bezier(.3,1.5,.5,1)}
.nt-pictos svg.sort{transform:scale(0)}
.nt-gros{display:flex;align-items:flex-end;gap:24px;min-height:clamp(120px,20vw,260px)}
.nt-gros svg{display:block;transform-origin:50% 100%;transition:width .5s cubic-bezier(.3,1,.4,1),height .5s cubic-bezier(.3,1,.4,1)}
.nt-curseur{display:grid;gap:6px}
.nt-curseur input{width:100%;accent-color:var(--rouge)}
.nt-ans{display:flex;justify-content:space-between;font-size:13px;font-variant-numeric:tabular-nums}
.nt-bas{display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:space-between}
.nt-bas .bouton{border-color:var(--noir);color:var(--noir)}
.nt-bas .bouton[aria-pressed="true"]{background:var(--noir);color:#efe8d8}
.nt-prov{margin:0;font-size:12.5px;color:var(--rouge)}
`,
  monter(zone, ctx) {
    const RANGS = [
      { k: 'main', nom: 'Tisserands à domicile', u: 'un picto = 10 000 personnes', c: '#1a1a1a' },
      { k: 'usine', nom: 'Ouvriers d’usine', u: 'un picto = 10 000 personnes', c: '#c4382b' },
      { k: 'tissu', nom: 'Tissu produit', u: 'une pièce = 50 millions de livres', c: '#2f5c8f' },
    ];
    zone.innerHTML = `
      <div class="nt">
        <div class="nt-titre"><h4>Tissage en Angleterre, à domicile et à l’usine</h4><span class="nt-an" aria-live="polite"></span></div>
        <div class="nt-corps"></div>
        <div class="nt-curseur">
          <input type="range" min="0" max="${DONNEES.length - 1}" step="1" value="0" aria-label="Année">
          <div class="nt-ans">${DONNEES.map(d => `<span>${d.an}</span>`).join('')}</div>
        </div>
        <div class="nt-bas">
          <p class="note">Fais glisser les années. Neurath ne grossit jamais un picto : il le répète. Chaque picto vaut la même quantité, on compte sans lire un chiffre.</p>
          <button type="button" class="bouton" data-mauvais aria-pressed="false">Montrer la mauvaise méthode</button>
        </div>
        ${PROVISOIRE ? '<p class="nt-prov">Chiffres provisoires : à reprendre sur le tableau d’origine.</p>' : ''}
      </div>`;
    const corps = zone.querySelector('.nt-corps'), an = zone.querySelector('.nt-an'), curseur = zone.querySelector('input[type=range]'), btn = zone.querySelector('[data-mauvais]');
    let mauvais = false, minuteries = [];

    function bon(i) {
      if (!corps.querySelector('.nt-rang')) corps.innerHTML = RANGS.map(r => `<div class="nt-rang" data-k="${r.k}"><div><b>${r.nom}</b><small>${r.u}</small></div><div class="nt-pictos"></div></div>`).join('');
      RANGS.forEach(r => {
        const boite = corps.querySelector(`[data-k="${r.k}"] .nt-pictos`), voulu = DONNEES[i][r.k], vivants = [...boite.children].filter(s => !s.classList.contains('sort'));
        // on ajoute ou retire des pictos un par un, à la fin de la rangée : on voit la quantité changer
        if (vivants.length < voulu) for (let j = vivants.length; j < voulu; j++) {
          const t = document.createElement('template'); t.innerHTML = P[r.k](r.c); const s = t.content.firstChild;
          if (!ctx.reduireMouvement) { s.classList.add('sort'); minuteries.push(setTimeout(() => s.classList.remove('sort'), 20 + (j - vivants.length) * 28)); }
          boite.append(s);
        }
        else vivants.slice(voulu).reverse().forEach((s, j) => {
          if (ctx.reduireMouvement) { s.remove(); return; }
          minuteries.push(setTimeout(() => { s.classList.add('sort'); minuteries.push(setTimeout(() => s.remove(), 330)); }, j * 28));
        });
      });
    }
    function faux(i) {
      // la « mauvaise méthode » : un seul picto dont la taille suit le chiffre (on agrandit la hauteur, l'œil lit la surface)
      if (!corps.querySelector('.nt-gros')) corps.innerHTML = `<div class="nt-gros">${RANGS.map(r => `<div data-k="${r.k}">${P[r.k](r.c)}<small>${r.nom}</small></div>`).join('')}</div>`;
      const max = Math.max(...DONNEES.flatMap(d => RANGS.map(r => d[r.k]))), h = corps.querySelector('.nt-gros').clientHeight || 200;
      RANGS.forEach(r => { const s = corps.querySelector(`[data-k="${r.k}"] svg`), v = DONNEES[i][r.k] / max * h; s.style.width = s.style.height = Math.max(2, v) + 'px'; });
    }
    function montrer() { const i = +curseur.value; an.textContent = DONNEES[i].an; mauvais ? faux(i) : bon(i); }
    curseur.addEventListener('input', montrer);
    btn.addEventListener('click', () => {
      mauvais = !mauvais; btn.setAttribute('aria-pressed', String(mauvais));
      btn.textContent = mauvais ? 'Revenir à l’Isotype' : 'Montrer la mauvaise méthode';
      corps.innerHTML = ''; montrer();
    });
    montrer();
    // au premier affichage, les années défilent une fois toutes seules, pour montrer le geste
    if (!ctx.reduireMouvement) DONNEES.forEach((_, i) => i && minuteries.push(setTimeout(() => { if (!mauvais && +curseur.value === i - 1) { curseur.value = i; montrer(); } }, 700 + i * 650)));
    return () => minuteries.forEach(clearTimeout);
  },
};
