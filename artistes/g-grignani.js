// G · Franco Grignani — Today's Italian Publicity and Graphic Design (affiche d'exposition, Londres, 1967).
// Sur l'affiche, un ruban de rayures noires et blanches se plie et se retourne dans la page.
// L'atelier reprend le principe : un ruban rayé suit la souris (ou l'index, à la webcam) et se courbe, se croise, passe sur lui-même.
// Un clic le pose ; on continue avec un autre. Largeur et longueur réglables.
// La feuille a le format de l'affiche (img/g/ref.jpg). L'affiche elle-même n'est pas redessinée ici (œuvre protégée) :
// elle est montrée à côté (page de gauche, et vignette dans l'atelier), et le ruban est celui du visiteur.
// À tester par Eliott : la webcam (le modèle de suivi des mains se charge chez Google au premier clic ; non vérifiable ici).

const FORMAT = 1395 / 2000;            // largeur / hauteur de l'affiche de référence
const NOIR = '#0c0c0c', BLANC = '#fbfaf6';
const BANDES = 13;                     // 7 rayures noires, 6 blanches : noir sur les deux bords
const PAS = .011;                      // écart entre deux points du ruban, en largeurs de feuille
const URL_MAINS = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

/* le ruban de départ : une grande courbe qui se recoupe, pour que la feuille ne soit jamais vide */
function depart() {
  const pts = [];
  for (let i = 0; i <= 150; i++) { const t = i / 150; pts.push({ x: .52 + .30 * Math.sin(t * 5.6 + .5) * (1 - .25 * t), y: .30 + .92 * t + .12 * Math.sin(t * 9) }); }
  return pts;
}
function ruban(c, pts, larg, k) {
  const n = pts.length; if (n < 2) return;
  const nx = [], ny = [];
  for (let i = 0; i < n; i++) { const a = pts[Math.max(0, i - 2)], b = pts[Math.min(n - 1, i + 2)], d = Math.hypot(b.x - a.x, b.y - a.y) || 1; nx[i] = -(b.y - a.y) / d; ny[i] = (b.x - a.x) / d; }
  const P = (i, o) => [(pts[i].x + nx[i] * o * larg) * k, (pts[i].y + ny[i] * o * larg) * k];
  const quad = (i, o0, o1, coul) => {
    const j = Math.max(0, i - 2), m = (u, v) => [u[0] * .35 + v[0] * .65, u[1] * .35 + v[1] * .65];   // on mord un peu sur le tronçon d'avant : pas de fente entre deux tronçons
    const a = m(P(j, o0), P(i - 1, o0)), b = P(i, o0), d = P(i, o1), e = m(P(j, o1), P(i - 1, o1));
    c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.lineTo(d[0], d[1]); c.lineTo(e[0], e[1]); c.closePath(); c.fillStyle = coul; c.fill();
  };
  for (let i = 1; i < n; i++) {         // de la queue vers la tête : ce qui vient après passe par-dessus
    quad(i, -.5, .5, BLANC);
    for (let b = 0; b < BANDES; b += 2) quad(i, b / BANDES - .5, (b + 1) / BANDES - .5, NOIR);
  }
}

