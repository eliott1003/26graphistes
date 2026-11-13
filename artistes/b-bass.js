// B · Saul Bass — scanimation (dessins d'Eliott).
// Une image « entrelacée » : N images découpées en fines bandes verticales et mélangées. Une plaque rayée, qu'on attrape
// et qu'on glisse dessus, ne laisse voir qu'une bande sur N : en bougeant, les images s'enchaînent et le dessin s'anime.
// Le code découpe et entrelace tout seul : Eliott fournit seulement les images entières.
//
// Les dessins d'Eliott sont dans img/b/ ; leurs noms, dans l'ordre de l'animation, sont dans IMAGES (un nom peut revenir).
// Si IMAGES est vide ou qu'un fichier manque : animation de remplacement (un moulin dessiné en code), signalée à l'écran.

const IMAGES = ['b-01.svg', 'b-02.svg', 'b-04.svg', 'b-05.svg', 'b-04.svg', 'b-02.svg']; // dessins d'Eliott (13/11). Aller-retour : pas de b-03 reçu, et b-06 est identique à b-02
const REG = { fente: 5 }; // largeur d'une fente, en millièmes du côté de l'image (réglable avec ?reglages, puis à figer ici)
const N_REMPLACEMENT = 6;
const PAPIER = '#f4ecdb', ENCRE = '#0d0d0d';

// image de remplacement n° k : un moulin à cinq ailes, coupé aux ciseaux, qui tourne d'un cinquième de tour sur le cycle
const AILE = [[.06, -.5], [.3, -.62], [.455, -.2], [.4, .22], [.2, .02], [.085, .5]]; // (rayon, angle) en fraction du côté et en radians
function remplacement(g, c, k, n) {
  g.fillStyle = PAPIER; g.fillRect(0, 0, c, c);
  g.save(); g.translate(c / 2, c / 2); g.rotate(k / n * Math.PI * 2 / 5); g.fillStyle = ENCRE;
  for (let a = 0; a < 5; a++) {
    g.rotate(Math.PI * 2 / 5); g.beginPath();
    AILE.forEach(([r, t], i) => g[i ? 'lineTo' : 'moveTo'](Math.cos(t) * r * c, Math.sin(t) * r * c));
    g.closePath(); g.fill();
  }
  g.fillStyle = PAPIER; g.beginPath(); g.arc(0, 0, c * .032, 0, 7); g.fill(); g.restore();
}
const charger = src => new Promise((ok, non) => { const im = new Image(); im.onload = () => ok(im); im.onerror = non; im.src = src; });

