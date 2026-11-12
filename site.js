// À la lettre : l'accueil (l'étagère qui boucle de Z à A) et la page ouverte (le livre, en double page).
// Les 26 artistes viennent de labo/donnees.js, leurs lettres de labo/lettres.js, leurs ateliers de artistes/<lettre>-<nom>.js.
// Réglages de l'accueil : ajouter ?reglages à l'adresse. Les valeurs par défaut sont dans DEFAUT, juste en dessous.

import { ARTISTES, PAR_LETTRE } from './labo/donnees.js';
import { carte, glyphe } from './labo/lettres.js';

const DEFAUT = { fond: 'affiche', titre: 'haut', typo: 'affiche', texture: 'toile', texte: 'À la lettre', incline: '1' };

const TITRES = ['À la lettre', 'Emprunts', '741.6', 'Rayon graphisme', 'Prière de toucher', 'De A à Z'];
const FONDS = { clair: 'Mur clair', affiche: 'Affiche : couleur et nom de l’artiste', nuit: 'Nuit, livre éclairé', grille: 'Grille de mise en page', lettre: 'Lettre géante de l’artiste' };
const PLACES = { haut: 'En haut à gauche', mur: 'Géant sur le mur, derrière les livres', etiquette: 'Étiquette accrochée au rayon' };
const TEXTURES = { toile: 'Toile', papier: 'Papier', lisse: 'Lisse' };
const TYPOS = {
  affiche: { nom: 'Condensée grasse', f: '"Sofia Cond",Impact,sans-serif', g: 900, casse: 'uppercase', ls: '0', k: 1, style: 'normal' },
  livre: { nom: 'Caslon italique', f: 'Caslon,Georgia,serif', g: 400, casse: 'none', ls: '-.02em', k: .74, style: 'italic' },
  didone: { nom: 'Didone grasse', f: 'Bodoni,Didot,serif', g: 900, casse: 'none', ls: '-.025em', k: .72, style: 'normal' },
  anton: { nom: 'Anton', f: 'Anton,Impact,sans-serif', g: 400, casse: 'uppercase', ls: '.005em', k: .8, style: 'normal' },
  grotesque: { nom: 'Grotesque serrée', f: 'Archivo,Helvetica,Arial,sans-serif', g: 800, casse: 'none', ls: '-.05em', k: .7, style: 'normal' },
};
const VERSIONS = [
  { nom: '1 Galerie', fond: 'clair', titre: 'haut', typo: 'affiche', texture: 'toile' },
  { nom: '2 Affiche', fond: 'affiche', titre: 'haut', typo: 'affiche', texture: 'papier' },
  { nom: '3 Nuit', fond: 'nuit', titre: 'mur', typo: 'livre', texture: 'toile' },
  { nom: '4 Grille', fond: 'grille', titre: 'haut', typo: 'grotesque', texture: 'lisse' },
  { nom: '5 Lettre', fond: 'lettre', titre: 'etiquette', typo: 'affiche', texture: 'toile' },
];
const MURS = { clair: '#e6e5e1', nuit: '#191a1e', grille: '#f1f0ec', lettre: '#e6e5e1' };

const RACINE = new URL('./', import.meta.url).href, LABO = new URL('./labo/', import.meta.url);
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const cap = s => s[0].toUpperCase() + s.slice(1);
const mod = (n, m) => ((n % m) + m) % m;
const N = ARTISTES.length;
const reduit = matchMedia('(prefers-reduced-motion: reduce)').matches;
const params = new URLSearchParams(location.search), chantier = params.has('reglages');
const R = { ...DEFAUT }; for (const k of Object.keys(DEFAUT)) if (params.has(k)) R[k] = params.get(k);

const corps = document.body, scene = $('#scene'), rayon = $('#rayon'), page = $('#page'), visionneuse = $('#visionneuse');

