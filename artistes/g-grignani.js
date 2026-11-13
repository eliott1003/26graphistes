// G · Franco Grignani — trois façons de refaire son geste, chacune d'après une référence fournie par Eliott (img/g/) :
//  · Ruban  : Today's Italian Publicity and Graphic Design (affiche, Londres, 1967). Un ruban rayé suit la souris ou l'index,
//             tourne en vraies courbes (rayon minimal, la tête se dirige comme un volant) et passe sur lui-même. Fond blanc, rayé ou noir.
//  · Onde   : couverture de Linea grafica n° 6 (1965). Des rayures se tordent en tourbillon autour de la souris ou de l'index.
//  · Éventail : annonce Alfieri & Lacroix. Des carrés noirs se déploient le long du tracé.
// Les œuvres ne sont pas redessinées ici (protégées) : la référence de chaque mode est montrée à côté de la feuille.
// Webcam : l'index dirige, pincer pouce et index pose (ou trace, pour l'éventail). Si la caméra ou le modèle manquent, la souris reste.
// Le modèle de suivi des mains se charge chez Google au premier clic : à vérifier par Eliott sur son ordinateur.

const NOIR = '#0c0c0c', BLANC = '#fbfaf6', PAPIER = '#e8e7e3';
const PAS = .008, BANDES = 13;          // pas de la tête du ruban (largeurs de feuille) ; 7 rayures noires, 6 blanches
const URL_MAINS = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
const MODES = {
  ruban: { r: 1395 / 2000, img: 0, nom: 'Ruban',
    note: 'Comme sur l’affiche de 1967 : un ruban rayé suit ta souris, se courbe et passe sur lui-même. Clique pour le poser, puis continue.',
    s1: ['Largeur du ruban', .08, .5, .005, .27], s2: ['Longueur du ruban', .6, 6, .05, 2.6] },
  onde: { r: 1440 / 1127, img: 3, nom: 'Onde',
    note: 'Comme sur Linea grafica (1965) : les rayures se tordent autour de ta souris. Clique pour fixer un tourbillon.',
    s1: ['Taille du tourbillon', .08, .5, .005, .26], s2: ['Torsion', -4, 4, .05, 2.4] },
  eventail: { r: 2323 / 1599, img: 4, nom: 'Éventail',
    note: 'Comme sur l’annonce Alfieri & Lacroix : maintiens le clic et trace, les carrés se déploient en éventail.',
    s1: ['Taille des carrés', .05, .3, .005, .15], s2: ['Écart entre les carrés', .04, .3, .005, .1] },
};
const borne = (v, a, b) => Math.min(b, Math.max(a, v));

/* La tête avance par petits pas et tourne au plus d'un certain angle par pas : les courbes sont de vrais arcs, jamais plus serrés que rmin. */
function diriger(t, cible, dist, rmin, pas) {
  const tourMax = PAS / rmin; let fait = 0;
  while (fait + PAS <= dist) {
    const dx = cible.x - t.x, dy = cible.y - t.y, d = Math.hypot(dx, dy);
    if (d < PAS * 1.5) break;
    let e = Math.atan2(dy, dx) - t.dir; e = Math.atan2(Math.sin(e), Math.cos(e));
    if (d < rmin * 2 && Math.abs(e) > 1.4) break;                     // cible dans le virage : on attend qu'elle s'éloigne
    t.dir += borne(e, -tourMax, tourMax); t.x += Math.cos(t.dir) * PAS; t.y += Math.sin(t.dir) * PAS; fait += PAS; pas?.(t);
  }
  return fait > 0;
}
const vitesse = (t, cible, reduit) => reduit ? .3 : Math.min(Math.hypot(cible.x - t.x, cible.y - t.y) * .16 + .004, .045);
function parcours(t, points, rmin, pas) {                             // pour les états de départ : la tête suit des points de passage
  points.forEach(p => { for (let i = 0; i < 400; i++) if (!diriger(t, p, PAS * 4, rmin, pas) || Math.hypot(p.x - t.x, p.y - t.y) < .05) break; });
}

