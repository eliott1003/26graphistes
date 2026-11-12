// E · Edward McKnight Kauffer — Soaring to Success! Daily Herald – the Early Bird (1918-1919, lithographie, 297,7 × 152,2 cm).
// L'affiche : un fond jaune très haut, une volée d'oiseaux géométriques en haut, le texte tout en bas.
// Au passage de la souris, les oiseaux s'envolent, s'écartent et la suivent ; quand elle s'arrête ou sort, ils reviennent se poser en formation.
// PROVISOIRE : la volée (nombre, place, dessin et sens des oiseaux), le jaune et le lettrage du bas sont faits de mémoire,
// d'après la description du V&A (fond jaune, volée géométrique, texte en bas). À caler sur l'image de référence : img/e/ref.jpg (à fournir par Eliott).

const R = 152.2 / 297.7;                 // largeur / hauteur de l'affiche
const JAUNE = '#f5c21b', NOIR = '#151515', BLANC = '#f6f1e2', GRIS = '#8b959b';
const TEXTE = '"Caslon", "Libre Caslon Text", Georgia, serif';

// Un oiseau, tête vers la droite. L'aile du haut en trois facettes ; l'aile du bas est son miroir.
const AILE = [
  [[18, -3], [0, -40], [-6, -3]],                      // de l'épaule au coude
  [[0, -40], [-48, -58], [-22, -30], [-6, -3]],        // la main, rejetée en arrière
  [[-6, -3], [-22, -30], [-32, -17], [-22, -3]],       // le bord de fuite
];
const CORPS = [[31, 0], [14, -6], [-26, -4], [-26, 4], [14, 6]];
const QUEUE = [[-23, 0], [-52, -13], [-44, 0], [-52, 13]];
const PALETTES = [
  { haut: [BLANC, GRIS, NOIR], bas: [NOIR, BLANC, GRIS], queue: BLANC },
  { haut: [GRIS, NOIR, BLANC], bas: [BLANC, GRIS, NOIR], queue: GRIS },
  { haut: [NOIR, BLANC, GRIS], bas: [GRIS, NOIR, BLANC], queue: BLANC },
];
// La formation (en largeurs d'affiche) : place, taille, cap en radians (vers le haut à gauche).
const FORMATION = [
  [.30, .21, 1.22, -2.30], [.52, .29, 1.34, -2.20], [.22, .41, 1.00, -2.46], [.70, .37, 1.08, -2.10],
  [.45, .50, 1.18, -2.30], [.66, .57, .94, -2.20], [.82, .52, .82, -2.02], [.35, .66, .90, -2.40],
];
const UNITE = .0026;                     // un oiseau de taille 1 fait environ 0,3 largeur d'envergure
const PRES = .2, LOIN = .44, REPOS = 1700; // la souris fait fuir en dessous de PRES, attire au-delà de LOIN ; sans mouvement pendant REPOS ms, retour

