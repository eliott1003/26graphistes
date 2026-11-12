// Labo : le gabarit unique d'une page d'artiste. Le même pour les 26 ; seul le geste change.
// gabarit(a)        → le HTML de la feuille
// monterGeste(z, a) → installe l'atelier dans la zone (ou l'attente s'il n'est pas construit) et renvoie de quoi le démonter

import { carte } from './lettres.js';

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

export function gabarit(a) {
  return `<article class="feuille" data-l="${a.l}">
    <header class="f-tete">
      <div class="f-lettre">${carte(a.l)}</div>
      <div>
        <h2 tabindex="-1">${esc(a.nom)}</h2>
        <p class="f-meta">${esc(a.dates)}, ${esc(a.pays)}. ${esc(a.courant[0].toUpperCase() + a.courant.slice(1))}.</p>
        <p class="f-qui">${esc(a.qui)}</p>
      </div>
    </header>
    <section class="f-geste" aria-label="Le geste">
      <h3>${esc(a.geste)}</h3>
      <div class="f-zone"></div>
      <div class="f-outils" hidden><button type="button" class="bouton" data-enregistrer>Enregistrer l’image</button></div>
    </section>
    <section class="f-oeuvres">
      <h3>À voir</h3>
      <div class="f-cadres">
        <figure><div class="cadre">Image à déposer<br>img/${a.l.toLowerCase()}/01.jpg</div><figcaption>${esc(a.oeuvre)}</figcaption></figure>
        <figure><div class="cadre">Image à déposer<br>img/${a.l.toLowerCase()}/02.jpg</div><figcaption>Deuxième œuvre, à choisir</figcaption></figure>
        <figure><div class="cadre">Image à déposer<br>img/${a.l.toLowerCase()}/03.jpg</div><figcaption>Troisième œuvre, à choisir</figcaption></figure>
      </div>
    </section>
  </article>`;
}

export async function monterGeste(racine, a) {
  const zone = racine.querySelector('.f-zone'); let demonter = null, style = null;
  if (a.module) {
    try {
      const m = (await import(a.module)).default;
      if (m.css) { style = document.createElement('style'); style.textContent = m.css; document.head.append(style); }
      demonter = m.monter?.(zone, { artiste: a, couleurs: { fond: a.fond, encre: a.encre, accent: a.accent }, reduireMouvement: matchMedia('(prefers-reduced-motion: reduce)').matches, annoncer: () => {} }) || null;
    } catch (e) { console.error(e); zone.innerHTML = `<div class="f-attente"><p>L’atelier ne se charge pas. Recharge la page.</p></div>`; }
  } else {
    zone.innerHTML = `<div class="f-attente"><p>Atelier pas encore construit.</p><p class="petit">Le geste prévu : ${esc(a.geste)}</p><p class="petit">Œuvre de départ : ${esc(a.oeuvre)}</p></div>`;
  }
  // « Enregistrer l'image » : proposé dès que l'atelier produit une image (un <canvas> ou une <img>).
  const outils = racine.querySelector('.f-outils'), cible = zone.querySelector('canvas, img');
  if (outils && cible) {
    outils.hidden = false;
    outils.querySelector('[data-enregistrer]').onclick = async () => {
      const im = zone.querySelector('canvas, img'); if (!im) return;
      const blob = im instanceof HTMLCanvasElement ? await new Promise(r => im.toBlob(r, 'image/png')) : await (await fetch(im.src)).blob();
      const l = document.createElement('a'); l.href = URL.createObjectURL(blob); l.download = `${a.id}.${blob.type.includes('png') ? 'png' : 'jpg'}`;
      document.body.append(l); l.click(); l.remove(); setTimeout(() => URL.revokeObjectURL(l.href), 4000);
    };
  }
  return () => { try { demonter?.(); } catch (e) { console.error(e); } style?.remove(); zone.innerHTML = ''; };
}
