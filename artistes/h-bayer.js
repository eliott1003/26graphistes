// H · Herbert Bayer — l'affiche aux mains avec un œil (photomontage ; référence exacte à retrouver par Eliott).
// Webcam : tes mains sont détourées comme aux ciseaux, passées en noir et blanc et collées sur le papier ; un œil apparaît
// dans chaque paume. Il se ferme quand tu fermes le poing. « Figer » garde l'image, « Enregistrer l'image » l'exporte.
//
// Jamais de cadre vide : caméra éteinte, refusée, ou aucune main en vue, l'atelier montre l'œuvre d'origine (première image de
// l'artiste dans labo/donnees.js, img/h/ref.jpg, à fournir par Eliott). L'œuvre est protégée (Herbert Bayer est mort en 1985) :
// elle n'est PAS redessinée en code.
// PROVISOIRE tant qu'elle manque : deux mains schématiques dessinées pour l'atelier, un œil dans la paume, qui suit la souris.
// Le suivi des mains (MediaPipe, modèle chargé chez Google) n'est pas testable dans l'environnement de Claude : À TESTER PAR ELIOTT.

const URL_MAINS = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
const L = 960, HT = 720;                        // l'image finale
const PAPIER = '#e9dcc3', BORD = '#f8f4ea';
const DOIGTS = [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16], [17, 18, 19, 20]], PAUME = [0, 1, 5, 9, 13, 17];
// une main ouverte, schématique (21 points, comme ceux du suivi), dans un carré de 0 à 1
const MAIN = [[.5, .95], [.36, .86], [.26, .74], [.19, .63], [.13, .54], [.38, .56], [.34, .4], [.32, .3], [.3, .21], [.5, .53], [.5, .35], [.5, .24], [.5, .14], [.61, .56], [.65, .41], [.67, .31], [.69, .22], [.7, .63], [.77, .52], [.81, .44], [.85, .37]];
const charger = src => new Promise((ok, non) => { const im = new Image(); im.onload = () => ok(im); im.onerror = non; im.src = src; });
const d2 = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

function silhouette(g, p, gras) { // la main en un seul bloc : la paume, puis un trait épais et rond par doigt
  const paume = d2(p[0], p[9]), e = paume * .27 * gras;
  g.lineCap = g.lineJoin = 'round'; g.fillStyle = g.strokeStyle = '#fff';
  g.beginPath(); PAUME.forEach((i, k) => k ? g.lineTo(...p[i]) : g.moveTo(...p[i])); g.closePath(); g.lineWidth = e * .9; g.fill(); g.stroke();
  DOIGTS.forEach((d, k) => { g.lineWidth = e * (k === 0 ? 1.08 : k === 4 ? .86 : 1); g.beginPath(); g.moveTo(...p[k === 0 ? 0 : d[0]]); d.forEach(i => g.lineTo(...p[i])); g.stroke(); });
  g.lineWidth = e * 1.5; g.beginPath(); g.moveTo(...p[0]); g.lineTo(p[0][0] + (p[0][0] - p[9][0]) * .55, p[0][1] + (p[0][1] - p[9][1]) * .55); g.stroke(); // le poignet
}
function oeil(g, cx, cy, r, angle, ouvert, regard) { // un œil en noir et blanc ; ouvert de 0 (fermé) à 1
  g.save(); g.translate(cx, cy); g.rotate(angle);
  const h = r * .58 * Math.max(.04, ouvert);
  const amande = () => { g.beginPath(); g.moveTo(-r, 0); g.quadraticCurveTo(0, -h * 1.9, r, 0); g.quadraticCurveTo(0, h * 1.75, -r, 0); g.closePath(); };
  amande(); g.fillStyle = '#f4f1ea'; g.fill();
  if (ouvert > .12) {
    g.save(); amande(); g.clip();
    const ix = regard[0] * r * .3, iy = regard[1] * r * .16, ri = r * .47, iris = g.createRadialGradient(ix, iy, ri * .2, ix, iy, ri);
    iris.addColorStop(0, '#2b2b2b'); iris.addColorStop(.55, '#8a8a86'); iris.addColorStop(.9, '#4a4a48'); iris.addColorStop(1, '#151515');
    g.fillStyle = iris; g.beginPath(); g.arc(ix, iy, ri, 0, 7); g.fill();
    g.fillStyle = '#0a0a0a'; g.beginPath(); g.arc(ix, iy, ri * .44, 0, 7); g.fill();
    g.fillStyle = 'rgba(255,255,255,.9)'; g.beginPath(); g.arc(ix - ri * .3, iy - ri * .32, ri * .15, 0, 7); g.fill();
    const ombre = g.createLinearGradient(0, -h, 0, h * .2); ombre.addColorStop(0, 'rgba(0,0,0,.45)'); ombre.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = ombre; g.fillRect(-r, -h * 1.2, 2 * r, h * 1.6); // l'ombre de la paupière
    g.restore();
  }
  g.strokeStyle = '#111'; g.lineCap = 'round'; g.lineWidth = Math.max(1.5, r * .09); g.beginPath(); g.moveTo(-r, 0); g.quadraticCurveTo(0, -h * 1.9, r, 0); g.stroke();
  g.lineWidth = Math.max(1, r * .04); g.beginPath(); g.moveTo(r, 0); g.quadraticCurveTo(0, h * 1.75, -r, 0); g.stroke();
  g.restore();
}

