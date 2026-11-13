// A · Adrian Frutiger — le Frutiger, dessiné pour la signalétique de Roissy-Charles-de-Gaulle.
// L'atelier reprend l'affiche-spécimen choisie par Eliott (img/a/ref.png, 600 × 957 px), même composition, sans l'avion en
// lettres du bas. Toute l'affiche est doublée d'un remplissage de texte, invisible. Une silhouette d'avion sert de fenêtre :
// dans la silhouette on voit le texte, autour on voit l'affiche. On attrape l'avion et on le promène ; il s'oriente dans le
// sens où il va. « Faire voler l'avion » lui fait faire un tour de l'affiche.

const L0 = 600, H0 = 957;
const EFFACER = [[250, 636, 600, 957], [0, 776, 250, 957]]; // l'avion en lettres de l'affiche, retiré (px de l'image)
const DEPART = { x: 430, y: 790, a: Math.PI / 4 };           // l'avion au repos : à la place de l'ancien, nez vers le haut à droite
const ECHELLE = 1.55;                                          // taille de la silhouette (1 = 200 px d'envergure)
const CORPS = 8.5, INTERLIGNE = 9.6;                          // le texte de remplissage, à la taille du texte de l'affiche
const TEXTE = 'In 1968 the new Paris airport at Roissy asked Adrian Frutiger for an alphabet for its signs. It had to be read from far away, at an angle, in a hurry, by people walking with a suitcase. He started from his Univers and opened it up: wider counters, a slight slant in the strokes, endings cut straight. The letters were tested on panels, at a distance, half blurred, until each one could not be mistaken for another. The airport opened in 1974 with these signs. Two years later the alphabet was released as a typeface and given his name: Frutiger. It is now found in hospitals, train stations, road signs and on thousands of logos. Clear before being beautiful, made to guide people. ';
const charger = src => new Promise((ok, non) => { const im = new Image(); im.onload = () => ok(im); im.onerror = non; im.src = src; });

// la silhouette : un avion de ligne vu de dessus, nez vers le haut, centré sur (0, 0) ; demi-contour, l'autre moitié en miroir
const DEMI = [[0, -100], [7, -94], [11, -82], [11, -28], [96, 14], [96, 28], [11, 8], [11, 58], [38, 78], [38, 88], [4, 82], [0, 92]];
function trace(g, x, y, a, k) {
  const pts = [...DEMI, ...DEMI.slice(1, -1).reverse().map(([u, v]) => [-u, v])];
  g.beginPath();
  pts.forEach(([u, v], i) => { const c = Math.cos(a), s = Math.sin(a), px = x + (u * c - v * s) * k, py = y + (u * s + v * c) * k; i ? g.lineTo(px, py) : g.moveTo(px, py); });
  g.closePath();
}

