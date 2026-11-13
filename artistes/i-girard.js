// I · Alexander Girard — les soleils de La Fonda del Sol (1960).
// Un seul carré au centre : les 80 soleils y défilent vite ; ils s'arrêtent sur celui qu'on survole.
//
// Les soleils sont découpés dans l'image fournie par Eliott (img/i/ref.jpg, première image de l'artiste dans
// labo/donnees.js) : rien n'est redessiné en code, l'œuvre est encore protégée.
// CASES = le carré de chaque soleil, relevé le 13/11 sur l'image d'Eliott (1440 × 1108 px, 10 colonnes × 8 rangs,
// numérotés de 1 à 80 comme sur la planche). Si l'image est remplacée par une plus grande aux mêmes proportions, rien à changer.
// L'image est petite (un soleil = 110 px) : agrandi, c'est un peu flou. Une image plus grande arrangerait ça.
//
// Si l'image ne se charge pas : 80 soleils géométriques de remplacement, et l'atelier le dit à l'écran.

const IMAGE = [1440, 1108];
const CASES = [[102,56,108,108],[228,57,106,106],[355,56,106,108],[479,57,110,108],[601,60,111,103],[731,59,106,107],[855,57,108,108],[984,57,108,108],[1111,57,108,108],[1237,57,108,108],[101,183,108,108],[226,182,108,108],[349,182,114,107],[478,182,109,109],[601,182,110,109],[731,183,106,106],[856,183,107,107],[980,183,108,108],[1106,183,111,108],[1231,182,112,109],[100,306,109,108],[228,309,104,105],[352,307,108,108],[479,308,106,106],[604,308,108,109],[732,309,108,108],[856,309,106,107],[981,308,109,110],[1109,309,106,106],[1233,307,111,108],[100,433,108,108],[225,433,108,109],[351,433,108,109],[476,433,110,110],[603,433,109,110],[729,434,108,108],[857,435,107,109],[982,435,108,108],[1109,434,109,110],[1237,435,108,105],[101,561,108,108],[227,561,108,108],[352,560,108,108],[476,559,110,111],[604,560,109,108],[732,562,104,104],[858,561,108,108],[982,561,108,108],[1110,561,106,106],[1235,559,111,110],[97,684,109,111],[225,685,109,109],[354,687,103,106],[478,685,108,109],[607,687,103,105],[729,685,109,111],[856,685,109,110],[982,685,109,110],[1109,685,110,109],[1236,683,108,112],[101,814,108,108],[227,815,104,104],[351,813,109,112],[480,814,108,108],[603,813,112,112],[727,814,111,106],[858,814,108,108],[984,813,108,112],[1111,812,110,113],[1237,814,108,108],[101,940,108,108],[227,940,108,108],[353,940,108,108],[480,940,108,108],[606,940,108,108],[732,940,108,108],[858,940,108,108],[984,940,108,108],[1111,940,108,108],[1237,940,108,108]]; // [x, y, largeur, hauteur] en pixels de l'image
const CADENCE = 13; // soleils par seconde

// soleils de remplacement : un disque et des rayons, rien de plus
const TONS = ['#e6007e', '#f39200', '#ffd23f', '#e2231a', '#1d6fb8', '#111111', '#f6efe0', '#7a5aa6', '#009b77'];
function hasard(graine) { let s = graine * 2654435761 >>> 0; return () => ((s = Math.imul(s ^ s >>> 15, 2246822507) + 0x9e3779b9 >>> 0) / 4294967296); }
function remplacement(x, i, c) {
  const r = hasard(i + 7), fond = TONS[Math.floor(r() * TONS.length)]; let a = fond, b = fond;
  while (a === fond) a = TONS[Math.floor(r() * TONS.length)]; while (b === fond) b = TONS[Math.floor(r() * TONS.length)];
  const n = 8 + Math.floor(r() * 9) * 2, genre = Math.floor(r() * 4), R = c * (.17 + r() * .1), long = c * (.11 + r() * .12);
  x.fillStyle = fond; x.fillRect(0, 0, c, c); x.save(); x.translate(c / 2, c / 2); x.fillStyle = x.strokeStyle = b; x.lineWidth = c * .02;
  for (let k = 0; k < n; k++) {
    x.rotate(Math.PI * 2 / n);
    if (genre === 0) { x.beginPath(); x.moveTo(R * 1.08, -c * .03); x.lineTo(R * 1.1 + long, 0); x.lineTo(R * 1.08, c * .03); x.fill(); }
    else if (genre === 1) { x.beginPath(); x.moveTo(R * 1.15, 0); x.lineTo(R * 1.15 + long, 0); x.stroke(); }
    else if (genre === 2) { x.beginPath(); x.arc(R * 1.2 + long * .5, 0, c * .022, 0, 7); x.fill(); }
    else { x.beginPath(); x.ellipse(R * 1.1 + long * .5, 0, long * .5, c * .028, 0, 0, 7); x.fill(); }
  }
  x.fillStyle = a; x.beginPath(); x.arc(0, 0, R, 0, 7); x.fill(); x.restore();
}

