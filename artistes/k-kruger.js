// K · Barbara Kruger — Untitled (Your gaze hits the side of my face), 1981. Photostat dans un cadre de bois peint en rouge, 140 × 104 cm.
// Le geste : prendre la place de la statue. La webcam passe en noir et blanc contrasté, la phrase se colle dessus.
// Composition de départ, d'après l'œuvre : les mots empilés à gauche, un par étiquette, noir sur blanc puis blanc sur noir, cadre rouge.
// « Changer la composition » passe aux bandeaux rouges à lettres blanches, sa signature à partir du milieu des années 1980.
// Jamais de cadre vide : sans caméra (éteinte ou refusée), l'atelier montre l'œuvre d'origine, ou une silhouette si l'image manque.
//
// L'œuvre est protégée : elle n'est pas redessinée, c'est l'image d'Eliott qui est montrée.
// PROVISOIRE tant que img/k/ref.jpg n'est pas fournie (à déclarer dans labo/donnees.js : images: [{ f: 'ref.jpg', t: '…' }]) :
//   départ sur une silhouette ; place, taille, police et alternance des étiquettes posées d'après des descriptions, à caler sur l'image.
// Pas de suivi du visage : on se cadre soi-même, de profil. La caméra est en miroir.

const L = 888, H = 1200, FORMAT = L / H, K = L / 1080;      // format de l'œuvre : 104 × 140 cm
const ROUGE = '#e2001a', NOIR = '#0d0d0d', BLANC = '#f7f5f0';
const POLICE = 'italic 900 100px Jost, Futura, "Trebuchet MS", sans-serif';
const PHRASE = 'Your gaze hits the side of my face';
const CONTRASTE = 1.6;

const LUT = new Uint8ClampedArray(256); for (let i = 0; i < 256; i++) LUT[i] = (i - 128) * CONTRASTE + 132;
const toile = () => { const c = document.createElement('canvas'); c.width = L; c.height = H; return c; };

/* Image de départ sans photo : une silhouette de profil, pour que l'atelier marche tout de suite. */
function silhouette() {
  const c = toile(), x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, L, H); g.addColorStop(0, '#8f8f8f'); g.addColorStop(1, '#1f1f1f'); x.fillStyle = g; x.fillRect(0, 0, L, H);
  x.fillStyle = '#e9e9e9'; x.beginPath();
  x.moveTo(L * .40, H); x.bezierCurveTo(L * .42, H * .84, L * .36, H * .74, L * .40, H * .66);            // nuque
  x.bezierCurveTo(L * .30, H * .52, L * .34, H * .22, L * .62, H * .20);                                 // arrière et sommet du crâne
  x.bezierCurveTo(L * .80, H * .20, L * .86, H * .34, L * .84, H * .42);                                 // front
  x.lineTo(L * .93, H * .53); x.lineTo(L * .85, H * .555);                                               // nez
  x.lineTo(L * .87, H * .60); x.lineTo(L * .84, H * .625); x.lineTo(L * .855, H * .66);                  // bouche
  x.bezierCurveTo(L * .86, H * .72, L * .78, H * .745, L * .70, H * .735);                               // menton
  x.bezierCurveTo(L * .68, H * .82, L * .74, H * .90, L * .98, H * .96); x.lineTo(L * .98, H); x.closePath(); x.fill();
  x.globalCompositeOperation = 'multiply';
  const o = x.createLinearGradient(L * .3, 0, L * .95, 0); o.addColorStop(0, '#4a4a4a'); o.addColorStop(1, '#ffffff'); x.fillStyle = o; x.fillRect(0, 0, L, H);
  x.globalCompositeOperation = 'source-over';
  return c;
}
/* un carreau de grain, tiré une fois, posé en incrustation à chaque image */
function carreauDeGrain() {
  const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'), d = x.createImageData(256, 256), p = d.data;
  for (let i = 0; i < p.length; i += 4) { p[i] = p[i + 1] = p[i + 2] = Math.random() * 255; p[i + 3] = 255; }
  x.putImageData(d, 0, 0); return c;
}
/* plein cadre (recadré, en miroir pour la caméra), noir et blanc contrasté, grain */
function traiter(x, grain, source, sw, sh, miroir) {
  const e = Math.max(L / sw, H / sh), w = sw * e, h = sh * e;
  x.save(); if (miroir) { x.translate(L, 0); x.scale(-1, 1); } x.drawImage(source, (L - w) / 2, (H - h) / 2, w, h); x.restore();
  const d = x.getImageData(0, 0, L, H), p = d.data;
  for (let i = 0; i < p.length; i += 4) p[i] = p[i + 1] = p[i + 2] = LUT[(p[i] * 77 + p[i + 1] * 150 + p[i + 2] * 29) >> 8];
  x.putImageData(d, 0, 0);
  x.save(); x.globalCompositeOperation = 'overlay'; x.globalAlpha = .34; x.translate(-Math.random() * 256, -Math.random() * 256);
  x.fillStyle = grain; x.fillRect(0, 0, L + 256, H + 256); x.restore();
}

