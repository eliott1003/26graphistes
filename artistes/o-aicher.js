// O · Otl Aicher — pictogrammes des Jeux de Munich (1972).
// Construction reprise de la planche (13/11, demandé par Eliott) : bouts coupés net, angles vifs, tronc en bloc, tête détachée.
// La méthode d'Aicher : un seul corps (tête, tronc, bras, jambes), posé sur une grille ; chaque membre ne suit que
// l'horizontale, la verticale ou une diagonale à 45°. Ici : Espace = autre sport, et le bonhomme BOUGE vraiment,
// ses membres pivotent d'une pose à l'autre autour des épaules, des coudes, des hanches et des genoux.
//
// Le bonhomme est construit pour l'atelier selon cette règle : ce n'est PAS une copie des pictogrammes de 1972
// (œuvre encore protégée). Les vrais pictogrammes sont montrés dans la page de gauche dès qu'Eliott fournit
// l'image (img/o/ref.jpg). Couleurs : la gamme de Munich (bleu clair, vert, orange, violet, argent ; ni rouge ni noir).

const U = 16; // la grille : 16 × 16 cases
const T = { tronc: 2.85, bras: 1.7, avant: 1.7, cuisse: 2.25, jambe: 2.25, tete: .78, cou: .45 }; // longueurs, en cases
const E = { tronc: 1.5, bras: .72, jambe: .84 }; // épaisseurs
const GAMME = ['#5bb5e5', '#8fc31f', '#f39200', '#7a5aa6', '#1d6fb8', '#009b77', '#a9b4bb'];

// Une pose : h = hanche (x, y) ; t = direction du tronc ; b1, b2 = bras [haut, avant-bras] ; j1, j2 = jambes [cuisse, jambe].
// Angles en degrés, toujours des multiples de 45 : 0 = vers la droite, 90 = vers le bas, -90 = vers le haut.
const SPORTS = [
  { nom: 'Course', h: [7.4, 8.6], t: -90, b1: [45, -45], b2: [135, 45], j1: [0, 90], j2: [135, -135], sol: 13.2 },
  { nom: 'Haltérophilie', h: [8, 9.2], t: -90, b1: [-135, -90], b2: [-45, -90], j1: [135, 90], j2: [45, 90], sol: 13.3, objet: 'barre' },
  { nom: 'Escrime', h: [6.6, 9.3], t: -90, b1: [0, 0], b2: [180, -90], j1: [0, 90], j2: [135, 135], sol: 12.9, objet: 'epee' },
  { nom: 'Football', h: [7, 8.6], t: -90, b1: [45, 0], b2: [135, 180], j1: [45, 0], j2: [90, 90], sol: 13.2, objet: 'ballon' },
  { nom: 'Basket-ball', h: [8, 9.6], t: -90, b1: [-45, -90], b2: [0, -90], j1: [90, 90], j2: [45, 135], sol: 14.4, objet: 'panier' },
  { nom: 'Boxe', h: [7, 8.8], t: -90, b1: [0, 0], b2: [45, -45], j1: [45, 90], j2: [135, 90], sol: 13.1, objet: 'gant' },
  { nom: 'Tir à l’arc', h: [7.2, 8.8], t: -90, b1: [0, 0], b2: [180, 0], j1: [45, 90], j2: [135, 90], sol: 13.1, objet: 'arc' },
  { nom: 'Gymnastique', h: [8, 7.2], t: 90, b1: [45, 90], b2: [135, 90], j1: [-45, -45], j2: [-135, -135], sol: 13.45 },
  { nom: 'Plongeon', h: [6.6, 6.2], t: 45, b1: [45, 45], b2: [45, 45], j1: [-135, -135], j2: [-135, -135], objet: 'eau' },
  { nom: 'Natation', h: [9.4, 11.3], t: 180, b1: [-135, 180], b2: [45, 0], j1: [0, 0], j2: [45, 0], objet: 'eau' },
];

const rad = d => d * Math.PI / 180;
const versAngle = (a, b, k) => a + ((((b - a) % 360) + 540) % 360 - 180) * k; // par le plus court chemin
const mel = (a, b, k) => a + (b - a) * k;
function entre(a, b, k) {
  const duo = (p, q) => [versAngle(p[0], q[0], k), versAngle(p[1], q[1], k)];
  return { h: [mel(a.h[0], b.h[0], k), mel(a.h[1], b.h[1], k)], t: versAngle(a.t, b.t, k), b1: duo(a.b1, b.b1), b2: duo(a.b2, b.b2), j1: duo(a.j1, b.j1), j2: duo(a.j2, b.j2) };
}
// les points du squelette, en cases
function squelette(p) {
  const pas = (o, a, l) => [o[0] + Math.cos(rad(a)) * l, o[1] + Math.sin(rad(a)) * l];
  const hanche = p.h, epaule = pas(hanche, p.t, T.tronc), tete = pas(epaule, p.t, T.cou + T.tete);
  const membre = (o, [a1, a2], l1, l2) => { const m = pas(o, a1, l1); return [o, m, pas(m, a2, l2)]; };
  const ep = pas(hanche, p.t, T.tronc - E.bras * .55), ha = pas(hanche, p.t, E.jambe * .62);
  return { hanche, epaule, tete, b1: membre(ep, p.b1, T.bras, T.avant), b2: membre(ep, p.b2, T.bras, T.avant), j1: membre(ha, p.j1, T.cuisse, T.jambe), j2: membre(ha, p.j2, T.cuisse, T.jambe) };
}

