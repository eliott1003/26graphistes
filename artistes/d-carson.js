// D · David Carson — Ray Gun (1992-1995).
// Déchirer la page : dessus, une page sage, bien rangée sur sa grille ; on tire à la souris (ou au doigt), le papier se déchire
// là où on passe, des lambeaux tombent, et la page de Carson apparaît dessous. Plus on tire vite, plus la déchirure est large.
//
// Les pages de Ray Gun sont protégées : elles ne sont PAS redessinées en code. Dessous, l'atelier montre l'image fournie par Eliott
// (première image de l'artiste dans labo/donnees.js, img/d/ref.jpg).
// PROVISOIRE tant que l'image manque : dessous, une page « à la manière de » composée pour l'atelier (mots à nous, polices du dépôt) ;
// l'atelier le dit à l'écran. La page du dessus et son grain de papier sont dessinés en code (une texture scannée peut les remplacer :
// img/d/papier.jpg, à déclarer dans PAPIER).

const PAPIER = null;      // 'papier.jpg' quand Eliott envoie une texture
const FORMAT = 10 / 12;   // provisoire : format d'un magazine ; avec l'image d'Eliott, celui de l'image
const BLANC = '#f3efe6';
const charger = src => new Promise((ok, non) => { const im = new Image(); im.onload = () => ok(im); im.onerror = non; im.src = src; });
const alea = (a, b) => a + Math.random() * (b - a);

function grain(g, w, h, force) { // un grain de papier léger
  const d = g.getImageData(0, 0, w, h), p = d.data;
  for (let i = 0; i < p.length; i += 4) { const n = (Math.random() - .5) * force; p[i] += n; p[i + 1] += n; p[i + 2] += n; }
  g.putImageData(d, 0, 0);
}
function pageSage(w, h, texture) { // la page du dessus : une grille, trois colonnes, tout à sa place
  const t = document.createElement('canvas'); t.width = w; t.height = h; const g = t.getContext('2d');
  g.fillStyle = BLANC; g.fillRect(0, 0, w, h);
  if (texture) { g.globalAlpha = .9; g.drawImage(texture, 0, 0, w, h); g.globalAlpha = 1; }
  const m = w * .09, col = (w - 2 * m - 2 * w * .035) / 3;
  g.fillStyle = '#1b1b1b'; g.textBaseline = 'alphabetic';
  g.font = `400 ${w * .034}px Caslon, Georgia, serif`; g.fillText('Mise en page', m, h * .085);
  g.textAlign = 'right'; g.fillText('14', w - m, h * .085); g.textAlign = 'left';
  g.fillRect(m, h * .1, w - 2 * m, Math.max(1, w * .002));
  g.font = `700 ${w * .105}px Caslon, Georgia, serif`; g.fillText('La grille', m, h * .23);
  g.font = `400 italic ${w * .032}px Caslon, Georgia, serif`; g.fillText('Chaque chose à sa place, et le texte se lit sans effort.', m, h * .285);
  g.fillStyle = 'rgba(27,27,27,.5)';
  for (let c = 0; c < 3; c++) for (let l = 0, y = h * .34; y < h * .9; l++, y += h * .0155) { // le texte courant, figuré par des lignes
    const fin = (l + c * 3) % 11 === 10; g.fillRect(m + c * (col + w * .035), y, col * (fin ? alea(.35, .7) : 1), h * .0052); if (fin) y += h * .012;
  }
  g.fillStyle = '#1b1b1b'; g.fillRect(m, h * .925, w - 2 * m, Math.max(1, w * .002));
  g.font = `600 ${w * .022}px Archivo, sans-serif`; g.fillText('Déchire-moi.', m, h * .955);
  if (!texture) grain(g, w, h, 14);
  return t;
}
function pageDessous(w, h) { // provisoire : une page « à la manière de », avec nos mots
  const t = document.createElement('canvas'); t.width = w; t.height = h; const g = t.getContext('2d');
  g.fillStyle = '#23272b'; g.fillRect(0, 0, w, h);
  [['#d8552b', .2, .25, .55], ['#2f7f86', .8, .6, .6], ['#c9b458', .55, .95, .4]].forEach(([c, a, b, r]) => { const d = g.createRadialGradient(a * w, b * h, 0, a * w, b * h, r * w); d.addColorStop(0, c); d.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = d; g.fillRect(0, 0, w, h); });
  const mot = (texte, police, taille, x, y, angle, coul, ls = 0) => { g.save(); g.translate(x * w, y * h); g.rotate(angle); g.font = police.replace('S', taille * w + 'px'); g.fillStyle = coul; try { g.letterSpacing = ls * taille * w + 'px'; } catch { /* ancien navigateur */ } g.fillText(texte, 0, 0); g.restore(); };
  mot('casser', '400 S Anton, Impact, sans-serif', .46, -.04, .36, -.06, 'rgba(243,239,230,.93)', -.05);
  mot('la grille', '400 italic S Caslon, Georgia, serif', .2, .22, .5, .05, '#111');
  mot('LA GRILLE', '900 S Bodoni, Didot, serif', .16, .12, .68, -.02, 'rgba(243,239,230,.35)', .3);
  mot('lis-moi', '400 S "Special Elite", monospace', .1, .46, .2, .2, '#f3efe6');
  mot('si tu peux', '400 S "Special Elite", monospace', .1, .5, .8, -Math.PI / 2 + .04, '#f0c53a');
  mot('1992', '900 S Bodoni, Didot, serif', .3, .5, .93, 0, 'rgba(17,17,17,.85)', -.08);
  mot('95', '400 S Anton, Impact, sans-serif', .36, .7, 1.02, -.12, '#d8552b');
  g.fillStyle = 'rgba(243,239,230,.8)';
  [[.08, .74, .26, .2, .04], [.3, .58, .16, .12, -.03], [.72, .08, .2, .3, .02]].forEach(([a, b, l, ht, ang]) => { // colonnes coupées, penchées, qui se chevauchent
    g.save(); g.translate(a * w, b * h); g.rotate(ang); for (let y = 0; y < ht * h; y += h * .011) g.fillRect(0, y, l * w * alea(.55, 1), h * .0042); g.restore();
  });
  mot('page provisoire, composée pour l’atelier', '600 S Archivo, sans-serif', .024, .05, .975, 0, 'rgba(243,239,230,.8)');
  grain(g, w, h, 34);
  return t;
}

