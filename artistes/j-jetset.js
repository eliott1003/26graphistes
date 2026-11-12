// J · Experimental Jetset — Full Scale False Scale (Roma Publications, 2019).
// On écrit soi-même sur l'affiche : fond jaune, lettres noires, un mot par ligne.
// Les lettres gardent leur taille ; la ligne, elle, ne s'allonge pas : plus le mot est long,
// plus ses lettres se serrent, jusqu'à se fondre les unes dans les autres (aucun contour : le noir se mélange).
// Espace ou Entrée : nouvelle ligne. Le clavier est réservé à l'atelier (clavier: true).
//
// ⚠ À CALER SUR L'IMAGE DE RÉFÉRENCE (à fournir par Eliott : img/j/ref.jpg) : le jaune exact, le format,
// la place et le texte des petites lignes autour. En attendant : format du livre (110 × 180 mm) et mentions bibliographiques.

const DEPART = 'FULL SCALE FALSE SCALE';
const JAUNE = '#ffe100', NOIR = '#111111';
const POLICE = '"Helvetica Neue", Helvetica, Arial, Archivo, sans-serif'; // Helvetica sur Mac ; Arial puis Archivo ailleurs
const AUTOUR = { hautG: 'Experimental Jetset', basG: 'Roma Publications 375', basD: '2019' };

