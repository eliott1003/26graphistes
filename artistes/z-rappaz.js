// Z · Rolf Rappaz — Comptoir Suisse, Lausanne (1961).
// Le puzzle du C : les pièces sont éparpillées, on les remet en place. Une pièce lâchée près de sa place s'y enclenche.
//
// L'affiche est encore protégée : elle n'est PAS redessinée ici. Le puzzle découpe l'image fournie par Eliott
// (img/z/ref.jpg, première image de l'artiste dans labo/donnees.js) ; le nombre de pièces se règle avec GRILLE.
//
// PROVISOIRE tant que l'image manque : le puzzle découpe un C tout simple, dessiné en code. Ce n'est PAS le C de Rappaz ;
// l'atelier le dit à l'écran.

const GRILLE = { colonnes: 3, lignes: 4 }; // à l'arrivée de l'affiche : 4 × 5 si on veut un puzzle plus long
const FORMAT = 905 / 1280; // format de l'affiche suisse (F4), pour la version provisoire
const PAPIER = '#ece5d3', ENCRE = '#141414';
const charger = src => new Promise((ok, non) => { const im = new Image(); im.onload = () => ok(im); im.onerror = non; im.src = src; });

function cProvisoire() { // un C en anneau ouvert à droite, rien de plus
  const t = document.createElement('canvas'); t.width = 905; t.height = 1280; const g = t.getContext('2d'), w = t.width;
  g.fillStyle = PAPIER; g.fillRect(0, 0, t.width, t.height);
  g.strokeStyle = ENCRE; g.lineWidth = w * .22; g.beginPath(); g.arc(w * .5, t.height * .5, w * .36, .66, Math.PI * 2 - .66); g.stroke();
  return t;
}
// un côté de pièce, de A vers B ; s = 0 bord droit, sinon ±1 : la languette part du côté (nx, ny) × s, haute de h
const FORME = [[.38, 0], [.42, 0, .40, .07, .37, .11], [.30, .22, .44, .27, .50, .27], [.56, .27, .70, .22, .63, .11], [.60, .07, .58, 0, .62, 0]];
function cote(g, ax, ay, bx, by, s, nx, ny, h) {
  if (s) {
    const P = (a, b) => [ax + (bx - ax) * a + nx * s * b * h, ay + (by - ay) * a + ny * s * b * h];
    FORME.forEach(f => { if (f.length === 2) g.lineTo(...P(f[0], f[1])); else g.bezierCurveTo(...P(f[0], f[1]), ...P(f[2], f[3]), ...P(f[4], f[5])); });
  }
  g.lineTo(bx, by);
}

