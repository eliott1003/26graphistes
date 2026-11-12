// J · Experimental Jetset — Full Scale False Scale.
// On écrit soi-même. Les lettres gardent leur taille ; la ligne, elle, ne s'allonge pas :
// plus il y a de lettres, plus elles se rapprochent, jusqu'à se chevaucher.
// Le clavier du site est réservé à l'atelier (clavier: true) : les lettres s'écrivent ici, Échap ferme le dossier.

const DEPART = 'FULL SCALE';

export default {
  lettre: 'J',
  clavier: true,
  css: `
.js-a{display:grid;gap:14px}
.js-scene{position:relative;background:#fff;color:#111;height:min(62vh,620px);overflow:hidden;cursor:text;border:2px solid #111}
.js-scene canvas{display:block;width:100%;height:100%}
.js-saisie{position:absolute;inset:0;opacity:0;font-size:16px;border:0;padding:0;background:transparent;color:transparent;caret-color:transparent}
.js-bas{display:flex;flex-wrap:wrap;gap:10px 18px;align-items:center;justify-content:space-between}
.js-bas p{margin:0}
.js-reglage{display:flex;gap:10px;align-items:center;font-size:14px}
.js-reglage input{accent-color:#111;width:160px}
`,
  monter(zone, ctx) {
    zone.innerHTML = `
      <div class="js-a">
        <div class="js-scene"><canvas aria-hidden="true"></canvas>
          <input class="js-saisie" type="text" aria-label="Ton texte" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="80"></div>
        <div class="js-bas">
          <p class="etiquette" aria-live="polite"></p>
          <label class="js-reglage">Taille des lettres <input type="range" min="0.35" max="0.95" step="0.01" value="0.56"></label>
          <button type="button" class="bouton" data-vider>Effacer</button>
        </div>
      </div>`;
    const scene = zone.querySelector('.js-scene'), cv = scene.querySelector('canvas'), x = cv.getContext('2d');
    const saisie = scene.querySelector('.js-saisie'), info = zone.querySelector('.etiquette'), taille = zone.querySelector('input[type=range]');
    let texte = DEPART, L = 0, H = 0, dpr = 1, vivant = true, raf = 0;
    const pos = []; // position affichée de chaque lettre, pour glisser en douceur vers la nouvelle

    function mesurer() { const r = scene.getBoundingClientRect(); dpr = Math.min(devicePixelRatio || 1, 2); L = r.width; H = r.height; cv.width = L * dpr; cv.height = H * dpr; dessiner(true); }
    function cibles() {
      const corps = H * +taille.value, police = `800 ${corps}px Archivo, Helvetica, Arial, sans-serif`;
      x.font = police; const marge = L * .04, dispo = L - 2 * marge;
      const ch = [...texte], larg = ch.map(c => x.measureText(c).width), naturel = larg.reduce((s, w) => s + w, 0);
      let k = 1; // facteur d'avance : 1 = espacement normal, puis on serre jusqu'à faire tenir la ligne
      if (naturel > dispo && ch.length > 1) k = Math.max(0, (dispo - larg[larg.length - 1]) / (naturel - larg[larg.length - 1]));
      const out = []; let px = marge + Math.max(0, (dispo - naturel) / 2);
      ch.forEach((c, i) => { out.push({ c, x: px }); px += larg[i] * k; });
      const chevauche = k < 1 ? Math.round((1 - k) * 100) : 0;
      info.textContent = ch.length ? `${ch.length} signes${chevauche ? `, serrés de ${chevauche} %` : ''}` : 'Écris quelque chose.';
      return { out, police, base: H * .5 + corps * .36 };
    }
    function dessiner(sec = false) {
      const { out, police, base } = cibles();
      while (pos.length > out.length) pos.pop();
      out.forEach((o, i) => { if (pos[i] === undefined) pos[i] = i ? pos[i - 1] : o.x; });
      cancelAnimationFrame(raf);
      const pas = () => {
        if (!vivant) return; let encore = false;
        out.forEach((o, i) => { const d = o.x - pos[i]; if (sec || ctx.reduireMouvement || Math.abs(d) < .3) pos[i] = o.x; else { pos[i] += d * .22; encore = true; } });
        x.setTransform(dpr, 0, 0, dpr, 0, 0); x.fillStyle = '#fff'; x.fillRect(0, 0, L, H);
        x.font = police; x.textBaseline = 'alphabetic';
        // chaque lettre est posée sur la précédente : un fin liseré blanc garde la superposition lisible
        out.forEach((o, i) => { x.lineWidth = Math.max(2, H * .006); x.strokeStyle = '#fff'; x.strokeText(o.c, pos[i], base); x.fillStyle = '#111'; x.fillText(o.c, pos[i], base); });
        if (encore) raf = requestAnimationFrame(pas);
      };
      pas();
    }
    function taper(e) {
      if (e.metaKey || e.ctrlKey || e.altKey || e.key === 'Escape') return; // Échap ferme le dossier
      const champ = e.target instanceof Element && e.target.closest('input,textarea,select');
      if (champ && champ !== saisie) return;
      if (e.key === 'Backspace') { texte = texte.slice(0, -1); }
      else if (e.key.length === 1 && texte.length < 80) { texte += e.key.toUpperCase(); }
      else return;
      e.preventDefault(); saisie.value = ''; dessiner();
    }
    addEventListener('keydown', taper);
    saisie.addEventListener('input', () => { if (saisie.value) { texte = (texte + saisie.value.toUpperCase()).slice(0, 80); saisie.value = ''; dessiner(); } });
    scene.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') saisie.focus(); });
    taille.addEventListener('input', () => dessiner(true));
    zone.querySelector('[data-vider]').addEventListener('click', () => { texte = ''; dessiner(); });
    const ro = new ResizeObserver(mesurer); ro.observe(scene);
    document.fonts.load('800 40px Archivo').then(() => dessiner(true)).catch(() => {});
    mesurer();
    return () => { vivant = false; cancelAnimationFrame(raf); ro.disconnect(); removeEventListener('keydown', taper); };
  },
};
