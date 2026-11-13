// M · Michael Bierut — identité Saks Fifth Avenue (Pentagram, 2007).
// Le logo (img/m/logo.png, fourni par Eliott le 13/11) est découpé en 64 carrés. Chaque clic les mélange :
// jamais la même image, toujours la même marque. Un bouton remet le logo d'origine.
// Retour d'Eliott (13/11) : les carrés ne tournent pas. Pentagram écrit pourtant que les carrés sont
// « mélangés et tournés » : la case « Tourner aussi les carrés » le montre, elle est décochée par défaut
// (ROTATION_PAR_DEFAUT ci-dessous).

const LOGO = 'img/m/logo.png';
const ROTATION_PAR_DEFAUT = false;
const N = 8, DUREE = 760, DECALAGE = 5, NOIR = '#000';

export default {
  lettre: 'M',
  css: `
.bi{display:grid;grid-template-columns:auto minmax(180px,236px);gap:clamp(16px,3cqw,44px);justify-content:center;align-items:end;height:100cqh}
.bi-cadre{position:relative;height:min(100cqh,calc(100cqw - 284px));aspect-ratio:1;background:${NOIR};cursor:pointer;touch-action:manipulation;box-shadow:0 0 0 1px rgba(255,255,255,.16)}
.bi-cadre canvas{display:block;width:100%;height:100%}
.bi-cote{display:grid;gap:clamp(8px,1.6cqh,14px);align-content:end;padding-bottom:2px}
.bi-compte{font:400 clamp(30px,6cqh,60px)/1 Bodoni,Didot,serif;margin:0}
.bi-cote p{margin:0}
.bi-boutons{display:flex;flex-wrap:wrap;gap:8px}
.bi-tourner{display:flex;align-items:center;gap:8px;font:600 13px/1.3 Archivo,sans-serif;cursor:pointer}
.bi-tourner input{width:18px;height:18px;accent-color:#fff;margin:0}
.bi-sacs{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}
.bi-sacs canvas{width:100%;aspect-ratio:1;display:block;background:${NOIR};cursor:pointer;box-shadow:0 0 0 1px rgba(255,255,255,.16)}
@media (max-height:640px){.bi-sacs{grid-template-columns:repeat(8,1fr)}}
@media (max-width:760px){.bi{grid-template-columns:1fr;height:auto}.bi-cadre{height:auto;width:100%}}
`,
  monter(zone, ctx) {
    zone.innerHTML = `
      <div class="bi">
        <div class="bi-cadre" role="button" tabindex="0" aria-label="Mélanger les 64 carrés"><canvas data-export></canvas></div>
        <div class="bi-cote">
          <p class="bi-compte" aria-live="polite">Le logo</p>
          <p class="note">Clique sur le carré : les 64 morceaux changent de place. Chaque image est un nouveau sac, et c’est toujours Saks.</p>
          <div class="bi-boutons">
            <button type="button" class="bouton plein" data-melanger>Mélanger</button>
            <button type="button" class="bouton" data-logo>Remettre le logo</button>
          </div>
          <label class="bi-tourner"><input type="checkbox" data-tourner${ROTATION_PAR_DEFAUT ? ' checked' : ''}> Tourner aussi les carrés</label>
          <p class="etiquette">Tes derniers sacs (clique pour y revenir)</p>
          <div class="bi-sacs"></div>
        </div>
      </div>`;
    const cadre = zone.querySelector('.bi-cadre'), cv = cadre.querySelector('canvas'), x = cv.getContext('2d');
    const compte = zone.querySelector('.bi-compte'), sacs = zone.querySelector('.bi-sacs'), tourner = zone.querySelector('[data-tourner]');
    const logo = new Image(); let T = 0, vivant = true, raf = 0, n = 0, pret = false;
    // état : pour chaque case d'arrivée, quel morceau y est posé et sa rotation en quarts de tour (0 quand on ne tourne pas)
    let etat = Array.from({ length: N * N }, (_, i) => ({ m: i, r: 0 })), anim = null;

    function tailles() {
      const t = Math.round(cadre.getBoundingClientRect().width * Math.min(devicePixelRatio || 1, 2));
      if (!t || t === T) return; T = t; cv.width = cv.height = T; peindre(1);
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
    function vers(nouvel, sauver = true) {
      const k = T / N, depuis = new Map();
      etat.forEach((e, i) => depuis.set(e.m, { x: (i % N + .5) * k, y: (Math.floor(i / N) + .5) * k, r: e.r }));
      // la rotation suit le chemin le plus court : pas de tours inutiles
      nouvel.forEach(e => { const d = depuis.get(e.m).r; while (e.r - d > 2) e.r -= 4; while (d - e.r > 2) e.r += 4; });
      etat = nouvel; anim = { depuis, ordre: nouvel.map(() => Math.random() * 64 | 0) };
      cancelAnimationFrame(raf);
      if (ctx.reduireMouvement) { anim = null; peindre(1); if (sauver) garder(); return; }
      const t0 = performance.now(), total = DUREE + DECALAGE * 64;
      const pas = t => { if (!vivant) return; const p = Math.min(1, (t - t0) / total); peindre(p); if (p < 1) raf = requestAnimationFrame(pas); else { anim = null; peindre(1); if (sauver) garder(); } };
      raf = requestAnimationFrame(pas);
    }
    function melanger() {
      if (!pret) return;
      const m = [...Array(N * N).keys()];
      for (let i = m.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [m[i], m[j]] = [m[j], m[i]]; }
      vers(m.map(v => ({ m: v, r: tourner.checked ? Math.random() * 4 | 0 : 0 })));
      n++; compte.textContent = `Sac n° ${n}`;
    }
    function remettre() { vers(etat.map((_, i) => ({ m: i, r: 0 })), false); compte.textContent = 'Le logo'; }
    function garder() {
      const s = document.createElement('canvas'); s.width = s.height = 160; s.getContext('2d').drawImage(cv, 0, 0, 160, 160);
      const copie = etat.map(e => ({ ...e })), no = n;
      s.title = `Sac n° ${no}`; s.setAttribute('role', 'button'); s.tabIndex = 0;
      const revenir = () => { vers(copie.map(e => ({ ...e })), false); compte.textContent = `Sac n° ${no}`; };
      s.addEventListener('click', revenir);
      s.addEventListener('keydown', e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); revenir(); } });
      sacs.prepend(s); while (sacs.children.length > 8) sacs.lastChild.remove();
    }

    logo.onload = () => { pret = true; peindre(1); };
    logo.src = ctx.racine + LOGO;
    cadre.addEventListener('click', melanger);
    cadre.addEventListener('keydown', e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); melanger(); } });
    zone.querySelector('[data-melanger]').addEventListener('click', melanger);
    zone.querySelector('[data-logo]').addEventListener('click', remettre);
    // décocher la case remet tout de suite les carrés droits, sans changer leur place
    tourner.addEventListener('change', () => { if (!tourner.checked && etat.some(e => e.r % 4)) vers(etat.map(e => ({ m: e.m, r: 0 })), false); });
    const ro = new ResizeObserver(tailles); ro.observe(cadre);
    tailles();
    return () => { vivant = false; cancelAnimationFrame(raf); ro.disconnect(); };
  },
};