export default {
  lettre: 'H',
  css: `
.by{display:grid;grid-template-columns:minmax(0,1fr) minmax(170px,230px);gap:clamp(14px,2.4cqw,36px);align-items:end;height:100cqh}
.by-scene{min-width:0;height:100cqh;display:grid;place-items:center}
.by-feuille{width:min(100%,calc(100cqh*4/3));aspect-ratio:4/3;background:${PAPIER};box-shadow:0 26px 50px -30px rgba(0,0,0,.6)}
.by-feuille canvas{display:block;width:100%;height:100%}
.by-cote{display:grid;gap:12px;align-content:end;padding-bottom:4px}
.by-cote p{margin:0}
.by-boutons{display:flex;flex-wrap:wrap;gap:8px}
.by [hidden]{display:none}
@media (max-width:760px){.by{grid-template-columns:1fr;height:auto}.by-scene{height:auto}.by-feuille{width:100%}}
`,
  monter(zone, ctx) {
    zone.innerHTML = `
      <div class="by">
        <div class="by-scene"><div class="by-feuille"><canvas data-export width="${L}" height="${HT}" aria-label="Deux mains détourées en noir et blanc, un œil dans chaque paume"></canvas></div></div>
        <div class="by-cote">
          <p class="etiquette" aria-live="polite"></p>
          <p class="note" data-provisoire hidden>Version provisoire : ces mains sont dessinées pour l’atelier, ce n’est pas le photomontage de Bayer. L’œuvre s’affichera ici dès qu’Eliott l’aura envoyée.</p>
          <video playsinline muted hidden></video>
          <div class="by-boutons">
            <button type="button" class="bouton plein" data-camera aria-pressed="false">Allumer la caméra</button>
            <button type="button" class="bouton" data-figer hidden>Figer</button>
          </div>
        </div>
      </div>`;
    const cv = zone.querySelector('canvas'), x = cv.getContext('2d'), info = zone.querySelector('.etiquette'), video = zone.querySelector('video');
    const bCam = zone.querySelector('[data-camera]'), bFiger = zone.querySelector('[data-figer]'), provisoire = zone.querySelector('[data-provisoire]');
    const neuf = (w, h, o) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d', o)]; };
    const [M, gm] = neuf(L, HT), [B, gb] = neuf(L, HT), [V, gv] = neuf(L / 2, HT / 2, { willReadFrequently: true });
    let vivant = true, raf = 0, flux = null, modele = null, fige = false, origine = null, tv = -1, ts = 0, vu = 0, mains = [], souris = [.5, .4], t0 = performance.now();
    const lisse = []; // points lissés, par main

    function coller(p, remplir, ouvert, regard) { // une main : son bord blanc de papier découpé, son ombre, sa photo, son œil
      gb.clearRect(0, 0, L, HT); silhouette(gb, p, 1.16); gb.globalCompositeOperation = 'source-in'; gb.fillStyle = BORD; gb.fillRect(0, 0, L, HT); gb.globalCompositeOperation = 'source-over';
      x.save(); x.shadowColor = 'rgba(0,0,0,.38)'; x.shadowBlur = 22; x.shadowOffsetX = 9; x.shadowOffsetY = 14; x.drawImage(B, 0, 0); x.restore();
      gm.clearRect(0, 0, L, HT); silhouette(gm, p, 1); gm.globalCompositeOperation = 'source-in'; remplir(gm); gm.globalCompositeOperation = 'source-over';
      x.drawImage(M, 0, 0);
      const c = [0, 5, 9, 13, 17].reduce((s, i) => [s[0] + p[i][0] / 5, s[1] + p[i][1] / 5], [0, 0]), paume = d2(p[0], p[9]);
      oeil(x, c[0], c[1], paume * .36, Math.atan2(p[9][1] - p[0][1], p[9][0] - p[0][0]) + Math.PI / 2, ouvert, regard);
    }
    function dessinees() { // provisoire, ou en attendant une main : deux mains schématiques qui flottent, l'œil suit la souris
      const t = (performance.now() - t0) / 1000;
      x.fillStyle = PAPIER; x.fillRect(0, 0, L, HT);
      [[.27, .08, -.12, 1], [.73, .02, .1, -1]].forEach(([cx, cy, a, sens], k) => {
        const s = HT * .78, ox = cx * L, oy = (.5 + cy + (ctx.reduireMouvement ? 0 : Math.sin(t * .7 + k * 2) * .012)) * HT, c = Math.cos(a), si = Math.sin(a);
        const p = MAIN.map(([u, v]) => { const X = (u - .5) * s * sens, Y = (v - .55) * s; return [ox + X * c - Y * si, oy + X * si + Y * c]; });
        const centre = [0, 5, 9, 13, 17].reduce((q, i) => [q[0] + p[i][0] / 5, q[1] + p[i][1] / 5], [0, 0]), dx = souris[0] * L - centre[0], dy = souris[1] * HT - centre[1], n = Math.hypot(dx, dy) || 1, f = Math.min(1, n / 160);
        const cligne = ctx.reduireMouvement ? 1 : Math.min(1, Math.abs(((t + k * 1.3) % 4.6) - 4.45) * 9);
        coller(p, g => { const d = g.createLinearGradient(ox - s * .3, 0, ox + s * .3, 0); d.addColorStop(0, '#bdb8ad'); d.addColorStop(1, '#7d786f'); g.fillStyle = d; g.fillRect(0, 0, L, HT); }, cligne, [dx / n * f, dy / n * f]);
      });
    }
    function repli(message) {
      provisoire.hidden = !!origine || !!flux;
      if (origine && !flux) { x.fillStyle = PAPIER; x.fillRect(0, 0, L, HT); const k = Math.min(L / origine.naturalWidth, HT / origine.naturalHeight), w = origine.naturalWidth * k, h = origine.naturalHeight * k; x.drawImage(origine, (L - w) / 2, (HT - h) / 2, w, h); }
      else dessinees();
      const t = message || (flux ? 'Montre tes mains à la caméra, paumes ouvertes.' : origine ? 'Caméra éteinte : voici l’œuvre d’origine. Allume la caméra et montre tes mains.' : 'Caméra éteinte. Allume-la et montre tes mains : un œil s’ouvrira dans ta paume.');
      if (info.textContent !== t) info.textContent = t;
    }
    function lireMains() {
      if (video.currentTime === tv) return; tv = video.currentTime; ts = Math.max(ts + 1, performance.now());
      let r; try { r = modele.detectForVideo(video, ts); } catch { return; }
      const vw = video.videoWidth, vh = video.videoHeight, k = Math.max(L / vw, HT / vh), ox = (L - vw * k) / 2, oy = (HT - vh * k) / 2;
      mains = (r.landmarks || []).map((m, n) => { // en pixels de l'image finale, en miroir, un peu lissés
        const p = m.map(q => [L - (q.x * vw * k + ox), q.y * vh * k + oy]), a = lisse[n];
        lisse[n] = a && d2(a[9], p[9]) < 160 ? p.map((q, i) => [a[i][0] + (q[0] - a[i][0]) * .6, a[i][1] + (q[1] - a[i][1]) * .6]) : p; return lisse[n];
      });
      lisse.length = mains.length; if (mains.length) vu = performance.now();
    }
    function photo() { // la caméra en miroir, en noir et blanc contrasté, dans une petite image
      const vw = video.videoWidth, vh = video.videoHeight, w = V.width, h = V.height, k = Math.max(w / vw, h / vh);
      gv.setTransform(-1, 0, 0, 1, w, 0); gv.drawImage(video, (w - vw * k) / 2, (h - vh * k) / 2, vw * k, vh * k); gv.setTransform(1, 0, 0, 1, 0, 0);
      const im = gv.getImageData(0, 0, w, h), p = im.data;
      for (let i = 0; i < p.length; i += 4) { let v = (p[i] * .299 + p[i + 1] * .587 + p[i + 2] * .114) / 255; v = Math.min(1, Math.max(0, (v - .5) * 1.45 + .52)); const n = v * 255 + (Math.random() - .5) * 16; p[i] = p[i + 1] = p[i + 2] = n; }
      gv.putImageData(im, 0, 0);
    }
    function boucle() {
      raf = 0; if (!vivant) return;
      if (flux && !fige && video.readyState >= 2 && video.videoWidth) {
        if (modele) lireMains();
        if (modele && mains.length && performance.now() - vu < 500) {
          photo(); x.fillStyle = PAPIER; x.fillRect(0, 0, L, HT);
          for (const p of mains) {
            const paume = d2(p[0], p[9]) || 1, ouv = Math.min(1, Math.max(0, ([8, 12, 16, 20].reduce((s, i) => s + d2(p[i], p[0]), 0) / 4 / paume - 1.2) / .6)); // poing fermé : l'œil se ferme
            coller(p, g => g.drawImage(V, 0, 0, L, HT), ouv, [(L / 2 - p[9][0]) / L, 0]);
          }
          const t = 'Un œil dans la paume. Ferme le poing : il se ferme.'; if (info.textContent !== t) info.textContent = t; provisoire.hidden = true;
        } else repli(modele ? undefined : 'Chargement du suivi des mains…');
      } else if (!flux && !origine) dessinees();
      if (flux || (!origine && !ctx.reduireMouvement)) raf = requestAnimationFrame(boucle);
    }
    const lancer = () => { if (!raf && vivant) raf = requestAnimationFrame(boucle); };
    function eteindre() {
      flux?.getTracks().forEach(p => p.stop()); flux = null; video.srcObject = null; modele?.close?.(); modele = null; mains = []; fige = false;
      bFiger.hidden = true; bFiger.textContent = 'Figer'; bCam.textContent = 'Allumer la caméra'; bCam.setAttribute('aria-pressed', 'false'); bCam.classList.add('plein');
    }
    bCam.addEventListener('click', async () => {
      if (flux) { eteindre(); repli(); lancer(); return; }
      bCam.disabled = true; info.textContent = 'Autorise la caméra dans le navigateur…';
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error('pas de caméra');
        const f = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: 'user' }, audio: false });
        if (!vivant) { f.getTracks().forEach(p => p.stop()); return; }
        flux = f; video.srcObject = f; await video.play();
        bCam.textContent = 'Éteindre la caméra'; bCam.setAttribute('aria-pressed', 'true'); bCam.classList.remove('plein'); bFiger.hidden = false; lancer();
        try {
          const { FilesetResolver, HandLandmarker } = await import(`${ctx.racine}vendor/mediapipe/vision_bundle.mjs`);
          const fs = await FilesetResolver.forVisionTasks(`${ctx.racine}vendor/mediapipe/wasm`);
          const options = delegate => ({ baseOptions: { modelAssetPath: URL_MAINS, delegate }, runningMode: 'VIDEO', numHands: 2, minHandDetectionConfidence: .4, minHandPresenceConfidence: .4, minTrackingConfidence: .4 });
          let m; try { m = await HandLandmarker.createFromOptions(fs, options('GPU')); } catch { m = await HandLandmarker.createFromOptions(fs, options('CPU')); }
          if (!vivant || !flux) { m.close?.(); return; }
          modele = m;
        } catch (e) { console.warn('Suivi des mains indisponible', e); eteindre(); repli('Le suivi des mains ne se charge pas (connexion ?). ' + (origine ? 'Voici l’œuvre d’origine.' : 'Les mains dessinées suivent ta souris.')); lancer(); }
      } catch (e) { eteindre(); repli(origine ? 'Caméra indisponible ou refusée : voici l’œuvre d’origine.' : 'Caméra indisponible ou refusée : les mains dessinées suivent ta souris.'); lancer(); }
      bCam.disabled = false;
    });
    bFiger.addEventListener('click', () => { fige = !fige; bFiger.textContent = fige ? 'Reprendre' : 'Figer'; if (fige) info.textContent = 'Image figée : tu peux l’enregistrer.'; });
    const surSouris = e => { const r = cv.getBoundingClientRect(); if (r.width) souris = [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height]; if (!flux && !origine && ctx.reduireMouvement) dessinees(); };
    addEventListener('pointermove', surSouris);

    repli(); lancer();
    const im = ctx.artiste.images?.[0];
    if (im) charger(`${ctx.racine}img/h/${im.f}`).then(i => { if (!vivant) return; origine = i; if (!flux) repli(); }).catch(() => console.warn('Bayer : œuvre introuvable, mains provisoires'));
    return () => { vivant = false; cancelAnimationFrame(raf); removeEventListener('pointermove', surSouris); flux?.getTracks().forEach(p => p.stop()); modele?.close?.(); };
  },
};
