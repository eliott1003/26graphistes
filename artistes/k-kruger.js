// K · Barbara Kruger — Untitled (Your gaze hits the side of my face), 1981, et d'autres œuvres de la même famille.
// Le geste : prendre la place de la photo. La webcam passe en noir et blanc contrasté, la phrase se colle dessus.
//
// - « Cadrer mon visage » (comme le Cadre centré de macOS) : un détecteur de visage (MediaPipe, modèle chargé chez Google au premier usage)
//   recadre l'image en direct pour que le visage tombe à la place du visage de l'œuvre. S'il ne se charge pas, on garde le cadrage fixe.
// - Les boutons « Œuvres de Kruger » reprennent la phrase exacte et la mise en page de quatre œuvres (le texte se modifie ensuite librement).
// - Espace (ou « Composition suivante ») passe d'une mise en page à l'autre en gardant ta phrase ; Maj + Espace revient en arrière.
// - Caméra éteinte : silhouette de profil (validé par Eliott le 13/11) ; avec img/k/ref.jpg déclarée, l'œuvre d'origine.
//
// Mises en page posées d'après des descriptions, sans les images sous les yeux : à caler sur des images envoyées par Eliott.
// Formats : Your gaze 104 × 140 cm ; Your body is a battleground ≈ carré ; We don't need another hero ≈ 277 × 533 cm (en largeur) ; I shop therefore I am ≈ 282 × 287 cm.
// Les œuvres ne sont pas reproduites : seules la phrase (le titre de l'œuvre) et la disposition sont reprises, sur la photo du visiteur.

const ROUGE = '#e2001a', NOIR = '#0d0d0d', BLANC = '#f7f5f0';
const POLICE = 'italic 900 100px Jost, Futura, "Trebuchet MS", sans-serif';
/* Le noir et blanc « photostat » : courbe en S (douceur = largeur du passage du noir au blanc, milieu = où il se fait), grain posé par-dessus.
   Valeurs choisies par Eliott (13/11), figées. */
const DEFAUT = { douceur: 24, milieu: 111, grain: .26, taille: 1.5 };
const URL_VISAGE = 'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite';

const LUT = new Uint8ClampedArray(256);
function faireLUT(r) { for (let i = 0; i < 256; i++) LUT[i] = 255 / (1 + Math.exp(-(i - r.milieu) / r.douceur)); }

