// R · Paul Rand — logos IBM (1956), Westinghouse (1960), UPS (1961), ABC (1962), Cummins (1962), NeXT (1986), Morningstar (1991).
// Un anneau en 3D : les logos tournent, celui de devant est net, ceux du fond sont flous. On tourne en glissant, à la molette ou
// avec les flèches ; un clic amène un logo devant, avec l'année, le client et l'idée. Pas de version en grille.
//
// Les logos sont des marques déposées : ils ne sont PAS redessinés en code. L'atelier affiche les fichiers fournis par Eliott.
// PROVISOIRE tant qu'ils manquent : chaque carte porte seulement le nom du client, et l'atelier le dit.
// Quand un logo arrive : le ranger dans img/r/ (SVG de préférence, fond transparent ou blanc) et ajouter son nom de fichier
// dans RECUS ci-dessous. Exemple : const RECUS = { ibm: 'ibm.svg', ups: 'ups.svg' };

const RECUS = { ibm: 'ibm.png', westinghouse: 'westinghouse.png', ups: 'ups.png', abc: 'abc.png', cummins: 'cummins.png', next: 'next.png', morningstar: 'morningstar.png' }; // id du logo → nom du fichier dans img/r/
const LOGOS = [
  { id: 'ibm', client: 'IBM', an: '1956', idee: 'Trois lettres égyptiennes, massives et stables. En 1972, Rand les raye de bandes horizontales : le logo devient plus léger et fait penser à la vitesse.' },
  { id: 'westinghouse', client: 'Westinghouse', an: '1960', idee: 'Un W fait de points et de traits, dans un cercle : on y lit un circuit électrique, et presque un visage.' },
  { id: 'ups', client: 'UPS', an: '1961', idee: 'Un bouclier, et dessus un paquet ficelé d’un nœud : la sécurité et le cadeau dans le même signe. Il a servi plus de quarante ans.' },
  { id: 'abc', client: 'ABC', an: '1962', idee: 'Trois minuscules rondes dans un disque noir. Rien d’autre : des cercles, répétés.' },
  { id: 'cummins', client: 'Cummins', an: '1962', idee: 'Un grand C qui abrite le nom de la marque : un signe simple, lisible sur un moteur.' },
  { id: 'next', client: 'NeXT', an: '1986', idee: 'Pour Steve Jobs : un cube noir penché de 28°, le nom sur deux lignes, un seul « e » en minuscule. Le logo est livré avec un livret qui explique chaque choix.' },
  { id: 'morningstar', client: 'Morningstar', an: '1991', idee: 'Un mot seul, en capitales : le O est coupé et devient un soleil qui se lève.' },
];
const N = LOGOS.length, PAS = 360 / N;

