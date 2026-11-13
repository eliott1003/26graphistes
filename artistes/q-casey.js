// Q · Jacqueline Casey — Ocean Engineering at MIT (affiche pour le MIT, le nautile dans la vague).
// Le geste (proposition du 12/11, à confirmer par Eliott) : faire grandir le nautile. À chaque cran de molette, flèche ou clic,
// une loge s'ajoute à la spirale et la mer monte d'un cran. Chaque loge est plus grande que la précédente, toujours dans la même proportion :
// c'est une spirale logarithmique, tracée ici par le calcul.
// À la dernière loge, l'atelier montre l'affiche de Casey (img/q/ref.jpg) quand elle est fournie.
//
// L'affiche est protégée (Jacqueline Casey est morte en 1992) : elle n'est pas redessinée en code. Le nautile est une construction géométrique,
// pas une copie de son dessin ; la fidélité passe par l'image d'Eliott, montrée à côté et à la fin.
// PROVISOIRE tant que img/q/ref.jpg manque (à déclarer dans labo/donnees.js : images: [{ f: 'ref.jpg', t: '…' }]) :
//   format de la feuille, bleu, hauteur finale de la mer, sens et position du nautile sont à caler sur l'image ; la dernière loge ne retombe pas encore sur l'affiche.

const LOGES = 30, DEPART = 6;          // nombre de loges à la fin, au départ
const CROISSANCE = 3;                  // le rayon triple à chaque tour
const PAR_TOUR = 13;                   // loges par tour
const CORPS = .32;                     // la dernière loge, ouverte (celle où vit l'animal), en part de tour
const OUVERTURE = -2.05;               // direction de l'ouverture à la fin, en radians (0 = vers la droite, négatif = vers le haut)
const FORMAT = .7;                     // largeur / hauteur de la feuille, tant que l'affiche n'est pas là
const RECUL = .6;                      // 0 : échelle fixe (le nautile part minuscule) ; 1 : il remplit toujours la feuille ; entre les deux, on recule à mesure qu'il grandit
const MER = [.90, .47];                // hauteur de la surface de l'eau, de la première à la dernière loge (0 = haut de la feuille)
const PAPIER = '#f4f1e7', BLEU = '#0d5fa8', JAUNE = '#ffd23f';
const TAU = Math.PI * 2, PAS = TAU / PAR_TOUR;

const rayon = th => Math.pow(CROISSANCE, th / TAU);               // la spirale : r = 3^(tours)
const TH_FIN = LOGES * PAS + CORPS * TAU, R_FIN = rayon(TH_FIN);
const point = (th, r) => [r * Math.cos(th - TH_FIN + OUVERTURE), r * Math.sin(th - TH_FIN + OUVERTURE)];
/* encombrement de la coquille finie, pour la centrer dans la feuille */
const BOITE = (() => { let a = 1e9, b = -1e9, c = 1e9, d = -1e9; for (let th = TH_FIN - TAU; th <= TH_FIN; th += .02) { const [x, y] = point(th, rayon(th)); a = Math.min(a, x); b = Math.max(b, x); c = Math.min(c, y); d = Math.max(d, y); } return { x0: a, x1: b, y0: c, y1: d }; })();