export default {
  lettre: 'I',
  css: `
.gi{display:grid;grid-template-columns:auto minmax(150px,230px);gap:clamp(16px,3cqw,44px);justify-content:center;align-items:end;height:100cqh}
.gi-carre{width:min(92cqh,calc(100cqw - 280px));aspect-ratio:1;background:#111;box-shadow:0 26px 50px -30px rgba(0,0,0,.6);cursor:pointer;touch-action:manipulation}
.gi-carre canvas{display:block;width:100%;height:100%}
.gi-cote{display:grid;gap:14px;align-content:end;padding-bottom:4px}
.gi-cote p{margin:0}
.gi-num{font:900 clamp(44px,8cqw,84px)/.85 "Sofia Cond",Archivo,sans-serif}
.gi-planche{position:relative;width:100%;line-height:0}
.gi-planche img{width:100%;height:auto;display:block}
.gi-planche i{position:absolute;box-shadow:0 0 0 2px #fff,0 0 0 4px #111}
@media (max-width:760px){.gi{grid-template-columns:1fr;height:auto}.gi-carre{width:100%}.gi-planche{max-width:220px}}
`,
  monter(zone, ctx) {
    zone.innerHTML = `
      <div class="gi">
        <div class="gi-carre" tabindex="0" role="button" aria-label="Arrêter ou relancer les soleils"><canvas data-export aria-hidden="true"></canvas></div>
        <div class="gi-cote">
          <div class="gi-planche" hidden><img alt=""><i></i></div>
          <p class="gi-num" aria-live="off"></p>
          <p class="etiquette" aria-live="polite"></p>
          <p class="note">Pose la souris sur le carré : le défilé s’arrête sur un soleil. Retire-la : il repart. Au doigt ou avec Espace : arrêter, relancer.</p>
          <p class="note" data-provisoire hidden>L’image de la planche ne se charge pas : soleils de remplacement, ce ne sont pas ceux d’Alexander Girard.</p>
        </div>
      </div>`;
    const carre = zone.querySelector('.gi-carre'), cv = carre.querySelector('canvas'), x = cv.getContext('2d');
    const num = zone.querySelector('.gi-num'), info = zone.querySelector('.etiquette'), planche = zone.querySelector('.gi-planche'), repere = planche.querySelector('i');
    const N = CASES.length;
    let C = 0, dpr = 1, vivant = true, raf = 0, image = null, arret = false, dessus = false, i = 0, dernier = 0;
    const ordre = [...Array(N).keys()]; for (let k = N - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1)); [ordre[k], ordre[j]] = [ordre[j], ordre[k]]; }

    function caseDe(k) { // rectangle du soleil k dans l'image, en fractions
      const [cx, cy, cl, ch] = CASES[k]; return [cx / IMAGE[0], cy / IMAGE[1], cl / IMAGE[0], ch / IMAGE[1]];
    }
    function mesurer() { const r = carre.getBoundingClientRect(); if (!r.width) return; dpr = Math.min(devicePixelRatio || 1, 2); C = r.width; cv.width = cv.height = Math.round(C * dpr); dessiner(); }
    function dessiner() {
      if (!C) return; const k = ordre[i]; x.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (image) { const [fx, fy, fl, fh] = caseDe(k); x.imageSmoothingQuality = 'high'; x.drawImage(image, fx * image.naturalWidth, fy * image.naturalHeight, fl * image.naturalWidth, fh * image.naturalHeight, 0, 0, C, C); }
      else remplacement(x, k, C);
      num.textContent = String(k + 1).padStart(2, '0');
      if (image) { const [fx, fy, fl, fh] = caseDe(k); repere.style.cssText = `left:${fx * 100}%;top:${fy * 100}%;width:${fl * 100}%;height:${fh * 100}%`; }
    }
    function dire() { info.textContent = arret || dessus ? `Soleil ${ordre[i] + 1} sur ${N}` : `${N} soleils défilent`; }
    function tourner(t) {
      if (!vivant) return; raf = requestAnimationFrame(tourner);
      if (arret || dessus) return;
      const pas = ctx.reduireMouvement ? 900 : 1000 / CADENCE;
      if (t - dernier >= pas) { dernier = t; i = (i + 1) % N; dessiner(); }
    }
    carre.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') { dessus = true; dire(); } });
    carre.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') { dessus = false; arret = false; dire(); } });
    carre.addEventListener('click', e => { if (e.detail && dessus) { i = (i + 1) % N; dessiner(); dire(); return; } arret = !arret; dire(); }); // à la souris, un clic passe au soleil suivant
    function touche(e) {
      if (e.key !== ' ' || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.target instanceof Element && e.target.closest('input,textarea,select')) return;
      e.preventDefault(); arret = !arret; dire();
    }
    addEventListener('keydown', touche);
    const ref = ctx.artiste.images?.[0];
    if (ref) {
      const im = new Image();
      im.onload = () => { if (!vivant) return; image = im; planche.hidden = false; planche.querySelector('img').src = im.src; dessiner(); };
      im.onerror = () => { zone.querySelector('[data-provisoire]').hidden = false; };
      im.src = ctx.racine + 'img/i/' + ref.f;
    } else zone.querySelector('[data-provisoire]').hidden = false;
    const ro = new ResizeObserver(mesurer); ro.observe(carre);
    mesurer(); dire(); raf = requestAnimationFrame(tourner);
    return () => { vivant = false; cancelAnimationFrame(raf); ro.disconnect(); removeEventListener('keydown', touche); };
  },
};
