// F · Malika Favre — Kama Sutra Alphabet.
// On tape une lettre : sa lettre de l'alphabet de Malika Favre s'affiche. On peut continuer : les lettres s'alignent et
// écrivent un mot (douze lettres au plus). Retour arrière efface la dernière.
//
// Les 26 lettres sont des illustrations protégées (Malika Favre est en activité) : elles ne sont PAS redessinées en code.
// L'atelier affiche les images fournies par Eliott : img/f/a.jpg … img/f/z.jpg (une par lettre, carrées de préférence).
// PROVISOIRE tant qu'elles manquent : chaque carte porte la lettre en caractère d'imprimerie et le nom du fichier attendu.
// Quand des images arrivent : les ranger dans img/f/ et écrire leurs lettres dans RECUES (par exemple 'abcdefghijklmnopqrstuvwxyz').

const RECUES = 'abcdefghijklmnopqrstuvwxyz';        // les lettres dont l'image est dans img/f/
const EXTENSION = 'jpg';
const DEPART = 'FAVRE', MAX = 12;

export default {
  lettre: 'F',
  clavier: true,
  css: `
.fv{display:grid;grid-template-columns:minmax(0,1fr) minmax(170px,230px);gap:clamp(14px,2.4cqw,36px);align-items:end;height:100cqh}
.fv-scene{height:100cqh;min-width:0;display:grid;place-items:center;container-type:size}
.fv-mot{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(0,1fr);gap:clamp(4px,1cqw,12px);width:min(100%,calc(var(--n)*78cqh));max-width:100%}
.fv-carte{aspect-ratio:1;background:#fff;color:#121a3a;display:grid;place-items:center;position:relative;overflow:hidden;box-shadow:0 22px 40px -26px rgba(0,0,0,.55);container-type:inline-size}
.fv-carte img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain}
.fv-carte b{font:900 72cqw/1 Bodoni,Didot,serif}
.fv-carte small{position:absolute;left:0;right:0;bottom:5%;text-align:center;font:500 max(8px,5.2cqw)/1 "DM Mono",monospace;opacity:.5}
.fv-carte.neuve{animation:fv-pose .22s cubic-bezier(.2,.8,.2,1)}
@keyframes fv-pose{from{transform:translateY(-7%) rotate(-3deg);opacity:0}}
.fv-cote{display:grid;gap:12px;align-content:end;padding-bottom:4px}
.fv-cote p{margin:0}
.fv-compte{font:900 clamp(40px,7cqw,76px)/.85 "Sofia Cond",Archivo,sans-serif}
.fv-champ{display:grid;gap:6px;font:600 13px/1.3 Archivo,sans-serif}
.fv-champ input{font:600 16px/1.2 Archivo,sans-serif;padding:10px 12px;border:1.5px solid currentColor;border-radius:4px;background:transparent;color:inherit;text-transform:uppercase;letter-spacing:.08em;min-width:0}
.fv-boutons{display:flex;flex-wrap:wrap;gap:8px}
@media (prefers-reduced-motion:reduce){.fv-carte.neuve{animation:none}}
@media (max-width:760px){.fv{grid-template-columns:1fr;height:auto}.fv-scene{height:auto;container-type:inline-size;min-height:50cqw}.fv-mot{width:min(100%,calc(var(--n)*70cqw))}}
`,
  monter(zone, ctx) {
    zone.innerHTML = `
      <div class="fv">
        <div class="fv-scene"><div class="fv-mot" aria-live="polite"></div></div>
        <div class="fv-cote">
          <p class="fv-compte" aria-hidden="true"></p>
          <p class="etiquette"></p>
          <label class="fv-champ">Tape une lettre, ou un mot <input type="text" maxlength="${MAX}" autocomplete="off" autocapitalize="characters" spellcheck="false" aria-label="Ton mot, douze lettres au plus"></label>
          <p class="note" data-provisoire>Version provisoire : les lettres de Malika Favre ne sont pas redessinées ici. Chaque carte montrera la vraie lettre dès qu’Eliott aura envoyé les 26 images.</p>
          <div class="fv-boutons"><button type="button" class="bouton" data-effacer>Effacer</button></div>
        </div>
      </div>`;
    const mot = zone.querySelector('.fv-mot'), compte = zone.querySelector('.fv-compte'), info = zone.querySelector('.etiquette'), champ = zone.querySelector('input');
    let texte = DEPART, intact = true, vivant = true; // intact : le mot de départ, que la première frappe remplace
    zone.querySelector('[data-provisoire]').hidden = RECUES.length >= 26;
    const propre = t => t.normalize('NFD').replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, MAX);
    const carte = (l, neuve) => RECUES.includes(l.toLowerCase())
      ? `<div class="fv-carte${neuve ? ' neuve' : ''}"><img src="${ctx.racine}img/f/${l.toLowerCase()}.${EXTENSION}" alt="${l}, Kama Sutra Alphabet de Malika Favre"></div>`
      : `<div class="fv-carte${neuve ? ' neuve' : ''}"><b>${l}</b><small>img/f/${l.toLowerCase()}.${EXTENSION}</small></div>`;
    function afficher(ancien = '') {
      mot.style.setProperty('--n', Math.max(1, texte.length));
      mot.innerHTML = [...texte].map((l, i) => carte(l, i >= ancien.length || ancien[i] !== l)).join('');
      compte.textContent = texte.length ? texte.slice(-1) : '?';
      info.textContent = !texte.length ? 'Tape une lettre.' : intact ? 'Tape une lettre : elle remplace ce mot.' : `${texte.length} lettre${texte.length > 1 ? 's' : ''}. Retour arrière : effacer la dernière.`;
      if (champ.value.toUpperCase() !== texte) champ.value = texte;
    }
    function ecrire(nouveau) { const ancien = texte; texte = propre(nouveau); intact = false; afficher(ancien); }
    champ.addEventListener('input', () => ecrire(champ.value));
    champ.addEventListener('focus', () => { if (intact) { champ.value = ''; } });
    const surTouche = e => { // au clavier, sans cliquer dans le champ
      if (e.metaKey || e.ctrlKey || e.altKey || (e.target instanceof Element && e.target.closest('input,textarea,select,[contenteditable]'))) return;
      if (/^[a-zA-Z]$/.test(e.key)) { e.preventDefault(); ecrire(intact ? e.key : (texte.length >= MAX ? texte.slice(1) : texte) + e.key); }
      else if (e.key === 'Backspace') { e.preventDefault(); ecrire(intact ? '' : texte.slice(0, -1)); }
    };
    addEventListener('keydown', surTouche);
    zone.querySelector('[data-effacer]').addEventListener('click', () => { ecrire(''); });
    afficher();
    return () => { vivant = false; removeEventListener('keydown', surTouche); };
  },
};
