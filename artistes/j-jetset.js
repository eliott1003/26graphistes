// J · Experimental Jetset — Full Scale False Scale. A reader of sorts (Roma Publications, 2019).
// Reproduit d'après la couverture (img/j/ref.jpg, fournie par Eliott) : fond jaune, en-tête en petites lignes,
// puis quatre grandes lignes où les mots sont posés les uns sur les autres, chacun sur toute la largeur : les lettres se fondent.
// Ligne 1 à l'endroit, ligne 2 retournée, ligne 3 en miroir, ligne 4 renversée, comme sur l'original.
// On écrit soi-même : plus un mot est long, plus ses lettres se serrent ; Espace pose un nouveau mot par-dessus. Le clavier est réservé à l'atelier (clavier: true).

const DEPART = 'Full Scale False Scale';
const JAUNE = '#fff200', NOIR = '#1a1a1a';
const POLICE = '"Helvetica Neue", Helvetica, Arial, Archivo, sans-serif'; // Helvetica sur Mac ; Arial puis Archivo ailleurs
const RETOURS = [[1, 1], [-1, -1], [-1, 1], [1, -1]]; // endroit, demi-tour, miroir, renversé

export default {
  lettre: 'J',
  clavier: true,
  css: `
.jt{display:grid;grid-template-columns:auto minmax(170px,250px);gap:clamp(16px,3cqw,44px);justify-content:center;align-items:end;height:100cqh}
.jt-affiche{position:relative;height:min(100cqh,calc((100cqw - 300px)*1.715));aspect-ratio:499/856;background:${JAUNE};cursor:text;box-shadow:0 0 0 1px rgba(0,0,0,.16),0 26px 50px -30px rgba(0,0,0,.55)}
.jt-affiche:focus-within{box-shadow:0 0 0 2px #1a1a1a,0 26px 50px -30px rgba(0,0,0,.55)}
.jt-affiche canvas{display:block;width:100%;height:100%}
.jt-saisie{position:absolute;inset:0;width:100%;height:100%;opacity:0;font-size:16px;border:0;padding:0;background:transparent;color:transparent;caret-color:transparent;cursor:text}
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
          <input class="jt-saisie" type="text" aria-label="Ton texte" autocomplete="off" spellcheck="false" maxlength="60"></div>
        <div class="jt-cote">
          <p class="etiquette" aria-live="polite"></p>
          <p class="note">Tape au clavier, ou clique dans l’affiche puis écris. Espace : un nouveau mot se pose par-dessus. Retour arrière : effacer.</p>
          <label class="jt-reglage">Taille des lettres <input type="range" min="0.6" max="1.3" step="0.01" value="1"></label>
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
      const mx = L * .07, dispo = L - 2 * mx, corps = L * .34 * +taille.value;
      x.font = `500 ${corps}px ${POLICE}`;
      // chaque mot occupe toute la largeur de la ligne ; les mots sont posés les uns sur les autres
      const mots = texte.split(' ').filter(Boolean), out = []; let serre = 0, compte = 0;
      mots.forEach(mot => {
        const ch = [...mot], larg = ch.map(c => x.measureText(c).width), naturel = larg.reduce((t, w) => t + w, 0), der = larg[larg.length - 1];
        const k = ch.length > 1 ? Math.min(1.5, Math.max(0, (dispo - der) / (naturel - der))) : 1; // sous 1, les lettres se recouvrent
        serre = Math.max(serre, 1 - k); compte += ch.length;
        let px = ch.length > 1 ? 0 : (dispo - der) / 2; ch.forEach((c, j) => { out.push({ c, x: px }); px += larg[j] * k; });
      });
      info.textContent = compte ? `${mots.length} mot${mots.length > 1 ? 's' : ''} superposé${mots.length > 1 ? 's' : ''}, ${compte} lettres${serre > .005 ? `, serrées jusqu’à ${Math.round(serre * 100)} %` : ''}` : 'Écris quelque chose.';
      return { out, corps, mx, dispo };
    }
    function dessiner(sec = false) {
      if (!L) return;
      const { out, corps, mx, dispo } = cibles();
      while (pos.length > out.length) pos.pop();
      out.forEach((o, i) => { if (pos[i] === undefined) pos[i] = i ? pos[i - 1] : o.x; });
      cancelAnimationFrame(raf);
      const pas = () => {
        if (!vivant) return; let encore = false;
        out.forEach((o, i) => { const d = o.x - pos[i]; if (sec || ctx.reduireMouvement || Math.abs(d) < .4) pos[i] = o.x; else { pos[i] += d * .24; encore = true; } });
        x.setTransform(dpr, 0, 0, dpr, 0, 0); x.fillStyle = JAUNE; x.fillRect(0, 0, L, H);
        x.fillStyle = NOIR; x.textBaseline = 'alphabetic'; x.textAlign = 'left';
        // l'en-tête, fixe, comme sur la couverture
        x.font = `700 ${L * .0285}px ${POLICE}`; x.fillText('Notes on Experimental Jetset / Volume 3', L * .14, H * .041);
        x.font = `400 ${L * .066}px ${POLICE}`;
        x.fillText('Full Scale', L * .07, H * .112); x.fillText('False Scale', L * .07, H * .152);
        x.fillText('A reader', L * .52, H * .112); x.fillText('of sorts', L * .52, H * .152);
        // les quatre grandes lignes : noir sur jaune, sans contour ; les lettres qui se recouvrent ne font plus qu'une forme
        x.font = `500 ${corps}px ${POLICE}`;
        const pasY = H * .205, y0 = H * .365, demi = corps * .36;
        RETOURS.forEach(([sx, sy], i) => {
          const base = y0 + i * pasY;
          x.save(); x.translate(mx + dispo / 2, base - demi); x.scale(sx, sy);
          out.forEach((o, j) => x.fillText(o.c, pos[j] - dispo / 2, demi));
          x.restore();
        });
        if (encore) raf = requestAnimationFrame(pas);
      };
      pas();
    }
    const ajouter = c => { if (c !== '\n' && texte.length < 60) texte += c; };
    function taper(e) {
      if (e.metaKey || e.ctrlKey || e.altKey || e.key === 'Escape') return; // Échap ferme le livre
      const champ = e.target instanceof Element && e.target.closest('input,textarea,select,button');
      if (champ && champ !== saisie) return;
      if (e.key === 'Backspace') texte = texte.slice(0, -1);
      else if (e.key.length === 1) ajouter(e.key);
      else return;
      e.preventDefault(); saisie.value = ''; dessiner();
    }
    addEventListener('keydown', taper);
    saisie.addEventListener('input', () => { if (saisie.value) { [...saisie.value].forEach(ajouter); saisie.value = ''; dessiner(); } });
    taille.addEventListener('input', () => dessiner(true));
    zone.querySelector('[data-vider]').addEventListener('click', () => { texte = ''; saisie.focus(); dessiner(); });
    zone.querySelector('[data-titre]').addEventListener('click', () => { texte = DEPART; saisie.focus(); dessiner(); });
    const ro = new ResizeObserver(mesurer); ro.observe(affiche);
    document.fonts.load('700 40px Archivo').then(() => dessiner(true)).catch(() => {});
    mesurer();
    return () => { vivant = false; cancelAnimationFrame(raf); ro.disconnect(); removeEventListener('keydown', taper); };
  },
};
