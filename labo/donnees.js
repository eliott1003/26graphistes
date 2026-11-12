// Labo : les 26 lettres, d'après la liste v3 (proposition du 12/11, pas encore figée).
// Couleurs et textes PROVISOIRES : à valider par Eliott, faits à relire avant le rendu.
// fond = couleur de l'intercalaire et de l'aplat ; encre = couleur du texte posé dessus.

export const ARTISTES = [
  { l: 'A', id: 'apeloig', nom: 'Philippe Apeloig', court: 'Apeloig', dates: 'né en 1962', pays: 'France', courant: 'typographie contemporaine', actuel: true,
    qui: 'Affichiste et typographe. Il fait bouger les lettres sur l’affiche, pour le musée d’Orsay, le Louvre ou le théâtre du Châtelet.',
    oeuvre: 'Chicago, naissance d’une métropole (1987)', geste: 'La souris fait le soleil : les lignes s’orientent et la lumière passe.',
    fond: '#2340c9', encre: '#ffffff', accent: '#ff5a36' },
  { l: 'B', id: 'bass', nom: 'Saul Bass', court: 'Bass', dates: '1920 – 1996', pays: 'États-Unis', courant: 'modernisme américain',
    qui: 'Il invente le générique de film moderne (Vertigo, Anatomy of a Murder) et dessine des logos qui durent, comme AT&T ou United Airlines.',
    oeuvre: 'À choisir (dessins d’Eliott)', geste: 'Glisse la plaque rayée sur l’image pour l’animer.',
    fond: '#f47b20', encre: '#111111', accent: '#111111' },
  { l: 'C', id: 'cassandre', nom: 'A. M. Cassandre', court: 'Cassandre', dates: '1901 – 1968', pays: 'France', courant: 'Art déco',
    qui: 'Affichiste né à Kharkiv, installé à Paris. Nord Express, Normandie, Dubonnet : des affiches construites comme des architectures. Il dessine aussi les caractères Bifur et Peignot.',
    oeuvre: 'Dubo, Dubon, Dubonnet (1932)', geste: 'Tape D-U-B-O-N-N-E-T : l’affiche avance d’une image par lettre.',
    fond: '#7b1e2b', encre: '#f3e3c3', accent: '#e0a23a' },
  { l: 'D', id: 'carson', nom: 'David Carson', court: 'Carson', dates: 'né en 1955', pays: 'États-Unis', courant: 'postmodernisme', actuel: true,
    qui: 'Ancien surfeur professionnel, directeur artistique du magazine Ray Gun. Il casse la grille : textes qui se chevauchent, colonnes coupées, lisibilité mise en question.',
    oeuvre: 'Ray Gun (1992 – 1995)', geste: 'Déchire la page pour voir ce qu’il y a dessous.',
    fond: '#5c6b73', encre: '#f1ede4', accent: '#1a1a1a' },
  { l: 'E', id: 'jetset', nom: 'Experimental Jetset', court: 'Jetset', dates: 'fondé en 1997', pays: 'Pays-Bas', courant: 'modernisme, aujourd’hui', actuel: true,
    qui: 'Studio d’Amsterdam : Marieke Stolk, Erwin Brinkers et Danny van den Dungen. Helvetica, grilles strictes, et l’identité du Whitney Museum (2013).',
    oeuvre: 'Full Scale False Scale', geste: 'Écris : plus il y a de lettres, plus elles se serrent.',
    fond: '#ff4a1c', encre: '#111111', accent: '#ffffff' },
  { l: 'F', id: 'frutiger', nom: 'Adrian Frutiger', court: 'Frutiger', dates: '1928 – 2015', pays: 'Suisse', courant: 'typographie suisse',
    qui: 'Dessinateur de caractères. Il crée l’Univers (1957), puis l’alphabet de la signalétique de l’aéroport de Roissy, devenu le Frutiger (1976).',
    oeuvre: 'Signalétique de Roissy-Charles-de-Gaulle (années 1970)', geste: 'Un avion passe et dévoile la typo.',
    fond: '#172a4d', encre: '#ffd200', accent: '#ffffff' },
  { l: 'G', id: 'grignani', nom: 'Franco Grignani', court: 'Grignani', dates: '1908 – 1999', pays: 'Italie', courant: 'op art',
    qui: 'Peintre et graphiste milanais. Des rayures et des trames qui vibrent : des milliers d’expériences optiques, et le logo Woolmark (1964).',
    oeuvre: 'Today’s Italian Publicity and Graphic Design (1967)', geste: 'Une bande de rayures suit ta souris.',
    fond: '#0c0c0c', encre: '#ffffff', accent: '#ffffff' },
  { l: 'H', id: 'hillmann', nom: 'Hans Hillmann', court: 'Hillmann', dates: '1925 – 2014', pays: 'Allemagne', courant: 'affiche de cinéma',
    qui: 'Affichiste allemand. Plus d’une centaine d’affiches de films d’auteur pour le distributeur Neue Filmkunst, pensées comme des idées plutôt que comme des portraits d’acteurs.',
    oeuvre: 'Sturm über Asien (Tempête sur l’Asie)', geste: 'Fais défiler : l’image contient l’image.',
    fond: '#8f9499', encre: '#111111', accent: '#ffffff' },
  { l: 'I', id: 'girard', nom: 'Alexander Girard', court: 'Girard', dates: '1907 – 1993', pays: 'États-Unis', courant: 'design du milieu du siècle',
    qui: 'Architecte et designer, directeur des textiles chez Herman Miller. Pour le restaurant La Fonda del Sol (1960), il dessine tout, jusqu’à des dizaines de soleils.',
    oeuvre: 'Soleils de La Fonda del Sol (1960)', geste: 'Les soleils défilent ; arrête-les en les survolant.',
    fond: '#e6007e', encre: '#ffffff', accent: '#ffd23f' },
  { l: 'J', id: 'carlu', nom: 'Jean Carlu', court: 'Carlu', dates: '1900 – 1997', pays: 'France', courant: 'Art déco',
    qui: 'Affichiste français. Des formes géométriques et une idée par affiche ; en 1942, aux États-Unis, il signe America’s Answer! Production.',
    oeuvre: 'America’s Answer! Production (1942)', geste: 'Serre l’écrou du O.',
    fond: '#17479e', encre: '#ffffff', accent: '#e8392b' },
  { l: 'K', id: 'kruger', nom: 'Barbara Kruger', court: 'Kruger', dates: 'née en 1945', pays: 'États-Unis', courant: 'art conceptuel', actuel: true,
    qui: 'Elle commence comme graphiste dans la presse magazine. Une photo en noir et blanc recadrée serré, une phrase en Futura oblique, blanc sur rouge, qui parle à celui qui regarde.',
    oeuvre: 'Untitled (Your gaze hits the side of my face), 1981', geste: 'Colle ta phrase sur ton image.',
    fond: '#e2001a', encre: '#ffffff', accent: '#0d0d0d', module: '../artistes/k-kruger.js' },
  { l: 'L', id: 'lissitzky', nom: 'El Lissitzky', court: 'Lissitzky', dates: '1890 – 1941', pays: 'Russie', courant: 'constructivisme',
    qui: 'Artiste, architecte et typographe. Il met les formes pures au service du message : cercles, diagonales, rouge et noir.',
    oeuvre: 'Battre les Blancs avec le coin rouge (1919 – 1920)', geste: 'Tire le coin rouge en arrière, puis lâche.',
    fond: '#efe7d6', encre: '#d7261e', accent: '#111111' },
  { l: 'M', id: 'bierut', nom: 'Michael Bierut', court: 'Bierut', dates: 'né en 1957', pays: 'États-Unis', courant: 'identité visuelle', actuel: true,
    qui: 'Associé de Pentagram à New York depuis 1990. Identités pour Saks Fifth Avenue, le MIT Media Lab ou Mastercard.',
    oeuvre: 'Identité Saks Fifth Avenue (2007)', geste: 'Clique : le logo se remélange en 64 carrés.',
    fond: '#fbfbf8', encre: '#0a0a0a', accent: '#0a0a0a' },
  { l: 'N', id: 'neurath', nom: 'Otto Neurath', court: 'Neurath', dates: '1882 – 1945', pays: 'Autriche', courant: 'Isotype',
    qui: 'Philosophe et économiste viennois. Avec Marie Reidemeister et le dessinateur Gerd Arntz, il invente l’Isotype : des statistiques en pictogrammes, lisibles par tous.',
    oeuvre: 'Pictogrammes Isotype', geste: 'Tape un nombre, les pictogrammes se comptent.',
    fond: '#3b8f4a', encre: '#ffffff', accent: '#111111' },
  { l: 'O', id: 'aicher', nom: 'Otl Aicher', court: 'Aicher', dates: '1922 – 1991', pays: 'Allemagne', courant: 'école d’Ulm',
    qui: 'Cofondateur de l’école d’Ulm. Pour les Jeux de Munich (1972), il dessine un système complet : couleurs, grille, pictogrammes des sports.',
    oeuvre: 'Pictogrammes des Jeux de Munich (1972)', geste: 'Articule le pictogramme sur sa grille à 45°.',
    fond: '#5bb5e5', encre: '#111111', accent: '#ffffff' },
  { l: 'P', id: 'perrottet', nom: 'Vincent Perrottet', court: 'Perrottet', dates: 'né en 1958', pays: 'France', courant: 'affiche contemporaine', actuel: true,
    qui: 'Graphiste français passé par Grapus puis Les Graphistes associés. Des affiches de théâtre denses et colorées, souvent avec Anette Lenz.',
    oeuvre: 'Affiches du Théâtre d’Angoulême (avec Anette Lenz)', geste: 'Promène trois filtres rouge, vert, bleu sur l’affiche.',
    fond: '#00aeef', encre: '#111111', accent: '#ec008c' },
  { l: 'Q', id: 'casey', nom: 'Jacqueline Casey', court: 'Casey', dates: '1927 – 1992', pays: 'États-Unis', courant: 'style suisse aux États-Unis',
    qui: 'Graphiste du bureau des publications du MIT. Une image forte, un jeu de mots visuel, beaucoup de blanc : le style suisse passé à Boston.',
    oeuvre: 'Affiches du MIT', geste: 'Geste à trouver.',
    fond: '#0d8a8a', encre: '#ffffff', accent: '#ffd23f' },
  { l: 'R', id: 'rand', nom: 'Paul Rand', court: 'Rand', dates: '1914 – 1996', pays: 'États-Unis', courant: 'modernisme américain',
    qui: 'Il donne un visage aux grandes entreprises américaines : IBM, ABC, UPS, NeXT. Pour lui, un logo est un jeu sérieux.',
    oeuvre: 'Eye Bee M (1981)', geste: 'Révèle le rébus Eye Bee M.',
    fond: '#1f70c1', encre: '#ffffff', accent: '#ffffff' },
  { l: 'S', id: 'scher', nom: 'Paula Scher', court: 'Scher', dates: 'née en 1948', pays: 'États-Unis', courant: 'postmodernisme', actuel: true,
    qui: 'Associée de Pentagram depuis 1991. Typographie bruyante pour le Public Theater, logo Citi esquissé sur une serviette en papier, cartes peintes à la main.',
    oeuvre: 'Logo Citi (1998)', geste: 'Dessine un logo en 5 secondes.',
    fond: '#ffe500', encre: '#111111', accent: '#e8392b' },
  { l: 'T', id: 'tanaka', nom: 'Ikko Tanaka', court: 'Tanaka', dates: '1930 – 2002', pays: 'Japon', courant: 'modernisme japonais',
    qui: 'Il croise la tradition japonaise et le modernisme : aplats, grille, visages réduits à quelques formes. Il participe aussi à la création de Muji.',
    oeuvre: 'Nihon Buyo (1981)', geste: 'Appuie sur Gravité : les formes tombent.',
    fond: '#6b3fa0', encre: '#ffffff', accent: '#ff5fa2' },
  { l: 'U', id: 'baur', nom: 'Ruedi Baur', court: 'Baur', dates: 'né en 1956', pays: 'France, Suisse', courant: 'signalétique', actuel: true,
    qui: 'Designer franco-suisse. Il donne une identité aux lieux publics : Centre Pompidou, aéroport de Cologne-Bonn, Cité internationale universitaire de Paris.',
    oeuvre: 'Signalétique du Centre Pompidou (2000)', geste: 'Geste à trouver.',
    fond: '#ff4f9a', encre: '#111111', accent: '#ffffff' },
  { l: 'V', id: 'vignelli', nom: 'Massimo Vignelli', court: 'Vignelli', dates: '1931 – 2014', pays: 'Italie, États-Unis', courant: 'modernisme',
    qui: 'Designer milanais installé à New York. Peu de caractères, une grille, et tout se range : plan et signalétique du métro, American Airlines, Knoll.',
    oeuvre: 'Plan du métro de New York (1972)', geste: 'Redresse les lignes du métro à 45°.',
    fond: '#d71920', encre: '#ffffff', accent: '#111111' },
  { l: 'W', id: 'crouwel', nom: 'Wim Crouwel', court: 'Crouwel', dates: '1928 – 2019', pays: 'Pays-Bas', courant: 'Total Design',
    qui: 'Cofondateur de Total Design à Amsterdam. Il travaille sur grille, jusqu’à dessiner un alphabet pour les premiers écrans : le New Alphabet (1967).',
    oeuvre: 'New Alphabet (1967)', geste: 'Tape ton prénom en New Alphabet.',
    fond: '#c4c8cc', encre: '#111111', accent: '#ff5a00' },
  { l: 'X', id: 'excoffon', nom: 'Roger Excoffon', court: 'Excoffon', dates: '1910 – 1983', pays: 'France', courant: 'typographie française',
    qui: 'Dessinateur de caractères et affichiste marseillais. Mistral, Choc, Banco, Antique Olive : l’écriture au pinceau devenue typographie. Il dessine aussi le logo d’Air France.',
    oeuvre: 'Mistral (1953), Choc (1955)', geste: 'Écris au pinceau : l’épaisseur suit ta vitesse.',
    fond: '#a6431f', encre: '#ffffff', accent: '#ffd23f' },
  { l: 'Y', id: 'bayer', nom: 'Herbert Bayer', court: 'Bayer', dates: '1900 – 1985', pays: 'Autriche, États-Unis', courant: 'Bauhaus',
    qui: 'Élève puis maître au Bauhaus. Il veut une écriture sans majuscules : l’alphabet universel (1925). Plus tard, affiches et expositions aux États-Unis.',
    oeuvre: 'Alphabet universel (1925)', geste: 'Montre tes mains à la caméra : un œil y apparaît.',
    fond: '#e9dcc3', encre: '#111111', accent: '#e23d28' },
  { l: 'Z', id: 'rappaz', nom: 'Rolf Rappaz', court: 'Rappaz', dates: '1914 – 1996', pays: 'Suisse', courant: 'style suisse',
    qui: 'Graphiste bâlois. Affiches pour la Foire suisse d’échantillons, Swissair ou le Comptoir suisse ; à la fin des années 1960, il se consacre à la peinture géométrique.',
    oeuvre: 'Comptoir suisse, Lausanne (1961)', geste: 'Reconstitue le C en pièces.',
    fond: '#2b2b2b', encre: '#ffd60a', accent: '#ffffff' },
];

