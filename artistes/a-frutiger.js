// A · Adrian Frutiger — le Frutiger, dessiné pour la signalétique de Roissy-Charles-de-Gaulle.
// L'atelier reprend l'affiche-spécimen choisie par Eliott (img/a/ref.png, 600 × 957 px), telle quelle : même composition.
// Tout est en place comme sur l'affiche, sauf les alphabets de la colonne de droite, cachés sous le papier. L'avion dessiné en
// lettres, en bas (le paragraphe en forme d'avion), se détache : on le promène, et sur le passage de son nez les lettres
// apparaissent. « Faire voler l'avion » balaie la colonne tout seul, ligne par ligne.

const L0 = 600, H0 = 957;
const CACHES = [[268, 132, 600, 622]]; // la colonne des alphabets, cachée (px de l'image)
const AVION = [0, 640, 600, 957];       // la zone de l'avion en lettres
const EPARGNE = [[20, 668, 100, 755], [118, 640, 252, 774]]; // dans cette zone, la flèche et la case ne bougent pas
const NEZ = [560, 652];                 // le nez de l'avion (px de l'image)
const RAYON = 44;                       // rayon du passage du nez
const charger = src => new Promise((ok, non) => { const im = new Image(); im.onload = () => ok(im); im.onerror = non; im.src = src; });

