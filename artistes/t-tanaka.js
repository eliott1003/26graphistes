// T · Ikko Tanaka — Nihon Buyo (1981).
// L'affiche est faite de quelques formes rangées dans une grille. Un bouton « Gravité » : la grille lâche, les carreaux tombent
// et s'entassent ; ensuite on les attrape, on les lance, on les empile. « Recomposer » les renvoie chacun à sa place.
//
// L'affiche est protégée (Ikko Tanaka est mort en 2002) : elle n'est PAS redessinée en code. L'atelier découpe l'image fournie
// par Eliott (première image de l'artiste dans labo/donnees.js, img/t/ref.jpg) selon GRILLE.
// PROVISOIRE tant que l'image manque : douze carreaux abstraits (quarts de disque et aplats) composés pour l'atelier ;
// ce n'est PAS le visage de Nihon Buyo, et l'atelier le dit à l'écran.
// Physique : matter-js (licence MIT), dans vendor/matter/.

const GRILLE = { colonnes: 3, lignes: 4 }; // à caler sur la grille de l'affiche quand l'image arrive
const FORMAT = 728 / 1030;                 // format B1, pour la version provisoire
const TEINTES = ['#f2ead8', '#1b1b1b', '#e4572e', '#2f6f6a', '#f0b429', '#6b3fa0', '#ff8fb1', '#2a4d9b'];
const charger = src => new Promise((ok, non) => { const im = new Image(); im.onload = () => ok(im); im.onerror = non; im.src = src; });
let attente = null;
const chargerMatter = racine => attente || (attente = new Promise((ok, non) => { // une seule fois ; la bibliothèque se range dans window.Matter
  if (window.Matter) return ok(window.Matter);
  const s = document.createElement('script'); s.src = racine + 'vendor/matter/matter.min.js'; s.onload = () => ok(window.Matter); s.onerror = () => { attente = null; non(new Error('matter')); }; document.head.append(s);
}));