/* Coupe la phrase en n morceaux de longueurs proches. */
function couper(phrase, n) {
  const mots = phrase.trim().split(/\s+/).filter(Boolean); if (!mots.length) return [];
  n = Math.min(n, mots.length);
  const cible = mots.join(' ').length / n, out = []; let cur = '';
  for (const m of mots) {
    if (cur && out.length < n - 1 && (cur + ' ' + m).length > cible + 2) { out.push(cur); cur = m; } else cur = cur ? cur + ' ' + m : m;
  }
  out.push(cur); return out;
}
/* Une étiquette par mot ; les tout petits mots vont ensemble (« of my »), ou avec le mot suivant s'il n'y en a qu'un. */
function etiquettes(phrase) {
  const mots = phrase.trim().split(/\s+/).filter(Boolean), out = []; let petits = [];
  for (const m of mots) {
    if (m.length <= 2) { petits.push(m); continue; }
    if (petits.length > 1) { out.push(petits.join(' ')); out.push(m); } else out.push([...petits, m].join(' '));
    petits = [];
  }
  if (petits.length) { if (out.length && petits.length < 2) out[out.length - 1] += ' ' + petits[0]; else out.push(petits.join(' ')); }
  return out.length > 9 ? couper(phrase, 9) : out;
}
function bandeau(x, texte, taille, y, align, marge, fond = ROUGE, encre = '#fff') {
  x.font = POLICE.replace('100px', taille + 'px');
  const w = x.measureText(texte).width, px = taille * .26, hb = taille * 1.14, lb = w + px * 2;
  const gx = align === 'g' ? marge : align === 'd' ? L - marge - lb : (L - lb) / 2;
  x.fillStyle = fond; x.fillRect(gx, y, lb, hb);
  x.fillStyle = encre; x.textBaseline = 'alphabetic'; x.fillText(texte, gx + px, y + hb * .8);
  return hb;
}
function taillePour(x, texte, largeurMax, max) {
  x.font = POLICE; const w = x.measureText(texte).width || 1;
  return Math.max(22, Math.min(max, 100 * largeurMax / (w + 52)));
}
const COMPOSITIONS = [
  { nom: 'Comme en 1981 : les mots en colonne', dessiner(x, phrase) {
      const m = etiquettes(phrase); if (!m.length) return;
      const case_ = H * .84 / m.length, s = Math.min(case_ * .62, 96 * K, ...m.map(t => taillePour(x, t, L * .40, 200)));
      m.forEach((t, i) => bandeau(x, t, s, H * .08 + case_ * i + (case_ - s * 1.14) / 2, 'g', L * .075, i % 2 ? NOIR : BLANC, i % 2 ? BLANC : NOIR));
  } },
  { nom: 'Bandeaux rouges, en haut et en bas', dessiner(x, phrase) {
      const m = couper(phrase, 2), marge = L * .085;
      m.forEach((t, i) => { const s = taillePour(x, t, L * .78, 150 * K); bandeau(x, t, s, i === 0 ? H * .085 : H * .915 - s * 1.14, i === 0 ? 'g' : 'd', marge); });
  } },
  { nom: 'Bandeaux rouges empilés', dessiner(x, phrase) {
      const m = couper(phrase, 3), tailles = m.map(t => taillePour(x, t, L * .8, 190 * K)), jeu = 14 * K;
      const total = tailles.reduce((a, s) => a + s * 1.14 + jeu, -jeu); let y = H * .56 - total / 2;
      m.forEach((t, i) => { y += bandeau(x, t, tailles[i], y, 'c', 0) + jeu; });
  } },
  { nom: 'Bandeaux rouges en escalier', dessiner(x, phrase) {
      const m = couper(phrase, 5), s = Math.min(...m.map(t => taillePour(x, t, L * .58, 118 * K)));
      const pas = Math.min(s * 1.6, (H * .8) / m.length), dx = (L * .34) / Math.max(1, m.length - 1); let y = H * .5 - (pas * m.length) / 2 + pas * .2;
      m.forEach((t, i) => { bandeau(x, t, s, y, 'g', L * .06 + dx * i); y += pas; });
  } },
];

