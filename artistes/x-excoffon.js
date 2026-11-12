// X · Roger Excoffon — affiche de la Caravelle, Air France (1964).
// « 450 avions » : Excoffon raconte avoir dessiné 450 avions avant de trouver le geste de l'affiche.
// On dessine l'avion d'un seul geste : le trait devient un coup de pinceau (épais quand on va lentement, fin et sec quand on va vite).
// Chaque essai reçoit une note de ressemblance, une jauge se remplit, le compteur avance (essai n / 450) et les essais se rangent en grille.
// « Voir la vraie » montre l'affiche : c'est l'image d'Eliott (img/x/ref.jpg, déclarée dans labo/donnees.js : images: [{ f: 'ref.jpg', t: '…' }]).
// PROVISOIRE tant que l'image n'est pas fournie :
//  - MODELE (le tracé qui sert à noter) est un avion d'un seul geste inventé pour l'exercice, PAS le tracé de la Caravelle : à retracer sur l'image ;
//  - la couleur de l'encre, celle de la feuille et le format (FORMAT) sont à caler sur l'affiche.
// L'affiche n'est pas redessinée en code (œuvre protégée) : la fidélité vient de l'image d'Eliott.

const FORMAT = 62 / 100;                 // largeur / hauteur de la feuille
const FEUILLE = '#f6f3ea', ENCRE = '#1d3c8f';
const TOTAL = 450, POILS = 11;
// Le modèle provisoire, en largeurs de feuille : dérive, fuselage jusqu'au nez, retour sous le ventre, aile, retour.
const MODELE = [[.10, .52], [.17, .70], [.40, .665], [.66, .585], [.92, .46], [.70, .62], [.56, .68], [.34, 1.02], [.50, .74]];
const JITTER = Array.from({ length: POILS }, (_, i) => .72 + ((i * 37) % 11) / 11 * .56); // chaque poil a sa largeur, toujours la même

const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const borne = (v, a, b) => Math.min(b, Math.max(a, v));
/* courbe lissée passant par les points du modèle */
function lisser(pts, pas = 14) {
  const P = pts.map(([x, y]) => ({ x, y })), out = [];
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
    for (let k = 0; k < pas; k++) {
      const t = k / pas, t2 = t * t, t3 = t2 * t;
      out.push({ x: .5 * (2 * p1.x + (p2.x - p0.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (3 * p1.x - p0.x - 3 * p2.x + p3.x) * t3), y: .5 * (2 * p1.y + (p2.y - p0.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (3 * p1.y - p0.y - 3 * p2.y + p3.y) * t3) });
    }
  }
  out.push(P[P.length - 1]); return out;
}
/* rééchantillonne un tracé en n points à pas constant, puis le ramène dans un carré de côté 1 */
function reduire(pts, n = 48) {
  let long = 0; for (let i = 1; i < pts.length; i++) long += dist(pts[i - 1], pts[i]);
  const pas = long / (n - 1), out = [{ x: pts[0].x, y: pts[0].y }]; let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    let a = pts[i - 1], d = dist(a, pts[i]);
    while (d > 0 && acc + d >= pas) { const t = (pas - acc) / d; a = { x: a.x + (pts[i].x - a.x) * t, y: a.y + (pts[i].y - a.y) * t }; out.push(a); d = dist(a, pts[i]); acc = 0; }
    acc += d;
  }
  while (out.length < n) out.push({ ...pts[pts.length - 1] });
  out.length = n;
  const xs = out.map(p => p.x), ys = out.map(p => p.y), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys), s = Math.max(x1 - x0, y1 - y0) || 1;
  return out.map(p => ({ x: (p.x - (x0 + x1) / 2) / s, y: (p.y - (y0 + y1) / 2) / s }));
}
const COURBE = lisser(MODELE), CIBLE = reduire(COURBE);
function noter(pts) {
  const u = reduire(pts), ecart = v => v.reduce((t, p, i) => t + dist(p, CIBLE[i]), 0) / v.length;
  const e = Math.min(ecart(u), ecart([...u].reverse()));      // on peut partir du nez ou de la queue
  return borne(Math.round(20 * (1 - e / .34)), 0, 20);
}
/* le coup de pinceau : des poils côte à côte ; lents, ils se touchent et font une masse ; rapides, ils s'écartent et le papier se voit */
function pinceau(c, pts, k, fini) {
  const n = pts.length; if (n < 2) return;
  c.strokeStyle = ENCRE; c.lineCap = 'round'; c.lineJoin = 'round';
  const nx = [], ny = [], w = [];
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)], d = dist(a, b) || 1;
    nx[i] = -(b.y - a.y) / d; ny[i] = (b.x - a.x) / d;
    w[i] = pts[i].w * Math.min(1, .25 + i / 5) * (fini ? Math.min(1, .2 + (n - 1 - i) / 4) : 1);   // attaque, et levée du pinceau à la fin
  }
  for (let j = 0; j < POILS; j++) {
    const o = j / (POILS - 1) - .5;
    for (let i = 1; i < n; i++) {
      const a = pts[i - 1], b = pts[i], wm = (w[i - 1] + w[i]) / 2;
      c.lineWidth = Math.max(.6, wm / POILS * (a.g + b.g) / 2 * JITTER[j] * k);
      c.beginPath(); c.moveTo((a.x + nx[i - 1] * o * w[i - 1]) * k, (a.y + ny[i - 1] * o * w[i - 1]) * k); c.lineTo((b.x + nx[i] * o * w[i]) * k, (b.y + ny[i] * o * w[i]) * k); c.stroke();
    }
  }
}
const AVIS = n => n >= 17 ? 'Excoffon s’arrêterait là.' : n >= 13 ? 'Presque. Encore un.' : n >= 8 ? 'Ça décolle.' : 'Ça ne vole pas encore.';

