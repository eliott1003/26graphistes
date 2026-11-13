// P · Vincent Perrottet — affiches du Théâtre d'Angoulême (avec Anette Lenz).
// Trois couches imprimées l'une sur l'autre : une en cyan, une en magenta, une en jaune. Trois filtres rouge, vert, bleu
// à promener dessus : chaque filtre éteint deux couches et fait ressortir la troisième en noir
// (le rouge révèle le cyan, le vert le magenta, le bleu le jaune).
//
// Les affiches sont protégées : elles ne sont PAS redessinées en code.
// PROVISOIRE tant que les couches d'Eliott manquent : trois couches typographiques faites pour l'atelier
// (elles disent « une affiche / en cache / trois »), et l'atelier le dit à l'écran.
// Quand les couches arrivent : un PNG par couche, noir sur fond transparent, tous sur le même plan de travail ; les ranger
// dans img/p/ et donner leurs noms dans COUCHES, par exemple { c: 'couche-1.png', m: 'couche-2.png', j: 'couche-3.png' }.
// Le module les teinte lui-même en cyan, magenta et jaune.

const COUCHES = { c: 'theatre-c.png', m: 'theatre-m.png', j: 'theatre-j.png' }; // séparées par canal depuis la photo d'Eliott (img/p/ref.jpg). Autre jeu prêt : regret-c/m/j.png
const FORMAT = 2 / 3; // largeur / hauteur de la feuille (provisoire ; avec les fichiers d'Eliott, le format est celui des fichiers)
const ENCRES = { c: '#00aeef', m: '#ec008c', j: '#ffe600' };
const FILTRES = [
  { id: 'r', coul: '#ff0000', nom: 'rouge', lit: 'c', x: .3, y: .24 },
  { id: 'v', coul: '#00e000', nom: 'vert', lit: 'm', x: .7, y: .5 },
  { id: 'b', coul: '#0000ff', nom: 'bleu', lit: 'j', x: .32, y: .78 },
];
const charger = src => new Promise((ok, non) => { const im = new Image(); im.onload = () => ok(im); im.onerror = non; im.src = src; });
const GRAS = '900 100px "Sofia Cond", Anton, Impact, sans-serif';

// les trois couches provisoires, dessinées en noir sur transparent, comme le seront les fichiers d'Eliott
function couchesProvisoires(w, h) {
  const faire = dessin => { const t = document.createElement('canvas'); t.width = w; t.height = h; const g = t.getContext('2d'); g.fillStyle = g.strokeStyle = '#000'; g.textBaseline = 'alphabetic'; dessin(g); return t; };
  const mot = (g, texte, x, y, larg, angle = 0) => { g.save(); g.translate(x, y); g.rotate(angle); g.font = GRAS; const k = larg / g.measureText(texte).width; g.font = GRAS.replace('100px', 100 * k + 'px'); g.fillText(texte, 0, 0); g.restore(); return 100 * k; };
  return {
    c: faire(g => { // cyan : « UNE AFFICHE », et une cible
      mot(g, 'UNE', w * .06, h * .3, w * .62); mot(g, 'AFFICHE', w * .06, h * .52, w * .88);
      g.lineWidth = w * .035; for (let r = 1; r <= 4; r++) { g.beginPath(); g.arc(w * .68, h * .76, w * .075 * r, 0, 7); g.stroke(); }
      g.font = '600 ' + w * .03 + 'px Archivo, sans-serif'; g.fillText('lue à travers le filtre rouge', w * .06, h * .56);
    }),
    m: faire(g => { // magenta : « EN CACHE », en travers, et des rayures
      mot(g, 'EN CACHE', w * .16, h * .94, h * .82, -Math.PI / 2);
      g.save(); g.beginPath(); g.rect(w * .4, h * .1, w * .54, h * .5); g.clip(); g.lineWidth = w * .03;
      for (let i = -12; i < 24; i++) { g.beginPath(); g.moveTo(w * .4 + i * w * .075, h * .1); g.lineTo(w * .4 + i * w * .075 - h * .5, h * .6); g.stroke(); } g.restore();
      g.font = '600 ' + w * .03 + 'px Archivo, sans-serif'; g.fillText('lue à travers le filtre vert', w * .4, h * .65);
    }),
    j: faire(g => { // jaune : « TROIS », et une trame de points
      mot(g, 'TROIS', w * .08, h * .93, w * .84);
      for (let i = 0; i < 9; i++) for (let k = 0; k < 9; k++) { g.beginPath(); g.arc(w * (.1 + i * .1), h * (.08 + k * .067), w * (.012 + .028 * ((i + k) % 5) / 4), 0, 7); g.fill(); }
      g.font = '600 ' + w * .03 + 'px Archivo, sans-serif'; g.fillText('lue à travers le filtre bleu', w * .08, h * .73);
    }),
  };
}