/* ───────── Couleurs : la teinte d'un artiste qui se voit sur le mur ───────── */
function lum(hex) {
  const c = hex.replace('#', ''), v = [0, 2, 4].map(i => parseInt(c.slice(i, i + 2), 16) / 255).map(u => u <= .03928 ? u / 12.92 : ((u + .055) / 1.055) ** 2.4);
  return .2126 * v[0] + .7152 * v[1] + .0722 * v[2];
}
const contraste = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + .05) / (y + .05); };
const teinte = (a, mur) => [a.fond, a.accent, a.encre].find(c => contraste(c, mur) >= 1.7) || a.encre;

/* La lettre de classement n'est marquée que si elle n'est l'initiale ni du prénom ni du nom (le i de Girard, le x d'Excoffon). */
const norm = t => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
const estInitiale = a => norm(a.nom).split(/[\s.\-]+/).some(m => m[0] === a.l);
const marquer = (t, a) => estInitiale(a) ? esc(t) : [...t].map(ch => norm(ch)[0] === a.l ? `<span class="cl">${esc(ch)}</span>` : esc(ch)).join('');
const nomMarque = a => marquer(a.nom, a);
/* Sur le livre : le nom court, sauf s'il ne contient pas la lettre (D pour Carson → « David Carson »). */
const nomLivre = a => norm(a.court).includes(a.l) ? a.court : a.nom;
const estLong = a => nomLivre(a) !== a.court;

/* ───────── L'étagère ───────── */
const livreHTML = (a, i) => `<div class="livre" style="--c:${a.fond};--e:${a.encre}">
  <div class="ombre"></div>
  <div class="pose"><div class="tourne">
    <div class="f dos"><span class="lt">${glyphe(a.l)}</span><span class="filet"></span><span class="nm${estLong(a) ? ' long' : ''}">${esc(nomLivre(a))}</span><span class="no">${String(i + 1).padStart(2, '0')}</span></div>
    <div class="f couv">${carte(a.l)}<div class="nomcouv${estLong(a) ? ' long' : ''}">${marquer(nomLivre(a), a)}</div><div class="coll">${esc(cap(a.courant))}</div></div>
    <div class="f plat"></div><div class="f cime"></div><div class="f gout"></div>
  </div></div></div>`;
rayon.setAttribute('aria-hidden', 'true');
rayon.innerHTML = `<div class="ombre-mur"></div>` +
  [0, 1].map(() => ARTISTES.map(livreHTML).join('')).join(''); // deux séries : l'étagère boucle
const L = [...rayon.querySelectorAll('.livre')];
$('#alpha').innerHTML = ARTISTES.map(a => `<button type="button" data-l="${a.l}" aria-label="${a.l}, ${esc(a.nom)}">${a.l}</button>`).join('');

let v = 0;          // rang du livre sorti ; il ne s'arrête jamais à 25 : après Z on continue sur A
let pasx = 60;      // écart entre deux dos, en pixels
const courant = () => ARTISTES[mod(v, N)];
const livreActif = () => L.find(b => b.classList.contains('actif'));