export default {
  lettre: 'O',
  css: `
.ai{display:grid;grid-template-columns:auto minmax(170px,240px);gap:clamp(16px,3cqw,44px);justify-content:center;align-items:end;height:100cqh}
.ai-carre{width:min(100cqh,calc(100cqw - 290px));aspect-ratio:1;box-shadow:0 26px 50px -30px rgba(0,0,0,.55);cursor:pointer;touch-action:manipulation}
.ai-carre canvas{display:block;width:100%;height:100%}
.ai-cote{display:grid;gap:14px;align-content:end;padding-bottom:4px}
.ai-cote p{margin:0}
.ai-sport{font:900 clamp(30px,5cqw,54px)/.95 "Sofia Cond",Archivo,sans-serif;text-transform:uppercase}
.ai-boutons{display:flex;flex-wrap:wrap;gap:8px}
@media (max-width:760px){.ai{grid-template-columns:1fr;height:auto}.ai-carre{width:100%}}
`,
  monter(zone, ctx) {
    zone.innerHTML = `
      <div class="ai">
        <div class="ai-carre"><canvas data-export aria-hidden="true"></canvas></div>
        <div class="ai-cote">
          <p class="ai-sport" aria-live="polite"></p>
          <p class="etiquette"></p>
          <p class="note">Espace, ou un clic dans le carré : sport suivant. Maj + Espace : sport précédent. Tête, tronc, bras et jambes restent les mêmes ; seuls les angles changent, toujours à 45° ou 90°.</p>
          <div class="ai-boutons">
            <button type="button" class="bouton plein" data-suivant>Sport suivant</button>
            <button type="button" class="bouton" data-grille aria-pressed="true">Cacher la grille</button>
          </div>
          <p class="note">Bonhomme construit pour l’atelier d’après la règle d’Otl Aicher ; ce ne sont pas ses pictogrammes.</p>
        </div>
      </div>`;
    const carre = zone.querySelector('.ai-carre'), cv = carre.querySelector('canvas'), x = cv.getContext('2d');
    const titre = zone.querySelector('.ai-sport'), info = zone.querySelector('.etiquette'), bGrille = zone.querySelector('[data-grille]');
    let C = 0, dpr = 1, vivant = true, raf = 0, n = 0, grille = true;
    let de = SPORTS[0], t0 = -1e9, coulDe = GAMME[0], objetDe = null;
    const DUREE = 560;

    function mesurer() { const r = carre.getBoundingClientRect(); if (!r.width) return; dpr = Math.min(devicePixelRatio || 1, 2); C = r.width; cv.width = cv.height = Math.round(C * dpr); lancer(); }
    function trait(pts, ep) { x.lineWidth = ep; x.beginPath(); pts.forEach((p, i) => i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])); x.stroke(); }
    function objet(nom, s, a) {
      if (!nom || a <= 0) return; x.save(); x.globalAlpha = a; x.lineCap = 'butt'; x.lineJoin = 'miter';
      const main = s.b1[2];
      if (nom === 'barre') { const y = (s.b1[2][1] + s.b2[2][1]) / 2 - .1; trait([[3.4, y], [12.6, y]], .32); [[3.4, y], [12.6, y]].forEach(([px]) => { x.fillRect(px - .32, y - 1.25, .64, 2.5); x.fillRect(px + (px < 8 ? .5 : -1.0), y - .85, .5, 1.7); }); }
      if (nom === 'epee') trait([[main[0] + .2, main[1]], [main[0] + 4.6, main[1]]], .2);
      if (nom === 'ballon') { const p = s.j1[2]; x.beginPath(); x.arc(p[0] + 1.25, p[1] - .2, .72, 0, 7); x.fill(); }
      if (nom === 'panier') { x.beginPath(); x.arc(9.9, 2.35, .78, 0, 7); x.fill(); trait([[11.4, 3.6], [13.6, 3.6]], .26); trait([[13.6, 1.6], [13.6, 14.4]], .3); }
      if (nom === 'gant') { x.beginPath(); x.arc(main[0] + .45, main[1], .62, 0, 7); x.fill(); const m2 = s.b2[2]; x.beginPath(); x.arc(m2[0] + .3, m2[1] - .3, .62, 0, 7); x.fill(); }
      if (nom === 'arc') { const [mx, my] = main; trait([[mx - 1.6, my - 3.2], [mx + .2, my - 1.6], [mx + .2, my + 1.6], [mx - 1.6, my + 3.2]], .26); trait([[mx - 1.6, my - 3.2], [s.b2[2][0], s.b2[2][1]], [mx - 1.6, my + 3.2]], .09); trait([[s.b2[2][0], my], [mx + 1.5, my]], .12); }
      if (nom === 'eau') { const y = 12.6, pts = []; for (let i = 0; i <= 24; i++) pts.push([2 + i * .5, y + (i % 2 ? -.5 : 0)]); trait(pts, .3); trait(pts.map(([a1, b1]) => [a1, b1 + 1.1]), .3); }
      x.restore();
    }
    function dessiner(t) {
      if (!C) return false;
      const vers = SPORTS[n], k0 = ctx.reduireMouvement ? 1 : Math.min(1, (t - t0) / DUREE), k = k0 < .5 ? 4 * k0 ** 3 : 1 - Math.pow(-2 * k0 + 2, 3) / 2;
      const pose = entre(de, vers, k), s = squelette(pose), u = C / U;
      x.setTransform(dpr, 0, 0, dpr, 0, 0);
      // le fond passe d'une couleur de Munich à l'autre
      x.globalAlpha = 1; x.fillStyle = coulDe; x.fillRect(0, 0, C, C); x.globalAlpha = k; x.fillStyle = GAMME[n % GAMME.length]; x.fillRect(0, 0, C, C); x.globalAlpha = 1;
      x.scale(u, u);
      if (grille) { // orthogonales et diagonales
        x.strokeStyle = 'rgba(255,255,255,.3)'; x.lineWidth = .035; x.beginPath();
        for (let i = 1; i < U; i++) { x.moveTo(i, 0); x.lineTo(i, U); x.moveTo(0, i); x.lineTo(U, i); }
        for (let i = -U; i <= U; i += 2) { x.moveTo(i, 0); x.lineTo(i + U, U); x.moveTo(i + U, 0); x.lineTo(i, U); }
        x.stroke();
      }
      x.fillStyle = x.strokeStyle = '#fff';
      // le sol
      const sol = mel(de.sol ?? 0, vers.sol ?? 0, k), aSol = mel(de.sol ? 1 : 0, vers.sol ? 1 : 0, k);
      if (aSol > 0) { x.globalAlpha = aSol; x.lineCap = 'butt'; trait([[1.5, sol], [14.5, sol]], .26); x.globalAlpha = 1; }
      objet(objetDe, squelette(de), 1 - Math.min(1, k * 3)); objet(vers.objet, s, Math.max(0, k * 3 - 2));
      // le corps, à la manière d'Aicher : membres de largeur constante coupés net, coudes et genoux en angle vif,
      // tronc en bloc, tête détachée du corps par un vide
      x.lineCap = 'butt'; x.lineJoin = 'miter'; x.miterLimit = 3;
      trait(s.j2, E.jambe); trait(s.j1, E.jambe);
      trait([s.hanche, s.epaule], E.tronc);
      trait(s.b2, E.bras); trait(s.b1, E.bras);
      x.beginPath(); x.arc(s.tete[0], s.tete[1], T.tete, 0, 7); x.fill();
      return k0 < 1;
    }
    function lancer() { cancelAnimationFrame(raf); const pas = t => { if (!vivant) return; if (dessiner(t)) raf = requestAnimationFrame(pas); }; raf = requestAnimationFrame(pas); }
    function ecrire() { titre.textContent = SPORTS[n].nom; info.textContent = `Sport ${n + 1} sur ${SPORTS.length}`; }
    function aller(sens) {
      // on repart de la pose en cours, même au milieu d'un mouvement
      const t = performance.now(), k0 = Math.min(1, (t - t0) / DUREE), k = k0 < .5 ? 4 * k0 ** 3 : 1 - Math.pow(-2 * k0 + 2, 3) / 2;
      const ici = entre(de, SPORTS[n], k); ici.sol = SPORTS[n].sol; objetDe = SPORTS[n].objet || null; coulDe = GAMME[n % GAMME.length];
      de = ici; n = (n + sens + SPORTS.length) % SPORTS.length; t0 = t; ecrire(); ctx.annoncer?.(SPORTS[n].nom); lancer();
    }
    function touche(e) {
      if (e.key !== ' ' || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.target instanceof Element && e.target.closest('input,textarea,select')) return;
      e.preventDefault(); aller(e.shiftKey ? -1 : 1);
    }
    addEventListener('keydown', touche);
    carre.addEventListener('click', () => aller(1));
    zone.querySelector('[data-suivant]').addEventListener('click', e => { aller(1); e.currentTarget.blur(); });
    bGrille.addEventListener('click', () => { grille = !grille; bGrille.textContent = grille ? 'Cacher la grille' : 'Montrer la grille'; bGrille.setAttribute('aria-pressed', grille); bGrille.blur(); lancer(); });
    const ro = new ResizeObserver(mesurer); ro.observe(carre);
    ecrire(); mesurer();
    return () => { vivant = false; cancelAnimationFrame(raf); ro.disconnect(); removeEventListener('keydown', touche); };
  },
};