/* ───────── Ruban ───────── */
function ruban(c, R, k, fond) {
  const P = R.pts, n = P.length; if (n < 3) return;
  const base = fond === 'noir' ? NOIR : BLANC, raie = fond === 'noir' ? BLANC : NOIR, N = [];
  for (let i = 0; i < n; i++) { const a = P[Math.max(0, i - 1)], b = P[Math.min(n - 1, i + 1)], d = Math.hypot(b.x - a.x, b.y - a.y) || 1; N.push([-(b.y - a.y) / d, (b.x - a.x) / d]); }
  const bande = (i0, i1, o0, o1, coul) => {
    c.beginPath();
    for (let i = i0; i <= i1; i++) c.lineTo((P[i].x + N[i][0] * o0 * R.larg) * k, (P[i].y + N[i][1] * o0 * R.larg) * k);
    for (let i = i1; i >= i0; i--) c.lineTo((P[i].x + N[i][0] * o1 * R.larg) * k, (P[i].y + N[i][1] * o1 * R.larg) * k);
    c.closePath(); c.fillStyle = coul; c.fill();
  };
  // par tronçons dessinés l'un après l'autre : chaque tronçon est une forme continue (pas de facettes),
  // et ce qui vient après passe par-dessus ce qui vient avant quand le ruban se croise
  const C = 8;
  for (let s = 0; s < n - 1; s += C) {
    // le fond du tronçon commence un point en arrière, les rayures deux : chaque bord se pose sur du déjà peint, sans fente
    const j0 = Math.max(0, s - 1), i0 = Math.max(0, s - 2), i1 = Math.min(n - 1, s + C);
    if (fond === 'raye') bande(j0, i1, -.64, .64, BLANC);               // liseré blanc pour détacher le ruban du fond rayé
    bande(j0, i1, -.5, .5, base);
    for (let b = 0; b < BANDES; b += 2) bande(i0, i1, b / BANDES - .5, (b + 1) / BANDES - .5, raie);
  }
}
function rubanDepart(H) {
  const t = { x: .86, y: .04, dir: 2.5 }, pts = [{ x: t.x, y: t.y }];
  parcours(t, [{ x: .22, y: .3 }, { x: .8, y: .55 }, { x: .3, y: .9 }, { x: .78, y: 1.15 }, { x: .4, y: H + .1 }], .27 * .62, p => pts.push({ x: p.x, y: p.y }));
  return { pts, larg: .27, t };
}
function fondRaye(c, k, H, larg) {
  const p = larg / BANDES * 2 * k;                                      // même pas que les rayures du ruban
  c.fillStyle = BLANC; c.fillRect(0, 0, k, k * H);
  c.save(); c.translate(k / 2, k * H / 2); c.rotate(-Math.PI / 3); c.fillStyle = NOIR;
  const D = k * (1 + H); for (let x = -D; x < D; x += p) c.fillRect(x, -D, p / 2, 2 * D);
  c.restore();
}

/* ───────── Onde ───────── */
function deformer(x, y, centres) {
  for (const c of centres) {
    const dx = x - c.x, dy = y - c.y, r2 = dx * dx + dy * dy, s2 = c.s * c.s, g = Math.exp(-r2 / s2), th = c.t * g, co = Math.cos(th), si = Math.sin(th);
    x = c.x + dx * co - dy * si; y = c.y + dx * si + dy * co + c.s * .45 * Math.exp(-r2 / (s2 * .6));
  }
  return [x, y];
}
function onde(c, centres, k, H) {
  c.fillStyle = BLANC; c.fillRect(0, 0, k, k * H); c.fillStyle = NOIR;
  const P = .036, M = 320, x0 = -.6, x1 = 1.6;
  const courbe = y0 => { const out = []; for (let i = 0; i <= M; i++) { const [x, y] = deformer(x0 + (x1 - x0) * i / M, y0, centres); out.push(x * k, y * k); } return out; };
  for (let y = -.7; y < H + .7; y += P) {
    const a = courbe(y), b = courbe(y + P / 2);
    c.beginPath(); for (let i = 0; i < a.length; i += 2) c.lineTo(a[i], a[i + 1]); for (let i = b.length - 2; i >= 0; i -= 2) c.lineTo(b[i], b[i + 1]); c.fill();
  }
}

/* ───────── Éventail ───────── */
function carre(c, q, k) {
  const h = q.s * k / 2;
  c.save(); c.translate(q.x * k, q.y * k); c.rotate(q.a);
  c.beginPath(); c.roundRect(-h, -h, 2 * h, 2 * h, h * .06); c.fillStyle = NOIR; c.fill();
  c.lineWidth = Math.max(1, q.s * k * .024); c.strokeStyle = PAPIER; c.stroke(); c.restore();
}

