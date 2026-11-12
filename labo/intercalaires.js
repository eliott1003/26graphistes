// Labo : accueil « intercalaires ». 26 dossiers rangés par lettre.
// Une touche (ou un survol) : le dossier sort. La même touche encore (ou un clic) : il s'ouvre.
// Tout ce qui est réglable passe par le panneau « Réglages » et se retrouve dans l'adresse de la page.

import { ARTISTES, PAR_LETTRE, ecouterClavier, lienLabo } from './donnees.js';
import { carte, glyphe } from './lettres.js';
import { gabarit, monterGeste } from './page.js';

const $ = (s, r = document) => r.querySelector(s);
const DEMO = new Set(['A', 'B', 'C', 'G', 'K', 'L', 'S', 'W']); // « construits » pour la démonstration des lettres vides
const CHOIX = {
  peau: ['Peau', [['classeur', 'Classeur noir'], ['carton', 'Carton'], ['imprime', 'Imprimé'], ['aplat', 'Aplats'], ['blanc', 'Blanc']]],
  typo: ['Typo', [['affiche', 'Condensée, Caslon, mono'], ['grotesque', 'Tout en grotesque'], ['didone', 'Bodoni'], ['mecane', 'Mécane'], ['anton', 'Anton et Jost']]],
  agencement: ['Agencement', [['alphabet', 'Alphabet, 5 rangées'], ['azerty', 'Clavier AZERTY, 3 rangées'], ['pile', 'Pile, 26 bandes'], ['repertoire', 'Répertoire, 1 rangée']]],
  onglet: ['Sur l’onglet', [['nom', 'Lettre et nom'], ['lettre', 'Lettre seule']]],
  vides: ['Lettres sans atelier', [['tout', 'Les 26 en couleur'], ['vierges', 'En carton vierge (démo : 8 construits)'], ['absentes', 'Absentes (démo : 8 construits)']]],
  ouverture: ['Ouverture', [['tirer', 'Le dossier monte'], ['basculer', 'Le dossier bascule'], ['agrandir', 'L’onglet s’agrandit']]],
  titrage: ['Titre écrit en', [['lettres', 'Lettres d’artistes'], ['typo', 'Typo du site']]],
};
const R = { peau: 'classeur', typo: 'affiche', agencement: 'alphabet', onglet: 'nom', vides: 'tout', ouverture: 'tirer', titrage: 'lettres', titre: 'INDEX' };
const params = new URLSearchParams(location.search);
for (const k of Object.keys(R)) if (params.has(k)) R[k] = params.get(k);

const classeur = $('#classeur'), page = $('#page'), titre = $('#titre');
const reduit = matchMedia('(prefers-reduced-motion: reduce)').matches;
const D = new Map();           // lettre → élément .dossier
let choisi = null, origine = null, ouvert = null, demonter = null, retour = null;

const EPAULE = c => `<svg class="ep ${c}" viewBox="0 0 26 40" preserveAspectRatio="none" aria-hidden="true"><path d="M0 40C13 40 13 0 26 0V40Z"/></svg>`;
const onglet = (a, balise = 'button', classe = 'onglet', attrs = '') =>
  `<${balise} class="${classe}" ${attrs}>${EPAULE('g')}<span class="milieu"><span class="lt">${glyphe(a.l)}</span><span class="nm">${a.court}</span></span>${EPAULE('d')}</${balise}>`;
const vide = l => R.vides === 'vierges' && !DEMO.has(l);
const presents = () => R.vides === 'absentes' ? ARTISTES.filter(a => DEMO.has(a.l)) : ARTISTES;

let minuterie;
function annoncer(t) { const a = $('#annonce'); a.textContent = t; a.classList.add('vu'); clearTimeout(minuterie); minuterie = setTimeout(() => a.classList.remove('vu'), 2200); }