function ranger() {
  const H = parseFloat(getComputedStyle(L[0].querySelector('.dos')).height) || 400, ws = H * .13, d = H * .68, ecart = H * .022;
  pasx = ws + ecart; caler(H);
  L.forEach((b, j) => {
    const r = mod(j - v + N, 2 * N) - N, o = r === 0;
    if (b._r !== undefined && Math.abs(b._r - r) > N) { // il passe d'un bout à l'autre, hors de l'écran : sans glisser
      b.classList.add('saut'); requestAnimationFrame(() => requestAnimationFrame(() => b.classList.remove('saut')));
    }
    b._r = r;
    b.classList.toggle('actif', o);
    b.style.transform = `translate3d(${r * pasx + Math.sign(r) * ((d - ws) / 2 + ecart * 1.7)}px,0,${o ? d / 2 + ws * .25 : 0}px)`;
    b.style.zIndex = 100 - Math.abs(r);
    b.style.setProperty('--od', r === 1 ? .34 : r === 2 ? .16 : r === 3 ? .06 : 0);
    if (!o) { const p = b.querySelector('.pose'); p.style.transform = ''; p.style.transition = ''; }
  });
  const a = courant(), mur = R.fond === 'affiche' ? a.fond : (MURS[R.fond] || MURS.clair);
  $('#nom').innerHTML = nomMarque(a);
  $('#meta').innerHTML = `<span>${esc(a.dates)}</span><span>${esc(a.pays)}</span><span>${esc(cap(a.courant))}</span>`;
  $('#geste').textContent = a.geste;
  corps.style.setProperty('--a-fond', a.fond); corps.style.setProperty('--a-encre', a.encre); corps.style.setProperty('--a-teinte', teinte(a, mur));
  $('#murNom').textContent = nomLivre(a); $('#murLettre').innerHTML = glyphe(a.l); ajusterNom();
  document.querySelectorAll('#alpha button').forEach(b => b.dataset.l === a.l ? b.setAttribute('aria-current', 'true') : b.removeAttribute('aria-current'));
  pencher();
}
const PERSPECTIVE = 1900, mesure = document.createElement('canvas').getContext('2d');
/* La planche et son chant sont dessinés à plat, derrière les livres : on calcule où ils tombent à l'écran. */
function caler(H) {
  const oy = innerHeight * .35, sol = parseFloat(getComputedStyle(rayon).top), pd = H * 1.1;
  const y = z => oy + (sol - oy) * PERSPECTIVE / (PERSPECTIVE - z);
  corps.style.setProperty('--y-fond', y(-pd / 2).toFixed(1) + 'px'); corps.style.setProperty('--y-bord', y(pd / 2).toFixed(1) + 'px');
  corps.style.setProperty('--y-ep', (H * .046 * PERSPECTIVE / (PERSPECTIVE - pd / 2)).toFixed(1) + 'px');
  return { oy, sol };
}
/* Fond « affiche » : le nom géant de l'artiste, calé pour dépasser juste derrière les livres. */
function ajusterNom() {
  if (R.fond !== 'affiche') return;
  const el = $('#murNom'), H = parseFloat(getComputedStyle(L[0].querySelector('.dos')).height) || 400, { oy, sol } = caler(H);
  mesure.font = '900 200px "Sofia Cond"';
  const m = mesure.measureText(el.textContent.toUpperCase()), cap = mesure.measureText('H').actualBoundingBoxAscent / 200;
  const A = m.fontBoundingBoxAscent / 200, D = m.fontBoundingBoxDescent / 200;
  const hautLivres = oy + (sol - H - oy) * PERSPECTIVE / (PERSPECTIVE - H * .4), marge = Math.max(14, innerHeight * .022);
  const fs = Math.min((hautLivres - marge) * 1.17 / cap, 200 * innerWidth * .62 / m.width);
  el.style.fontSize = fs + 'px'; el.style.top = (marge - fs * ((1 - (A + D)) / 2 + A - cap)) + 'px';
}
function aller(dv) { if (!dv || ouvert) return; v += dv; ranger(); }
function versLettre(l) {
  const t = ARTISTES.findIndex(a => a.l === l); if (t < 0) return;
  const dlt = mod(t - mod(v, N) + 13, N) - 13; // le chemin le plus court, dans un sens ou dans l'autre
  if (dlt === 0) ouvrir(); else aller(dlt);
}

