// U · Ruedi Baur (Intégral Ruedi Baur) — identité et signalétique du Centre Pompidou (1997-2000).
// Le « voile » : le même mot dans plusieurs langues, superposé et décalé jusqu'à l'illisible ; le mot français ressort en blanc.
// On tape un mot en français : il est traduit en direct (service gratuit MyMemory), avec un dictionnaire de secours
// (DICO, plus bas) pour que ça marche toujours en présentation, même sans réseau.
//
// Calé le 13/11 sur l'image d'Eliott (img/u/ref.jpg, la surface en couleurs) : le mot dans chaque langue est répété
// en lignes serrées, en jaune, bleu, rouge et vert, capitale initiale, DIN étroit ; les lignes se recouvrent.
// Police : DIN étroit du Mac (« DIN Condensed »), sinon Barlow Semi Condensed.
// Rien n'est recopié de la surface d'origine : c'est la méthode, appliquée au mot du visiteur.

const LANGUES = [['en', 'anglais'], ['de', 'allemand'], ['es', 'espagnol'], ['it', 'italien'], ['pt', 'portugais'], ['nl', 'néerlandais'], ['ja', 'japonais'], ['ar', 'arabe']];
const COULEURS = [['jaune', '#f7e400'], ['bleu', '#1f62b5'], ['rouge', '#c8102e'], ['vert', '#93a52c']]; // relevées sur l'image
const LIEUX = ['musée', 'cinéma', 'bibliothèque', 'librairie', 'forum', 'spectacle'];
const POLICE = '"DIN Condensed","DIN Alternate","Bahnschrift","Barlow SC",Archivo,sans-serif';
// chaque langue : corps (fraction de la hauteur), décalage de départ, décalage d'un rang au suivant, part du mouvement de la souris
const PLACES = [[.1, .0, .37, -1], [.085, .31, .61, .8], [.095, .62, .23, -.6], [.08, .17, .79, .45], [.1, .48, .52, -.35], [.085, .83, .13, .65], [.11, .07, .68, -.85], [.09, .55, .41, 1]];
const maj = t => t.charAt(0).toLocaleUpperCase() + t.slice(1);

