// Socle du site « clavier » : clavier, routage par #adresse, ateliers.
import { monterTitre } from './titre.js';

const RANGEES = ['AZERTYUIOP', 'QSDFGHJKLM', 'WXCVBN'];
const $ = (s, r = document) => r.querySelector(s);
const artistes = new Map();      // lettre -> fiche (data/artistes.json)
const modules = new Map();       // lettre -> module chargé
let courant = null, demonter = null, styleArtiste = null;
const reduire = matchMedia('(prefers-reduced-motion: reduce)').matches;
const ouverts = () => [...artistes.values()].filter(a => a.statut === 'ouvert').sort((a, b) => a.lettre.localeCompare(b.lettre));

/* ---------- Annonces (petit message en bas) ---------- */
let minuterie;
export function annoncer(msg) {
  const el = $('#annonce'); el.textContent = msg; el.classList.add('visible');
  clearTimeout(minuterie); minuterie = setTimeout(() => el.classList.remove('visible'), 2600);
}

/* ---------- Clavier ---------- */
function construireClavier() {
  const clavier = $('#clavier'); clavier.innerHTML = '';
  for (const rangee of RANGEES) {
    const div = document.createElement('div'); div.className = 'rangee';
    for (const l of rangee) {
      const a = artistes.get(l), b = document.createElement('button');
      b.type = 'button'; b.className = 'touche'; b.dataset.lettre = l; b.dataset.statut = a ? a.statut : 'vide';
      b.setAttribute('aria-label', a ? `${l}, ${a.nom}, ${a.statut === 'ouvert' ? 'atelier ouvert' : 'atelier en préparation'}` : `${l}, pas encore de graphiste`);
      b.innerHTML = `<span class="t-lettre">${l}</span><span class="t-svg"></span><span class="t-nom">${a ? a.court : ''}</span>`;
      if (a?.couleurs) b.style.setProperty('--t-accent', a.couleurs.accent);
      b.addEventListener('click', () => appuyer(l));
      div.append(b);
    }
    clavier.append(div);
  }
  const liste = [...artistes.values()].sort((a, b) => a.lettre.localeCompare(b.lettre));
  $('#index').innerHTML = liste.map(a => `<li class="${a.statut}"><b>${a.lettre}</b><span>${a.nom}</span></li>`).join('');
  const n = ouverts().length, p = liste.length - n;
  $('#compteur').textContent = `${n} atelier${n > 1 ? 's' : ''} ouvert${n > 1 ? 's' : ''}, ${p} en préparation`;
}
const touche = l => $(`.touche[data-lettre="${l}"]`);

function appuyer(l) {
  const a = artistes.get(l), t = touche(l);
  if (t) { t.classList.add('enfoncee'); setTimeout(() => t.classList.remove('enfoncee'), 170); }
  if (!a) return annoncer(`${l} : pas encore de graphiste à cette lettre.`);
  if (a.statut !== 'ouvert') return annoncer(`${l} · ${a.nom} : atelier en préparation.`);
  if (courant === a) return;
  inonder(t, a.couleurs?.accent || '#111', () => { location.hash = a.id; });
}

/* ---------- Transition : la couleur de l'artiste part de la touche ---------- */
function inonder(depuis, couleur, puis) {
  const flot = $('#flot');
  if (reduire || !depuis || depuis.offsetParent === null) return puis();
  const r = depuis.getBoundingClientRect();
  flot.style.setProperty('--x', `${r.left + r.width / 2}px`); flot.style.setProperty('--y', `${r.top + r.height / 2}px`);
  flot.style.setProperty('--flot', couleur);
  flot.className = ''; void flot.offsetWidth; flot.className = 'plein';
  setTimeout(() => { puis(); flot.className = 'plein sort'; setTimeout(() => { flot.className = ''; }, 300); }, 430);
}

/* ---------- Modules artistes ---------- */
async function charger(a) {
  if (modules.has(a.lettre)) return modules.get(a.lettre);
  const m = (await import(`../${a.module}`)).default;
  modules.set(a.lettre, m);
  const t = touche(a.lettre); if (t && m.lettreSVG) $('.t-svg', t).innerHTML = m.lettreSVG;
  return m;
}

