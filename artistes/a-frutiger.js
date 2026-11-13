// A · Adrian Frutiger — le Frutiger, dessiné pour la signalétique de Roissy-Charles-de-Gaulle.
// L'atelier reprend l'affiche-spécimen choisie par Eliott (img/a/ref.png, 600 × 957 px), telle quelle : même composition.
// Les textes du spécimen sont cachés sous le papier. Le pictogramme de l'avion (la case du bas) se détache : on le déplace,
// et sur son passage les lettres apparaissent. « Faire voler l'avion » balaie l'affiche tout seul, ligne par ligne.

const L0 = 600, H0 = 957;
const CACHES = [[268, 132, 600, 622], [250, 636, 600, 957], [0, 784, 250, 957]]; // zones de texte cachées (px de l'image)
const CASE = [123, 645, 246, 769];  // la case de l'avion sur l'affiche
const RAYON = 46;                   // rayon du passage de l'avion, en px de l'image
const charger = src => new Promise((ok, non) => { const im = new Image(); im.onload = () => ok(im); im.onerror = non; im.src = src; });

export default {
  lettre: 'A',
  css: `
.fg{display:grid;grid-template-columns:minmax(0,1fr) minmax(170px,230px);gap:clamp(14px,2.4cqw,36px);align-items:end;height:100cqh}
.fg-scene{height:100cqh;min-width:0;display:grid;place-items:center}
.fg-scene canvas{display:block;height:min(100cqh,calc((100cqw - 270px)*${H0 / L0}));aspect-ratio:${L0}/${H0};max-width:100%;touch-action:none;cursor:grab;background:#fff;box-shadow:0 26px 50px -30px rgba(0,0,0,.6)}
.fg-scene canvas.tenu{cursor:grabbing}
.fg-cote{display:grid;gap:12px;align-content:end;padding-bottom:4px}
.fg-cote p{margin:0}
.fg-compte{font:900 clamp(40px,7cqw,76px)/.85 "Sofia Cond",Archivo,sans-serif}
.fg-boutons{display:flex;flex-wrap:wrap;gap:8px}
@media (max-width:760px){.fg{grid-template-columns:1fr;height:auto}.fg-scene{height:auto}.fg-scene canvas{height:auto;width:100%}}
`,
  monter(zone, ctx) {
    zone.innerHTML = `
      <div class="fg">
        <div class="fg-scene"><canvas data-export width="${L0 * 2}" height="${H0 * 2}" aria-label="Le spécimen du Frutiger : les textes sont cachés, l’avion les fait apparaître sur son passage"></canvas></div>
        <div class="fg-cote">
          <p class="fg-compte" aria-hidden="true">0 %</p>
          <p class="etiquette" aria-live="polite">Attrape l’avion en bas de l’affiche et promène-le : les lettres apparaissent sur son passage.</p>
          <div class="fg-boutons">
            <button type="button" class="bouton plein" data-voler>Faire voler l’avion</button>
            <button type="button" class="bouton" data-recouvrir>Recouvrir</button>
          </div>
        </div>
      </div>`;
    const cv = zone.querySelector('canvas'), x = cv.getContext('2d'), K = 2;
    const compte = zone.querySelector('.fg-compte'), info = zone.querySelector('.etiquette');
    const papier = document.createElement('canvas'); papier.width = L0; papier.height = H0; const gp = papier.getContext('2d', { willReadFrequently: true });
    let source = null, vivant = true, raf = 0, vol = null, tenu = null;
    const avion = { x: (CASE[0] + CASE[2]) / 2, y: (CASE[1] + CASE[3]) / 2 }, cw = CASE[2] - CASE[0], ch = CASE[3] - CASE[1];

    function recouvrir() {
      gp.globalCompositeOperation = 'source-over'; gp.clearRect(0, 0, L0, H0); gp.fillStyle = '#fff';
      CACHES.forEach(([a, b, c, d]) => gp.fillRect(a, b, c - a, d - b));
      gp.clearRect(CASE[0] - 2, CASE[1] - 2, cw + 4, ch + 4); // la case de l'avion reste visible
      Object.assign(avion, { x: (CASE[0] + CASE[2]) / 2, y: (CASE[1] + CASE[3]) / 2 }); mesurer();
    }
    function gratter(a, b, c, d) { // le passage de l'avion, d'un point à l'autre
      gp.globalCompositeOperation = 'destination-out'; gp.lineCap = 'round'; gp.lineWidth = RAYON * 2; gp.strokeStyle = '#000';
      gp.beginPath(); gp.moveTo(a, b); gp.lineTo(c, d); gp.stroke();
    }
    let tCompte = 0;
    function mesurer() {
      const d = gp.getImageData(0, 0, L0, H0).data; let reste = 0, total = 0;
      CACHES.forEach(([a, b, c, e]) => { total += (c - a) * (e - b); });
      for (let i = 3; i < d.length; i += 16) if (d[i] > 128) reste += 4;
      const p = Math.max(0, Math.min(100, Math.round(100 * (1 - reste / total))));
      compte.textContent = p + ' %';
      if (p >= 97 && !vol) info.textContent = 'Tout le spécimen est révélé : des lettres faites pour être lues de loin, en mouvement.';
    }
    function dessiner() {
      x.setTransform(K, 0, 0, K, 0, 0); x.fillStyle = '#fff'; x.fillRect(0, 0, L0, H0);
      if (!source) return;
      x.drawImage(source, 0, 0, L0, H0);
      x.fillStyle = '#fff'; x.fillRect(CASE[0] - 1, CASE[1] - 1, cw + 2, ch + 2);           // la case vidée
      x.setLineDash([5, 5]); x.strokeStyle = 'rgba(0,0,0,.25)'; x.lineWidth = 1.5; x.strokeRect(CASE[0] + 4, CASE[1] + 4, cw - 8, ch - 8); x.setLineDash([]);
      x.drawImage(papier, 0, 0);
      x.save(); x.shadowColor = 'rgba(0,0,0,.3)'; x.shadowBlur = tenu || vol ? 18 : 0; x.shadowOffsetY = tenu || vol ? 8 : 0;
      x.drawImage(source, CASE[0], CASE[1], cw, ch, avion.x - cw / 2, avion.y - ch / 2, cw, ch); x.restore();
    }
    const point = e => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * L0 / r.width, y: (e.clientY - r.top) * H0 / r.height }; };
    const borne = (v, a, b) => Math.max(a, Math.min(b, v));
    cv.addEventListener('pointerdown', e => {
      const p = point(e); if (Math.abs(p.x - avion.x) > cw * .7 || Math.abs(p.y - avion.y) > ch * .7) return;
      e.preventDefault(); arreterVol(); tenu = { dx: avion.x - p.x, dy: avion.y - p.y }; cv.setPointerCapture(e.pointerId); cv.classList.add('tenu'); dessiner();
    });
    cv.addEventListener('pointermove', e => {
      if (!tenu) return; const p = point(e), ax = avion.x, ay = avion.y;
      avion.x = borne(p.x + tenu.dx, cw / 2, L0 - cw / 2); avion.y = borne(p.y + tenu.dy, ch / 2, H0 - ch / 2);
      gratter(ax, ay, avion.x, avion.y); dessiner();
      if (performance.now() - tCompte > 120) { tCompte = performance.now(); mesurer(); }
    });
    const lacher = () => { if (!tenu) return; tenu = null; cv.classList.remove('tenu'); mesurer(); dessiner(); };
    cv.addEventListener('pointerup', lacher); cv.addEventListener('pointercancel', lacher);

    // le vol automatique : des allers-retours sur chaque bande de texte
    function chemin() {
      const pts = [[avion.x, avion.y]];
      CACHES.forEach(([a, b, c, d]) => { let sens = 0; for (let y = b + RAYON * .8; y < d + RAYON * .5; y += RAYON * 1.6) { const g = a + RAYON * .4, r = c - RAYON * .4; pts.push(sens ? [r, y] : [g, y], sens ? [g, y] : [r, y]); sens ^= 1; } });
      pts.push([(CASE[0] + CASE[2]) / 2, (CASE[1] + CASE[3]) / 2]);
      return pts;
    }
    function arreterVol() { vol = null; cancelAnimationFrame(raf); raf = 0; }
    function voler() {
      if (ctx.reduireMouvement) { gp.globalCompositeOperation = 'destination-out'; gp.fillRect(0, 0, L0, H0); mesurer(); dessiner(); return; }
      const pts = chemin(); vol = { pts, i: 0, t: performance.now() }; info.textContent = 'L’avion balaie l’affiche, ligne par ligne.';
      const vitesse = 1.3; // px de l'image par milliseconde
      const pas = t => {
        if (!vivant || !vol) return;
        let d = (t - vol.t) * vitesse; vol.t = t;
        while (d > 0 && vol.i < pts.length - 1) {
          const [a, b] = pts[vol.i + 1], dx = a - avion.x, dy = b - avion.y, l = Math.hypot(dx, dy);
          const ax = avion.x, ay = avion.y;
          if (l <= d) { avion.x = a; avion.y = b; vol.i++; d -= l; } else { avion.x += dx / l * d; avion.y += dy / l * d; d = 0; }
          gratter(ax, ay, avion.x, avion.y);
        }
        dessiner(); if (t - tCompte > 150) { tCompte = t; mesurer(); }
        if (vol.i >= pts.length - 1) { vol = null; raf = 0; mesurer(); dessiner(); return; }
        raf = requestAnimationFrame(pas);
      };
      raf = requestAnimationFrame(pas);
    }
    zone.querySelector('[data-voler]').addEventListener('click', () => { if (!source) return; arreterVol(); voler(); });
    zone.querySelector('[data-recouvrir]').addEventListener('click', () => { arreterVol(); recouvrir(); dessiner(); info.textContent = 'Les textes sont de nouveau cachés. Promène l’avion.'; });

    const im = ctx.artiste.images?.[0];
    charger(`${ctx.racine}img/a/${im ? im.f : 'ref.png'}`).then(i => { if (!vivant) return; source = i; recouvrir(); dessiner(); })
      .catch(() => { info.textContent = 'Le spécimen ne se charge pas (img/a/ref.png).'; });
    recouvrir(); dessiner();
    return () => { vivant = false; arreterVol(); };
  },
};