export default {
  lettre: 'J',
  clavier: true,
  css: `
.jt{display:grid;grid-template-columns:auto minmax(170px,250px);gap:clamp(16px,3cqw,44px);justify-content:center;align-items:end;height:100cqh}
.jt-affiche{position:relative;height:min(100cqh,calc((100cqw - 300px)*1.636));aspect-ratio:110/180;background:${JAUNE};cursor:text;box-shadow:0 0 0 1px rgba(0,0,0,.16),0 26px 50px -30px rgba(0,0,0,.55)}
.jt-affiche canvas{display:block;width:100%;height:100%}
.jt-saisie{position:absolute;inset:0;opacity:0;font-size:16px;border:0;padding:0;background:transparent;color:transparent;caret-color:transparent}
.jt-cote{display:grid;gap:14px;align-content:end;padding-bottom:4px}
.jt-cote p{margin:0}
.jt-reglage{display:grid;gap:6px;font:600 13px/1.3 Archivo,sans-serif}
.jt-reglage input{accent-color:#111;width:100%}
.jt-boutons{display:flex;flex-wrap:wrap;gap:8px}
@media (max-width:760px){.jt{grid-template-columns:1fr;height:auto}.jt-affiche{height:auto;width:100%}}
`,
  monter(zone, ctx) {
    zone.innerHTML = `
      <div class="jt">
        <div class="jt-affiche"><canvas aria-hidden="true"></canvas>
          <input class="jt-saisie" type="text" aria-label="Ton texte" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="80"></div>
        <div class="jt-cote">
          <p class="etiquette" aria-live="polite"></p>
          <p class="note">Tape au clavier. Espace ou Entrée : nouvelle ligne. Retour arrière : effacer.</p>
          <label class="jt-reglage">Taille des lettres <input type="range" min="0.6" max="1.5" step="0.01" value="1"></label>
          <div class="jt-boutons">
            <button type="button" class="bouton" data-vider>Effacer</button>
            <button type="button" class="bouton" data-titre>Remettre le titre</button>
          </div>
        </div>
      </div>`;
    const affiche = zone.querySelector('.jt-affiche'), cv = affiche.querySelector('canvas'), x = cv.getContext('2d');
    const saisie = affiche.querySelector('.jt-saisie'), info = zone.querySelector('.etiquette'), taille = zone.querySelector('input[type=range]');
    let texte = DEPART, L = 0, H = 0, dpr = 1, vivant = true, raf = 0;
    const pos = []; // position affichée de chaque lettre, pour glisser en douceur vers la nouvelle

    function mesurer() { const r = affiche.getBoundingClientRect(); if (!r.width) return; dpr = Math.min(devicePixelRatio || 1, 2); L = r.width; H = r.height; cv.width = Math.round(L * dpr); cv.height = Math.round(H * dpr); dessiner(true); }
    function cibles() {
      const lignes = texte.split(' '), n = Math.max(lignes.length, 1);
      const mx = L * .07, haut = L * .2, dispo = L - 2 * mx, dispoH = H - haut - L * .19;
      const corps = Math.min(L * .43, dispoH / (n * .8)) * +taille.value, il = corps * .8;
      x.font = `700 ${corps}px ${POLICE}`;
      const out = []; let serre = 0, compte = 0;
      lignes.forEach((mot, i) => {
        const ch = [...mot], larg = ch.map(c => x.measureText(c).width), naturel = larg.reduce((s, w) => s + w, 0), der = larg[larg.length - 1] || 0;
        let k = 1; // 1 = espacement normal ; en dessous, les lettres avancent moins que leur largeur : elles se recouvrent
        if (naturel > dispo && ch.length > 1) k = Math.max(0, (dispo - der) / (naturel - der));
        serre = Math.max(serre, 1 - k); compte += ch.length;
        let px = mx - corps * .035; ch.forEach((c, j) => { out.push({ c, x: px, y: haut + corps * .72 + i * il }); px += larg[j] * k; });
      });
      info.textContent = compte ? `${compte} lettres${serre > .005 ? `, serrées de ${Math.round(serre * 100)} %` : ''}` : 'Écris quelque chose.';
      return { out, corps };
    }
    function dessiner(sec = false) {
      if (!L) return;
      const { out, corps } = cibles();
      while (pos.length > out.length) pos.pop();
      out.forEach((o, i) => { if (!pos[i]) pos[i] = i ? { x: pos[i - 1].x, y: o.y } : { x: o.x, y: o.y }; });
      cancelAnimationFrame(raf);
      const pas = () => {
        if (!vivant) return; let encore = false;
        out.forEach((o, i) => { const p = pos[i], dx = o.x - p.x, dy = o.y - p.y;
          if (sec || ctx.reduireMouvement || Math.abs(dx) + Math.abs(dy) < .4) { p.x = o.x; p.y = o.y; } else { p.x += dx * .24; p.y += dy * .24; encore = true; } });
        x.setTransform(dpr, 0, 0, dpr, 0, 0); x.fillStyle = JAUNE; x.fillRect(0, 0, L, H);
        x.fillStyle = NOIR; x.textBaseline = 'alphabetic';
        // les petites lignes autour, fixes, comme sur une couverture
        x.font = `700 ${L * .036}px ${POLICE}`; x.textAlign = 'left';
        x.fillText(AUTOUR.hautG, L * .07, L * .105); x.fillText(AUTOUR.basG, L * .07, H - L * .075);
        x.textAlign = 'right'; x.fillText(AUTOUR.basD, L * .93, H - L * .075); x.textAlign = 'left';
        // le texte : noir sur jaune, sans contour ; là où deux lettres se recouvrent, elles ne font plus qu'une forme
        x.font = `700 ${corps}px ${POLICE}`;
        out.forEach((o, i) => x.fillText(o.c, pos[i].x, pos[i].y));
        if (encore) raf = requestAnimationFrame(pas);
      };
      pas();
    }
    const ajouter = c => {
      if (c === ' ' || c === '\n') { if (texte && !texte.endsWith(' ') && texte.split(' ').length < 9) texte += ' '; }
      else if (texte.length < 80) texte += c.toUpperCase();
    };
    function taper(e) {
      if (e.metaKey || e.ctrlKey || e.altKey || e.key === 'Escape') return; // Échap ferme le livre
      const champ = e.target instanceof Element && e.target.closest('input,textarea,select,button');
      if (champ && champ !== saisie) return;
      if (e.key === 'Backspace') texte = texte.slice(0, -1);
      else if (e.key === 'Enter') ajouter(' ');
      else if (e.key.length === 1) ajouter(e.key);
      else return;
      e.preventDefault(); saisie.value = ''; dessiner();
    }
    addEventListener('keydown', taper);
    saisie.addEventListener('input', () => { if (saisie.value) { [...saisie.value].forEach(ajouter); saisie.value = ''; dessiner(); } });
    affiche.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') saisie.focus(); });
    taille.addEventListener('input', () => dessiner(true));
    zone.querySelector('[data-vider]').addEventListener('click', e => { texte = ''; e.currentTarget.blur(); dessiner(); });
    zone.querySelector('[data-titre]').addEventListener('click', e => { texte = DEPART; e.currentTarget.blur(); dessiner(); });
    const ro = new ResizeObserver(mesurer); ro.observe(affiche);
    document.fonts.load('700 40px Archivo').then(() => dessiner(true)).catch(() => {});
    mesurer();
    return () => { vivant = false; cancelAnimationFrame(raf); ro.disconnect(); removeEventListener('keydown', taper); };
  },
};