export default {
  lettre: 'K',
  css: `
.kr{display:grid;grid-template-columns:auto minmax(200px,290px);gap:clamp(16px,3cqw,44px);justify-content:center;align-items:end;height:100cqh}
.kr-affiche{position:relative;height:min(100cqh,calc((100cqw - 340px)/${FORMAT.toFixed(4)}));aspect-ratio:${L}/${H};background:#000;box-shadow:0 0 0 1px rgba(0,0,0,.35),0 30px 54px -22px rgba(0,0,0,.85)}
.kr-affiche canvas{display:block;width:100%;height:100%}
.kr-cote{display:grid;gap:clamp(7px,1.5cqh,13px);align-content:end;min-height:0;padding-bottom:2px}
.kr-cote p{margin:0}
.kr-ref{height:clamp(84px,21cqh,180px);width:auto;display:block;box-shadow:0 0 0 1px rgba(255,255,255,.5)}
.kr textarea{width:100%;height:clamp(58px,11cqh,84px);resize:none;padding:8px 10px;border:1.5px solid currentColor;border-radius:4px;background:transparent;color:inherit;font:600 16px/1.25 Archivo,sans-serif}
.kr-boutons{display:flex;flex-wrap:wrap;gap:8px}
.kr-boutons .bouton{flex:1 1 130px;min-height:40px}
.kr-boutons .bouton[hidden]{display:none}
.kr input[type=file]{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}
.kr input[type=file]:focus-visible + label{outline:3px solid #fff;outline-offset:3px}
@media (max-width:760px){.kr{grid-template-columns:1fr;height:auto}.kr-affiche{height:auto;width:min(100%,calc(70svh*${FORMAT.toFixed(4)}));justify-self:center}}
`,
  monter(zone, ctx) {
    const ref = ctx.artiste.images?.[0];
    zone.innerHTML = `
      <div class="kr">
        <div class="kr-affiche"><canvas data-export width="${L}" height="${H}" aria-label="Ton image : un visage en noir et blanc, ta phrase collée dessus"></canvas></div>
        <div class="kr-cote">
          ${ref ? `<img class="kr-ref" src="${ctx.racine}img/k/${ref.f}" alt="L’œuvre de Barbara Kruger, 1981">` : ''}
          <p class="etiquette" aria-live="polite" data-info></p>
          <label class="etiquette" for="kr-phrase">Ta phrase</label>
          <textarea id="kr-phrase" maxlength="80" autocomplete="off" spellcheck="false">${PHRASE}</textarea>
          <div class="kr-boutons">
            <button type="button" class="bouton plein" data-camera aria-pressed="false">Allumer la caméra</button>
            <button type="button" class="bouton plein" data-photo hidden>Prendre la photo</button>
            <input id="kr-fichier" type="file" accept="image/*"><label class="bouton" for="kr-fichier">Choisir une photo</label>
            <button type="button" class="bouton" data-compo>Changer la composition</button>
            <button type="button" class="bouton" data-oeuvre hidden>Revoir l’œuvre</button>
          </div>
          <p class="note">Mets-toi de profil, comme la statue. Rien n’est envoyé : l’image reste sur ton appareil.</p>
        </div>
      </div>`;
    const q = s => zone.querySelector(s);
    const cv = q('canvas'), x = cv.getContext('2d'), info = q('[data-info]'), phrase = q('#kr-phrase'), fichier = q('#kr-fichier');
    const bCam = q('[data-camera]'), bPhoto = q('[data-photo]'), bOeuvre = q('[data-oeuvre]');
    const base = toile(), bx = base.getContext('2d', { willReadFrequently: true });   // l'image traitée, sans le texte
    const grain = bx.createPattern(carreauDeGrain(), 'repeat');
    const video = document.createElement('video'); video.muted = true; video.playsInline = true;
    const origine = ref ? new Image() : null;
    let etat = 'silhouette';   // 'oeuvre' | 'silhouette' | 'photo' | 'direct' | 'fige'
    let compo = 0, flux = null, raf = 0, vivant = true;

    const MESSAGES = {
      oeuvre: 'L’œuvre d’origine. Allume la caméra pour prendre la place de la statue.',
      silhouette: 'Allume la caméra, ou choisis une photo.',
      photo: 'Ta photo. Change la phrase ou la composition, puis enregistre l’image.',
      direct: 'Caméra allumée. Mets-toi de profil, puis prends la photo.',
      fige: 'Photo prise. Change la phrase ou la composition, puis enregistre l’image.',
    };
    function dire(t) { info.textContent = t || MESSAGES[etat]; bOeuvre.hidden = !origine?.naturalWidth || etat === 'oeuvre'; }
    function peindre() {
      if (etat === 'oeuvre') {                    // l'œuvre telle quelle, sans rien par-dessus
        const e = Math.max(L / origine.naturalWidth, H / origine.naturalHeight), w = origine.naturalWidth * e, h = origine.naturalHeight * e;
        x.drawImage(origine, (L - w) / 2, (H - h) / 2, w, h); return;
      }
      x.drawImage(base, 0, 0);
      COMPOSITIONS[compo].dessiner(x, phrase.value);
      x.strokeStyle = ROUGE; x.lineWidth = L * .052; x.strokeRect(0, 0, L, H);   // le cadre rouge
    }
    function passer(e) { etat = e; peindre(); dire(); }
    const versSilhouette = () => { traiter(bx, grain, silhouette(), L, H, false); passer('silhouette'); };
    const repli = () => { if (origine?.naturalWidth) passer('oeuvre'); else versSilhouette(); };
    /* on touche à la phrase ou à la composition alors que l'œuvre est affichée : on passe sur la silhouette pour voir le changement */
    const quitterOeuvre = () => { if (etat === 'oeuvre') versSilhouette(); else peindre(); };

    function boucle() {
      raf = 0; if (!vivant || etat !== 'direct') return;
      if (video.readyState >= 2 && video.videoWidth) { traiter(bx, grain, video, video.videoWidth, video.videoHeight, true); peindre(); }
      raf = requestAnimationFrame(boucle);
    }
    function eteindre() {
      cancelAnimationFrame(raf); raf = 0; flux?.getTracks().forEach(p => p.stop()); flux = null; video.srcObject = null;
      bCam.setAttribute('aria-pressed', 'false'); bCam.textContent = 'Allumer la caméra'; bCam.classList.add('plein'); bPhoto.hidden = true; bPhoto.textContent = 'Prendre la photo';
    }
    bCam.addEventListener('click', async () => {
      if (flux) { const garde = etat === 'fige'; eteindre(); if (!garde) repli(); return; }
      bCam.disabled = true; dire('Autorise la caméra dans le navigateur…');
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error('pas de caméra');
        const f = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
        if (!vivant) { f.getTracks().forEach(p => p.stop()); return; }
        flux = f; video.srcObject = f; await video.play();
        bCam.setAttribute('aria-pressed', 'true'); bCam.textContent = 'Éteindre la caméra'; bCam.classList.remove('plein'); bPhoto.hidden = false;
        etat = 'direct'; dire(); boucle();
      } catch (e) {
        eteindre(); repli();
        dire(origine?.naturalWidth ? 'Caméra indisponible ou refusée : voici l’œuvre d’origine. Tu peux aussi choisir une photo.' : 'Caméra indisponible ou refusée. Tu peux choisir une photo.');
      }
      bCam.disabled = false;
    });
    bPhoto.addEventListener('click', () => {
      if (etat === 'direct') { cancelAnimationFrame(raf); raf = 0; bPhoto.textContent = 'Reprendre'; passer('fige'); ctx.annoncer?.('Photo prise.'); }
      else if (flux) { bPhoto.textContent = 'Prendre la photo'; etat = 'direct'; dire(); boucle(); }
    });
    fichier.addEventListener('change', () => {
      const f = fichier.files[0]; if (!f) return;
      const u = URL.createObjectURL(f), im = new Image();
      im.onload = () => { if (flux) eteindre(); traiter(bx, grain, im, im.naturalWidth, im.naturalHeight, false); URL.revokeObjectURL(u); passer('photo'); };
      im.onerror = () => { URL.revokeObjectURL(u); dire('Cette image ne s’ouvre pas. Essaie une photo JPG ou PNG.'); };
      im.src = u; fichier.value = '';
    });
    phrase.addEventListener('input', quitterOeuvre);
    q('[data-compo]').addEventListener('click', () => { compo = (compo + 1) % COMPOSITIONS.length; quitterOeuvre(); ctx.annoncer?.('Composition : ' + COMPOSITIONS[compo].nom); });
    bOeuvre.addEventListener('click', () => { if (flux) eteindre(); passer('oeuvre'); });

    versSilhouette();
    if (origine) { origine.onload = () => { if (vivant && etat === 'silhouette') passer('oeuvre'); }; origine.src = ctx.racine + 'img/k/' + ref.f; }
    document.fonts.load(POLICE).then(() => { if (vivant && etat !== 'direct') peindre(); }).catch(() => {});

    return () => { vivant = false; eteindre(); };
  },
};
