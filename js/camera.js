import { FilesetResolver, HandLandmarker, ImageSegmenter } from "../vendor/mediapipe/vision_bundle.mjs";

const URL_MAINS = "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";
const URL_SEG = "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite";

const $ = (id) => document.getElementById(id);
const ecran = $("ecran"), ctx = ecran.getContext("2d", { willReadFrequently: true });
const L = ecran.width, H = ecran.height;
const msg = $("message"), etat = $("etat");

// Réglages (valeurs figées plus tard dans le site)
const R = {
  effet: "bw", zone: "plein", main: false, silhouette: false, inverser: false,
  contraste: 1.6, luminosite: 0, grain: 0.15, seuil: 0.5, niveaux: 3, pas: 10, rayon: 0.8,
  c1: "#111111", c2: "#e2001a", c3: "#f4f1ea", c4: "#ffffff", fond: "#e2001a"
};
const CURSEURS = [
  ["contraste", "Contraste", 0.5, 3, 0.05],
  ["luminosite", "Luminosité", -0.5, 0.5, 0.01],
  ["grain", "Grain", 0, 0.6, 0.01],
  ["seuil", "Seuil", 0, 1, 0.01],
  ["niveaux", "Niveaux", 2, 4, 1],
  ["pas", "Pas de trame", 4, 30, 1],
  ["rayon", "Taille points", 0.2, 1.2, 0.05]
];
const COULEURS = [["c1", "Couleur 1"], ["c2", "Couleur 2"], ["c3", "Couleur 3"], ["c4", "Couleur 4"], ["fond", "Fond silhouette"]];

for (const [k, nom, min, max, pas] of CURSEURS) {
  const d = document.createElement("div"); d.className = "reglage";
  d.innerHTML = `<label for="r-${k}">${nom}</label><input id="r-${k}" type="range" min="${min}" max="${max}" step="${pas}" value="${R[k]}"><output id="o-${k}">${R[k]}</output>`;
  $("curseurs").append(d);
  d.querySelector("input").addEventListener("input", (e) => { R[k] = parseFloat(e.target.value); $("o-" + k).textContent = R[k]; maj(); });
}
for (const [k, nom] of COULEURS) {
  const d = document.createElement("label"); d.className = "couleur";
  d.innerHTML = `${nom}<input type="color" value="${R[k]}">`;
  $("couleurs").append(d);
  d.querySelector("input").addEventListener("input", (e) => { R[k] = e.target.value; maj(); });
}
for (const k of ["effet", "zone"]) $(k).addEventListener("change", (e) => { R[k] = e.target.value; maj(); });
for (const k of ["main", "silhouette", "inverser"]) $(k).addEventListener("change", (e) => { R[k] = e.target.checked; if (k === "main") initMains(); if (k === "silhouette") initSeg(); maj(); });

function maj() { $("json").value = JSON.stringify(R, null, 2); }
maj();
$("copier").addEventListener("click", async () => {
  try { await navigator.clipboard.writeText($("json").value); etat.textContent = "Réglages copiés."; }
  catch { $("json").select(); etat.textContent = "Copie impossible : sélectionne le texte et copie à la main."; }
});

// Source : vidéo ou photo
const video = document.createElement("video"); video.playsInline = true; video.muted = true;
let source = null, miroir = true, enDirect = false;
$("demarrer").addEventListener("click", async () => {
  try {
    const flux = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 }, audio: false });
    video.srcObject = flux; await video.play();
    source = video; miroir = true; enDirect = true; msg.textContent = "";
    etat.textContent = "Caméra active.";
  } catch (e) { msg.textContent = "Caméra indisponible : " + e.name; }
});
$("photo").addEventListener("change", (e) => {
  const f = e.target.files[0]; if (!f) return;
  const img = new Image(); img.onload = () => { source = img; miroir = false; enDirect = false; msg.textContent = ""; }; img.src = URL.createObjectURL(f);
});

