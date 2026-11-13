// V · Massimo Vignelli — plan du métro de New York (1972).
// Un curseur géographie ↔ diagramme : sept lignes de Manhattan suivent d'abord les vraies rues (île penchée, Broadway en biais,
// stations plus ou moins espacées), puis tout se redresse : angles à 45° et 90°, stations à égale distance, Central Park devient un carré.
// On peut aussi glisser directement sur le plan, de gauche à droite.
//
// Ce n'est PAS une copie du plan de 1972 (œuvre protégée) : c'est un plan simplifié dessiné pour l'atelier (7 lignes, Manhattan
// jusqu'à la 125e Rue), avec les couleurs actuelles des lignes. Il refait la méthode de Vignelli, pas son dessin.
// Le plan d'origine doit être visible dans la page de gauche : img/v/ref.jpg, à fournir par Eliott (puis images: dans labo/donnees.js).
// Géographie approchée : places relevées de mémoire sur la grille des avenues et des rues (avenue, rue), pas sur un fond de carte.

// Un point : [nom ou null (simple coude), avenue, rue, colonne, rang, côté du nom (-1 gauche, 1 droite, 0 pas de nom)]
// Avenues : 0 = 12e Av (Hudson) … 4 = 8e Av, 5 = 7e, 6 = 6e, 7 = 5e, 8 = Park, 8.5 = Lexington, 11 = 1re. Rues : le numéro (négatif sous Houston).
const LIGNES = [
  { nom: '1', coul: '#ee352e', p: [['South Ferry', 6.8, -26, 3, 0, -1], ['Chambers St', 5.6, -13, 3, 2, 0], ['14 St', 5, 14, 3, 6, 0], ['34 St', 5, 34, 3, 8, 0], ['Times Sq', 5, 42, 3, 9, 0],
    [null, 4.55, 50, 3, 10, 0], ['Columbus Circle', 4, 59, 2, 11, -1], ['72 St', 2, 72, 1, 12, -1], ['96 St', 1.45, 96, 1, 14, -1], ['116 St', 1.1, 116, 1, 15, -1], ['125 St', 1.2, 125, 1, 16, -1]] },
  { nom: 'A', coul: '#0039a6', p: [['Fulton St', 7, -18, 4, 1, -1], ['Chambers St', 6.4, -13, 4, 2, 0], ['Canal St', 6.1, -7, 4, 3, 0], ['W 4 St', 6, 3, 4, 4, 0], ['14 St', 4, 14, 2, 6, -1],
    ['34 St-Penn', 4, 34, 2, 8, -1], ['42 St', 4, 42, 2, 9, -1], ['Columbus Circle', 4, 59, 2, 11, 0], ['81 St', 4, 81, 2, 13, 0], ['125 St', 4, 125, 2, 16, 0]] },
  { nom: 'F', coul: '#ff6319', p: [['W 4 St', 6, 3, 4, 4, 1], ['14 St', 6, 14, 4, 6, 0], ['Herald Sq', 6, 34, 4, 8, 0], ['Bryant Park', 6, 42, 4, 9, 0], ['Rockefeller Center', 6, 48.5, 4, 10, 1]] },
  { nom: 'N', coul: '#fccc0a', p: [['Canal St', 7.2, -7, 5, 3, 1], [null, 7.6, 6, 5, 5, 0], ['Union Sq', 8, 14, 6, 6, 0], ['23 St', 7, 23, 5, 7, 1], ['Herald Sq', 6, 34, 4, 8, 0],
    [null, 5.2, 40.4, 3.3, 8.7, 0], ['Times Sq', 5, 42, 3.3, 9, 0], ['57 St', 5, 57, 3.3, 10, 0], [null, 5, 59.8, 3.3, 11, 0], ['5 Av', 7, 59.8, 5, 11, 0], ['Lexington Av', 8.5, 59.6, 6, 11, 0]] },
  { nom: '4', coul: '#00933c', p: [['Bowling Green', 7, -24, 6, 0, 1], ['Brooklyn Bridge', 7.9, -13, 6, 2, 1], ['Union Sq', 8, 14, 6, 6, 0], ['Grand Central', 8.3, 42, 6, 9, 0], ['59 St', 8.5, 59, 6, 11, 1], ['86 St', 8.5, 86, 6, 13, 1], ['125 St', 8.5, 125, 6, 16, 1]] },
  { nom: '7', coul: '#b933ad', p: [['Times Sq', 5, 42, 3, 9, 0], ['Bryant Park', 6.4, 42, 4, 9, 0], ['Grand Central', 8.3, 42, 6, 9, 2], [null, 13.6, 42, 9.7, 9, 0]] },
  { nom: 'L', coul: '#a7a9ac', p: [['8 Av', 4, 14, 2, 6, 0], ['6 Av', 6, 14, 4, 6, 0], ['Union Sq', 8, 14, 6, 6, 2], ['3 Av', 9, 14, 7, 6, 0], ['1 Av', 11, 14, 8, 6, 1]] },
];
const NOMS_UTILES = new Set(['South Ferry', 'Times Sq', 'Columbus Circle', '125 St', 'Union Sq', 'Grand Central', 'Bowling Green', 'W 4 St', '1 Av', '96 St', '86 St', '72 St']);
// l'île : 14 sommets, les mêmes dans les deux états (géographie en avenue / rue, diagramme en colonne / rang)
const ILE_GEO = [[6, -27], [4.6, -14], [3.2, 0], [1, 14], [-.1, 34], [-.2, 72], [.3, 135], [9.2, 135], [11.2, 122], [12.4, 96], [12, 42], [13.4, 2], [10.2, -13], [7.4, -27]];
const ILE_DIA = [[2.3, -1], [2.3, 1.2], [2.3, 3.2], [.2, 5.3], [.2, 8], [.2, 12], [.2, 17], [7, 17], [7, 15.2], [8.9, 13.3], [8.9, 9], [8.9, 5], [8.9, 1.2], [6.7, -1]];
const PARC_GEO = [[4, 59], [7, 59], [7, 110], [4, 110]], PARC_DIA = [[2.5, 11.5], [5.5, 11.5], [5.5, 14.5], [2.5, 14.5]]; // de 1 sur 5 à un carré
const PENTE = 29 * Math.PI / 180, AV = 3.5; // l'île penche de 29° ; une avenue vaut à peu près 3,5 rues
const EAU = '#e4decd', TERRE = '#fbfaf5', PARC = '#bfc8b4', NOIR = '#151515';
const POLICE = '"Helvetica Neue", Helvetica, Arial, Archivo, sans-serif';
const geo = (a, r) => { const X = a * AV, Y = r; return [X * Math.cos(PENTE) + Y * Math.sin(PENTE), X * Math.sin(PENTE) - Y * Math.cos(PENTE)]; }; // nord en haut
const dia = (c, r) => [c, -r];
const etendue = pts => { const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]); return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)]; };

