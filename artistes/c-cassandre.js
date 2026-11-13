// C · A.M. Cassandre — Dubo, Dubon, Dubonnet (triptyque, 1932).
// Le geste : on tape D-U-B-O-N-N-E-T ; chaque bonne lettre fait avancer l'affiche d'un cran. Retour arrière : un cran en arrière.
//
// L'affiche est encore protégée (Cassandre est mort en 1968) : elle n'est pas redessinée en code. L'atelier a trois états, du plus fidèle au provisoire :
//   1. ETAPES = 9 : les neuf images fabriquées par Eliott (img/c/etape-0.jpg … etape-8.jpg), une par lettre. C'est le concept validé.
//   2. sinon, si l'image du triptyque est déclarée dans labo/donnees.js (images: [{ f: 'ref.jpg', … }]) : la vraie affiche se découvre
//      de gauche à droite, D-U-B-O pour le premier panneau, N pour le deuxième, N-E-T pour le troisième.
//   3. sinon (PROVISOIRE, état actuel) : seulement le mot, en trois lignes, DUBO, DUBON, DUBONNET : les lettres au trait se remplissent.
// À fournir par Eliott : c-ref.jpg (le triptyque en largeur), et si possible les neuf étapes.

const MOT = 'DUBONNET';
const ETAPES = 9;                        // img/c/etape-0.jpg … etape-8.jpg (images finales d'Eliott, reçues le 13/11 à 4 h, recadrées en 1200 × 1600)
const PANNEAUX = [0, 1 / 3, 2 / 3, 1];   // bords des trois panneaux dans img/c/ref.jpg, en part de la largeur (à caler sur l'image)
const FAUSSE_LETTRE = 'rien';            // 'rien' : une fausse lettre ne change rien ; 'debut' : elle renvoie au début
const PAPIER = '#efe2c4', NOIR = '#17130f';
const LIGNES = [4, 5, 8];                // DUBO, DUBON, DUBONNET

/* part de l'affiche découverte après n lettres (état 2) */
function decouvert(n) {
  const [a, b, c, d] = PANNEAUX;
  if (n <= 4) return a + (b - a) * n / 4;
  if (n === 5) return c;
  return c + (d - c) * (n - 5) / 3;
}
/* lettres pleines de la ligne j après n lettres (état 3) : DUBO lettre à lettre, DUBON d'un coup, puis N, E, T */
const pleines = (j, n) => j === 0 ? Math.min(n, 4) : j === 1 ? (n >= 5 ? 5 : 0) : (n >= 6 ? n : 0);
const ligne = classe => `<p class="cs-ligne ${classe}" aria-hidden="true">${[...MOT].map(c => `<span>${c}</span>`).join('')}</p>`;