/* le livre sorti suit un peu la souris */
let mx = 0, my = 0, px = 0, py = 0, rafP = 0;
function pencher() { if (!rafP) rafP = requestAnimationFrame(tic); }
function tic() {
  rafP = 0;
  const b = livreActif(); if (!b || ouvert) return;
  const p = b.querySelector('.pose'), actif = R.incline === '1' && !reduit;
  const cx = actif ? mx : 0, cy = actif ? my : 0;
  px += (cx - px) * .12; py += (cy - py) * .12;
  p.style.transition = 'none';
  p.style.transform = `rotateX(${(-py * 7).toFixed(2)}deg) rotateY(${(px * 17).toFixed(2)}deg)`;
  b.querySelector('.couv').style.setProperty('--reflet', (42 + px * 30).toFixed(1) + '%');
  if (Math.abs(cx - px) + Math.abs(cy - py) > .003) rafP = requestAnimationFrame(tic);
}
addEventListener('pointermove', e => { if (e.pointerType === 'touch') return; mx = (e.clientX / innerWidth - .5) * 2; my = (e.clientY / innerHeight - .5) * 2; pencher(); });

/* souris, molette, glisser */
let x0 = null, fait = 0, glisse = false;
scene.addEventListener('pointerdown', e => { x0 = e.clientX; fait = 0; glisse = false; });
addEventListener('pointermove', e => {
  if (x0 === null) return;
  const n = Math.trunc((x0 - e.clientX) / pasx);
  if (n !== fait) { glisse = true; aller(n - fait); fait = n; }
});
addEventListener('pointerup', () => { x0 = null; });
rayon.addEventListener('click', e => {
  if (glisse) { glisse = false; return; }
  const b = e.target.closest('.livre'); if (!b) return;
  if (b._r === 0) ouvrir(); else aller(b._r);
});
let molette = 0;
addEventListener('wheel', e => {
  if (ouvert) return;
  const t = Date.now(), dlt = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
  if (t - molette < 150 || Math.abs(dlt) < 6) return;
  molette = t; aller(dlt > 0 ? 1 : -1);
}, { passive: true });
document.querySelector('.pas.g').addEventListener('click', () => aller(-1));
document.querySelector('.pas.d').addEventListener('click', () => aller(1));
$('#alpha').addEventListener('click', e => { const b = e.target.closest('button'); if (b) versLettre(b.dataset.l); });
$('#ouvrir').addEventListener('click', () => ouvrir());

/* ───────── La page ouverte ───────── */
const CHEVRON = d => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d < 0 ? 'M15 4 7 12l8 8' : 'm9 4 8 8-8 8'}"/></svg>`;
function pageHTML(a) {
  const i = ARTISTES.indexOf(a), p = ARTISTES[mod(i - 1, N)], s = ARTISTES[mod(i + 1, N)], l = a.l.toLowerCase();
  const images = a.images || [];
  const vignettes = images.length
    ? `<div class="pg-vignettes">${images.map((im, k) => `<button type="button" data-image="${k}" aria-label="Voir : ${esc(im.t)}"><img src="${RACINE}img/${l}/${esc(im.f)}" alt="" loading="lazy"></button>`).join('')}</div>`
    : (chantier ? `<div class="pg-vignettes"><span class="vide">img/${l}/<br>ref.jpg</span><span class="vide">img/${l}/<br>01.jpg</span></div>` : '');
  return `<article class="pg" data-l="${a.l}" style="--c:${a.fond};--e:${a.encre};--a:${a.accent}">
    <aside class="pg-g">
      <div class="pg-carte">${carte(a.l)}</div>
      <h2 class="pg-nom" tabindex="-1">${nomMarque(a)}</h2>
      <p class="pg-meta"><span>${esc(a.dates)}</span><span>${esc(a.pays)}</span><span>${esc(cap(a.courant))}</span></p>
      <p class="pg-qui">${esc(a.qui)}</p>
      <div class="pg-oeuvre"><p class="et">${images.length > 1 ? 'Les œuvres' : 'L’œuvre de départ'}</p><p>${esc(a.oeuvre)}</p>${vignettes}</div>
      <nav class="pg-nav" aria-label="Lettre précédente, lettre suivante">
        <button type="button" data-pas="-1">${CHEVRON(-1)}<b>${p.l}</b>${esc(p.court)}</button>
        <button type="button" data-pas="1">${esc(s.court)}<b>${s.l}</b>${CHEVRON(1)}</button>
      </nav>
    </aside>
    <section class="pg-d">
      <header class="pg-barre">
        <p class="pg-geste">${esc(a.geste)}</p>
        <div class="pg-actions">
          <button type="button" data-enregistrer hidden>Enregistrer l’image</button>
          <button type="button" data-large aria-pressed="false">Agrandir</button>
          <button type="button" data-fermer>Fermer <kbd>Échap</kbd></button>
        </div>
      </header>
      <div class="pg-scene"><div class="zone"></div></div>
    </section>
  </article>`;
}