export default {
  lettre: 'Q',
  css: `
.cy{--f:${FORMAT};display:grid;grid-template-columns:auto minmax(190px,270px);gap:clamp(16px,3cqw,44px);justify-content:center;align-items:end;height:100cqh}
.cy-feuille{position:relative;height:min(100cqh,calc((100cqw - 320px)/var(--f)));aspect-ratio:var(--f);background:${PAPIER};cursor:pointer;touch-action:manipulation;box-shadow:0 0 0 1px rgba(255,255,255,.3),0 26px 50px -30px rgba(0,0,0,.7)}
.cy-feuille canvas{display:block;width:100%;height:100%}
.cy-vraie{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
.cy-vraie[hidden]{display:none}
.cy-cote{display:grid;gap:clamp(8px,1.6cqh,14px);align-content:end;padding-bottom:4px;min-height:0}
.cy-cote p{margin:0}
.cy-ref{height:clamp(90px,24cqh,200px);width:auto;display:block;box-shadow:0 0 0 1px rgba(255,255,255,.4)}
.cy-compte{font:900 clamp(40px,11cqh,84px)/.86 "Sofia Cond",Impact,sans-serif}
.cy-compte small{font:600 13px/1.3 Archivo,sans-serif;display:block;margin-top:6px}
.cy-boutons{display:flex;flex-wrap:wrap;gap:8px}
.cy-boutons .bouton{flex:1 1 120px}
@media (max-width:760px){.cy{grid-template-columns:1fr;height:auto}.cy-feuille{height:auto;width:min(100%,calc(64svh*var(--f)));justify-self:center}}
`,
  monter(zone, ctx) {
    const ref = ctx.artiste.images?.[0];
    zone.innerHTML = `
      <div class="cy">
        <div class="cy-feuille"><canvas data-export aria-label="Un nautile en coupe : chaque cran lui ajoute une loge et fait monter la mer"></canvas>
          ${ref ? `<img class="cy-vraie" src="${ctx.racine}img/q/${ref.f}" alt="Ocean Engineering at MIT, affiche de Jacqueline Casey" hidden>` : ''}</div>
        <div class="cy-cote">
          ${ref ? `<img class="cy-ref" src="${ctx.racine}img/q/${ref.f}" alt="">` : ''}
          <p class="cy-compte" aria-live="polite"></p>
          <p class="note">Molette, flèches haut et bas, ou clic sur la feuille : une loge de plus, et la mer monte d’un cran. Chaque loge est ${Math.pow(CROISSANCE, 1 / PAR_TOUR).toFixed(2).replace('.', ',')} fois plus grande que la précédente, toujours dans la même proportion.</p>
          <div class="cy-boutons">
            <button type="button" class="bouton plein" data-plus>Ajouter une loge</button>
            <button type="button" class="bouton" data-moins>Retirer une loge</button>
            <button type="button" class="bouton" data-debut>Revenir au début</button>
          </div>
        </div>
      </div>`;
    const bloc = zone.querySelector('.cy'), feuille = zone.querySelector('.cy-feuille'), cv = feuille.querySelector('canvas'), x = cv.getContext('2d');
    const vraie = zone.querySelector('.cy-vraie'), compte = zone.querySelector('.cy-compte');
    let n = DEPART, t = DEPART, L = 0, H = 0, dpr = 1, raf = 0, vivant = true, cumul = 0;

    function mesurer() {
      const r = feuille.getBoundingClientRect(); if (!r.width) return;
      dpr = Math.min(devicePixelRatio || 1, 2); L = r.width; H = r.height; cv.width = Math.round(L * dpr); cv.height = Math.round(H * dpr); dessiner();
    }
    /* la coquille après t loges (t peut être entre deux entiers pendant l'animation) */
    function coquille(encre, chair, derniere) {
      const thOuv = t * PAS + CORPS * TAU, paroi = .05, pas = .03;
      const taille = rayon(thOuv) / R_FIN, tourne = thOuv - TH_FIN, co = Math.cos(tourne), si = Math.sin(tourne);
      const k = L * .80 / (BOITE.x1 - BOITE.x0) * Math.pow(taille, -RECUL);
      // la coquille reste centrée : son milieu tourne et grandit avec elle
      const mx = (BOITE.x0 + BOITE.x1) / 2 * taille, my = (BOITE.y0 + BOITE.y1) / 2 * taille;
      const ox = L * .5 - (mx * co - my * si) * k, oy = H * .43 - (mx * si + my * co) * k;
      const P = (th, r) => { const [a, b] = point(th, r); return [ox + a * k, oy + b * k]; };
      const arc = (a, b, f, premier) => { const nb = Math.max(2, Math.ceil(Math.abs(b - a) / pas)); for (let i = premier ? 0 : 1; i <= nb; i++) { const th = a + (b - a) * i / nb, p = P(th, f(th)); if (i === 0) x.moveTo(p[0], p[1]); else x.lineTo(p[0], p[1]); } };
      const cloison = (th, versLeCentre) => {            // bombée vers l'arrière, comme dans la coquille
        const ro = rayon(th) * (1 - paroi), ri = rayon(th - TAU), a = P(th, versLeCentre ? ri : ro), c = P(th - PAS * .85, (ro + ri) / 2);
        x.quadraticCurveTo(c[0], c[1], a[0], a[1]);
      };
      // la forme pleine : le dernier tour de la spirale, refermé par l'ouverture
      x.beginPath(); arc(thOuv - TAU, thOuv, rayon, true); x.closePath(); x.fillStyle = chair; x.fill();
      // la loge qui vient de se fermer
      const d = Math.floor(t + 1e-6) - 1;
      if (d >= 0) {
        const a = d * PAS, b = (d + 1) * PAS;
        x.beginPath(); arc(a, b, th => rayon(th) * (1 - paroi), true); cloison(b, true); arc(b, a, th => rayon(th - TAU), false); cloison(a, false); x.closePath();
        x.fillStyle = derniere; x.fill();
      }
      // la paroi : son épaisseur grandit avec le rayon
      x.beginPath(); arc(-TAU * 1.6, thOuv, rayon, true); arc(thOuv, -TAU * 1.6, th => rayon(th) * (1 - paroi), false); x.closePath(); x.fillStyle = encre; x.fill();
      // les cloisons
      x.strokeStyle = encre; x.lineCap = 'round';
      for (let i = 0; i <= Math.floor(t + 1e-6); i++) {
        const th = i * PAS, ro = rayon(th) * (1 - paroi), a = P(th, ro);
        x.beginPath(); x.moveTo(a[0], a[1]); cloison(th, true); x.lineWidth = Math.max(.6, rayon(th) * k * .02); x.stroke();
      }
    }
    function dessiner() {
      if (!L) return;
      x.setTransform(dpr, 0, 0, dpr, 0, 0);
      const part = (t - DEPART) / (LOGES - DEPART), niveau = H * (MER[0] + (MER[1] - MER[0]) * part), houle = L * .03, phase = t * .9;
      const vague = () => { for (let i = 0; i <= 60; i++) { const px = L * i / 60; x.lineTo(px, niveau + houle * Math.sin(px / L * TAU * 1.15 + phase)); } };
      x.fillStyle = PAPIER; x.fillRect(0, 0, L, H);
      coquille(BLEU, '#ffffff', JAUNE);                                                                                                               // hors de l'eau : bleu sur papier
      x.save(); x.beginPath(); x.moveTo(0, H); vague(); x.lineTo(L, H); x.closePath(); x.clip(); x.fillStyle = BLEU; x.fillRect(0, 0, L, H); coquille('#ffffff', '#1f74bd', JAUNE); x.restore(); // sous l'eau : blanc sur bleu
    }
    function animer() {
      raf = 0; if (!vivant) return;
      const d = n - t;
      if (ctx.reduireMouvement || Math.abs(d) < .012) t = n; else { t += d * .2; raf = requestAnimationFrame(animer); }
      dessiner();
    }
    function dire() {
      compte.innerHTML = `${n} <small>loge${n > 1 ? 's' : ''} sur ${LOGES}${n === LOGES ? (vraie ? ' : l’affiche de Jacqueline Casey' : ' : le nautile est adulte') : ''}</small>`;
      if (vraie) vraie.hidden = n !== LOGES;
    }
    function aller(v) {
      v = Math.max(DEPART, Math.min(LOGES, v)); if (v === n) return;
      n = v; dire(); if (!raf) raf = requestAnimationFrame(animer);
    }
    function molette(e) {
      e.preventDefault(); cumul += e.deltaMode === 1 ? e.deltaY * 30 : e.deltaY;
      while (Math.abs(cumul) >= 50) { aller(n + Math.sign(cumul)); cumul -= Math.sign(cumul) * 50; }
    }
    function touche(e) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.target instanceof Element && e.target.closest('input,textarea,select')) return;
      if (e.key === 'ArrowUp') aller(n + 1); else if (e.key === 'ArrowDown') aller(n - 1); else return;
      e.preventDefault();
    }
    feuille.addEventListener('wheel', molette, { passive: false });
    feuille.addEventListener('click', () => aller(n === LOGES ? DEPART : n + 1));
    addEventListener('keydown', touche);
    zone.querySelector('[data-plus]').addEventListener('click', () => aller(n + 1));
    zone.querySelector('[data-moins]').addEventListener('click', () => aller(n - 1));
    zone.querySelector('[data-debut]').addEventListener('click', () => aller(DEPART));
    // la feuille prend le format de l'affiche dès que l'image est là
    if (vraie) { const caler = () => { if (vivant && vraie.naturalWidth) bloc.style.setProperty('--f', (vraie.naturalWidth / vraie.naturalHeight).toFixed(4)); }; vraie.addEventListener('load', caler); caler(); }
    const ro = new ResizeObserver(mesurer); ro.observe(feuille);
    mesurer(); dire();
    return () => { vivant = false; cancelAnimationFrame(raf); ro.disconnect(); removeEventListener('keydown', touche); };
  },
};