export default {
  lettre: 'C',
  clavier: true,
  css: `
.cs{display:grid;grid-template-rows:minmax(0,1fr) auto;gap:clamp(12px,2.6cqh,26px);height:100cqh;justify-items:center}
.cs-affiche{position:relative;min-height:0;width:100%;display:grid;place-items:center;align-content:center;gap:clamp(10px,2.4cqh,24px);cursor:text}
.cs-saisie{position:absolute;inset:0;width:100%;height:100%;opacity:0;font-size:16px;border:0;padding:0;background:transparent;color:transparent;caret-color:transparent;cursor:text}
.cs-ligne{display:flex;justify-content:space-between;margin:0;font:700 1em/1 Jost,Futura,"Century Gothic",sans-serif;--k:var(--e);--fd:var(--c)}
.cs-ligne span{color:var(--fd);-webkit-text-stroke:.036em var(--k);paint-order:stroke fill}   /* le fond repeint l'intérieur : il ne reste que le contour */
.cs-ligne span.plein{color:var(--k)}
.cs-ligne span.suivante{-webkit-text-stroke-width:.06em}
.cs-feuille{container-type:inline-size;width:min(100%,calc((100cqh - 150px)*1.86));background:${PAPIER};color:${NOIR};box-shadow:0 0 0 1px rgba(0,0,0,.2),0 26px 50px -30px rgba(0,0,0,.7)}
.cs-feuille .cs-ligne{font-size:15.6cqw;padding:2.3cqw 4.2cqw 1.1cqw;--k:${NOIR};--fd:${PAPIER}}
.cs-feuille .cs-ligne + .cs-ligne{border-top:.28cqw solid ${NOIR}}
.cs-image{display:block;max-width:100%;max-height:calc(100cqh - 250px);box-shadow:0 0 0 1px rgba(0,0,0,.25),0 26px 50px -30px rgba(0,0,0,.7)}
.cs-etape{display:block;height:calc(100cqh - 96px);width:auto;max-width:100%;object-fit:contain;box-shadow:0 0 0 1px rgba(0,0,0,.25),0 26px 50px -30px rgba(0,0,0,.7)}
.cs-trip{position:relative;max-width:100%;line-height:0;overflow:hidden;box-shadow:0 0 0 1px rgba(0,0,0,.25),0 26px 50px -30px rgba(0,0,0,.7)}
.cs-trip .cs-image{box-shadow:none}
.cs-cache{position:absolute;top:0;bottom:0;right:0;left:0;background:${PAPIER};transition:left .26s cubic-bezier(.6,0,.2,1)}
.cs-mot{width:min(100%,560px);font-size:clamp(34px,9cqh,74px)}
.cs.non .cs-affiche > :not(.cs-saisie){animation:cs-non .22s linear}
@keyframes cs-non{25%{transform:translateX(-7px)}75%{transform:translateX(7px)}}
.cs-bas{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:10px 22px;width:100%}
.cs-bas p{margin:0}
.cs-bas .note{max-width:52ch}
.cs-boutons{display:flex;flex-wrap:wrap;gap:8px}
@media (max-width:760px){.cs{height:auto}.cs-feuille{width:100%}.cs-image{max-height:none}.cs-etape{height:auto;width:100%}.cs-mot{font-size:11vw}}
@media (prefers-reduced-motion:reduce){.cs-cache{transition:none}.cs.non .cs-affiche > :not(.cs-saisie){animation:none}}
`,
  monter(zone, ctx) {
    const ref = ctx.artiste.images?.[0], dossier = ctx.racine + 'img/c/';
    const mode = ETAPES === MOT.length + 1 ? 1 : ref ? 2 : 3;
    const affiche = mode === 1 ? `<img class="cs-etape" data-etape alt="">`
      : mode === 2 ? `<div class="cs-trip"><img class="cs-image" src="${dossier}${ref.f}" alt="Dubo, Dubon, Dubonnet, affiche d’A.M. Cassandre, 1932"><div class="cs-cache"></div></div>`
      : `<div class="cs-feuille">${LIGNES.map(() => ligne('')).join('')}</div>`;
    const notes = {
      1: 'Tape les huit lettres dans l’ordre : à chaque lettre, le buveur se remplit un peu plus, comme sur la série de 1932. Retour arrière : une lettre en moins.',
      2: 'Tape les huit lettres dans l’ordre : l’affiche se découvre, DUBO, puis DUBON, puis DUBONNET. Retour arrière : une lettre en moins.',
      3: 'Sur l’affiche, le mot se remplit en trois temps, comme le buveur : DUBO, DUBON, DUBONNET. Tape les huit lettres dans l’ordre. Retour arrière : une lettre en moins.',
    };
    zone.innerHTML = `
      <div class="cs">
        <div class="cs-affiche">${affiche}${mode === 2 ? ligne('cs-mot') : ''}
          <input class="cs-saisie" type="text" aria-label="Tape D, U, B, O, N, N, E, T" autocomplete="off" autocapitalize="characters" spellcheck="false"></div>
        <div class="cs-bas">
          <p class="etiquette" aria-live="polite"></p>
          <p class="note">${notes[mode]}</p>
          <div class="cs-boutons">
            <button type="button" class="bouton" data-reculer>Effacer une lettre</button>
            <button type="button" class="bouton" data-debut>Recommencer</button>
          </div>
        </div>
      </div>`;
    const bloc = zone.querySelector('.cs'), saisie = zone.querySelector('.cs-saisie'), info = zone.querySelector('.etiquette');
    const lignes = [...zone.querySelectorAll('.cs-ligne')].map(p => [...p.children]);
    const etape = zone.querySelector('[data-etape]'), cache = zone.querySelector('.cs-cache');
    if (mode === 1) for (let i = 0; i <= MOT.length; i++) new Image().src = `${dossier}etape-${i}.jpg`; // tout est chargé avant la première frappe
    let n = 0, minuterie = 0;

    function montrer() {
      if (etape) { etape.src = `${dossier}etape-${n}.jpg`; etape.alt = n ? `L’affiche après ${MOT.slice(0, n)}` : 'L’affiche avant la première lettre'; }
      if (cache) cache.style.left = (decouvert(n) * 100).toFixed(3) + '%';
      lignes.forEach((spans, j) => {
        const k = mode === 3 ? pleines(j, n) : n;
        spans.forEach((s, i) => { s.classList.toggle('plein', i < k); s.classList.toggle('suivante', i === n && (mode !== 3 || j === (n < 4 ? 0 : n < 5 ? 1 : 2))); });
      });
      info.textContent = n === 0 ? 'Première lettre : D.' : n === MOT.length ? 'Dubo, Dubon, Dubonnet.' : `${MOT.slice(0, n)} · lettre suivante : ${MOT[n]}.`;
    }
    function refuser() {
      if (FAUSSE_LETTRE === 'debut') { n = 0; montrer(); }
      if (ctx.reduireMouvement) return;
      bloc.classList.remove('non'); void bloc.offsetWidth; bloc.classList.add('non');
      clearTimeout(minuterie); minuterie = setTimeout(() => bloc.classList.remove('non'), 260);
    }
    function essayer(c) {
      if (n >= MOT.length) return;
      if (c !== MOT[n]) { refuser(); return; }
      n++; montrer(); if (n === MOT.length) ctx.annoncer?.('Dubonnet : l’affiche est complète.');
    }
    const reculer = () => { if (n > 0) { n--; montrer(); } };

    function taper(e) {
      if (e.metaKey || e.ctrlKey || e.altKey || e.key === 'Escape') return;     // Échap ferme le livre
      const el = e.target instanceof Element ? e.target : null;
      if (el?.closest('input,textarea,select') && el !== saisie) return;
      if (el?.closest('button') && (e.key === 'Enter' || e.key === ' ')) return;
      if (e.key === 'Backspace') reculer();
      else if (/^[a-z]$/i.test(e.key)) essayer(e.key.toUpperCase());
      else return;
      e.preventDefault(); saisie.value = '';
    }
    addEventListener('keydown', taper);
    // clavier du téléphone : la frappe arrive par le champ invisible posé sur l'affiche
    saisie.addEventListener('input', () => { [...saisie.value.toUpperCase()].forEach(c => { if (/[A-Z]/.test(c)) essayer(c); }); saisie.value = ''; });
    zone.querySelector('[data-reculer]').addEventListener('click', reculer);
    zone.querySelector('[data-debut]').addEventListener('click', () => { n = 0; montrer(); });
    montrer();
    return () => { clearTimeout(minuterie); removeEventListener('keydown', taper); };
  },
};