export default {
  lettre: 'D',
  css: `
.cr{display:grid;grid-template-columns:minmax(0,1fr) minmax(170px,230px);gap:clamp(14px,2.4cqw,36px);align-items:end;height:100cqh}
.cr-scene{height:100cqh;min-width:0}
.cr-scene canvas{display:block;width:100%;height:100%;touch-action:none;cursor:crosshair}
.cr-cote{display:grid;gap:12px;align-content:end;padding-bottom:4px}
.cr-cote p{margin:0}
.cr-compte{font:900 clamp(40px,7cqw,76px)/.85 "Sofia Cond",Archivo,sans-serif}
.cr-boutons{display:flex;flex-wrap:wrap;gap:8px}
@media (max-width:760px){.cr{grid-template-columns:1fr;height:auto}.cr-scene{height:auto;aspect-ratio:10/12.6}}
`,
  monter(zone, ctx) {
    zone.innerHTML = `
      <div class="cr">
        <div class="cr-scene"><canvas data-export aria-label="Une page bien rangée à déchirer : dessous, une page de David Carson"></canvas></div>
        <div class="cr-cote">
          <p class="cr-compte" aria-hidden="true">0 %</p>
          <p class="etiquette" aria-live="polite"></p>
          <p class="note">Appuie et tire sur la page : le papier se déchire sous ta souris. Tire vite pour arracher large.</p>
          <p class="note" data-provisoire hidden>Version provisoire : la page du dessous est composée pour l’atelier, ce n’est pas une page de Ray Gun. L’atelier montrera la vraie dès qu’Eliott l’aura envoyée.</p>
          <div class="cr-boutons">
            <button type="button" class="bouton plein" data-recoller>Remettre une page neuve</button>
            <button type="button" class="bouton" data-arracher>Tout arracher</button>
          </div>
        </div>
      </div>`;
    const scene = zone.querySelector('.cr-scene'), cv = scene.querySelector('canvas'), x = cv.getContext('2d');
    const compte = zone.querySelector('.cr-compte'), info = zone.querySelector('.etiquette');
    let W = 0, H = 0, dpr = 1, vivant = true, raf = 0, fx = 0, fy = 0, fw = 0, fh = 0, format = FORMAT;
    let image = null, texture = null, dessous = null, haut = null, gh = null, lambeaux = [], tire = null, reste = 100, avant = 0, tCompte = 0, arrache = null;
    const sonde = document.createElement('canvas'); sonde.width = 30; sonde.height = 36; const gs = sonde.getContext('2d', { willReadFrequently: true });

    function neuve() { haut = pageSage(fw, fh, texture); gh = haut.getContext('2d'); lambeaux = []; arrache = null; compter(true); }
    function mesurer() {
      const r = scene.getBoundingClientRect(); if (!r.width || !r.height) return;
      dpr = Math.min(devicePixelRatio || 1, 2); W = cv.width = Math.round(r.width * dpr); H = cv.height = Math.round(r.height * dpr);
      fh = Math.round(Math.min(H * .95, W * .92 / format)); fw = Math.round(fh * format); fx = Math.round((W - fw) / 2); fy = Math.round((H - fh) / 2);
      if (image) { dessous = document.createElement('canvas'); dessous.width = fw; dessous.height = fh; dessous.getContext('2d').drawImage(image, 0, 0, fw, fh); } else dessous = pageDessous(fw, fh);
      neuve(); dessiner();
    }
    function compter(force) {
      const t = performance.now(); if (!force && t - tCompte < 250) return; tCompte = t;
      gs.clearRect(0, 0, 30, 36); gs.drawImage(haut, 0, 0, 30, 36); const p = gs.getImageData(0, 0, 30, 36).data; let n = 0; for (let i = 3; i < p.length; i += 4) if (p[i] > 128) n++;
      reste = Math.round(n / (30 * 36) * 100); const dechire = 100 - reste;
      compte.textContent = dechire + ' %';
      info.textContent = dechire === 0 ? 'La page est intacte, bien rangée sur sa grille.' : dechire < 60 ? 'Dessous, plus rien ne tient dans les colonnes.' : dechire < 97 ? 'Il ne reste presque rien de la grille.' : 'La grille a disparu.';
    }
    const tache = (g, cx, cy, r) => { // une forme déchiquetée
      const n = 9, a0 = Math.random() * 7; g.beginPath();
      for (let i = 0; i < n; i++) { const a = a0 + i / n * Math.PI * 2, d = r * alea(.55, 1.15); i ? g.lineTo(cx + Math.cos(a) * d, cy + Math.sin(a) * d) : g.moveTo(cx + Math.cos(a) * d, cy + Math.sin(a) * d); }
      g.closePath();
    };
    function dechirer(ax, ay, bx, by, larg) { // de A à B, en pixels de la feuille
      const d = Math.hypot(bx - ax, by - ay), n = Math.max(1, Math.ceil(d / (larg * .35)));
      for (let i = 0; i <= n; i++) {
        const k = i / n, cx = ax + (bx - ax) * k + alea(-1, 1) * larg * .18, cy = ay + (by - ay) * k + alea(-1, 1) * larg * .18;
        gh.globalCompositeOperation = 'source-atop'; gh.fillStyle = '#fbf9f3'; tache(gh, cx, cy, larg * 1.22); gh.fill(); // la tranche blanche du papier déchiré
        gh.globalCompositeOperation = 'destination-out'; tache(gh, cx, cy, larg); gh.fill();
      }
      gh.globalCompositeOperation = 'source-over';
      if (!ctx.reduireMouvement && lambeaux.length < 40 && Math.random() < Math.min(.9, d / (fw * .12))) { // un lambeau qui tombe
        const pts = Array.from({ length: 6 }, (_, i) => { const a = i / 6 * Math.PI * 2, r = larg * alea(.4, 1.1); return [Math.cos(a) * r, Math.sin(a) * r * alea(.5, 1)]; });
        lambeaux.push({ x: bx, y: by, vx: (bx - ax) * 4 + alea(-60, 60) * dpr, vy: alea(-160, -20) * dpr, a: alea(0, 6), va: alea(-7, 7), pts, vie: 1.6 });
      }
    }
    function dessiner() {
      if (!W || !haut) return;
      x.fillStyle = ctx.couleurs.fond; x.fillRect(0, 0, W, H);
      x.save(); x.shadowColor = 'rgba(0,0,0,.4)'; x.shadowBlur = fw * .05; x.shadowOffsetY = fw * .02; x.fillStyle = '#111'; x.fillRect(fx, fy, fw, fh); x.restore();
      x.drawImage(dessous, fx, fy);
      x.save(); x.shadowColor = 'rgba(0,0,0,.45)'; x.shadowBlur = fw * .012; x.shadowOffsetY = fw * .004; x.drawImage(haut, fx, fy); x.restore(); // l'ombre du papier sur la page du dessous
      for (const l of lambeaux) { x.save(); x.translate(fx + l.x, fy + l.y); x.rotate(l.a); x.globalAlpha = Math.min(1, l.vie * 2); x.beginPath(); l.pts.forEach((p, i) => i ? x.lineTo(...p) : x.moveTo(...p)); x.closePath(); x.fillStyle = BLANC; x.shadowColor = 'rgba(0,0,0,.35)'; x.shadowBlur = 6 * dpr; x.fill(); x.restore(); }
    }
    function boucle(t) {
      raf = 0; if (!vivant) return; const dt = Math.min(.04, (t - avant) / 1000 || .016); avant = t; let encore = false;
      if (arrache) { // tout arracher : une déchirure descend la page en zigzag
        const a = arrache, y0 = a.y; a.y += fh * dt * 1.5; const xa = a.cote ? fw * .02 : fw * .98, xb = a.cote ? fw * .98 : fw * .02;
        dechirer(xa, y0, xb, a.y, fw * .1); a.cote = !a.cote; if (a.y > fh * 1.08) { arrache = null; compter(true); } encore = true;
      }
      for (const l of lambeaux) { l.vy += 900 * dpr * dt; l.x += l.vx * dt; l.y += l.vy * dt; l.a += l.va * dt; l.vx *= 1 - 1.2 * dt; l.vie -= dt; }
      lambeaux = lambeaux.filter(l => l.vie > 0 && l.y < fh * 1.4); if (lambeaux.length) encore = true;
      if (tire || arrache) compter();
      dessiner(); if (encore || tire) raf = requestAnimationFrame(boucle);
    }
    const lancer = () => { if (!raf && vivant) { avant = performance.now(); raf = requestAnimationFrame(boucle); } };
    const point = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * W / r.width - fx, (e.clientY - r.top) * H / r.height - fy]; };
    cv.addEventListener('pointerdown', e => { e.preventDefault(); const [X, Y] = point(e); tire = { x: X, y: Y, t: performance.now() }; cv.setPointerCapture(e.pointerId); dechirer(X, Y, X, Y, fw * .03); lancer(); });
    cv.addEventListener('pointermove', e => {
      if (!tire) return; const [X, Y] = point(e), t = performance.now(), d = Math.hypot(X - tire.x, Y - tire.y); if (d < 2) return;
      const vitesse = d / Math.max(1, t - tire.t) / fw * 1000; // largeurs de feuille par seconde
      dechirer(tire.x, tire.y, X, Y, fw * Math.max(.022, Math.min(.085, .02 + vitesse * .028))); tire = { x: X, y: Y, t }; lancer();
    });
    const fin = () => { if (!tire) return; tire = null; compter(true); if (reste < 3) ctx.annoncer?.('La page est entièrement déchirée.'); };
    cv.addEventListener('pointerup', fin); cv.addEventListener('pointercancel', fin);
    zone.querySelector('[data-recoller]').addEventListener('click', () => { neuve(); dessiner(); });
    zone.querySelector('[data-arracher]').addEventListener('click', () => {
      if (ctx.reduireMouvement) { gh.clearRect(0, 0, fw, fh); compter(true); dessiner(); return; }
      arrache = { y: -fh * .04, cote: true }; lancer();
    });

    const im = ctx.artiste.images?.[0];
    zone.querySelector('[data-provisoire]').hidden = !!im;
    if (im) charger(`${ctx.racine}img/d/${im.f}`).then(i => { if (!vivant) return; image = i; format = i.naturalWidth / i.naturalHeight; mesurer(); })
      .catch(() => { if (!vivant) return; console.warn('Carson : image introuvable, page provisoire'); zone.querySelector('[data-provisoire]').hidden = false; });
    if (PAPIER) charger(`${ctx.racine}img/d/${PAPIER}`).then(i => { if (!vivant) return; texture = i; mesurer(); }).catch(() => {});
    const ro = new ResizeObserver(mesurer); ro.observe(scene);
    mesurer();
    document.fonts?.ready.then(() => { if (vivant && reste === 100) mesurer(); });
    return () => { vivant = false; cancelAnimationFrame(raf); ro.disconnect(); };
  },
};