export default {
  lettre: 'G',
  css: `
.gr{display:grid;grid-template-columns:auto minmax(190px,270px);gap:clamp(16px,3cqw,44px);justify-content:center;align-items:end;height:100cqh}
.gr-affiche{position:relative;height:min(100cqh,calc((100cqw - 320px)/${FORMAT}));aspect-ratio:${FORMAT};background:${BLANC};cursor:crosshair;touch-action:none;box-shadow:0 0 0 1px rgba(255,255,255,.28),0 26px 50px -30px rgba(0,0,0,.8)}
.gr-affiche canvas{display:block;width:100%;height:100%}
.gr-cote{display:grid;gap:clamp(8px,1.6cqh,14px);align-content:end;padding-bottom:4px;min-height:0}
.gr-cote p{margin:0}
.gr-ref{display:flex;gap:10px;align-items:flex-end}
.gr-ref img{height:clamp(90px,24cqh,200px);width:auto;display:block;box-shadow:0 0 0 1px rgba(255,255,255,.3)}
.gr-ref video{height:clamp(70px,16cqh,120px);width:auto;transform:scaleX(-1);box-shadow:0 0 0 1px rgba(255,255,255,.3)}
.gr-reglage{display:grid;gap:4px;font:600 13px/1.3 Archivo,sans-serif}
.gr-reglage input{accent-color:#fff;width:100%}
.gr-boutons{display:flex;flex-wrap:wrap;gap:8px}
@media (max-width:760px){.gr{grid-template-columns:1fr;height:auto}.gr-affiche{height:auto;width:min(100%,calc(64svh*${FORMAT}));justify-self:center}}
`,
  monter(zone, ctx) {
    const ref = ctx.artiste.images?.[0];
    zone.innerHTML = `
      <div class="gr">
        <div class="gr-affiche"><canvas data-export aria-label="La feuille : un ruban de rayures suit la souris"></canvas></div>
        <div class="gr-cote">
          <div class="gr-ref">${ref ? `<img src="${ctx.racine}img/g/${ref.f}" alt="L’affiche de Franco Grignani, 1967">` : ''}<video muted playsinline hidden></video></div>
          <p class="etiquette" aria-live="polite"></p>
          <p class="note">Sur l’affiche, un ruban rayé se plie dans la page. Fais le tien : il suit ta souris, se courbe et passe sur lui-même. Clique pour le poser, puis recommence.</p>
          <label class="gr-reglage">Largeur du ruban <input data-larg type="range" min="0.08" max="0.5" step="0.005" value="0.27"></label>
          <label class="gr-reglage">Longueur du ruban <input data-long type="range" min="0.6" max="6" step="0.05" value="2.6"></label>
          <div class="gr-boutons">
            <button type="button" class="bouton plein" data-main aria-pressed="false">Diriger avec la main</button>
            <button type="button" class="bouton" data-annuler>Retirer le dernier</button>
            <button type="button" class="bouton" data-vider>Tout effacer</button>
          </div>
        </div>
      </div>`;
    const affiche = zone.querySelector('.gr-affiche'), cv = affiche.querySelector('canvas'), x = cv.getContext('2d');
    const info = zone.querySelector('.etiquette'), cLarg = zone.querySelector('[data-larg]'), cLong = zone.querySelector('[data-long]'), bMain = zone.querySelector('[data-main]'), video = zone.querySelector('video');
    const fond = document.createElement('canvas');                 // les rubans posés
    const HAUT = 1 / FORMAT;
    let L = 0, dpr = 1, raf = 0, vivant = true, cible = null, mains = null, flux = null, pince = false, dernierPince = 0;
    const poses = []; let libre = { pts: depart(), larg: +cLarg.value };

    function mesurer() {
      const r = affiche.getBoundingClientRect(); if (!r.width) return;
      dpr = Math.min(devicePixelRatio || 1, 2); L = r.width;
      [cv, fond].forEach(c => { c.width = Math.round(L * dpr); c.height = Math.round(r.height * dpr); });
      refaire();
    }
    function refaire() {
      const f = fond.getContext('2d'); f.setTransform(dpr, 0, 0, dpr, 0, 0); f.fillStyle = BLANC; f.fillRect(0, 0, L, L * HAUT);
      poses.forEach(p => ruban(f, p.pts, p.larg, L)); peindre();
    }
    function peindre() {
      if (!L) return;
      x.setTransform(1, 0, 0, 1, 0, 0); x.drawImage(fond, 0, 0); x.setTransform(dpr, 0, 0, dpr, 0, 0);
      ruban(x, libre.pts, libre.larg, L);
    }
    function dire(t) { const n = poses.length; info.textContent = t || (n ? `${n} ruban${n > 1 ? 's' : ''} posé${n > 1 ? 's' : ''}` : 'Un ruban libre. Clique pour le poser.'); }
    function couper() { let long = 0; const p = libre.pts, max = +cLong.value; for (let i = p.length - 1; i > 0; i--) { long += Math.hypot(p[i].x - p[i - 1].x, p[i].y - p[i - 1].y); if (long > max) { p.splice(0, i); break; } } }
    /* la tête du ruban rejoint la cible en douceur : c'est ce retard qui fait les courbes */
    function boucle(t) {
      raf = 0; if (!vivant) return;
      if (mains && video.readyState >= 2) lireMain(t);
      let bouge = false;
      if (cible) {
        const p = libre.pts, tete = p[p.length - 1], dx = cible.x - tete.x, dy = cible.y - tete.y, d = Math.hypot(dx, dy);
        if (d > PAS) {
          const pas = Math.min(d * (ctx.reduireMouvement ? 1 : .2), .06), nb = Math.max(1, Math.floor(pas / PAS));
          for (let i = 1; i <= nb; i++) p.push({ x: tete.x + dx / d * PAS * i, y: tete.y + dy / d * PAS * i });
          couper(); bouge = true;
        }
      }
      peindre();
      if (bouge || mains) raf = requestAnimationFrame(boucle);
    }
    const lancer = () => { if (!raf) raf = requestAnimationFrame(boucle); };
    function viser(e) { const r = affiche.getBoundingClientRect(); cible = { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.width }; lancer(); }
    function fixer() {
      if (libre.pts.length < 8) return;
      poses.push(libre); ruban(fond.getContext('2d'), libre.pts, libre.larg, L);
      const t = libre.pts[libre.pts.length - 1]; libre = { pts: [{ ...t }, { x: t.x + .001, y: t.y }], larg: +cLarg.value };
      dire(); ctx.annoncer?.('Ruban posé.'); lancer();
    }
    affiche.addEventListener('pointermove', viser);
    affiche.addEventListener('pointerdown', e => { affiche.setPointerCapture?.(e.pointerId); viser(e); });
    affiche.addEventListener('pointerup', fixer);
    cLarg.addEventListener('input', () => { libre.larg = +cLarg.value; peindre(); });
    cLong.addEventListener('input', () => { couper(); peindre(); });
    zone.querySelector('[data-annuler]').addEventListener('click', () => { poses.pop(); refaire(); dire(); });
    zone.querySelector('[data-vider]').addEventListener('click', () => { poses.length = 0; libre = { pts: depart(), larg: +cLarg.value }; cible = null; refaire(); dire(); });

    /* webcam : l'index dirige le ruban ; pincer pouce et index le pose. Si quoi que ce soit échoue, la souris reste. */
    function lireMain(t) {
      let r; try { r = mains.detectForVideo(video, t); } catch { return; }
      const m = r.landmarks?.[0]; if (!m) return;
      cible = { x: Math.min(1, Math.max(0, (1 - m[8].x - .5) * 1.35 + .5)), y: Math.min(HAUT, Math.max(0, ((m[8].y - .5) * 1.35 + .5) * HAUT)) };
      const serre = Math.hypot(m[8].x - m[4].x, m[8].y - m[4].y) < .05;
      if (serre && !pince && t - dernierPince > 900) { dernierPince = t; fixer(); }
      pince = serre;
    }
    function couperCamera() { flux?.getTracks().forEach(p => p.stop()); flux = null; mains?.close?.(); mains = null; video.hidden = true; bMain.setAttribute('aria-pressed', 'false'); bMain.textContent = 'Diriger avec la main'; }
    bMain.addEventListener('click', async () => {
      if (mains || flux) { couperCamera(); dire(); return; }
      bMain.disabled = true; dire('Chargement du suivi de la main…');
      try {
        flux = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: 'user' } });
        video.srcObject = flux; await video.play(); video.hidden = false;
        const { FilesetResolver, HandLandmarker } = await import(`${ctx.racine}vendor/mediapipe/vision_bundle.mjs`);
        const m = await HandLandmarker.createFromOptions(await FilesetResolver.forVisionTasks(`${ctx.racine}vendor/mediapipe/wasm`), { baseOptions: { modelAssetPath: URL_MAINS }, runningMode: 'VIDEO', numHands: 1 });
        if (!vivant || !flux) { m.close?.(); return; }
        mains = m; bMain.setAttribute('aria-pressed', 'true'); bMain.textContent = 'Arrêter la caméra';
        dire('Montre ta main : l’index dirige le ruban, pince pouce et index pour le poser.'); lancer();
      } catch (e) { couperCamera(); dire('Caméra ou suivi de la main indisponible : la souris reste active.'); }
      bMain.disabled = false;
    });

    const ro = new ResizeObserver(mesurer); ro.observe(affiche);
    mesurer(); dire();
    return () => { vivant = false; cancelAnimationFrame(raf); ro.disconnect(); couperCamera(); };
  },
};
