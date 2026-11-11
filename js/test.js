const liste = document.getElementById('liste');
const lignes = {};
function ligne(id, nom, etat = 'att', texte = 'en attente') {
  let li = lignes[id];
  if (!li) { li = lignes[id] = document.createElement('li'); li.innerHTML = '<span></span><b></b>'; liste.append(li); }
  li.firstChild.textContent = nom; li.lastChild.textContent = texte; li.lastChild.className = etat;
}
const ok = (id, nom, t = 'OK') => ligne(id, nom, 'ok', t);
const ko = (id, nom, t = 'ÉCHEC') => ligne(id, nom, 'ko', t);

ok('js', 'Script du site (js/test.js)');
ligne('css', 'Feuille de style (css/systeme.css)');
ligne('json', 'Données (data/test.json)');
ligne('mod', 'Module chargé à la demande (js/mod.js)');
ligne('font', 'Police hébergée (fonts/…woff2)');
ligne('img', 'Image du site (img/test.svg)');
ok('hash', 'Adresse par page (#test)');
ligne('clavier', 'Clavier physique', 'att', 'tape une lettre (ordinateur)');
ligne('tactile', 'Toucher', 'att', 'touche l’écran');
ligne('camera', 'Webcam en direct');
ligne('photo', 'Photo depuis l’appareil', 'att', 'essaie ci-dessous');
ligne('stock', 'Mémoire locale');

getComputedStyle(document.documentElement).getPropertyValue('--fond').trim() ? ok('css', 'Feuille de style (css/systeme.css)') : ko('css', 'Feuille de style (css/systeme.css)');
fetch('data/test.json').then(r => r.json()).then(d => d.ok ? ok('json', 'Données (data/test.json)') : ko('json', 'Données (data/test.json)')).catch(e => ko('json', 'Données (data/test.json)', 'ÉCHEC ' + e.name));
import('./mod.js').then(m => m.default.ok && ok('mod', 'Module chargé à la demande (js/mod.js)')).catch(e => ko('mod', 'Module chargé à la demande (js/mod.js)', 'ÉCHEC ' + e.name));
document.fonts.load('italic 900 40px Jost').then(f => f.length ? ok('font', 'Police hébergée (fonts/…woff2)') : ko('font', 'Police hébergée (fonts/…woff2)')).catch(() => ko('font', 'Police hébergée (fonts/…woff2)'));
const im = new Image(); im.onload = () => ok('img', 'Image du site (img/test.svg)'); im.onerror = () => ko('img', 'Image du site (img/test.svg)'); im.src = 'img/test.svg';

addEventListener('keydown', e => { if (/^[a-z]$/i.test(e.key)) ok('clavier', 'Clavier physique', 'OK touche ' + e.key.toUpperCase()); });
addEventListener('touchstart', () => ok('tactile', 'Toucher'), { passive: true });

(async () => {
  const nom = 'Webcam en direct';
  if (!navigator.mediaDevices?.getUserMedia) return ko('camera', nom, 'indisponible');
  try { const s = await navigator.mediaDevices.getUserMedia({ video: true }); s.getTracks().forEach(t => t.stop()); ok('camera', nom); }
  catch (e) { ko('camera', nom, 'refusée (' + e.name + ')'); }
})();
document.getElementById('photo').addEventListener('change', e => {
  const f = e.target.files[0]; if (!f) return;
  const u = URL.createObjectURL(f); const i = new Image();
  i.onload = () => ok('photo', 'Photo depuis l’appareil', 'OK ' + i.naturalWidth + '×' + i.naturalHeight);
  i.onerror = () => ko('photo', 'Photo depuis l’appareil'); i.src = u;
});
try { localStorage.setItem('t25g', '1'); localStorage.getItem('t25g') === '1' ? ok('stock', 'Mémoire locale') : ko('stock', 'Mémoire locale'); } catch (e) { ko('stock', 'Mémoire locale', 'indisponible'); }