/* Le nom géant de la page de gauche : on le réduit jusqu'à ce que son mot le plus long tienne sur une ligne. */
function ajusterNomPage(pg) {
  const nom = pg.querySelector('.pg-nom'); if (!nom) return; nom.style.fontSize = '';
  let fs = parseFloat(getComputedStyle(nom).fontSize);
  for (let i = 0; i < 24 && nom.scrollWidth > nom.clientWidth + 1; i++) { fs *= .95; nom.style.fontSize = fs + 'px'; }
}

/* Installe l'atelier de l'artiste dans la zone ; renvoie de quoi le démonter. */
async function monter(pg, a) {
  ajusterNomPage(pg); document.fonts?.load('900 80px "Sofia Cond"').then(() => ajusterNomPage(pg));
  const zone = pg.querySelector('.zone'); let demonter = null, style = null, clavier = false, fleches = false;
  if (a.module) {
    try {
      const m = (await import(new URL(a.module, LABO).href)).default;
      clavier = !!m.clavier; fleches = !!m.fleches;
      if (m.css) { style = document.createElement('style'); style.textContent = m.css.replaceAll('url(../', `url(${RACINE}`); document.head.append(style); }
      demonter = m.monter?.(zone, { artiste: a, couleurs: { fond: a.fond, encre: a.encre, accent: a.accent }, reduireMouvement: reduit, annoncer: t => { $('#annonce').textContent = t; }, racine: RACINE }) || null;
    } catch (e) { console.error(e); zone.innerHTML = `<div class="attente"><p>L’atelier ne se charge pas. Recharge la page.</p></div>`; }
  } else {
    zone.innerHTML = `<div class="attente">${carte(a.l)}<p>L’atelier de cette lettre arrive.</p></div>`;
  }
  const bouton = pg.querySelector('[data-enregistrer]');
  if (a.module && zone.querySelector('canvas, img')) {
    bouton.hidden = false;
    bouton.onclick = async () => {
      const im = zone.querySelector('canvas[data-export], canvas, img'); if (!im) return;
      const blob = im instanceof HTMLCanvasElement ? await new Promise(r => im.toBlob(r, 'image/png')) : await (await fetch(im.src)).blob();
      const lien = document.createElement('a'); lien.href = URL.createObjectURL(blob); lien.download = `${a.id}.${blob.type.includes('png') ? 'png' : 'jpg'}`;
      document.body.append(lien); lien.click(); lien.remove(); setTimeout(() => URL.revokeObjectURL(lien.href), 4000);
    };
  }
  const fin = () => { try { demonter?.(); } catch (e) { console.error(e); } style?.remove(); };
  fin.clavier = clavier; fin.fleches = fleches;
  return fin;
}

let ouvert = null, fin = null, occupe = false;
const hash = l => '#' + l.toLowerCase();
const titrePage = a => { document.title = a ? `${a.l} · ${a.nom} · ${R.texte}` : `${R.texte} : 26 graphistes, 26 gestes à refaire`; };

