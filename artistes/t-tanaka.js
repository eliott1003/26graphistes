// T · Ikko Tanaka — Nihon Buyo (1981).
// L'affiche est faite de quelques formes rangées dans une grille : aplats, triangles, un soleil, deux yeux, une bouche.
// « Gravité » : chaque FORME de l'affiche se détache et tombe (pas des carrés : les triangles restent des triangles,
// le soleil roule). On les attrape, on les lance. « Recomposer » les renvoie chacune à sa place.
//
// L'affiche est protégée : elle n'est PAS redessinée. Chaque forme est découpée dans l'image d'Eliott (img/t/ref.jpg,
// 1411 × 2000 px) selon les tracés ci-dessous, relevés sur l'affiche. Quand une petite forme (œil, bouche, soleil) part,
// le trou laissé dans la grande est rebouché avec la couleur de l'affiche prise à côté (point « fond »).
// Physique : matter-js (licence MIT), dans vendor/matter/.

const L0 = 1411, H0 = 2000; // taille de l'image de référence, en px
const rect = (x1, y1, x2, y2) => [[x1, y1], [x2, y1], [x2, y2], [x1, y2]];
const FORMES = [ // poly : sommets en px de l'image ; rond : centre et rayon ; trous : petites formes posées dessus
  { nom: 'texte', poly: rect(0, 0, 475, 503) },
  { nom: 'noir haut', poly: rect(475, 0, 940, 503) },
  { nom: 'ciel', poly: rect(940, 0, 1411, 503), trous: ['soleil'] },
  { nom: 'noir gauche', poly: [[0, 503], [475, 503], [475, 1495], [0, 997]] },
  { nom: 'noir droite', poly: [[940, 503], [1411, 503], [1411, 1000], [940, 1495]] },
  { nom: 'violet', poly: rect(475, 503, 940, 750) },
  { nom: 'bandeau', poly: rect(475, 750, 940, 875), trous: ['œil gauche', 'œil droit'] },
  { nom: 'visage', poly: rect(475, 875, 940, 1495), trous: ['bouche'] },
  { nom: 'gris gauche', poly: [[0, 997], [475, 1495], [0, 2000]] },
  { nom: 'bleu', poly: [[0, 2000], [475, 1495], [475, 2000]] },
  { nom: 'blanc bas', poly: [[475, 1495], [940, 1495], [475, 2000]] },
  { nom: 'vert', poly: [[940, 1495], [940, 2000], [475, 2000]] },
  { nom: 'gris droite', poly: [[940, 1495], [1411, 1000], [1411, 1495]] },
  { nom: 'rouge', poly: rect(940, 1495, 1411, 2000) },
  { nom: 'soleil', rond: [1152, 292, 212], fond: [985, 30] },
  { nom: 'œil gauche', rond: [529, 811, 66], fond: [707, 812] },
  { nom: 'œil droit', rond: [885, 811, 66], fond: [707, 812] },
  { nom: 'bouche', rond: [707, 1288, 54], fond: [707, 1150] },
];
const centre = pts => { // centre de gravité d'un polygone
  let a = 0, cx = 0, cy = 0;
  pts.forEach(([x1, y1], i) => { const [x2, y2] = pts[(i + 1) % pts.length], k = x1 * y2 - x2 * y1; a += k; cx += (x1 + x2) * k; cy += (y1 + y2) * k; });
  return [cx / (3 * a), cy / (3 * a)];
};
FORMES.forEach(f => { f.c = f.rond ? f.rond.slice(0, 2) : centre(f.poly); });
const charger = src => new Promise((ok, non) => { const im = new Image(); im.onload = () => ok(im); im.onerror = non; im.src = src; });
let attente = null;
const chargerMatter = racine => attente || (attente = new Promise((ok, non) => { // une seule fois ; la bibliothèque se range dans window.Matter
  if (window.Matter) return ok(window.Matter);
  const s = document.createElement('script'); s.src = racine + 'vendor/matter/matter.min.js'; s.onload = () => ok(window.Matter); s.onerror = () => { attente = null; non(new Error('matter')); }; document.head.append(s);
}));