export default {
  lettre: 'B',
  css: `
.bs{display:grid;grid-template-columns:minmax(0,1fr) minmax(170px,240px);gap:clamp(14px,2.4cqw,36px);align-items:end;height:100cqh}
.bs-scene{height:100cqh;min-width:0}
.bs-scene canvas{display:block;width:100%;height:100%;touch-action:none;cursor:default}
.bs-scene canvas.prise{cursor:grab}
.bs-scene canvas.tenue{cursor:grabbing}
.bs-cote{display:grid;gap:12px;align-content:end;padding-bottom:4px}
.bs-cote p{margin:0}
.bs-images{display:flex;gap:4px;flex-wrap:wrap}
.bs-images canvas{width:34px;height:34px;outline:1.5px solid transparent;outline-offset:1px}
.bs-images canvas.ici{outline-color:currentColor}
.bs-boutons{display:flex;flex-wrap:wrap;gap:8px}
.bs-reglage{display:grid;gap:6px;font:600 13px/1.3 Archivo,sans-serif;padding:10px;border:1.5px dashed currentColor}
.bs-reglage input{width:100%;accent-color:#111}
@media (max-width:760px){.bs{grid-template-columns:1fr;height:auto}.bs-scene{height:auto;aspect-ratio:1}}
`,
  monter(zone, ctx) {
    const reglages = new URLSearchParams(location.search).has('reglages');
    zone.innerHTML = `
      <div class="bs">
        <div class="bs-scene"><canvas data-export aria-label="Une image rayée et une plaque rayée à faire glisser dessus"></canvas></div>
        <div class="bs-cote">
          <p class="etiquette" aria-live="polite"></p>
          <div class="bs-images" aria-hidden="true"></div>
          <p class="note" data-explication></p>
          <p class="note" data-provisoire hidden>Version provisoire : ce moulin remplace les dessins d’Eliott, qui arrivent.</p>
          <div class="bs-boutons">
            <button type="button" class="bouton plein" data-auto aria-pressed="false">Faire glisser toute seule</button>
            <button type="button" class="bouton" data-retirer>Retirer la plaque</button>
          </div>
          ${reglages ? `<div class="bs-reglage"><label>Largeur des fentes : <output></output><input type="range" min="2" max="14" step="0.5" value="${REG.fente}"></label><button type="button" class="bouton" data-copier>Copier les réglages</button></div>` : ''}
        </div>
      </div>`;
    const scene = zone.querySelector('.bs-scene'), cv = scene.querySelector('canvas'), x = cv.getContext('2d');
    const info = zone.querySelector('.etiquette'), vignettes = zone.querySelector('.bs-images');
    const bAuto = zone.querySelector('[data-auto]');
    let sources = null; // images d'Eliott, ou null : remplacement
    let N = N_REMPLACEMENT, W = 0, H = 0, dpr = 1, cote = 0, w = 1, m = 0, ix = 0, iy = 0;
    let trame = null, plaque = null, px = 0, py = 0, fx = .46, fy = .06; // place de la plaque, en fraction du côté, par rapport à l'image
    let vivant = true, raf = 0, prise = null, auto = false, sens = 1, cible = null, dernier = 0, vu = -2;

    function image(k, c) {
      const t = document.createElement('canvas'); t.width = t.height = c; const g = t.getContext('2d');
      if (sources) { // l'image d'Eliott, entière dans le carré, sur le papier
        const im = sources[k], e = Math.min(c / im.naturalWidth, c / im.naturalHeight) || 1, lw = im.naturalWidth * e, lh = im.naturalHeight * e;
        g.fillStyle = PAPIER; g.fillRect(0, 0, c, c); g.drawImage(im, (c - lw) / 2, (c - lh) / 2, lw, lh);
      } else remplacement(g, c, k, N);
      return t;
    }
    function construire() {
      const r = scene.getBoundingClientRect(); if (!r.width || !r.height) return;
      dpr = Math.min(devicePixelRatio || 1, 2); W = cv.width = Math.round(r.width * dpr); H = cv.height = Math.round(r.height * dpr);
      cote = Math.round(Math.min(H * .82, W * .6)); // l'image à gauche, la plaque arrive par la droite : c'est en glissant de côté que ça s'anime
      w = Math.max(1, Math.round(cote * REG.fente / 1000)); m = Math.round(cote * .035);
      ix = Math.round(W * .035 + m); iy = Math.round((H - cote) / 2 + cote * .03);
      const images = Array.from({ length: N }, (_, k) => image(k, cote));
      trame = document.createElement('canvas'); trame.width = trame.height = cote; const g = trame.getContext('2d');
      for (let s = 0, i = 0; s < cote; s += w, i++) g.drawImage(images[i % N], s, 0, w, cote, s, 0, w, cote);
      plaque = document.createElement('canvas'); plaque.width = cote + 2 * m; plaque.height = cote + 2 * m; const p = plaque.getContext('2d');
      p.fillStyle = ENCRE; p.fillRect(0, 0, plaque.width, plaque.height);
      for (let s = m % (N * w); s < plaque.width; s += N * w) p.clearRect(s, 0, w, plaque.height); // une fente toutes les N bandes, calée sur le bord de l'image
      if (vignettes.childElementCount !== N) {
        vignettes.textContent = '';
        images.forEach(im => { const v = document.createElement('canvas'); v.width = v.height = 68; v.getContext('2d').drawImage(im, 0, 0, 68, 68); vignettes.append(v); });
      }
      poser(ix - m + Math.round(fx * cote / w) * w, iy - m + fy * cote); dessiner(); // calée sur une fente : une image nette dès l'ouverture
    }
    function poser(nx, ny) { // la plaque reste en partie dans la scène
      px = Math.round(Math.max(-plaque.width * .6, Math.min(W - plaque.width * .3, nx)));
      py = Math.round(Math.max(-plaque.height * .5, Math.min(H - plaque.height * .3, ny)));
      fx = (px - ix + m) / cote; fy = (py - iy + m) / cote;
    }
    function dessiner() {
      if (!trame) return;
      x.fillStyle = ctx.couleurs.fond; x.fillRect(0, 0, W, H);
      x.save(); x.shadowColor = 'rgba(0,0,0,.4)'; x.shadowBlur = cote * .05; x.shadowOffsetY = cote * .025; x.fillStyle = PAPIER; x.fillRect(ix, iy, cote, cote); x.restore();
      x.drawImage(trame, ix, iy);
      // la plaque : un film transparent rayé de noir, avec sa languette
      const lh = Math.round(cote * .058), lw = Math.round(cote * .34);
      x.save(); x.shadowColor = 'rgba(0,0,0,.28)'; x.shadowBlur = cote * .03; x.shadowOffsetY = cote * .012; x.drawImage(plaque, px, py); x.restore();
      x.fillStyle = ENCRE; x.fillRect(px, py - lh, lw, lh + 1);
      x.fillStyle = PAPIER; x.font = `600 ${Math.round(lh * .5)}px Archivo, sans-serif`; x.textBaseline = 'middle'; x.textAlign = 'left';
      x.fillText('PLAQUE RAYÉE : GLISSE-MOI', px + lh * .4, py - lh * .46, lw - lh * .8);
      x.strokeStyle = 'rgba(0,0,0,.55)'; x.lineWidth = Math.max(1, dpr); x.strokeRect(px + .5, py + .5, plaque.width - 1, plaque.height - 1);
      // quelle image voit-on ?
      const rx = Math.max(0, Math.min(px + plaque.width, ix + cote) - Math.max(px, ix)), ry = Math.max(0, Math.min(py + plaque.height, iy + cote) - Math.max(py, iy));
      const couvert = rx * ry / (cote * cote), k = couvert > .12 ? ((Math.floor((px + m - ix + w / 2) / w) % N) + N) % N : -1;
      if (k !== vu) {
        vu = k; [...vignettes.children].forEach((v, i) => v.classList.toggle('ici', i === k));
        if (!auto) info.textContent = k < 0 ? 'La plaque est à côté de l’image : glisse-la dessus.' : `Image ${k + 1} sur ${N}`;
      }
    }
    function dans(e) { const r = cv.getBoundingClientRect(), X = (e.clientX - r.left) * W / r.width, Y = (e.clientY - r.top) * H / r.height, lh = cote * .058; return { X, Y, ok: X >= px && X <= px + plaque.width && Y >= py - lh && Y <= py + plaque.height }; }
    function boucle(t) {
      if (!vivant) return; raf = 0; const dt = Math.min(.05, (t - dernier) / 1000 || 0); dernier = t;
      if (cible) { // la plaque va se placer
        const dx = cible.x - px, dy = cible.y - py;
        if (Math.abs(dx) < 2 && Math.abs(dy) < 2) { poser(cible.x, cible.y); cible = null; } else poser(px + dx * .16 + Math.sign(dx), py + dy * .16 + Math.sign(dy));
      } else if (auto) { // puis elle va et vient, à 7 images par seconde
        const base = ix - m, pas = Math.max(1, Math.round(w * (ctx.reduireMouvement ? 3 : 7) * dt));
        if (px > base + cote * .07) sens = -1; else if (px < base - cote * .07) sens = 1;
        poser(px + sens * pas, py);
      }
      dessiner(); if (cible || auto) raf = requestAnimationFrame(boucle);
    }
    const lancer = () => { if (!raf) { dernier = performance.now(); raf = requestAnimationFrame(boucle); } };
    function modeAuto(oui) {
      auto = oui; bAuto.setAttribute('aria-pressed', oui); bAuto.textContent = oui ? 'Arrêter' : 'Faire glisser toute seule';
      if (oui) { cible = { x: ix - m, y: iy - m }; info.textContent = `La plaque glisse : les ${N} images s’enchaînent.`; lancer(); } else { vu = -2; dessiner(); }
    }
    cv.addEventListener('pointerdown', e => {
      const p = dans(e); if (!p.ok) return;
      e.preventDefault(); if (auto) modeAuto(false); cible = null; prise = { dx: p.X - px, dy: p.Y - py }; cv.setPointerCapture(e.pointerId); cv.classList.add('tenue');
    });
    cv.addEventListener('pointermove', e => {
      const p = dans(e);
      if (prise) { poser(p.X - prise.dx, p.Y - prise.dy); dessiner(); } else cv.classList.toggle('prise', p.ok);
    });
    const lacher = () => { prise = null; cv.classList.remove('tenue'); };
    cv.addEventListener('pointerup', lacher); cv.addEventListener('pointercancel', lacher);
    bAuto.addEventListener('click', () => modeAuto(!auto));
    zone.querySelector('[data-retirer]').addEventListener('click', () => {
      if (auto) modeAuto(false);
      cible = { x: ix + cote * 1.03, y: iy - m + cote * .06 }; lancer();
    });
    if (reglages) {
      const curseur = zone.querySelector('.bs-reglage input'), sortie = zone.querySelector('.bs-reglage output');
      const dire = () => { sortie.textContent = `${REG.fente} millièmes (${w} px)`; };
      curseur.addEventListener('input', () => { REG.fente = +curseur.value; construire(); dire(); });
      zone.querySelector('[data-copier]').addEventListener('click', e => { navigator.clipboard?.writeText(`Bass : REG = { fente: ${REG.fente} }`); e.target.textContent = 'Copié'; });
      setTimeout(dire, 60);
    }
    const expliquer = () => { zone.querySelector('[data-explication]').textContent = `Attrape la plaque rayée et glisse-la lentement sur l’image. Chaque fente ne laisse voir qu’une bande sur ${N} : ${N} images sont cachées dans les rayures, et en bougeant elles s’enchaînent.`; };
    expliquer(); zone.querySelector('[data-provisoire]').hidden = IMAGES.length > 0;
    if (IMAGES.length) Promise.all(IMAGES.map(f => charger(`${ctx.racine}img/b/${f}`))).then(ims => { if (!vivant) return; sources = ims; N = ims.length; vignettes.textContent = ''; expliquer(); construire(); })
      .catch(() => { if (!vivant) return; console.warn('Bass : images introuvables dans img/b/, animation de remplacement'); zone.querySelector('[data-provisoire]').hidden = false; });
    const ro = new ResizeObserver(construire); ro.observe(scene);
    document.fonts?.load('600 20px Archivo').then(() => vivant && dessiner()).catch(() => {});
    construire();
    return () => { vivant = false; cancelAnimationFrame(raf); ro.disconnect(); };
  },
};