export default {
  lettre: 'P',
  css: `
.pt{display:grid;grid-template-columns:minmax(0,1fr) minmax(170px,230px);gap:clamp(14px,2.4cqw,36px);align-items:end;height:100cqh}
.pt-scene{height:100cqh;min-width:0;background:#efede8;box-shadow:0 26px 50px -30px rgba(0,0,0,.6)}
.pt-scene canvas{display:block;width:100%;height:100%;touch-action:none;cursor:grab}
.pt-scene canvas.tenu{cursor:grabbing}
.pt-cote{display:grid;gap:12px;align-content:end;padding-bottom:4px}
.pt-cote p{margin:0}
.pt-compte{font:900 clamp(34px,5.6cqw,62px)/.88 "Sofia Cond",Archivo,sans-serif;text-transform:uppercase}
.pt-boutons{display:flex;flex-wrap:wrap;gap:8px}
@media (max-width:760px){.pt{grid-template-columns:1fr;height:auto}.pt-scene{height:auto;aspect-ratio:4/5}}
`,
  monter(zone, ctx) {
    zone.innerHTML = `
      <div class="pt">
        <div class="pt-scene"><canvas data-export aria-label="Une affiche en trois couches de couleur et trois filtres rouge, vert, bleu à déplacer dessus"></canvas></div>
        <div class="pt-cote">
          <p class="pt-compte" aria-hidden="true"></p>
          <p class="etiquette" aria-live="polite"></p>
          <p class="note">Attrape un filtre et promène-le sur l’affiche. Chaque couleur éteint deux couches et fait ressortir la troisième en noir.</p>
          <p class="note" data-provisoire>Version provisoire : ces trois couches sont faites pour l’atelier, ce n’est pas une affiche de Vincent Perrottet. L’atelier prendra ses couches dès qu’Eliott les aura préparées.</p>
          <div class="pt-boutons">
            <button type="button" class="bouton plein" data-ranger>Ranger les filtres</button>
            <button type="button" class="bouton" data-seul aria-pressed="false">Voir une couche seule</button>
          </div>
        </div>
      </div>`;
    const scene = zone.querySelector('.pt-scene'), cv = scene.querySelector('canvas'), x = cv.getContext('2d');
    const compte = zone.querySelector('.pt-compte'), info = zone.querySelector('.etiquette'), bSeul = zone.querySelector('[data-seul]');
    let W = 0, H = 0, dpr = 1, vivant = true, raf = 0, fx = 0, fy = 0, fw = 0, fh = 0, rayon = 0, format = FORMAT;
    let sources = null, teintes = null, prise = null, seule = -1, dernier = null;
    const filtres = FILTRES.map(f => ({ ...f, px: f.x, py: f.y })); // place en fractions de la feuille
    let ordre = filtres.slice();

    function teinter() { // chaque couche noire est remplie de son encre
      const src = sources || couchesProvisoires(fw, fh); teintes = {};
      for (const k of ['c', 'm', 'j']) {
        const t = document.createElement('canvas'); t.width = fw; t.height = fh; const g = t.getContext('2d');
        g.drawImage(src[k], 0, 0, fw, fh); g.globalCompositeOperation = 'source-in'; g.fillStyle = ENCRES[k]; g.fillRect(0, 0, fw, fh); teintes[k] = t;
      }
    }
    function mesurer() {
      const r = scene.getBoundingClientRect(); if (!r.width || !r.height) return;
      dpr = Math.min(devicePixelRatio || 1, 2); W = cv.width = Math.round(r.width * dpr); H = cv.height = Math.round(r.height * dpr);
      fh = Math.round(Math.min(H * .94, W * .9 / format)); fw = Math.round(fh * format); fx = Math.round((W - fw) / 2); fy = Math.round((H - fh) / 2); rayon = fw * .27;
      teinter(); dessiner();
    }
    const centre = f => [fx + f.px * fw, fy + f.py * fh];
    function dire() {
      const f = dernier;
      compte.textContent = seule >= 0 ? ['Cyan', 'Magenta', 'Jaune'][seule] : f ? f.nom : 'R V B';
      info.textContent = seule >= 0 ? 'Une seule couche, telle qu’elle est imprimée.' : f ? `Le filtre ${f.nom} fait ressortir la couche ${{ c: 'cyan', m: 'magenta', j: 'jaune' }[f.lit]} et éteint les deux autres.` : 'Trois couches l’une sur l’autre : presque illisible sans filtre.';
    }
    function dessiner() {
      if (!W || !teintes) return;
      x.globalCompositeOperation = 'source-over'; x.fillStyle = '#efede8'; x.fillRect(0, 0, W, H);
      x.save(); x.shadowColor = 'rgba(0,0,0,.28)'; x.shadowBlur = fw * .04; x.shadowOffsetY = fw * .015; x.fillStyle = '#fff'; x.fillRect(fx, fy, fw, fh); x.restore();
      x.globalCompositeOperation = 'multiply';
      ['c', 'm', 'j'].forEach((k, i) => { if (seule < 0 || seule === i) x.drawImage(teintes[k], fx, fy); });
      if (seule < 0) for (const f of ordre) { const [cx, cy] = centre(f); x.beginPath(); x.arc(cx, cy, rayon, 0, 7); x.fillStyle = f.coul; x.fill(); }
      x.globalCompositeOperation = 'source-over';
      if (seule < 0) for (const f of ordre) { const [cx, cy] = centre(f); x.beginPath(); x.arc(cx, cy, rayon, 0, 7); x.lineWidth = Math.max(1.5, dpr * 1.2); x.strokeStyle = 'rgba(0,0,0,.55)'; x.stroke(); }
    }
    const point = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height]; };
    const sous = (X, Y) => { for (let i = ordre.length - 1; i >= 0; i--) { const [cx, cy] = centre(ordre[i]); if (Math.hypot(X - cx, Y - cy) <= rayon) return ordre[i]; } return null; };
    cv.addEventListener('pointerdown', e => {
      if (seule >= 0) return; const [X, Y] = point(e), f = sous(X, Y); if (!f) return;
      e.preventDefault(); const [cx, cy] = centre(f); prise = { f, dx: X - cx, dy: Y - cy }; ordre = ordre.filter(o => o !== f).concat(f); dernier = f;
      cv.setPointerCapture(e.pointerId); cv.classList.add('tenu'); dire(); dessiner();
    });
    cv.addEventListener('pointermove', e => {
      if (!prise) return; const [X, Y] = point(e);
      prise.f.px = Math.max(-.35, Math.min(1.35, (X - prise.dx - fx) / fw)); prise.f.py = Math.max(-.1, Math.min(1.1, (Y - prise.dy - fy) / fh));
      if (!raf) raf = requestAnimationFrame(() => { raf = 0; if (vivant) dessiner(); });
    });
    const lacher = () => { prise = null; cv.classList.remove('tenu'); }; cv.addEventListener('pointerup', lacher); cv.addEventListener('pointercancel', lacher);
    zone.querySelector('[data-ranger]').addEventListener('click', () => { filtres.forEach((f, i) => { f.px = FILTRES[i].x; f.py = FILTRES[i].y; }); ordre = filtres.slice(); dernier = null; seule = -1; bSeul.setAttribute('aria-pressed', 'false'); bSeul.textContent = 'Voir une couche seule'; dire(); dessiner(); });
    bSeul.addEventListener('click', () => { // cyan, magenta, jaune, puis retour aux trois
      seule = seule >= 2 ? -1 : seule + 1; bSeul.setAttribute('aria-pressed', seule >= 0); bSeul.textContent = seule < 0 ? 'Voir une couche seule' : seule === 2 ? 'Revoir les trois couches' : 'Couche suivante'; dire(); dessiner();
    });

    if (COUCHES) {
      zone.querySelector('[data-provisoire]').hidden = true;
      Promise.all(['c', 'm', 'j'].map(k => charger(`${ctx.racine}img/p/${COUCHES[k]}`))).then(([c, m, j]) => { if (!vivant) return; sources = { c, m, j }; format = c.naturalWidth / c.naturalHeight; mesurer(); })
        .catch(() => { if (!vivant) return; console.warn('Perrottet : couches introuvables, couches provisoires'); zone.querySelector('[data-provisoire]').hidden = false; });
    }
    const ro = new ResizeObserver(mesurer); ro.observe(scene);
    mesurer(); dire();
    document.fonts?.load('900 100px "Sofia Cond"').then(() => { if (vivant) mesurer(); });
    return () => { vivant = false; cancelAnimationFrame(raf); ro.disconnect(); };
  },
};
