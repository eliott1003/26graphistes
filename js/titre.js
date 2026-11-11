// Le titre du site, écrit avec une lettre par artiste.
// Pour changer de titre : modifier la liste TITRE (une entrée par lettre).
// Chaque dessin tient dans un viewBox 0 0 100 120 et n'utilise que
// var(--t1), var(--t2) (les deux encres) et var(--tp) (le papier).
// La classe "enc" marque les formes qui se surimpriment en DA riso.

const txt = (l, police, taille, y, extra = '') =>
  `<text x="50" y="${y}" text-anchor="middle" font-family="${police}" font-size="${taille}" ${extra}>${l}</text>`;

const f = v => `style="fill:var(--${v})"`;
const DESSINS = {
  // Kruger : oblique blanche sur bandeau rouge
  kruger: l => `<rect class="enc" x="0" y="16" width="100" height="92" ${f('t1')}/>` +
    txt(l, "Jost,Futura,sans-serif", 108, 100, `font-style="italic" font-weight="900" ${f('tp')}`),
  // Carlu : géométrie Art déco, la lettre coupée en deux tons
  carlu: (l, i) => `<clipPath id="tg${i}"><rect x="0" y="0" width="50" height="120"/></clipPath><clipPath id="td${i}"><rect x="50" y="0" width="50" height="120"/></clipPath>` +
    `<g clip-path="url(#tg${i})">` + txt(l, "Archivo,sans-serif", 124, 106, `font-weight="800" class="enc" ${f('t2')}`) + `</g>` +
    `<g clip-path="url(#td${i})">` + txt(l, "Archivo,sans-serif", 124, 106, `font-weight="800" class="enc" ${f('t1')}`) + `</g>`,
  // Bass : papier découpé aux ciseaux, bords irréguliers
  bass: l => `<g filter="url(#ciseaux)" transform="rotate(-5 50 62)">` +
    `<rect class="enc" x="4" y="14" width="92" height="98" ${f('t1')}/>` +
    txt(l, "'Bowlby One',Impact,sans-serif", 96, 98, `class="enc" ${f('t2')}`) + `</g>`,
  // Cassandre : pleins et hachures, la lettre à demi dessinée
  cassandre: (l, i) => `<pattern id="th${i}" width="6" height="6.4" patternUnits="userSpaceOnUse"><rect width="6" height="2.6" ${f('t1')}/></pattern>` +
    `<clipPath id="tc${i}"><rect x="0" y="0" width="46" height="120"/></clipPath>` +
    txt(l, "Archivo,sans-serif", 124, 106, `font-weight="800" fill="url(#th${i})"`) +
    `<g clip-path="url(#tc${i})">` + txt(l, "Archivo,sans-serif", 124, 106, `font-weight="800" class="enc" ${f('t2')}`) + `</g>`,
  // Favre : aplats francs et ombre portée dure
  favre: l => `<g transform="translate(7 7)">` + txt(l, "Archivo,sans-serif", 118, 98, `font-weight="800" class="enc" ${f('t2')}`) + `</g>` +
    txt(l, "Archivo,sans-serif", 118, 98, `font-weight="800" class="enc" ${f('t1')}`),
  // Scher : grotesque étroite, très haute, serrée
  scher: l => `<g transform="translate(50 108) scale(1.28 1)">` +
    `<text x="0" y="0" text-anchor="middle" font-family="Anton,Impact,sans-serif" font-size="126" class="enc" ${f('t2')}>${l}</text></g>` +
    `<rect class="enc" x="0" y="100" width="100" height="8" ${f('t1')}/>`,
  // Rand : le jeu, une égyptienne qui penche et un point
  rand: l => `<g transform="rotate(9 50 62)">` + txt(l, "'Alfa Slab One',Rockwell,serif", 112, 102, `class="enc" ${f('t1')}`) + `</g>` +
    `<circle class="enc" cx="82" cy="24" r="11" ${f('t2')}/>`,
};

// Titre de travail (Proposition, pas encore validé par Eliott).
export const TITRE = [
  { l: 'A', artiste: 'Cassandre', dessin: 'cassandre' },
  { l: 'Z', artiste: 'Favre', dessin: 'favre' },
  { l: 'E', artiste: 'Scher', dessin: 'scher' },
  { l: 'R', artiste: 'Carlu', dessin: 'carlu' },
  { l: 'T', artiste: 'Kruger', dessin: 'kruger' },
  { l: 'Y', artiste: 'Bass', dessin: 'bass' },
];

export function monterTitre(h1) {
  h1.setAttribute('aria-label', TITRE.map(t => t.l).join(''));
  h1.innerHTML = TITRE.map((t, i) =>
    `<span class="tl" aria-hidden="true"><svg viewBox="0 0 100 120">${DESSINS[t.dessin](t.l, i)}</svg><small>${t.artiste}</small></span>`).join('');
}