/* ---------- Atelier ---------- */
function fermerAtelier() {
  try { demonter?.(); } catch (e) { console.error(e); }
  demonter = null; styleArtiste?.remove(); styleArtiste = null; courant = null;
  $('#a-zone').innerHTML = '';
}
async function ouvrirAtelier(a) {
  fermerAtelier(); courant = a;
  const at = $('#atelier'), c = a.couleurs || {};
  at.dataset.artiste = a.lettre.toLowerCase();
  at.style.setProperty('--a-fond', c.fond || '#fff'); at.style.setProperty('--a-encre', c.encre || '#111'); at.style.setProperty('--a-accent', c.accent || '#e2001a');
  const liste = ouverts(), i = liste.indexOf(a);
  $('#a-position').textContent = `${a.lettre} · ${i + 1}/${liste.length}`;
  $('#precedent').disabled = $('#suivant').disabled = liste.length < 2;
  $('#a-statut').textContent = a.actuel ? 'Graphiste d’aujourd’hui' : '';
  $('#a-nom').textContent = a.nom; $('#a-dates').textContent = a.dates || '';
  $('#a-geste-titre').textContent = a.geste?.titre || ''; $('#a-consigne').textContent = a.geste?.consigne || '';
  $('#a-fiche').innerHTML = (a.fiche || []).map(b => `<section><p class="etiquette">${b.titre}</p>${b.texte ? `<p>${b.texte}</p>` : ''}${b.liste ? `<ul>${b.liste.map(x => `<li>${x}</li>`).join('')}</ul>` : ''}</section>`).join('');
  const im = a.image || {};
  $('#a-image').innerHTML = im.src
    ? `<img src="${im.src}" alt="${im.legende || ''}" loading="lazy"><figcaption>${im.legende || ''}</figcaption>`
    : (im.depot ? `<div class="vide">Emplacement de l’image forte.<br>À déposer : ${im.depot}</div>` : '');
  montrer('atelier'); scrollTo(0, 0);
  let m;
  try { m = await charger(a); } catch (e) { console.error(e); $('#a-zone').textContent = 'L’atelier ne se charge pas. Recharge la page.'; return; }
  if (courant !== a) return;
  $('#a-lettre').innerHTML = m.lettreSVG || '';
  if (m.css) { styleArtiste = document.createElement('style'); styleArtiste.textContent = m.css; document.head.append(styleArtiste); }
  demonter = m.monter?.($('#a-zone'), { artiste: a, couleurs: c, reduireMouvement: reduire, annoncer }) || null;
  $('#a-nom').focus({ preventScroll: true });
}
function voisin(pas) {
  const liste = ouverts(); if (liste.length < 2) return;
  const a = liste[(liste.indexOf(courant) + pas + liste.length) % liste.length];
  location.hash = a.id;
}

/* ---------- Routage : #k-kruger, #test, ou rien (le clavier) ---------- */
function montrer(vue) {
  for (const id of ['accueil', 'atelier', 'test']) $('#' + id).hidden = id !== vue;
}
function router() {
  const h = location.hash.slice(1);
  if (h === 'test') { fermerAtelier(); montrer('test'); import('./test.js'); return; }
  const a = [...artistes.values()].find(x => x.id === h && x.statut === 'ouvert');
  if (a) { if (a !== courant) ouvrirAtelier(a); return; }
  fermerAtelier(); montrer('accueil');
}

/* ---------- Clavier physique ---------- */
addEventListener('keydown', e => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const champ = e.target instanceof Element && e.target.closest('input,textarea,select,[contenteditable]');
  if (e.key === 'Escape') { if (champ) champ.blur(); else if ($('#accueil').hidden) location.hash = ''; return; }
  if (champ || !$('#test').hidden) return;
  if (courant && e.key === 'ArrowRight') return voisin(1);
  if (courant && e.key === 'ArrowLeft') return voisin(-1);
  if (/^[a-z]$/i.test(e.key)) { e.preventDefault(); appuyer(e.key.toUpperCase()); }
});
const majFocus = () => document.body.classList.toggle('sans-focus', !document.hasFocus());
addEventListener('focus', majFocus); addEventListener('blur', majFocus); majFocus();

/* ---------- Choix de la DA (phase d'essai) ---------- */
function choisirDA(da) {
  document.body.dataset.da = da;
  document.querySelectorAll('[data-da-choix]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.daChoix === da)));
  try { localStorage.setItem('25g-da', da); } catch (e) { /* mémoire indisponible : sans gravité */ }
}
document.querySelectorAll('[data-da-choix]').forEach(b => b.addEventListener('click', () => choisirDA(b.dataset.daChoix)));
try { const da = localStorage.getItem('25g-da'); if (['riso', 'valentine', 'specimen'].includes(da)) choisirDA(da); } catch (e) { /* idem */ }

$('#retour').addEventListener('click', () => { location.hash = ''; });
$('#precedent').addEventListener('click', () => voisin(-1));
$('#suivant').addEventListener('click', () => voisin(1));

/* ---------- Démarrage ---------- */
monterTitre($('#titre'));
construireClavier();
try {
  const data = await (await fetch('data/artistes.json')).json();
  for (const a of data.artistes) artistes.set(a.lettre, a);
} catch (e) { console.error(e); annoncer('Les données du site ne se chargent pas. Recharge la page.'); }
construireClavier();
addEventListener('hashchange', router); router();
ouverts().forEach(a => charger(a).catch(console.error));
