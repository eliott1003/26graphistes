// Labo : les 26 lettres, d'après la liste v5 (validée par Eliott le 12/11).
// Couleurs et textes PROVISOIRES : à valider par Eliott, faits à relire avant le rendu.
// fond = couleur de l'intercalaire et de l'aplat ; encre = couleur du texte posé dessus.

export const ARTISTES = [
  { l: 'A', id: 'frutiger', nom: 'Adrian Frutiger', court: 'Frutiger', dates: '1928 – 2015', pays: 'Suisse', courant: 'typographie suisse',
    qui: 'Dessinateur de caractères. Il crée l’Univers (1957), puis l’alphabet de la signalétique de l’aéroport de Roissy, devenu le Frutiger (1976).',
    oeuvre: 'Le Frutiger, signalétique de Roissy-Charles-de-Gaulle (années 1970)', geste: 'Un avion passe : sur son passage, les lettres apparaissent.',
    fond: '#172a4d', encre: '#ffd200', accent: '#ffffff' },
  { l: 'B', id: 'bass', nom: 'Saul Bass', court: 'Bass', dates: '1920 – 1996', pays: 'États-Unis', courant: 'modernisme américain',
    qui: 'Il invente le générique de film moderne (Vertigo, Anatomy of a Murder) et dessine des logos qui durent, comme AT&T ou United Airlines.',
    oeuvre: 'Dessins d’Eliott', geste: 'Glisse la plaque rayée sur l’image pour l’animer.',
    fond: '#f47b20', encre: '#111111', accent: '#111111' },
  { l: 'C', id: 'cassandre', nom: 'A.M. Cassandre', court: 'Cassandre', dates: '1901 – 1968', pays: 'France', courant: 'Art déco',
    qui: 'Affichiste né à Kharkiv, installé à Paris. Nord Express, Normandie, Dubonnet : des affiches construites comme des architectures.',
    oeuvre: 'Dubonnet, vin tonique au quinquina (série d’affiches, 1932)', geste: 'Tape D-U-B-O-N-N-E-T : l’affiche avance d’un cran par lettre.',
    fond: '#7b1e2b', encre: '#f3e3c3', accent: '#e0a23a', module: '../artistes/c-cassandre.js',
    images: [{ f: 'etape-8.jpg', t: 'A.M. Cassandre, Dubonnet, vin tonique au quinquina, 1932. © & TM Mouron – A.M. Cassandre' }] },
  { l: 'D', id: 'carson', nom: 'David Carson', court: 'Carson', dates: 'né en 1955', pays: 'États-Unis', courant: 'postmodernisme',
    qui: 'Ancien surfeur professionnel, directeur artistique du magazine Ray Gun. Il casse la grille : textes qui se chevauchent, colonnes coupées.',
    oeuvre: 'Ray Gun (1992 – 1995)', geste: 'Déchire la page pour voir ce qu’il y a dessous.',
    fond: '#5c6b73', encre: '#f1ede4', accent: '#1a1a1a' },
  { l: 'E', id: 'kauffer', nom: 'Edward McKnight Kauffer', court: 'Kauffer', dates: '1890 – 1954', pays: 'États-Unis, Londres', courant: 'vorticisme',
    qui: 'Américain installé à Londres, il fait entrer le cubisme et le vorticisme dans l’affiche : plus de cent affiches pour le métro de Londres.',
    oeuvre: 'Soaring to Success! The Early Bird (1918 – 1919)', geste: 'Passe la souris : les oiseaux s’envolent, puis reviennent se poser.',
    fond: '#f2c230', encre: '#111111', accent: '#c8361d', module: '../artistes/e-kauffer.js',
    images: [{ f: 'ref.jpg', t: 'Edward McKnight Kauffer, Soaring to Success! Daily Herald – the Early Bird, 1918-1919 (variante de l’affiche, Cooper Hewitt)' }] },
  { l: 'F', id: 'favre', nom: 'Malika Favre', court: 'Favre', dates: 'en activité', pays: 'France', courant: 'illustration contemporaine', actuel: true,
    qui: 'Illustratrice française installée à Barcelone. Aplats de couleur, pleins et vides qui jouent ensemble : des couvertures pour le New Yorker et Vogue.',
    oeuvre: 'Kama Sutra Alphabet', geste: 'Tape une lettre : sa lettre de l’alphabet apparaît.',
    fond: '#f0607a', encre: '#121a3a', accent: '#ffffff' },
  { l: 'G', id: 'grignani', nom: 'Franco Grignani', court: 'Grignani', dates: '1908 – 1999', pays: 'Italie', courant: 'op art',
    qui: 'Peintre et graphiste milanais. Des rayures et des trames qui vibrent, et le logo Woolmark (1964).',
    oeuvre: 'Today’s Italian Publicity and Graphic Design (1967)', geste: 'Éventail, onde ou ruban : les formes suivent ta souris, ou ta main.',
    fond: '#0c0c0c', encre: '#ffffff', accent: '#ffffff', module: '../artistes/g-grignani.js',
    images: [{ f: 'ref.jpg', t: 'Franco Grignani, Today’s Italian Publicity and Graphic Design, affiche d’exposition, Londres, 1967' }, { f: '01.jpg', t: 'Franco Grignani, composition à rayures (titre et date à préciser)' }, { f: '02.jpg', t: 'Franco Grignani, composition à rayures (titre et date à préciser)' }, { f: '03.jpg', t: 'Franco Grignani, couverture de Linea grafica n° 6, novembre-décembre 1965' }, { f: '04.jpg', t: 'Franco Grignani, annonce pour l’imprimerie Alfieri & Lacroix' }] },
  { l: 'H', id: 'bayer', nom: 'Herbert Bayer', court: 'Bayer', dates: '1900 – 1985', pays: 'Autriche, États-Unis', courant: 'Bauhaus',
    qui: 'Élève puis maître au Bauhaus. Il veut une écriture sans majuscules : l’alphabet universel (1925). Plus tard, affiches et expositions aux États-Unis.',
    oeuvre: 'L’affiche aux mains avec un œil', geste: 'Montre tes mains à la caméra : un œil apparaît dans ta paume.',
    fond: '#e9dcc3', encre: '#111111', accent: '#e23d28' },
  { l: 'I', id: 'girard', nom: 'Alexander Girard', court: 'Girard', dates: '1907 – 1993', pays: 'États-Unis', courant: 'design du milieu du siècle',
    qui: 'Architecte et designer, directeur des textiles chez Herman Miller. Pour le restaurant La Fonda del Sol (1960), il dessine tout, jusqu’à des dizaines de soleils.',
    oeuvre: 'Soleils de La Fonda del Sol (1960)', geste: 'Les soleils défilent ; arrête-les en les survolant.',
    fond: '#e6007e', encre: '#ffffff', accent: '#ffd23f' },
  { l: 'J', id: 'jetset', nom: 'Experimental Jetset', court: 'Jetset', dates: 'depuis 1997', pays: 'Pays-Bas', courant: 'modernisme, aujourd’hui', actuel: true,
    qui: 'Studio d’Amsterdam : Marieke Stolk, Erwin Brinkers et Danny van den Dungen. Helvetica, grilles strictes, et l’identité du Whitney Museum (2013).',
    oeuvre: 'Full Scale False Scale (Roma Publications, 2019)', geste: 'Écris : les mots se posent les uns sur les autres et leurs lettres se serrent.',
    fond: '#fff200', encre: '#111111', accent: '#111111' , module: '../artistes/j-jetset.js',
    images: [{ f: 'ref.jpg', t: 'Experimental Jetset, Full Scale False Scale. A reader of sorts (Roma Publications, 2019), couverture' }] },
  { l: 'K', id: 'kruger', nom: 'Barbara Kruger', court: 'Kruger', dates: 'née en 1945', pays: 'États-Unis', courant: 'art conceptuel',
    qui: 'Elle commence comme graphiste dans la presse magazine. Une photo en noir et blanc recadrée serré, une phrase en Futura oblique, blanc sur rouge, qui parle à celui qui regarde.',
    oeuvre: 'Untitled (Your gaze hits the side of my face), 1981', geste: 'Prends la place de la statue : allume la caméra, mets-toi de profil, écris ta phrase.',
    fond: '#e2001a', encre: '#ffffff', accent: '#0d0d0d', module: '../artistes/k-kruger.js' },
  { l: 'L', id: 'leupin', nom: 'Herbert Leupin', court: 'Leupin', dates: '1916 – 1999', pays: 'Suisse', courant: 'affiche suisse',
    qui: 'Affichiste bâlois. Des objets qui prennent vie et un humour léger : Coca-Cola, Pelikan, Knorr, les cigarettes Brissago.',
    oeuvre: 'L’affiche Coca-Cola à la pancarte', geste: 'Tire la pancarte : elle rebondit et se balance.',
    fond: '#c8102e', encre: '#ffffff', accent: '#f6e7c8' },
  { l: 'M', id: 'bierut', nom: 'Michael Bierut', court: 'Bierut', dates: 'né en 1957', pays: 'États-Unis', courant: 'identité visuelle', actuel: true,
    qui: 'Associé de Pentagram à New York depuis 1990. Pour Saks Fifth Avenue (2007), il découpe le logo en 64 carrés : des centaines de sacs, tous différents, toujours la même marque.',
    oeuvre: 'Identité Saks Fifth Avenue (2007)', geste: 'Mélange les 64 carrés du logo, puis mets ta composition sur un sac.',
    fond: '#0a0a0a', encre: '#ffffff', accent: '#ffffff' , module: '../artistes/m-bierut.js',
    images: [{ f: 'logo.png', t: 'Logo Saks Fifth Avenue, Pentagram (Michael Bierut), 2007, d’après le logo de 1973' }] },
  { l: 'N', id: 'neurath', nom: 'Otto Neurath', court: 'Neurath', dates: '1882 – 1945', pays: 'Autriche', courant: 'Isotype',
    qui: 'Philosophe et économiste viennois. Avec Marie Reidemeister et le dessinateur Gerd Arntz, il invente l’Isotype : des chiffres dits par des pictogrammes, lisibles par tous.',
    oeuvre: 'International Picture Language (1936) et Gesellschaft und Wirtschaft (1930)', geste: 'Regarde d’abord la mauvaise méthode, puis fais comme Neurath.',
    fond: '#efe8d8', encre: '#1a1a1a', accent: '#c4382b' , module: '../artistes/n-neurath.js',
    images: [{ f: 'ref.jpg', t: 'Births and Deaths in Germany in a Year, International Picture Language, 1936' },
      { f: '02.jpg', t: 'Verfassungsformen in der abendländischen Kultur, Gesellschaft und Wirtschaft, 1930, planche 31' },
      { f: '03.jpg', t: 'Säuglingssterblichkeit und Einkommen, Gesellschaft und Wirtschaft, 1930, planche 92' }] },
  { l: 'O', id: 'aicher', nom: 'Otl Aicher', court: 'Aicher', dates: '1922 – 1991', pays: 'Allemagne', courant: 'école d’Ulm',
    qui: 'Cofondateur de l’école d’Ulm. Pour les Jeux de Munich (1972), il dessine un système complet : couleurs, grille, pictogrammes des sports.',
    oeuvre: 'Pictogrammes des Jeux de Munich (1972)', geste: 'Espace : le bonhomme change de sport.',
    fond: '#5bb5e5', encre: '#111111', accent: '#ffffff' },
  { l: 'P', id: 'perrottet', nom: 'Vincent Perrottet', court: 'Perrottet', dates: 'né en 1958', pays: 'France', courant: 'affiche contemporaine', actuel: true,
    qui: 'Graphiste français passé par Grapus puis Les Graphistes associés. Des affiches de théâtre denses et colorées, souvent avec Anette Lenz.',
    oeuvre: 'Affiches du Théâtre d’Angoulême (avec Anette Lenz)', geste: 'Promène trois filtres rouge, vert, bleu sur l’affiche.',
    fond: '#00aeef', encre: '#111111', accent: '#ec008c' },
  { l: 'Q', id: 'casey', nom: 'Jacqueline Casey', court: 'Casey', dates: '1927 – 1992', pays: 'États-Unis', courant: 'style suisse aux États-Unis',
    qui: 'Graphiste du bureau des publications du MIT. Une image forte, un jeu de mots visuel, beaucoup de blanc : le style suisse passé à Boston.',
    oeuvre: 'Ocean Engineering at MIT', geste: 'Fais grandir le nautile : une loge de plus à chaque cran, et la mer monte.',
    fond: '#0d5fa8', encre: '#ffffff', accent: '#ffd23f', module: '../artistes/q-casey.js',
    images: [{ f: 'ref.jpg', t: 'Jacqueline Casey, Ocean Engineering at the Massachusetts Institute of Technology, affiche pour le MIT (année à préciser)' }] },
  { l: 'R', id: 'rand', nom: 'Paul Rand', court: 'Rand', dates: '1914 – 1996', pays: 'États-Unis', courant: 'modernisme américain',
    qui: 'Il donne un visage aux grandes entreprises américaines : IBM, ABC, UPS, NeXT. Pour lui, un logo est un jeu sérieux.',
    oeuvre: 'Logos IBM, Westinghouse, UPS, ABC, NeXT', geste: 'Fais tourner l’anneau des logos.',
    fond: '#1f70c1', encre: '#ffffff', accent: '#ffffff' },
  { l: 'S', id: 'scher', nom: 'Paula Scher', court: 'Scher', dates: 'née en 1948', pays: 'États-Unis', courant: 'postmodernisme',
    qui: 'Associée de Pentagram depuis 1991. Typographie bruyante pour le Public Theater, logo Citi esquissé sur une serviette, cartes peintes à la main.',
    oeuvre: 'Bring in ’da Noise, Bring in ’da Funk (1995)', geste: 'Fais du bruit : les textes grossissent.',
    fond: '#ffe500', encre: '#111111', accent: '#e8392b' },
  { l: 'T', id: 'tanaka', nom: 'Ikko Tanaka', court: 'Tanaka', dates: '1930 – 2002', pays: 'Japon', courant: 'modernisme japonais',
    qui: 'Il croise la tradition japonaise et le modernisme : aplats, grille, visages réduits à quelques formes. Il participe aussi à la création de Muji.',
    oeuvre: 'Nihon Buyo (1981)', geste: 'Appuie sur Gravité : les formes tombent.',
    fond: '#6b3fa0', encre: '#ffffff', accent: '#ff5fa2' },
  { l: 'U', id: 'baur', nom: 'Ruedi Baur', court: 'Baur', dates: 'né en 1956', pays: 'France, Suisse', courant: 'signalétique', actuel: true,
    qui: 'Designer franco-suisse. Il donne une identité aux lieux publics : Centre Pompidou, aéroport de Cologne-Bonn, Cité internationale universitaire de Paris.',
    oeuvre: 'Identité et signalétique du Centre Pompidou (1997 – 2000)', geste: 'Tape un mot : il se traduit en voile.',
    fond: '#ff4f9a', encre: '#111111', accent: '#ffffff' },
  { l: 'V', id: 'vignelli', nom: 'Massimo Vignelli', court: 'Vignelli', dates: '1931 – 2014', pays: 'Italie, États-Unis', courant: 'modernisme',
    qui: 'Designer milanais installé à New York. Peu de caractères, une grille, et tout se range : plan et signalétique du métro, American Airlines, Knoll.',
    oeuvre: 'Plan du métro de New York (1972)', geste: 'Redresse les lignes du métro à 45°.',
    fond: '#d71920', encre: '#ffffff', accent: '#111111' },
  { l: 'W', id: 'cieslewicz', nom: 'Roman Cieślewicz', court: 'Cieślewicz', dates: '1930 – 1996', pays: 'Pologne, France', courant: 'affiche polonaise, photomontage',
    qui: 'Venu de l’école polonaise de l’affiche, installé à Paris en 1963. Photomontage, trame agrandie, images coupées et recollées ; directeur artistique d’Elle.',
    oeuvre: 'Zoom contre la pollution de l’œil (1971)', geste: 'Regarde la caméra : tes deux yeux n’en font plus qu’un.',
    fond: '#d9d9d6', encre: '#111111', accent: '#e2001a' },
  { l: 'X', id: 'excoffon', nom: 'Roger Excoffon', court: 'Excoffon', dates: '1910 – 1983', pays: 'France', courant: 'typographie française',
    qui: 'Dessinateur de caractères et affichiste marseillais. Mistral, Choc, Banco, Antique Olive : l’écriture au pinceau devenue typographie.',
    oeuvre: 'Affiche de la Caravelle, Air France (1964)', geste: 'Dessine l’avion d’un seul geste.',
    fond: '#a6431f', encre: '#ffffff', accent: '#ffd23f', module: '../artistes/x-excoffon.js',
    images: [{ f: 'ref.jpg', t: 'Roger Excoffon, affiche de la Caravelle, Air France, 1964' }] },
  { l: 'Y', id: 'lissitzky', nom: 'El Lissitzky', court: 'Lissitzky', dates: '1890 – 1941', pays: 'Russie', courant: 'constructivisme',
    qui: 'Artiste, architecte et typographe. Il met les formes pures au service du message : cercles, diagonales, rouge et noir.',
    oeuvre: 'Battre les Blancs avec le coin rouge (1919 – 1920)', geste: 'Tends le coin rouge, puis lâche.',
    fond: '#efe7d6', encre: '#d7261e', accent: '#111111' },
  { l: 'Z', id: 'rappaz', nom: 'Rolf Rappaz', court: 'Rappaz', dates: '1914 – 1996', pays: 'Suisse', courant: 'style suisse',
    qui: 'Graphiste bâlois. Affiches pour la Foire suisse d’échantillons, Swissair ou le Comptoir suisse ; à la fin des années 1960, il se consacre à la peinture.',
    oeuvre: 'Comptoir suisse, Lausanne (1961)', geste: 'Reconstitue le C en pièces.',
    fond: '#2b2b2b', encre: '#ffd60a', accent: '#ffffff' },
];

export const PAR_LETTRE = new Map(ARTISTES.map(a => [a.l, a]));
export const CONSTRUITS = new Set(ARTISTES.filter(a => a.module).map(a => a.l)); // ateliers qui marchent vraiment

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