export default {
  lettre: 'R',
  fleches: true, // flèches gauche et droite : tourner l'anneau (PageUp / PageDown changent de lettre)
  css: `
.rd{display:grid;grid-template-columns:minmax(0,1fr) minmax(190px,250px);gap:clamp(14px,2.4cqw,36px);align-items:end;height:100cqh}
.rd-scene{height:100cqh;min-width:0;position:relative;overflow:hidden;perspective:1500px;perspective-origin:50% 46%;touch-action:pan-y;cursor:grab;user-select:none;-webkit-user-select:none;--carte:min(46cqh,24cqw)}
.rd-scene.tenu{cursor:grabbing}
.rd-anneau{position:absolute;left:50%;top:48%;width:0;height:0;transform-style:preserve-3d}
.rd-carte{position:absolute;left:calc(var(--carte)/-2);top:calc(var(--carte)/-2);width:var(--carte);height:var(--carte);background:#fff;color:#141414;display:grid;place-items:center;border:0;padding:0;cursor:pointer;box-shadow:0 30px 50px -30px rgba(0,0,0,.7);backface-visibility:visible;font:inherit}
.rd-carte img{width:72%;height:72%;object-fit:contain;pointer-events:none}
.rd-carte .rd-nom{font:800 calc(var(--carte)*.13)/1 Archivo,sans-serif;letter-spacing:-.02em;text-align:center;padding:0 8%}
.rd-carte .rd-manque{position:absolute;left:0;right:0;bottom:7%;font:500 calc(var(--carte)*.038)/1.2 "DM Mono",monospace;text-align:center;opacity:.55}
.rd-carte.vide{outline:1.5px dashed rgba(0,0,0,.35);outline-offset:calc(var(--carte)*-.06)}
.rd-cote{display:grid;gap:10px;align-content:end;padding-bottom:4px}
.rd-cote p{margin:0}
.rd-an{font:900 clamp(40px,7cqw,76px)/.85 "Sofia Cond",Archivo,sans-serif}
.rd-client{font:800 clamp(18px,2.6cqw,26px)/1.05 Archivo,sans-serif}
.rd-idee{font:400 clamp(14px,1.75cqw,17px)/1.35 Caslon,Georgia,serif;min-height:7.2em}
.rd-boutons{display:flex;flex-wrap:wrap;gap:8px}
@media (max-width:760px){.rd{grid-template-columns:1fr;height:auto}.rd-scene{height:auto;aspect-ratio:1/1;--carte:31cqw}.rd-idee{min-height:0}}
`,
  monter(zone, ctx) {
    zone.innerHTML = `
      <div class="rd">
        <div class="rd-scene" role="group" aria-label="Un anneau de sept logos de Paul Rand"><div class="rd-anneau"></div></div>
        <div class="rd-cote">
          <p class="rd-an" aria-hidden="true"></p>
          <p class="rd-client" aria-live="polite"></p>
          <p class="rd-idee"></p>
          <p class="note" data-provisoire hidden>Version provisoire : les logos sont des marques déposées, ils ne sont pas redessinés ici. Chaque carte affichera le vrai logo dès qu’Eliott aura envoyé les fichiers.</p>
          <div class="rd-boutons">
            <button type="button" class="bouton" data-pas="-1" aria-label="Logo précédent">←</button>
            <button type="button" class="bouton plein" data-pas="1" aria-label="Logo suivant">Logo suivant →</button>
          </div>
        </div>
      </div>`;
    const scene = zone.querySelector('.rd-scene'), anneau = zone.querySelector('.rd-anneau');
    const an = zone.querySelector('.rd-an'), client = zone.querySelector('.rd-client'), idee = zone.querySelector('.rd-idee');
    anneau.innerHTML = LOGOS.map((l, i) => RECUS[l.id]
      ? `<button type="button" class="rd-carte" data-i="${i}" aria-label="${l.client}, ${l.an}"><img src="${ctx.racine}img/r/${RECUS[l.id]}" alt="Logo ${l.client}" draggable="false"></button>`
      : `<button type="button" class="rd-carte vide" data-i="${i}" aria-label="${l.client}, ${l.an}"><span class="rd-nom">${l.client}</span><span class="rd-manque">img/r/${l.id}.svg</span></button>`).join('');
    const cartes = [...anneau.children];
    zone.querySelector('[data-provisoire]').hidden = LOGOS.every(l => RECUS[l.id]);

    let rot = 0, but = 0, vit = 0, libre = !ctx.reduireMouvement, vivant = true, raf = 0, devant = -1, rayon = 300, tire = null, bouge = 0;
    const mod = (n, m) => ((n % m) + m) % m;
    function mesurer() { const c = cartes[0].getBoundingClientRect().width || 200; rayon = c * 1.6; poser(); }
    function poser() {
      anneau.style.transform = `translateZ(${-rayon}px) rotateY(${rot}deg)`;
      cartes.forEach((c, i) => {
        const a = (i * PAS + rot) * Math.PI / 180, d = Math.cos(a); // 1 devant, -1 au fond
        c.style.transform = `rotateY(${i * PAS}deg) translateZ(${rayon}px)`;
        c.style.filter = d > .985 ? 'none' : `blur(${((1 - d) * 5.5).toFixed(2)}px)`;
        c.style.opacity = (.3 + .7 * ((d + 1) / 2) ** 1.5).toFixed(3);
      });
      const i = mod(Math.round(-rot / PAS), N);
      if (i !== devant) { devant = i; const l = LOGOS[i]; an.textContent = l.an; client.textContent = l.client; idee.textContent = l.idee; cartes.forEach((c, k) => c.setAttribute('aria-current', k === i)); }
    }
    function boucle() {
      raf = 0; if (!vivant) return;
      if (tire) { /* la main mène */ }
      else if (libre) { rot -= .11; but = rot; }               // au départ, l'anneau tourne doucement tout seul
      else if (Math.abs(vit) > .05) { rot += vit; vit *= .93; if (Math.abs(vit) <= .05) but = Math.round(rot / PAS) * PAS; else but = rot; } // élan après un glisser
      else { const d = but - rot; if (Math.abs(d) < .03) { rot = but; poser(); return; } rot += d * (ctx.reduireMouvement ? 1 : .14); }
      poser(); raf = requestAnimationFrame(boucle);
    }
    const lancer = () => { if (!raf && vivant) raf = requestAnimationFrame(boucle); };
    function versLogo(i) { libre = false; vit = 0; const ici = -rot / PAS, d = mod(i - ici + N / 2, N) - N / 2; but = rot - d * PAS; but = Math.round(but / PAS) * PAS; lancer(); }
    function pas(p) { libre = false; vit = 0; but = Math.round((but) / PAS) * PAS - p * PAS; lancer(); }

    scene.addEventListener('pointerdown', e => { libre = false; vit = 0; bouge = 0; tire = { x: e.clientX, rot, t: performance.now(), dx: 0 }; scene.classList.add('tenu'); });
    const surMouvement = e => {
      if (!tire) return; const dx = e.clientX - tire.x; bouge = Math.max(bouge, Math.abs(dx));
      const k = 150 / (scene.getBoundingClientRect().width || 600); rot = tire.rot + dx * k; vit = (dx - tire.dx) * k; tire.dx = dx; lancer();
    };
    const surFin = () => { if (!tire) return; tire = null; scene.classList.remove('tenu'); if (bouge < 6) vit = 0; but = Math.round(rot / PAS) * PAS; lancer(); };
    addEventListener('pointermove', surMouvement); addEventListener('pointerup', surFin); addEventListener('pointercancel', surFin);
    anneau.addEventListener('click', e => { const c = e.target.closest('.rd-carte'); if (c && bouge < 6) versLogo(+c.dataset.i); });
    scene.addEventListener('wheel', e => { e.preventDefault(); if (Math.abs(e.deltaY) + Math.abs(e.deltaX) < 4) return; libre = false; vit = 0; rot -= (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY) * .12; but = Math.round(rot / PAS) * PAS; lancer(); }, { passive: false });
    const surTouche = e => {
      if (e.metaKey || e.ctrlKey || e.altKey || (e.target instanceof Element && e.target.closest('input,textarea,select'))) return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); pas(-1); } else if (e.key === 'ArrowRight') { e.preventDefault(); pas(1); }
    };
    addEventListener('keydown', surTouche);
    zone.querySelectorAll('[data-pas]').forEach(b => b.addEventListener('click', () => pas(+b.dataset.pas)));

    const ro = new ResizeObserver(mesurer); ro.observe(scene);
    mesurer(); lancer();
    return () => { vivant = false; cancelAnimationFrame(raf); ro.disconnect(); removeEventListener('pointermove', surMouvement); removeEventListener('pointerup', surFin); removeEventListener('pointercancel', surFin); removeEventListener('keydown', surTouche); };
  },
};