/* ---------- Titre ---------- */
function ecrireTitre() {
  const mot = (R.titre || 'INDEX').toUpperCase();
  titre.className = R.titrage;
  if (R.titrage === 'typo' || ![...mot].some(ch => PAR_LETTRE.has(ch))) {
    titre.className = 'typo'; titre.textContent = R.titre; titre.style.fontSize = '100px';
    const l = titre.scrollWidth || 1, dispo = Math.min(innerWidth * .92, 1180);
    titre.style.fontSize = Math.max(48, Math.min(236, 100 * dispo / l)) + 'px'; return;
  }
  titre.style.fontSize = '';
  titre.setAttribute('aria-label', mot);
  titre.innerHTML = [...mot].map(ch => {
    const a = PAR_LETTRE.get(ch);
    if (!a) return ch === ' ' ? `<span class="tl" style="flex-basis:36px"></span>` : `<span class="tl signe">${ch}</span>`;
    return `<button class="tl" data-l="${ch}" aria-label="${ch}, ${a.nom}">${carte(ch)}<small>${a.court}</small></button>`;
  }).join('');
}
titre.addEventListener('click', e => { const b = e.target.closest('.tl[data-l]'); if (b) ouvrir(b.dataset.l); });

/* ---------- Construction et disposition ---------- */
function construire() {
  choisi = null; D.clear();
  classeur.innerHTML = presents().map(a => `
    <div class="dossier${vide(a.l) ? ' vide' : ''}" data-l="${a.l}" style="--c:${a.fond};--e:${a.encre}">
      ${onglet(a, 'button', 'onglet', `aria-label="${a.l}, ${vide(a.l) ? 'dossier vide' : a.nom}"`)}
      <div class="corps"><div class="info">
        <div class="i-carte">${vide(a.l) ? '' : carte(a.l)}</div>
        <span class="i-nom">${a.nom}</span><span class="i-meta">${a.dates}, ${a.courant}</span>
        <span class="i-qui">${a.qui}</span><span class="i-geste">${a.geste}</span>
        <span class="i-ouvrir">Entrée, ou la même lettre, pour ouvrir le dossier.</span>
      </div></div>
    </div>`).join('') +
    `<p class="pied">26 graphistes rangés par lettre, de Philippe Apeloig à Rolf Rappaz. Dans chaque dossier, un geste à refaire : à la souris, au clavier ou devant la caméra.</p>`;
  classeur.querySelectorAll('.dossier').forEach(d => D.set(d.dataset.l, d));
  disposer();
}
function rangees(etroit) {
  const ici = new Set(presents().map(a => a.l));
  let r;
  const mode = R.agencement === 'repertoire' && etroit ? 'azerty' : R.agencement;
  if (mode === 'azerty') r = ['AZERTYUIOP', 'QSDFGHJKLM', 'WXCVBN'].map(s => [...s]);
  else if (mode === 'pile') r = ARTISTES.map(a => [a.l]);
  else if (mode === 'repertoire') r = [ARTISTES.map(a => a.l)];
  else r = ['ABCDE', 'FGHIJ', 'KLMNO', 'PQRST', 'UVWXYZ'].map(s => [...s]);
  return [mode, r.map(x => x.filter(l => ici.has(l))).filter(x => x.length)];
}
function disposer() {
  const L = classeur.clientWidth; if (!L) return;
  const etroit = L < 700, [mode, rs] = rangees(etroit);
  const cs = getComputedStyle(classeur), HT = parseFloat(cs.getPropertyValue('--ht')), PAS = parseFloat(cs.getPropertyValue('--pas'));
  classeur.querySelectorAll('.rangee-nom').forEach(e => e.remove());
  const bord = etroit ? 8 : 22;
  let fixe = mode === 'azerty' || mode === 'repertoire' || (mode === 'alphabet' && (etroit || R.onglet === 'lettre'));
  classeur.classList.toggle('fixe', fixe); classeur.classList.toggle('etroit', etroit);
  const poser = () => rs.forEach((rg, r) => {
    let x = bord; const n = rg.length;
    rg.forEach((l, i) => {
      const d = D.get(l), o = d.firstElementChild;
      d.style.top = (mode === 'repertoire' ? 0 : r * PAS) + 'px'; d.dataset.r = r; d.classList.toggle('rp', r % 2 === 1); d.style.setProperty('--rang', rs.length - r);
      d.dataset.z = d.style.zIndex = r * 40 + (n - i);
      o.style.width = '';
      if (mode === 'azerty') { const pas = (L - 2 * bord) / 10.6, w = pas - (etroit ? 2 : 8); o.style.width = w + 'px'; o.style.left = bord + [0, .3, 1.05][r] * pas + i * pas + 'px'; }
      else if (mode === 'repertoire') { const pas = (L - 2 * bord) / 26; o.style.width = pas * 1.22 + 'px'; o.style.left = bord + i * pas - pas * .11 + 'px'; d.dataset.z = d.style.zIndex = 1 + i; }
      else if (mode === 'pile') { const cr = etroit ? 4 : 6, pas = (L * (etroit ? .5 : .6)) / cr; o.style.left = bord + (i + r) % cr * pas + 'px'; }
      else if (fixe) { const pas = (L - 2 * bord) / n; o.style.width = pas - 4 + 'px'; o.style.left = bord + i * pas + 'px'; }
      else { o.style.left = x + 'px'; x += o.offsetWidth + (n > 5 ? 4 : 12); }
    });
    if (mode === 'alphabet' && !fixe && x > L - 70) fixe = 'trop';
  });
  poser();
  if (fixe === 'trop') { fixe = true; classeur.classList.add('fixe'); poser(); }
  if (mode === 'alphabet') rs.forEach((rg, r) => {
    const e = document.createElement('span'); e.className = 'rangee-nom'; e.dataset.r = r;
    e.textContent = `${rg[0]} à ${rg[rg.length - 1]}`; e.style.top = r * PAS + HT + 'px'; e.style.zIndex = r * 40 + 39;
    classeur.append(e);
  });
  const bas = mode === 'pile' ? 96 : mode === 'repertoire' ? HT + (etroit ? 330 : 360) : etroit ? 190 : 170;
  classeur.style.height = (mode === 'repertoire' ? 0 : rs.length * PAS) + bas + 'px';
  $('.pied').hidden = mode === 'repertoire';
  if (mode === 'repertoire' && !choisi && !etroit) apercu(rs[0][0], 'clavier'); else encres();
}
/* Les textes posés sur une bande prennent l'encre du dossier qui est devant. */
function encres() {
  const devant = {};
  D.forEach(d => { const r = d.dataset.r, z = +d.style.zIndex; if (!devant[r] || z > devant[r].z) devant[r] = { z, d }; });
  const der = Math.max(...Object.keys(devant).map(Number));
  classeur.querySelectorAll('.rangee-nom').forEach(e => {
    e.style.color = getComputedStyle(devant[e.dataset.r].d).color;
    e.style.visibility = choisi && D.get(choisi).dataset.r === e.dataset.r ? 'hidden' : '';
  });
  if (devant[der]) $('.pied').style.color = getComputedStyle(devant[der].d).color;
}

