// S · Paula Scher — Bring in ’da Noise, Bring in ’da Funk (affiche pour le Public Theater, 1995).
// « Fais du bruit » : au silence, les textes sont au minimum ; plus il y a de bruit, plus ils grossissent et s'épaississent,
// jusqu'à remplir la feuille. Micro, ou sans micro : une rythmique à lancer, dont on monte le volume. Chaque touche du
// clavier fait aussi un bruit de claquettes.
//
// Avec l'image de l'affiche fournie par Eliott (img/s/ref.jpg, première image de l'artiste dans labo/donnees.js) :
// la feuille EST son image. Les blocs de texte (ZONES) y sont découpés ; au silence ils sont réduits dans leur case,
// et chaque bloc grossit avec le bruit jusqu'à déborder. Rien n'est redessiné en code : tout vient de l'image.
// Sans image : une composition typographique de remplacement (les mots du titre empilés).
//
// PROVISOIRE : la bande-son est une rythmique fabriquée en code. Quand Eliott envoie un mp3 libre de droits, le ranger
// en img/s/son.mp3 et mettre SON = 'img/s/son.mp3'.

const SON = ''; // chemin du mp3 depuis la racine du site ; vide : rythmique fabriquée en code
const REG = { plancher: -48, plafond: -12, mini: .17 }; // micro : niveau (dB) du silence et du plein bruit ; taille des textes au silence
const MOTS = ['BRING IN', '’DA NOISE', 'BRING IN', '’DA FUNK'];
const STYLES = [ // caractères d'affiche du dépôt ; bande : 0 graves, 1 médiums, 2 aigus
  { police: '400 100px Anton', cote: 'g', rouge: false, bande: 1 },
  { police: '900 100px "Sofia Cond"', cote: 'd', rouge: true, bande: 0 },
  { police: '400 100px "Alfa Slab"', cote: 'g', rouge: false, bande: 2 },
  { police: '400 100px Anton', cote: 'd', rouge: true, bande: 0 },
  { police: '900 100px "Sofia Cond"', cote: 'g', rouge: false, bande: 1 },
  { police: '400 100px "Alfa Slab"', cote: 'd', rouge: false, bande: 2 },
];
const JAUNE = '#ffe500', NOIR = '#111', ROUGE = '#e8392b';
// blocs de texte de l'affiche : contours en pixels de l'image d'Eliott (750 × 971), puis la bande de fréquences
const BASE = [750, 971], FOND_AFFICHE = 'rgb(253,203,47)';
const R = (a, b, c, d) => [[a, b], [c, b], [c, d], [a, d]];
const ZONES = [
  { p: [[228, 30], [732, 30], [732, 164], [650, 176], [585, 184], [560, 198], [462, 198], [462, 219], [410, 219], [410, 230], [360, 230], [360, 196], [228, 196]], b: 0 }, // Bring in 'da Noise, Bring in 'da Funk
  { p: [[582, 187], [730, 170], [730, 386], [629, 386], [629, 372], [580, 372]], b: 1 }, // Wasp
  { p: [[452, 200], [578, 200], [578, 372], [482, 372], [482, 325], [452, 325]], b: 2 }, // and other plays
  { p: [[390, 371], [458, 371], [458, 386], [726, 386], [726, 451], [390, 451]], b: 0 }, // 2 Women
  { p: R(400, 460, 550, 528), b: 2 }, // The Chang
  { p: R(566, 462, 726, 613), b: 1 }, // King Lear
  { p: R(462, 532, 550, 806), b: 2 }, // Fragments
  { p: R(566, 627, 728, 805), b: 0 }, // Dancing on her knees
  { p: R(360, 818, 724, 903), b: 1 }, // The Skriker
  { p: R(22, 913, 728, 955), b: 0 }, // Membership is easy
].map(z => { const xs = z.p.map(q => q[0]), ys = z.p.map(q => q[1]); return { ...z, cx: (Math.min(...xs) + Math.max(...xs)) / 2, cy: (Math.min(...ys) + Math.max(...ys)) / 2 }; });

const borne = v => Math.max(0, Math.min(1, v));