export default {
  lettre: 'T',
  css: `
.tk{display:grid;grid-template-columns:minmax(0,1fr) minmax(170px,230px);gap:clamp(14px,2.4cqw,36px);align-items:end;height:100cqh}
.tk-scene{height:100cqh;min-width:0}
.tk-scene canvas{display:block;width:100%;height:100%;touch-action:none}
.tk-scene canvas.libre{cursor:grab}
.tk-scene canvas.tenu{cursor:grabbing}
.tk-cote{display:grid;gap:12px;align-content:end;padding-bottom:4px}
.tk-cote p{margin:0}
.tk-compte{font:900 clamp(34px,5.6cqw,62px)/.88 "Sofia Cond",Archivo,sans-serif;text-transform:uppercase}
.tk-boutons{display:flex;flex-wrap:wrap;gap:8px}
.tk [hidden]{display:none}
@media (max-width:760px){.tk{grid-template-columns:1fr;height:auto}.tk-scene{height:auto;aspect-ratio:4/5}}
`,
  monter(zone, ctx) {
    zone.innerHTML = `
      <div class="tk">
        <div class="tk-scene"><canvas data-export aria-label="L’affiche Nihon Buyo d’Ikko Tanaka, faite de formes rangées dans une grille. Le bouton Gravité les fait tomber."></canvas></div>
        <div class="tk-cote">
          <p class="tk-compte" aria-hidden="true">Grille</p>
          <p class="etiquette" aria-live="polite"></p>
          <p class="note" data-provisoire hidden>L’image de l’affiche ne se charge pas (img/t/ref.jpg).</p>
          <div class="tk-boutons">
            <button type="button" class="bouton plein" data-gravite>Gravité</button>
            <button type="button" class="bouton" data-secouer hidden>Secouer</button>
          </div>
        </div>
      </div>`;
    const scene = zone.querySelector('.tk-scene'), cv = scene.querySelector('canvas'), x = cv.getContext('2d');
    const compte = zone.querySelector('.tk-compte'), info = zone.querySelector('.etiquette'), bG = zone.querySelector('[data-gravite]'), bS = zone.querySelector('[data-secouer]');
    let W = 0, H = 0, dpr = 1, vivant = true, raf = 0, source = null, bx = 0, by = 0, bw = 0, bh = 0, k = 1;
    let M = null, moteur = null, lien = null, etat = 'grille', tRetour = 0, tChute = 0; // grille, chute, retour
    const pieces = FORMES.map(f => ({ f, x: 0, y: 0, a: 0, corps: null, dx: 0, dy: 0, da: 0, teinte: '#eee' }));
    const parNom = Object.fromEntries(pieces.map(p => [p.f.nom, p]));
    const maison = p => ({ x: bx + p.f.c[0] * k, y: by + p.f.c[1] * k });
    const bouge = p => { const m = maison(p); return Math.hypot(p.x - m.x, p.y - m.y) > 2 * dpr || Math.abs(p.a) > .01; };

    function dire(t) {
      compte.textContent = etat === 'chute' ? 'Chute' : 'Grille';
      info.textContent = t || (etat === 'chute' ? 'Attrape une forme, lance-la, empile-les.' : 'Chaque forme tient dans la grille. Appuie sur Gravité.');
      bG.textContent = etat === 'chute' ? 'Recomposer' : 'Gravité'; bS.hidden = etat !== 'chute'; cv.classList.toggle('libre', etat === 'chute');
    }
    function mesurer() {
      const r = scene.getBoundingClientRect(); if (!r.width || !r.height) return;
      const ancien = k, ax = bx, ay = by;
      dpr = Math.min(devicePixelRatio || 1, 2); W = cv.width = Math.round(r.width * dpr); H = cv.height = Math.round(r.height * dpr);
      bh = Math.min(H * .74, W * .8 * H0 / L0); bw = bh * L0 / H0; k = bw / L0; bx = (W - bw) / 2; by = (H - bh) / 2;
      if (etat === 'chute' && M) { // la scène a changé de taille : retour à la grille
        arreter(); pieces.forEach(p => { p.x = bx + (p.x - ax) * k / ancien; p.y = by + (p.y - ay) * k / ancien; }); recomposer();
      } else if (etat === 'grille') pieces.forEach(p => { Object.assign(p, maison(p)); p.a = 0; });
      dire(); dessiner();
    }
    function trace(f) { // le tracé de la forme, autour de son centre, à l'échelle de l'écran
      x.beginPath();
      if (f.rond) x.arc(0, 0, f.rond[2] * k, 0, Math.PI * 2);
      else f.poly.forEach(([px, py], i) => x[i ? 'lineTo' : 'moveTo']((px - f.c[0]) * k, (py - f.c[1]) * k));
      x.closePath();
    }
    function dessiner() {
      if (!W) return;
      x.fillStyle = ctx.couleurs.fond; x.fillRect(0, 0, W, H);
      x.fillStyle = 'rgba(0,0,0,.22)'; x.fillRect(bx, by, bw, bh); // la place vide de l'affiche
      if (!source) return;
      const ordre = etat === 'grille' ? pieces : [...pieces].sort((a, b) => (a.f.rond ? 1 : 0) - (b.f.rond ? 1 : 0));
      for (const p of ordre) {
        const f = p.f; x.save(); x.translate(p.x, p.y); x.rotate(p.a);
        if (etat !== 'grille') { x.save(); x.shadowColor = 'rgba(0,0,0,.35)'; x.shadowBlur = 14 * dpr; x.shadowOffsetY = 4 * dpr; trace(f); x.fillStyle = p.teinte; x.fill(); x.restore(); }
        trace(f); x.clip();
        x.drawImage(source, -f.c[0] * k, -f.c[1] * k, bw, bh);
        for (const n of f.trous || []) { // la petite forme est partie : on rebouche le trou avec la couleur d'à côté
          const t = parNom[n]; if (!bouge(t)) continue;
          x.beginPath(); x.arc((t.f.rond[0] - f.c[0]) * k, (t.f.rond[1] - f.c[1]) * k, t.f.rond[2] * k + 1, 0, Math.PI * 2); x.fillStyle = t.teinte; x.fill();
        }
        x.restore();
      }
    }
    function teintes() { // la couleur de fond de chaque trou, et une teinte moyenne pour l'ombre de chaque forme
      const t = document.createElement('canvas'); t.width = L0; t.height = H0; const g = t.getContext('2d', { willReadFrequently: true }); g.drawImage(source, 0, 0);
      const px = (a, b) => { const d = g.getImageData(Math.round(a), Math.round(b), 1, 1).data; return `rgb(${d[0]},${d[1]},${d[2]})`; };
      pieces.forEach(p => { p.teinte = px(...(p.f.fond || p.f.c)); });
    }
    function arreter() { if (!moteur) return; if (lien) { M.Composite.remove(moteur.world, lien); lien = null; } M.Engine.clear(moteur); moteur = null; pieces.forEach(p => { p.corps = null; }); cv.classList.remove('tenu'); }
    function tomber() {
      const { Engine, Bodies, Composite, Body } = M;
      moteur = Engine.create({ gravity: { x: 0, y: 1.25 } });
      const e = 200 * dpr;
      Composite.add(moteur.world, [Bodies.rectangle(W / 2, H + e / 2, W * 3, e, { isStatic: true }), Bodies.rectangle(-e / 2, H / 2, e, H * 4, { isStatic: true }), Bodies.rectangle(W + e / 2, H / 2, e, H * 4, { isStatic: true }), Bodies.rectangle(W / 2, -H * 1.5 - e / 2, W * 3, e, { isStatic: true })]);
      const opt = { restitution: .25, friction: .6, frictionAir: .008, density: .0016 };
      pieces.forEach(p => {
        const f = p.f;
        // les petites formes posées sur les grandes ne se cognent à rien au début : sinon elles exploseraient dès le départ
        const filtre = f.rond && f.nom !== 'soleil' ? { category: 4, mask: 1 | 4 } : { category: 2, mask: 1 | 2 };
        p.corps = f.rond ? Bodies.circle(p.x, p.y, f.rond[2] * k * .97, { ...opt, collisionFilter: filtre })
          : Bodies.fromVertices(p.x, p.y, [f.poly.map(([a, b]) => ({ x: (a - f.c[0]) * k * .985, y: (b - f.c[1]) * k * .985 }))], { ...opt, collisionFilter: filtre });
        if (f.nom === 'soleil') p.corps.collisionFilter = { category: 4, mask: 1 | 4 };
        Body.setPosition(p.corps, { x: p.x, y: p.y }); Body.setAngle(p.corps, p.a);
        Body.setAngularVelocity(p.corps, (Math.random() - .5) * .06); Body.setVelocity(p.corps, { x: (Math.random() - .5) * 3 * dpr, y: -Math.random() * 2 * dpr });
        Composite.add(moteur.world, p.corps);
      });
      tChute = performance.now(); etat = 'chute'; dire(); lancer(); ctx.annoncer?.('Les formes tombent.');
    }
    function recomposer() { arreter(); etat = 'retour'; tRetour = performance.now(); pieces.forEach(p => { p.dx = p.x; p.dy = p.y; p.da = Math.atan2(Math.sin(p.a), Math.cos(p.a)); }); dire('Chaque forme retrouve sa place.'); lancer(); }
    function boucle(t) {
      raf = 0; if (!vivant) return;
      if (etat === 'chute' && moteur) {
        if (tChute && t - tChute > 650) { tChute = 0; pieces.forEach(p => { p.corps.collisionFilter.mask = 1 | 2 | 4; }); } // tout se cogne
        M.Engine.update(moteur, 1000 / 120); M.Engine.update(moteur, 1000 / 120);
        pieces.forEach(p => { p.x = p.corps.position.x; p.y = p.corps.position.y; p.a = p.corps.angle; });
        dessiner(); raf = requestAnimationFrame(boucle);
      } else if (etat === 'retour') {
        const q = Math.min(1, (t - tRetour) / (ctx.reduireMouvement ? 1 : 800)), e = 1 - (1 - q) ** 3;
        pieces.forEach(p => { const m = maison(p); p.x = p.dx + (m.x - p.dx) * e; p.y = p.dy + (m.y - p.dy) * e; p.a = p.da * (1 - e); });
        if (q >= 1) { etat = 'grille'; pieces.forEach(p => { Object.assign(p, maison(p)); p.a = 0; }); dire(); }
        dessiner(); if (etat === 'retour') raf = requestAnimationFrame(boucle);
      }
    }
    const lancer = () => { if (!raf && vivant) raf = requestAnimationFrame(boucle); };

    bG.addEventListener('click', async () => {
      if (etat === 'chute') { recomposer(); return; }
      if (etat !== 'grille' || !source) return;
      if (!M) { bG.disabled = true; try { M = await chargerMatter(ctx.racine); } catch { dire('La gravité ne se charge pas. Recharge la page.'); bG.disabled = false; return; } bG.disabled = false; if (!vivant) return; }
      tomber();
    });
    bS.addEventListener('click', () => { if (etat !== 'chute') return; pieces.forEach(p => { M.Body.setVelocity(p.corps, { x: (Math.random() - .5) * 26 * dpr, y: -(10 + Math.random() * 16) * dpr }); M.Body.setAngularVelocity(p.corps, (Math.random() - .5) * .4); }); });
    // attraper une forme : un élastique entre le pointeur et le point où on l'a prise (les petites formes d'abord)
    const point = e => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height }; };
    cv.addEventListener('pointerdown', e => {
      if (etat !== 'chute' || !moteur) return; const p = point(e);
      const touches = M.Query.point(pieces.map(q => q.corps), p); const b = touches.find(c => c.circleRadius) || touches[0]; if (!b) return;
      e.preventDefault(); const dx = p.x - b.position.x, dy = p.y - b.position.y, c = Math.cos(-b.angle), s = Math.sin(-b.angle);
      lien = M.Constraint.create({ pointA: p, bodyB: b, pointB: { x: dx * c - dy * s, y: dx * s + dy * c }, stiffness: .18, damping: .12, length: 0 });
      M.Composite.add(moteur.world, lien); cv.setPointerCapture(e.pointerId); cv.classList.add('tenu');
    });
    cv.addEventListener('pointermove', e => { if (lien) { const p = point(e); lien.pointA.x = p.x; lien.pointA.y = p.y; } });
    const lacher = () => { if (lien && moteur) M.Composite.remove(moteur.world, lien); lien = null; cv.classList.remove('tenu'); };
    cv.addEventListener('pointerup', lacher); cv.addEventListener('pointercancel', lacher);

    const im = ctx.artiste.images?.[0];
    charger(`${ctx.racine}img/t/${im ? im.f : 'ref.jpg'}`).then(i => { if (!vivant) return; source = i; try { teintes(); } catch {} mesurer(); })
      .catch(() => { if (!vivant) return; zone.querySelector('[data-provisoire]').hidden = false; dire('L’affiche manque : pas de formes à faire tomber.'); });
    const ro = new ResizeObserver(mesurer); ro.observe(scene);
    mesurer();
    return () => { vivant = false; cancelAnimationFrame(raf); ro.disconnect(); arreter(); };
  },
};
