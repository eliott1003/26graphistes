// Z · Rolf Rappaz — Comptoir Suisse, Lausanne (1961).
// Le C de l'affiche est déjà un puzzle : 15 pièces, trois par couleur (rouge, vert, bleu, jaune, blanc).
// L'atelier défait ce puzzle : les vraies pièces sont éparpillées autour de l'affiche, on les remet en place.
//
// Rien n'est redessiné : les pièces sont découpées dans l'image fournie par Eliott (img/z/ref.jpg), une par une,
// suivant leurs contours sur l'affiche (img/z/pieces/01.png à 15.png, à mi-résolution), et la feuille est la même
// affiche avec le C vidé (img/z/fond.jpg). PIECES donne la place de chaque pièce en pixels de l'image d'origine.

const BASE = [1440, 2160];
const PIECES = [ // [x, y, largeur, hauteur, couleur], en pixels de img/z/ref.jpg
  [473, 493, 364, 299, 'rouge'], [141, 1167, 448, 450, 'rouge'], [488, 1507, 432, 223, 'rouge'],
  [496, 403, 364, 175, 'vert'], [214, 825, 244, 254, 'vert'], [704, 1311, 382, 398, 'vert'],
  [700, 414, 349, 336, 'bleu'], [83, 814, 247, 314, 'bleu'], [530, 1379, 340, 228, 'bleu'],
  [887, 443, 324, 377, 'jaune'], [100, 605, 342, 320, 'jaune'], [82, 986, 336, 362, 'jaune'],
  [229, 448, 386, 425, 'blanc'], [337, 1391, 286, 328, 'blanc'], [1067, 1432, 297, 270, 'blanc'],
];
const C = [82, 403, 1364, 1730]; // boîte du C : les pièces éparpillées évitent de s'y poser
const charger = src => new Promise((ok, non) => { const im = new Image(); im.onload = () => ok(im); im.onerror = non; im.src = src; });

