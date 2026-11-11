// K · Barbara Kruger — module artiste (modèle pour tous les autres).
// Le geste : une photo passe en noir et blanc, une phrase se colle dessus en bandeaux rouges.
// La webcam en direct est bloquée dans la page hébergée : on passe par « prendre ou choisir une photo ».

const L = 1080, H = 1350, ROUGE = '#e2001a';
const POLICE = 'italic 900 100px Jost, Futura, "Trebuchet MS", sans-serif';

const lettreSVG = `<svg viewBox="0 0 100 100" role="img" aria-label="K">
  <defs><pattern id="k-trame" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="4" fill="#1b1b1b"/><circle cx="2" cy="2" r="1.1" fill="#8c8c8c"/></pattern></defs>
  <rect width="100" height="100" fill="url(#k-trame)"/>
  <rect x="0" y="17" width="100" height="66" fill="${ROUGE}"/>
  <text x="49" y="80" text-anchor="middle" font-family="Jost, Futura, sans-serif" font-style="italic" font-weight="900" font-size="84" fill="#fff">K</text>
</svg>`;

const css = `
#atelier[data-artiste="k"]{box-shadow:inset 0 0 0 8px ${ROUGE}}
#atelier[data-artiste="k"] .a-barre{margin:8px 8px 0}
#atelier[data-artiste="k"] .a-nom{font-family:Jost,Futura,sans-serif;font-style:italic;font-weight:900;text-transform:uppercase;letter-spacing:0}
#atelier[data-artiste="k"] .a-geste h3{display:inline;background:${ROUGE};color:#fff;font-family:Jost,Futura,sans-serif;font-style:italic;font-weight:900;font-size:26px;line-height:1.38;padding:2px 8px;box-decoration-break:clone;-webkit-box-decoration-break:clone}
.kr{display:grid;gap:14px}
.kr-cadre{background:#000;max-width:440px;width:100%;aspect-ratio:${L}/${H}}
.kr-cadre img{width:100%;height:100%;display:block;-webkit-touch-callout:default}
.kr-commandes{display:grid;gap:10px;max-width:440px}
.kr label.etiquette{display:block}
.kr textarea{width:100%;min-height:74px;resize:vertical;padding:10px 12px;border:1.5px solid currentColor;border-radius:4px;background:transparent;font-size:18px;font-weight:600;line-height:1.25}
.kr-boutons{display:flex;flex-wrap:wrap;gap:8px}
.kr-boutons .bouton{flex:1 1 150px}
.kr input[type=file]{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}
.kr input[type=file]:focus-visible + label{outline:3px solid ${ROUGE};outline-offset:3px}
.kr .note{margin:0;font-size:13px;opacity:.75}
@media (min-width:900px){.kr{grid-template-columns:minmax(260px,400px) minmax(220px,1fr);align-items:start}}
`;