export default {
  lettre: 'Z',
  css: `
.rz{display:grid;grid-template-columns:minmax(0,1fr) minmax(170px,230px);gap:clamp(14px,2.4cqw,36px);align-items:end;height:100cqh}
.rz-scene{height:100cqh;min-width:0}
.rz-scene canvas{display:block;width:100%;height:100%;touch-action:none}
.rz-scene canvas.prise{cursor:grab}
.rz-scene canvas.tenue{cursor:grabbing}
.rz-cote{display:grid;gap:12px;align-content:end;padding-bottom:4px}
.rz-cote p{margin:0}
.rz-compte{font:900 clamp(40px,7cqw,76px)/.85 "Sofia Cond",Archivo,sans-serif}
.rz-boutons{display:flex;flex-wrap:wrap;gap:8px}
@media (max-width:760px){.rz{grid-template-columns:1fr;height:auto}.rz-scene{height:auto;aspect-ratio:10/16}}
`,
  monter(zone, ctx) {
    const { colonnes: C, lignes: R } = GRILLE, total = C * R;
    zone.innerHTML = `
      <div class="rz">
        <div class="rz-scene"><canvas data-export aria-label="Un puzzle de ${total} pièces à remettre en place"></canvas></div>
        <div class="rz-cote">
          <p class="rz-compte" aria-hidden="true"></p>
          <p class="etiquette" aria-live="polite"></p>
          <p class="note">Attrape une pièce et pose-la à sa place sur la feuille : elle s’enclenche quand elle est au bon endroit.</p>
          <p class="note" data-provisoire hidden>Version provisoire : ce C n’est pas celui de Rappaz. Le puzzle découpera l’affiche dès qu’Eliott l’aura envoyée.</p>
          <div class="rz-boutons">
            <button type="button" class="bouton plein" data-melanger>Mélanger</button>
            <button type="button" class="bouton" data-modele aria-pressed="false">Montrer le modèle</button>
            <button type="button" class="bouton" data-ranger>Ranger tout seul</button>
          </div>
        </div>
      </div>`;
    const scene = zone.querySelector('.rz-scene'), cv = scene.querySelector('canvas'), x = cv.getContext('2d');
    const compte = zone.querySelector('.rz-compte'), info = zone.querySelector('.etiquette'), bModele = zone.querySelector('[data-modele]');
    let source = cProvisoire(), pret = false;
    // sens des languettes : une valeur par bord intérieur, tirée une fois
    const hz = Array.from({ length: R + 1 }, (_, r) => Array.from({ length: C }, () => r === 0 || r === R ? 0 : Math.random() < .5 ? 1 : -1)); // bords horizontaux
    const vt = Array.from({ length: R }, () => Array.from({ length: C + 1 }, (_, c) => c === 0 || c === C ? 0 : Math.random() < .5 ? 1 : -1)); // bords verticaux
    // une pièce : sa case (r, c), sa place libre en fraction de la scène (fx, fy), posée ou non
    const pieces = Array.from({ length: total }, (_, i) => ({ r: Math.floor(i / C), c: i % C, fx: 0, fy: 0, x: 0, y: 0, posee: false, image: null }));
    let ordre = pieces.slice(), W = 0, H = 0, dpr = 1, bx = 0, by = 0, bw = 0, bh = 0, cw = 0, ch = 0, tab = 0;
    let vivant = true, raf = 0, prise = null, modele = false, glisse = []; // glisse : pièces qui vont se ranger toutes seules

    function tracer(g, p, ox, oy) { // le contour de la pièce, son coin haut gauche en (ox, oy)
      const { r, c } = p; g.beginPath(); g.moveTo(ox, oy);
      cote(g, ox, oy, ox + cw, oy, hz[r][c], 0, 1, tab);
      cote(g, ox + cw, oy, ox + cw, oy + ch, vt[r][c + 1], 1, 0, tab);
      cote(g, ox + cw, oy + ch, ox, oy + ch, hz[r + 1][c], 0, 1, tab);
      cote(g, ox, oy + ch, ox, oy, vt[r][c], 1, 0, tab);
      g.closePath();
    }
    function decouper() {
      const mg = Math.ceil(tab * .3) + 2;
      pieces.forEach(p => {
        const t = document.createElement('canvas'); t.width = Math.ceil(cw + 2 * mg); t.height = Math.ceil(ch + 2 * mg); const g = t.getContext('2d');
        tracer(g, p, mg, mg); g.save(); g.clip(); g.drawImage(source, mg - p.c * cw, mg - p.r * ch, bw, bh); g.restore();
        g.strokeStyle = 'rgba(0,0,0,.45)'; g.lineWidth = Math.max(1, dpr * .8); g.stroke();
        p.image = t; p.mg = mg;
      });
    }
    const place = p => ({ x: bx + p.c * cw, y: by + p.r * ch });
    function eparpiller(p) { // n'importe où dans la scène, mais presque jamais sur la feuille
      let px = 0, py = 0;
      for (let essai = 0; essai < 80; essai++) {
        px = cw * .08 + Math.random() * (W - cw * 1.16); py = ch * .08 + Math.random() * (H - ch * 1.16);
        const rx = Math.max(0, Math.min(px + cw, bx + bw) - Math.max(px, bx)), ry = Math.max(0, Math.min(py + ch, by + bh) - Math.max(py, by));
        if (rx * ry < cw * ch * (essai < 60 ? .06 : .4)) break;
      }
      p.fx = px / W; p.fy = py / H; p.posee = false;
    }
    function construire() {
      const r = scene.getBoundingClientRect(); if (!r.width || !r.height) return;
      dpr = Math.min(devicePixelRatio || 1, 2); W = cv.width = Math.round(r.width * dpr); H = cv.height = Math.round(r.height * dpr);
      const format = source.width / source.height, forme = W / H; // scène large : feuille au centre ; presque carrée : en haut à gauche ; étroite : en haut
      bh = Math.round(forme > 1.35 ? Math.min(H * .9, W * .4 / format) : forme > .8 ? Math.min(H * .7, W * .6 / format) : Math.min(H * .5, W * .74 / format)); bw = Math.round(bh * format);
      bx = Math.round(forme > 1.35 || forme <= .8 ? (W - bw) / 2 : W * .025); by = Math.round(forme > 1.35 ? (H - bh) / 2 : H * .025);
      cw = bw / C; ch = bh / R; tab = Math.min(cw, ch); decouper();
      if (!pret) { pret = true; melanger(); return; }
      pieces.forEach(p => { if (p.posee) Object.assign(p, place(p)); else { p.x = p.fx * W; p.y = p.fy * H; } });
      dessiner();
    }
    function melanger() { if (!pret) return; glisse = []; pieces.forEach(eparpiller); ordre = pieces.slice().sort(() => Math.random() - .5); pieces.forEach(p => { p.x = p.fx * W; p.y = p.fy * H; }); dire(); dessiner(); }
    function dire(fini) {
      const n = pieces.filter(p => p.posee).length; compte.textContent = `${n} / ${total}`;
      info.textContent = n === total ? 'Le C est reconstitué.' : n ? `${n} pièce${n > 1 ? 's' : ''} en place sur ${total}.` : 'Les pièces sont éparpillées.';
      if (fini && n === total) ctx.annoncer?.('Le puzzle est terminé.');
    }
    function dessiner() {
      if (!W) return;
      x.fillStyle = ctx.couleurs.fond; x.fillRect(0, 0, W, H);
      // la feuille : un creux où poser les pièces
      x.fillStyle = 'rgba(0,0,0,.28)'; x.fillRect(bx, by, bw, bh);
      if (modele) { x.globalAlpha = .3; x.drawImage(source, bx, by, bw, bh); x.globalAlpha = 1; }
      x.strokeStyle = 'rgba(255,255,255,.14)'; x.lineWidth = Math.max(1, dpr); // la trace des cases
      for (let c = 1; c < C; c++) { x.beginPath(); x.moveTo(bx + c * cw, by); x.lineTo(bx + c * cw, by + bh); x.stroke(); }
      for (let r = 1; r < R; r++) { x.beginPath(); x.moveTo(bx, by + r * ch); x.lineTo(bx + bw, by + r * ch); x.stroke(); }
      x.strokeStyle = 'rgba(255,255,255,.4)'; x.strokeRect(bx - .5, by - .5, bw + 1, bh + 1);
      ordre.filter(p => p.posee).forEach(p => x.drawImage(p.image, Math.round(p.x - p.mg), Math.round(p.y - p.mg)));
      ordre.filter(p => !p.posee).forEach(p => {
        const tenue = prise?.p === p;
        x.save(); x.shadowColor = 'rgba(0,0,0,.5)'; x.shadowBlur = tab * (tenue ? .16 : .06); x.shadowOffsetY = tab * (tenue ? .08 : .03);
        x.drawImage(p.image, Math.round(p.x - p.mg), Math.round(p.y - p.mg)); x.restore();
      });
    }
    function point(e) { const r = cv.getBoundingClientRect(); return { X: (e.clientX - r.left) * W / r.width, Y: (e.clientY - r.top) * H / r.height }; }
    function sous(X, Y) { // la pièce libre la plus haute sous le pointeur
      for (let i = ordre.length - 1; i >= 0; i--) { const p = ordre[i]; if (p.posee) continue; tracer(x, p, p.x, p.y); if (x.isPointInPath(X, Y)) return p; }
      return null;
    }
    cv.addEventListener('pointerdown', e => {
      const { X, Y } = point(e), p = sous(X, Y); if (!p) return;
      e.preventDefault(); glisse = glisse.filter(q => q !== p); ordre = ordre.filter(q => q !== p).concat(p); prise = { p, dx: X - p.x, dy: Y - p.y };
      cv.setPointerCapture(e.pointerId); cv.classList.add('tenue'); dessiner();
    });
    cv.addEventListener('pointermove', e => {
      const { X, Y } = point(e);
      if (!prise) { cv.classList.toggle('prise', !!sous(X, Y)); return; }
      const p = prise.p; p.x = Math.max(-cw * .5, Math.min(W - cw * .5, X - prise.dx)); p.y = Math.max(-ch * .5, Math.min(H - ch * .5, Y - prise.dy)); dessiner();
    });
    function lacher() {
      if (!prise) return; const p = prise.p, but = place(p); prise = null; cv.classList.remove('tenue');
      if (Math.hypot(p.x - but.x, p.y - but.y) < tab * .3) { Object.assign(p, but); p.posee = true; dire(true); } else { p.fx = p.x / W; p.fy = p.y / H; }
      dessiner();
    }
    cv.addEventListener('pointerup', lacher); cv.addEventListener('pointercancel', lacher);
    function boucle() { // les pièces se rangent une à une
      raf = 0; if (!vivant || !glisse.length) return;
      const p = glisse[0], but = place(p), dx = but.x - p.x, dy = but.y - p.y;
      if (ctx.reduireMouvement || Math.hypot(dx, dy) < 4) { Object.assign(p, but); p.posee = true; glisse.shift(); dire(true); } else { p.x += dx * .42; p.y += dy * .42; }
      dessiner(); if (glisse.length) raf = requestAnimationFrame(boucle);
    }
    zone.querySelector('[data-melanger]').addEventListener('click', melanger);
    zone.querySelector('[data-ranger]').addEventListener('click', () => { glisse = ordre.filter(p => !p.posee).reverse(); if (glisse.length && !raf) raf = requestAnimationFrame(boucle); });
    bModele.addEventListener('click', () => { modele = !modele; bModele.setAttribute('aria-pressed', modele); bModele.textContent = modele ? 'Cacher le modèle' : 'Montrer le modèle'; dessiner(); });

    const im = ctx.artiste.images?.[0];
    zone.querySelector('[data-provisoire]').hidden = !!im;
    if (im) charger(`${ctx.racine}img/z/${im.f}`).then(i => { if (!vivant) return; source = i; construire(); melanger(); })
      .catch(() => { if (!vivant) return; console.warn('Rappaz : image introuvable, C provisoire'); zone.querySelector('[data-provisoire]').hidden = false; });
    const ro = new ResizeObserver(construire); ro.observe(scene);
    construire();
    return () => { vivant = false; cancelAnimationFrame(raf); ro.disconnect(); };
  },
};