// MediaPipe, chargé à la demande
let vision = null, mains = null, seg = null, masque = null;
async function fileset() { return vision ||= await FilesetResolver.forVisionTasks("vendor/mediapipe/wasm"); }
async function initMains() {
  if (!R.main || mains) return;
  etat.textContent = "Chargement du suivi des mains…";
  try {
    mains = await HandLandmarker.createFromOptions(await fileset(), {
      baseOptions: { modelAssetPath: URL_MAINS }, runningMode: "VIDEO", numHands: 2
    });
    etat.textContent = "Suivi des mains prêt.";
  } catch (e) { etat.textContent = "Mains indisponibles (" + e.message + "). La souris reste active."; $("main").checked = false; R.main = false; }
}
async function initSeg() {
  if (!R.silhouette || seg) return;
  etat.textContent = "Chargement de la silhouette…";
  try {
    seg = await ImageSegmenter.createFromOptions(await fileset(), {
      baseOptions: { modelAssetPath: URL_SEG }, runningMode: "VIDEO", outputCategoryMask: true, outputConfidenceMasks: false
    });
    etat.textContent = "Silhouette prête.";
  } catch (e) { etat.textContent = "Silhouette indisponible (" + e.message + ")."; $("silhouette").checked = false; R.silhouette = false; }
}

// Cadre : doigts ou souris
let cadreMains = null, cadreSouris = null, glisse = null;
const pt = (e) => { const r = ecran.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * L, y: (e.clientY - r.top) / r.height * H }; };
ecran.addEventListener("pointerdown", (e) => { ecran.setPointerCapture(e.pointerId); glisse = pt(e); cadreSouris = null; });
ecran.addEventListener("pointermove", (e) => { if (!glisse) return; const p = pt(e); cadreSouris = rect(glisse, p); });
ecran.addEventListener("pointerup", () => { glisse = null; });
function rect(a, b) { return { x: Math.min(a.x, b.x), y: Math.min(a.y, b.y), w: Math.abs(a.x - b.x), h: Math.abs(a.y - b.y) }; }
function lisMains(t) {
  cadreMains = null;
  if (!mains || source !== video || video.readyState < 2) return;
  const r = mains.detectForVideo(video, t);
  if (!r.landmarks || r.landmarks.length < 2) return;
  const p = [];
  for (const h of r.landmarks.slice(0, 2)) for (const i of [4, 8]) p.push({ x: (miroir ? 1 - h[i].x : h[i].x) * L, y: h[i].y * H });
  const cx = p.reduce((a, q) => a + q.x, 0) / 4, cy = p.reduce((a, q) => a + q.y, 0) / 4;
  p.sort((a, b) => Math.atan2(a.y - cy, a.x - cx) - Math.atan2(b.y - cy, b.x - cx));
  const xs = p.map((q) => q.x), ys = p.map((q) => q.y);
  cadreMains = { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys), pts: p };
}

// Effets
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const bruit = () => (Math.random() - 0.5) * 2 * R.grain * 255;
function effet(img, w) {
  const d = img.data, n = d.length / 4;
  const pal = [R.c1, R.c2, R.c3, R.c4].map(hex);
  for (let i = 0; i < n; i++) {
    const o = i * 4;
    let g = (0.299 * d[o] + 0.587 * d[o + 1] + 0.114 * d[o + 2]) / 255;
    g = (g - 0.5) * R.contraste + 0.5 + R.luminosite;
    g = Math.min(1, Math.max(0, g + bruit() / 255));
    let c;
    if (R.effet === "bw") c = [g * 255, g * 255, g * 255];
    else if (R.effet === "seuil") c = g > R.seuil ? pal[2] : pal[0];
    else if (R.effet === "aplats") { const k = Math.min(R.niveaux - 1, Math.floor(g * R.niveaux)); c = pal[[0, 1, 2, 3].slice(0, R.niveaux)[k]]; }
    else c = [g * 255, g * 255, g * 255];
    d[o] = c[0]; d[o + 1] = c[1]; d[o + 2] = c[2];
  }
  if (R.effet === "trame") trame(img, w);
  return img;
}
function trame(img, w) {
  const h = img.height, pas = R.pas, src = new Uint8ClampedArray(img.data), [a, b] = [hex(R.c1), hex(R.c3)];
  for (let i = 0; i < img.data.length; i += 4) { img.data[i] = b[0]; img.data[i + 1] = b[1]; img.data[i + 2] = b[2]; }
  const c = new OffscreenCanvas(w, h), x = c.getContext("2d");
  x.fillStyle = `rgb(${b})`; x.fillRect(0, 0, w, h); x.fillStyle = `rgb(${a})`;
  for (let j = 0; j < h; j += pas) for (let i = 0; i < w; i += pas) {
    const o = (Math.min(h - 1, j + (pas >> 1)) * w + Math.min(w - 1, i + (pas >> 1))) * 4;
    const v = 1 - src[o] / 255;
    x.beginPath(); x.arc(i + pas / 2, j + pas / 2, v * pas * R.rayon * 0.7, 0, 6.283); x.fill();
  }
  img.data.set(x.getImageData(0, 0, w, h).data);
}
function appliquer(x, y, w, h) {
  x = Math.max(0, Math.round(x)); y = Math.max(0, Math.round(y));
  w = Math.min(L - x, Math.round(w)); h = Math.min(H - y, Math.round(h));
  if (w < 4 || h < 4) return;
  ctx.putImageData(effet(ctx.getImageData(x, y, w, h), w), x, y);
}