// Dictionnaire de secours : anglais, allemand, espagnol, italien, portugais, néerlandais, japonais, arabe.
const DICO = {
  'musee': 'museum|museum|museo|museo|museu|museum|美術館|متحف', 'cinema': 'cinema|kino|cine|cinema|cinema|bioscoop|映画館|سينما',
  'bibliotheque': 'library|bibliothek|biblioteca|biblioteca|biblioteca|bibliotheek|図書館|مكتبة', 'librairie': 'bookshop|buchhandlung|librería|libreria|livraria|boekhandel|書店|متجر كتب',
  'forum': 'forum|forum|foro|foro|fórum|forum|フォーラム|منتدى', 'spectacle': 'show|vorstellung|espectáculo|spettacolo|espetáculo|voorstelling|公演|عرض',
  'entree': 'entrance|eingang|entrada|ingresso|entrada|ingang|入口|مدخل', 'sortie': 'exit|ausgang|salida|uscita|saída|uitgang|出口|مخرج',
  'billets': 'tickets|karten|entradas|biglietti|bilhetes|kaartjes|チケット|تذاكر', 'accueil': 'reception|empfang|recepción|accoglienza|receção|onthaal|受付|استقبال',
  'exposition': 'exhibition|ausstellung|exposición|mostra|exposição|tentoonstelling|展覧会|معرض', 'galerie': 'gallery|galerie|galería|galleria|galeria|galerij|ギャラリー|رواق',
  'theatre': 'theatre|theater|teatro|teatro|teatro|theater|劇場|مسرح', 'cafe': 'café|café|café|caffè|café|café|カフェ|مقهى',
  'restaurant': 'restaurant|restaurant|restaurante|ristorante|restaurante|restaurant|レストラン|مطعم', 'vestiaire': 'cloakroom|garderobe|guardarropa|guardaroba|bengaleiro|garderobe|クローク|حجرة المعاطف',
  'toilettes': 'toilets|toiletten|aseos|bagni|sanitários|toiletten|お手洗い|مراحيض', 'ascenseur': 'lift|aufzug|ascensor|ascensore|elevador|lift|エレベーター|مصعد',
  'escalier': 'stairs|treppe|escalera|scala|escada|trap|階段|درج', 'niveau': 'level|ebene|nivel|livello|nível|niveau|階|طابق',
  'atelier': 'workshop|werkstatt|taller|laboratorio|oficina|werkplaats|工房|ورشة', 'enfants': 'children|kinder|niños|bambini|crianças|kinderen|こども|أطفال',
  'boutique': 'shop|laden|tienda|negozio|loja|winkel|店|متجر', 'terrasse': 'terrace|terrasse|terraza|terrazza|terraço|terras|テラス|شرفة',
  'art': 'art|kunst|arte|arte|arte|kunst|芸術|فن', 'musique': 'music|musik|música|musica|música|muziek|音楽|موسيقى',
  'danse': 'dance|tanz|danza|danza|dança|dans|踊り|رقص', 'livre': 'book|buch|libro|libro|livro|boek|本|كتاب',
  'image': 'image|bild|imagen|immagine|imagem|beeld|画像|صورة', 'lettre': 'letter|buchstabe|letra|lettera|letra|letter|文字|حرف',
  'mot': 'word|wort|palabra|parola|palavra|woord|言葉|كلمة', 'langue': 'language|sprache|lengua|lingua|língua|taal|言語|لغة',
  'couleur': 'colour|farbe|color|colore|cor|kleur|色|لون', 'signe': 'sign|zeichen|signo|segno|sinal|teken|記号|علامة',
  'ville': 'city|stadt|ciudad|città|cidade|stad|都市|مدينة', 'rue': 'street|straße|calle|strada|rua|straat|通り|شارع',
  'maison': 'house|haus|casa|casa|casa|huis|家|بيت', 'ecole': 'school|schule|escuela|scuola|escola|school|学校|مدرسة',
  'professeur': 'teacher|lehrer|profesor|professore|professor|leraar|先生|أستاذ', 'porte': 'door|tür|puerta|porta|porta|deur|扉|باب',
  'fenetre': 'window|fenster|ventana|finestra|janela|raam|窓|نافذة', 'lumiere': 'light|licht|luz|luce|luz|licht|光|ضوء',
  'nuit': 'night|nacht|noche|notte|noite|nacht|夜|ليل', 'jour': 'day|tag|día|giorno|dia|dag|日|يوم',
  'soleil': 'sun|sonne|sol|sole|sol|zon|太陽|شمس', 'lune': 'moon|mond|luna|luna|lua|maan|月|قمر',
  'eau': 'water|wasser|agua|acqua|água|water|水|ماء', 'feu': 'fire|feuer|fuego|fuoco|fogo|vuur|火|نار',
  'air': 'air|luft|aire|aria|ar|lucht|空気|هواء', 'terre': 'earth|erde|tierra|terra|terra|aarde|地球|أرض',
  'mer': 'sea|meer|mar|mare|mar|zee|海|بحر', 'ciel': 'sky|himmel|cielo|cielo|céu|hemel|空|سماء',
  'amour': 'love|liebe|amor|amore|amor|liefde|愛|حب', 'ami': 'friend|freund|amigo|amico|amigo|vriend|友達|صديق',
  'bonjour': 'hello|guten tag|hola|buongiorno|olá|hallo|こんにちは|مرحبا', 'merci': 'thank you|danke|gracias|grazie|obrigado|dank je|ありがとう|شكرا',
  'bienvenue': 'welcome|willkommen|bienvenido|benvenuti|bem-vindo|welkom|ようこそ|أهلا وسهلا', 'oui': 'yes|ja|sí|sì|sim|ja|はい|نعم',
  'non': 'no|nein|no|no|não|nee|いいえ|لا', 'paris': 'paris|paris|parís|parigi|paris|parijs|パリ|باريس',
  'graphisme': 'graphic design|grafikdesign|diseño gráfico|grafica|design gráfico|grafisch ontwerp|グラフィックデザイン|تصميم جرافيكي',
  'graphiste': 'graphic designer|grafiker|diseñador gráfico|grafico|designer gráfico|grafisch ontwerper|グラフィックデザイナー|مصمم جرافيك',
  'affiche': 'poster|plakat|cartel|manifesto|cartaz|affiche|ポスター|ملصق', 'alphabet': 'alphabet|alphabet|alfabeto|alfabeto|alfabeto|alfabet|アルファベット|أبجدية',
  'voile': 'veil|schleier|velo|velo|véu|sluier|ベール|حجاب', 'identite': 'identity|identität|identidad|identità|identidade|identiteit|アイデンティティ|هوية',
  'culture': 'culture|kultur|cultura|cultura|cultura|cultuur|文化|ثقافة', 'chat': 'cat|katze|gato|gatto|gato|kat|猫|قط',
  'chien': 'dog|hund|perro|cane|cão|hond|犬|كلب', 'chocolat': 'chocolate|schokolade|chocolate|cioccolato|chocolate|chocolade|チョコレート|شوكولاتة',
  'vendredi': 'friday|freitag|viernes|venerdì|sexta-feira|vrijdag|金曜日|الجمعة', 'lettres': 'letters|buchstaben|letras|lettere|letras|letters|文字|حروف',
};
const cle = m => m.trim().toLocaleLowerCase('fr').normalize('NFD').replace(/[̀-ͯ]/g, '');
const duDico = m => { const k = cle(m), v = DICO[k] || DICO[k.replace(/s$/, '')]; return v ? v.split('|') : null; };
const memo = new Map();