function provisoire() { // des carreaux abstraits : un aplat, et un quart de disque dans un coin tiré au sort (toujours le même tirage)
  const { colonnes: C, lignes: R } = GRILLE, c = 240, t = document.createElement('canvas'); t.width = C * c; t.height = R * c; const g = t.getContext('2d');
  let graine = 7; const tir = () => (graine = (graine * 16807) % 2147483647) / 2147483647;
  for (let r = 0; r < R; r++) for (let k = 0; k < C; k++) {
    const a = TEINTES[Math.floor(tir() * TEINTES.length)]; let b = a; while (b === a) b = TEINTES[Math.floor(tir() * TEINTES.length)];
    g.fillStyle = a; g.fillRect(k * c, r * c, c, c);
    const coin = Math.floor(tir() * 4), cx = k * c + (coin % 2) * c, cy = r * c + (coin > 1 ? c : 0);
    g.save(); g.beginPath(); g.rect(k * c, r * c, c, c); g.clip(); g.fillStyle = b; g.beginPath(); g.arc(cx, cy, c * (tir() < .3 ? .5 : 1), 0, 7); g.fill(); g.restore();
  }
  return t;
}

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
        <div class="tk-scene"><canvas data-export aria-label="Une affiche faite de carreaux rangés dans une grille. Le bouton Gravité les fait tomber."></canvas></div>
        <div class="tk-cote">
          <p class="tk-compte" aria-hidden="true">Grille</p>
          <p class="etiquette" aria-live="polite"></p>
          <p class="note" data-provisoire hidden>Version provisoire : ces carreaux sont composés pour l’atelier, ce n’est pas l’affiche Nihon Buyo. L’atelier découpera la vraie dès qu’Eliott l’aura envoyée.</p>
          <div class="tk-boutons">
            <button type="button" class="bouton plein" data-gravite>Gravité</button>
            <button type="button" class="bouton" data-secouer hidden>Secouer</button>
          </div>
        </div>
      </div>`;
    const scene = zone.querySelector('.tk-scene'), cv = scene.querySelector('canvas'), x = cv.getContext('2d');
    const compte = zone.querySelector('.tk-compte'), info = zone.querySelector('.etiquette'), bG = zone.querySelector('[data-gravite]'), bS = zone.querySelector('[data-secouer]');
    const { colonnes: C, lignes: R } = GRILLE;
    let W = 0, H = 0, dpr = 1, vivant = true, raf = 0, source = provisoire(), bx = 0, by = 0, cw = 0, ch = 0;
    let M = null, moteur = null, murs = [], lien = null, etat = 'grille', tRetour = 0; // grille, chute, retour
    // un carreau : sa case, sa place et son angle à l'écran, son corps physique quand la gravité est en marche
    const carreaux = Array.from({ length: C * R }, (_, i) => ({ r: Math.floor(i / C), c: i % C, x: 0, y: 0, a: 0, corps: null, dx: 0, dy: 0, da: 0 }));
    const maison = k => ({ x: bx + (k.c + .5) * cw, y: by + (k.r + .5) * ch });

    function dire(t) {
      compte.textContent = etat === 'chute' ? 'Chute' : 'Grille';
      info.textContent = t || (etat === 'chute' ? 'Attrape un carreau, lance-le, empile-les.' : 'Tout tient dans la grille. Appuie sur Gravité.');
      bG.textContent = etat === 'chute' ? 'Recomposer' : 'Gravité'; bS.hidden = etat !== 'chute'; cv.classList.toggle('libre', etat === 'chute');
    }
    function mesurer() {
      const r = scene.getBoundingClientRect(); if (!r.width || !r.height) return;
      const kx = W ? Math.round(r.width * Math.min(devicePixelRatio || 1, 2)) / W : 1, ky = H ? Math.round(r.height * Math.min(devicePixelRatio || 1, 2)) / H : 1;
      dpr = Math.min(devicePixelRatio || 1, 2); W = cv.width = Math.round(r.width * dpr); H = cv.height = Math.round(r.height * dpr);
      const format = source.width / source.height, bh = Math.min(H * .72, W * .8 / format), bw = bh * format;
      bx = (W - bw) / 2; by = (H - bh) / 2; cw = bw / C; ch = bh / R;
      if (etat === 'chute' && M) { // la scène a changé de taille : on repart de la grille, plus simple et plus sûr
        arreter(); carreaux.forEach(k => { k.x *= kx; k.y *= ky; }); etat = 'retour'; tRetour = performance.now(); carreaux.forEach(k => { k.dx = k.x; k.dy = k.y; k.da = k.a; }); lancer();
      } else if (etat === 'grille') carreaux.forEach(k => { Object.assign(k, maison(k)); k.a = 0; });
      dire(); dessiner();
    }
    function dessiner() {
      if (!W) return;
      x.fillStyle = ctx.couleurs.fond; x.fillRect(0, 0, W, H);
      x.fillStyle = 'rgba(0,0,0,.2)'; x.fillRect(bx, by, cw * C, ch * R);                  // la place de l'affiche
      x.strokeStyle = 'rgba(255,255,255,.16)'; x.lineWidth = Math.max(1, dpr); x.beginPath();  // et sa grille
      for (let c = 0; c <= C; c++) { x.moveTo(bx + c * cw, by); x.lineTo(bx + c * cw, by + ch * R); }
      for (let r = 0; r <= R; r++) { x.moveTo(bx, by + r * ch); x.lineTo(bx + cw * C, by + r * ch); }
      x.stroke();
      const sw = source.width / C, sh = source.height / R;
      for (const k of carreaux) {
        x.save(); x.translate(k.x, k.y); x.rotate(k.a);
        if (etat !== 'grille') { x.shadowColor = 'rgba(0,0,0,.35)'; x.shadowBlur = cw * .06; x.shadowOffsetY = cw * .02; }
        x.drawImage(source, k.c * sw, k.r * sh, sw, sh, -cw / 2 - .5, -ch / 2 - .5, cw + 1, ch + 1); x.restore();
      }
    }
    function arreter() { if (!moteur) return; if (lien) { M.Composite.remove(moteur.world, lien); lien = null; } M.Engine.clear(moteur); moteur = null; carreaux.forEach(k => { k.corps = null; }); cv.classList.remove('tenu'); }
    function tomber() {
      const { Engine, Bodies, Composite, Body } = M;
      moteur = Engine.create({ gravity: { x: 0, y: 1.25 } });
      const e = 200 * dpr;
      murs = [Bodies.rectangle(W / 2, H + e / 2, W * 3, e, { isStatic: true }), Bodies.rectangle(-e / 2, H / 2, e, H * 4, { isStatic: true }), Bodies.rectangle(W + e / 2, H / 2, e, H * 4, { isStatic: true }), Bodies.rectangle(W / 2, -H * 1.5 - e / 2, W * 3, e, { isStatic: true })];
      Composite.add(moteur.world, murs);
      carreaux.forEach(k => { // un petit élan différent pour chacun : la grille se défait de façon lisible
        k.corps = Bodies.rectangle(k.x, k.y, cw * .985, ch * .985, { restitution: .28, friction: .55, frictionAir: .008, density: .0016, angle: k.a });
        Body.setAngularVelocity(k.corps, (Math.random() - .5) * .08); Body.setVelocity(k.corps, { x: (Math.random() - .5) * 3 * dpr, y: -Math.random() * 2 * dpr });
        Composite.add(moteur.world, k.corps);
      });
      etat = 'chute'; dire(); lancer(); ctx.annoncer?.('Les carreaux tombent.');
    }
    function recomposer() { arreter(); etat = 'retour'; tRetour = performance.now(); carreaux.forEach(k => { k.dx = k.x; k.dy = k.y; k.da = Math.atan2(Math.sin(k.a), Math.cos(k.a)); }); dire('Chaque carreau retrouve sa place.'); lancer(); }
    function boucle(t) {
      raf = 0; if (!vivant) return;
      if (etat === 'chute' && moteur) {
        M.Engine.update(moteur, 1000 / 120); M.Engine.update(moteur, 1000 / 120);
        carreaux.forEach(k => { k.x = k.corps.position.x; k.y = k.corps.position.y; k.a = k.corps.angle; });
        dessiner(); raf = requestAnimationFrame(boucle);
      } else if (etat === 'retour') {
        const p = Math.min(1, (t - tRetour) / (ctx.reduireMouvement ? 1 : 700)), e = 1 - (1 - p) ** 3;
        carreaux.forEach(k => { const m = maison(k); k.x = k.dx + (m.x - k.dx) * e; k.y = k.dy + (m.y - k.dy) * e; k.a = k.da * (1 - e); });
        if (p >= 1) { etat = 'grille'; dire(); }
        dessiner(); if (etat === 'retour') raf = requestAnimationFrame(boucle);
      }
    }
    const lancer = () => { if (!raf && vivant) raf = requestAnimationFrame(boucle); };

    bG.addEventListener('click', async () => {
      if (etat === 'chute') { recomposer(); return; }
      if (etat !== 'grille') return;
      if (!M) { bG.disabled = true; try { M = await chargerMatter(ctx.racine); } catch { dire('La gravité ne se charge pas. Recharge la page.'); bG.disabled = false; return; } bG.disabled = false; if (!vivant) return; }
      tomber();
    });
    bS.addEventListener('click', () => { if (etat !== 'chute') return; carreaux.forEach(k => { M.Body.setVelocity(k.corps, { x: (Math.random() - .5) * 26 * dpr, y: -(10 + Math.random() * 16) * dpr }); M.Body.setAngularVelocity(k.corps, (Math.random() - .5) * .5); }); });
    // attraper un carreau : un élastique entre le pointeur et le point où on l'a pris
    const point = e => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height }; };
    cv.addEventListener('pointerdown', e => {
      if (etat !== 'chute' || !moteur) return; const p = point(e), b = M.Query.point(carreaux.map(k => k.corps), p)[0]; if (!b) return;
      e.preventDefault(); const dx = p.x - b.position.x, dy = p.y - b.position.y, c = Math.cos(-b.angle), s = Math.sin(-b.angle);
      lien = M.Constraint.create({ pointA: p, bodyB: b, pointB: { x: dx * c - dy * s, y: dx * s + dy * c }, stiffness: .18, damping: .12, length: 0 });
      M.Composite.add(moteur.world, lien); cv.setPointerCapture(e.pointerId); cv.classList.add('tenu');
    });
    cv.addEventListener('pointermove', e => { if (lien) { const p = point(e); lien.pointA.x = p.x; lien.pointA.y = p.y; } });
    const lacher = () => { if (lien && moteur) M.Composite.remove(moteur.world, lien); lien = null; cv.classList.remove('tenu'); };
    cv.addEventListener('pointerup', lacher); cv.addEventListener('pointercancel', lacher);

    const im = ctx.artiste.images?.[0];
    zone.querySelector('[data-provisoire]').hidden = !!im;
    if (im) charger(`${ctx.racine}img/t/${im.f}`).then(i => { if (!vivant) return; source = i; if (etat !== 'grille') { arreter(); etat = 'grille'; } mesurer(); })
      .catch(() => { if (!vivant) return; console.warn('Tanaka : image introuvable, carreaux provisoires'); zone.querySelector('[data-provisoire]').hidden = false; });
    const ro = new ResizeObserver(mesurer); ro.observe(scene);
    mesurer();
    return () => { vivant = false; cancelAnimationFrame(raf); ro.disconnect(); arreter(); };
  },
};