/* ---------- Aperçu : le dossier sort ---------- */
function effacer() {
  if (!choisi) return;
  const d = D.get(choisi); if (d) { d.classList.remove('apercu'); d.style.zIndex = d.dataset.z; }
  choisi = null; origine = null;
  document.body.style.removeProperty('--actif'); document.body.style.removeProperty('--actif-encre');
  encres();
}
function apercu(l, par = 'clavier') {
  const d = D.get(l); if (!d) return;
  if (vide(l)) {
    effacer(); d.classList.remove('secoue'); void d.offsetWidth; d.classList.add('secoue');
    if (par !== 'souris') annoncer(`${l} : ce dossier est encore vide.`);
    return;
  }
  if (choisi === l) { origine = par === 'souris' ? origine : par; return; }
  effacer(); choisi = l; origine = par;
  d.classList.add('apercu'); d.style.zIndex = +d.dataset.r * 40 + 39 + (R.agencement === 'repertoire' ? 100 : 0);
  const a = PAR_LETTRE.get(l);
  document.body.style.setProperty('--actif', a.fond); document.body.style.setProperty('--actif-encre', a.encre);
  encres();
}
classeur.addEventListener('pointerover', e => { const o = e.target.closest('.onglet'); if (o && e.pointerType === 'mouse') apercu(o.parentElement.dataset.l, 'souris'); });
classeur.addEventListener('pointerout', e => {
  const o = e.target.closest('.onglet'); if (!o || e.pointerType !== 'mouse' || o.contains(e.relatedTarget)) return;
  if (origine === 'souris' && choisi === o.parentElement.dataset.l && R.agencement !== 'repertoire') effacer();
});
let dernierPointeur = 'mouse';
classeur.addEventListener('pointerdown', e => { dernierPointeur = e.pointerType; });
classeur.addEventListener('click', e => {
  const o = e.target.closest('.onglet'); if (!o) return;
  const l = o.parentElement.dataset.l;
  if (dernierPointeur === 'mouse' || (choisi === l && origine !== 'souris')) ouvrir(l); else apercu(l, 'doigt');
});