/* Image de départ : une silhouette, pour que l'atelier marche avant toute photo. */
function silhouette() {
  const c = document.createElement('canvas'); c.width = L; c.height = H; const x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, L, H); g.addColorStop(0, '#9a9a9a'); g.addColorStop(1, '#262626'); x.fillStyle = g; x.fillRect(0, 0, L, H);
  x.fillStyle = '#efefef';
  x.beginPath(); x.ellipse(L * .5, H * .42, L * .21, H * .2, 0, 0, Math.PI * 2); x.fill();
  x.beginPath(); x.moveTo(L * .04, H); x.bezierCurveTo(L * .08, H * .74, L * .3, H * .7, L * .5, H * .7); x.bezierCurveTo(L * .7, H * .7, L * .92, H * .74, L * .96, H); x.fill();
  x.globalCompositeOperation = 'multiply';
  const o = x.createLinearGradient(L * .3, 0, L * .85, 0); o.addColorStop(0, '#fff'); o.addColorStop(1, '#3a3a3a'); x.fillStyle = o; x.fillRect(0, 0, L, H);
  x.globalCompositeOperation = 'source-over';
  return c;
}
/* Recadrage plein cadre + noir et blanc contrasté + grain. */
function traiter(source, sw, sh) {
  const c = document.createElement('canvas'); c.width = L; c.height = H; const x = c.getContext('2d', { willReadFrequently: true });
  const e = Math.max(L / sw, H / sh), w = sw * e, h = sh * e;
  x.drawImage(source, (L - w) / 2, (H - h) / 2, w, h);
  const d = x.getImageData(0, 0, L, H), p = d.data;
  for (let i = 0; i < p.length; i += 4) {
    let v = .299 * p[i] + .587 * p[i + 1] + .114 * p[i + 2];
    v = (v - 128) * 1.5 + 128 + (Math.random() - .5) * 34;
    p[i] = p[i + 1] = p[i + 2] = v < 0 ? 0 : v > 255 ? 255 : v;
  }
  x.putImageData(d, 0, 0);
  return c;
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
function bandeau(x, texte, taille, y, align, marge) {
  x.font = POLICE.replace('100px', taille + 'px');
  const w = x.measureText(texte).width, px = taille * .26, hb = taille * 1.14, lb = w + px * 2;
  const gx = align === 'g' ? marge : align === 'd' ? L - marge - lb : (L - lb) / 2;
  x.fillStyle = ROUGE; x.fillRect(gx, y, lb, hb);
  x.fillStyle = '#fff'; x.textBaseline = 'alphabetic'; x.fillText(texte, gx + px, y + hb * .8);
  return hb;
}
function taillePour(x, texte, largeurMax, max) {
  x.font = POLICE; const w = x.measureText(texte).width || 1;
  return Math.max(28, Math.min(max, 100 * largeurMax / (w * 1.0 + 52)));
}
const COMPOSITIONS = [
  { nom: 'Haut et bas', dessiner(x, phrase) {
      const b = L * .028; x.strokeStyle = ROUGE; x.lineWidth = b * 2; x.strokeRect(0, 0, L, H);
      const m = couper(phrase, 2), marge = L * .085;
      m.forEach((t, i) => { const s = taillePour(x, t, L * .78, 150); bandeau(x, t, s, i === 0 ? H * .085 : H * .915 - s * 1.14, i === 0 ? 'g' : 'd', marge); });
  } },
  { nom: 'Empilée', dessiner(x, phrase) {
      const m = couper(phrase, 3), tailles = m.map(t => taillePour(x, t, L * .8, 190));
      const total = tailles.reduce((a, s) => a + s * 1.14 + 14, -14); let y = H * .56 - total / 2;
      m.forEach((t, i) => { y += bandeau(x, t, tailles[i], y, 'c', 0) + 14; });
  } },
  { nom: 'En escalier', dessiner(x, phrase) {
      const m = couper(phrase, 5), s = Math.min(...m.map(t => taillePour(x, t, L * .58, 118)));
      const pas = Math.min(s * 1.6, (H * .8) / m.length), dx = (L * .34) / Math.max(1, m.length - 1); let y = H * .5 - (pas * m.length) / 2 + pas * .2;
      m.forEach((t, i) => { bandeau(x, t, s, y, 'g', L * .06 + dx * i); y += pas; });
  } },
];

export default {
  lettre: 'K',
  lettreSVG,
  css,
  monter(zone, ctx) {
    zone.innerHTML = `
      <div class="kr">
        <div class="kr-cadre"><img id="kr-image" alt="Ton image : une photo en noir et blanc barrée de ta phrase en blanc sur rouge"></div>
        <div class="kr-commandes">
          <label class="etiquette" for="kr-phrase">Ta phrase</label>
          <textarea id="kr-phrase" maxlength="80" rows="2" autocomplete="off" spellcheck="false">Ton écran te regarde</textarea>
          <div class="kr-boutons">
            <input id="kr-photo" type="file" accept="image/*">
            <label class="bouton plein" for="kr-photo">Prendre ou choisir une photo</label>
            <button type="button" class="bouton" id="kr-compo">Changer la composition</button>
          </div>
          <p class="note">Ta photo reste sur ton appareil : rien n’est envoyé. Pour garder l’image, appuie longuement dessus (ou clic droit sur ordinateur).</p>
        </div>
      </div>`;
    const q = s => zone.querySelector(s);
    const image = q('#kr-image'), phrase = q('#kr-phrase'), photo = q('#kr-photo');
    const toile = document.createElement('canvas'); toile.width = L; toile.height = H; const x = toile.getContext('2d');
    let fondPhoto = traiter(silhouette(), L, H), compo = 0, url = null, vivant = true, attente = null;

    function rendre() {
      x.drawImage(fondPhoto, 0, 0);
      COMPOSITIONS[compo].dessiner(x, phrase.value || ' ');
      toile.toBlob(b => { if (!vivant || !b) return; const u = URL.createObjectURL(b); image.src = u; if (url) URL.revokeObjectURL(url); url = u; }, 'image/jpeg', .9);
    }
    const bientot = () => { clearTimeout(attente); attente = setTimeout(rendre, 140); };

    phrase.addEventListener('input', bientot);
    q('#kr-compo').addEventListener('click', () => { compo = (compo + 1) % COMPOSITIONS.length; ctx.annoncer('Composition : ' + COMPOSITIONS[compo].nom); rendre(); });
    photo.addEventListener('change', () => {
      const f = photo.files[0]; if (!f) return;
      const u = URL.createObjectURL(f), im = new Image();
      im.onload = () => { fondPhoto = traiter(im, im.naturalWidth, im.naturalHeight); URL.revokeObjectURL(u); rendre(); };
      im.onerror = () => { URL.revokeObjectURL(u); ctx.annoncer('Cette image ne s’ouvre pas. Essaie une photo JPG ou PNG.'); };
      im.src = u;
    });
    rendre();
    document.fonts.load(POLICE).then(() => vivant && rendre()).catch(() => {});

    return () => { vivant = false; clearTimeout(attente); if (url) URL.revokeObjectURL(url); };
  },
};
