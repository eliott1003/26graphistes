// L · Herbert Leupin — l'affiche Coca-Cola à la pancarte.
// Balancier : la pancarte pend à son fil. On l'attrape, on la tire ; au lâcher, le fil se retend, elle rebondit et se balance
// de moins en moins, jusqu'à s'arrêter.
//
// L'affiche est protégée (Herbert Leupin est mort en 1999) et porte une marque : elle n'est PAS redessinée en code.
// L'atelier anime les fichiers d'Eliott : l'affiche sans la pancarte (fond) et la pancarte détourée (PNG transparent).
// PROVISOIRE tant qu'ils manquent : une pancarte toute simple, dessinée en code, sans marque ; l'atelier le dit à l'écran.
// Quand les fichiers arrivent : les ranger dans img/l/ et remplir FICHIERS, par exemple
//   { fond: 'fond.jpg', pancarte: 'pancarte.png', clou: [.5, .12], largeur: .56, fil: .5, ficelles: false }
//   clou = le point d'accroche sur l'affiche (fractions de la largeur et de la hauteur) ; largeur = celle de la pancarte (fraction
//   de la largeur de l'affiche) ; fil = distance du clou au centre de la pancarte (fraction de la largeur) ; ficelles = les dessiner ou non.

const FICHIERS = { fond: 'fond.png', pancarte: 'pancarte.png', clou: [.482, .494], largeur: .425, fil: .171, ficelles: false };
const FORMAT = 905 / 1280; // affiche suisse (F4), pour la version provisoire
const DEFAUT = { clou: [.5, .1], largeur: .58, fil: .56, ficelles: true };
const PESANTEUR = 5.2, RAIDEUR = 300, AMORTI = 7, AIR = .35; // en largeurs d'affiche et en secondes
const charger = src => new Promise((ok, non) => { const im = new Image(); im.onload = () => ok(im); im.onerror = non; im.src = src; });