/* ---------- Ouverture ---------- */
function remplir(a) {
  const ordre = presents().filter(x => !vide(x.l)), i = ordre.indexOf(a);
  const avant = ordre[(i - 1 + ordre.length) % ordre.length], apres = ordre[(i + 1) % ordre.length];
  const voisin = v => onglet(v, 'button', 'p-voisin', `data-l="${v.l}" style="--c:${v.fond};--e:${v.encre}" aria-label="Dossier ${v.l}, ${v.nom}"`);
  page.style.setProperty('--c', a.fond); page.style.setProperty('--e', a.encre);
  page.innerHTML = `
    <div class="p-rang">
      ${onglet(a, 'div', 'p-onglet')}
      ${ordre.length > 2 ? voisin(avant) + voisin(apres) : ''}
      <button class="p-fermer" type="button">Fermer</button>
    </div>
    <div class="p-corps">${gabarit(a)}</div>`;
}
async function ouvrir(l, { anime = true } = {}) {
  const a = PAR_LETTRE.get(l), d = D.get(l);
  if (!a || !d) return;
  if (vide(l)) { apercu(l); return; }
  try { demonter?.(); } catch (e) { console.error(e); } demonter = null;
  const deja = ouvert; ouvert = l;
  if (!deja) apercu(l, 'clavier');
  const ro = d.firstElementChild.getBoundingClientRect();
  remplir(a);
  page.hidden = false; document.body.classList.add('page-ouverte');
  history.replaceState(null, '', location.pathname + location.search + '#' + l.toLowerCase());
  if (!deja) {
    classeur.classList.add('tombe'); D.forEach(x => x.classList.toggle('part', x === d));
    const po = $('.p-onglet', page).getBoundingClientRect(), dy = ro.top - po.top, dx = ro.left - po.left;
    retour = { dy, dx };
    if (anime && !reduit) {
      const doux = 'cubic-bezier(.2,.9,.25,1)';
      if (R.ouverture === 'agrandir') {
        page.animate([{ clipPath: `inset(${ro.top}px ${innerWidth - ro.right}px ${innerHeight - ro.bottom}px ${ro.left}px round 10px)` }, { clipPath: 'inset(0 0 0 0 round 0px)' }], { duration: 640, easing: 'cubic-bezier(.76,0,.18,1)' });
      } else if (R.ouverture === 'basculer') {
        page.animate([{ transform: 'translate(7vw,104vh) rotate(-15deg)' }, { transform: 'none' }], { duration: 860, delay: 180, fill: 'backwards', easing: 'cubic-bezier(.2,.85,.3,1.04)' });
      } else {
        page.animate([{ transform: `translateY(${dy}px)` }, { transform: 'none' }], { duration: 640, easing: doux });
        $('.p-onglet', page).animate([{ transform: `translateX(${dx}px)` }, { transform: 'none' }], { duration: 640, easing: doux });
      }
    }
  } else if (!reduit) {
    $('.p-corps', page).animate([{ transform: 'translateY(46px)' }, { transform: 'none' }], { duration: 300, easing: 'cubic-bezier(.2,.9,.25,1)' });
  }
  demonter = await monterGeste(page, a);
  if (ouvert === l) $('h2', page)?.focus({ preventScroll: true });
}
async function fermer() {
  if (!ouvert) return;
  const l = ouvert; ouvert = null;
  try { demonter?.(); } catch (e) { console.error(e); } demonter = null;
  if (params.has('retour') && history.length > 1) { history.back(); return; } // on venait d'un autre accueil du labo
  history.replaceState(null, '', location.pathname + location.search);
  classeur.classList.remove('tombe'); document.body.classList.remove('page-ouverte');
  if (!reduit && retour) {
    const fin = R.ouverture === 'basculer' ? 'translate(7vw,104vh) rotate(-15deg)' : `translateY(${Math.max(retour.dy, innerHeight * .5)}px)`;
    await page.animate([{ transform: 'none' }, { transform: fin }], { duration: 380, easing: 'cubic-bezier(.6,0,.9,.4)' }).finished.catch(() => {});
  }
  page.hidden = true; page.innerHTML = '';
  D.forEach(x => x.classList.remove('part'));
  effacer(); apercu(l, 'clavier');
  D.get(l)?.firstElementChild.focus({ preventScroll: true });
}
page.addEventListener('click', e => {
  if (e.target.closest('.p-fermer')) return fermer();
  const v = e.target.closest('.p-voisin'); if (v) ouvrir(v.dataset.l);
});