export const PAR_LETTRE = new Map(ARTISTES.map(a => [a.l, a]));
export const CONSTRUITS = new Set(['K']); // ateliers qui marchent vraiment aujourd'hui

/* Clavier commun : lettres, flèches, Entrée, Échap. Ignore la frappe dans un champ. */
export function ecouterClavier({ lettre, fleche, entree, echap }) {
  addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const champ = e.target instanceof Element && e.target.closest('input,textarea,select,[contenteditable]');
    if (e.key === 'Escape') { if (champ) champ.blur(); else echap?.(); return; }
    if (champ) return;
    if (/^[a-z]$/i.test(e.key)) { e.preventDefault(); lettre?.(e.key.toUpperCase()); return; }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); fleche?.(-1); }
    else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); fleche?.(1); }
    else if (e.key === 'Enter') { if (!(e.target instanceof HTMLButtonElement || e.target instanceof HTMLAnchorElement)) { e.preventDefault(); entree?.(); } }
  });
}

/* Lien de retour vers le sommaire, ajouté à chaque page de test. */
export function lienLabo() {
  const a = document.createElement('a');
  a.className = 'vers-labo'; a.href = './'; a.textContent = 'Labo';
  a.title = 'Retour au sommaire des tests';
  document.body.append(a);
}

/* Depuis un autre accueil du labo : ouvrir le dossier d'une lettre (gabarit commun). */
export function ouvrirDossier(l, peau = 'classeur', typo = 'affiche') {
  location.href = `intercalaires.html?retour=1&peau=${peau}&typo=${typo}#${l.toLowerCase()}`;
}

/* Où se trouve la lettre de classement dans le nom : ["ROGER E", "COFFON"] pour le X d'Excoffon. */
export function decouper(a) {
  const nom = a.nom.toUpperCase(), court = a.court.toUpperCase();
  let i = nom.indexOf(a.l);
  if (!['E', 'W'].includes(a.l) && court.includes(a.l)) i = nom.lastIndexOf(court) + court.indexOf(a.l);
  return [nom.slice(0, i), nom.slice(i + 1)];
}
