// M · Michael Bierut — identité Saks Fifth Avenue (Pentagram, 2007).
// Le logo est découpé en 64 carrés. Chaque clic les mélange et les fait tourner :
// jamais la même image, toujours la même marque. Un bouton remet le logo d'origine.
// PROVISOIRE : le logo est redessiné avec une écriture libre (Pinyon Script). Le vrai logo (SVG, fourni par Eliott) le remplacera :
// déposer img/m/logo.svg (blanc sur fond transparent, carré) et passer LOGO_SVG ci-dessous à 'img/m/logo.svg'.

const LOGO_SVG = null;
const N = 8, DUREE = 760, DECALAGE = 5;

export default {
  lettre: 'M',
  css: `
@font-face{font-family:"Pinyon";font-display:swap;src:url(../fonts/pinyon-script-latin-400-normal.woff2) format("woff2")}
.bi{display:grid;grid-template-columns:minmax(0,min(72vh,640px)) minmax(220px,1fr);gap:clamp(18px,3vw,48px);align-items:start}
.bi-cadre{position:relative;aspect-ratio:1;background:#0a0a0a;cursor:pointer;touch-action:manipulation}
.bi-cadre canvas{display:block;width:100%;height:100%}
.bi-cote{display:grid;gap:14px;align-content:start}
.bi-compte{font:400 clamp(40px,5vw,72px)/1 Bodoni,Didot,serif;margin:0}
.bi-cote p{margin:0;max-width:40ch}
.bi-boutons{display:flex;flex-wrap:wrap;gap:8px}
.bi-sacs{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;max-width:360px}
.bi-sacs canvas{width:100%;aspect-ratio:1;display:block;background:#0a0a0a;cursor:pointer}
@media (max-width:760px){.bi{grid-template-columns:1fr}}
`,
  monter(zone, ctx) {
    zone.innerHTML = `
      <div class="bi">
        <div class="bi-cadre" role="button" tabindex="0" aria-label="Mélanger les 64 carrés"><canvas></canvas></div>
        <div class="bi-cote">
          <p class="bi-compte" aria-live="polite">Le logo</p>
          <p>Clique sur le carré : les 64 morceaux se mélangent et tournent. Chaque image est un nouveau sac, et c’est toujours Saks.</p>
          <div class="bi-boutons">
            <button type="button" class="bouton plein" data-melanger>Mélanger</button>
            <button type="button" class="bouton" data-logo>Remettre le logo</button>
          </div>
          <p class="etiquette">Tes derniers sacs (clique pour y revenir)</p>
          <div class="bi-sacs"></div>
          <p class="note">Logo redessiné pour l’exercice. Identité de Michael Bierut, Pentagram, 2007, à partir du logo dessiné par Tom Carnase en 1973.</p>
        </div>
      </div>`;
    const cadre = zone.querySelector('.bi-cadre'), cv = cadre.querySelector('canvas'), x = cv.getContext('2d');
    const compte = zone.querySelector('.bi-compte'), sacs = zone.querySelector('.bi-sacs');
    const src = document.createElement('canvas'); let T = 0, vivant = true, raf = 0, n = 0;
    // état : pour chaque case d'arrivée, quel morceau y est posé et avec quelle rotation (en quarts de tour)
    let etat = Array.from({ length: N * N }, (_, i) => ({ m: i, r: 0 })), anim = null;

    function tailles() {
      const t = Math.round(cadre.getBoundingClientRect().width * Math.min(devicePixelRatio || 1, 2));
      if (!t || t === T) return; T = t; cv.width = cv.height = T; src.width = src.height = T; dessinerLogo(); peindre(1);
    }
    function dessinerLogo() {
      const s = src.getContext('2d'); s.fillStyle = '#0a0a0a'; s.fillRect(0, 0, T, T);
      if (LOGO_SVG && logoImg?.complete) { s.drawImage(logoImg, 0, 0, T, T); return; }
      s.fillStyle = '#fff'; s.textAlign = 'center'; s.textBaseline = 'alphabetic';
      s.font = `${T * .42}px Pinyon, cursive`; s.fillText('Saks', T * .5, T * .52);
      s.font = `${T * .155}px Pinyon, cursive`; s.fillText('Fifth Avenue', T * .52, T * .76);
    }
    const c = T => T / N;
    function peindre(p) {
      const k = T / N; x.fillStyle = '#0a0a0a'; x.fillRect(0, 0, T, T);
      etat.forEach((e, i) => {
        let cx, cy, r;
        const fx = (i % N + .5) * k, fy = (Math.floor(i / N) + .5) * k;
        if (anim) {
          const d = anim.depuis.get(e.m), q = Math.min(1, Math.max(0, (p * (DUREE + DECALAGE * 64) - anim.ordre[i] * DECALAGE) / DUREE));
          const v = q < .5 ? 4 * q * q * q : 1 - Math.pow(-2 * q + 2, 3) / 2;
          cx = d.x + (fx - d.x) * v; cy = d.y + (fy - d.y) * v; r = d.r + (e.r - d.r) * v;
        } else { cx = fx; cy = fy; r = e.r; }
        x.save(); x.translate(cx, cy); x.rotate(r * Math.PI / 2);
        x.drawImage(src, (e.m % N) * k, Math.floor(e.m / N) * k, k, k, -k / 2, -k / 2, k + .5, k + .5);
        x.restore();
      });
    }
    function vers(nouvel, sauver = true) {
      const k = T / N, depuis = new Map();
      etat.forEach((e, i) => depuis.set(e.m, { x: (i % N + .5) * k, y: (Math.floor(i / N) + .5) * k, r: e.r }));
      // la rotation suit le chemin le plus court pour que les carrés ne fassent pas de tours inutiles
      nouvel.forEach(e => { const d = depuis.get(e.m).r; while (e.r - d > 2) e.r -= 4; while (d - e.r > 2) e.r += 4; });
      etat = nouvel; anim = { depuis, ordre: nouvel.map(() => Math.random() * 64 | 0) };
      if (ctx.reduireMouvement) { anim = null; peindre(1); if (sauver) garder(); return; }
      cancelAnimationFrame(raf); const t0 = performance.now(), total = DUREE + DECALAGE * 64;
      const pas = t => { if (!vivant) return; const p = Math.min(1, (t - t0) / total); peindre(p); if (p < 1) raf = requestAnimationFrame(pas); else { anim = null; peindre(1); if (sauver) garder(); } };
      raf = requestAnimationFrame(pas);
    }
    function melanger() {
      const m = [...Array(N * N).keys()];
      for (let i = m.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [m[i], m[j]] = [m[j], m[i]]; }
      vers(m.map(v => ({ m: v, r: Math.random() * 4 | 0 })));
      n++; compte.textContent = `Sac n° ${n}`;
    }
    function remettre() { vers(etat.map((_, i) => ({ m: i, r: 0 })).map(e => ({ ...e })), false); compte.textContent = 'Le logo'; }
    function garder() {
      const s = document.createElement('canvas'); s.width = s.height = 160; s.getContext('2d').drawImage(cv, 0, 0, 160, 160);
      const copie = etat.map(e => ({ ...e })), no = n;
      s.title = `Sac n° ${no}`; s.setAttribute('role', 'button'); s.tabIndex = 0;
      s.addEventListener('click', () => { vers(copie.map(e => ({ ...e })), false); compte.textContent = `Sac n° ${no}`; });
      sacs.prepend(s); while (sacs.children.length > 8) sacs.lastChild.remove();
    }

    let logoImg = null;
    if (LOGO_SVG) { logoImg = new Image(); logoImg.onload = () => { dessinerLogo(); peindre(1); }; logoImg.src = LOGO_SVG; }
    cadre.addEventListener('click', melanger);
    cadre.addEventListener('keydown', e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); melanger(); } });
    zone.querySelector('[data-melanger]').addEventListener('click', melanger);
    zone.querySelector('[data-logo]').addEventListener('click', remettre);
    const ro = new ResizeObserver(tailles); ro.observe(cadre);
    document.fonts.load('40px Pinyon').then(() => { dessinerLogo(); peindre(1); }).catch(() => {});
    tailles();
    return () => { vivant = false; cancelAnimationFrame(raf); ro.disconnect(); };
  },
};