/* ---------- Clavier ---------- */
ecouterClavier({
  lettre(l) {
    if (!D.has(l)) { annoncer(`${l} : pas de dossier.`); return; }
    if (ouvert) { if (l !== ouvert) ouvrir(l); return; }
    if (choisi === l && origine !== 'souris') ouvrir(l); else { origine = null; apercu(l, 'clavier'); if (choisi === l) origine = 'clavier'; }
  },
  fleche(pas) {
    const ordre = presents().filter(a => !vide(a.l)).map(a => a.l);
    const i = ordre.indexOf(ouvert || choisi), suivant = ordre[(i + pas + ordre.length) % ordre.length] ?? ordre[0];
    if (ouvert) ouvrir(suivant); else { apercu(suivant, 'clavier'); origine = 'clavier'; }
  },
  entree() { if (!ouvert && choisi) ouvrir(choisi); },
  echap() { if (ouvert) fermer(); else effacer(); },
});

/* ---------- Réglages ---------- */
function appliquer(reconstruire = true) {
  for (const k of Object.keys(CHOIX)) document.body.dataset[k] = R[k];
  const q = new URLSearchParams(R); history.replaceState(null, '', location.pathname + '?' + q + location.hash);
  ecrireTitre();
  if (reconstruire) construire(); else disposer();
}
function panneau() {
  const p = $('#reglages');
  p.innerHTML = `<h2>Réglages</h2>` +
    Object.entries(CHOIX).map(([k, [nom, opts]]) => `<label>${nom}<select data-k="${k}">${opts.map(([v, t]) => `<option value="${v}"${R[k] === v ? ' selected' : ''}>${t}</option>`).join('')}</select></label>`).join('') +
    `<label>Titre<input type="text" data-k="titre" value="${R.titre.replace(/"/g, '&quot;')}" maxlength="24" autocomplete="off" spellcheck="false"></label>
     <div class="r-boutons"><button type="button" id="copier">Copier les réglages</button><button type="button" class="clair" id="fermer-reglages">Fermer</button></div>
     <p>Ce panneau n’existe que pour toi. Les réglages choisis seront figés dans le site.</p>`;
  p.addEventListener('input', e => { const k = e.target.dataset.k; if (!k) return; R[k] = e.target.value; if (ouvert) fermer(); appliquer(); });
  $('#copier').addEventListener('click', async () => {
    const t = JSON.stringify(R);
    try { await navigator.clipboard.writeText(t); annoncer('Réglages copiés.'); } catch { prompt('Copie ce texte :', t); }
  });
  $('#fermer-reglages').addEventListener('click', () => { p.hidden = true; });
  $('#ouvrir-reglages').addEventListener('click', () => { p.hidden = !p.hidden; });
  if (params.has('panneau')) p.hidden = false;
}

/* ---------- Démarrage ---------- */
panneau(); appliquer(); lienLabo();
let attente; addEventListener('resize', () => { clearTimeout(attente); attente = setTimeout(disposer, 120); });
document.fonts?.ready.then(disposer);
const h = location.hash.slice(1).toUpperCase();
if (PAR_LETTRE.has(h) && D.has(h) && !vide(h)) ouvrir(h, { anime: false });