export default {
  lettre: 'A',
  css: `
.fg{display:grid;grid-template-columns:minmax(0,1fr) minmax(170px,230px);gap:clamp(14px,2.4cqw,36px);align-items:end;height:100cqh}
.fg-scene{height:100cqh;min-width:0;display:grid;place-items:center}
/* curseur géré en js */
.fg-scene canvas{display:block;height:min(100cqh,calc((100cqw - 270px)*${H0 / L0}));aspect-ratio:${L0}/${H0};max-width:100%;touch-action:none;background:#fff;box-shadow:0 26px 50px -30px rgba(0,0,0,.6)}
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
          <p class="etiquette" aria-live="polite">Attrape l’avion en lettres, en bas de l’affiche, et promène-le : les alphabets apparaissent sous son nez.</p>
          <div class="fg-boutons">
            <button type="button" class="bouton plein" data-voler>Faire voler l’avion</button>
            <button type="button" class="bouton" data-recouvrir>Recouvrir</button>
          </div>
        </div>
      </div>`;
    const cv = zone.querySelector('canvas'), x = cv.getContext('2d'), K = 2;
    const compte = zone.querySelector('.fg-compte'), info = zone.querySelector('.etiquette');
    const papier = document.createElement('canvas'); papier.width = L0; papier.height = H0; const gp = papier.getContext('2d', { willReadFrequently: true });
    let source = null, vivant = true, raf = 0, vol = null, tenu = null, lutin = null, trou = null;
    const aw = AVION[2] - AVION[0], ah = AVION[3] - AVION[1];
    const avion = { x: 0, y: 0 }; // décalage de l'avion par rapport à sa place
    const nez = () => ({ x: NEZ[0] + avion.x, y: NEZ[1] + avion.y });
    function preparer() { // l'avion en lettres devient un calque transparent ; son empreinte blanche bouchera sa place
      lutin = document.createElement('canvas'); lutin.width = aw; lutin.height = ah; const g = lutin.getContext('2d', { willReadFrequently: true });
      g.drawImage(source, AVION[0], AVION[1], aw, ah, 0, 0, aw, ah);
      EPARGNE.forEach(([a, b, c, d]) => g.clearRect(a - AVION[0], b - AVION[1], c - a, d - b));
      const im = g.getImageData(0, 0, aw, ah), d = im.data;
      for (let i = 0; i < d.length; i += 4) { const v = (d[i] + d[i + 1] + d[i + 2]) / 3, al = d[i + 3] ? Math.max(0, Math.min(255, (235 - v) * 1.6)) : 0; d[i] = d[i + 1] = d[i + 2] = 0; d[i + 3] = al; }
      g.putImageData(im, 0, 0);
      trou = document.createElement('canvas'); trou.width = aw; trou.height = ah; const t = trou.getContext('2d');
      for (const [dx, dy] of [[0, 0], [2, 0], [-2, 0], [0, 2], [0, -2]]) t.drawImage(lutin, dx, dy);
      t.globalCompositeOperation = 'source-in'; t.fillStyle = '#fff'; t.fillRect(0, 0, aw, ah);
    }
    function recouvrir() {
      gp.globalCompositeOperation = 'source-over'; gp.clearRect(0, 0, L0, H0); gp.fillStyle = '#fff';
      CACHES.forEach(([a, b, c, d]) => gp.fillRect(a, b, c - a, d - b));
      avion.x = 0; avion.y = 0; mesurer();
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
      x.drawImage(papier, 0, 0);
      if (!lutin) return;
      if (avion.x || avion.y) { x.drawImage(trou, AVION[0], AVION[1]); x.globalAlpha = .08; x.drawImage(lutin, AVION[0], AVION[1]); x.globalAlpha = 1; }
      x.save(); if (tenu || vol) { x.shadowColor = 'rgba(0,0,0,.25)'; x.shadowBlur = 10; x.shadowOffsetY = 6; }
      x.drawImage(lutin, AVION[0] + avion.x, AVION[1] + avion.y); x.restore(); x.setLineDash([]);
    }
    const point = e => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * L0 / r.width, y: (e.clientY - r.top) * H0 / r.height }; };
    const borne = (v, a, b) => Math.max(a, Math.min(b, v));
    const surAvion = p => { const u = Math.round(p.x - AVION[0] - avion.x), v = Math.round(p.y - AVION[1] - avion.y); if (u < 0 || v < 0 || u >= aw || v >= ah) return false;
      const d = lutin.getContext('2d').getImageData(Math.max(0, u - 14), Math.max(0, v - 14), 28, 28).data; for (let i = 3; i < d.length; i += 4) if (d[i] > 60) return true; return false; };
    cv.addEventListener('pointerdown', e => {
      if (!lutin) return; const p = point(e); if (!surAvion(p)) return;
      e.preventDefault(); arreterVol(); tenu = { x: p.x - avion.x, y: p.y - avion.y }; cv.setPointerCapture(e.pointerId); cv.classList.add('tenu'); dessiner();
    });
    cv.addEventListener('pointermove', e => {
      if (!tenu) { if (lutin) cv.style.cursor = surAvion(point(e)) ? 'grab' : 'default'; return; }
      const p = point(e), a = nez();
      avion.x = borne(p.x - tenu.x, -NEZ[0], L0 - NEZ[0]); avion.y = borne(p.y - tenu.y, -NEZ[1], H0 - NEZ[1]);
      const b = nez(); gratter(a.x, a.y, b.x, b.y); dessiner();
      if (performance.now() - tCompte > 120) { tCompte = performance.now(); mesurer(); }
    });
    const lacher = () => { if (!tenu) return; tenu = null; cv.classList.remove('tenu'); mesurer(); dessiner(); };
    cv.addEventListener('pointerup', lacher); cv.addEventListener('pointercancel', lacher);

    // le vol automatique : des allers-retours sur chaque bande de texte
    function chemin() {
      const n0 = nez(), pts = [[n0.x, n0.y]];
      CACHES.forEach(([a, b, c, d]) => { let sens = 0; for (let y = b + RAYON * .8; y < d + RAYON * .5; y += RAYON * 1.6) { const g = a + RAYON * .4, r = c - RAYON * .4; pts.push(sens ? [r, y] : [g, y], sens ? [g, y] : [r, y]); sens ^= 1; } });
      pts.push(NEZ.slice());
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
          const n = nez(), [a, b] = pts[vol.i + 1], dx = a - n.x, dy = b - n.y, l = Math.hypot(dx, dy);
          if (l <= d) { avion.x += dx; avion.y += dy; vol.i++; d -= l; } else { avion.x += dx / l * d; avion.y += dy / l * d; d = 0; }
          const m = nez(); gratter(n.x, n.y, m.x, m.y);
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
    charger(`${ctx.racine}img/a/${im ? im.f : 'ref.png'}`).then(i => { if (!vivant) return; source = i; preparer(); recouvrir(); dessiner(); })
      .catch(() => { info.textContent = 'Le spécimen ne se charge pas (img/a/ref.png).'; });
    recouvrir(); dessiner();
    return () => { vivant = false; arreterVol(); };
  },
};