export default {
  lettre: 'L',
  css: `
.lp{display:grid;grid-template-columns:minmax(0,1fr) minmax(170px,230px);gap:clamp(14px,2.4cqw,36px);align-items:end;height:100cqh}
.lp-scene{min-width:0;height:100cqh;display:grid;place-items:center}
.lp-feuille{height:min(100cqh,calc((100cqw - 270px)/${FORMAT}));aspect-ratio:${FORMAT};box-shadow:0 26px 50px -30px rgba(0,0,0,.6)}
.lp-feuille canvas{display:block;width:100%;height:100%;touch-action:none;cursor:grab}
.lp-feuille canvas.tenu{cursor:grabbing}
.lp-cote{display:grid;gap:12px;align-content:end;padding-bottom:4px}
.lp-cote p{margin:0}
.lp-compte{font:900 clamp(40px,7cqw,76px)/.85 "Sofia Cond",Archivo,sans-serif}
.lp-boutons{display:flex;flex-wrap:wrap;gap:8px}
@media (max-width:760px){.lp{grid-template-columns:1fr;height:auto}.lp-scene{height:auto}.lp-feuille{height:auto;width:100%}}
`,
  monter(zone, ctx) {
    zone.innerHTML = `
      <div class="lp">
        <div class="lp-scene"><div class="lp-feuille"><canvas data-export aria-label="Une pancarte pendue à un fil : on la tire, elle rebondit et se balance"></canvas></div></div>
        <div class="lp-cote">
          <p class="lp-compte" aria-hidden="true">0°</p>
          <p class="etiquette" aria-live="polite"></p>
          <p class="note">Attrape la pancarte, tire-la sur le côté ou vers le bas, puis lâche.</p>
          <p class="note" data-provisoire>Version provisoire : cette pancarte est dessinée pour l’atelier, ce n’est pas l’affiche de Leupin. L’atelier animera la vraie dès qu’Eliott aura envoyé l’affiche et la pancarte détourée.</p>
          <div class="lp-boutons"><button type="button" class="bouton plein" data-pousser>Donner une poussée</button></div>
        </div>
      </div>`;
    const feuille = zone.querySelector('.lp-feuille'), cv = feuille.querySelector('canvas'), x = cv.getContext('2d');
    const compte = zone.querySelector('.lp-compte'), info = zone.querySelector('.etiquette');
    let R = { ...DEFAUT }, fond = null, pancarte = null, format = FORMAT;
    let W = 0, H = 0, dpr = 1, vivant = true, raf = 0, avant = 0, prise = null, tDire = 0;
    // tout est compté en largeurs d'affiche : g = le centre de la pancarte, v = sa vitesse
    const clou = () => ({ x: R.clou[0], y: R.clou[1] / format });
    let g = { x: 0, y: 0 }, v = { x: 0, y: 0 }, ang = 0;
    const repos = () => { const c = clou(); return { x: c.x, y: c.y + R.fil }; };
    const taille = () => { const l = R.largeur, h = pancarte ? l * pancarte.naturalHeight / pancarte.naturalWidth : l * .52; return [l, h]; };

    function mesurer() {
      const r = feuille.getBoundingClientRect(); if (!r.width) return;
      dpr = Math.min(devicePixelRatio || 1, 2); W = cv.width = Math.round(r.width * dpr); H = cv.height = Math.round(r.height * dpr); dessiner();
    }
    function dire(force) {
      const t = performance.now(); if (!force && t - tDire < 120) return; tDire = t;
      const d = Math.round(Math.abs(ang) * 180 / Math.PI); compte.textContent = d + '°';
      info.textContent = prise ? 'Tire… puis lâche.' : raf ? 'Elle se balance, de moins en moins.' : 'La pancarte pend à son fil, immobile.';
    }
    function dessiner() {
      if (!W) return;
      const c = clou(), [l, h] = taille();
      if (fond) x.drawImage(fond, 0, 0, W, H);
      else { x.fillStyle = '#f3e6c9'; x.fillRect(0, 0, W, H); x.fillStyle = 'rgba(0,0,0,.05)'; x.fillRect(0, H * .86, W, H * .14); }
      const haut = [[-l * .42, -h / 2], [l * .42, -h / 2]].map(([a, b]) => [g.x + a * Math.cos(ang) - b * Math.sin(ang), g.y + a * Math.sin(ang) + b * Math.cos(ang)]);
      // l'ombre de la pancarte sur le mur
      x.save(); x.translate((g.x + .03) * W, (g.y + .035) * W); x.rotate(ang); if (pancarte) { // silhouette noire préparée une fois (ctx.filter ne marche pas sur Safari iPhone : la pancarte se dédoublait)
        if (!pancarte.ombre) { const o = document.createElement('canvas'); o.width = pancarte.naturalWidth; o.height = pancarte.naturalHeight; const go = o.getContext('2d'); go.drawImage(pancarte, 0, 0); go.globalCompositeOperation = 'source-in'; go.fillStyle = '#000'; go.fillRect(0, 0, o.width, o.height); pancarte.ombre = o; }
        x.globalAlpha = .22; x.drawImage(pancarte.ombre, -l / 2 * W, -h / 2 * W, l * W, h * W); x.globalAlpha = 1; } // l'ombre suit la forme détourée
      else { x.fillStyle = 'rgba(0,0,0,.22)'; x.fillRect(-l / 2 * W, -h / 2 * W, l * W, h * W); } x.restore();
      if (R.ficelles) { // les deux ficelles et le clou
        x.strokeStyle = '#2a2018'; x.lineWidth = Math.max(1.5, W * .005); x.lineCap = 'round'; x.beginPath();
        haut.forEach(p => { x.moveTo(c.x * W, c.y * W); x.lineTo(p[0] * W, p[1] * W); }); x.stroke();
        x.fillStyle = '#2a2018'; x.beginPath(); x.arc(c.x * W, c.y * W, W * .014, 0, 7); x.fill();
      }
      x.save(); x.translate(g.x * W, g.y * W); x.rotate(ang);
      if (pancarte) x.drawImage(pancarte, -l / 2 * W, -h / 2 * W, l * W, h * W);
      else { // provisoire : un panneau rouge, un filet clair, deux mots
        x.fillStyle = '#c8102e'; x.fillRect(-l / 2 * W, -h / 2 * W, l * W, h * W);
        x.strokeStyle = '#f6e7c8'; x.lineWidth = W * .008; x.strokeRect((-l / 2 + .025) * W, (-h / 2 + .025) * W, (l - .05) * W, (h - .05) * W);
        x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = `900 ${h * W * .42}px Londrina, "Sofia Cond", sans-serif`; x.fillText('Tire-moi !', 0, h * W * .03);
      }
      x.restore();
    }
    function pas(dt) {
      const c = clou(), dx = g.x - c.x, dy = g.y - c.y, d = Math.hypot(dx, dy) || 1e-6, ux = dx / d, uy = dy / d;
      let ax = 0, ay = PESANTEUR;
      if (d > R.fil) { const vr = v.x * ux + v.y * uy, f = -RAIDEUR * (d - R.fil) - AMORTI * vr; ax += f * ux; ay += f * uy; } // le fil ne tire que tendu
      v.x += (ax - AIR * v.x) * dt; v.y += (ay - AIR * v.y) * dt; g.x += v.x * dt; g.y += v.y * dt;
      const cible = Math.atan2(-dx, dy); ang += (cible - ang) * Math.min(1, dt * 14); // la pancarte s'aligne sur son fil, avec un peu de retard
    }
    function boucle(t) {
      raf = 0; if (!vivant) return; const dt = Math.min(.033, (t - avant) / 1000 || .016); avant = t;
      if (!prise) { for (let i = 0; i < 4; i++) pas(dt / 4); }
      const r = repos(), calme = !prise && Math.hypot(v.x, v.y) < .004 && Math.hypot(g.x - r.x, g.y - r.y) < .002;
      if (calme) { g = r; v = { x: 0, y: 0 }; ang = 0; dessiner(); dire(true); return; }
      dessiner(); raf = requestAnimationFrame(boucle); dire();
    }
    const lancer = () => { if (!raf && vivant) { avant = performance.now(); raf = requestAnimationFrame(boucle); } };
    const point = e => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.width }; };
    cv.addEventListener('pointerdown', e => {
      const p = point(e), [l, h] = taille(), dx = p.x - g.x, dy = p.y - g.y, a = dx * Math.cos(-ang) - dy * Math.sin(-ang), b = dx * Math.sin(-ang) + dy * Math.cos(-ang);
      if (Math.abs(a) > l / 2 + .03 || Math.abs(b) > h / 2 + .03) return;
      e.preventDefault(); prise = { dx, dy, x: g.x, y: g.y, t: performance.now() }; v = { x: 0, y: 0 }; cv.setPointerCapture(e.pointerId); cv.classList.add('tenu'); lancer(); dire(true);
    });
    cv.addEventListener('pointermove', e => {
      if (!prise) return; const p = point(e), c = clou(), t = performance.now();
      let nx = p.x - prise.dx, ny = p.y - prise.dy; const d = Math.hypot(nx - c.x, ny - c.y), max = R.fil * 1.45; // le fil s'étire un peu, pas plus
      if (d > max) { nx = c.x + (nx - c.x) * max / d; ny = c.y + (ny - c.y) * max / d; }
      const dt = Math.max(.008, (t - prise.t) / 1000); v = { x: (nx - g.x) / dt * .5 + v.x * .5, y: (ny - g.y) / dt * .5 + v.y * .5 }; prise.t = t;
      g = { x: nx, y: ny }; ang += (Math.atan2(-(g.x - c.x), g.y - c.y) - ang) * .5;
    });
    const lacher = () => { if (!prise) return; prise = null; cv.classList.remove('tenu'); const n = Math.hypot(v.x, v.y); if (n > 3) { v.x *= 3 / n; v.y *= 3 / n; } lancer(); dire(true); };
    cv.addEventListener('pointerup', lacher); cv.addEventListener('pointercancel', lacher);
    zone.querySelector('[data-pousser]').addEventListener('click', () => { v.x += (Math.random() < .5 ? -1 : 1) * 1.5; v.y -= .35; lancer(); });

    if (FICHIERS) {
      R = { ...DEFAUT, ...FICHIERS }; zone.querySelector('[data-provisoire]').hidden = true;
      Promise.all([charger(`${ctx.racine}img/l/${FICHIERS.fond}`), charger(`${ctx.racine}img/l/${FICHIERS.pancarte}`)]).then(([a, b]) => {
        if (!vivant) return; fond = a; pancarte = b; format = a.naturalWidth / a.naturalHeight; feuille.style.aspectRatio = format; g = repos(); mesurer(); lancer();
      }).catch(() => { if (!vivant) return; console.warn('Leupin : fichiers introuvables, pancarte provisoire'); R = { ...DEFAUT }; zone.querySelector('[data-provisoire]').hidden = false; g = repos(); dessiner(); });
    }
    const ro = new ResizeObserver(mesurer); ro.observe(feuille);
    g = repos();
    if (!ctx.reduireMouvement) { const c = clou(), a = .3; g = { x: c.x + Math.sin(a) * R.fil, y: c.y + Math.cos(a) * R.fil }; ang = -a; } // à l'ouverture, elle se balance déjà un peu
    mesurer(); document.fonts?.load('900 40px Londrina').then(() => { if (vivant) dessiner(); });
    lancer(); dire(true);
    return () => { vivant = false; cancelAnimationFrame(raf); ro.disconnect(); };
  },
};