function rectCouverture() {
  const b = livreActif(), p = b.querySelector('.pose'); p.style.transition = 'none'; p.style.transform = ''; px = py = 0;
  return b.querySelector('.couv').getBoundingClientRect();
}
function poserVolet(a, r) {
  const el = document.createElement('div'); el.className = 'volet';
  el.style.cssText = `left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;--c:${a.fond};--e:${a.encre};--d:${r.width}px`;
  el.innerHTML = `<div class="volet-in"><div class="volet-r">${carte(a.l)}<div class="nomcouv${estLong(a) ? ' long' : ''}">${marquer(nomLivre(a), a)}</div><div class="coll">${esc(cap(a.courant))}</div></div><div class="volet-v"></div></div>`;
  document.body.append(el); return el;
}
const decoupe = r => `inset(${r.top}px ${innerWidth - r.right}px ${innerHeight - r.bottom}px ${r.left}px)`;
const PLEIN = 'inset(0px 0px 0px 0px)';

async function ouvrir({ anime = true, histoire = true } = {}) {
  if (ouvert || occupe) return; occupe = true;
  const a = courant(), r = rectCouverture();
  page.innerHTML = pageHTML(a); page.hidden = false; ouvert = a.l; titrePage(a);
  if (anime && !reduit) page.style.clipPath = decoupe(r);
  if (histoire) history.pushState({ ouvert: a.l }, '', hash(a.l));
  fin = await monter(page.firstElementChild, a);
  if (anime && !reduit) {
    // la couverture pivote sur sa charnière ; dessous, la première page grandit jusqu'à remplir l'écran
    const el = poserVolet(a, r);
    el.firstElementChild.animate([{ transform: 'rotateY(0deg)' }, { transform: 'rotateY(-152deg)' }], { duration: 820, easing: 'cubic-bezier(.5,0,.2,1)', fill: 'both' });
    el.animate([{ opacity: 1, offset: 0 }, { opacity: 1, offset: .6 }, { opacity: 0, offset: 1 }], { duration: 820, fill: 'both' });
    const t = page.animate([{ clipPath: decoupe(r) }, { clipPath: PLEIN }], { duration: 640, delay: 210, easing: 'cubic-bezier(.7,0,.2,1)', fill: 'both' });
    await t.finished.catch(() => {}); page.style.clipPath = ''; t.cancel(); setTimeout(() => el.remove(), 260);
  }
  scene.style.visibility = 'hidden';
  page.querySelector('.pg-nom')?.focus({ preventScroll: true });
  occupe = false;
}

async function fermer({ histoire = true } = {}) {
  if (!ouvert || occupe) return;
  if (histoire && history.state?.ouvert) { history.back(); return; } // le retour du navigateur ferme aussi le livre
  occupe = true;
  const a = PAR_LETTRE.get(ouvert);
  fin?.(); fin = null; scene.style.visibility = '';
  if (!reduit) {
    const r = rectCouverture(), el = poserVolet(a, r);
    el.firstElementChild.animate([{ transform: 'rotateY(-152deg)' }, { transform: 'rotateY(0deg)' }], { duration: 640, delay: 160, easing: 'cubic-bezier(.5,0,.2,1)', fill: 'both' });
    el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, delay: 160, fill: 'both' });
    const t = page.animate([{ clipPath: PLEIN }, { clipPath: decoupe(r) }], { duration: 540, easing: 'cubic-bezier(.7,0,.2,1)', fill: 'both' });
    await new Promise(f => setTimeout(f, 820));
    t.cancel(); el.remove();
  }
  page.hidden = true; page.innerHTML = ''; ouvert = null; titrePage(null);
  if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  occupe = false; pencher();
}

/* lettre précédente ou suivante, sans repasser par l'étagère */
async function changer(p) {
  if (!ouvert || occupe) return; occupe = true;
  fin?.(); fin = null;
  v += p; ranger();
  const a = courant(), ancien = page.firstElementChild;
  page.insertAdjacentHTML('beforeend', pageHTML(a));
  const neuf = page.lastElementChild; neuf.classList.add('entre');
  if (!reduit) neuf.style.clipPath = p > 0 ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)';
  ouvert = a.l; titrePage(a); history.replaceState(history.state ? { ouvert: a.l } : null, '', hash(a.l));
  fin = await monter(neuf, a);
  if (!reduit) {
    const k = { duration: 600, easing: 'cubic-bezier(.7,0,.2,1)', fill: 'both' };
    ancien.animate([{ transform: 'translateX(0)' }, { transform: `translateX(${-p * 16}%)` }], k);
    const t = neuf.animate([{ clipPath: p > 0 ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], k);
    await t.finished.catch(() => {}); neuf.style.clipPath = ''; t.cancel();
  }
  ancien.remove(); neuf.classList.remove('entre');
  neuf.querySelector('.pg-nom')?.focus({ preventScroll: true });
  occupe = false;
}

