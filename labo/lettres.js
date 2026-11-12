// Labo : les 26 lettres v1, une par artiste, dessinées dans son langage.
// PROVISOIRES : Eliott redessinera celles qu'il veut (SVG 1000 × 1000) et son fichier remplacera le dessin ici.
// carte(l)  → un carré SVG (viewBox 0 0 100 100) avec le fond de l'artiste.
// glyphe(l) → la lettre seule, petite, pour un onglet (elle prend la couleur du texte autour).

import { PAR_LETTRE } from './donnees.js';

let n = 0;
const t = (ch, police, taille, x, y, extra = '') =>
  `<text x="${x}" y="${y}" text-anchor="middle" font-family="${police}" font-size="${taille}" ${extra}>${ch}</text>`;
const ARCHIVO = "Archivo,Helvetica,Arial,sans-serif";

const DESSINS = {
  // Frutiger : jaune signalétique sur bleu nuit, avec la flèche
  A: (a) => t('A', "'Source Sans',Frutiger,sans-serif", 96, 38, 86, `font-weight="700" fill="${a.encre}"`) +
    `<path d="M62 46 L86 22 M68 22 H86 V40" fill="none" stroke="${a.encre}" stroke-width="7.5" stroke-linecap="square"/>`,
  // Bass : papier noir découpé aux ciseaux, la lettre en réserve
  B: (a) => `<polygon points="9,13 88,5 95,86 15,96" fill="#111"/><g transform="rotate(-5 50 50)">${t('B', "Londrina,Impact,sans-serif", 92, 51, 83, `fill="${a.fond}"`)}</g>`,
  // Cassandre : moitié pleine, moitié hachurée, comme le Bifur
  C: (a, u) => `<pattern id="${u}h" width="6" height="5" patternUnits="userSpaceOnUse"><rect width="6" height="1.9" fill="${a.accent}"/></pattern><clipPath id="${u}c"><rect x="0" y="0" width="47" height="100"/></clipPath>` +
    t('C', ARCHIVO, 112, 50, 90, `font-weight="800" fill="url(#${u}h)"`) + `<g clip-path="url(#${u}c)">${t('C', ARCHIVO, 112, 50, 90, `font-weight="800" fill="${a.encre}"`)}</g>`,
  // Carson : deux lettres qui se chevauchent, l'une coupée par le bord
  D: (a) => `<g transform="rotate(11 50 50)">${t('D', "Bodoni,Didot,serif", 128, 60, 96, `font-weight="900" fill="${a.accent}"`)}</g>` +
    t('D', "'Special Elite',Courier,monospace", 92, 34, 78, `fill="${a.encre}"`) + `<rect x="-4" y="54" width="108" height="2.2" fill="${a.encre}" transform="rotate(-7 50 55)"/>`,
  // Kauffer : la lettre et des oiseaux taillés comme des éclats (vorticisme)
  E: (a) => t('E', ARCHIVO, 104, 40, 88, `font-weight="800" fill="${a.encre}"`) +
    [[72, 22, -18], [84, 40, -8], [66, 52, -24], [86, 64, -12]].map(([x, y, r]) => `<g transform="translate(${x} ${y}) rotate(${r})"><path d="M-11 2 L0 -5 L4 -1 L13 -6 L6 3 L-2 1 Z" fill="${a.accent}"/></g>`).join(''),
  // Favre : pleins et vides, une lettre en aplats
  F: (a) => `<circle cx="66" cy="66" r="30" fill="${a.encre}"/>` + t('F', "Bodoni,Didot,serif", 108, 44, 88, `font-weight="900" fill="${a.accent}"`),
  // Grignani : la lettre n'existe que parce que les rayures changent de sens
  G: (a, u) => `<pattern id="${u}v" width="5" height="5" patternUnits="userSpaceOnUse"><rect width="2.5" height="5" fill="#fff"/></pattern><pattern id="${u}o" width="5" height="5" patternUnits="userSpaceOnUse"><rect width="5" height="2.5" fill="#fff"/></pattern>` +
    `<rect width="100" height="100" fill="url(#${u}v)"/>` + t('G', ARCHIVO, 112, 50, 90, `font-weight="800" fill="#0c0c0c"`) + t('G', ARCHIVO, 112, 50, 90, `font-weight="800" fill="url(#${u}o)"`),
  // Bayer : pas de majuscule, et les trois formes du Bauhaus
  H: (a) => t('h', "Jost,Futura,sans-serif", 104, 50, 80, `font-weight="500" fill="${a.encre}"`) + `<circle cx="16" cy="84" r="7.5" fill="${a.accent}"/><rect x="77" y="76.5" width="15" height="15" fill="#1f4fa3"/><path d="M80 8 L92 26 H68 Z" fill="#f2c12e"/>`,
  // Girard : un soleil pour point sur le i
  I: (a) => Array.from({ length: 14 }, (_, i) => `<rect x="48.4" y="4" width="3.2" height="11" fill="${a.accent}" transform="rotate(${i * 360 / 14} 50 27)"/>`).join('') +
    `<circle cx="50" cy="27" r="10.5" fill="${a.accent}"/>` + t('I', "'Alfa Slab',Rockwell,serif", 58, 50, 93, `fill="${a.encre}"`),
  // Experimental Jetset : une grotesque noire, trop grande pour son cadre
  J: (a) => t('J', ARCHIVO, 150, 46, 108, `font-weight="800" fill="${a.encre}"`) + `<rect x="0" y="92" width="100" height="8" fill="${a.accent}"/>`,
  // Kruger : blanc oblique sur bandeau rouge, photo tramée derrière
  K: (a, u) => `<pattern id="${u}t" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="4" fill="#1b1b1b"/><circle cx="2" cy="2" r="1.1" fill="#8c8c8c"/></pattern><rect width="100" height="100" fill="url(#${u}t)"/><rect y="17" width="100" height="66" fill="${a.fond}"/>` +
    t('K', "Jost,Futura,sans-serif", 84, 49, 80, 'font-style="italic" font-weight="900" fill="#fff"'),
  // Leupin : la lettre pend à son fil, comme la pancarte
  L: (a) => `<path d="M50 0 V24" stroke="${a.encre}" stroke-width="1.6"/><circle cx="50" cy="24" r="2.4" fill="${a.encre}"/><g transform="rotate(-8 50 24)"><rect x="22" y="26" width="56" height="64" rx="5" fill="${a.accent}"/>` + t('L', "Londrina,Impact,sans-serif", 70, 50, 82, `fill="${a.fond}"`) + `</g>`,
  // Bierut : la lettre en seize carreaux, trois ont changé de place
  M: (a, u) => { const src = [0, 1, 2, 3, 4, 5, 6, 11, 8, 9, 10, 15, 12, 13, 14, 7], c = 22, g = 1.8, o = 3.3; let s = `<defs><g id="${u}m">${t('M', "'Alfa Slab',Rockwell,serif", 84, 50, 80)}</g></defs>`;
    for (let i = 0; i < 16; i++) { const dx = o + (i % 4) * (c + g), dy = o + Math.floor(i / 4) * (c + g), sx = o + (src[i] % 4) * (c + g), sy = o + Math.floor(src[i] / 4) * (c + g);
      s += `<clipPath id="${u}k${i}"><rect x="${dx}" y="${dy}" width="${c}" height="${c}"/></clipPath><g clip-path="url(#${u}k${i})"><rect x="${dx}" y="${dy}" width="${c}" height="${c}" fill="${a.encre}"/><use href="#${u}m" fill="${a.fond}" transform="translate(${dx - sx} ${dy - sy})"/></g>`; }
    return s; },
  // Neurath : une lettre, et des pictogrammes qui se comptent
  N: (a) => t('N', "Jost,Futura,sans-serif", 76, 50, 62, `font-weight="700" fill="${a.encre}"`) +
    Array.from({ length: 6 }, (_, i) => `<g transform="translate(${13 + i * 13.6} 70)" fill="${i < 4 ? a.encre : a.accent}"><circle cx="4" cy="3.4" r="3.4"/><path d="M0 9 H8 V19 H5.6 V26 H2.4 V19 H0 Z"/></g>`).join(''),
  // Aicher : un cercle sur la grille à 45° et 90°
  O: (a) => `<g stroke="#fff" stroke-width=".7" opacity=".7">${[20, 50, 80].map(v => `<path d="M${v} 0 V100 M0 ${v} H100"/>`).join('')}<path d="M-10 -10 L110 110 M110 -10 L-10 110 M-10 50 L50 110 M50 -10 L110 50 M50 -10 L-10 50 M110 50 L50 110"/></g><circle cx="50" cy="50" r="29" fill="none" stroke="${a.encre}" stroke-width="13"/>`,
  // Perrottet : deux encres en surimpression sur la troisième
  P: (a) => `<g style="mix-blend-mode:multiply">${t('P', ARCHIVO, 112, 46, 91, 'font-weight="800" fill="#ec008c"')}</g><g style="mix-blend-mode:multiply">${t('P', ARCHIVO, 112, 56, 86, 'font-weight="800" fill="#fff200"')}</g>`,
  // Casey : une grotesque nette et un seul signe de couleur
  Q: (a) => t('Q', ARCHIVO, 104, 50, 84, `font-weight="600" fill="${a.encre}"`) + `<circle cx="50" cy="47" r="11" fill="${a.accent}"/>`,
  // Rand : la mécane rayée d'IBM
  R: (a) => t('R', "'Alfa Slab',Rockwell,serif", 96, 50, 85, `fill="${a.encre}"`) + Array.from({ length: 7 }, (_, i) => `<rect x="0" y="${24.5 + i * 9.4}" width="100" height="3.6" fill="${a.fond}"/>`).join(''),
  // Scher : un caractère d'affiche serré, qui penche et sort du cadre
  S: (a) => `<g transform="rotate(-7 50 50)">${t('S', "Anton,Impact,sans-serif", 132, 46, 104, `fill="${a.encre}"`)}</g><rect x="72" y="0" width="28" height="100" fill="${a.accent}"/><g transform="rotate(90 86 50)">${t('SSSSSS', "Anton,Impact,sans-serif", 22, 86, 58, `fill="${a.fond}"`)}</g>`,
  // Tanaka : la lettre en aplats, comme un visage réduit à quelques formes
  T: (a) => `<rect x="10" y="14" width="27" height="24" fill="${a.accent}"/><rect x="37" y="14" width="26" height="24" fill="#f4ead6"/><rect x="63" y="14" width="27" height="24" fill="#2bb673"/><rect x="37" y="38" width="26" height="50" fill="#111"/><path d="M37 56 a13 13 0 0 0 26 0 Z" fill="#f4ead6"/><circle cx="50" cy="26" r="5" fill="#111"/>`,
  // Baur : une lettre pleine et son double au trait, comme deux langues superposées
  U: (a) => t('U', "'Sofia Cond',Impact,sans-serif", 122, 44, 92, `font-weight="900" fill="${a.encre}"`) + t('U', "'Sofia Cond',Impact,sans-serif", 122, 58, 84, `font-weight="900" fill="none" stroke="${a.accent}" stroke-width="2.2"`),
  // Vignelli : deux lignes de métro et leurs stations
  V: (a) => `<g fill="none" stroke-linejoin="round" stroke-linecap="round"><path d="M14 16 L46 84 L78 16" stroke="${a.encre}" stroke-width="10"/><path d="M27 16 L57 80 L90 16" stroke="${a.accent}" stroke-width="10"/></g>` +
    [[14, 16], [78, 16], [46, 84], [30, 50]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4.2" fill="${a.fond}" stroke="${a.encre}" stroke-width="2.2"/>`).join(''),
  // Cieślewicz : la lettre en trame grossie, avec un seul œil
  W: (a, u) => `<pattern id="${u}t" width="5" height="5" patternUnits="userSpaceOnUse"><circle cx="2.5" cy="2.5" r="1.7" fill="${a.encre}"/></pattern>` +
    t('W', ARCHIVO, 104, 50, 88, `font-weight="800" fill="url(#${u}t)"`) + `<ellipse cx="50" cy="44" rx="15" ry="9" fill="#fff" stroke="${a.encre}" stroke-width="2.5"/><circle cx="50" cy="44" r="5.5" fill="${a.accent}"/><circle cx="50" cy="44" r="2.2" fill="${a.encre}"/>`,
  // Excoffon : la lettre au pinceau
  X: (a) => `<g transform="rotate(-6 50 50)">${t('X', "Knewave,cursive", 104, 50, 86, `fill="${a.encre}"`)}</g>`,
  // Lissitzky : le coin rouge entre dans le cercle
  Y: (a) => `<circle cx="64" cy="60" r="28" fill="${a.accent}"/><path d="M4 94 L58 50 L46 78 Z" fill="${a.encre}"/>` + t('Y', "Anton,Impact,sans-serif", 54, 24, 58, `fill="${a.encre}"`),
  // Rappaz : la lettre en trois pièces à remettre en place
  Z: (a, u) => [[0, 39, 'translate(-5 -3) rotate(-4 50 20)'], [39, 24, 'translate(4 0)'], [63, 40, 'translate(-3 4) rotate(4 50 80)']].map(([y, h, tr], i) =>
    `<clipPath id="${u}p${i}"><rect x="-10" y="${y}" width="120" height="${h}"/></clipPath><g transform="${tr}"><g clip-path="url(#${u}p${i})">${t('Z', ARCHIVO, 114, 50, 91, `font-weight="800" fill="${a.encre}"`)}</g></g>`).join(''),
};

const SANS_FOND = new Set(['G', 'K']); // ces dessins posent eux-mêmes tout leur fond

export function carte(l, { titre = false } = {}) {
  const a = PAR_LETTRE.get(l); if (!a) return '';
  const u = 'l' + (n++);
  const fond = SANS_FOND.has(l) ? '' : `<rect width="100" height="100" fill="${a.fond}"/>`;
  return `<svg class="carte" viewBox="0 0 100 100" ${titre ? `role="img" aria-label="${l}"` : 'aria-hidden="true"'}>${fond}${DESSINS[l](a, u)}</svg>`;
}

/* La lettre seule pour un onglet : même caractère que la carte, sans le décor. */
const GLYPHES = {
  A: "'Source Sans';700", B: "Londrina;900", C: "Limelight", D: "'Special Elite'", E: "Archivo;800", F: "Bodoni;900", G: "Archivo;800",
  H: "Jost;500", I: "'Alfa Slab'", J: "Archivo;800", K: "Jost;900;italic", L: "Londrina;900", M: "'Alfa Slab'", N: "Jost;700", O: "Archivo;400", P: "Archivo;800",
  Q: "Archivo;600", R: "'Alfa Slab'", S: "Anton", T: "Caslon;700", U: "'Sofia Cond';900", V: "Archivo;800", W: "Archivo;800", X: "Knewave", Y: "Anton", Z: "Archivo;800",
};
export function glyphe(l) {
  const [police, graisse = 400, style = 'normal'] = (GLYPHES[l] || 'Archivo;800').split(';');
  return `<span class="gl" style="font-family:${police},sans-serif;font-weight:${graisse};font-style:${style}">${l === 'H' ? 'h' : l}</span>`;
}