export default {
  lettre: 'Z',
  css: `
.rz{display:grid;grid-template-columns:minmax(0,1fr) minmax(160px,210px);gap:clamp(14px,2.4cqw,32px);align-items:end;height:100cqh}
.rz-scene{height:100cqh;min-width:0}
.rz-scene canvas{display:block;width:100%;height:100%;touch-action:none}
.rz-scene canvas.prise{cursor:grab}
.rz-scene canvas.tenue{cursor:grabbing}
.rz-cote{display:grid;gap:12px;align-content:end;padding-bottom:4px}
.rz-cote p{margin:0}
.rz-compte{font:900 clamp(40px,7cqw,76px)/.85 "Sofia Cond",Archivo,sans-serif}
.rz-boutons{display:flex;flex-wrap:wrap;gap:8px}
@media (max-width:760px){.rz{grid-template-columns:1fr;height:auto}.rz-scene{height:auto;aspect-ratio:10/14}}
`,
  monter(zone, ctx) {
    const total = PIECES.length;
    zone.innerHTML = `
      <div class="rz">
        <div class="rz-scene"><canvas data-export aria-label="Le C de Rolf Rappaz : ${total} pièces de puzzle à remettre en place"></canvas></div>
        <div class="rz-cote">
          <p class="rz-compte" aria-hidden="true">…</p>
          <p class="etiquette" aria-live="polite">Chargement des pièces…</p>
          <p class="note">Sur l’affiche, le C est déjà un puzzle : ${total} pièces, trois par couleur. Attrape une pièce et pose-la à sa place : elle s’enclenche quand elle est au bon endroit.</p>
          <div class="rz-boutons">
            <button type="button" class="bouton plein" data-melanger>Mélanger</button>
            <button type="button" class="bouton" data-modele aria-pressed="false">Montrer le modèle</button>
            <button type="button" class="bouton" data-ranger>Ranger tout seul</button>
          </div>
        </div>
      </div>`;
    const scene = zone.querySelector('.rz-scene'), cv = scene.querySelector('canvas'), x = cv.getContext('2d');
    const compte = zone.querySelector('.rz-compte'), info = zone.querySelector('.etiquette'), bModele = zone.querySelector('[data-modele]');
    const pieces = PIECES.map(([px, py, pw, ph, couleur]) => ({ px, py, pw, ph, couleur, fx: 0, fy: 0, x: 0, y: 0, posee: false, image: null, alpha: null, aw: 0 }));
    let fond = null, modele = null, ordre = pieces.slice(), W = 0, H = 0, dpr = 1, bx = 0, by = 0, bw = 0, bh = 0, k = 1, pret = false;
    let vivant = true, raf = 0, prise = null, voirModele = false, glisse = [];

    const place = p => ({ x: bx + p.px * k, y: by + p.py * k });
    function eparpiller(p) { // n'importe où dans la scène, mais presque jamais sur le C
      const w = p.pw * k, h = p.ph * k, cx0 = bx + C[0] * k, cy0 = by + C[1] * k, cx1 = bx + C[2] * k, cy1 = by + C[3] * k;
      let px = 0, py = 0;
      for (let essai = 0; essai < 120; essai++) {
        px = Math.random() * Math.max(1, W - w); py = Math.random() * Math.max(1, H - h);
        const rx = Math.max(0, Math.min(px + w, cx1) - Math.max(px, cx0)), ry = Math.max(0, Math.min(py + h, cy1) - Math.max(py, cy0));
        if (rx * ry < w * h * (essai < 80 ? .12 : .5)) break;
      }
      p.fx = px / W; p.fy = py / H; p.posee = false;
    }
    function construire() {
      const r = scene.getBoundingClientRect(); if (!r.width || !r.height || !fond) return;
      dpr = Math.min(devicePixelRatio || 1, 2); W = cv.width = Math.round(r.width * dpr); H = cv.height = Math.round(r.height * dpr);
      const format = BASE[0] / BASE[1], large = W / H > .9; // affiche à gauche, les pièces à côté ; sur téléphone, affiche en haut
      bh = Math.round(large ? H : Math.min(H * .66, W * .8 / format)); bw = Math.round(bh * format);
      bx = large ? 0 : Math.round((W - bw) / 2); by = 0; k = bw / BASE[0];
      if (!pret) { pret = true; melanger(); return; }
      pieces.forEach(p => { if (p.posee) Object.assign(p, place(p)); else { p.x = p.fx * W; p.y = p.fy * H; } });
      dessiner();
    }
    function melanger() { if (!pret) return; glisse = []; pieces.forEach(eparpiller); ordre = pieces.slice().sort(() => Math.random() - .5); pieces.forEach(p => { p.x = p.fx * W; p.y = p.fy * H; }); dire(); dessiner(); }
    function dire(fini) {
      const n = pieces.filter(p => p.posee).length; compte.textContent = `${n} / ${total}`;
      info.textContent = n === total ? 'Le C est reconstitué : c’est l’affiche de 1961.' : n ? `${n} pièce${n > 1 ? 's' : ''} en place sur ${total}.` : 'Les pièces sont éparpillées.';
      if (fini && n === total) ctx.annoncer?.('Le puzzle est terminé.');
    }
    function dessiner() {
      if (!W) return;
      x.clearRect(0, 0, W, H);
      x.save(); x.shadowColor = 'rgba(0,0,0,.45)'; x.shadowBlur = 24 * dpr; x.shadowOffsetY = 10 * dpr; x.fillStyle = '#000'; x.fillRect(bx, by, bw, bh); x.restore();
      x.drawImage(fond, bx, by, bw, bh);
      if (voirModele) { x.globalAlpha = .28; x.drawImage(modele, bx, by, bw, bh); x.globalAlpha = 1; }
      ordre.filter(p => p.posee).forEach(p => x.drawImage(p.image, p.x, p.y, p.pw * k, p.ph * k));
      ordre.filter(p => !p.posee).forEach(p => {
        const tenue = prise?.p === p;
        x.save(); x.shadowColor = 'rgba(0,0,0,.55)'; x.shadowBlur = (tenue ? 26 : 10) * dpr; x.shadowOffsetY = (tenue ? 14 : 4) * dpr;
        x.drawImage(p.image, p.x, p.y, p.pw * k, p.ph * k); x.restore();
      });
    }
    function point(e) { const r = cv.getBoundingClientRect(); return { X: (e.clientX - r.left) * W / r.width, Y: (e.clientY - r.top) * H / r.height }; }
    function touche(p, X, Y) { // la pièce est-elle pleine à cet endroit ? (on lit sa transparence)
      const u = (X - p.x) / (p.pw * k), v = (Y - p.y) / (p.ph * k); if (u < 0 || v < 0 || u >= 1 || v >= 1) return false;
      const ah = p.alpha.length / p.aw; return p.alpha[Math.floor(v * ah) * p.aw + Math.floor(u * p.aw)] > 60;
    }
    function sous(X, Y) { for (let i = ordre.length - 1; i >= 0; i--) { const p = ordre[i]; if (!p.posee && touche(p, X, Y)) return p; } return null; }
    cv.addEventListener('pointerdown', e => {
      if (!pret) return; const { X, Y } = point(e), p = sous(X, Y); if (!p) return;
      e.preventDefault(); glisse = glisse.filter(q => q !== p); ordre = ordre.filter(q => q !== p).concat(p); prise = { p, dx: X - p.x, dy: Y - p.y };
      cv.setPointerCapture(e.pointerId); cv.classList.add('tenue'); dessiner();
    });
    cv.addEventListener('pointermove', e => {
      if (!pret) return; const { X, Y } = point(e);
      if (!prise) { cv.classList.toggle('prise', !!sous(X, Y)); return; }
      const p = prise.p, w = p.pw * k, h = p.ph * k;
      p.x = Math.max(-w * .5, Math.min(W - w * .5, X - prise.dx)); p.y = Math.max(-h * .5, Math.min(H - h * .5, Y - prise.dy)); dessiner();
    });
    function lacher() {
      if (!prise) return; const p = prise.p, but = place(p); prise = null; cv.classList.remove('tenue');
      if (Math.hypot(p.x - but.x, p.y - but.y) < bw * .045) { Object.assign(p, but); p.posee = true; dire(true); } else { p.fx = p.x / W; p.fy = p.y / H; }
      dessiner();
    }
    cv.addEventListener('pointerup', lacher); cv.addEventListener('pointercancel', lacher);
    function boucle() { // les pièces se rangent une à une
      raf = 0; if (!vivant || !glisse.length) return;
      const p = glisse[0], but = place(p), dx = but.x - p.x, dy = but.y - p.y;
      if (ctx.reduireMouvement || Math.hypot(dx, dy) < 4) { Object.assign(p, but); p.posee = true; glisse.shift(); dire(true); } else { p.x += dx * .32; p.y += dy * .32; }
      dessiner(); if (glisse.length) raf = requestAnimationFrame(boucle);
    }
    zone.querySelector('[data-melanger]').addEventListener('click', melanger);
    zone.querySelector('[data-ranger]').addEventListener('click', () => { glisse = ordre.filter(p => !p.posee).reverse(); if (glisse.length && !raf) raf = requestAnimationFrame(boucle); });
    bModele.addEventListener('click', () => { voirModele = !voirModele; bModele.setAttribute('aria-pressed', voirModele); bModele.textContent = voirModele ? 'Cacher le modèle' : 'Montrer le modèle'; dessiner(); });

    const dossier = `${ctx.racine}img/z/`;
    Promise.all([charger(dossier + 'fond.jpg'), charger(dossier + 'ref.jpg'), ...pieces.map((_, i) => charger(`${dossier}pieces/${String(i + 1).padStart(2, '0')}.png`))])
      .then(([f, m, ...ims]) => {
        if (!vivant) return; fond = f; modele = m;
        ims.forEach((im, i) => {
          const p = pieces[i]; p.image = im;
          const t = document.createElement('canvas'); t.width = im.naturalWidth; t.height = im.naturalHeight; const g = t.getContext('2d'); g.drawImage(im, 0, 0);
          const d = g.getImageData(0, 0, t.width, t.height).data; p.aw = t.width; p.alpha = new Uint8Array(t.width * t.height); for (let j = 0; j < p.alpha.length; j++) p.alpha[j] = d[j * 4 + 3];
        });
        construire();
      })
      .catch(() => { if (vivant) info.textContent = 'Les pièces ne se chargent pas : recharge la page.'; });
    const ro = new ResizeObserver(construire); ro.observe(scene);
    return () => { vivant = false; cancelAnimationFrame(raf); ro.disconnect(); };
  },
};