export default {
  lettre: 'E',
  css: `
.kf{display:grid;grid-template-columns:auto minmax(180px,260px);gap:clamp(16px,3cqw,44px);justify-content:center;align-items:end;height:100cqh}
.kf-affiche{height:min(100cqh,calc((100cqw - 310px)*1.956));aspect-ratio:1522/2977;background:${JAUNE};cursor:crosshair;touch-action:manipulation;box-shadow:0 0 0 1px rgba(0,0,0,.18),0 26px 50px -30px rgba(0,0,0,.55)}
.kf-affiche canvas{display:block;width:100%;height:100%}
.kf-cote{display:grid;gap:14px;align-content:end;padding-bottom:4px}
.kf-cote p{margin:0}
.kf-boutons{display:flex;flex-wrap:wrap;gap:8px}
.kf-prov{border-left:3px solid currentColor;padding-left:10px}
@media (max-width:760px){.kf{grid-template-columns:1fr;height:auto}.kf-affiche{height:min(76svh,calc(100cqw*1.956));justify-self:center}}
`,
  monter(zone, ctx) {
    zone.innerHTML = `
      <div class="kf">
        <div class="kf-affiche"><canvas data-export aria-label="L’affiche : une volée d’oiseaux géométriques sur fond jaune"></canvas></div>
        <div class="kf-cote">
          <p class="etiquette" aria-live="polite"></p>
          <p class="note">Passe la souris sur la volée : les oiseaux s’envolent, s’écartent et te suivent. Arrête-toi ou sors de l’affiche : ils reviennent se poser.</p>
          <div class="kf-boutons"><button type="button" class="bouton plein" data-envol>Faire s’envoler</button></div>
          <p class="note kf-prov">Version provisoire : oiseaux et lettrage redessinés de mémoire, à caler sur l’image de l’affiche.</p>
        </div>
      </div>`;
    const affiche = zone.querySelector('.kf-affiche'), cv = affiche.querySelector('canvas'), x = cv.getContext('2d'), info = zone.querySelector('.etiquette');
    const HAUT = 1 / R;
    let L = 0, dpr = 1, vivant = true, raf = 0, avant = 0, dit = '';
    const souris = { x: .5, y: .4, t: -1e9 };
    const oiseaux = FORMATION.map(([hx, hy, s, hr], i) => ({ hx, hy, s, hr, x: hx, y: hy, r: hr, vx: 0, vy: 0, vol: false, ph: i * 1.7, f: 1, sens: i % 2 ? 1 : -1, pal: PALETTES[i % 3] }));

    function mesurer() {
      const r = affiche.getBoundingClientRect(); if (!r.width) return;
      dpr = Math.min(devicePixelRatio || 1, 2); L = r.width; cv.width = Math.round(L * dpr); cv.height = Math.round(r.height * dpr); peindre();
    }
    const poly = (pts, fy, c) => { x.beginPath(); pts.forEach(([px, py], i) => i ? x.lineTo(px, py * fy) : x.moveTo(px, py * fy)); x.closePath(); x.fillStyle = c; x.fill(); };
    function dessiner(o) {
      const k = L * UNITE * o.s;
      x.save(); x.translate(o.x * L, o.y * L); x.rotate(o.r); x.scale(k, k);
      poly(QUEUE, 1, o.pal.queue);
      AILE.forEach((p, i) => poly(p, -o.f, o.pal.bas[i]));   // aile du bas
      AILE.forEach((p, i) => poly(p, o.f, o.pal.haut[i]));   // aile du haut
      poly(CORPS, 1, NOIR);
      x.restore();
    }
    function peindre() {
      if (!L) return;
      x.setTransform(dpr, 0, 0, dpr, 0, 0); x.fillStyle = JAUNE; x.fillRect(0, 0, L, L * HAUT);
      // le texte du bas, fixe, comme sur l'affiche
      x.fillStyle = NOIR; x.textAlign = 'center'; x.textBaseline = 'alphabetic';
      x.font = `700 ${L * .084}px ${TEXTE}`; x.fillText('Soaring to Success !', L * .5, L * 1.672);
      x.font = `700 ${L * .118}px ${TEXTE}`; x.fillText('DAILY HERALD', L * .5, L * 1.795, L * .88);
      x.font = `700 ${L * .084}px ${TEXTE}`; x.fillText('– the Early Bird.', L * .5, L * 1.9);
      oiseaux.forEach(dessiner);
    }
    const angle = (a, b, t) => a + Math.atan2(Math.sin(b - a), Math.cos(b - a)) * t;
    function envoler(o, mx, my) {
      if (o.vol) return; o.vol = true;
      const dx = o.x - mx, dy = o.y - my, d = Math.hypot(dx, dy) || 1;
      o.vx = dx / d * .5 + Math.cos(o.hr) * .45; o.vy = dy / d * .5 + Math.sin(o.hr) * .45;
    }
    function avancer(dt, t) {
      const actif = t - souris.t < REPOS; let enVol = 0;
      oiseaux.forEach((o, i) => {
        const dx = o.x - souris.x, dy = o.y - souris.y, d = Math.hypot(dx, dy) || 1e-6;
        if (actif && !o.vol && d < PRES + .04 * o.s) envoler(o, souris.x, souris.y);
        if (!o.vol) return;
        enVol++;
        let ax = 0, ay = 0;
        const hx = o.hx - o.x, hy = o.hy - o.y, dh = Math.hypot(hx, hy);
        if (actif) {
          if (d < PRES + .08) { const p = (PRES + .08 - d) / (PRES + .08) * 11; ax += dx / d * p; ay += dy / d * p; }   // s'écarter
          else if (d > LOIN) { ax -= dx / d * 1.9; ay -= dy / d * 1.9; }                                                // suivre
          ax += -dy / d * .9 * o.sens; ay += dx / d * .9 * o.sens;                                                      // tourner autour
          oiseaux.forEach((p, j) => { if (j === i || !p.vol) return; const ex = o.x - p.x, ey = o.y - p.y, e = Math.hypot(ex, ey) || 1e-6; if (e < .16) { ax += ex / e * (.16 - e) * 26; ay += ey / e * (.16 - e) * 26; } });
          const m = .07; if (o.x < m) ax += (m - o.x) * 60; if (o.x > 1 - m) ax -= (o.x - 1 + m) * 60; if (o.y < m) ay += (m - o.y) * 60; if (o.y > HAUT - m) ay -= (o.y - HAUT + m) * 60;
          o.vx += ax * dt; o.vy += ay * dt;
          const v = Math.hypot(o.vx, o.vy) || 1e-6, vc = Math.min(1.15, Math.max(.3, v)); o.vx *= vc / v; o.vy *= vc / v;
        } else {                                                                                                        // rentrer se poser
          const vmax = Math.min(.95, dh * 3.2 + .05), cx = hx / (dh || 1) * vmax, cy = hy / (dh || 1) * vmax, q = Math.min(1, dt * 4.5);
          o.vx += (cx - o.vx) * q; o.vy += (cy - o.vy) * q;
          if (dh < .006) { o.vol = false; o.x = o.hx; o.y = o.hy; o.r = o.hr; o.f = 1; o.vx = o.vy = 0; enVol--; return; }
        }
        o.x += o.vx * dt; o.y += o.vy * dt;
        const v = Math.hypot(o.vx, o.vy), pres = actif ? 1 : Math.min(1, dh / .13);       // près du nid : on reprend la pose
        o.r = angle(o.r, pres > .35 ? Math.atan2(o.vy, o.vx) : o.hr, Math.min(1, dt * (pres > .35 ? 9 : 6)));
        o.ph += dt * (9 + v * 9);
        o.f += ((1 - pres) + pres * (.28 + .72 * Math.cos(o.ph)) - o.f) * Math.min(1, dt * 18);
      });
      const texte = enVol ? `${enVol} oiseau${enVol > 1 ? 'x' : ''} en vol` : 'Huit oiseaux posés, comme sur l’affiche.';
      if (texte !== dit) { dit = texte; info.textContent = texte; }
      return enVol > 0 || actif;
    }
    function boucle(t) {
      raf = 0; if (!vivant) return;
      const dt = Math.min(.04, (t - avant) / 1000 || .016); avant = t;
      const encore = avancer(dt, t); peindre();
      if (encore) raf = requestAnimationFrame(boucle);
    }
    function lancer() { if (!raf && !ctx.reduireMouvement) { avant = performance.now(); raf = requestAnimationFrame(boucle); } }
    function ou(e) { const r = affiche.getBoundingClientRect(); souris.x = (e.clientX - r.left) / r.width; souris.y = (e.clientY - r.top) / r.width; }

    affiche.addEventListener('pointermove', e => { ou(e); souris.t = performance.now(); lancer(); });
    affiche.addEventListener('pointerdown', e => { ou(e); souris.t = performance.now(); oiseaux.forEach(o => { if (Math.hypot(o.x - souris.x, o.y - souris.y) < .34) envoler(o, souris.x, souris.y); }); lancer(); });
    affiche.addEventListener('pointerleave', e => { if (e.pointerType !== 'touch') souris.t = -1e9; });
    zone.querySelector('[data-envol]').addEventListener('click', () => {
      souris.x = .5; souris.y = .44; souris.t = performance.now() + 900;      // la volée tourne un moment, puis rentre
      oiseaux.forEach(o => envoler(o, souris.x, souris.y)); lancer();
      if (ctx.reduireMouvement) ctx.annoncer?.('Animations réduites : les oiseaux restent posés.');
    });
    const ro = new ResizeObserver(mesurer); ro.observe(affiche);
    document.fonts.load(`700 40px Caslon`).then(() => peindre()).catch(() => {});
    mesurer(); avancer(0, performance.now());
    return () => { vivant = false; cancelAnimationFrame(raf); ro.disconnect(); };
  },
};
