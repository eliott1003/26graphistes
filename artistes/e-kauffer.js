// E · Edward McKnight Kauffer — Soaring to Success! Daily Herald – the Early Bird (1918-1919, lithographie, 297,7 × 152,2 cm).
// Calé sur l'image fournie par Eliott (img/e/ref.jpg, variante de l'affiche, Cooper Hewitt) : cadre kaki et filet sombre, jaune,
// volée de huit oiseaux tournés vers la gauche (bec long, œil cerclé de jaune, ailes en longues pointes, traînées vers la droite),
// diagonale blanche sous la volée, et les trois lignes de texte du bas à leur place.
// Au passage de la souris, les oiseaux s'envolent, s'écartent et la suivent ; quand elle s'arrête ou sort, ils reviennent se poser en formation.
// Reste approché : le dessin exact de chaque oiseau (sur l'affiche ils s'imbriquent en damier) et le lettrage de DAILY HERALD (dessiné à la main sur l'original).

const R = 152.2 / 297.7;                 // largeur / hauteur de l'affiche
const JAUNE = '#ffd400', NOIR = '#433f34', BLANC = '#ecece0', GRIS = '#9a8d61';
const TEXTE = '"Caslon", "Libre Caslon Text", Georgia, serif';

// Un oiseau, tête vers la droite dans son repère (sur l'affiche il est tourné vers la gauche). Les ailes partent du même côté, vers le haut et l'arrière.
const AILE = [
  [[8, 5], [-74, 60], [-12, 5]],          // la grande aile
  [[-6, 5], [-66, 34], [-26, 5]],         // la seconde, plus basse
  [[-12, 5], [-40, 24], [-30, 5]],        // le creux entre les deux
];
const TRAINEES = [[[-18, -6], [-118, -9], [-18, 1]], [[-22, 0], [-96, 6], [-22, 6]]];
const CORPS = [[24, -4], [2, -9], [-30, -2], [-4, 8], [18, 5]];
const DAMIER = [[2, -9], [-12, -1], [-4, 8], [8, 0]];
const TETE = [[30, -5], [16, -6], [14, 5], [28, 3]];
const BEC_H = [[28, -3], [68, 1], [28, 0]], BEC_B = [[28, 0], [68, 1], [28, 3]];
const PALETTES = [
  { ailes: [NOIR, BLANC, GRIS], trainees: [GRIS, BLANC], damier: BLANC },
  { ailes: [NOIR, GRIS, BLANC], trainees: [BLANC, GRIS], damier: BLANC },
  { ailes: [BLANC, NOIR, GRIS], trainees: [GRIS, BLANC], damier: GRIS },
];
// La formation, relevée sur l'image : place de l'œil (en largeurs d'affiche), taille, cap (vers la gauche, un peu vers le haut).
const YEUX = [
  [.288, .215, 1.30, -2.93], [.445, .221, 1.38, -2.95], [.190, .330, .95, -3.02], [.381, .324, 1.12, -2.97],
  [.669, .381, 1.00, -2.99], [.284, .401, .92, -2.98], [.209, .426, .86, -3.02], [.170, .464, .84, -3.05],
];
const UNITE = .0034;
const FORMATION = YEUX.map(([ex, ey, s, r]) => { const k = UNITE * s; return [ex - (Math.cos(r) * 21 - Math.sin(r) * -1) * k, ey - (Math.sin(r) * 21 + Math.cos(r) * -1) * k, s, r]; });
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
      const k = L * UNITE * o.s, haut = Math.cos(o.r) > 0 ? -1 : 1;      // les ailes restent côté ciel, quel que soit le cap
      x.save(); x.translate(o.x * L, o.y * L); x.rotate(o.r); x.scale(k, k * haut);
      const calme = Math.max(0, o.f);
      TRAINEES.forEach((p, i) => { x.globalAlpha = calme; poly(p, 1, o.pal.trainees[i]); }); x.globalAlpha = 1;   // les traînées : seulement posé
      AILE.forEach((p, i) => poly(p, o.f, o.pal.ailes[i]));
      poly(CORPS, 1, NOIR); poly(DAMIER, 1, o.pal.damier); poly(TETE, 1, NOIR); poly(BEC_H, 1, BLANC); poly(BEC_B, 1, NOIR);
      x.beginPath(); x.arc(21, -1, 3.4, 0, 7); x.fillStyle = JAUNE; x.fill(); x.beginPath(); x.arc(21, -1, 1.3, 0, 7); x.fillStyle = NOIR; x.fill();
      x.restore();
    }
    function petitesCap(txt, cx, y, corps, largeur) {                    // grandes capitales + petites capitales, comme DAILY HERALD
      const mots = txt.split(' '), font = t => `700 ${t}px ${TEXTE}`, mes = t => { let w = 0; mots.forEach((m, i) => { x.font = font(t); w += x.measureText(m[0]).width + (i ? t * .32 : 0); x.font = font(t * .8); w += x.measureText(m.slice(1)).width; }); return w; };
      const t = corps * Math.min(1, largeur / mes(corps)); let px = cx - mes(t) / 2;
      x.textAlign = 'left';
      mots.forEach((m, i) => { if (i) px += t * .32; x.font = font(t); x.fillText(m[0], px, y); px += x.measureText(m[0]).width; x.font = font(t * .8); x.fillText(m.slice(1), px, y); px += x.measureText(m.slice(1)).width; });
    }
    function peindre() {
      if (!L) return;
      const H = L * HAUT, b1 = L * .032, b2 = L * .044, e = L * .015, d0 = L * .472, d1 = L * .686;
      x.setTransform(dpr, 0, 0, dpr, 0, 0); x.fillStyle = GRIS; x.fillRect(0, 0, L, H);                       // le cadre kaki
      x.fillStyle = NOIR; x.fillRect(b1, b1, L - 2 * b1, H - 2 * b1);                                         // le filet sombre
      x.fillStyle = JAUNE; x.fillRect(b2, b2, L - 2 * b2, H - 2 * b2);
      // sous la diagonale, le jaune est bordé de blanc
      x.fillStyle = BLANC; x.beginPath(); x.moveTo(b2, d0); x.lineTo(L - b2, d1); x.lineTo(L - b2, H - b2); x.lineTo(b2, H - b2); x.fill();
      x.fillStyle = JAUNE; x.beginPath(); x.moveTo(b2 + e, d0 + e * 1.25); x.lineTo(L - b2 - e, d1 + e * .95); x.lineTo(L - b2 - e, H - b2 - e); x.lineTo(b2 + e, H - b2 - e); x.fill();
      // le texte du bas, fixe, à sa place sur l'affiche
      x.fillStyle = NOIR; x.textBaseline = 'alphabetic';
      x.font = `400 ${L * .062}px ${TEXTE}`; x.textAlign = 'left'; x.fillText('Soaring to Success !', L * .092, L * 1.626);
      x.fillStyle = GRIS; petitesCap('DAILY HERALD', L * .4955 - L * .007, L * 1.764 + L * .006, L * .128, L * .707);
      x.fillStyle = NOIR; petitesCap('DAILY HERALD', L * .4955, L * 1.764, L * .128, L * .707);
      x.font = `400 ${L * .062}px ${TEXTE}`; x.textAlign = 'right'; x.fillText('— the Early Bird.', L * .911, L * 1.866);
      x.save(); x.beginPath(); x.rect(b2, b2, L - 2 * b2, H - 2 * b2); x.clip(); oiseaux.forEach(dessiner); x.restore();
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
        o.f += ((1 - pres) + pres * (.3 + .7 * Math.cos(o.ph)) - o.f) * Math.min(1, dt * 18);
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
    Promise.all([document.fonts.load('700 40px Caslon'), document.fonts.load('400 40px Caslon')]).then(() => peindre()).catch(() => {});
    mesurer(); avancer(0, performance.now());
    return () => { vivant = false; cancelAnimationFrame(raf); ro.disconnect(); };
  },
};