page.addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.pas) changer(+b.dataset.pas);
  else if ('fermer' in b.dataset) fermer();
  else if ('large' in b.dataset) { const pg = b.closest('.pg'), on = pg.classList.toggle('large'); b.setAttribute('aria-pressed', on); b.textContent = on ? 'Réduire' : 'Agrandir'; }
  else if (b.dataset.image) { const a = PAR_LETTRE.get(ouvert), im = a.images[+b.dataset.image]; voir(`${RACINE}img/${a.l.toLowerCase()}/${im.f}`, im.t); }
});
function voir(src, legende) {
  visionneuse.innerHTML = `<img src="${src}" alt=""><p>${esc(legende)}</p><button type="button">Fermer</button>`; visionneuse.hidden = false;
  visionneuse.querySelector('button').focus();
}
visionneuse.addEventListener('click', () => { visionneuse.hidden = true; });

/* ───────── Clavier ───────── */
addEventListener('keydown', e => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const champ = e.target instanceof Element && e.target.closest('input,textarea,select,[contenteditable]');
  if (e.key === 'Escape') {
    if (!visionneuse.hidden) visionneuse.hidden = true;
    else if (champ && !champ.closest('.zone')) champ.blur();
    else if (ouvert) fermer();
    return;
  }
  if (ouvert) { // livre ouvert : les lettres ne changent plus de page ; seules les flèches passent à la lettre voisine
    if (champ && champ.type !== 'range' || fin?.fleches) { if (e.key !== 'PageUp' && e.key !== 'PageDown') return; }
    if (champ?.type === 'range' && e.key.startsWith('Arrow')) return;
    if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); changer(-1); }
    else if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); changer(1); }
    return;
  }
  if (champ) return;
  if (/^[a-z]$/i.test(e.key)) { e.preventDefault(); versLettre(e.key.toUpperCase()); }
  else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); aller(-1); }
  else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); aller(1); }
  else if (e.key === 'Enter' && !(e.target instanceof HTMLButtonElement)) { e.preventDefault(); ouvrir(); }
  else if (chantier && /^[1-5]$/.test(e.key)) { Object.assign(R, VERSIONS[+e.key - 1]); delete R.nom; appliquer(); }
});
addEventListener('popstate', () => {
  const l = location.hash.slice(1).toUpperCase();
  if (!PAR_LETTRE.has(l)) { if (ouvert) fermer({ histoire: false }); }
  else if (!ouvert) { v += mod(ARTISTES.findIndex(a => a.l === l) - mod(v, N) + 13, N) - 13; ranger(); ouvrir({ histoire: false }); }
});