export default {
  lettre: 'A',
  css: `
.fg{display:grid;grid-template-columns:minmax(0,1fr) minmax(170px,230px);gap:clamp(14px,2.4cqw,36px);align-items:end;height:100cqh}
.fg-scene{height:100cqh;min-width:0;display:grid;place-items:center}
.fg-scene canvas{display:block;height:min(100cqh,calc((100cqw - 270px)*${H0 / L0}));aspect-ratio:${L0}/${H0};max-width:100%;touch-action:none;background:#fff;box-shadow:0 26px 50px -30px rgba(0,0,0,.6)}
.fg-scene canvas.prise{cursor:grab}
.fg-scene canvas.tenu{cursor:grabbing}
.fg-cote{display:grid;gap:12px;align-content:end;padding-bottom:4px}
.fg-cote p{margin:0}
.fg-boutons{display:flex;flex-wrap:wrap;gap:8px}
@media (max-width:760px){.fg{grid-template-columns:1fr;height:auto}.fg-scene{height:auto}.fg-scene canvas{height:auto;width:100%}}
`,
  monter(zone, ctx) {
    zone.innerHTML = `
      <div class="fg">
        <div class="fg-scene"><canvas data-export width="${L0 * 2}" height="${H0 * 2}" aria-label="Le spécimen du Frutiger. Une silhouette d’avion laisse voir le texte caché sous l’affiche."></canvas></div>
        <div class="fg-cote">
          <p class="etiquette" aria-live="polite">Attrape l’avion et promène-le sur l’affiche : à travers lui, on lit le texte caché dessous.</p>
          <div class="fg-boutons">
            <button type="button" class="bouton plein" data-voler>Faire voler l’avion</button>
            <button type="button" class="bouton" data-poser>Reposer l’avion</button>
          </div>
        </div>
      </div>`;
    const cv = zone.querySelector('canvas'), x = cv.getContext('2d'), K = 2;
    const info = zone.querySelector('.etiquette');
    const REPOS = 'Attrape l’avion et promène-le sur l’affiche : à travers lui, on lit le texte caché dessous.';
    let source = null, fond = null, texte = null, vivant = true, raf = 0, vol = null, tenu = null;
    const avion = { ...DEPART };

    function preparer() {
      // l'affiche sans l'avion en lettres
      fond = document.createElement('canvas'); fond.width = L0 * K; fond.height = H0 * K; const f = fond.getContext('2d');
      f.scale(K, K); f.drawImage(source, 0, 0, L0, H0); f.fillStyle = '#fff'; EFFACER.forEach(([a, b, c, d]) => f.fillRect(a, b, c - a, d - b));
      // le remplissage : le texte sur toute l'affiche, ligne après ligne
      texte = document.createElement('canvas'); texte.width = L0 * K; texte.height = H0 * K; const t = texte.getContext('2d');
      t.scale(K, K); t.fillStyle = '#fff'; t.fillRect(0, 0, L0, H0); t.fillStyle = '#111';
      t.font = `600 ${CORPS}px Frutiger, "Frutiger LT Std", "Source Sans 3", "Source Sans Pro", Myriad, "Helvetica Neue", Arial, sans-serif`; t.textBaseline = 'alphabetic';
      const mots = TEXTE.trim().split(' '); let i = 0;
      for (let y = INTERLIGNE; y < H0 + INTERLIGNE; y += INTERLIGNE) {
        let ligne = '';
        while (t.measureText(ligne + mots[i % mots.length] + ' ').width < L0 - 8) { ligne += mots[i % mots.length] + ' '; i++; }
        t.fillText(ligne, 4, y);
      }
    }
    function dessiner() {
      x.setTransform(1, 0, 0, 1, 0, 0); x.fillStyle = '#fff'; x.fillRect(0, 0, cv.width, cv.height);
      if (!fond) return;
      x.drawImage(fond, 0, 0);
      x.save(); x.scale(K, K);
      if (tenu || vol) { x.save(); x.shadowColor = 'rgba(0,0,0,.28)'; x.shadowBlur = 16; x.shadowOffsetY = 8; trace(x, avion.x, avion.y, avion.a, ECHELLE); x.fillStyle = '#fff'; x.fill(); x.restore(); }
      trace(x, avion.x, avion.y, avion.a, ECHELLE); x.clip();
      x.drawImage(texte, 0, 0, L0, H0);
      x.restore();
    }
    const point = e => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * L0 / r.width, y: (e.clientY - r.top) * H0 / r.height }; };
    const dedans = p => { x.save(); x.setTransform(1, 0, 0, 1, 0, 0); trace(x, avion.x * K, avion.y * K, avion.a, ECHELLE * K); const ok = x.isPointInPath(p.x * K, p.y * K); x.restore(); return ok; };
    const borne = (v, a, b) => Math.max(a, Math.min(b, v));
    function tourner(dx, dy, mou) { // le nez se tourne vers où va l'avion
      if (Math.hypot(dx, dy) < .5) return;
      const cible = Math.atan2(dy, dx) + Math.PI / 2; let d = cible - avion.a; d = Math.atan2(Math.sin(d), Math.cos(d)); avion.a += d * mou;
    }
    cv.addEventListener('pointerdown', e => {
      if (!fond) return; const p = point(e); if (!dedans(p)) return;
      e.preventDefault(); arreterVol(); tenu = { x: p.x - avion.x, y: p.y - avion.y }; cv.setPointerCapture(e.pointerId); cv.classList.add('tenu'); dessiner();
    });
    cv.addEventListener('pointermove', e => {
      if (!tenu) { if (fond) cv.classList.toggle('prise', dedans(point(e))); return; }
      const p = point(e), ax = avion.x, ay = avion.y;
      avion.x = borne(p.x - tenu.x, 0, L0); avion.y = borne(p.y - tenu.y, 0, H0);
      tourner(avion.x - ax, avion.y - ay, .25); dessiner();
    });
    const lacher = () => { if (!tenu) return; tenu = null; cv.classList.remove('tenu'); dessiner(); };
    cv.addEventListener('pointerup', lacher); cv.addEventListener('pointercancel', lacher);

    // le vol : une boucle sur toute l'affiche, puis retour au départ
    function arreterVol() { vol = null; cancelAnimationFrame(raf); raf = 0; }
    function voler() {
      const pts = [[avion.x, avion.y], [520, 560], [470, 230], [300, 120], [110, 260], [160, 520], [330, 640], [470, 460], [330, 300], [150, 420], [120, 760], [DEPART.x, DEPART.y]];
      vol = { pts, i: 0, t: performance.now() }; info.textContent = 'L’avion fait le tour de l’affiche : à travers lui, le texte défile.';
      const pas = t => {
        if (!vivant || !vol) return;
        let d = Math.min(60, t - vol.t) * .32; vol.t = t;
        while (d > 0 && vol.i < pts.length - 1) {
          const [a, b] = pts[vol.i + 1], dx = a - avion.x, dy = b - avion.y, l = Math.hypot(dx, dy);
          tourner(dx, dy, .08);
          if (l <= d) { avion.x = a; avion.y = b; vol.i++; d -= l; } else { avion.x += dx / l * d; avion.y += dy / l * d; d = 0; }
        }
        if (vol.i >= pts.length - 1) { // posé : il reprend son cap de départ
          let r = DEPART.a - avion.a; r = Math.atan2(Math.sin(r), Math.cos(r)); avion.a += r * .12;
          if (Math.abs(r) < .01) { avion.a = DEPART.a; vol = null; raf = 0; dessiner(); info.textContent = REPOS; return; }
        }
        dessiner(); raf = requestAnimationFrame(pas);
      };
      raf = requestAnimationFrame(pas);
    }
    zone.querySelector('[data-voler]').addEventListener('click', () => { if (!fond) return; arreterVol(); if (ctx.reduireMouvement) return; voler(); });
    zone.querySelector('[data-poser]').addEventListener('click', () => { arreterVol(); Object.assign(avion, DEPART); info.textContent = REPOS; dessiner(); });

    const im = ctx.artiste.images?.[0];
    const police = document.fonts?.load ? document.fonts.load(`600 ${CORPS}px "Source Sans 3"`).catch(() => {}) : Promise.resolve();
    Promise.all([charger(`${ctx.racine}img/a/${im ? im.f : 'ref.png'}`), police]).then(([i]) => { if (!vivant) return; source = i; preparer(); dessiner(); })
      .catch(() => { info.textContent = 'Le spécimen ne se charge pas (img/a/ref.png).'; });
    dessiner();
    return () => { vivant = false; arreterVol(); };
  },
};