export default {
  lettre: 'S',
  clavier: true,
  css: `
.sc{display:grid;grid-template-columns:auto minmax(180px,250px);gap:clamp(16px,3cqw,44px);justify-content:center;align-items:end;height:100cqh}
.sc-feuille{height:min(100cqh,calc((100cqw - 300px)*1.5));aspect-ratio:2/3;background:${JAUNE};box-shadow:0 0 0 1px rgba(0,0,0,.18),0 26px 50px -30px rgba(0,0,0,.55)}
.sc-feuille.affiche{height:min(100cqh,calc((100cqw - 300px)*1.294))}
.sc-feuille canvas{display:block;width:100%;height:100%}
.sc-cote{display:grid;gap:12px;align-content:end;padding-bottom:4px}
.sc-cote p{margin:0}
.sc-jauge{height:14px;border:1.5px solid currentColor;position:relative}
.sc-jauge i{position:absolute;inset:0 auto 0 0;width:0;background:currentColor}
.sc-champ{display:grid;gap:6px;font:600 13px/1.3 Archivo,sans-serif}
.sc-champ input[type=range]{width:100%;accent-color:#111}
.sc-champ input[type=text]{font:600 15px/1.2 Archivo,sans-serif;padding:9px 10px;border:1.5px solid currentColor;border-radius:4px;background:transparent;color:inherit;min-width:0;text-transform:uppercase}
.sc-champ[hidden]{display:none}
.sc-boutons{display:flex;flex-wrap:wrap;gap:8px}
.sc-reglage{display:grid;gap:6px;font:600 13px/1.3 Archivo,sans-serif;padding:10px;border:1.5px dashed currentColor}
.sc-reglage input{width:100%;accent-color:#111}
@media (max-width:760px){.sc{grid-template-columns:1fr;height:auto}.sc-feuille{height:auto;width:100%}}
`,
  monter(zone, ctx) {
    const reglages = new URLSearchParams(location.search).has('reglages');
    const nomSon = SON ? 'la bande-son' : 'la rythmique';
    zone.innerHTML = `
      <div class="sc">
        <div class="sc-feuille"><canvas data-export aria-label="Une feuille jaune : les mots grossissent avec le bruit"></canvas></div>
        <div class="sc-cote">
          <p class="etiquette" aria-live="polite">Silence : les textes sont au minimum.</p>
          <div class="sc-jauge" aria-hidden="true"><i></i></div>
          <p class="note">Fais du bruit : parle, crie, tape dans tes mains. Sans micro, lance ${nomSon} et monte le son. Chaque touche du clavier fait aussi un bruit de claquettes.</p>
          <label class="sc-champ" data-volume hidden>Volume <input type="range" min="0" max="100" step="1" value="60"></label>
          <label class="sc-champ" data-mots>Tes mots <input type="text" maxlength="48" autocomplete="off" spellcheck="false" placeholder="Bring in ’da Noise…"></label>
          <div class="sc-boutons">
            <button type="button" class="bouton plein" data-micro aria-pressed="false">Allumer le micro</button>
            <button type="button" class="bouton" data-son aria-pressed="false">Lancer ${nomSon}</button>
          </div>
          ${reglages ? `<div class="sc-reglage"><span>Micro en ce moment : <output data-db>—</output> dB</span>
            <label>Silence : <output data-o="plancher"></output> dB<input type="range" data-r="plancher" min="-75" max="-25" step="1" value="${REG.plancher}"></label>
            <label>Plein bruit : <output data-o="plafond"></output> dB<input type="range" data-r="plafond" min="-35" max="0" step="1" value="${REG.plafond}"></label>
            <button type="button" class="bouton" data-copier>Copier les réglages</button></div>` : ''}
        </div>
      </div>`;
    const feuille = zone.querySelector('.sc-feuille'), cv = feuille.querySelector('canvas'), x = cv.getContext('2d');
    const info = zone.querySelector('.etiquette'), jauge = zone.querySelector('.sc-jauge i'), champVolume = zone.querySelector('[data-volume]'), volume = champVolume.querySelector('input');
    const mots = zone.querySelector('input[type=text]'), bMicro = zone.querySelector('[data-micro]'), bSon = zone.querySelector('[data-son]');
    let lignes = MOTS, L = 0, H = 0, dpr = 1, vivant = true, raf = 0, calme = 0;
    let affiche = null; // l'image d'Eliott, une fois chargée
    let niv = ZONES.map(() => 0), global = 0;
    // son
    let ac = null, sortie = null, bus = null, anaSortie = null, anaMicro = null, flux = null, srcMicro = null, bruit = null, minuterie = 0, lecteur = null;
    let micro = false, son = false, pas = 0, prochain = 0;
    const tampon = new Float32Array(2048); let freq = null;

    function mesurer() { const r = feuille.getBoundingClientRect(); if (!r.width) return; dpr = Math.min(devicePixelRatio || 1, 2); L = r.width; H = r.height; cv.width = Math.round(L * dpr); cv.height = Math.round(H * dpr); dessiner(); }
    function dessiner() {
      if (!L) return;
      x.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (affiche) { // la vraie affiche : chaque bloc de texte, découpé dans l'image, grossit dans sa case
        const k = L / BASE[0], ky = H / BASE[1];
        const contour = z => { x.beginPath(); z.p.forEach(([a, b], i) => x[i ? 'lineTo' : 'moveTo'](a * k, b * ky)); x.closePath(); };
        x.drawImage(affiche, 0, 0, L, H); x.fillStyle = x.strokeStyle = FOND_AFFICHE; x.lineWidth = 1.5;
        ZONES.forEach(z => { contour(z); x.fill(); x.stroke(); }); // on vide chaque case...
        ZONES.forEach((z, i) => { // ...puis on y repose son bloc, à la taille du bruit : .47 au silence, 1.12 à plein volume
          const e = REG.mini + .3 + (.82 - REG.mini) * niv[i];
          x.save(); x.translate(z.cx * k, z.cy * ky); x.scale(e, e); x.translate(-z.cx * k, -z.cy * ky); contour(z); x.clip(); x.drawImage(affiche, 0, 0, L, H); x.restore();
        });
        return;
      }
      x.fillStyle = JAUNE; x.fillRect(0, 0, L, H);
      const mx = L * .045, dispo = L - 2 * mx;
      // taille de chaque ligne à plein volume : elle occupe toute la largeur, et l'ensemble toute la hauteur
      const pleins = lignes.map((t, i) => { x.font = STYLES[i % STYLES.length].police; return Math.min(dispo * 100 / (x.measureText(t).width || 1), H * .4); });
      const somme = pleins.reduce((s, p) => s + p * .86, 0), e = Math.min(1, H * .95 / somme);
      let y = (H - somme * e) / 2;
      lignes.forEach((t, i) => {
        const st = STYLES[i % STYLES.length], plein = pleins[i] * e, n = niv[i % niv.length], corps = plein * (REG.mini + (1 - REG.mini) * n), cap = corps * .72;
        const milieu = y + plein * .43; y += plein * .86;
        x.font = st.police.replace('100px', corps + 'px'); x.textAlign = st.cote === 'g' ? 'left' : 'right'; x.textBaseline = 'alphabetic';
        x.fillStyle = x.strokeStyle = st.rouge ? ROUGE : NOIR; x.lineJoin = 'round'; x.lineWidth = corps * .075 * n;
        const px = st.cote === 'g' ? mx : L - mx, py = milieu + cap / 2;
        if (n > .02) x.strokeText(t, px, py); // le bruit épaissit aussi les lettres
        x.fillText(t, px, py);
      });
    }

    /* ── le son ── */
    function demarrer() {
      if (ac) { if (ac.state === 'suspended') ac.resume(); return true; }
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
      ac = new AC(); sortie = ac.createGain(); bus = ac.createGain(); bus.gain.value = 0;
      anaSortie = ac.createAnalyser(); anaSortie.fftSize = 2048; anaSortie.smoothingTimeConstant = .5;
      bus.connect(sortie); sortie.connect(anaSortie); anaSortie.connect(ac.destination);
      bruit = ac.createBuffer(1, ac.sampleRate, ac.sampleRate); const d = bruit.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      freq = new Uint8Array(anaSortie.frequencyBinCount);
      tourner(); return true;
    }
    function souffle(t, vers, { duree, gain, type, f, q = 1 }) { // un éclat de bruit filtré : caisse claire, charleston, claquette
      const s = ac.createBufferSource(), fl = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = bruit; fl.type = type; fl.frequency.value = f; fl.Q.value = q;
      g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(.001, t + duree);
      s.connect(fl); fl.connect(g); g.connect(vers); s.start(t, Math.random() * .5, duree + .02);
    }
    function note(t, vers, { f0, f1, duree, gain, type = 'sine' }) { // grosse caisse (sinus qui descend) ou basse
      const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + duree * .6);
      g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(.001, t + duree);
      if (type === 'sine') o.connect(g); else { const fl = ac.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = 420; o.connect(fl); fl.connect(g); }
      g.connect(vers); o.start(t); o.stop(t + duree + .02);
    }
    const claquette = (t, vers, fort = 1) => { souffle(t, vers, { duree: .045, gain: .75 * fort, type: 'bandpass', f: 2600, q: 1.4 }); note(t, vers, { f0: 900, f1: 380, duree: .04, gain: .35 * fort }); };
    // une mesure de seize pas, à 104 à la noire
    const CAISSE = [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0], CLAIRE = [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1];
    const CLAQ = [0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0], BASSE = [55, 0, 0, 55, 0, 0, 65.4, 0, 0, 0, 73.4, 0, 0, 55, 0, 0];
    function programmer() {
      if (!ac || !son || SON) return; const duree = 60 / 104 / 4;
      while (prochain < ac.currentTime + .12) {
        const k = pas % 16, t = prochain + (k % 2 ? duree * .12 : 0); // un peu de balancement
        if (CAISSE[k]) note(t, bus, { f0: 150, f1: 42, duree: .26, gain: 1 });
        if (CLAIRE[k]) souffle(t, bus, { duree: .16, gain: .6, type: 'bandpass', f: 1900, q: .7 });
        if (k % 2 === 0) souffle(t, bus, { duree: .04, gain: k % 4 === 2 ? .3 : .16, type: 'highpass', f: 7500 });
        if (CLAQ[k]) claquette(t, bus, .42);
        if (BASSE[k]) note(t, bus, { f0: BASSE[k], f1: BASSE[k], duree: duree * 2.4, gain: .5, type: 'sawtooth' });
        pas++; prochain += duree;
      }
    }
    const regler = () => { if (bus) bus.gain.setTargetAtTime(son ? (volume.value / 100) ** 2 * 1.1 : 0, ac.currentTime, .03); };
    function basculerSon(oui) {
      if (oui && !demarrer()) { info.textContent = 'Ce navigateur ne sait pas jouer de son ici.'; return; }
      if (oui && micro) basculerMicro(false);
      son = oui; bSon.setAttribute('aria-pressed', oui); bSon.textContent = oui ? 'Arrêter' : `Lancer ${nomSon}`; champVolume.hidden = !oui;
      if (SON && ac) {
        if (!lecteur) { lecteur = new Audio(ctx.racine + SON); lecteur.loop = true; lecteur.crossOrigin = 'anonymous'; ac.createMediaElementSource(lecteur).connect(bus); }
        if (oui) lecteur.play().catch(() => { info.textContent = 'La bande-son ne se lance pas.'; }); else lecteur.pause();
      } else if (oui) { pas = 0; prochain = ac.currentTime + .06; clearInterval(minuterie); minuterie = setInterval(programmer, 25); programmer(); } else clearInterval(minuterie);
      regler(); info.textContent = oui ? 'Monte le volume : les textes grossissent.' : 'Silence : les textes sont au minimum.';
    }
    function couperMicro() { flux?.getTracks().forEach(p => p.stop()); flux = null; try { srcMicro?.disconnect(); } catch { /* déjà coupé */ } srcMicro = null; micro = false; bMicro.setAttribute('aria-pressed', false); bMicro.textContent = 'Allumer le micro'; }
    async function basculerMicro(oui) {
      if (!oui) { couperMicro(); info.textContent = 'Micro coupé.'; return; }
      if (!demarrer() || !navigator.mediaDevices?.getUserMedia) { info.textContent = `Pas de micro ici : lance ${nomSon}.`; return; }
      try {
        const f = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
        if (!vivant) { f.getTracks().forEach(p => p.stop()); return; }
        if (son) basculerSon(false);
        flux = f; srcMicro = ac.createMediaStreamSource(f); anaMicro = ac.createAnalyser(); anaMicro.fftSize = 2048; anaMicro.smoothingTimeConstant = .5; srcMicro.connect(anaMicro); // le micro n'est pas rejoué dans les haut-parleurs
        micro = true; bMicro.setAttribute('aria-pressed', true); bMicro.textContent = 'Couper le micro'; info.textContent = 'Micro allumé : fais du bruit.'; tourner();
      } catch { // refusé ou absent : on ne laisse pas la feuille muette, la rythmique prend le relais
        couperMicro(); info.textContent = `Micro refusé ou absent : ${nomSon} prend le relais.`; if (!son) basculerSon(true); info.textContent = `Micro refusé ou absent : ${nomSon} prend le relais. Monte le volume.`;
      }
    }

    /* ── la mesure du bruit, à chaque image ── */
    function tourner() { if (!raf && vivant) raf = requestAnimationFrame(boucle); }
    function boucle() {
      raf = 0; if (!vivant || !ac) return;
      const ana = micro ? anaMicro : anaSortie; ana.getFloatTimeDomainData(tampon);
      let s = 0; for (let i = 0; i < tampon.length; i++) s += tampon[i] * tampon[i];
      const eff = Math.sqrt(s / tampon.length), db = 20 * Math.log10(eff + 1e-7);
      const g = micro ? borne((db - REG.plancher) / (REG.plafond - REG.plancher)) : borne((eff / .34) ** .7);
      ana.getByteFrequencyData(freq);
      const hz = ac.sampleRate / ana.fftSize, moy = (a, b) => { let t = 0, n = 0; for (let i = Math.max(1, Math.round(a / hz)); i < Math.round(b / hz) && i < freq.length; i++) { t += freq[i]; n++; } return n ? t / n / 255 : 0; };
      const bandes = [moy(30, 220), moy(220, 2000), moy(2000, 9000)], haut = Math.max(...bandes, .001);
      niv = niv.map((n, i) => { const cible = borne(g * (.5 + .62 * bandes[affiche ? ZONES[i].b : STYLES[i % STYLES.length].bande] / haut)); return n + (cible - n) * (cible > n ? .5 : .1); });
      global += (g - global) * (g > global ? .5 : .1); jauge.style.width = Math.round(global * 100) + '%';
      if (reglages) zone.querySelector('[data-db]').textContent = micro ? Math.round(db) : '—';
      dessiner();
      calme = global < .004 && !micro && !son ? calme + 1 : 0; // plus rien à entendre : on arrête de redessiner
      if (calme < 40) tourner();
    }

    /* ── les commandes ── */
    bMicro.addEventListener('click', () => basculerMicro(!micro));
    bSon.addEventListener('click', () => basculerSon(!son));
    volume.addEventListener('input', regler);
    mots.addEventListener('input', () => { const m = mots.value.toUpperCase().split(/\s+/).filter(Boolean).slice(0, 6); lignes = m.length ? m : MOTS; dessiner(); });
    function touche(e) { // chaque touche = un coup de claquette
      if (e.metaKey || e.ctrlKey || e.altKey || e.repeat || e.key === 'Escape' || e.key === 'Tab' || e.key.startsWith('Arrow') || e.key.startsWith('Page')) return;
      if (e.target instanceof Element && e.target.closest('input,textarea,select,button,a')) return;
      if (e.key !== ' ' && e.key !== 'Enter' && e.key.length !== 1) return;
      e.preventDefault(); if (!demarrer()) return; claquette(ac.currentTime + .005, sortie, .9 + Math.random() * .2); tourner();
    }
    addEventListener('keydown', touche);
    if (reglages) {
      const dire = () => zone.querySelectorAll('[data-o]').forEach(o => { o.textContent = REG[o.dataset.o]; }); dire();
      zone.querySelectorAll('[data-r]').forEach(r => r.addEventListener('input', () => { REG[r.dataset.r] = +r.value; dire(); }));
      zone.querySelector('[data-copier]').addEventListener('click', e => { navigator.clipboard?.writeText(`Scher : REG = { plancher: ${REG.plancher}, plafond: ${REG.plafond}, mini: ${REG.mini} }`); e.target.textContent = 'Copié'; });
    }
    const ref = ctx.artiste.images?.[0];
    if (ref) { const im = new Image(); im.onload = () => { if (!vivant) return; affiche = im; feuille.style.aspectRatio = `${BASE[0]}/${BASE[1]}`; feuille.classList.add('affiche'); zone.querySelector('[data-mots]').hidden = true; mesurer(); }; im.src = `${ctx.racine}img/s/${ref.f}`; }
    const ro = new ResizeObserver(mesurer); ro.observe(feuille);
    Promise.all(['400 60px Anton', '900 60px "Sofia Cond"', '400 60px "Alfa Slab"'].map(f => document.fonts.load(f))).then(() => vivant && dessiner()).catch(() => {});
    mesurer();
    return () => {
      vivant = false; cancelAnimationFrame(raf); clearInterval(minuterie); ro.disconnect(); removeEventListener('keydown', touche);
      flux?.getTracks().forEach(p => p.stop()); lecteur?.pause(); ac?.close().catch(() => {});
    };
  },
};