export default {
  lettre: 'V',
  css: `
.vg{display:grid;grid-template-columns:minmax(0,1fr) minmax(180px,240px);gap:clamp(14px,2.4cqw,36px);align-items:end;height:100cqh}
.vg-scene{height:100cqh;min-width:0;background:${EAU};box-shadow:0 26px 50px -30px rgba(0,0,0,.6)}
.vg-scene canvas{display:block;width:100%;height:100%;touch-action:none;cursor:ew-resize}
.vg-cote{display:grid;gap:12px;align-content:end;padding-bottom:4px}
.vg-cote p{margin:0}
.vg-compte{font:900 clamp(40px,7cqw,76px)/.85 "Sofia Cond",Archivo,sans-serif}
.vg-curseur{display:grid;gap:6px;font:600 13px/1.3 Archivo,sans-serif}
.vg-curseur input{width:100%;accent-color:currentColor;min-height:30px}
.vg-curseur span{display:flex;justify-content:space-between}
.vg-boutons{display:flex;flex-wrap:wrap;gap:8px}
@media (max-width:760px){.vg{grid-template-columns:1fr;height:auto}.vg-scene{height:auto;aspect-ratio:3/4}}
`,
  monter(zone, ctx) {
    zone.innerHTML = `
      <div class="vg">
        <div class="vg-scene"><canvas data-export aria-label="Un plan de métro de Manhattan qui passe de la géographie au diagramme"></canvas></div>
        <div class="vg-cote">
          <p class="vg-compte" aria-hidden="true"></p>
          <p class="etiquette" aria-live="polite"></p>
          <label class="vg-curseur"><span><span>Géographie</span><span>Diagramme</span></span>
            <input type="range" min="0" max="1" step="0.005" value="0" aria-label="De la géographie au diagramme"></label>
          <div class="vg-boutons">
            <button type="button" class="bouton plein" data-aller>Redresser les lignes</button>
          </div>
          <p class="note">Plan simplifié dessiné pour l’atelier (7 lignes, couleurs d’aujourd’hui) : il refait la méthode de Vignelli, ce n’est pas une copie du plan de 1972.</p>
        </div>
      </div>`;
    const scene = zone.querySelector('.vg-scene'), cv = scene.querySelector('canvas'), x = cv.getContext('2d');
    const compte = zone.querySelector('.vg-compte'), info = zone.querySelector('.etiquette'), curseur = zone.querySelector('input'), bAller = zone.querySelector('[data-aller]');
    let W = 0, H = 0, dpr = 1, vivant = true, raf = 0, t = 0, but = null, cadreG = null, cadreD = null;

    // les deux cadrages : chaque état est ajusté à la feuille, puis on passe de l'un à l'autre point par point
    function cadrer() {
      const tousG = [...ILE_GEO.map(p => geo(...p)), geo(13.6, 42)], tousD = [...ILE_DIA.map(p => dia(...p)), dia(9.7, 9)];
      const faire = pts => { const [x0, y0, x1, y1] = etendue(pts), m = Math.min(W, H) * .06, k = Math.min((W - 2 * m) / (x1 - x0), (H - 2 * m) / (y1 - y0)); return { k, ox: (W - (x1 - x0) * k) / 2 - x0 * k, oy: (H - (y1 - y0) * k) / 2 - y0 * k }; };
      cadreG = faire(tousG); cadreD = faire(tousD);
    }
    const e = () => t * t * (3 - 2 * t); // départ et arrivée en douceur
    function place(a, r, c, g) { // où tombe un point à l'instant t
      const G = geo(a, r), D = dia(c, g), k = e();
      const gx = G[0] * cadreG.k + cadreG.ox, gy = G[1] * cadreG.k + cadreG.oy, dx = D[0] * cadreD.k + cadreD.ox, dy = D[1] * cadreD.k + cadreD.oy;
      return [gx + (dx - gx) * k, gy + (dy - gy) * k];
    }
    function polygone(G, D) { x.beginPath(); G.forEach((p, i) => { const q = place(p[0], p[1], D[i][0], D[i][1]); i ? x.lineTo(...q) : x.moveTo(...q); }); x.closePath(); }
    function mesurer() {
      const r = scene.getBoundingClientRect(); if (!r.width || !r.height) return;
      dpr = Math.min(devicePixelRatio || 1, 2); W = cv.width = Math.round(r.width * dpr); H = cv.height = Math.round(r.height * dpr); cadrer(); dessiner();
    }
    function dire() {
      compte.textContent = t < .02 ? 'Rues' : t > .98 ? '45° / 90°' : Math.round(t * 100) + ' %';
      info.textContent = t < .02 ? 'Géographie : les lignes suivent les rues, l’île penche, Central Park est tout en longueur.'
        : t > .98 ? 'Diagramme : que des angles à 45° et 90°, des stations à égale distance, et Central Park est un carré.' : 'Les lignes se redressent…';
      bAller.textContent = t > .5 ? 'Revenir à la géographie' : 'Redresser les lignes';
    }
    function dessiner() {
      if (!W || !cadreG) return;
      const k = e(), u = cadreD.k, trait = Math.max(3, u * .2);
      x.fillStyle = EAU; x.fillRect(0, 0, W, H);
      polygone(ILE_GEO, ILE_DIA); x.fillStyle = TERRE; x.fill();
      x.save(); x.clip();
      // sous les lignes : les vraies rues, qui s'effacent, puis la grille du diagramme, qui arrive
      if (k < .98) { x.globalAlpha = (1 - k) * .5; x.strokeStyle = '#c9c4b6'; x.lineWidth = Math.max(1, dpr * .7); x.beginPath();
        for (let a = 0; a <= 13; a++) { const p = place(a, -30, a * .7, -1), q = place(a, 140, a * .7, 17); x.moveTo(...p); x.lineTo(...q); }
        for (let r = -20; r <= 135; r += 5) { const p = place(-1, r, 0, (r + 20) / 9), q = place(14, r, 9, (r + 20) / 9); x.moveTo(...p); x.lineTo(...q); }
        x.stroke(); }
      if (k > .02) { x.globalAlpha = k * .55; x.strokeStyle = '#d2cdc0'; x.lineWidth = Math.max(1, dpr * .7); x.beginPath();
        for (let c = 0; c <= 9; c++) { x.moveTo(c * cadreD.k + cadreD.ox, 0); x.lineTo(c * cadreD.k + cadreD.ox, H); }
        for (let r = -1; r <= 17; r++) { x.moveTo(0, -r * cadreD.k + cadreD.oy); x.lineTo(W, -r * cadreD.k + cadreD.oy); }
        x.stroke(); }
      x.globalAlpha = 1; x.restore();
      polygone(PARC_GEO, PARC_DIA); x.fillStyle = PARC; x.fill();
      { const a = place(5.5, 84.5, 4, 13); x.fillStyle = 'rgba(21,21,21,.55)'; x.font = `600 ${Math.max(9, u * .26)}px ${POLICE}`; x.textAlign = 'center'; x.textBaseline = 'middle';
        x.save(); x.translate(...a); x.rotate(-(Math.PI / 2 - PENTE) * (1 - k)); x.fillText('Central Park', 0, 0); x.restore(); }
      // les lignes : coins arrondis larges en géographie, serrés en diagramme
      const coupe = .5 - .34 * k;
      x.lineCap = 'round'; x.lineJoin = 'round'; x.lineWidth = trait;
      for (const l of LIGNES) {
        const P = l.p.map(p => place(p[1], p[2], p[3], p[4]));
        x.beginPath(); x.moveTo(...P[0]);
        for (let i = 1; i < P.length - 1; i++) {
          const a = P[i - 1], b = P[i], c = P[i + 1];
          x.lineTo(b[0] + (a[0] - b[0]) * coupe, b[1] + (a[1] - b[1]) * coupe); x.quadraticCurveTo(b[0], b[1], b[0] + (c[0] - b[0]) * coupe, b[1] + (c[1] - b[1]) * coupe);
        }
        x.lineTo(...P[P.length - 1]); x.strokeStyle = l.coul; x.stroke();
      }
      // les stations : un point noir par arrêt ; une pastille blanche là où des lignes se croisent
      const groupes = []; // deux arrêts font une correspondance s'ils sont au même endroit du diagramme
      for (const l of LIGNES) for (const p of l.p) {
        if (!p[0]) continue;
        let g = groupes.find(o => Math.abs(o.c - p[3]) <= .35 && Math.abs(o.r - p[4]) <= .1);
        if (!g) { g = { c: p[3], r: p[4], nom: p[0], pts: [], cote: 0 }; groupes.push(g); }
        g.pts.push(place(p[1], p[2], p[3], p[4])); if (p[5]) { g.cote = p[5]; g.nom = p[0]; }
      }
      x.font = `500 ${Math.max(8.5, u * .25)}px ${POLICE}`; x.textBaseline = 'middle';
      for (const g of groupes) {
        const xs = g.pts.map(p => p[0]), ys = g.pts.map(p => p[1]), ax = Math.min(...xs), bx = Math.max(...xs), cy = ys.reduce((s, v) => s + v, 0) / ys.length;
        if (g.pts.length > 1) {
          x.lineCap = 'round'; x.strokeStyle = NOIR; x.lineWidth = trait * 1.5; x.beginPath(); x.moveTo(ax, cy); x.lineTo(bx + .01, cy); x.stroke();
          x.strokeStyle = '#fff'; x.lineWidth = trait * .95; x.beginPath(); x.moveTo(ax, cy); x.lineTo(bx + .01, cy); x.stroke();
        } else { x.fillStyle = NOIR; x.beginPath(); x.arc(ax, cy, trait * .34, 0, 7); x.fill(); }
        if (g.cote && NOMS_UTILES.has(g.nom)) { // côté ±1 : à droite ou à gauche ; ±2 : pareil, mais au-dessus de la ligne
          const sens = Math.sign(g.cote), haut = Math.abs(g.cote) === 2;
          x.fillStyle = NOIR; x.textAlign = sens > 0 ? 'left' : 'right'; x.fillText(g.nom, (sens > 0 ? bx : ax) + sens * trait * (haut ? .9 : 1.25), cy - (haut ? trait * 1.45 : 0));
        }
      }
      // le nord : droit en géographie, penché une fois l'île redressée
      x.save(); x.translate(W - Math.min(W, H) * .09, Math.min(W, H) * .1); x.rotate(-PENTE * k);
      const n = Math.min(W, H) * .034; x.strokeStyle = NOIR; x.fillStyle = NOIR; x.lineWidth = Math.max(1.5, n * .12); x.lineCap = 'butt';
      x.beginPath(); x.moveTo(0, n); x.lineTo(0, -n); x.stroke(); x.beginPath(); x.moveTo(0, -n * 1.5); x.lineTo(n * .42, -n * .6); x.lineTo(-n * .42, -n * .6); x.closePath(); x.fill();
      x.font = `700 ${n * .9}px ${POLICE}`; x.textAlign = 'center'; x.textBaseline = 'top'; x.fillText('N', 0, n * 1.2); x.restore();
    }
    function regler(v, depuisCurseur) { t = Math.max(0, Math.min(1, v)); if (!depuisCurseur) curseur.value = t; dire(); dessiner(); }
    function boucle() {
      raf = 0; if (!vivant || but === null) return;
      const d = but - t;
      if (Math.abs(d) < .012 || ctx.reduireMouvement) { regler(but); but = null; ctx.annoncer?.(t > .5 ? 'Diagramme' : 'Géographie'); return; }
      regler(t + Math.sign(d) * .014); raf = requestAnimationFrame(boucle);
    }
    const aller = v => { but = v; if (!raf) raf = requestAnimationFrame(boucle); };
    curseur.addEventListener('input', () => { but = null; regler(+curseur.value, true); });
    bAller.addEventListener('click', () => aller(t > .5 ? 0 : 1));
    // glisser sur le plan, de gauche à droite
    let tire = null;
    cv.addEventListener('pointerdown', ev => { but = null; tire = { x: ev.clientX, t }; cv.setPointerCapture(ev.pointerId); });
    cv.addEventListener('pointermove', ev => { if (tire) regler(tire.t + (ev.clientX - tire.x) / (cv.getBoundingClientRect().width * .7)); });
    const fin = () => { tire = null; }; cv.addEventListener('pointerup', fin); cv.addEventListener('pointercancel', fin);

    const ro = new ResizeObserver(mesurer); ro.observe(scene);
    mesurer(); dire();
    return () => { vivant = false; cancelAnimationFrame(raf); ro.disconnect(); };
  },
};