/* Image de départ sans photo : une silhouette de profil. */
function silhouette(L, H) {
  const c = document.createElement('canvas'); c.width = L; c.height = H; const x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, L, H); g.addColorStop(0, '#8f8f8f'); g.addColorStop(1, '#1f1f1f'); x.fillStyle = g; x.fillRect(0, 0, L, H);
  const s = Math.min(L / 888, H / 1200), ox = (L - 888 * s) / 2, oy = (H - 1200 * s) / 2;
  x.save(); x.translate(ox, oy); x.scale(s * 888, s * 1200);
  x.fillStyle = '#e9e9e9'; x.beginPath();
  x.moveTo(.40, 1.05); x.bezierCurveTo(.42, .84, .36, .74, .40, .66);
  x.bezierCurveTo(.30, .52, .34, .22, .62, .20);
  x.bezierCurveTo(.80, .20, .86, .34, .84, .42);
  x.lineTo(.93, .53); x.lineTo(.85, .555); x.lineTo(.87, .60); x.lineTo(.84, .625); x.lineTo(.855, .66);
  x.bezierCurveTo(.86, .72, .78, .745, .70, .735);
  x.bezierCurveTo(.68, .82, .74, .90, .98, .96); x.lineTo(.98, 1.05); x.closePath(); x.fill();
  x.restore();
  x.globalCompositeOperation = 'multiply';
  const o = x.createLinearGradient(L * .3, 0, L * .95, 0); o.addColorStop(0, '#4a4a4a'); o.addColorStop(1, '#ffffff'); x.fillStyle = o; x.fillRect(0, 0, L, H);
  x.globalCompositeOperation = 'source-over';
  return c;
}
/* bruit de luminance (-1..1), en grains de taille × taille pixels, sur un carreau de 512 × 512 répété */
const NB = 512;
function bruit(taille) {
  const t = Math.max(1, Math.round(taille)), b = new Float32Array(NB * NB), n = Math.ceil(NB / t), g = new Float32Array(n * n);
  for (let i = 0; i < g.length; i++) g[i] = (Math.random() + Math.random() - 1);
  for (let y = 0; y < NB; y++) for (let x = 0; x < NB; x++) b[y * NB + x] = g[((y / t) | 0) * n + ((x / t) | 0)];
  return b;
}
/* un carreau de grain ; taille > 1 : chaque grain fait taille × taille pixels (plus grossier, comme un tirage agrandi) */
function carreauDeGrain(taille) {
  const n = 256, c = document.createElement('canvas'); c.width = c.height = n; const x = c.getContext('2d'), d = x.createImageData(n, n), p = d.data;
  for (let i = 0; i < p.length; i += 4) { p[i] = p[i + 1] = p[i + 2] = Math.random() * 255; p[i + 3] = 255; }
  x.putImageData(d, 0, 0); if (taille <= 1) return c;
  const g = document.createElement('canvas'); g.width = g.height = Math.round(n * taille); const y = g.getContext('2d');
  y.imageSmoothingEnabled = taille % 1 !== 0; y.drawImage(c, 0, 0, g.width, g.height); return g;
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
/* un bandeau : fond plein, texte en Futura grasse oblique (Jost) ; renvoie sa hauteur */
function bandeau(x, L, texte, taille, y, align, marge, fond = ROUGE, encre = '#fff') {
  x.font = POLICE.replace('100px', taille + 'px');
  const w = x.measureText(texte).width, px = taille * .26, hb = taille * 1.14, lb = w + px * 2;
  const gx = align === 'g' ? marge : align === 'd' ? L - marge - lb : (L - lb) / 2;
  x.fillStyle = fond; x.fillRect(gx, y, lb, hb);
  x.fillStyle = encre; x.textBaseline = 'alphabetic'; x.fillText(texte, gx + px, y + hb * .8);
  return hb;
}
function taillePour(x, texte, largeurMax, max) {
  x.font = POLICE; const w = x.measureText(texte).width || 1;
  return Math.max(20, Math.min(max, 100 * largeurMax / (w + 52)));
}

/* Les mises en page. visage = où doit tomber le visage détecté (centre x, centre y, hauteur du visage), en part de la feuille. */
const COMPOSITIONS = [
  { id: 'gaze', nom: 'Your gaze hits the side of my face (1981)', L: 888, H: 1200, cadre: true, visage: { x: .66, y: .46, h: .27 },
    dessiner(x, L, H, phrase) {   // les mots en colonne à gauche, étiquettes noir sur blanc puis blanc sur noir
      const m = etiquettes(phrase); if (!m.length) return;
      const k = L / 1080, case_ = H * .84 / m.length, s = Math.min(case_ * .62, 96 * k, ...m.map(t => taillePour(x, t, L * .40, 200)));
      m.forEach((t, i) => bandeau(x, L, t, s, H * .08 + case_ * i + (case_ - s * 1.14) / 2, 'g', L * .075, i % 2 ? NOIR : BLANC, i % 2 ? BLANC : NOIR));
  } },
  { id: 'body', nom: 'Your body is a battleground (1989)', L: 1100, H: 1100, scinder: true, visage: { x: .5, y: .5, h: .42 },
    dessiner(x, L, H, phrase) {   // trois bandeaux rouges, en haut, au milieu, en bas ; le visage coupé en positif et négatif
      const m = couper(phrase, 3); if (!m.length) return;
      const tailles = m.map(t => taillePour(x, t, L * .86, 150 * L / 1100)), hs = tailles.map(s => s * 1.14);
      const ys = m.length === 1 ? [(H - hs[0]) / 2] : m.length === 2 ? [H * .05, H * .95 - hs[1]] : [H * .05, (H - hs[1]) / 2, H * .95 - hs[2]];
      m.forEach((t, i) => bandeau(x, L, t, tailles[i], ys[i], 'c', 0));
  } },
  { id: 'hero', nom: 'We don’t need another hero (1987)', L: 1200, H: 624, cadre: true, visage: { x: .5, y: .5, h: .42 },
    dessiner(x, L, H, phrase) {   // deux bandeaux rouges, en haut et en bas, sur une image en largeur
      const m = couper(phrase, 2); if (!m.length) return;
      m.forEach((t, i) => { const s = taillePour(x, t, L * .62, H * .15); bandeau(x, L, t, s, i === 0 ? H * .07 : H * .93 - s * 1.14, 'c', 0); });
  } },
  { id: 'shop', nom: 'I shop therefore I am (1987)', L: 1100, H: 1120, visage: { x: .5, y: .34, h: .26 },
    dessiner(x, L, H, phrase) {   // un seul carton rouge sous le visage, la phrase sur trois lignes
      const m = couper(phrase, 3); if (!m.length) return;
      const s = Math.min(...m.map(t => taillePour(x, t, L * .34, 82 * L / 1100))), lh = s * 1.12, pad = s * .45;
      x.font = POLICE.replace('100px', s + 'px');
      const w = Math.max(...m.map(t => x.measureText(t).width)) + pad * 2, h = lh * m.length + pad * 1.4, gx = (L - w) / 2, gy = H * .60;
      x.fillStyle = ROUGE; x.fillRect(gx, gy, w, h);
      x.fillStyle = '#fff'; x.textBaseline = 'alphabetic'; m.forEach((t, i) => x.fillText(t, gx + pad, gy + pad * .7 + lh * (i + .82)));
  } },
  { id: 'haut-bas', nom: 'Bandeaux en haut et en bas', L: 888, H: 1200, cadre: true, visage: { x: .5, y: .48, h: .30 },
    dessiner(x, L, H, phrase) {
      const m = couper(phrase, 2), marge = L * .085;
      m.forEach((t, i) => { const s = taillePour(x, t, L * .78, 150 * L / 1080); bandeau(x, L, t, s, i === 0 ? H * .085 : H * .915 - s * 1.14, i === 0 ? 'g' : 'd', marge); });
  } },
  { id: 'empilee', nom: 'Bandeaux empilés', L: 888, H: 1200, visage: { x: .5, y: .42, h: .32 },
    dessiner(x, L, H, phrase) {
      const m = couper(phrase, 3), tailles = m.map(t => taillePour(x, t, L * .8, 190 * L / 1080)), jeu = 14 * L / 1080;
      const total = tailles.reduce((a, s) => a + s * 1.14 + jeu, -jeu); let y = H * .56 - total / 2;
      m.forEach((t, i) => { y += bandeau(x, L, t, tailles[i], y, 'c', 0) + jeu; });
  } },
  { id: 'escalier', nom: 'Bandeaux en escalier', L: 888, H: 1200, visage: { x: .6, y: .45, h: .30 },
    dessiner(x, L, H, phrase) {
      const m = couper(phrase, 5), s = Math.min(...m.map(t => taillePour(x, t, L * .58, 118 * L / 1080)));
      const pas = Math.min(s * 1.6, (H * .8) / m.length), dx = (L * .34) / Math.max(1, m.length - 1); let y = H * .5 - (pas * m.length) / 2 + pas * .2;
      m.forEach((t, i) => { bandeau(x, L, t, s, y, 'g', L * .06 + dx * i); y += pas; });
  } },
];
/* Les boutons « Œuvres de Kruger » : la phrase exacte + la mise en page de l'œuvre. */
const OEUVRES = [
  { compo: 'gaze', phrase: 'Your gaze hits the side of my face', court: 'Your gaze…', an: 1981 },
  { compo: 'body', phrase: 'Your body is a battleground', court: 'Your body…', an: 1989 },
  { compo: 'hero', phrase: 'We don’t need another hero', court: 'Another hero', an: 1987 },
  { compo: 'shop', phrase: 'I shop therefore I am', court: 'I shop…', an: 1987 },
];

export default {
  lettre: 'K',
  css: `
.kr{--f:.74;display:grid;grid-template-columns:auto minmax(220px,300px);gap:clamp(16px,3cqw,40px);justify-content:center;align-items:end;height:100cqh}
.kr-affiche{position:relative;height:min(100cqh,calc((100cqw - 340px)/var(--f)));aspect-ratio:var(--f);background:#000;box-shadow:0 0 0 1px rgba(0,0,0,.35),0 30px 54px -22px rgba(0,0,0,.85)}
.kr-affiche canvas{display:block;width:100%;height:100%}
.kr-cote{display:grid;gap:clamp(6px,1.3cqh,11px);align-content:end;min-height:0;padding-bottom:2px}
.kr-cote p{margin:0}
.kr-groupe{display:grid;gap:clamp(6px,1.3cqh,11px);align-content:start}
.kr-ref{height:clamp(84px,21cqh,180px);width:auto;display:block;box-shadow:0 0 0 1px rgba(255,255,255,.5)}
.kr textarea{width:100%;height:clamp(50px,9cqh,72px);resize:none;padding:8px 10px;border:1.5px solid currentColor;border-radius:4px;background:transparent;color:inherit;font:600 16px/1.25 Archivo,sans-serif}
.kr-oeuvres{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.kr-oeuvres button{min-height:34px;padding:5px 8px;border:1.5px solid currentColor;border-radius:4px;background:none;color:inherit;font:italic 900 13.5px/1.1 Jost,Futura,sans-serif;text-align:left;display:flex;justify-content:space-between;gap:6px;align-items:center}
.kr-oeuvres button small{font:500 11px/1 Archivo,sans-serif;opacity:.8}
.kr-oeuvres button[aria-pressed=true]{background:#fff;color:${ROUGE};border-color:#fff}
.kr-boutons{display:flex;flex-wrap:wrap;gap:7px}
.kr-boutons .bouton{flex:1 1 120px;min-height:38px;padding:6px 10px}
.kr-boutons .bouton[hidden]{display:none}
.kr-boutons kbd{font:500 11px/1 "DM Mono",monospace;opacity:.75;margin-left:.45em}
.kr-case{display:flex;align-items:center;gap:8px;font:600 13px/1.3 Archivo,sans-serif;cursor:pointer}
.kr-case[hidden]{display:none}
.kr-case input{accent-color:#fff;width:17px;height:17px;margin:0}
.kr input[type=file]{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}
.kr input[type=file]:focus-visible + label{outline:3px solid #fff;outline-offset:3px}
/* image en largeur (We don't need another hero) : l'image passe au-dessus, les réglages en trois colonnes dessous */
.kr.large{grid-template-columns:1fr;grid-template-rows:minmax(0,1fr) auto;align-items:center;justify-items:center}
.kr.large .kr-affiche{height:auto;width:min(100cqw,calc((100cqh - 215px)*var(--f)))}
.kr.large .kr-cote{grid-template-columns:repeat(3,minmax(0,1fr));column-gap:18px;align-items:start;width:100%}
.kr.large .kr-cote > *{grid-column:auto}
.kr.large .kr-ref{display:none}
@media (max-width:760px){.kr,.kr.large{grid-template-columns:1fr;height:auto}.kr.large .kr-cote{grid-template-columns:1fr}.kr-affiche{height:auto;width:min(100%,calc(70svh*var(--f)));justify-self:center}}
`,
  monter(zone, ctx) {
    const ref = ctx.artiste.images?.[0];
    const R = { ...DEFAUT }; faireLUT(R);
    zone.innerHTML = `
      <div class="kr">
        <div class="kr-affiche"><canvas data-export aria-label="Ton image : un visage en noir et blanc, ta phrase collée dessus"></canvas></div>
        <div class="kr-cote">
          ${ref ? `<img class="kr-ref" src="${ctx.racine}img/k/${ref.f}" alt="L’œuvre de Barbara Kruger, 1981">` : ''}
          <div class="kr-groupe"><p class="etiquette" aria-live="polite" data-info></p>
          <p class="etiquette">Œuvres de Kruger</p>
          <div class="kr-oeuvres">${OEUVRES.map((o, i) => `<button type="button" data-oeuvre-k="${i}" aria-pressed="false" title="${o.phrase} (${o.an})">${o.court}<small>${o.an}</small></button>`).join('')}</div></div>
          <div class="kr-groupe"><label class="etiquette" for="kr-phrase">Ta phrase</label>
          <textarea id="kr-phrase" maxlength="80" autocomplete="off" spellcheck="false">${OEUVRES[0].phrase}</textarea></div>
          <div class="kr-groupe"><div class="kr-boutons">
            <button type="button" class="bouton plein" data-camera aria-pressed="false">Allumer la caméra</button>
            <button type="button" class="bouton plein" data-photo hidden>Prendre la photo</button>
            <input id="kr-fichier" type="file" accept="image/*"><label class="bouton" for="kr-fichier">Choisir une photo</label>
            <button type="button" class="bouton" data-compo>Composition suivante<kbd>Espace</kbd></button>
            <button type="button" class="bouton" data-oeuvre hidden>Revoir l’œuvre</button>
          </div>
          <label class="kr-case" hidden><input type="checkbox" data-cadrer checked> Cadrer mon visage</label></div>
        </div>
      </div>`;
    const q = s => zone.querySelector(s);
    const bloc = q('.kr'), cv = q('canvas'), x = cv.getContext('2d'), info = q('[data-info]'), phrase = q('#kr-phrase'), fichier = q('#kr-fichier');
    const bCam = q('[data-camera]'), bPhoto = q('[data-photo]'), bOeuvre = q('[data-oeuvre]'), caseCadrer = q('[data-cadrer]'), ligneCadrer = q('.kr-case');
    const base = document.createElement('canvas'), bx = base.getContext('2d', { willReadFrequently: true });   // l'image traitée, sans le texte
    let grain = bx.createPattern(carreauDeGrain(R.taille), 'repeat'), tuile = Math.round(256 * Math.max(1, R.taille)), bruitL = bruit(R.taille);
    const video = document.createElement('video'); video.muted = true; video.playsInline = true;
    const origine = ref ? new Image() : null;
    let etat = 'silhouette';   // 'oeuvre' | 'silhouette' | 'photo' | 'direct' | 'fige'
    let compo = 0, flux = null, raf = 0, vivant = true;
    let source = null;         // { el, w, h, miroir, visage } : la photo sous la phrase (hors direct)
    let detecteur = null, chargement = null, visage = null, rect = null, vu = 0, mode = 'VIDEO';
    let L = 0, H = 0;

    const MESSAGES = {
      oeuvre: 'L’œuvre d’origine. Allume la caméra pour prendre sa place.',
      silhouette: 'Allume la caméra, ou choisis une photo.',
      photo: 'Ta photo. Change la phrase ou la composition (Espace), puis enregistre l’image.',
      direct: 'Caméra allumée. Prends la photo quand tu es bien placé.',
      fige: 'Photo prise. Change la phrase ou la composition (Espace), puis enregistre l’image.',
    };
    function dire(t) { info.textContent = t || MESSAGES[etat]; bOeuvre.hidden = !origine?.naturalWidth || etat === 'oeuvre'; }
    const C = () => COMPOSITIONS[compo];

    /* le format de la feuille suit la composition */
    function formater() {
      const c = C(); if (c.L === L && c.H === H) return;
      L = c.L; H = c.H; cv.width = base.width = L; cv.height = base.height = H; bloc.style.setProperty('--f', (L / H).toFixed(4)); rect = null; bloc.classList.toggle('large', L / H > 1.3);
    }
    /* Le cadrage : quel rectangle de la source va dans la feuille. Avec un visage, on le place là où est le visage dans l'œuvre. */
    function cible(w, h, v, miroir) {
      const f = L / H; let sw = Math.min(w, h * f), sh = sw / f;            // plein cadre, centré
      if (!v) return { x: (w - sw) / 2, y: (h - sh) / 2, w: sw, h: sh };
      const t = C().visage;
      sh = Math.min(sh, v.h / t.h); sw = sh * f;                             // zoom : le visage prend la hauteur voulue
      const tx = miroir ? 1 - t.x : t.x;
      return { x: Math.max(0, Math.min(w - sw, v.x - tx * sw)), y: Math.max(0, Math.min(h - sh, v.y - t.y * sh)), w: sw, h: sh };
    }
    function traiter(el, r, miroir) {
      bx.save(); if (miroir) { bx.translate(L, 0); bx.scale(-1, 1); }
      bx.drawImage(el, r.x, r.y, r.w, r.h, 0, 0, L, H); bx.restore();
      const d = bx.getImageData(0, 0, L, H), p = d.data, scinder = C().scinder, moitie = L >> 1;
      const amp = R.grain * 90, ox = (Math.random() * NB) | 0, oy = (Math.random() * NB) | 0;
      for (let y = 0, i = 0; y < H; y++) { const ligne = ((y + oy) % NB) * NB; for (let k = 0; k < L; k++, i += 4) {
        let v = ((p[i] * 77 + p[i + 1] * 150 + p[i + 2] * 29) >> 8) + bruitL[ligne + (k + ox) % NB] * amp;   // le grain avant la courbe : il mouchette les passages
        let g = LUT[v < 0 ? 0 : v > 255 ? 255 : v | 0];
        if (scinder && k >= moitie) g = 255 - g;                              // Your body is a battleground : une moitié en négatif
        p[i] = p[i + 1] = p[i + 2] = g;
      } }
      bx.putImageData(d, 0, 0);
      if (R.grain > 0) {                                                       // et un voile de grain fin par-dessus, dans les gris
        bx.save(); bx.globalCompositeOperation = 'overlay'; bx.globalAlpha = R.grain * .5; bx.translate(-Math.random() * tuile, -Math.random() * tuile);
        bx.fillStyle = grain; bx.fillRect(0, 0, L + tuile, H + tuile); bx.restore();
      }
    }
    function peindre() {
      if (etat === 'oeuvre') {
        const e = Math.max(L / origine.naturalWidth, H / origine.naturalHeight), w = origine.naturalWidth * e, h = origine.naturalHeight * e;
        x.fillStyle = '#000'; x.fillRect(0, 0, L, H); x.drawImage(origine, (L - w) / 2, (H - h) / 2, w, h); return;
      }
      x.drawImage(base, 0, 0);
      C().dessiner(x, L, H, phrase.value);
      if (C().cadre) { x.strokeStyle = ROUGE; x.lineWidth = Math.min(L, H) * .052; x.strokeRect(0, 0, L, H); }
    }
    /* refait l'image fixe (photo, silhouette, photo prise) au format de la composition */
    function refaireFixe() {
      if (etat === 'silhouette' || !source) traiter(silhouette(L, H), { x: 0, y: 0, w: L, h: H }, false);
      else traiter(source.el, cible(source.w, source.h, caseCadrer.checked ? source.visage : null, source.miroir), source.miroir);
      peindre();
    }
    function passer(e) { etat = e; if (e === 'direct' || e === 'oeuvre') peindre(); else refaireFixe(); dire(); }
    const repli = () => { source = null; passer(origine?.naturalWidth ? 'oeuvre' : 'silhouette'); };
    function majOeuvres() {
      zone.querySelectorAll('[data-oeuvre-k]').forEach(b => { const o = OEUVRES[+b.dataset.oeuvreK]; b.setAttribute('aria-pressed', o.compo === C().id && o.phrase === phrase.value); });
    }
    function changerCompo(i) {
      compo = (i + COMPOSITIONS.length) % COMPOSITIONS.length; formater(); majOeuvres();
      if (etat === 'oeuvre') passer('silhouette'); else if (etat !== 'direct') refaireFixe();
      ctx.annoncer?.('Composition : ' + C().nom);
    }

    /* ── Détection du visage : chargée une fois, au premier usage ── */
    function chargerDetecteur() {
      if (chargement) return chargement;
      chargement = (async () => {
        const { FilesetResolver, FaceDetector } = await import(`${ctx.racine}vendor/mediapipe/vision_bundle.mjs`);
        const fs = await FilesetResolver.forVisionTasks(`${ctx.racine}vendor/mediapipe/wasm`);
        const opt = delegate => ({ baseOptions: { modelAssetPath: URL_VISAGE, delegate }, runningMode: 'VIDEO', minDetectionConfidence: .45 });
        let d; try { d = await FaceDetector.createFromOptions(fs, opt('GPU')); } catch { d = await FaceDetector.createFromOptions(fs, opt('CPU')); }
        if (!vivant) { d.close?.(); return null; }
        mode = 'VIDEO'; detecteur = d; return d;
      })().catch(e => { console.warn('Détection du visage indisponible', e); return null; });
      return chargement;
    }
    async function regler(m) { if (detecteur && mode !== m) { await detecteur.setOptions({ runningMode: m }); mode = m; } }
    /* le plus grand visage, en pixels de la source : centre et hauteur */
    function lireVisage(res) {
      const ds = res?.detections || []; if (!ds.length) return null;
      const b = ds.map(d => d.boundingBox).sort((a, c) => c.width * c.height - a.width * a.height)[0];
      return { x: b.originX + b.width / 2, y: b.originY + b.height / 2, h: b.height };
    }

    function boucle(t) {
      raf = 0; if (!vivant || etat !== 'direct') return;
      const w = video.videoWidth, h = video.videoHeight;
      if (video.readyState >= 2 && w) {
        if (detecteur && mode === 'VIDEO' && caseCadrer.checked) {
          try {
            const v = lireVisage(detecteur.detectForVideo(video, t));
            if (v) { visage = visage ? { x: visage.x + (v.x - visage.x) * .35, y: visage.y + (v.y - visage.y) * .35, h: visage.h + (v.h - visage.h) * .2 } : v; vu = t; }
          } catch {}
        }
        // visage perdu : on garde le dernier cadrage, comme le Cadre centré (pas de saut au plein cadre)
        const voulu = cible(w, h, caseCadrer.checked ? visage : null, true), a = ctx.reduireMouvement ? 1 : .12;
        rect = !rect ? voulu : { x: rect.x + (voulu.x - rect.x) * a, y: rect.y + (voulu.y - rect.y) * a, w: rect.w + (voulu.w - rect.w) * a, h: rect.h + (voulu.h - rect.h) * a };
        traiter(video, rect, true); peindre();
        const perdu = detecteur && caseCadrer.checked && t - vu > 2000;
        if (perdu && !info.textContent.startsWith('Visage')) info.textContent = 'Visage non trouvé : approche-toi, de face ou de trois quarts.';
        else if (!perdu && info.textContent.startsWith('Visage')) dire();
      }
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
        bCam.setAttribute('aria-pressed', 'true'); bCam.textContent = 'Éteindre la caméra'; bCam.classList.remove('plein'); bPhoto.hidden = false; ligneCadrer.hidden = false;
        visage = null; rect = null; vu = performance.now(); etat = 'direct'; dire();
        if (caseCadrer.checked) chargerDetecteur().then(async d => { if (d) await regler('VIDEO'); else if (vivant && etat === 'direct') dire('Cadrage automatique indisponible (modèle non chargé) : cadrage fixe.'); });
        boucle(performance.now());
      } catch (e) {
        eteindre(); repli();
        dire(origine?.naturalWidth ? 'Caméra indisponible ou refusée : voici l’œuvre d’origine. Tu peux aussi choisir une photo.' : 'Caméra indisponible ou refusée. Tu peux choisir une photo.');
      }
      bCam.disabled = false;
    });
    bPhoto.addEventListener('click', () => {
      if (etat === 'direct') {   // on garde l'image entière et la place du visage : changer de composition recadre la photo
        const c = document.createElement('canvas'); c.width = video.videoWidth; c.height = video.videoHeight; c.getContext('2d').drawImage(video, 0, 0);
        source = { el: c, w: c.width, h: c.height, miroir: true, visage };
        cancelAnimationFrame(raf); raf = 0; bPhoto.textContent = 'Reprendre'; passer('fige'); ctx.annoncer?.('Photo prise.');
      } else if (flux) { bPhoto.textContent = 'Prendre la photo'; etat = 'direct'; rect = null; dire(); boucle(performance.now()); }
    });
    fichier.addEventListener('change', () => {
      const f = fichier.files[0]; if (!f) return;
      const u = URL.createObjectURL(f), im = new Image();
      im.onload = async () => {
        URL.revokeObjectURL(u); if (flux) eteindre();
        source = { el: im, w: im.naturalWidth, h: im.naturalHeight, miroir: false, visage: null }; passer('photo'); ligneCadrer.hidden = false;
        if (!caseCadrer.checked) return;
        dire('Recherche du visage…');                                         // on cherche aussi le visage sur la photo choisie
        const d = await chargerDetecteur();
        if (!vivant || source?.el !== im) return;
        if (d) { try { await regler('IMAGE'); source.visage = lireVisage(d.detect(im)); } catch (e) { console.warn(e); } }
        passer('photo'); if (!source.visage) dire(d ? 'Pas de visage trouvé sur cette photo : cadrage au centre.' : 'Cadrage automatique indisponible : cadrage au centre.');
      };
      im.onerror = () => { URL.revokeObjectURL(u); dire('Cette image ne s’ouvre pas. Essaie une photo JPG ou PNG.'); };
      im.src = u; fichier.value = '';
    });
    caseCadrer.addEventListener('change', () => {
      if (caseCadrer.checked && !detecteur) chargerDetecteur().then(d => d && etat === 'direct' && regler('VIDEO'));
      if (etat === 'photo' || etat === 'fige') refaireFixe();
    });
    phrase.addEventListener('input', () => { majOeuvres(); if (etat === 'oeuvre') passer('silhouette'); else peindre(); });
    q('[data-compo]').addEventListener('click', () => changerCompo(compo + 1));
    zone.querySelectorAll('[data-oeuvre-k]').forEach(b => b.addEventListener('click', () => {
      const o = OEUVRES[+b.dataset.oeuvreK]; phrase.value = o.phrase; changerCompo(COMPOSITIONS.findIndex(c => c.id === o.compo)); 
    }));
    bOeuvre.addEventListener('click', () => { if (flux) eteindre(); passer('oeuvre'); });
    /* Espace : composition suivante ; Maj + Espace : précédente. Dans le champ de texte, Espace écrit une espace. */
    function touche(e) {
      if (e.key !== ' ' || e.metaKey || e.ctrlKey || e.altKey) return;
      const el = e.target instanceof Element ? e.target : null;
      if (el?.closest('input,textarea,select')) return;
      if (el?.closest('button,label') && !zone.contains(el)) return;   // boutons de la page (Fermer…) : comportement normal
      // sur un bouton de l'atelier aussi, Espace change de composition (sinon il « recliquerait » le dernier bouton, ex. Reprendre)
      e.preventDefault(); changerCompo(compo + (e.shiftKey ? -1 : 1));
    }
    addEventListener('keydown', touche);

    formater(); majOeuvres(); passer('silhouette');
    if (origine) { origine.onload = () => { if (vivant && etat === 'silhouette') passer('oeuvre'); }; origine.src = ctx.racine + 'img/k/' + ref.f; }
    document.fonts.load(POLICE).then(() => { if (vivant && etat !== 'direct') peindre(); }).catch(() => {});

    return () => { vivant = false; eteindre(); removeEventListener('keydown', touche); detecteur?.close?.(); };
  },
};
