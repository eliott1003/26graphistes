// W · Roman Cieślewicz — Zoom contre la pollution de l'œil (1971).
// Webcam « cyclope » : ton visage en noir et blanc, tramé en gros points, et tes deux yeux remplacés par un seul, au centre.
// L'atelier trouve tes yeux (détection du visage MediaPipe), les efface avec de la peau prise sur la joue, puis recolle un œil
// entre les deux. « Figer » garde l'image, « Enregistrer l'image » l'exporte.
//
// Jamais de cadre vide : caméra éteinte ou refusée, l'atelier montre l'affiche d'origine (première image de l'artiste dans
// labo/donnees.js, img/w/ref.jpg, à fournir par Eliott). L'affiche est protégée : elle n'est PAS redessinée en code.
// PROVISOIRE tant qu'elle manque : un cyclope très simple, dessiné pour l'atelier et passé dans la même trame ; l'atelier le dit.
// Si le modèle de détection ne se charge pas (il vient des serveurs de Google) : deux repères s'affichent sur le retour caméra,
// on y place ses yeux, et le cyclope se fait à cet endroit fixe.
// Rien de ce qui touche à la caméra n'est testable dans l'environnement de Claude : À TESTER PAR ELIOTT.

const URL_VISAGE = 'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite';
const SORTIE = { w: 720, h: 960 }, TRAVAIL = { w: 180, h: 240 }; // l'image finale, et la petite image où l'on recolle l'œil
const YEUX = { y: .42, ecart: 1 / 3.3 };   // dans l'image de travail : hauteur de la ligne des yeux, écart entre eux (fraction de la largeur)
const REPERE = { y: .42, ecart: .17 };     // sans détection : où placer ses yeux dans le retour caméra (fractions de la hauteur)
const TRAME = { pas: 8.5, angle: Math.PI / 4, force: 1.3, seuil: .07 }; // gros points à 45°
const PAPIER = '#e4e2dc', ENCRE = '#121212';
const charger = src => new Promise((ok, non) => { const im = new Image(); im.onload = () => ok(im); im.onerror = non; im.src = src; });

