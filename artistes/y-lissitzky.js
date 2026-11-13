// Y · El Lissitzky — Battre les Blancs avec le coin rouge (Клином красным бей белых), lithographie, 1919-1920.
// Lance-pierre : on attrape le coin rouge, on le tire en arrière et on lâche. Tiré un peu, il revient se planter dans le cercle,
// exactement comme sur l'affiche ; tiré à fond, il fend le cercle blanc en deux.
// À la webcam : on pince le pouce et l'index, on recule la main, on ouvre les doigts. La souris et le doigt marchent toujours.
//
// L'affiche est dans le domaine public (Lissitzky est mort en 1941) : elle est redessinée en code, calée sur img/y/ref.jpg.
// Composition relevée sur l'affiche (img/y/ref.jpg, 2576 × 2061 px ; cadre intérieur de (84, 76) à (2488, 1993)).
// Les places sont notées en px de l'image et ramenées en fractions de la largeur du cadre par P().

const FORMAT = 2404 / 1917; // largeur / hauteur du cadre
const PAPIER = '#ebe5d6', NOIR = '#121110', ROUGE = '#e2482b', BLANC = '#f3efe4', GRIS = '#8a8781';
const P = (a, b) => [(a - 84) / 2404, (b - 76) / 2404];
const L = v => v / 2404;
const triangle = (A, B, C) => { // le coin : pointe C, base AB
  const M = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2], dx = C[0] - M[0], dy = C[1] - M[1];
  return { pointe: { x: P(...C)[0], y: P(...C)[1] }, axe: Math.atan2(dy, dx), longueur: L(Math.hypot(dx, dy)), demiBase: L(Math.hypot(A[0] - B[0], A[1] - B[1]) / 2) };
};
const GEO = {
  noir: [P(1751, 76), P(2488, 76), P(2488, 1993), P(777, 1993)], // le champ noir, à droite de la diagonale
  cercle: { x: P(1708, 1225)[0], y: P(1708, 1225)[1], r: L(572) },
  ...triangle([700, 344], [380, 954], [1704, 1212]), // le grand coin rouge, sa pointe enfoncée dans le cercle
};
// petits éléments de l'affiche : poly (px de l'image) ou barre [x, y, longueur, épaisseur, angle]
const DECOR = [
  { coul: GRIS, poly: [[1144, 584], [1484, 370], [1592, 604], [1300, 810]] },        // le carré gris penché
  { coul: GRIS, poly: [[1030, 1134], [1124, 1134], [1124, 1410], [1030, 1410]] },     // la barre grise verticale
  { coul: ROUGE, poly: [[1000, 1296], [1292, 1276], [1052, 1326]] },                   // les deux échardes à gauche du cercle
  { coul: NOIR, poly: [[968, 1280], [1250, 1290], [1100, 1262]] },
  { coul: ROUGE, poly: [[1378, 708], [1700, 748], [1384, 738]] },                      // en haut du cercle
  { coul: NOIR, barre: [1470, 758, 240, 10, .05] }, { coul: ROUGE, barre: [1480, 746, 230, 10, .05] },
  { coul: ROUGE, poly: [[1830, 692], [2094, 650], [1872, 752]] },
  { coul: BLANC, rond: [2194, 614, 20] },
  { coul: ROUGE, barre: [1660, 372, 250, 12, -.41] }, { coul: BLANC, barre: [1666, 352, 250, 18, -.41] }, // dans le noir, en haut
  { coul: BLANC, barre: [1748, 206, 150, 10, 0] }, { coul: ROUGE, barre: [1840, 168, 26, 70, 0] }, { coul: GRIS, barre: [1820, 190, 22, 40, 0] },
  { coul: BLANC, barre: [1920, 140, 60, 12, -1.15] }, { coul: BLANC, barre: [1975, 180, 80, 14, -1.15] }, { coul: BLANC, barre: [2085, 128, 40, 12, -.95] },
  { coul: BLANC, barre: [2036, 276, 124, 14, .06] }, { coul: BLANC, barre: [2132, 310, 40, 10, .06] }, { coul: BLANC, barre: [2204, 328, 80, 10, .06] },
  { coul: ROUGE, barre: [410, 1488, 360, 20, 0] }, { coul: NOIR, barre: [410, 1504, 360, 3, 0] },          // en bas à gauche
  { coul: ROUGE, poly: [[684, 1536], [750, 1536], [750, 1680], [684, 1680]] },
  { coul: ROUGE, barre: [778, 1574, 46, 13, 0] }, { coul: ROUGE, barre: [778, 1616, 46, 13, 0] }, { coul: ROUGE, barre: [778, 1656, 46, 13, 0] },
  { coul: BLANC, barre: [950, 1830, 100, 16, 1.12] }, { coul: BLANC, barre: [1022, 1872, 76, 16, 1.12] }, // dans le noir, en bas
];
const TEXTES = [ // les quatre mots de l'affiche ; c = corps en fraction de la largeur
  { t: 'КЛИНОМ', p: P(352, 362), c: L(118), a: .6, coul: NOIR },
  { t: 'КРАСНЫМ', p: P(452, 1112), c: L(72), a: .46, coul: PAPIER, contour: NOIR },
  { t: 'БЕЙ', p: P(1862, 1608), c: L(128), a: -.33, coul: ROUGE },
  { t: 'БЕЛЫХ', p: P(2182, 1818), c: L(86), a: .04, coul: '#cfcbc2', contour: '#2a2826', boite: GRIS },
];
const TIR_MAX = .2, SEUIL = .62; // recul maximal (fraction de la largeur) ; au-delà de SEUIL × TIR_MAX, le cercle se fend
const URL_MAINS = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
const borne = (v, a, b) => Math.max(a, Math.min(b, v));