function appliquerQuad(c) {
  const x = Math.max(0, Math.round(c.x)), y = Math.max(0, Math.round(c.y));
  const w = Math.min(L - x, Math.round(c.w)), h = Math.min(H - y, Math.round(c.h));
  if (w < 4 || h < 4) return;
  const oc = new OffscreenCanvas(w, h), ox = oc.getContext("2d");
  ox.putImageData(effet(ctx.getImageData(x, y, w, h), w), 0, 0);
  ctx.save(); ctx.beginPath();
  c.pts.forEach((q, i) => i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y));
  ctx.closePath(); ctx.clip(); ctx.drawImage(oc, x, y); ctx.restore();
}

// Boucle
let derniere = -1;
function dessiner(t) {
  requestAnimationFrame(dessiner);
  if (!source) { ctx.fillStyle = "#000"; ctx.fillRect(0, 0, L, H); return; }
  const sw = source.videoWidth || source.naturalWidth, sh = source.videoHeight || source.naturalHeight;
  if (!sw) return;
  const k = Math.max(L / sw, H / sh), dw = sw * k, dh = sh * k, dx = (L - dw) / 2, dy = (H - dh) / 2;
  ctx.save(); if (miroir) { ctx.translate(L, 0); ctx.scale(-1, 1); }
  ctx.drawImage(source, dx, dy, dw, dh); ctx.restore();

  if (enDirect && t !== derniere) { derniere = t; lisMains(t); }
  if (R.silhouette && seg && enDirect && video.readyState >= 2) {
    const r = seg.segmentForVideo(video, t); masque = { d: r.categoryMask.getAsUint8Array(), w: r.categoryMask.width, h: r.categoryMask.height }; r.categoryMask.close();
  }
  const cadre = R.main && cadreMains ? cadreMains : cadreSouris;
  if (R.zone === "cadre" && cadre) {
    if (cadre.pts) appliquerQuad(cadre);
    else appliquer(cadre.x, cadre.y, cadre.w, cadre.h);
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 3;
    if (cadre.pts) { ctx.beginPath(); cadre.pts.forEach((q, i) => i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y)); ctx.closePath(); ctx.stroke(); }
    else ctx.strokeRect(cadre.x, cadre.y, cadre.w, cadre.h);
    if (cadre.pts) for (const p of cadre.pts) { ctx.fillStyle = "#e2001a"; ctx.beginPath(); ctx.arc(p.x, p.y, 7, 0, 6.283); ctx.fill(); }
  } else if (R.zone === "plein") appliquer(0, 0, L, H);

  if (R.silhouette && masque) {
    const img = ctx.getImageData(0, 0, L, H), f = hex(R.fond), d = img.data;
    for (let j = 0; j < H; j++) for (let i = 0; i < L; i++) {
      const m = masque.d[Math.floor(j / H * masque.h) * masque.w + Math.floor(i / L * masque.w)] > 0;
      if (m === R.inverser) { const o = (j * L + i) * 4; d[o] = f[0]; d[o + 1] = f[1]; d[o + 2] = f[2]; }
    }
    ctx.putImageData(img, 0, 0);
  }
}
requestAnimationFrame(dessiner);