async function traduire(mot, langue) {
  const k = langue + '|' + cle(mot); if (memo.has(k)) return memo.get(k);
  const stop = new AbortController(), minuterie = setTimeout(() => stop.abort(), 4000);
  try {
    const r = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(mot)}&langpair=fr|${langue}`, { signal: stop.signal });
    const j = await r.json(), t = (j?.responseData?.translatedText || '').trim();
    if (+j?.responseStatus !== 200 || !t || t.length > 60 || /mymemory|invalid|quota/i.test(t)) return null;
    memo.set(k, t); return t;
  } catch { return null; } finally { clearTimeout(minuterie); }
}

export default {
  lettre: 'U',
  clavier: true,
  css: `
@font-face{font-family:"Barlow SC";font-weight:600;font-display:swap;src:url(../fonts/barlow-semi-condensed-latin-600-normal.woff2) format("woff2")}
.ba{display:grid;grid-template-rows:auto auto;gap:clamp(10px,2cqh,18px);justify-items:center;align-content:center;height:100cqh}
.ba-panneau{position:relative;width:min(100cqw,calc((100cqh - 150px)*1.6));aspect-ratio:16/10;box-shadow:0 26px 50px -30px rgba(0,0,0,.55);cursor:crosshair}
.ba-panneau canvas{display:block;width:100%;height:100%}
.ba-bas{display:grid;gap:8px;width:min(100cqw,calc((100cqh - 150px)*1.6))}
.ba-ligne{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.ba-ligne p{margin:0}
.ba-saisie{flex:1 1 180px;min-width:0;min-height:42px;padding:6px 12px;border:1.5px solid currentColor;border-radius:4px;background:transparent;color:inherit;font:700 22px/1 ${POLICE}}
.ba-saisie::placeholder{color:inherit;opacity:.5}
.ba-lieux .bouton{min-height:36px;padding:6px 12px;text-transform:capitalize}
.ba-pastille{width:36px;height:36px;border-radius:50%;border:2px solid currentColor;padding:0;cursor:pointer}
.ba-pastille[aria-pressed=true]{outline:2.5px solid currentColor;outline-offset:3px}
@media (max-width:760px){.ba{height:auto}.ba-panneau,.ba-bas{width:100%}}
`,
  monter(zone, ctx) {
    zone.innerHTML = `
      <div class="ba">
        <div class="ba-panneau"><canvas data-export aria-hidden="true"></canvas></div>
        <div class="ba-bas">
          <div class="ba-ligne">
            <input class="ba-saisie" type="text" aria-label="Ton mot, en français" placeholder="tape un mot en français" autocomplete="off" spellcheck="false" maxlength="22">
            ${COULEURS.map(([n, c], i) => `<button type="button" class="ba-pastille" style="background:${c}" data-couleur="${i}" aria-label="Fond ${n}" aria-pressed="${i === 0}"></button>`).join('')}
          </div>
          <div class="ba-ligne ba-lieux">${LIEUX.map(l => `<button type="button" class="bouton" data-lieu="${l}">${l}</button>`).join('')}</div>
          <div class="ba-ligne"><p class="etiquette" aria-live="polite"></p></div>
        </div>
      </div>`;
    const panneau = zone.querySelector('.ba-panneau'), cv = panneau.querySelector('canvas'), x = cv.getContext('2d');
    const saisie = zone.querySelector('.ba-saisie'), info = zone.querySelector('.etiquette');
    let L = 0, H = 0, dpr = 1, vivant = true, raf = 0, coul = 0, mot = 'musée', couches = [], tour = 0, attente = 0;
    const souris = { x: 0, y: 0, cx: 0, cy: 0 };

    function mesurer() { const r = panneau.getBoundingClientRect(); if (!r.width) return; dpr = Math.min(devicePixelRatio || 1, 2); L = r.width; H = r.height; cv.width = Math.round(L * dpr); cv.height = Math.round(H * dpr); lancer(); }
    // corps tel que le mot tienne dans la largeur, sans dépasser un corps maximal
    function corps(texte, max, larg) { x.font = `700 100px ${POLICE}`; const w = x.measureText(texte).width || 1; return Math.min(max, 100 * larg / w); }
    function dessiner(t) {
      if (!L) return false;
      let encore = false;
      souris.cx += (souris.x - souris.cx) * .12; souris.cy += (souris.y - souris.cy) * .12;
      if (Math.abs(souris.x - souris.cx) + Math.abs(souris.y - souris.cy) > .002) encore = true;
      x.setTransform(dpr, 0, 0, dpr, 0, 0); x.globalAlpha = 1;
      x.fillStyle = COULEURS[coul][1]; x.fillRect(0, 0, L, H);
      x.save(); x.beginPath(); x.rect(0, 0, L, H); x.clip();
      x.textAlign = 'left'; x.textBaseline = 'alphabetic';
      // le voile : chaque langue répétée en rangs serrés, dans une des quatre couleurs ; les rangs se recouvrent
      couches.forEach(c => {
        const p = ctx.reduireMouvement ? 1 : Math.min(1, (t - c.t0) / 520); if (p < 1) encore = true; if (p <= 0) return;
        const e = 1 - Math.pow(1 - p, 3), [k, dy, glisse, part] = PLACES[c.i], corps = H * k, rang = corps * 1.55;
        x.font = `700 ${corps}px ${POLICE}`; x.direction = c.l === 'ar' ? 'rtl' : 'ltr';
        const pas = x.measureText(c.texte).width + corps * .32;
        const ox = souris.cx * part * L * .06 + (1 - e) * L * .35 * Math.sign(part), oy = dy * rang + souris.cy * part * H * .05;
        x.globalAlpha = e; x.fillStyle = COULEURS[(c.i + coul + 1) % 4][1];
        for (let r = -1, y = oy - rang; y < H + corps; r++, y += rang) {
          let px = ((ox + r * glisse * pas) % pas + pas) % pas - pas;
          for (; px < L + pas; px += pas) x.fillText(c.texte, c.l === 'ar' ? px + pas : px, y);
        }
      });
      x.restore();
      // le mot français, lisible, en blanc
      x.globalAlpha = 1; x.direction = 'ltr'; x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle';
      const fr = maj(mot.toLocaleLowerCase('fr')) || ' ';
      x.font = `700 ${corps(fr, H * .42, L * .84)}px ${POLICE}`; x.fillText(fr, L * .5, H * .52);
      return encore;
    }
    function lancer() { cancelAnimationFrame(raf); const pas = t => { if (!vivant) return; if (dessiner(t)) raf = requestAnimationFrame(pas); }; raf = requestAnimationFrame(pas); }
    const poser = (i, texte) => { couches.push({ i, l: LANGUES[i][0], nom: LANGUES[i][1], texte: maj(texte.toLocaleLowerCase()), t0: performance.now() + couches.length * 70 }); lancer(); };

    async function composer(nouveau) {
      mot = nouveau.trim().slice(0, 22); const moi = ++tour; couches = []; lancer();
      if (!mot) { info.textContent = 'Écris un mot, ou choisis un lieu.'; return; }
      const sec = duDico(mot);
      if (sec) { sec.forEach((t, i) => poser(i, t)); info.textContent = `« ${mot} » en ${LANGUES.length} langues : ${LANGUES.map(l => l[1]).join(', ')}. Promène la souris sur le panneau.`; return; }
      info.textContent = `Traduction de « ${mot} »…`;
      let recus = 0;
      await Promise.all(LANGUES.map(async ([l], i) => { const t = await traduire(mot, l); if (moi !== tour || !t) return; recus++; poser(i, t); }));
      if (moi !== tour) return;
      info.textContent = recus ? `« ${mot} » en ${recus} langue${recus > 1 ? 's' : ''}. Promène la souris sur le panneau.`
        : `Pas de traduction en ligne pour « ${mot} ». Essaie un lieu ci-dessus, ou un mot simple (soleil, livre, bonjour).`;
    }
    const plusTard = () => { clearTimeout(attente); attente = setTimeout(() => composer(saisie.value), 420); };
    saisie.addEventListener('input', plusTard);
    saisie.addEventListener('keydown', e => { if (e.key === 'Enter') { clearTimeout(attente); composer(saisie.value); } });
    // on tape directement, sans cliquer dans le champ
    function taper(e) {
      if (e.metaKey || e.ctrlKey || e.altKey || e.key === 'Escape') return;
      if (e.target instanceof Element && e.target.closest('input,textarea,select,button')) return;
      if (e.key.length === 1 || e.key === 'Backspace') { saisie.focus(); }
    }
    addEventListener('keydown', taper);
    zone.querySelectorAll('[data-lieu]').forEach(b => b.addEventListener('click', () => { saisie.value = b.dataset.lieu; clearTimeout(attente); composer(b.dataset.lieu); }));
    zone.querySelectorAll('[data-couleur]').forEach(b => b.addEventListener('click', () => {
      coul = +b.dataset.couleur; zone.querySelectorAll('[data-couleur]').forEach(o => o.setAttribute('aria-pressed', o === b)); lancer();
    }));
    const bouger = e => { const r = panneau.getBoundingClientRect(); souris.x = ((e.clientX - r.left) / r.width - .5) * 2; souris.y = ((e.clientY - r.top) / r.height - .5) * 2; lancer(); };
    const quitter = () => { souris.x = 0; souris.y = 0; lancer(); };
    panneau.addEventListener('pointermove', bouger); panneau.addEventListener('pointerdown', bouger); panneau.addEventListener('pointerleave', quitter);
    const ro = new ResizeObserver(mesurer); ro.observe(panneau);
    document.fonts.load(`600 40px "Barlow SC"`).then(() => lancer()).catch(() => {});
    mesurer(); saisie.value = mot; composer(mot);
    return () => { vivant = false; tour++; clearTimeout(attente); cancelAnimationFrame(raf); ro.disconnect(); removeEventListener('keydown', taper); };
  },
};