export default {
  lettre: 'Y',
  css: `
.ly{display:grid;grid-template-columns:minmax(0,1fr) minmax(170px,230px);gap:clamp(14px,2.4cqw,36px);align-items:end;height:100cqh}
.ly-scene{min-width:0;height:100cqh;display:grid;place-items:center}
.ly-feuille{width:min(100%,calc(100cqh*${FORMAT}));aspect-ratio:${FORMAT};background:${PAPIER};box-shadow:0 26px 50px -30px rgba(0,0,0,.6)}
.ly-feuille canvas{display:block;width:100%;height:100%;touch-action:none;cursor:grab}
.ly-feuille canvas.tenu{cursor:grabbing}
.ly-cote{display:grid;gap:12px;align-content:end;padding-bottom:4px}
.ly-cote p{margin:0}
.ly-compte{font:900 clamp(40px,7cqw,76px)/.85 "Sofia Cond",Archivo,sans-serif}
.ly-cote video{width:100%;aspect-ratio:4/3;object-fit:cover;transform:scaleX(-1);background:#000}
.ly-boutons{display:flex;flex-wrap:wrap;gap:8px}
@media (max-width:760px){.ly{grid-template-columns:1fr;height:auto}.ly-scene{height:auto}.ly-feuille{width:100%}}
`,
  monter(zone, ctx) {
    zone.innerHTML = `
      <div class="ly">
        <div class="ly-scene"><div class="ly-feuille"><canvas data-export aria-label="L’affiche de Lissitzky : un coin rouge planté dans un cercle blanc. On tire le coin en arrière et on le lâche."></canvas></div></div>
        <div class="ly-cote">
          <p class="ly-compte" aria-hidden="true">0</p>
          <p class="etiquette" aria-live="polite"></p>
          <p class="note">Attrape le coin rouge, tire-le en arrière, lâche. Un petit recul : il se replante comme sur l’affiche. À fond : le cercle se fend.</p>
          <video playsinline muted hidden></video>
          <div class="ly-boutons">
            <button type="button" class="bouton plein" data-tirer>Tirer à fond</button>
            <button type="button" class="bouton" data-main aria-pressed="false">Tirer avec la main</button>
          </div>
        </div>
      </div>`;
    const feuille = zone.querySelector('.ly-feuille'), cv = feuille.querySelector('canvas'), x = cv.getContext('2d');
    const compte = zone.querySelector('.ly-compte'), info = zone.querySelector('.etiquette'), video = zone.querySelector('video'), bMain = zone.querySelector('[data-main]');
    const ux = Math.cos(GEO.axe), uy = Math.sin(GEO.axe);
    let W = 0, H = 0, dpr = 1, vivant = true, raf = 0, avant = 0;
    let s = 0, v = 0;                 // place du coin le long de son axe (0 = l'affiche), et sa vitesse
    let phase = 'repos';              // repos, tendu, vol, fendu, retour
    let fente = 0, tFente = 0, eclats = [], secousse = 0, fendus = 0, prise = null, message = '';

    function mesurer() {
      const r = feuille.getBoundingClientRect(); if (!r.width) return;
      dpr = Math.min(devicePixelRatio || 1, 2); W = cv.width = Math.round(r.width * dpr); H = cv.height = Math.round(r.height * dpr); dessiner();
    }
    function dire(t) {
      if (t !== undefined) message = t;
      compte.textContent = fendus;
      info.textContent = message || (phase === 'tendu' ? (-s >= TIR_MAX * SEUIL ? 'Tendu à fond : lâche.' : 'Tire encore, ou lâche.') : fendus ? `Cercle${fendus > 1 ? 's' : ''} fendu${fendus > 1 ? 's' : ''} : ${fendus}.` : 'Le coin rouge est planté dans le cercle, comme sur l’affiche.');
    }
    const coin = d => { // les trois sommets du coin, sa pointe à d le long de l'axe
      const px = (GEO.pointe.x + ux * d) * W, py = (GEO.pointe.y + uy * d) * W, bx = px - ux * GEO.longueur * W, by = py - uy * GEO.longueur * W, k = GEO.demiBase * W;
      return [[px, py], [bx - uy * k, by + ux * k], [bx + uy * k, by - ux * k]];
    };
    function demiCercle(cote, k) { // une moitié du cercle, de part et d'autre de l'axe du coin ; k = écartement de 0 à 1
      const c = GEO.cercle, e = 1 - (1 - k) ** 3;
      x.save();
      x.translate(c.x * W, c.y * W); x.rotate(GEO.axe);
      x.translate(e * .05 * W, cote * e * .085 * W); x.rotate(cote * e * .22);
      x.beginPath(); x.arc(0, 0, c.r * W, cote > 0 ? 0 : Math.PI, cote > 0 ? Math.PI : Math.PI * 2); x.closePath();
      x.fillStyle = BLANC; x.fill(); x.restore();
    }
    function dessiner() {
      if (!W) return;
      const sx = secousse ? (Math.random() - .5) * secousse * W : 0, sy = secousse ? (Math.random() - .5) * secousse * W : 0;
      x.setTransform(1, 0, 0, 1, 0, 0); x.fillStyle = PAPIER; x.fillRect(0, 0, W, H);
      x.translate(sx, sy);
      // le champ noir
      x.beginPath(); GEO.noir.forEach(([a, b], i) => i ? x.lineTo(a * W, b * W) : x.moveTo(a * W, b * W)); x.closePath(); x.fillStyle = NOIR; x.fill();
      // petits éléments de l'affiche (les gris passent sous le cercle, le reste dessus)
      const decor = e => {
        x.fillStyle = e.coul; x.beginPath();
        if (e.poly) e.poly.forEach((q, i) => { const [u, v] = P(...q); x[i ? 'lineTo' : 'moveTo'](u * W, v * W); });
        else if (e.rond) { const [u, v] = P(e.rond[0], e.rond[1]); x.arc(u * W, v * W, L(e.rond[2]) * W, 0, 7); }
        else { const [bx0, by0, l, ep, ang] = e.barre, [u, v] = P(bx0, by0); x.save(); x.translate(u * W, v * W); x.rotate(ang); x.rect(0, -L(ep) * W / 2, L(l) * W, L(ep) * W); x.restore(); }
        x.fill();
      };
      DECOR.filter(e => e.coul === GRIS && e.poly).forEach(decor);
      // le cercle blanc (entier, ou en deux moitiés)
      if (fente > 0) { demiCercle(1, fente); demiCercle(-1, fente); }
      else { const c = GEO.cercle; x.beginPath(); x.arc(c.x * W, c.y * W, c.r * W, 0, Math.PI * 2); x.fillStyle = BLANC; x.fill(); }
      DECOR.filter(e => !(e.coul === GRIS && e.poly)).forEach(decor);
      // éclats
      for (const e of eclats) { x.save(); x.translate(e.x * W, e.y * W); x.rotate(e.a); x.globalAlpha = borne(e.vie, 0, 1); x.beginPath(); x.moveTo(e.t * W, 0); x.lineTo(-e.t * W * .6, e.t * W * .5); x.lineTo(-e.t * W * .5, -e.t * W * .6); x.closePath(); x.fillStyle = e.c; x.fill(); x.restore(); }
      // l'élastique du lance-pierre, entre la base du coin au repos et la base tirée
      const repos = coin(0), ici = coin(s);
      if (s < -.004) {
        x.strokeStyle = NOIR; x.lineWidth = Math.max(1.5, W * .0035);
        x.beginPath(); x.moveTo(...repos[1]); x.lineTo(...ici[1]); x.moveTo(...repos[2]); x.lineTo(...ici[2]); x.stroke();
        x.fillStyle = NOIR; [repos[1], repos[2]].forEach(p => { x.beginPath(); x.arc(p[0], p[1], W * .008, 0, 7); x.fill(); });
      }
      // le coin rouge
      x.beginPath(); ici.forEach((p, i) => i ? x.lineTo(...p) : x.moveTo(...p)); x.closePath(); x.fillStyle = ROUGE; x.fill();
      // les mots
      x.textAlign = 'center'; x.textBaseline = 'middle';
      for (const m of TEXTES) {
        x.save(); x.translate(m.p[0] * W, m.p[1] * W); x.rotate(m.a);
        x.font = `700 ${m.c * W}px "Helvetica Neue", Helvetica, Arial, sans-serif`;
        if (m.boite) { const l = x.measureText(m.t).width; x.fillStyle = m.boite; x.fillRect(-l / 2 - m.c * W * .12, -m.c * W * .5, l + m.c * W * .24, m.c * W); }
        x.fillStyle = m.coul; x.fillText(m.t, 0, 0);
        if (m.contour) { x.lineWidth = Math.max(1, m.c * W * .05); x.strokeStyle = m.contour; x.strokeText(m.t, 0, 0); }
        x.restore();
      }
      x.lineWidth = Math.max(1, W * .0016); x.strokeStyle = NOIR; x.strokeRect(W * .004, W * .004, W - W * .008, H - W * .008); // le filet du cadre
      // la main, à la webcam
      if (main.modele && main.pos) { x.beginPath(); x.arc(main.pos.x * W, main.pos.y * H, W * (main.pince ? .012 : .02), 0, 7); x.lineWidth = Math.max(2, W * .004); x.strokeStyle = main.pince ? ROUGE : GRIS; x.stroke(); }
      x.setTransform(1, 0, 0, 1, 0, 0);
    }
    function lacher() {
      if (phase !== 'tendu') return;
      const f = -s / TIR_MAX; phase = 'vol'; v = 0; cv.classList.remove('tenu'); prise = null;
      vol.fend = f >= SEUIL; vol.f = f; dire(''); lancer();
    }
    const vol = { fend: false, f: 0 };
    function fendre(t) {
      phase = 'fendu'; tFente = t; fendus++; secousse = .012;
      const c = GEO.pointe;
      eclats = Array.from({ length: 16 }, (_, i) => { const a = GEO.axe + (Math.random() - .5) * 2.2, vit = .25 + Math.random() * .7; return { x: c.x, y: c.y, vx: Math.cos(a) * vit, vy: Math.sin(a) * vit, a: Math.random() * 6, va: (Math.random() - .5) * 9, t: .008 + Math.random() * .016, vie: 1.1, c: i % 5 === 0 ? ROUGE : i % 3 === 0 ? GRIS : BLANC }; });
      dire(''); ctx.annoncer?.('Le cercle blanc est fendu.');
    }
    function boucle(t) {
      raf = 0; if (!vivant) return;
      const dt = Math.min(.033, (t - avant) / 1000 || .016); avant = t; let encore = false;
      if (main.modele) { lireMain(); encore = true; }
      if (phase === 'vol') {
        // un ressort ramène le coin vers sa place sur l'affiche ; lancé fort, il traverse
        const a = -230 * s - (vol.fend ? 3 : 9.5) * v; v += a * dt; const s0 = s; s += v * dt;
        if (vol.fend && s0 < 0 && s >= 0) { fendre(t); }
        else if (!vol.fend && Math.abs(s) < .0006 && Math.abs(v) < .01) { s = 0; v = 0; phase = 'repos'; dire(vol.f < .15 ? '' : 'Planté dans le cercle : c’est l’affiche. Tire plus fort pour le fendre.'); }
        if (!vol.fend && s0 < 0 && s >= 0) secousse = .004 * vol.f;
        encore = true;
      } else if (phase === 'fendu') {
        v *= 1 - 10 * dt; s += v * dt; fente = Math.min(1, (t - tFente) / 520);
        if (t - tFente > (ctx.reduireMouvement ? 900 : 1900)) { phase = 'retour'; tFente = t; vol.s = s; }
        encore = true;
      } else if (phase === 'retour') {
        const k = Math.min(1, (t - tFente) / 650), e = k * k * (3 - 2 * k); fente = 1 - e; s = vol.s * (1 - e);
        if (k >= 1) { fente = 0; s = 0; v = 0; phase = 'repos'; eclats = []; dire(); }
        encore = true;
      }
      if (eclats.length) { eclats.forEach(e => { e.x += e.vx * dt; e.y += e.vy * dt; e.a += e.va * dt; e.vx *= 1 - 1.6 * dt; e.vy *= 1 - 1.6 * dt; e.vie -= dt * .7; }); eclats = eclats.filter(e => e.vie > 0); encore = encore || eclats.length > 0; }
      if (secousse) { secousse *= .86; if (secousse < .0004) secousse = 0; encore = true; }
      dessiner();
      if (encore) raf = requestAnimationFrame(boucle);
    }
    const lancer = () => { if (!raf && vivant) { avant = performance.now(); raf = requestAnimationFrame(boucle); } };

    /* souris, doigt */
    const point = e => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.width }; }; // en fractions de la largeur
    function tendre(p) { // le recul = le déplacement du pointeur projeté sur l'axe du coin
      const d = (p.x - prise.x) * ux + (p.y - prise.y) * uy; s = borne(d, -TIR_MAX, 0); dire(''); lancer();
    }
    function saisir(p) { if (phase !== 'repos' && phase !== 'tendu') return false; phase = 'tendu'; prise = { x: p.x - ux * s, y: p.y - uy * s }; cv.classList.add('tenu'); return true; }
    cv.addEventListener('pointerdown', e => { if (saisir(point(e))) { e.preventDefault(); cv.setPointerCapture(e.pointerId); } });
    cv.addEventListener('pointermove', e => { if (phase === 'tendu' && prise && !main.pince) tendre(point(e)); });
    cv.addEventListener('pointerup', () => { if (!main.pince) lacher(); }); cv.addEventListener('pointercancel', () => { if (!main.pince) lacher(); });
    zone.querySelector('[data-tirer]').addEventListener('click', () => { // pour la présentation, ou au clavier : recule tout seul puis lâche
      if (phase !== 'repos') return; phase = 'tendu'; const t0 = performance.now();
      const reculer = t => { if (!vivant || phase !== 'tendu') return; const k = Math.min(1, (t - t0) / (ctx.reduireMouvement ? 1 : 520)); s = -TIR_MAX * k * k * (3 - 2 * k); dessiner(); if (k < 1) requestAnimationFrame(reculer); else lacher(); };
      requestAnimationFrame(reculer);
    });

    /* la main, à la webcam : pincer le pouce et l'index = attraper le coin ; reculer la main ; ouvrir les doigts = lâcher */
    const main = { modele: null, flux: null, pos: null, pince: false, compte: 0, ts: 0, tv: -1, vuA: 0 };
    const d2 = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
    function lireMain() {
      if (video.currentTime === main.tv) return; main.tv = video.currentTime; main.ts = Math.max(main.ts + 1, performance.now());
      let r; try { r = main.modele.detectForVideo(video, main.ts); } catch { return; }
      const m = r.landmarks?.[0], maintenant = performance.now();
      if (!m) { if (main.pos && maintenant - main.vuA > 600) { main.pos = null; if (main.pince) { main.pince = false; lacher(); } dire('Main perdue : montre-la à la caméra.'); } return; }
      if (!main.pos) dire('');
      main.vuA = maintenant;
      const px = borne((.5 - (m[4].x + m[8].x) / 2) * 1.4 + .5, 0, 1), py = borne(((m[4].y + m[8].y) / 2 - .5) * 1.4 + .5, 0, 1);
      main.pos = main.pos ? { x: main.pos.x + (px - main.pos.x) * .5, y: main.pos.y + (py - main.pos.y) * .5 } : { x: px, y: py };
      const paume = d2(m[0], m[9]) || .1, ecart = d2(m[4], m[8]) / paume;
      main.compte = ecart < .3 ? main.compte + 1 : 0;
      const p = { x: main.pos.x, y: main.pos.y / FORMAT };
      if (!main.pince && main.compte >= 2) { if (saisir(p)) main.pince = true; }
      else if (main.pince && ecart > .5) { main.pince = false; lacher(); }
      else if (main.pince && phase === 'tendu') { const d = ((p.x - prise.x) * ux + (p.y - prise.y) * uy) * 1.5; s = borne(d, -TIR_MAX, 0); dire(''); }
    }
    function couperCamera() {
      main.flux?.getTracks().forEach(p => p.stop()); main.flux = null; main.modele?.close?.(); main.modele = null; main.pos = null;
      if (main.pince) { main.pince = false; lacher(); }
      video.hidden = true; video.srcObject = null; bMain.textContent = 'Tirer avec la main'; bMain.setAttribute('aria-pressed', 'false');
    }
    bMain.addEventListener('click', async () => {
      if (main.modele || main.flux) { couperCamera(); dire(''); dessiner(); return; }
      bMain.disabled = true; dire('Chargement du suivi de la main…');
      try {
        main.flux = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: 'user' } });
        video.srcObject = main.flux; await video.play(); video.hidden = false;
        const { FilesetResolver, HandLandmarker } = await import(`${ctx.racine}vendor/mediapipe/vision_bundle.mjs`);
        const fs = await FilesetResolver.forVisionTasks(`${ctx.racine}vendor/mediapipe/wasm`);
        const options = delegate => ({ baseOptions: { modelAssetPath: URL_MAINS, delegate }, runningMode: 'VIDEO', numHands: 1, minHandDetectionConfidence: .4, minHandPresenceConfidence: .4, minTrackingConfidence: .4 });
        let m; try { m = await HandLandmarker.createFromOptions(fs, options('GPU')); } catch { m = await HandLandmarker.createFromOptions(fs, options('CPU')); }
        if (!vivant || !main.flux) { m.close?.(); return; }
        main.modele = m; bMain.textContent = 'Arrêter la caméra'; bMain.setAttribute('aria-pressed', 'true');
        dire('Pince le pouce et l’index, recule la main, puis ouvre les doigts.'); lancer();
      } catch (e) { console.warn(e); couperCamera(); dire('Caméra ou suivi de la main indisponible : tire le coin à la souris.'); }
      bMain.disabled = false;
    });

    const ro = new ResizeObserver(mesurer); ro.observe(feuille);
    mesurer(); dire();
    return () => { vivant = false; cancelAnimationFrame(raf); ro.disconnect(); couperCamera(); };
  },
};