export default {
  lettre: 'W',
  css: `
.cz{display:grid;grid-template-columns:auto minmax(170px,230px);gap:clamp(14px,2.4cqw,36px);justify-content:center;align-items:end;height:100cqh}
.cz-feuille{height:min(100cqh,calc((100cqw - 270px)*4/3));aspect-ratio:3/4;background:${PAPIER};box-shadow:0 26px 50px -30px rgba(0,0,0,.6)}
.cz-feuille canvas{display:block;width:100%;height:100%}
.cz-cote{display:grid;gap:12px;align-content:end;padding-bottom:4px}
.cz-cote p{margin:0}
.cz-retour{position:relative;aspect-ratio:4/3;background:#000;overflow:hidden}
.cz-retour video{width:100%;height:100%;object-fit:cover;transform:scaleX(-1);display:block}
.cz-retour i{position:absolute;top:${REPERE.y * 100}%;width:12px;height:12px;margin:-6px;border:2px solid #fff;border-radius:50%;box-shadow:0 0 0 1px #000}
.cz-boutons{display:flex;flex-wrap:wrap;gap:8px}
.cz [hidden]{display:none}
@media (max-width:760px){.cz{grid-template-columns:1fr;height:auto}.cz-feuille{height:auto;width:100%}}
`,
  monter(zone, ctx) {
    zone.innerHTML = `
      <div class="cz">
        <div class="cz-feuille"><canvas data-export width="${SORTIE.w}" height="${SORTIE.h}" aria-label="Un visage tramé en noir et blanc, avec un seul œil au milieu"></canvas></div>
        <div class="cz-cote">
          <p class="etiquette" aria-live="polite"></p>
          <div class="cz-retour" hidden><video playsinline muted></video><i style="left:calc(50% - ${REPERE.ecart * 37.5}%)" hidden></i><i style="left:calc(50% + ${REPERE.ecart * 37.5}%)" hidden></i></div>
          <p class="note" data-provisoire hidden>Version provisoire : ce cyclope est dessiné pour l’atelier, ce n’est pas l’affiche de Cieślewicz. L’affiche s’affichera ici dès qu’Eliott l’aura envoyée.</p>
          <div class="cz-boutons">
            <button type="button" class="bouton plein" data-camera aria-pressed="false">Allumer la caméra</button>
            <button type="button" class="bouton" data-figer hidden>Figer</button>
          </div>
        </div>
      </div>`;
    const cv = zone.querySelector('canvas'), x = cv.getContext('2d'), info = zone.querySelector('.etiquette');
    const retour = zone.querySelector('.cz-retour'), video = retour.querySelector('video'), reperes = [...retour.querySelectorAll('i')];
    const bCam = zone.querySelector('[data-camera]'), bFiger = zone.querySelector('[data-figer]'), provisoire = zone.querySelector('[data-provisoire]');
    const A = document.createElement('canvas'), B = document.createElement('canvas'), T = document.createElement('canvas');
    A.width = B.width = TRAVAIL.w; A.height = B.height = TRAVAIL.h; T.width = T.height = 128;
    const ga = A.getContext('2d', { willReadFrequently: true }), gb = B.getContext('2d'), gt = T.getContext('2d');
    let vivant = true, raf = 0, flux = null, detecteur = null, chargement = null, yeux = null, vu = 0, fige = false, origine = null, tv = -1, ts = 0;

    /* ── la trame : un point par maille, d'autant plus gros que l'image est sombre ── */
    function tramer() {
      const d = ga.getImageData(0, 0, TRAVAIL.w, TRAVAIL.h).data, k = TRAVAIL.w / SORTIE.w, { pas, angle, force, seuil } = TRAME, c = Math.cos(angle), s = Math.sin(angle);
      x.fillStyle = PAPIER; x.fillRect(0, 0, SORTIE.w, SORTIE.h); x.fillStyle = ENCRE; x.beginPath();
      const n = Math.ceil(Math.hypot(SORTIE.w, SORTIE.h) / pas / 2) + 1;
      for (let i = -n; i <= n; i++) for (let j = -n; j <= n; j++) {
        const px = SORTIE.w / 2 + (i * c - j * s) * pas, py = SORTIE.h / 2 + (i * s + j * c) * pas;
        if (px < -pas || py < -pas || px > SORTIE.w + pas || py > SORTIE.h + pas) continue;
        const sx = Math.min(TRAVAIL.w - 1, Math.max(0, Math.round(px * k))), sy = Math.min(TRAVAIL.h - 1, Math.max(0, Math.round(py * k))), o = (sy * TRAVAIL.w + sx) * 4;
        const sombre = Math.min(1, Math.max(0, (1 - (d[o] * .299 + d[o + 1] * .587 + d[o + 2] * .114) / 255) * force - seuil));
        if (sombre < .02) continue; const r = pas * .74 * Math.sqrt(sombre);
        x.moveTo(px + r, py); x.arc(px, py, r, 0, 6.2832);
      }
      x.fill();
    }
    /* ── une pièce ovale, aux bords fondus, prise dans B et posée dans A ── */
    function rapiecer(sx, sy, sw, sh, dx, dy, dw, dh) {
      gt.globalCompositeOperation = 'source-over'; gt.clearRect(0, 0, 128, 128); gt.drawImage(B, sx - sw / 2, sy - sh / 2, sw, sh, 0, 0, 128, 128);
      const g = gt.createRadialGradient(64, 64, 64 * .45, 64, 64, 64); g.addColorStop(0, '#000'); g.addColorStop(1, 'rgba(0,0,0,0)');
      gt.globalCompositeOperation = 'destination-in'; gt.fillStyle = g; gt.fillRect(0, 0, 128, 128);
      ga.drawImage(T, dx - dw / 2, dy - dh / 2, dw, dh);
    }
    /* ── le cyclope : la source est cadrée pour que les yeux tombent toujours au même endroit de l'image de travail ── */
    function cyclope(source, g, d, phi, miroir) { // g, d : les deux yeux dans la source, en pixels
      const mx = (g.x + d.x) / 2, my = (g.y + d.y) / 2, ecart = Math.hypot(d.x - g.x, d.y - g.y) || 1, e = TRAVAIL.w * YEUX.ecart, k = e / ecart, y0 = TRAVAIL.h * YEUX.y;
      ga.setTransform(1, 0, 0, 1, 0, 0); ga.fillStyle = '#bbb'; ga.fillRect(0, 0, TRAVAIL.w, TRAVAIL.h);
      if (miroir) { ga.translate(TRAVAIL.w, 0); ga.scale(-1, 1); }
      ga.translate(TRAVAIL.w / 2, y0); ga.scale(k, k); ga.rotate(-phi); ga.translate(-mx, -my); ga.drawImage(source, 0, 0); ga.setTransform(1, 0, 0, 1, 0, 0);
      gb.drawImage(A, 0, 0);
      const cx = TRAVAIL.w / 2;
      for (const ex of [cx - e / 2, cx + e / 2]) rapiecer(ex, y0 + e * .72, e * 1.05, e * .72, ex, y0 - e * .06, e * 1.2, e * .95); // la joue recouvre l'œil et le sourcil
      rapiecer(cx + e / 2, y0, e * .95, e * .62, cx, y0 - e * .03, e * 1.25, e * .82);                                              // un œil, un peu agrandi, au milieu
    }
    function cyclopeDessine() { // provisoire : un visage très simple, à un œil
      const w = TRAVAIL.w, h = TRAVAIL.h, y0 = h * YEUX.y;
      ga.setTransform(1, 0, 0, 1, 0, 0); ga.fillStyle = '#d8d8d8'; ga.fillRect(0, 0, w, h);
      ga.fillStyle = '#3a3a3a'; ga.beginPath(); ga.ellipse(w / 2, h * .4, w * .43, h * .4, 0, 0, 7); ga.fill(); ga.fillRect(w * .07, h * .4, w * .86, h * .5);          // cheveux
      const peau = ga.createLinearGradient(w * .25, 0, w * .8, 0); peau.addColorStop(0, '#f4f4f4'); peau.addColorStop(1, '#a9a9a9');
      ga.fillStyle = peau; ga.beginPath(); ga.ellipse(w / 2, h * .47, w * .3, h * .33, 0, 0, 7); ga.fill(); ga.fillRect(w * .38, h * .7, w * .24, h * .3);              // visage, cou
      ga.fillStyle = '#555'; ga.fillRect(0, h * .88, w, h * .12);
      ga.fillStyle = '#fff'; ga.beginPath(); ga.ellipse(w / 2, y0, w * .13, h * .045, 0, 0, 7); ga.fill();                                                               // l'œil
      ga.fillStyle = '#111'; ga.beginPath(); ga.arc(w / 2, y0, h * .036, 0, 7); ga.fill(); ga.lineWidth = 2.5; ga.strokeStyle = '#222'; ga.beginPath(); ga.ellipse(w / 2, y0, w * .13, h * .045, 0, Math.PI, 0); ga.stroke();
      ga.fillStyle = '#777'; ga.beginPath(); ga.moveTo(w * .5, y0 + h * .05); ga.lineTo(w * .56, h * .6); ga.lineTo(w * .47, h * .6); ga.closePath(); ga.fill();         // nez
      ga.fillStyle = '#333'; ga.beginPath(); ga.ellipse(w / 2, h * .68, w * .09, h * .013, 0, 0, 7); ga.fill();                                                          // bouche
    }
    function repli(message) {
      if (origine) { x.fillStyle = PAPIER; x.fillRect(0, 0, SORTIE.w, SORTIE.h); const k = Math.min(SORTIE.w / origine.naturalWidth, SORTIE.h / origine.naturalHeight), w = origine.naturalWidth * k, h = origine.naturalHeight * k; x.drawImage(origine, (SORTIE.w - w) / 2, (SORTIE.h - h) / 2, w, h); }
      else { cyclopeDessine(); tramer(); }
      provisoire.hidden = !!origine;
      info.textContent = message || (origine ? 'Caméra éteinte : voici l’affiche d’origine. Allume la caméra pour prendre sa place.' : 'Caméra éteinte. Allume-la : tes deux yeux n’en feront plus qu’un.');
    }

    function chargerDetecteur() {
      if (chargement) return chargement;
      chargement = (async () => {
        const { FilesetResolver, FaceDetector } = await import(`${ctx.racine}vendor/mediapipe/vision_bundle.mjs`);
        const fs = await FilesetResolver.forVisionTasks(`${ctx.racine}vendor/mediapipe/wasm`);
        const opt = delegate => ({ baseOptions: { modelAssetPath: URL_VISAGE, delegate }, runningMode: 'VIDEO', minDetectionConfidence: .45 });
        let d; try { d = await FaceDetector.createFromOptions(fs, opt('GPU')); } catch { d = await FaceDetector.createFromOptions(fs, opt('CPU')); }
        if (!vivant) { d.close?.(); return null; }
        detecteur = d; return d;
      })().catch(e => { console.warn('Détection du visage indisponible', e); return null; });
      return chargement;
    }
    function lireYeux() { // les deux yeux du plus grand visage, en pixels de la vidéo
      if (!detecteur || video.currentTime === tv) return; tv = video.currentTime; ts = Math.max(ts + 1, performance.now());
      let r; try { r = detecteur.detectForVideo(video, ts); } catch { return; }
      const f = (r?.detections || []).slice().sort((a, b) => b.boundingBox.width * b.boundingBox.height - a.boundingBox.width * a.boundingBox.height)[0], k = f?.keypoints;
      if (!k || k.length < 2) return;
      const w = video.videoWidth, h = video.videoHeight; let a = { x: k[0].x * w, y: k[0].y * h }, b = { x: k[1].x * w, y: k[1].y * h }; if (a.x > b.x) [a, b] = [b, a];
      const m = .45; yeux = yeux ? { g: { x: yeux.g.x + (a.x - yeux.g.x) * m, y: yeux.g.y + (a.y - yeux.g.y) * m }, d: { x: yeux.d.x + (b.x - yeux.d.x) * m, y: yeux.d.y + (b.y - yeux.d.y) * m } } : { g: a, d: b };
      vu = performance.now();
    }
    function boucle() {
      raf = 0; if (!vivant || !flux) return;
      if (!fige && video.readyState >= 2 && video.videoWidth) {
        const w = video.videoWidth, h = video.videoHeight; lireYeux();
        const fixe = !detecteur || !yeux; // sans détection : les yeux sont attendus sur les repères
        const g = fixe ? { x: w / 2 - h * REPERE.ecart / 2, y: h * REPERE.y } : yeux.g, d = fixe ? { x: w / 2 + h * REPERE.ecart / 2, y: h * REPERE.y } : yeux.d;
        cyclope(video, g, d, fixe ? 0 : Math.atan2(d.y - g.y, d.x - g.x), true); tramer();
        reperes.forEach(r => { r.hidden = !fixe; });
        const perdu = detecteur && yeux && performance.now() - vu > 1500;
        const t = fixe ? (detecteur ? 'Regarde la caméra, de face.' : 'Place tes yeux sur les deux repères du petit écran.') : perdu ? 'Visage perdu : reviens de face.' : 'Un seul œil. Bouge, penche la tête, approche-toi.';
        if (info.textContent !== t) info.textContent = t;
      }
      raf = requestAnimationFrame(boucle);
    }
    function eteindre() {
      cancelAnimationFrame(raf); raf = 0; flux?.getTracks().forEach(p => p.stop()); flux = null; video.srcObject = null; yeux = null; fige = false;
      retour.hidden = true; bFiger.hidden = true; bFiger.textContent = 'Figer'; bCam.textContent = 'Allumer la caméra'; bCam.setAttribute('aria-pressed', 'false'); bCam.classList.add('plein');
    }
    bCam.addEventListener('click', async () => {
      if (flux) { eteindre(); repli(); return; }
      bCam.disabled = true; info.textContent = 'Autorise la caméra dans le navigateur…';
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error('pas de caméra');
        const f = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 960 }, height: { ideal: 720 } }, audio: false });
        if (!vivant) { f.getTracks().forEach(p => p.stop()); return; }
        flux = f; video.srcObject = f; await video.play();
        retour.hidden = false; bFiger.hidden = false; provisoire.hidden = true; bCam.textContent = 'Éteindre la caméra'; bCam.setAttribute('aria-pressed', 'true'); bCam.classList.remove('plein');
        info.textContent = 'Chargement de la détection du visage…'; chargerDetecteur();
        if (!raf) raf = requestAnimationFrame(boucle);
      } catch (e) { eteindre(); repli(origine ? 'Caméra indisponible ou refusée : voici l’affiche d’origine.' : 'Caméra indisponible ou refusée.'); }
      bCam.disabled = false;
    });
    bFiger.addEventListener('click', () => { fige = !fige; bFiger.textContent = fige ? 'Reprendre' : 'Figer'; if (fige) { info.textContent = 'Image figée : tu peux l’enregistrer.'; ctx.annoncer?.('Image figée'); } });

    repli();
    const im = ctx.artiste.images?.[0];
    if (im) charger(`${ctx.racine}img/w/${im.f}`).then(i => { if (!vivant) return; origine = i; if (!flux) repli(); }).catch(() => console.warn('Cieślewicz : affiche introuvable, cyclope provisoire'));
    return () => { vivant = false; cancelAnimationFrame(raf); flux?.getTracks().forEach(p => p.stop()); detecteur?.close?.(); };
  },
};