export default {
  lettre: 'G',
  css: `
.gr{display:grid;grid-template-columns:auto minmax(200px,270px);gap:clamp(16px,3cqw,40px);justify-content:center;align-items:center;height:100cqh}
.gr-affiche{position:relative;width:min(calc(100cqw - 320px),calc(100cqh*var(--gr-r)));aspect-ratio:var(--gr-r);cursor:crosshair;touch-action:none;box-shadow:0 0 0 1px rgba(255,255,255,.28),0 26px 50px -30px rgba(0,0,0,.8)}
.gr-affiche canvas{display:block;width:100%;height:100%}
.gr-cote{display:grid;gap:clamp(6px,1.4cqh,12px);align-content:center;min-height:0}
.gr-cote p{margin:0}
.gr [hidden]{display:none!important}
.gr-modes{display:flex;gap:6px}
.gr-modes .bouton{flex:1;padding:6px 8px;min-height:38px}
.gr-ref{display:flex;gap:8px;align-items:flex-end}
.gr-ref img{height:clamp(64px,17cqh,150px);width:auto;max-width:100%;display:block;box-shadow:0 0 0 1px rgba(255,255,255,.3);cursor:zoom-in}
.gr-ref video{height:clamp(56px,12cqh,100px);width:auto;transform:scaleX(-1);box-shadow:0 0 0 1px rgba(255,255,255,.3)}
.gr-reglage{display:grid;gap:3px;font:600 13px/1.3 Archivo,sans-serif}
.gr-reglage input{accent-color:#fff;width:100%}
.gr-reglage select{font:600 13px/1.2 Archivo,sans-serif;color:inherit;background:transparent;border:1.5px solid currentColor;border-radius:4px;padding:6px 8px}
.gr-reglage select option{color:#111}
.gr-boutons{display:flex;flex-wrap:wrap;gap:6px}
.gr-boutons .bouton{padding:6px 12px;min-height:38px}
@media (max-width:760px){.gr{grid-template-columns:1fr;height:auto}.gr-affiche{width:100%}}
`,
  monter(zone, ctx) {
    const IM = ctx.artiste.images || [], R = ctx.reduireMouvement;
    zone.innerHTML = `
      <div class="gr">
        <div class="gr-affiche"><canvas data-export aria-label="La feuille de l’atelier Grignani"></canvas></div>
        <div class="gr-cote">
          <div class="gr-modes" role="group" aria-label="Variante">${Object.entries(MODES).map(([m, d]) => `<button type="button" class="bouton" data-mode="${m}">${d.nom}</button>`).join('')}</div>
          <div class="gr-ref"><img alt=""><video muted playsinline hidden></video></div>
          <p class="etiquette" aria-live="polite"></p>
          <p class="note" data-note></p>
          <label class="gr-reglage"><span data-l1></span><input data-v1 type="range"></label>
          <label class="gr-reglage"><span data-l2></span><input data-v2 type="range"></label>
          <label class="gr-reglage" data-fond>Fond<select><option value="blanc">Blanc, comme l’affiche de 1967</option><option value="raye">Rayé</option><option value="noir">Noir, ruban blanc</option></select></label>
          <div class="gr-boutons">
            <button type="button" class="bouton plein" data-main>Diriger avec la main</button>
            <button type="button" class="bouton" data-annuler>Retirer le dernier</button>
            <button type="button" class="bouton" data-vider>Tout effacer</button>
          </div>
        </div>
      </div>`;
    const $ = s => zone.querySelector(s);
    const affiche = $('.gr-affiche'), cv = affiche.querySelector('canvas'), x = cv.getContext('2d'), fond = document.createElement('canvas');
    const info = $('.etiquette'), v1 = $('[data-v1]'), v2 = $('[data-v2]'), bMain = $('[data-main]'), video = $('video'), refImg = $('.gr-ref img'), selFond = $('[data-fond] select');
    let mode = 'ruban', L = 0, dpr = 1, vivant = true, raf = 0, sale = true, cible = null;
    const H = () => 1 / MODES[mode].r;
    const vals = Object.fromEntries(Object.entries(MODES).map(([m, d]) => [m, [d.s1[4], d.s2[4]]]));
    const E = {
      ruban: { poses: [], libre: rubanDepart(1 / MODES.ruban.r), fond: 'blanc' },
      onde: { centres: [{ x: .14, y: .5, s: .34, t: 2.8 }], vif: null },
      eventail: { chaines: [], tete: null, trace: false, acc: 0 },
    };
    { // l'éventail de départ, pour que la feuille ne soit jamais vide
      const s = .15, t = { x: .1, y: .52, dir: -.35 }, ch = []; let acc = 0;
      parcours(t, [{ x: .34, y: .22 }, { x: .5, y: .5 }, { x: .58, y: .2 }, { x: .82, y: .3 }, { x: .9, y: .6 }], s * .4, p => { acc += PAS; if (acc >= s * .1) { acc = 0; ch.push({ x: p.x, y: p.y, a: p.dir, s }); } });
      E.eventail.chaines.push(ch); E.eventail.tete = t;
    }

    /* ── dessin ── */
    function mesurer() {
      const r = affiche.getBoundingClientRect(); if (!r.width) return;
      dpr = Math.min(devicePixelRatio || 1, 2); L = r.width;
      [cv, fond].forEach(c => { c.width = Math.round(L * dpr); c.height = Math.round(r.height * dpr); });
      refaire();
    }
    function refaire() {
      const f = fond.getContext('2d'); f.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (mode === 'ruban') {
        const S = E.ruban;
        if (S.fond === 'raye') fondRaye(f, L, H(), S.libre.larg); else { f.fillStyle = S.fond === 'noir' ? NOIR : BLANC; f.fillRect(0, 0, L, L * H()); }
        S.poses.forEach(p => ruban(f, p, L, S.fond));
      } else if (mode === 'eventail') {
        f.fillStyle = PAPIER; f.fillRect(0, 0, L, L * H()); E.eventail.chaines.forEach(ch => ch.forEach(q => carre(f, q, L)));
      }
      sale = true;
    }
    function peindre() {
      if (!L) return;
      x.setTransform(1, 0, 0, 1, 0, 0);
      if (mode === 'onde') { x.setTransform(dpr, 0, 0, dpr, 0, 0); const O = E.onde; onde(x, O.vif ? [...O.centres, O.vif] : O.centres, L, H()); }
      else {
        x.drawImage(fond, 0, 0); x.setTransform(dpr, 0, 0, dpr, 0, 0);
        if (mode === 'ruban') ruban(x, E.ruban.libre, L, E.ruban.fond);
        else if (!E.eventail.trace && cible) {                            // le carré fantôme, avant de tracer
          const t = E.eventail.tete; x.save(); x.globalAlpha = .35; carre(x, { x: t.x, y: t.y, a: t.dir, s: vals.eventail[0] }, L); x.restore();
        }
      }
      if (main.modele && main.pos) {                                       // où est l'index
        x.beginPath(); x.arc(main.pos.x * L, main.pos.y * L, main.pince ? 9 : 13, 0, 7);
        x.lineWidth = 3; x.strokeStyle = '#ff3b30'; x.stroke(); if (main.pince) { x.fillStyle = '#ff3b30'; x.fill(); }
      }
    }

    /* ── avancer ── */
    function avancer() {
      if (!cible) return false;
      if (mode === 'ruban') {
        const S = E.ruban.libre, t = S.t, max = +vals.ruban[1];
        const bouge = diriger(t, cible, vitesse(t, cible, R), Math.max(.04, S.larg * .62), p => S.pts.push({ x: p.x, y: p.y }));
        if (bouge) { let long = 0; for (let i = S.pts.length - 1; i > 0; i--) { long += Math.hypot(S.pts[i].x - S.pts[i - 1].x, S.pts[i].y - S.pts[i - 1].y); if (long > max) { S.pts.splice(0, i); break; } } }
        return bouge;
      }
      if (mode === 'onde') {
        const O = E.onde, [s, t] = vals.onde;
        if (!O.vif) O.vif = { x: cible.x, y: cible.y, s: +s, t: 0 };
        const v = O.vif, q = R ? 1 : .18, avant = v.x + v.y + v.t;
        v.x += (cible.x - v.x) * q; v.y += (cible.y - v.y) * q; v.s = +s; v.t += (+t - v.t) * q;
        return Math.abs(v.x + v.y + v.t - avant) > 1e-4;
      }
      const V = E.eventail, [s, ecart] = vals.eventail, f = fond.getContext('2d');
      return diriger(V.tete, cible, vitesse(V.tete, cible, R), +s * .4, p => {
        if (!V.trace) return; V.acc += PAS;
        if (V.acc >= s * ecart) { V.acc = 0; const q = { x: p.x, y: p.y, a: p.dir, s: +s }; V.chaines[V.chaines.length - 1].push(q); f.setTransform(dpr, 0, 0, dpr, 0, 0); carre(f, q, L); }
      });
    }
    function boucle() {
      raf = requestAnimationFrame(boucle); if (!vivant) return;
      if (main.modele && video.readyState >= 2) lireMain();
      if (avancer()) sale = true;
      if (sale) { sale = false; peindre(); }
    }

    /* ── actions ── */
    function poser() {
      if (mode === 'ruban') {
        const S = E.ruban, l = S.libre; if (l.pts.length < 8) return;
        S.poses.push({ pts: l.pts, larg: l.larg }); const f = fond.getContext('2d'); f.setTransform(dpr, 0, 0, dpr, 0, 0); ruban(f, l, L, S.fond);
        S.libre = { pts: [{ x: l.t.x, y: l.t.y }], larg: +vals.ruban[0], t: { ...l.t } };
      } else if (mode === 'onde') {
        const v = E.onde.vif; if (!v) return; E.onde.centres.push({ ...v }); E.onde.vif = null;
      }
      sale = true; dire(); ctx.annoncer?.('Posé.');
    }
    function tracer(on) {
      const V = E.eventail; if (on === V.trace) return;
      V.trace = on; if (on) { V.chaines.push([]); V.acc = 1; } else if (!V.chaines.at(-1)?.length) V.chaines.pop();
      sale = true; dire();
    }
    function dire(t) {
      if (t) { info.textContent = t; return; }
      const n = mode === 'ruban' ? E.ruban.poses.length : mode === 'onde' ? E.onde.centres.length : E.eventail.chaines.length;
      const mots = { ruban: ['ruban posé', 'rubans posés'], onde: ['tourbillon', 'tourbillons'], eventail: ['éventail', 'éventails'] }[mode];
      info.textContent = main.modele ? (main.vu ? 'Main vue : l’index dirige, pince pour ' + (mode === 'eventail' ? 'tracer.' : 'poser.') : 'Montre ta main face à la caméra.') : (n ? `${n} ${n > 1 ? mots[1] : mots[0]}` : MODES[mode].nom);
    }
    function choisir(m) {
      mode = m; const d = MODES[m];
      zone.querySelectorAll('[data-mode]').forEach(b => { const on = b.dataset.mode === m; b.classList.toggle('plein', on); b.setAttribute('aria-pressed', on); });
      $('[data-note]').textContent = d.note;
      [[v1, d.s1, '[data-l1]', 0], [v2, d.s2, '[data-l2]', 1]].forEach(([el, s, l, i]) => { $(l).textContent = s[0]; el.min = s[1]; el.max = s[2]; el.step = s[3]; el.value = vals[m][i]; });
      $('[data-fond]').hidden = m !== 'ruban';
      const im = IM[d.img] || IM[0];
      if (im) { refImg.src = `${ctx.racine}img/g/${im.f}`; refImg.alt = im.t; refImg.title = im.t; refImg.hidden = false; } else refImg.hidden = true;
      affiche.style.setProperty('--gr-r', d.r.toFixed(4)); cible = null; E.onde.vif = null;
      L = 0; mesurer(); dire();
    }

    /* ── souris ── */
    const ou = e => { const r = affiche.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.width }; };
    affiche.addEventListener('pointermove', e => { cible = ou(e); sale = true; });
    affiche.addEventListener('pointerdown', e => { affiche.setPointerCapture?.(e.pointerId); cible = ou(e); if (mode === 'eventail') tracer(true); });
    affiche.addEventListener('pointerup', () => { if (mode === 'eventail') tracer(false); else poser(); });
    affiche.addEventListener('pointerleave', () => { if (mode === 'onde' && !main.modele) { E.onde.vif = null; cible = null; sale = true; } });

    /* ── réglages et boutons ── */
    zone.querySelectorAll('[data-mode]').forEach(b => b.addEventListener('click', () => choisir(b.dataset.mode)));
    v1.addEventListener('input', () => { vals[mode][0] = +v1.value; if (mode === 'ruban') { E.ruban.libre.larg = +v1.value; if (E.ruban.fond === 'raye') refaire(); } sale = true; });
    v2.addEventListener('input', () => { vals[mode][1] = +v2.value; sale = true; });
    selFond.addEventListener('change', () => { E.ruban.fond = selFond.value; refaire(); });
    refImg.addEventListener('click', () => zone.closest('.pg')?.querySelector(`.pg-vignettes [data-image="${MODES[mode].img}"]`)?.click());
    $('[data-annuler]').addEventListener('click', () => {
      if (mode === 'ruban') E.ruban.poses.pop(); else if (mode === 'onde') E.onde.centres.pop(); else E.eventail.chaines.pop();
      refaire(); dire();
    });
    $('[data-vider]').addEventListener('click', () => {
      if (mode === 'ruban') { const t = E.ruban.libre.t; E.ruban.poses = []; E.ruban.libre = { pts: [{ x: t.x, y: t.y }], larg: +vals.ruban[0], t: { ...t } }; }
      else if (mode === 'onde') { E.onde.centres = []; E.onde.vif = null; }
      else E.eventail.chaines = [];
      refaire(); dire();
    });

    /* ── la main, à la webcam ── */
    const main = { modele: null, flux: null, vu: false, pince: false, compte: 0, ts: 0, tv: -1, pos: null, vuA: 0 };
    function lireMain() {
      if (video.currentTime === main.tv) return;                          // une détection par image de la caméra, pas plus
      main.tv = video.currentTime; main.ts = Math.max(main.ts + 1, performance.now());
      let r; try { r = main.modele.detectForVideo(video, main.ts); } catch { return; }
      const m = r.landmarks?.[0], maintenant = performance.now();
      if (!m) { if (main.vu && maintenant - main.vuA > 500) { main.vu = false; main.pos = null; if (main.pince) { main.pince = false; if (mode === 'eventail') tracer(false); } dire(); sale = true; } return; }
      main.vuA = maintenant; if (!main.vu) { main.vu = true; dire(); }
      const z = 1.4, px = borne((.5 - m[8].x) * z + .5, 0, 1), py = borne(((m[8].y - .5) * z + .5) * H(), 0, H());
      main.pos = main.pos ? { x: main.pos.x + (px - main.pos.x) * .55, y: main.pos.y + (py - main.pos.y) * .55 } : { x: px, y: py };
      cible = { ...main.pos }; sale = true;
      // pincement mesuré par rapport à la taille de la main, avec une marge pour ne pas clignoter
      const taille = Math.hypot(m[0].x - m[9].x, m[0].y - m[9].y) || .1, ecart = Math.hypot(m[4].x - m[8].x, m[4].y - m[8].y) / taille;
      main.compte = ecart < .3 ? main.compte + 1 : 0;
      if (!main.pince && main.compte >= 2) { main.pince = true; if (mode === 'eventail') tracer(true); else poser(); }
      else if (main.pince && ecart > .5) { main.pince = false; if (mode === 'eventail') tracer(false); }
    }
    function couperCamera() {
      main.flux?.getTracks().forEach(p => p.stop()); main.flux = null; main.modele?.close?.(); main.modele = null; main.vu = false; main.pos = null;
      video.hidden = true; bMain.textContent = 'Diriger avec la main'; bMain.setAttribute('aria-pressed', 'false');
    }
    bMain.addEventListener('click', async () => {
      if (main.modele || main.flux) { couperCamera(); dire(); sale = true; return; }
      bMain.disabled = true; dire('Chargement du suivi de la main…');
      try {
        main.flux = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: 'user' } });
        video.srcObject = main.flux; await video.play(); video.hidden = false;
        const { FilesetResolver, HandLandmarker } = await import(`${ctx.racine}vendor/mediapipe/vision_bundle.mjs`);
        const fs = await FilesetResolver.forVisionTasks(`${ctx.racine}vendor/mediapipe/wasm`);
        const options = delegate => ({ baseOptions: { modelAssetPath: URL_MAINS, delegate }, runningMode: 'VIDEO', numHands: 1,
          minHandDetectionConfidence: .4, minHandPresenceConfidence: .4, minTrackingConfidence: .4 });
        let m; try { m = await HandLandmarker.createFromOptions(fs, options('GPU')); } catch { m = await HandLandmarker.createFromOptions(fs, options('CPU')); }
        if (!vivant || !main.flux) { m.close?.(); return; }
        main.modele = m; bMain.textContent = 'Arrêter la caméra'; bMain.setAttribute('aria-pressed', 'true'); dire();
      } catch (e) { console.warn(e); couperCamera(); dire('Caméra ou suivi de la main indisponible : la souris reste active.'); }
      bMain.disabled = false;
    });

    const ro = new ResizeObserver(mesurer); ro.observe(affiche);
    choisir('ruban'); raf = requestAnimationFrame(boucle);
    return () => { vivant = false; cancelAnimationFrame(raf); ro.disconnect(); couperCamera(); };
  },
};
