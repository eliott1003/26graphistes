// M · Michael Bierut — identité Saks Fifth Avenue (Pentagram, 2007).
// Le logo (img/m/logo.png, fourni par Eliott) est découpé en 64 carrés. Chaque clic les mélange et les fait tourner,
// comme le système d'origine (Pentagram : « shuffled and rotated »). Un bouton remet le logo.
// « Mettre sur un sac » : la composition du moment est imprimée sur un sac de la boutique ; les sacs s'alignent
// dans une vitrine (jusqu'à 4, de tailles différentes, comme les quatre tailles de sacs Saks).
// Les sacs sont dessinés en code, de façon simple ; ce ne sont pas des photos des vrais sacs.
// Dans la vitrine, on attrape un sac (souris, ou pincer pouce et index à la webcam) : il pend à la main et se balance ;
// on lâche, il tombe. Si la caméra ou le modèle de la main ne se chargent pas, la souris reste.
const URL_MAINS = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

const LOGO = 'img/m/logo.png';
const N = 8, DUREE = 760, DECALAGE = 5, NOIR = '#000', MAX_SACS = 4;
const TAILLES = [1, .8, .64, .9]; // hauteur relative des sacs dans la vitrine

export default {
  lettre: 'M',
  css: `
.bi-tout{position:relative;height:100cqh}
.bi{display:grid;grid-template-columns:auto minmax(180px,236px);gap:clamp(16px,3cqw,44px);justify-content:center;align-items:end;height:100cqh}
.bi-cadre{position:relative;height:min(100cqh,calc(100cqw - 284px));aspect-ratio:1;background:${NOIR};cursor:pointer;touch-action:manipulation;box-shadow:0 0 0 1px rgba(255,255,255,.16)}
.bi-cadre canvas{display:block;width:100%;height:100%}
.bi-cote{display:grid;gap:clamp(8px,1.6cqh,14px);align-content:end;padding-bottom:2px}
.bi-compte{font:400 clamp(26px,5cqh,48px)/1 Bodoni,Didot,serif;margin:0}
.bi-cote p{margin:0}
.bi-boutons{display:flex;flex-wrap:wrap;gap:8px}
.bi-tout .bi-sac{min-height:50px;font-size:15.5px;width:100%}
.bi-voir{background:none;border:0;padding:0;color:inherit;font:600 13px/1.3 Archivo,sans-serif;text-decoration:underline;text-underline-offset:3px;cursor:pointer;justify-self:start}
.bi-voir[hidden]{display:none}
.bi-vitrine{position:absolute;inset:0;display:grid;grid-template-columns:minmax(0,1fr);grid-template-rows:minmax(0,1fr) auto;gap:12px;background:#0a0a0a}
.bi-vitrine[hidden]{display:none}
.bi-scene{position:relative;min-height:0}
.bi-vitrine canvas{display:block;width:100%;height:100%;min-height:0;touch-action:none;cursor:grab}
.bi-vitrine canvas.tient{cursor:grabbing}
.bi-scene video{position:absolute;right:10px;top:10px;width:clamp(110px,18cqw,190px);aspect-ratio:4/3;object-fit:cover;transform:scaleX(-1);border:1.5px solid rgba(255,255,255,.5);opacity:.85;pointer-events:none}
.bi-scene video[hidden]{display:none}
.bi-info{position:absolute;left:12px;top:10px;margin:0;font:600 12.5px/1.3 Archivo,sans-serif;color:rgba(255,255,255,.75)}
.bi-vitrine-bas{display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:space-between}
.bi-vitrine-bas p{margin:0}
@media (max-width:760px){.bi-tout{height:auto}.bi{grid-template-columns:1fr;height:auto}.bi-cadre{height:auto;width:100%}.bi-vitrine{position:fixed;z-index:50;padding:16px}}
`,
  monter(zone, ctx) {
    zone.innerHTML = `
      <div class="bi-tout"><div class="bi">
        <div class="bi-cadre" role="button" tabindex="0" aria-label="Mélanger les 64 carrés"><canvas data-export></canvas></div>
        <div class="bi-cote">
          <p class="bi-compte" aria-live="polite">Le logo</p>
          <p class="note">Clique sur le carré : les 64 morceaux se mélangent et tournent. Chaque image est un nouveau sac, et c’est toujours Saks.</p>
          <div class="bi-boutons">
            <button type="button" class="bouton" data-melanger>Mélanger</button>
            <button type="button" class="bouton" data-logo>Remettre le logo</button>
          </div>
          <p class="note">Une composition te plaît ?</p>
          <button type="button" class="bouton plein bi-sac" data-sac>Mettre sur un sac</button>
          <button type="button" class="bi-voir" data-voir hidden></button>
        </div></div>
        <div class="bi-vitrine" hidden>
          <div class="bi-scene"><canvas aria-label="La vitrine des sacs : attrape un sac et lâche-le"></canvas><video muted playsinline hidden></video><p class="bi-info" aria-live="polite"></p></div>
          <div class="bi-vitrine-bas">
            <p class="note">Attrape un sac et lâche-le. Les ${MAX_SACS} derniers sacs restent en vitrine.</p>
            <div class="bi-boutons">
              <button type="button" class="bouton" data-main aria-pressed="false">Attraper avec la main</button>
              <button type="button" class="bouton" data-vider>Vider la vitrine</button>
              <button type="button" class="bouton plein" data-retour>Retour aux carrés</button>
            </div>
          </div>
        </div>
      </div>`;
    const cadre = zone.querySelector('.bi-cadre'), cv = cadre.querySelector('canvas'), x = cv.getContext('2d');
    const compte = zone.querySelector('.bi-compte'), voir = zone.querySelector('[data-voir]');
    const vitrine = zone.querySelector('.bi-vitrine'), vc = vitrine.querySelector('canvas'), video = vitrine.querySelector('video'), info = vitrine.querySelector('.bi-info'), bMain = vitrine.querySelector('[data-main]');
    const logo = new Image(); let T = 0, vivant = true, raf = 0, n = 0, pret = false;
    // état : pour chaque case d'arrivée, quel morceau y est posé et sa rotation en quarts de tour
    let etat = Array.from({ length: N * N }, (_, i) => ({ m: i, r: 0 })), anim = null;
    let sacs = []; // { img: canvas carré de la composition, no }

    function tailles() {
      const t = Math.round(cadre.getBoundingClientRect().width * Math.min(devicePixelRatio || 1, 2));
      if (t && t !== T) { T = t; cv.width = cv.height = T; peindre(1); }
      if (!vitrine.hidden) disposer();
    }
    function peindre(p) {
      const k = T / N, ks = (logo.naturalWidth || 1) / N; x.fillStyle = NOIR; x.fillRect(0, 0, T, T);
      if (!pret) return;
      x.imageSmoothingQuality = 'high';
      etat.forEach((e, i) => {
        let cx, cy, r;
        const fx = (i % N + .5) * k, fy = (Math.floor(i / N) + .5) * k;
        if (anim) {
          const d = anim.depuis.get(e.m), q = Math.min(1, Math.max(0, (p * (DUREE + DECALAGE * 64) - anim.ordre[i] * DECALAGE) / DUREE));
          const v = q < .5 ? 4 * q * q * q : 1 - Math.pow(-2 * q + 2, 3) / 2;
          cx = d.x + (fx - d.x) * v; cy = d.y + (fy - d.y) * v; r = d.r + (e.r - d.r) * v;
        } else { cx = fx; cy = fy; r = e.r; }
        x.save(); x.translate(cx, cy); if (r) x.rotate(r * Math.PI / 2);
        x.drawImage(logo, (e.m % N) * ks, Math.floor(e.m / N) * ks, ks, ks, -k / 2, -k / 2, k + .5, k + .5);
        x.restore();
      });
    }
    function vers(nouvel) {
      const k = T / N, depuis = new Map();
      etat.forEach((e, i) => depuis.set(e.m, { x: (i % N + .5) * k, y: (Math.floor(i / N) + .5) * k, r: e.r }));
      // la rotation suit le chemin le plus court : pas de tours inutiles
      nouvel.forEach(e => { const d = depuis.get(e.m).r; while (e.r - d > 2) e.r -= 4; while (d - e.r > 2) e.r += 4; });
      etat = nouvel; anim = { depuis, ordre: nouvel.map(() => Math.random() * 64 | 0) };
      cancelAnimationFrame(raf);
      if (ctx.reduireMouvement) { anim = null; peindre(1); return; }
      const t0 = performance.now(), total = DUREE + DECALAGE * 64;
      const pas = t => { if (!vivant) return; const p = Math.min(1, (t - t0) / total); peindre(p); if (p < 1) raf = requestAnimationFrame(pas); else { anim = null; peindre(1); } };
      raf = requestAnimationFrame(pas);
    }
    function melanger() {
      if (!pret) return;
      const m = [...Array(N * N).keys()];
      for (let i = m.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [m[i], m[j]] = [m[j], m[i]]; }
      vers(m.map(v => ({ m: v, r: Math.random() * 4 | 0 })));
      n++; compte.textContent = `Composition n° ${n}`;
    }
    function remettre() { vers(etat.map((_, i) => ({ m: i, r: 0 }))); compte.textContent = 'Le logo'; }

    /* ---------- le sac ---------- */
    function composition() {
      // l'état final (sans l'animation en cours), à 900 px
      const S = 900, c = document.createElement('canvas'); c.width = c.height = S;
      const g = c.getContext('2d'), k = S / N, ks = logo.naturalWidth / N;
      g.fillStyle = NOIR; g.fillRect(0, 0, S, S); g.imageSmoothingQuality = 'high';
      etat.forEach((e, i) => {
        g.save(); g.translate((i % N + .5) * k, (Math.floor(i / N) + .5) * k); if (e.r) g.rotate(e.r * Math.PI / 2);
        g.drawImage(logo, (e.m % N) * ks, Math.floor(e.m / N) * ks, ks, ks, -k / 2, -k / 2, k + .5, k + .5); g.restore();
      });
      return c;
    }
    function anse(g, ax, ay, l, hh) {
      g.beginPath(); g.moveTo(ax, ay); g.bezierCurveTo(ax - l * .05, ay - hh * 1.25, ax + l * 1.05, ay - hh * 1.25, ax + l, ay); g.stroke();
    }
    // un sac posé au sol : face avant (coin bas gauche en x0, base), soufflet à droite, anses en cordon noir
    function sac(g, img, x0, base, h, no, posé = true) {
      const w = h * .82, top = base - h, d = w * .2, dy = d * .38;
      if (posé) ombre(g, x0 + h * .82 * .55, base, h);
      // anses arrière
      g.lineCap = 'round'; g.lineWidth = Math.max(2, w * .016); g.strokeStyle = '#2a2a2a';
      anse(g, x0 + w * .3 + d * .6, top - dy * .6, w * .4, h * .3);
      // soufflet : la même composition, assombrie et inclinée
      g.save(); g.beginPath(); g.moveTo(x0 + w, top); g.lineTo(x0 + w + d, top - dy); g.lineTo(x0 + w + d, base - dy); g.lineTo(x0 + w, base); g.closePath(); g.clip();
      g.fillStyle = '#0d0d0d'; g.fillRect(x0 + w, top - dy, d, h + dy);
      g.globalAlpha = .45; g.transform(1, -dy / d, 0, 1, x0 + w, top);
      g.drawImage(img, img.width * .78, 0, img.width * .22, img.width, 0, 0, d, h); g.restore();
      // ouverture du dessus
      g.fillStyle = '#050505'; g.beginPath(); g.moveTo(x0, top); g.lineTo(x0 + d, top - dy); g.lineTo(x0 + w + d, top - dy); g.lineTo(x0 + w, top); g.closePath(); g.fill();
      // face avant : la composition recadrée pour remplir la face (le sac est plus haut que large)
      g.save(); g.beginPath(); g.rect(x0, top, w, h); g.clip();
      g.drawImage(img, x0 + (w - h) / 2, top, h, h);
      const lum = g.createLinearGradient(x0, 0, x0 + w, 0); lum.addColorStop(0, 'rgba(255,255,255,.07)'); lum.addColorStop(.5, 'rgba(255,255,255,0)'); lum.addColorStop(1, 'rgba(0,0,0,.18)');
      g.fillStyle = lum; g.fillRect(x0, top, w, h);
      const bas = g.createLinearGradient(0, base - h * .12, 0, base); bas.addColorStop(0, 'rgba(0,0,0,0)'); bas.addColorStop(1, 'rgba(0,0,0,.28)');
      g.fillStyle = bas; g.fillRect(x0, top, w, h);
      g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(x0, top, w, h * .045); // rabat replié du haut
      g.restore();
      g.strokeStyle = 'rgba(255,255,255,.14)'; g.lineWidth = 1; g.strokeRect(x0 + .5, top + .5, w - 1, h - 1);
      // anses avant + œillets
      g.strokeStyle = '#111'; g.lineWidth = Math.max(2, w * .018); anse(g, x0 + w * .3, top + h * .03, w * .4, h * .3);
      g.fillStyle = '#9a9a9a'; [x0 + w * .3, x0 + w * .7].forEach(px => { g.beginPath(); g.arc(px, top + h * .055, Math.max(1.5, w * .011), 0, Math.PI * 2); g.fill(); });
      if (!posé) return;
      // numéro au sol
      g.fillStyle = 'rgba(0,0,0,.5)'; g.font = `600 ${Math.max(11, Math.round(h * .045))}px Archivo, sans-serif`; g.textAlign = 'left';
      g.fillText(`n° ${no}`, x0, base + Math.max(18, h * .09));
    }
    function ombre(g, cx, base, h, force = 1) {
      const rx = h * .55, o = g.createRadialGradient(cx, base, 0, cx, base, rx);
      o.addColorStop(0, `rgba(0,0,0,${.5 * force})`); o.addColorStop(1, 'rgba(0,0,0,0)');
      g.save(); g.translate(cx, base); g.scale(1, .09); g.translate(-cx, -base); g.fillStyle = o; g.beginPath(); g.arc(cx, base, rx, 0, Math.PI * 2); g.fill(); g.restore();
    }
    /* ---------- la vitrine : des sacs qu'on attrape, qui se balancent et qui tombent ---------- */
    const V = { W: 0, H: 0, sol: 0, g: 0, tenu: null, pointe: null, avant: null, t: 0, raf: 0 };
    function disposer() {
      const r = vc.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
      V.W = Math.round(r.width * dpr); V.H = Math.round(r.height * dpr); if (!V.W || !V.H) return;
      vc.width = V.W; vc.height = V.H; V.sol = V.H * .82; V.g = V.H * 3.2; V.tenu = null;
      const place = h => h * .82 * 1.2 + h * .14, hs = sacs.map((_, i) => TAILLES[i % TAILLES.length]);
      let hmax = V.H * .58; const total = hs.reduce((s, t) => s + place(t * hmax), 0);
      if (total > V.W * .94) hmax *= V.W * .94 / total;
      let px = (V.W - hs.reduce((s, t) => s + place(t * hmax), 0)) / 2 + hmax * .07;
      sacs.forEach((s, i) => { s.h = hs[i] * hmax; s.w = s.h * .82; s.mode = 'pose'; s.x = px; s.a = 0; px += place(s.h); });
    }
    function fond(g) {
      const { W, H } = V, k = V.sol / H;
      const mur = g.createLinearGradient(0, 0, 0, H); mur.addColorStop(0, '#1b1b1a'); mur.addColorStop(k - .06, '#2c2b29'); mur.addColorStop(k - .06, '#d9d5cd'); mur.addColorStop(1, '#bcb7ad');
      g.fillStyle = mur; g.fillRect(0, 0, W, H);
      const spot = g.createRadialGradient(W / 2, 0, 0, W / 2, 0, W * .7); spot.addColorStop(0, 'rgba(255,248,230,.18)'); spot.addColorStop(1, 'rgba(255,248,230,0)');
      g.fillStyle = spot; g.fillRect(0, 0, W, H * (k - .06));
      g.fillStyle = 'rgba(255,255,255,.5)'; g.font = `italic 400 ${Math.round(H * .04)}px Bodoni, Didot, serif`; g.textAlign = 'center';
      g.fillText('Saks Fifth Avenue', W / 2, H * .08);
    }
    // point d'accroche (le haut des anses) d'un sac posé
    const accroche = s => ({ x: s.x + s.w * .5, y: V.sol - s.h * 1.25 });
    function dessinerVitrine() {
      const g = vc.getContext('2d'); fond(g);
      const ordre = sacs.filter(s => s !== V.tenu && s.mode !== 'chute').concat(sacs.filter(s => s.mode === 'chute'), V.tenu ? [V.tenu] : []);
      ordre.forEach(s => {
        if (s.mode === 'pose') { sac(g, s.img, s.x, V.sol, s.h, s.no); return; }
        // en l'air : ombre au sol qui grandit quand le sac descend
        const bas = s.mode === 'tenu' ? s.py + s.h * 1.25 : s.cy + s.h / 2, cx = s.mode === 'tenu' ? s.px + Math.sin(s.a) * s.h * .75 : s.cx;
        ombre(g, cx, V.sol, s.h, Math.max(.15, 1 - (V.sol - bas) / V.H * 2.2));
        g.save();
        if (s.mode === 'tenu') { g.translate(s.px, s.py); g.rotate(s.a); sac(g, s.img, -s.w * .5, s.h * 1.25, s.h, s.no, false); }
        else { g.translate(s.cx, s.cy); g.rotate(s.a); sac(g, s.img, -s.w * .5, s.h * .5, s.h, s.no, false); }
        g.restore();
      });
      // la main
      if (main.pos) {
        g.beginPath(); g.arc(main.pos.x, main.pos.y, main.pince ? V.H * .012 : V.H * .02, 0, 7);
        g.lineWidth = Math.max(2, V.H * .005); g.strokeStyle = '#ff3b30'; g.stroke(); if (main.pince) { g.fillStyle = '#ff3b30'; g.fill(); }
      }
    }
    function attraper(x, y) {
      if (V.tenu) return;
      // le sac le plus proche du point, s'il est assez près
      let mieux = null, d = Infinity;
      sacs.forEach(s => {
        const c = s.mode === 'pose' ? { x: s.x + s.w / 2, y: V.sol - s.h * .6 } : s.mode === 'chute' ? { x: s.cx, y: s.cy } : null; if (!c) return;
        const e = Math.hypot(c.x - x, c.y - y); if (e < d && e < s.h * 1.1) { d = e; mieux = s; }
      });
      if (!mieux) return;
      const s = mieux; s.mode = 'tenu'; s.px = x; s.py = y; s.va = 0;
      s.a = s.a || 0; V.tenu = s; V.pointe = { x, y }; V.avant = { x, y, vx: 0, vy: 0 }; vc.classList.add('tient');
    }
    function lacher() {
      const s = V.tenu; if (!s) return; V.tenu = null; vc.classList.remove('tient');
      // le sac part avec la vitesse de la main et celle du balancier
      const L = s.h * .75, vx = V.avant.vx + Math.cos(s.a) * s.va * L, vy = V.avant.vy + Math.sin(s.a) * s.va * L;
      s.mode = 'chute'; s.cx = s.px - Math.sin(s.a) * L; s.cy = s.py + Math.cos(s.a) * L; s.vx = vx; s.vy = vy;
    }
    function pas(t) {
      if (!vivant || vitrine.hidden) { V.raf = 0; return; }
      const dt = Math.min(.033, V.t ? (t - V.t) / 1000 : .016); V.t = t;
      if (main.modele) lireMain();
      const s = V.tenu;
      if (s && V.pointe) {
        // la main tire le point d'accroche ; le sac pend dessous comme un pendule
        const nx = s.px + (V.pointe.x - s.px) * .6, ny = s.py + (V.pointe.y - s.py) * .6;
        const vx = (nx - s.px) / dt, vy = (ny - s.py) / dt, ax = (vx - V.avant.vx) / dt, ay = (vy - V.avant.vy) / dt;
        V.avant = { x: nx, y: ny, vx, vy }; s.px = nx; s.py = ny;
        const L = s.h * .75;
        s.va += (-(V.g + ay) * Math.sin(s.a) - ax * Math.cos(s.a)) / L * dt; s.va *= Math.pow(.25, dt); s.a += s.va * dt;
        s.a = Math.max(-1.4, Math.min(1.4, s.a));
      }
      sacs.forEach(c => {
        if (c.mode !== 'chute') return;
        c.vy += V.g * dt; c.cx += c.vx * dt; c.cy += c.vy * dt; c.a += (c.vx / (c.h * 2)) * dt * 1.5; c.vx *= Math.pow(.6, dt);
        // il touche le sol : il se pose (ou rebondit un peu s'il arrive vite)
        if (c.cy + c.h / 2 >= V.sol) {
          if (c.vy > V.H * 1.4) { c.cy = V.sol - c.h / 2; c.vy *= -.25; c.a *= .5; }
          else { c.mode = 'pose'; c.a = 0; c.x = Math.max(0, Math.min(V.W - c.w * 1.2, c.cx - c.w / 2)); }
        }
        if (c.cx < -c.w || c.cx > V.W + c.w) { c.cx = Math.max(c.w / 2, Math.min(V.W - c.w, c.cx)); c.vx *= -.3; }
      });
      dessinerVitrine();
      V.raf = requestAnimationFrame(pas);
    }
    function demarrer() { if (!V.raf) { V.t = 0; V.raf = requestAnimationFrame(pas); } }
    const point = e => { const r = vc.getBoundingClientRect(); return { x: (e.clientX - r.left) * V.W / r.width, y: (e.clientY - r.top) * V.H / r.height }; };
    vc.addEventListener('pointerdown', e => { const p = point(e); attraper(p.x, p.y); if (V.tenu) { vc.setPointerCapture(e.pointerId); e.preventDefault(); } });
    vc.addEventListener('pointermove', e => { if (V.tenu && !main.pince) V.pointe = point(e); });
    vc.addEventListener('pointerup', () => { if (!main.pince) lacher(); });
    vc.addEventListener('pointercancel', () => { if (!main.pince) lacher(); });

    /* ── la main, à la webcam (même réglage que l'atelier Grignani) ── */
    const main = { modele: null, flux: null, pince: false, compte: 0, ts: 0, tv: -1, pos: null, vuA: 0 };
    function direMain(t) { info.textContent = t ?? (main.modele ? (main.pos ? 'Pince pouce et index sur un sac pour l’attraper, ouvre pour le lâcher.' : 'Montre ta main face à la caméra.') : ''); }
    function lireMain() {
      if (video.currentTime === main.tv) return;
      main.tv = video.currentTime; main.ts = Math.max(main.ts + 1, performance.now());
      let r; try { r = main.modele.detectForVideo(video, main.ts); } catch { return; }
      const m = r.landmarks?.[0], maintenant = performance.now();
      if (!m) { if (main.pos && maintenant - main.vuA > 500) { main.pos = null; if (main.pince) { main.pince = false; lacher(); } direMain(); } return; }
      if (!main.pos) { main.vuA = maintenant; main.pos = { x: 0, y: 0 }; direMain(); } main.vuA = maintenant;
      // le point de pince : entre le pouce et l'index, en miroir, un peu agrandi pour atteindre les bords
      const z = 1.35, mx = (m[4].x + m[8].x) / 2, my = (m[4].y + m[8].y) / 2;
      const px = Math.max(0, Math.min(1, (.5 - mx) * z + .5)) * V.W, py = Math.max(0, Math.min(1, (my - .5) * z + .5)) * V.H;
      main.pos = main.pos.x ? { x: main.pos.x + (px - main.pos.x) * .55, y: main.pos.y + (py - main.pos.y) * .55 } : { x: px, y: py };
      if (main.pince) V.pointe = { ...main.pos };
      const taille = Math.hypot(m[0].x - m[9].x, m[0].y - m[9].y) || .1, ecart = Math.hypot(m[4].x - m[8].x, m[4].y - m[8].y) / taille;
      main.compte = ecart < .3 ? main.compte + 1 : 0;
      if (!main.pince && main.compte >= 2) { main.pince = true; attraper(main.pos.x, main.pos.y); }
      else if (main.pince && ecart > .5) { main.pince = false; lacher(); }
    }
    function couperCamera() {
      main.flux?.getTracks().forEach(p => p.stop()); main.flux = null; main.modele?.close?.(); main.modele = null; main.pos = null;
      if (main.pince) { main.pince = false; lacher(); }
      video.hidden = true; bMain.textContent = 'Attraper avec la main'; bMain.setAttribute('aria-pressed', 'false'); direMain('');
    }
    bMain.addEventListener('click', async () => {
      if (main.modele || main.flux) { couperCamera(); return; }
      bMain.disabled = true; direMain('Chargement du suivi de la main…');
      try {
        main.flux = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: 'user' } });
        video.srcObject = main.flux; await video.play(); video.hidden = false;
        const { FilesetResolver, HandLandmarker } = await import(`${ctx.racine}vendor/mediapipe/vision_bundle.mjs`);
        const fs = await FilesetResolver.forVisionTasks(`${ctx.racine}vendor/mediapipe/wasm`);
        const options = delegate => ({ baseOptions: { modelAssetPath: URL_MAINS, delegate }, runningMode: 'VIDEO', numHands: 1,
          minHandDetectionConfidence: .4, minHandPresenceConfidence: .4, minTrackingConfidence: .4 });
        let m; try { m = await HandLandmarker.createFromOptions(fs, options('GPU')); } catch { m = await HandLandmarker.createFromOptions(fs, options('CPU')); }
        if (!vivant || !main.flux) { m.close?.(); return; }
        main.modele = m; bMain.textContent = 'Arrêter la caméra'; bMain.setAttribute('aria-pressed', 'true'); direMain();
      } catch (e) { console.warn(e); couperCamera(); direMain('Caméra ou suivi de la main indisponible : attrape les sacs à la souris.'); }
      bMain.disabled = false;
    });

    function mettreSurSac() {
      if (!pret) return;
      sacs.push({ img: composition(), no: (sacs.at(-1)?.no || 0) + 1 }); if (sacs.length > MAX_SACS) sacs.shift();
      ouvrirVitrine();
    }
    function ouvrirVitrine() {
      vitrine.hidden = false; cv.removeAttribute('data-export'); vc.setAttribute('data-export', '');
      disposer(); dessinerVitrine(); demarrer(); vitrine.querySelector('[data-retour]').focus();
      voir.hidden = false; voir.textContent = `Voir la vitrine (${sacs.length} sac${sacs.length > 1 ? 's' : ''})`;
      ctx.annoncer?.(`Sac n° ${sacs.at(-1).no} en vitrine`);
    }
    function fermerVitrine() { couperCamera(); vitrine.hidden = true; vc.removeAttribute('data-export'); cv.setAttribute('data-export', ''); cadre.focus(); }

    logo.onload = () => { pret = true; peindre(1); };
    logo.src = ctx.racine + LOGO;
    cadre.addEventListener('click', melanger);
    cadre.addEventListener('keydown', e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); melanger(); } });
    zone.querySelector('[data-melanger]').addEventListener('click', melanger);
    zone.querySelector('[data-logo]').addEventListener('click', remettre);
    zone.querySelector('[data-sac]').addEventListener('click', mettreSurSac);
    voir.addEventListener('click', ouvrirVitrine);
    vitrine.querySelector('[data-retour]').addEventListener('click', fermerVitrine);
    vitrine.querySelector('[data-vider]').addEventListener('click', () => { sacs = []; voir.hidden = true; fermerVitrine(); });
    const ro = new ResizeObserver(tailles); ro.observe(cadre); ro.observe(vitrine);
    tailles();
    return () => { vivant = false; cancelAnimationFrame(raf); cancelAnimationFrame(V.raf); ro.disconnect(); couperCamera(); };
  },
};
