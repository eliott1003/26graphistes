// G · Franco Grignani — Today's Italian Publicity and Graphic Design (1967).
// Une bande de l'affiche est libre : elle suit la souris et ce qu'elle contient glisse. Un clic la pose, et on continue avec une autre.
// La bande est découpée dans l'image même de l'affiche (img/g/ref.jpg, déclarée dans labo/donnees.js : images: [{ f: 'ref.jpg', t: '…' }]).
// PROVISOIRE tant que l'image n'est pas fournie par Eliott : l'atelier tourne sur des rayures neutres, qui ne sont PAS l'affiche de Grignani.
// L'affiche n'est pas redessinée en code (œuvre protégée) : la fidélité vient de l'image d'Eliott.

const RATIO_PROVISOIRE = 0.7;          // largeur / hauteur, en attendant l'image
const NOIR = '#0c0c0c', BLANC = '#f4f2ec';
const GLISSE = 0.6;                    // de combien le contenu glisse quand la souris traverse l'affiche (1 = toute la largeur)
const mod = (n, m) => ((n % m) + m) % m;

export default {
  lettre: 'G',
  css: `
.gr{display:grid;grid-template-columns:auto minmax(180px,260px);gap:clamp(16px,3cqw,44px);justify-content:center;align-items:end;height:100cqh}
.gr-affiche{height:min(100cqh,calc((100cqw - 310px)/var(--gr-r,.7)));aspect-ratio:var(--gr-r,.7);cursor:crosshair;touch-action:none;box-shadow:0 0 0 1px rgba(255,255,255,.28),0 26px 50px -30px rgba(0,0,0,.8)}
.gr-affiche canvas{display:block;width:100%;height:100%}
.gr-cote{display:grid;gap:14px;align-content:end;padding-bottom:4px}
.gr-cote p{margin:0}
.gr-reglage{display:grid;gap:6px;font:600 13px/1.3 Archivo,sans-serif}
.gr-reglage input{accent-color:#fff;width:100%}
.gr-boutons{display:flex;flex-wrap:wrap;gap:8px}
.gr-prov{border-left:3px solid currentColor;padding-left:10px}
@media (max-width:760px){.gr{grid-template-columns:1fr;height:auto}.gr-affiche{height:auto;width:min(100%,calc(64svh*var(--gr-r,.7)));justify-self:center}}
`,
  monter(zone, ctx) {
    const ref = ctx.artiste.images?.[0];
    zone.innerHTML = `
      <div class="gr">
        <div class="gr-affiche"><canvas data-export aria-label="L’affiche, avec une bande qui suit la souris"></canvas></div>
        <div class="gr-cote">
          <p class="etiquette" aria-live="polite"></p>
          <p class="note">Promène la souris sur l’affiche : une bande se détache et tout ce qu’elle contient glisse. Clique pour la poser, puis continue avec une autre.</p>
          <label class="gr-reglage">Épaisseur de la bande <input type="range" min="0.03" max="0.45" step="0.005" value="0.14"></label>
          <div class="gr-boutons">
            <button type="button" class="bouton" data-sens aria-pressed="false">Bande verticale</button>
            <button type="button" class="bouton" data-annuler>Retirer la dernière</button>
            <button type="button" class="bouton" data-vider>Tout remettre</button>
          </div>
          <p class="note gr-prov" hidden>Version provisoire : rayures neutres, en attendant l’image de l’affiche.</p>
        </div>
      </div>`;
    const affiche = zone.querySelector('.gr-affiche'), cv = affiche.querySelector('canvas'), x = cv.getContext('2d');
    const info = zone.querySelector('.etiquette'), epais = zone.querySelector('input[type=range]'), bSens = zone.querySelector('[data-sens]');
    const base = document.createElement('canvas'), pose = document.createElement('canvas'), tmp = document.createElement('canvas');
    let W = 0, H = 0, ratio = RATIO_PROVISOIRE, image = null, vertical = false, raf = 0, vivant = true;
    const posees = [];                                             // les bandes déjà posées, dans l'ordre
    let libre = { v: false, c: .38, e: +epais.value, d: 1 / 32 };  // la bande qui suit la souris (tout en fractions de l'affiche)

    /* le fond : l'image d'Eliott, ou des rayures neutres en attendant */
    function fond() {
      const b = base.getContext('2d');
      if (image) { b.drawImage(image, 0, 0, W, H); return; }
      const k = 16, m = 12, px = W / k;                            // rayures en biais, raccord sur les quatre bords
      b.fillStyle = BLANC; b.fillRect(0, 0, W, H); b.fillStyle = NOIR;
      for (let n = 0; n <= k + m; n++) { b.beginPath(); b.moveTo(n * px, 0); b.lineTo((n + .5) * px, 0); b.lineTo((n + .5 - m) * px, H); b.lineTo((n - m) * px, H); b.fill(); }
    }
    /* dessine dans dst la bande b, prise dans src et décalée (elle ressort de l'autre côté) */
    function bande(dst, src, b) {
      const e = b.e * W;
      dst.save(); dst.beginPath();
      if (!b.v) {
        const y0 = Math.max(0, Math.round(b.c * H - e / 2)), y1 = Math.min(H, Math.round(b.c * H + e / 2)), h = y1 - y0, d = Math.round(mod(b.d * W, W));
        if (h > 0) { dst.rect(0, y0, W, h); dst.clip(); dst.drawImage(src, 0, y0, W, h, d, y0, W, h); dst.drawImage(src, 0, y0, W, h, d - W, y0, W, h); }
      } else {
        const x0 = Math.max(0, Math.round(b.c * W - e / 2)), x1 = Math.min(W, Math.round(b.c * W + e / 2)), w = x1 - x0, d = Math.round(mod(b.d * H, H));
        if (w > 0) { dst.rect(x0, 0, w, H); dst.clip(); dst.drawImage(src, x0, 0, w, H, x0, d, w, H); dst.drawImage(src, x0, 0, w, H, x0, d - H, w, H); }
      }
      dst.restore();
    }
    function poser(b) { tmp.getContext('2d').drawImage(pose, 0, 0); bande(pose.getContext('2d'), tmp, b); }
    function refaire() { pose.getContext('2d').drawImage(base, 0, 0); posees.forEach(poser); peindre(); }
    function peindre() { if (!W) return; x.drawImage(pose, 0, 0); if (libre) bande(x, pose, libre); }
    function demander() { if (!raf) raf = requestAnimationFrame(() => { raf = 0; if (vivant) peindre(); }); }
    function dire() {
      const n = posees.length;
      info.textContent = n ? `${n} bande${n > 1 ? 's' : ''} posée${n > 1 ? 's' : ''}` : 'Une bande libre. Clique pour la poser.';
    }
    function mesurer() {
      const r = affiche.getBoundingClientRect(); if (!r.width) return;
      const dpr = Math.min(devicePixelRatio || 1, 2), w = Math.round(r.width * dpr), h = Math.round(r.height * dpr);
      if (w === W && h === H) return; W = w; H = h;
      [cv, base, pose, tmp].forEach(c => { c.width = W; c.height = H; });
      fond(); refaire();
    }
    function suivre(e) {
      const r = affiche.getBoundingClientRect(), fx = (e.clientX - r.left) / r.width, fy = (e.clientY - r.top) / r.height;
      libre = vertical ? { v: true, c: fx, e: +epais.value, d: (fy - .5) * GLISSE } : { v: false, c: fy, e: +epais.value, d: (fx - .5) * GLISSE };
      demander();
    }
    function fixer() { if (!libre) return; posees.push({ ...libre }); poser(libre); dire(); ctx.annoncer?.('Bande posée.'); demander(); }

    affiche.addEventListener('pointermove', suivre);
    affiche.addEventListener('pointerdown', e => { affiche.setPointerCapture?.(e.pointerId); suivre(e); });
    affiche.addEventListener('pointerup', e => { suivre(e); fixer(); });
    epais.addEventListener('input', () => { if (libre) libre.e = +epais.value; demander(); });
    bSens.addEventListener('click', () => {
      vertical = !vertical; bSens.setAttribute('aria-pressed', vertical); bSens.textContent = vertical ? 'Bande horizontale' : 'Bande verticale';
      libre = { v: vertical, c: vertical ? .5 : .38, e: +epais.value, d: 1 / 32 }; demander();
    });
    zone.querySelector('[data-annuler]').addEventListener('click', () => { posees.pop(); refaire(); dire(); });
    zone.querySelector('[data-vider]').addEventListener('click', () => { posees.length = 0; refaire(); dire(); });

    affiche.style.setProperty('--gr-r', ratio);
    if (ref) {
      const im = new Image();
      im.onload = () => { if (!vivant) return; image = im; ratio = im.naturalWidth / im.naturalHeight; affiche.style.setProperty('--gr-r', ratio.toFixed(4)); W = 0; libre.d = .12; mesurer(); };
      im.onerror = () => { zone.querySelector('.gr-prov').hidden = false; };
      im.src = `${ctx.racine}img/g/${ref.f}`;
    } else zone.querySelector('.gr-prov').hidden = false;

    const ro = new ResizeObserver(mesurer); ro.observe(affiche);
    mesurer(); dire();
    return () => { vivant = false; cancelAnimationFrame(raf); ro.disconnect(); };
  },
};