/* ───────── Réglages ───────── */
function appliquer() {
  corps.dataset.fond = R.fond; corps.dataset.titre = R.titre; corps.dataset.typo = R.typo; corps.dataset.texture = R.texture;
  const t = TYPOS[R.typo] || TYPOS.affiche;
  corps.style.setProperty('--t-titre', t.f); corps.style.setProperty('--t-titre-g', t.g); corps.style.setProperty('--t-titre-casse', t.casse);
  corps.style.setProperty('--t-titre-ls', t.ls); corps.style.setProperty('--t-titre-k', t.k); corps.style.setProperty('--t-titre-style', t.style);
  $('#titre').textContent = R.texte; titrePage(ouvert ? PAR_LETTRE.get(ouvert) : null);
  const q = new URLSearchParams(); if (chantier) q.set('reglages', '1');
  for (const k of Object.keys(DEFAUT)) if (R[k] !== DEFAUT[k]) q.set(k, R[k]);
  const qs = q.toString(); history.replaceState(history.state, '', location.pathname + (qs ? '?' + qs : '') + location.hash);
  ranger(); majPanneau();
}
const panneau = $('#reglages');
const options = (o, choisi) => Object.entries(o).map(([k, n]) => `<option value="${k}"${k === choisi ? ' selected' : ''}>${esc(typeof n === 'string' ? n : n.nom)}</option>`).join('');
function majPanneau() {
  if (!chantier) return;
  panneau.hidden = false;
  const plie = panneau.classList.contains('plie');
  panneau.innerHTML = `<div class="r-tete"><strong>${plie ? '' : 'Réglages de l’accueil'}</strong><button type="button" data-plier>${plie ? 'Réglages' : 'Réduire'}</button></div>
    <div class="r-versions">${VERSIONS.map((x, i) => `<button type="button" data-version="${i}" aria-pressed="${['fond', 'titre', 'typo', 'texture'].every(k => x[k] === R[k])}">${x.nom}</button>`).join('')}</div>
    <label>Fond<select data-r="fond">${options(FONDS, R.fond)}</select></label>
    <label>Titre<select data-titres><option value="">Autre (écris-le dessous)</option>${TITRES.map(t => `<option${t === R.texte ? ' selected' : ''}>${esc(t)}</option>`).join('')}</select>
      <input type="text" data-r="texte" value="${esc(R.texte).replace(/"/g, '&quot;')}" maxlength="40" aria-label="Texte du titre"></label>
    <label>Place du titre<select data-r="titre">${options(PLACES, R.titre)}</select></label>
    <label>Typo du titre<select data-r="typo">${options(TYPOS, R.typo)}</select></label>
    <label>Matière des livres<select data-r="texture">${options(TEXTURES, R.texture)}</select></label>
    <div class="r-ligne"><input type="checkbox" id="r-incline"${R.incline === '1' ? ' checked' : ''}><label for="r-incline" style="margin:0">Le livre sorti suit la souris</label></div>
    <div class="r-ligne"><button type="button" data-copier>Copier les réglages</button><span data-ok></span></div>`;
}
if (chantier) {
  panneau.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if ('plier' in b.dataset) { panneau.classList.toggle('plie'); majPanneau(); }
    else if (b.dataset.version) { const x = { ...VERSIONS[+b.dataset.version] }; delete x.nom; Object.assign(R, x); appliquer(); }
    else if ('copier' in b.dataset) {
      const texte = `Réglages de l'accueil : fond=${R.fond} ; titre="${R.texte}" ; place=${R.titre} ; typo=${R.typo} ; matière=${R.texture} ; suit la souris=${R.incline === '1' ? 'oui' : 'non'}\n${location.href}`;
      navigator.clipboard?.writeText(texte).then(() => { panneau.querySelector('[data-ok]').textContent = 'Copié'; }, () => { prompt('Copie ce texte :', texte); });
    }
  });
  panneau.addEventListener('change', e => {
    const c = e.target;
    if (c.dataset.r) R[c.dataset.r] = c.value;
    else if ('titres' in c.dataset) { if (c.value) R.texte = c.value; }
    else if (c.id === 'r-incline') R.incline = c.checked ? '1' : '0';
    appliquer();
  });
}

/* ───────── Départ ───────── */
addEventListener('resize', () => { ranger(); page.querySelectorAll('.pg').forEach(ajusterNomPage); });
const depart = location.hash.slice(1).toUpperCase();
if (PAR_LETTRE.has(depart)) v = ARTISTES.findIndex(a => a.l === depart);
appliquer();
document.fonts?.load('900 200px "Sofia Cond"').then(ajusterNom);
if (PAR_LETTRE.has(depart)) ouvrir({ anime: false, histoire: false });
