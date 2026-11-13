// A · Adrian Frutiger — le caractère Frutiger, dessiné pour la signalétique de Roissy-Charles-de-Gaulle (années 1970).
// Une page de spécimen, vide au départ, sur le jaune des panneaux de l'aéroport. Un avion la survole ligne par ligne :
// sur son passage, les lettres apparaissent et restent. On peut relancer l'avion, ou le piloter soi-même à la souris.
//
// POLICE : le Frutiger est un caractère sous licence, il n'est pas dans le dépôt. Si l'ordinateur l'a (Frutiger, Frutiger LT Std,
// Frutiger Neue), l'atelier s'en sert ; sinon il compose en Source Sans (libre, humaniste, la plus proche de fonts/) et le dit.
// L'avion est un pictogramme dessiné en code, simple ; ce n'est pas un pictogramme de la signalétique d'origine.

const LIGNES = ['ABCDEFGHIJKLM', 'NOPQRSTUVWXYZ', 'abcdefghijklm', 'nopqrstuvwxyz', '0123456789&?!'];
const PANNEAU = [{ t: 'Départs', g: 700 }, { t: 'Departures', g: 400 }]; // la dernière ligne : un panneau bilingue, gras puis maigre
const VRAIES = ['Frutiger', 'Frutiger LT Std', 'Frutiger Neue', 'Frutiger Next'];
const JAUNE = '#ffd200', NOIR = '#16171a', NUIT = '#172a4d';
const DUREE_LIGNE = 1250; // millisecondes pour survoler une ligne

function policeInstallee(nom) { // une police de l'ordinateur change la largeur d'un texte témoin
  const g = document.createElement('canvas').getContext('2d'), t = 'mmmmmmmmlliWQ@';
  g.font = '72px monospace'; const a = g.measureText(t).width; g.font = `72px "${nom}", monospace`; return Math.abs(g.measureText(t).width - a) > .5;
}
// l'avion vu de dessus, nez vers la droite, dans un carré de -1 à 1
function avion(g, k) {
  g.beginPath();
  g.moveTo(1 * k, 0); g.quadraticCurveTo(.92 * k, -.09 * k, .7 * k, -.1 * k); g.lineTo(.22 * k, -.1 * k);
  g.lineTo(-.28 * k, -.92 * k); g.lineTo(-.46 * k, -.92 * k); g.lineTo(-.2 * k, -.1 * k); g.lineTo(-.6 * k, -.09 * k);
  g.lineTo(-.82 * k, -.36 * k); g.lineTo(-.95 * k, -.36 * k); g.lineTo(-.84 * k, 0);
  g.lineTo(-.95 * k, .36 * k); g.lineTo(-.82 * k, .36 * k); g.lineTo(-.6 * k, .09 * k); g.lineTo(-.2 * k, .1 * k);
  g.lineTo(-.46 * k, .92 * k); g.lineTo(-.28 * k, .92 * k); g.lineTo(.22 * k, .1 * k); g.lineTo(.7 * k, .1 * k);
  g.quadraticCurveTo(.92 * k, .09 * k, 1 * k, 0); g.closePath();
}