export default {
  lettre: 'X',
  css: `
.ex{display:grid;grid-template-columns:auto minmax(200px,290px);gap:clamp(16px,3cqw,44px);justify-content:center;align-items:end;height:100cqh}
.ex-feuille{position:relative;height:min(100cqh,calc((100cqw - 340px)/${FORMAT}));aspect-ratio:${FORMAT};background:${FEUILLE};cursor:crosshair;touch-action:none;box-shadow:0 0 0 1px rgba(0,0,0,.16),0 26px 50px -30px rgba(0,0,0,.6)}
.ex-feuille canvas{display:block;width:100%;height:100%}
.ex-feuille img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;background:${FEUILLE};pointer-events:none}
.ex-cote{display:grid;gap:clamp(8px,1.8cqh,14px);align-content:end;padding-bottom:4px;min-height:0}
.ex-cote p{margin:0}
.ex-compte{font:900 clamp(34px,7cqh,64px)/.9 "Sofia Cond",Impact,sans-serif;text-transform:uppercase}
.ex-compte small{font-size:.45em;opacity:.75}
.ex-note{display:flex;align-items:baseline;gap:10px;font:600 14px/1.25 Archivo,sans-serif}
.ex-note b{font:900 clamp(26px,5cqh,44px)/1 "Sofia Cond",Impact,sans-serif}
.ex-jauge{height:10px;border:1.5px solid currentColor;border-radius:2px}
.ex-jauge i{display:block;height:100%;width:0;background:currentColor;transition:width .5s cubic-bezier(.2,.7,.2,1)}
.ex-essais{display:grid;grid-template-columns:repeat(6,1fr);gap:5px}
.ex-essais canvas{display:block;width:100%;aspect-ratio:${FORMAT};background:${FEUILLE}}
.ex-essais canvas.mieux{outline:2px solid currentColor;outline-offset:1px}
.ex-boutons{display:flex;flex-wrap:wrap;gap:8px}
.ex-prov{border-left:3px solid currentColor;padding-left:10px}
@media (prefers-reduced-motion:reduce){.ex-jauge i{transition:none}}
@media (max-width:760px){.ex{grid-template-columns:1fr;height:auto}.ex-feuille{height:auto;width:min(100%,calc(64svh*${FORMAT}));justify-self:center}}
`,
  monter(zone, ctx) {
    const ref = ctx.artiste.images?.[0];
    zone.innerHTML = `
      <div class="ex">
        <div class="ex-feuille"><canvas data-export aria-label="La feuille : dessine ici l’avion d’un seul geste"></canvas></div>
        <div class="ex-cote">
          <p class="ex-compte" aria-live="polite">Essai 0 <small>/ ${TOTAL}</small></p>
          <p class="ex-note"><b>–</b><span>Dessine l’avion sur la feuille, sans lever la main.</span></p>
          <div class="ex-jauge" role="img" aria-label="Ressemblance"><i></i></div>
          <div class="ex-essais" aria-label="Tes essais"></div>
          <div class="ex-boutons">
            <button type="button" class="bouton plein" data-vraie aria-pressed="false">${ref ? 'Voir la vraie' : 'Voir le modèle'}</button>
            <button type="button" class="bouton" data-vider>Tout effacer</button>
          </div>
          <p class="note">Lentement, le pinceau est épais ; vite, il devient fin et sec. Excoffon dit avoir dessiné 450 avions avant de trouver le bon geste.</p>
          <p class="note ex-prov"${ref ? ' hidden' : ''}>Version provisoire : la note compare ton trait à un modèle d’exercice, en attendant l’image de l’affiche.</p>
        </div>
      </div>`;
    const feuille = zone.querySelector('.ex-feuille'), cv = feuille.querySelector('canvas'), x = cv.getContext('2d');
    const compte = zone.querySelector('.ex-compte'), note = zone.querySelector('.ex-note'), jauge = zone.querySelector('.ex-jauge i'), grille = zone.querySelector('.ex-essais'), bVraie = zone.querySelector('[data-vraie]');
    let L = 0, H = 0, dpr = 1, vivant = true, raf = 0, n = 0, meilleur = -1, montre = false, enCours = null, dernier = null, vraie = null;

    function mesurer() { const r = feuille.getBoundingClientRect(); if (!r.width) return; dpr = Math.min(devicePixelRatio || 1, 2); L = r.width; H = r.height; cv.width = Math.round(L * dpr); cv.height = Math.round(H * dpr); peindre(); }
    function guide() {                                        // le modèle en pointillé (provisoire, tant qu'il n'y a pas l'image)
      x.save(); x.strokeStyle = 'rgba(20,20,20,.5)'; x.lineWidth = Math.max(1.2, L * .004); x.setLineDash([L * .012, L * .016]); x.lineCap = 'round';
      x.beginPath(); COURBE.forEach((p, i) => i ? x.lineTo(p.x * L, p.y * L) : x.moveTo(p.x * L, p.y * L)); x.stroke(); x.restore();
    }
    function peindre() {
      if (!L) return;
      x.setTransform(dpr, 0, 0, dpr, 0, 0); x.fillStyle = FEUILLE; x.fillRect(0, 0, L, H);
      const trait = enCours || dernier;
      if (!trait || (montre && !vraie)) guide();
      if (!trait) {
        x.fillStyle = 'rgba(20,20,20,.62)'; x.textAlign = 'center'; x.font = `600 ${Math.max(12, L * .034)}px Archivo, sans-serif`;
        x.fillText('Dessine l’avion ici, d’un seul geste.', L / 2, H * .9);
      } else pinceau(x, trait, L, trait === dernier);
    }
    function demander() { if (!raf) raf = requestAnimationFrame(() => { raf = 0; if (vivant) peindre(); }); }

    function point(e) {
      const r = feuille.getBoundingClientRect(), p = { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.width, t: e.timeStamp };
      const a = enCours[enCours.length - 1];
      if (a) {
        const d = dist(a, p); if (d < .004) return;
        const v = d / Math.max(1, p.t - a.t), q = borne(v / .0032, 0, 1);            // vitesse, en largeurs de feuille par milliseconde
        p.w = a.w + ((.072 - .058 * q) - a.w) * .32; p.g = a.g + ((1.75 - 1.2 * q) - a.g) * .4;
      } else { p.w = .06; p.g = 1.6; }
      enCours.push(p);
    }
    function commencer(e) {
      if (e.button) return; e.preventDefault(); feuille.setPointerCapture?.(e.pointerId);
      if (montre) basculer(false);
      enCours = []; point(e); demander();
    }
    function continuer(e) { if (!enCours) return; (e.getCoalescedEvents?.() || [e]).forEach(point); demander(); }
    function finir() {
      if (!enCours) return; const pts = enCours; enCours = null;
      let long = 0; for (let i = 1; i < pts.length; i++) long += dist(pts[i - 1], pts[i]);
      if (pts.length < 6 || long < .25) { demander(); return; }                      // un point ou un trait trop court ne compte pas
      dernier = pts; n++; const s = noter(pts), record = s > meilleur; if (record) meilleur = s;
      compte.innerHTML = `Essai ${n} <small>/ ${TOTAL}</small>`;
      note.innerHTML = `<b>${s}/20</b><span>${AVIS(s)}${n > 1 ? ` Ton meilleur : ${meilleur}/20.` : ''}</span>`;
      jauge.style.width = `${s * 5}%`;
      const m = document.createElement('canvas'); m.width = 124; m.height = Math.round(124 / FORMAT); m.title = `Essai ${n} : ${s}/20`;
      const c = m.getContext('2d'); c.fillStyle = FEUILLE; c.fillRect(0, 0, m.width, m.height); pinceau(c, pts, m.width, true);
      if (record) { grille.querySelector('.mieux')?.classList.remove('mieux'); m.className = 'mieux'; }
      grille.prepend(m); while (grille.children.length > 12) grille.lastChild.remove();
      ctx.annoncer?.(`Essai ${n} : ${s} sur 20.`);
      demander();
    }
    function basculer(on) {
      montre = on; bVraie.setAttribute('aria-pressed', on); bVraie.textContent = on ? 'Revenir à mon dessin' : (ref ? 'Voir la vraie' : 'Voir le modèle');
      if (vraie) vraie.hidden = !on;
      demander();
    }
    feuille.addEventListener('pointerdown', commencer);
    feuille.addEventListener('pointermove', continuer);
    feuille.addEventListener('pointerup', finir);
    feuille.addEventListener('pointercancel', finir);
    bVraie.addEventListener('click', () => basculer(!montre));
    zone.querySelector('[data-vider]').addEventListener('click', () => {
      n = 0; meilleur = -1; dernier = null; grille.innerHTML = ''; jauge.style.width = '0';
      compte.innerHTML = `Essai 0 <small>/ ${TOTAL}</small>`; note.innerHTML = '<b>–</b><span>Dessine l’avion sur la feuille, sans lever la main.</span>'; demander();
    });
    if (ref) {                                                // l'affiche d'Eliott, posée sur la feuille quand on demande à la voir
      vraie = new Image(); vraie.alt = ref.t || 'L’affiche de la Caravelle'; vraie.hidden = true;
      vraie.onerror = () => { vraie.remove(); vraie = null; zone.querySelector('.ex-prov').hidden = false; };
      vraie.src = `${ctx.racine}img/x/${ref.f}`; feuille.append(vraie);
    }
    const ro = new ResizeObserver(mesurer); ro.observe(feuille);
    document.fonts.load('600 14px Archivo').then(() => demander()).catch(() => {});
    mesurer();
    return () => { vivant = false; cancelAnimationFrame(raf); ro.disconnect(); };
  },
};