export default {
  lettre: 'A',
  css: `
.fr{display:grid;grid-template-columns:minmax(0,1fr) minmax(170px,230px);gap:clamp(14px,2.4cqw,36px);align-items:end;height:100cqh}
.fr-scene{height:100cqh;min-width:0;background:${JAUNE};box-shadow:0 26px 50px -30px rgba(0,0,0,.6)}
.fr-scene canvas{display:block;width:100%;height:100%;touch-action:none}
.fr-scene.pilote canvas{cursor:none}
.fr-cote{display:grid;gap:12px;align-content:end;padding-bottom:4px}
.fr-cote p{margin:0}
.fr-compte{font:900 clamp(40px,7cqw,76px)/.85 "Sofia Cond",Archivo,sans-serif}
.fr-boutons{display:flex;flex-wrap:wrap;gap:8px}
@media (max-width:760px){.fr{grid-template-columns:1fr;height:auto}.fr-scene{height:auto;aspect-ratio:4/5}}
`,
  monter(zone, ctx) {
    zone.innerHTML = `
      <div class="fr">
        <div class="fr-scene"><canvas data-export aria-label="Une page de spécimen du Frutiger : un avion la survole et les lettres apparaissent"></canvas></div>
        <div class="fr-cote">
          <p class="fr-compte" aria-hidden="true"></p>
          <p class="etiquette" aria-live="polite"></p>
          <p class="note" data-police></p>
          <div class="fr-boutons">
            <button type="button" class="bouton plein" data-relancer>Relancer l’avion</button>
            <button type="button" class="bouton" data-piloter aria-pressed="false">Piloter l’avion</button>
          </div>
        </div>
      </div>`;
    const scene = zone.querySelector('.fr-scene'), cv = scene.querySelector('canvas'), x = cv.getContext('2d');
    const compte = zone.querySelector('.fr-compte'), info = zone.querySelector('.etiquette'), bPilote = zone.querySelector('[data-piloter]');
    const vraie = VRAIES.find(policeInstallee);
    const POLICE = vraie ? `"${vraie}", "Source Sans", sans-serif` : '"Source Sans", "Segoe UI", Helvetica, Arial, sans-serif';
    zone.querySelector('[data-police]').textContent = vraie
      ? `Composé en ${vraie}, le caractère installé sur cet ordinateur.`
      : 'Le Frutiger est sous licence : cette page est composée en Source Sans, un caractère libre de la même famille de formes.';

    let W = 0, H = 0, dpr = 1, vivant = true, raf = 0, signes = [], rangs = [], hl = 0;
    let mode = 'auto', t0 = 0, av = { x: -999, y: 0, a: 0, vu: false }, cible = null, dernier = 0;

    function composer() { // la place de chaque signe ; on garde ceux qui sont déjà apparus
      const anciens = signes; signes = []; rangs = [];
      const n = LIGNES.length + 1, mx = W * .055, my = H * .06; hl = (H - 2 * my) / n;
      const cell = (W - 2 * mx) / 13, corps = Math.min(hl * .74, cell * 1.18);
      LIGNES.forEach((ligne, r) => {
        const y = my + hl * (r + .5); rangs.push(y);
        [...ligne].forEach((ch, c) => signes.push({ ch, x: mx + cell * (c + .5), y, corps, g: r < 2 ? 700 : 400, centre: true, r }));
      });
      const y = my + hl * (n - .5), cp = Math.min(hl * .62, (W - 2 * mx) / 9.6); rangs.push(y);
      let px = mx;
      // une flèche de panneau, puis les deux langues
      signes.push({ fleche: true, x: px + cp * .42, y, corps: cp, r: n - 1 }); px += cp * 1.12;
      PANNEAU.forEach(({ t, g }) => {
        x.font = `${g} ${cp}px ${POLICE}`;
        [...t].forEach(ch => { const w = x.measureText(ch).width; signes.push({ ch, x: px, y, corps: cp, g, centre: false, r: n - 1, gris: g === 400 }); px += w; });
        px += cp * .34;
      });
      signes.forEach((s, i) => { s.ne = anciens[i]?.ne ?? 0; });
    }
    function mesurer() {
      const r = scene.getBoundingClientRect(); if (!r.width || !r.height) return;
      dpr = Math.min(devicePixelRatio || 1, 2); W = cv.width = Math.round(r.width * dpr); H = cv.height = Math.round(r.height * dpr);
      composer(); dessiner(performance.now());
    }
    function dire() {
      const n = signes.filter(s => s.ne).length; compte.textContent = `${n} / ${signes.length}`;
      info.textContent = n === signes.length ? 'Le spécimen est complet.' : mode === 'pilote' ? 'Survole la page : les signes apparaissent sous l’avion.' : n ? 'L’avion survole la page, ligne par ligne.' : 'La page est vide : l’avion arrive.';
    }
    function reveler(s, t) { if (!s.ne) { s.ne = t; return true; } return false; }
    function dessiner(t) {
      if (!W) return;
      x.fillStyle = JAUNE; x.fillRect(0, 0, W, H);
      x.textBaseline = 'middle';
      for (const s of signes) {
        if (!s.ne) continue;
        const k = ctx.reduireMouvement ? 1 : Math.min(1, (t - s.ne) / 200), e = 1 - (1 - k) ** 3;
        x.save(); x.translate(s.x, s.y); x.globalAlpha = e;
        if (s.fleche) { // flèche droite, à bouts carrés
          const c = s.corps * e; x.strokeStyle = NOIR; x.lineWidth = c * .13; x.lineCap = 'butt'; x.lineJoin = 'miter';
          x.beginPath(); x.moveTo(-c * .4, 0); x.lineTo(c * .38, 0); x.moveTo(c * .06, -c * .3); x.lineTo(c * .38, 0); x.lineTo(c * .06, c * .3); x.stroke();
        } else {
          x.font = `${s.g} ${s.corps * (.7 + .3 * e)}px ${POLICE}`; x.textAlign = s.centre ? 'center' : 'left'; x.fillStyle = s.gris ? 'rgba(22,23,26,.62)' : NOIR;
          x.fillText(s.ch, 0, s.corps * .04);
        }
        x.restore();
      }
      if (av.vu) { // l'avion et son ombre portée sur la page
        const k = hl * .52;
        x.save(); x.translate(av.x + k * .16, av.y + k * .3); x.rotate(av.a); avion(x, k); x.fillStyle = 'rgba(0,0,0,.2)'; x.fill(); x.restore();
        x.save(); x.translate(av.x, av.y); x.rotate(av.a); avion(x, k); x.fillStyle = NUIT; x.fill(); x.restore();
      }
    }
    function boucle(t) {
      raf = 0; if (!vivant) return;
      let neuf = false, encore = false;
      if (mode === 'auto') {
        const n = rangs.length, p = (t - t0) / DUREE_LIGNE, r = Math.floor(p);
        if (r >= n) { av.vu = false; mode = 'pose'; neuf = true; }
        else {
          const f = p - r, sens = r % 2 ? -1 : 1, marge = hl * .9;
          av.x = sens > 0 ? -marge + f * (W + 2 * marge) : W + marge - f * (W + 2 * marge); av.y = rangs[r]; av.a = sens > 0 ? 0 : Math.PI; av.vu = true;
          for (const s of signes) if (s.r === r && (sens > 0 ? s.x < av.x - hl * .35 : s.x > av.x + hl * .35)) neuf = reveler(s, t) || neuf;
          for (const s of signes) if (s.r < r) neuf = reveler(s, t) || neuf; // rien n'est oublié si une image saute
          encore = true;
        }
      } else if (mode === 'pilote' && cible) {
        const dx = cible.x - av.x, dy = cible.y - av.y, d = Math.hypot(dx, dy);
        if (d > 1) { av.x += dx * .18; av.y += dy * .18; if (d > hl * .08) { let da = Math.atan2(dy, dx) - av.a; da = Math.atan2(Math.sin(da), Math.cos(da)); av.a += da * .25; } encore = true; }
        av.vu = true;
        for (const s of signes) if (Math.hypot(s.x - av.x, s.y - av.y) < hl * .62) neuf = reveler(s, t) || neuf;
      }
      if (signes.some(s => s.ne && t - s.ne < 220)) encore = true;
      if (neuf || t - dernier > 400) { dire(); dernier = t; }
      dessiner(t);
      if (encore) raf = requestAnimationFrame(boucle);
    }
    const lancer = () => { if (!raf && vivant) raf = requestAnimationFrame(boucle); };
    function relancer() {
      signes.forEach(s => { s.ne = 0; });
      if (ctx.reduireMouvement && mode !== 'pilote') { const t = performance.now(); signes.forEach(s => { s.ne = t; }); mode = 'pose'; av.vu = false; }
      else if (mode !== 'pilote') { mode = 'auto'; t0 = performance.now(); }
      dire(); lancer(); dessiner(performance.now());
    }
    function piloter(on) {
      mode = on ? 'pilote' : 'pose'; scene.classList.toggle('pilote', on); bPilote.setAttribute('aria-pressed', on); bPilote.textContent = on ? 'Lâcher les commandes' : 'Piloter l’avion';
      if (on) { signes.forEach(s => { s.ne = 0; }); av = { x: W / 2, y: H / 2, a: 0, vu: true }; cible = { x: W / 2, y: H / 2 }; } else { av.vu = false; cible = null; }
      dire(); lancer(); dessiner(performance.now());
    }
    function viser(e) { if (mode !== 'pilote') return; const r = cv.getBoundingClientRect(); cible = { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height }; lancer(); }
    cv.addEventListener('pointermove', viser); cv.addEventListener('pointerdown', e => { if (mode === 'pilote') { e.preventDefault(); viser(e); } });
    zone.querySelector('[data-relancer]').addEventListener('click', () => { if (mode === 'pilote') piloter(false); relancer(); });
    bPilote.addEventListener('click', () => piloter(mode !== 'pilote'));

    const ro = new ResizeObserver(mesurer); ro.observe(scene);
    mesurer(); relancer();
    document.fonts?.load(`700 40px "Source Sans"`).then(() => { if (vivant) { composer(); lancer(); } });
    document.fonts?.load(`400 40px "Source Sans"`).then(() => { if (vivant) { composer(); lancer(); } });
    return () => { vivant = false; cancelAnimationFrame(raf); ro.disconnect(); };
  },
};
