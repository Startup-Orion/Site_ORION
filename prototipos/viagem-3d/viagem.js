/*
 * Viagem pela constelação ORION — prova de conceito (Three.js).
 *
 * Roteiro:
 *  1. Abertura 2D (abertura-orion.js). Ao terminar, o anel do logo em 3D fica no mesmo lugar.
 *  2. Mergulho: a câmera atravessa o anel (portal) e entra no espaço.
 *  3. Hero: o título se forma de partículas e o texto real, nítido, assume no mesmo lugar;
 *     logo ORION completo em 3D (anel + nome), interativo.
 *  4. Rolagem = viagem: o título se desfaz em poeira estelar, a câmera salta (estrelas esticam)
 *     e as partículas formam o título de "Sobre".
 *
 * O logo 3D segue o próprio estilo do PNG oficial: peças planas com extrusão escura
 * (frente nas cores exatas, sem efeito de luz; lateral azul-escura e cinza, como no PNG).
 *
 * Plano B: sem WebGL, abre o site atual. "Reduzir movimento": sem mergulho, sem rastros.
 */
import * as THREE from "three";

const raiz = document.documentElement;
const reduzido = matchMedia("(prefers-reduced-motion: reduce)").matches;
const celular = matchMedia("(max-width: 700px)").matches || matchMedia("(pointer: coarse)").matches;
const RAD = Math.PI / 180;
const COR = {
  azul: new THREE.Color("#37B5FF"),
  branco: new THREE.Color("#FFFFFF"),
  azulLado: new THREE.Color("#16486B"), // extrusão azul do PNG oficial
  brancoLado: new THREE.Color("#686868"), // extrusão cinza do PNG oficial
};

// ---------- Plano B: sem WebGL ----------
function temWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch (e) {
    return false;
  }
}
if (!temWebGL()) {
  document.getElementById("sem-3d").hidden = false;
  setTimeout(() => location.replace("../site-orion/"), 1500);
  throw new Error("Sem WebGL");
}

// ---------- Renderizador, cena e câmera ----------
const canvas = document.getElementById("cena");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(devicePixelRatio, celular ? 1.75 : 2));
renderer.setSize(innerWidth, innerHeight, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NoToneMapping; // preserva as cores do logo

const cena = new THREE.Scene();
cena.background = new THREE.Color("#070b15");
const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 400);

// Luz só para as laterais (extrusão) do logo; a frente não sofre efeito de luz.
cena.add(new THREE.HemisphereLight("#bcd9ff", "#070b15", 1.1));
const luzChave = new THREE.DirectionalLight("#ffffff", 1.4);
luzChave.position.set(-3, 5, 6);
cena.add(luzChave);

// ---------- Logo ORION em 3D (medidas do PNG oficial, em pixels) ----------
const CENTRO_PNG = { x: 384, y: 337.3 };
const UNIDADE = 115; // raio da linha central do anel = 1 unidade
const px = (x, y) => new THREE.Vector2((x - CENTRO_PNG.x) / UNIDADE, -(y - CENTRO_PNG.y) / UNIDADE);

function retanguloArredondado(caminho, x0, y0, x1, y1, r) {
  const a = px(x0, y0), b = px(x1, y1);
  const rr = r / UNIDADE;
  const esq = a.x, dir = b.x, topo = a.y, base = b.y;
  caminho.moveTo(esq + rr, topo);
  caminho.lineTo(dir - rr, topo);
  caminho.quadraticCurveTo(dir, topo, dir, topo - rr);
  caminho.lineTo(dir, base + rr);
  caminho.quadraticCurveTo(dir, base, dir - rr, base);
  caminho.lineTo(esq + rr, base);
  caminho.quadraticCurveTo(esq, base, esq, base + rr);
  caminho.lineTo(esq, topo - rr);
  caminho.quadraticCurveTo(esq, topo, esq + rr, topo);
  return caminho;
}
function poligono(pontos) {
  const s = new THREE.Shape();
  pontos.forEach((p, i) => {
    if (p.q) s.quadraticCurveTo(...p.q);
    else if (i === 0) s.moveTo(p.x, p.y);
    else s.lineTo(p.x, p.y);
  });
  return s;
}
function pt(x, y) {
  const v = px(x, y);
  return { x: v.x, y: v.y };
}
function curva(cx, cy, x, y) {
  const c = px(cx, cy), f = px(x, y);
  return { q: [c.x, c.y, f.x, f.y] };
}
function faixaDeArco(a0, a1, rIn, rOut) {
  const s = new THREE.Shape();
  s.absarc(0, 0, rOut, a0 * RAD, a1 * RAD, false);
  s.absarc(0, 0, rIn, a1 * RAD, a0 * RAD, true);
  return s;
}
function circulo(cx, cy, r) {
  const c = px(cx, cy);
  const s = new THREE.Shape();
  s.absarc(c.x, c.y, r / UNIDADE, 0, Math.PI * 2, false);
  return s;
}
function estrelaQuatroPontas(cx, cy, r) {
  const c = px(cx, cy);
  const k = r / UNIDADE;
  const s = new THREE.Shape();
  const P = [[0, 1], [1, 0], [0, -1], [-1, 0]];
  s.moveTo(c.x, c.y + k);
  for (let i = 1; i <= 4; i++) {
    const [x, y] = P[i % 4];
    s.quadraticCurveTo(c.x, c.y, c.x + x * k, c.y + y * k);
  }
  return s;
}

const extrusao = (prof) => ({
  depth: prof,
  bevelEnabled: true,
  bevelThickness: 0.012,
  bevelSize: 0.008,
  bevelSegments: 2,
  curveSegments: 48,
});
function peca(formas, cor, corLado, prof, z = 0) {
  const geo = new THREE.ExtrudeGeometry(formas, extrusao(prof));
  // grupo 0 = frente/trás (cor exata, sem luz); grupo 1 = laterais (extrusão escura, com luz)
  const m = new THREE.Mesh(geo, [
    new THREE.MeshBasicMaterial({ color: cor }),
    new THREE.MeshStandardMaterial({ color: corLado, roughness: 0.55, metalness: 0.1 }),
  ]);
  m.position.z = z;
  return m;
}

function criarLogo({ comNome }) {
  const conteudo = new THREE.Group();
  const rIn = 95.2 / UNIDADE, rOut = 134.6 / UNIDADE;
  // anel: arco azul (−63° a 121°) e branco (121° a 297°), como no PNG
  conteudo.add(peca(faixaDeArco(-63, 121, rIn, rOut), COR.azul, COR.azulLado, 0.24));
  conteudo.add(peca(faixaDeArco(121, 297, rIn, rOut), COR.branco, COR.brancoLado, 0.24));
  // esferas por cima das pontas dos arcos
  conteudo.add(peca(circulo(327.4, 243.7, 39.5), COR.azul, COR.azulLado, 0.24, 0.02));
  conteudo.add(peca(circulo(434.1, 435.9, 36.5), COR.branco, COR.brancoLado, 0.24, 0.02));

  if (comNome) {
    const O = (x0, x1) => {
      const s = retanguloArredondado(new THREE.Shape(), x0, 510, x1, 678, 24);
      s.holes.push(retanguloArredondado(new THREE.Path(), x0 + 33, 532, x1 - 34, 655, 7));
      return s;
    };
    const R = poligono([pt(233, 513), pt(313, 513), curva(325, 513, 325, 525), pt(325, 675), pt(290, 675), pt(290, 608), pt(266, 608), pt(266, 675), pt(233, 675), pt(233, 513)]);
    R.holes.push(retanguloArredondado(new THREE.Path(), 266, 535, 292, 585, 2));
    const I = retanguloArredondado(new THREE.Shape(), 385, 513, 420, 675, 1);
    const N = poligono([pt(641, 675), pt(641, 529), curva(641, 510, 660, 510), pt(714, 510), curva(733, 510, 733, 529), pt(733, 675), pt(700, 675), pt(700, 534), pt(675, 534), pt(675, 675), pt(641, 675)]);
    conteudo.add(peca([O(75, 170), R, I], COR.branco, COR.brancoLado, 0.16));
    conteudo.add(peca([O(483, 578), N], COR.azul, COR.azulLado, 0.16));
    // fio horizontal com a estrela de 4 pontas
    const fio = retanguloArredondado(new THREE.Shape(), 108, 590.9, 739, 592.1, 0.5);
    conteudo.add(peca([fio, estrelaQuatroPontas(748, 591.5, 10)], new THREE.Color("#5ec4ff"), COR.azulLado, 0.02, 0.17));
    // centraliza o conjunto (anel + nome) no eixo de rotação
    const c = px(416, 440.5);
    conteudo.position.set(-c.x, -c.y, 0);
  }
  const g = new THREE.Group();
  g.add(conteudo);
  return g;
}

const portal = criarLogo({ comNome: false }); // anel que a câmera atravessa
portal.scale.setScalar(2.3);
cena.add(portal);

const logo = criarLogo({ comNome: true }); // logo completo do hero
cena.add(logo);

// ---------- Céu: estrelas com degradê suave (sem quadradinhos) ----------
function criarCeu(total) {
  const pos = new Float32Array(total * 3);
  const tam = new Float32Array(total);
  const fase = new Float32Array(total);
  const cor = new Float32Array(total * 3);
  const paleta = [COR.branco, COR.branco, COR.branco, COR.azul, new THREE.Color("#bfe4ff")];
  for (let i = 0; i < total; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 140;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 90;
    pos[i * 3 + 2] = 40 - Math.random() * 190;
    const r = Math.random();
    tam[i] = 0.7 + r * r * r * 2.6;
    fase[i] = Math.random() * 6.283;
    const c = paleta[Math.floor(Math.random() * paleta.length)];
    cor.set([c.r, c.g, c.b], i * 3);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aTam", new THREE.BufferAttribute(tam, 1));
  geo.setAttribute("aFase", new THREE.BufferAttribute(fase, 1));
  geo.setAttribute("aCor", new THREE.BufferAttribute(cor, 3));
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uTempo: { value: 0 }, uPx: { value: renderer.getPixelRatio() } },
    vertexShader: /* glsl */ `
      attribute float aTam; attribute float aFase; attribute vec3 aCor;
      uniform float uTempo; uniform float uPx;
      varying float vBrilho; varying vec3 vCor; varying float vGrande;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mv;
        vBrilho = 0.6 + 0.4 * sin(uTempo * (0.6 + aFase * 0.3) + aFase * 3.0);
        vCor = aCor;
        vGrande = step(2.3, aTam);
        float base = aTam * (30.0 / -mv.z);
        // tamanho mínimo de 3 px: evita estrelas serrilhadas; as grandes ganham espaço para os raios
        gl_PointSize = max(3.0, base * mix(3.0, 9.0, vGrande)) * uPx;
        // estrelas muito pequenas compensam com menos brilho
        vBrilho *= clamp(base / 1.2, 0.35, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      varying float vBrilho; varying vec3 vCor; varying float vGrande;
      void main() {
        vec2 p = gl_PointCoord - 0.5;
        float d2 = dot(p, p);
        float a;
        if (vGrande > 0.5) {
          float nucleo = exp(-d2 * 260.0);
          float halo = exp(-d2 * 40.0) * 0.28;
          float raios = exp(-abs(p.y) * 90.0) * (1.0 - smoothstep(0.0, 0.5, abs(p.x)))
                      + exp(-abs(p.x) * 90.0) * (1.0 - smoothstep(0.0, 0.5, abs(p.y)));
          a = nucleo + halo + raios * 0.55;
        } else {
          a = exp(-d2 * 30.0);
        }
        gl_FragColor = vec4(vCor, a * vBrilho);
      }`,
  });
  return new THREE.Points(geo, mat);
}
const ceu = criarCeu(celular ? 3500 : 7000);
cena.add(ceu);

// ---------- Rastros de velocidade (presos à câmera) ----------
function criarRastros(total) {
  const pos = new Float32Array(total * 6);
  const ponta = new Float32Array(total * 2);
  for (let i = 0; i < total; i++) {
    const ang = Math.random() * 6.283;
    const r = 2.5 + Math.random() * 22;
    const x = Math.cos(ang) * r;
    const y = Math.sin(ang) * r * 0.7;
    const z = -Math.random() * 90;
    pos.set([x, y, z, x, y, z], i * 6);
    ponta[i * 2] = 0;
    ponta[i * 2 + 1] = 1;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aPonta", new THREE.BufferAttribute(ponta, 1));
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uEstica: { value: 0 }, uAlfa: { value: 0 }, uAvanco: { value: 0 } },
    vertexShader: /* glsl */ `
      attribute float aPonta; uniform float uEstica; uniform float uAvanco;
      varying float vPonta;
      void main() {
        vec3 p = position;
        p.z = mod(p.z + uAvanco, 90.0) - 92.0;
        p.z -= aPonta * uEstica;
        vPonta = aPonta;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform float uAlfa; varying float vPonta;
      void main() { gl_FragColor = vec4(0.78, 0.92, 1.0, uAlfa * (1.0 - vPonta)); }`,
  });
  return new THREE.LineSegments(geo, mat);
}
const rastros = criarRastros(celular ? 260 : 520);
camera.add(rastros);
cena.add(camera);

// ---------- Texto em partículas ----------
const FONTE_PX = 120;
const ENTRELINHA = 1.06;
async function pontosDoTexto(linhas, larguraMundo) {
  try {
    await document.fonts.load(`600 ${FONTE_PX}px "Space Grotesk"`);
  } catch (e) {
    /* fonte reserva */
  }
  const lh = FONTE_PX * ENTRELINHA;
  const c = document.createElement("canvas");
  const ctx = c.getContext("2d");
  const fonte = `600 ${FONTE_PX}px "Space Grotesk", system-ui, sans-serif`;
  ctx.font = fonte;
  const w = Math.ceil(Math.max(...linhas.map((l) => ctx.measureText(l).width)));
  const h = Math.ceil(lh * linhas.length + 8);
  c.width = w;
  c.height = h;
  ctx.font = fonte;
  ctx.fillStyle = "#fff";
  ctx.textBaseline = "top";
  linhas.forEach((l, i) => ctx.fillText(l, 0, i * lh + (lh - FONTE_PX) / 2));
  const dados = ctx.getImageData(0, 0, w, h).data;
  const escala = larguraMundo / w;
  const pts = [];
  for (let y = 0; y < h; y += 2) {
    for (let x = 0; x < w; x += 2) {
      if (dados[(y * w + x) * 4 + 3] > 130) pts.push([(x + Math.random()) * escala, -(y + Math.random()) * escala]);
    }
  }
  return { pts, largura: w * escala, altura: h * escala, larguraPx: w };
}

const TEXTO_A = ["Transformamos ideias", "em soluções que", "fazem a diferença."];
const TEXTO_B = ["Mais do que tecnologia.", "Ideias que ganham vida."];
let particulas = null;
const uniformesParticulas = {
  uProg: { value: -0.5 },
  uTempo: { value: 0 },
  uPx: { value: renderer.getPixelRatio() * 1.35 },
  uOpacidade: { value: 1 },
};

// ---------- Roteiro espacial ----------
const H = new THREE.Vector3(0, 0, -14);
const ALVO_H = new THREE.Vector3(0, 0, -24);
const S = new THREE.Vector3(7, -2.5, -64);
const ALVO_S = new THREE.Vector3(7, -2.5, -74);
const caminho = new THREE.CatmullRomCurve3([H, new THREE.Vector3(3.5, 2.6, -30), new THREE.Vector3(8.5, 0.6, -48), S]);

// Tamanho do logo completo (anel + nome), em unidades
const LOGO_LARG = (757 - 75) / UNIDADE;
const LOGO_ALT = (678 - 203) / UNIDADE;

let disposicao = null;
function calcularDisposicao() {
  const aspecto = innerWidth / innerHeight;
  const meiaAltura = Math.tan(25 * RAD) * 10; // a 10 unidades, fov 50
  const meiaLargura = meiaAltura * aspecto;
  if (aspecto >= 1) {
    const W = Math.min(5.6, meiaLargura * 0.95);
    const escala = Math.min((meiaLargura * 0.66) / LOGO_LARG, (meiaAltura * 1.15) / LOGO_ALT);
    return {
      larguraA: W,
      topoA: new THREE.Vector3(-meiaLargura * 0.86, meiaAltura * 0.5, ALVO_H.z),
      logo: new THREE.Vector3(meiaLargura * 0.44, -0.1, ALVO_H.z),
      escalaLogo: escala,
      larguraB: W,
      topoB: new THREE.Vector3(ALVO_S.x - meiaLargura * 0.86, ALVO_S.y + meiaAltura * 0.55, ALVO_S.z),
      globo: new THREE.Vector3(ALVO_S.x + meiaLargura * 0.5, ALVO_S.y - 0.2, ALVO_S.z),
      escalaGlobo: 1,
    };
  }
  const W = meiaLargura * 2 * 0.86;
  const escala = Math.min((W * 0.72) / LOGO_LARG, (meiaAltura * 0.62) / LOGO_ALT);
  return {
    larguraA: W,
    topoA: new THREE.Vector3(-W / 2, meiaAltura * 0.72, ALVO_H.z),
    logo: new THREE.Vector3(0, -meiaAltura * 0.56, ALVO_H.z),
    escalaLogo: escala,
    larguraB: W,
    topoB: new THREE.Vector3(ALVO_S.x - W / 2, ALVO_S.y + meiaAltura * 0.78, ALVO_S.z),
    globo: new THREE.Vector3(ALVO_S.x, ALVO_S.y - meiaAltura * 0.1, ALVO_S.z - 2),
    escalaGlobo: 1.7,
  };
}

let infoA = null;
let infoB = null;
async function montarParticulas() {
  disposicao = calcularDisposicao();
  const [a, b] = await Promise.all([pontosDoTexto(TEXTO_A, disposicao.larguraA), pontosDoTexto(TEXTO_B, disposicao.larguraB)]);
  infoA = a;
  infoB = b;
  const total = Math.max(a.pts.length, b.pts.length);
  const pa = new Float32Array(total * 3);
  const pb = new Float32Array(total * 3);
  const pd = new Float32Array(total * 3);
  const rnd = new Float32Array(total);
  const meio = caminho.getPoint(0.5);
  for (let i = 0; i < total; i++) {
    const qa = a.pts[i < a.pts.length ? i : Math.floor(Math.random() * a.pts.length)];
    const qb = b.pts[i < b.pts.length ? i : Math.floor(Math.random() * b.pts.length)];
    pa.set([disposicao.topoA.x + qa[0], disposicao.topoA.y + qa[1], disposicao.topoA.z], i * 3);
    pb.set([disposicao.topoB.x + qb[0], disposicao.topoB.y + qb[1], disposicao.topoB.z], i * 3);
    const ang = Math.random() * 6.283;
    const r = 3 + Math.pow(Math.random(), 0.6) * 16;
    pd.set([meio.x + Math.cos(ang) * r, meio.y + Math.sin(ang) * r * 0.75, meio.z + (Math.random() - 0.5) * 40], i * 3);
    rnd[i] = Math.random();
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pa, 3));
  geo.setAttribute("aA", new THREE.BufferAttribute(pa, 3));
  geo.setAttribute("aB", new THREE.BufferAttribute(pb, 3));
  geo.setAttribute("aD", new THREE.BufferAttribute(pd, 3));
  geo.setAttribute("aR", new THREE.BufferAttribute(rnd, 1));
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: uniformesParticulas,
    vertexShader: /* glsl */ `
      attribute vec3 aA; attribute vec3 aB; attribute vec3 aD; attribute float aR;
      uniform float uProg; uniform float uTempo; uniform float uPx;
      varying float vAlfa; varying float vSolto;
      float suave(float t) { return t < 0.5 ? 4.0*t*t*t : 1.0 - pow(-2.0*t + 2.0, 3.0) / 2.0; }
      void main() {
        vec3 p; float solto;
        if (uProg < 0.0) {
          float t = clamp(((uProg + 0.5) / 0.5) * 1.35 - aR * 0.35, 0.0, 1.0);
          p = mix(aD, aA, suave(t)); solto = 1.0 - t;
        } else if (uProg < 0.5) {
          float t = clamp((uProg / 0.5) * 1.35 - aR * 0.35, 0.0, 1.0);
          p = mix(aA, aD, suave(t)); solto = t;
        } else {
          float t = clamp(((uProg - 0.5) / 0.5) * 1.35 - aR * 0.35, 0.0, 1.0);
          p = mix(aD, aB, suave(t)); solto = 1.0 - t;
        }
        p.x += sin(uTempo * 0.9 + aR * 50.0) * 0.35 * solto;
        p.y += cos(uTempo * 0.8 + aR * 40.0) * 0.35 * solto;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = min(uPx * (10.0 / -mv.z) * (1.0 + solto * 0.35), uPx * 2.4);
        float perto = smoothstep(0.8, 5.0, -mv.z);
        vAlfa = (0.85 + 0.15 * sin(uTempo * 2.2 + aR * 30.0)) * mix(1.0, perto * 0.55, solto);
        vSolto = solto;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uOpacidade;
      varying float vAlfa; varying float vSolto;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float a = (1.0 - smoothstep(0.3, 0.5, d)) * vAlfa;
        vec3 cor = mix(vec3(0.95, 0.98, 1.0), vec3(0.5, 0.8, 1.0), vSolto * 0.8);
        // quando o texto nítido assume, sobra só um leve cintilar
        gl_FragColor = vec4(cor, a * mix(uOpacidade, 1.0, vSolto));
      }`,
  });
  if (particulas) {
    cena.remove(particulas);
    particulas.geometry.dispose();
  }
  particulas = new THREE.Points(geo, mat);
  particulas.frustumCulled = false;
  cena.add(particulas);

  logo.position.copy(disposicao.logo);
  logo.scale.setScalar(disposicao.escalaLogo);
  requestAnimationFrame(ajustarLogoRetrato);
  globo.position.copy(disposicao.globo);
  globo.scale.setScalar(disposicao.escalaGlobo);
}

// ---------- Globo-constelação de "Sobre" ----------
const globo = (() => {
  const g = new THREE.Group();
  const n = 70;
  const pts = [];
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const th = i * 2.39996;
    pts.push(new THREE.Vector3(Math.cos(th) * r, y, Math.sin(th) * r).multiplyScalar(1.6));
  }
  const seg = [];
  pts.forEach((a, i) => {
    pts.forEach((b, j) => {
      if (j > i && a.distanceTo(b) < 0.62) seg.push(a.x, a.y, a.z, b.x, b.y, b.z);
    });
  });
  g.add(
    new THREE.LineSegments(
      new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(seg, 3)),
      new THREE.LineBasicMaterial({ color: COR.azul, transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending, depthWrite: false })
    )
  );
  const nos = criarCeuNos(pts);
  g.add(nos);
  cena.add(g);
  return g;
})();
function criarCeuNos(pts) {
  const geo = new THREE.BufferGeometry().setFromPoints(pts);
  return new THREE.Points(
    geo,
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uPx: { value: renderer.getPixelRatio() } },
      vertexShader: "uniform float uPx; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.0); gl_Position = projectionMatrix*mv; gl_PointSize = uPx * (110.0 / -mv.z); }",
      fragmentShader: "void main(){ vec2 p = gl_PointCoord-0.5; float d2 = dot(p,p); gl_FragColor = vec4(0.9,0.97,1.0, exp(-d2*120.0) + exp(-d2*22.0)*0.35); }",
    })
  );
}

// ---------- Interação: mouse, inclinação, arrastar o logo ----------
const ponteiro = { x: 0, y: 0, sx: 0, sy: 0 };
addEventListener(
  "pointermove",
  (e) => {
    ponteiro.x = (e.clientX / innerWidth) * 2 - 1;
    ponteiro.y = -((e.clientY / innerHeight) * 2 - 1);
  },
  { passive: true }
);
addEventListener("deviceorientation", (e) => {
  if (e.gamma == null) return;
  ponteiro.x = Math.max(-1, Math.min(1, e.gamma / 30));
  ponteiro.y = Math.max(-1, Math.min(1, -(e.beta - 45) / 30));
});
let giroArraste = 0;
let velArraste = 0;
let arrastando = null;
canvas.addEventListener("pointerdown", (e) => {
  arrastando = e.clientX;
});
addEventListener("pointerup", () => {
  arrastando = null;
});
addEventListener("pointermove", (e) => {
  if (arrastando == null) return;
  velArraste = (e.clientX - arrastando) * 0.006;
  arrastando = e.clientX;
});

// ---------- Rolagem suave (inércia) ----------
const etapaHero = document.querySelector(".etapa--hero");
const etapaSalto = document.querySelector(".etapa--salto");
const etapaFim = document.querySelector(".etapa--fim");
let progAlvo = 0;
let prog = 0;
function lerRolagem() {
  const fim = etapaHero.offsetHeight + etapaSalto.offsetHeight;
  progAlvo = Math.min(1, Math.max(0, scrollY / fim));
}
addEventListener("scroll", lerRolagem, { passive: true });

// ---------- Camadas HTML ancoradas na cena ----------
const camadaHero = document.getElementById("camada-hero");
const camadaSobre = document.getElementById("camada-sobre");
const tituloA = document.getElementById("titulo-a");
const tituloB = document.getElementById("titulo-b");
const dica = document.getElementById("dica-rolar");
const v = new THREE.Vector3();
// câmera "de referência" parada na posição do hero, para medir o layout sem depender da animação
const cameraLayout = camera.clone();
function paraTela(x, y, z, cam = camera) {
  v.set(x, y, z).project(cam);
  return { x: (v.x * 0.5 + 0.5) * innerWidth, y: (-v.y * 0.5 + 0.5) * innerHeight };
}
function mostrar(el, sim) {
  el.classList.toggle("visivel", sim);
  if (sim) el.removeAttribute("inert");
  else el.setAttribute("inert", "");
}
// O texto real é desenhado exatamente sobre as partículas (mesma fonte, mesmo tamanho na tela).
function ancorarTitulo(el, topo, info) {
  const a = paraTela(topo.x, topo.y, topo.z);
  const b = paraTela(topo.x + info.largura, topo.y, topo.z);
  const fs = (FONTE_PX * (b.x - a.x)) / info.larguraPx;
  el.style.setProperty("--x", a.x + "px");
  el.style.setProperty("--y", a.y + "px");
  el.style.setProperty("--fs", fs + "px");
}
function ancorarCamadas() {
  if (!disposicao || !infoA) return;
  const margem = Math.max(20, Math.min(56, innerWidth * 0.05));
  ancorarTitulo(tituloA, disposicao.topoA, infoA);
  ancorarTitulo(tituloB, disposicao.topoB, infoB);
  const tA = disposicao.topoA;
  const baseA = paraTela(tA.x, tA.y - infoA.altura, tA.z);
  const ladoA = paraTela(tA.x + infoA.largura, tA.y, tA.z);
  camadaHero.style.setProperty("--x", Math.max(margem, baseA.x) + "px");
  camadaHero.style.setProperty("--y", baseA.y + 14 + "px");
  camadaHero.style.setProperty("--w", Math.min(innerWidth - 2 * margem, Math.max(320, ladoA.x - baseA.x)) + "px");
  const tB = disposicao.topoB;
  const baseB = paraTela(tB.x, tB.y - infoB.altura, tB.z);
  const ladoB = paraTela(tB.x + infoB.largura, tB.y, tB.z);
  camadaSobre.style.setProperty("--x", Math.max(margem, baseB.x) + "px");
  camadaSobre.style.setProperty("--y", baseB.y + 20 + "px");
  camadaSobre.style.setProperty("--w", Math.min(innerWidth - 2 * margem, Math.max(320, ladoB.x - baseB.x) * 0.92) + "px");
}

// Celular: mede onde o texto e os botões do hero terminam (como serão vistos da posição do hero)
// e coloca o logo inteiro no espaço livre abaixo deles.
function ajustarLogoRetrato() {
  if (!disposicao || !infoA || innerWidth / innerHeight >= 1) return;
  cameraLayout.aspect = innerWidth / innerHeight;
  cameraLayout.fov = 50;
  cameraLayout.position.copy(H);
  cameraLayout.lookAt(ALVO_H);
  cameraLayout.updateProjectionMatrix();
  cameraLayout.updateMatrixWorld();
  const tA = disposicao.topoA;
  const baseA = paraTela(tA.x, tA.y - infoA.altura, tA.z, cameraLayout);
  const ladoA = paraTela(tA.x + infoA.largura, tA.y, tA.z, cameraLayout);
  const margem = Math.max(20, Math.min(56, innerWidth * 0.05));
  camadaHero.style.setProperty("--w", Math.min(innerWidth - 2 * margem, Math.max(320, ladoA.x - baseA.x)) + "px");
  const fimTexto = baseA.y + 14 + camadaHero.offsetHeight + 18;
  const fimTela = innerHeight - 20;
  const livre = Math.max(80, fimTela - fimTexto);
  const meiaAltura = Math.tan(25 * RAD) * 10;
  const unidadesPorPx = (2 * meiaAltura) / innerHeight;
  const escala = Math.min((disposicao.larguraA * 0.8) / LOGO_LARG, (livre * unidadesPorPx * 0.86) / LOGO_ALT);
  const centroPx = fimTexto + livre / 2;
  disposicao.logo.y = (0.5 - centroPx / innerHeight) * 2 * meiaAltura;
  disposicao.escalaLogo = escala;
  logo.position.copy(disposicao.logo);
  logo.scale.setScalar(escala);
}

// ---------- Mergulho pelo portal ----------
let fase = "abertura";
let tituloFormado = false;
let inicioMergulho = 0;
const DURACAO_MERGULHO = reduzido ? 1 : 2900;
const P0 = new THREE.Vector3();
const ALVO0 = new THREE.Vector3();
let caminhoMergulho = null;
let alvoMergulho = null;

// Câmera posicionada para o anel 3D ficar do mesmo tamanho e no mesmo lugar do anel da abertura 2D.
function posicionarPortal() {
  const largSvg = Math.min(innerWidth * 0.86, 720);
  const altSvg = (largSvg * 520) / 780;
  const anelPx = (largSvg * 269) / 780;
  const centroPx = (innerHeight - altSvg) / 2 + ((337.3 - 180) / 520) * altSvg;
  const tg = Math.tan(25 * RAD);
  const diametro = 2 * (134.6 / UNIDADE) * portal.scale.x;
  const d = (diametro * innerHeight) / (2 * tg * anelPx);
  const desloc = ((centroPx - innerHeight / 2) * (2 * d * tg)) / innerHeight;
  P0.set(0, -desloc, d);
  ALVO0.set(0, -desloc, 0);
  caminhoMergulho = new THREE.CatmullRomCurve3([P0.clone(), new THREE.Vector3(0, -desloc * 0.3, d * 0.35), new THREE.Vector3(0, 0, 0.4), new THREE.Vector3(0, 0, -5), H.clone()]);
  alvoMergulho = new THREE.CatmullRomCurve3([ALVO0.clone(), new THREE.Vector3(0, 0, -2), new THREE.Vector3(0, 0, -12), ALVO_H.clone()]);
}
posicionarPortal();
camera.position.copy(P0);
camera.lookAt(ALVO0);

function suave(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
function comecarMergulho() {
  if (fase !== "abertura") return;
  fase = "mergulho";
  inicioMergulho = performance.now();
}
function terminarMergulho() {
  fase = "viagem";
  ajustarLogoRetrato();
  raiz.classList.remove("travado");
  raiz.classList.add("pronto");
  lerRolagem();
  const t0 = performance.now();
  (function formar(agora) {
    const k = Math.min(1, (agora - t0) / (reduzido ? 1 : 1800));
    uniformesParticulas.uProg.value = -0.5 + 0.5 * k;
    if (k < 1) requestAnimationFrame(formar);
    else tituloFormado = true;
  })(t0);
}

// ---------- Laço de animação ----------
const relogio = new THREE.Clock();
const ultimaPos = new THREE.Vector3();
const alvoAtual = new THREE.Vector3();
let avanco = 0;
let visivelAba = true;
document.addEventListener("visibilitychange", () => {
  visivelAba = !document.hidden;
  if (visivelAba) requestAnimationFrame(quadro);
});

// inclinação de repouso: mostra a extrusão para a direita e para baixo, como no PNG oficial
const INCL_Y = -0.14;
const INCL_X = -0.1;

function quadro() {
  if (!visivelAba) return;
  const dt = Math.min(relogio.getDelta(), 0.05);
  const t = relogio.elapsedTime;
  ceu.material.uniforms.uTempo.value = t;
  uniformesParticulas.uTempo.value = t;
  ponteiro.sx += (ponteiro.x - ponteiro.sx) * 0.05;
  ponteiro.sy += (ponteiro.y - ponteiro.sy) * 0.05;

  if (fase === "abertura") {
    camera.position.copy(P0);
    camera.lookAt(ALVO0);
  } else if (fase === "mergulho") {
    const k = Math.min(1, (performance.now() - inicioMergulho) / DURACAO_MERGULHO);
    const e = suave(k);
    camera.position.copy(caminhoMergulho.getPoint(e));
    alvoAtual.copy(alvoMergulho.getPoint(Math.min(1, e * 1.15)));
    camera.lookAt(alvoAtual);
    const passou = THREE.MathUtils.smoothstep(e, 0.44, 0.6) * (1 - THREE.MathUtils.smoothstep(e, 0.78, 1));
    camera.rotation.z += passou * 0.3;
    camera.fov = 50 + passou * 26;
    camera.updateProjectionMatrix();
    if (k >= 1) {
      camera.fov = 50;
      camera.updateProjectionMatrix();
      terminarMergulho();
    }
  } else {
    prog += (progAlvo - prog) * (reduzido ? 1 : 0.075);
    const e = suave(prog);
    camera.position.copy(caminho.getPoint(e));
    alvoAtual.lerpVectors(ALVO_H, ALVO_S, suave(Math.min(1, Math.max(0, (prog - 0.1) / 0.8))));
    camera.position.x += ponteiro.sx * 0.3;
    camera.position.y += ponteiro.sy * 0.18;
    camera.lookAt(alvoAtual);
    if (tituloFormado) uniformesParticulas.uProg.value = prog;

    // texto nítido assume quando o título está parado; partículas assumem durante a viagem
    const nitidoA = tituloFormado && prog < 0.012;
    const nitidoB = prog > 0.975;
    tituloA.classList.toggle("visivel", nitidoA);
    const noFim = scrollY + innerHeight * 0.55 > etapaFim.offsetTop;
    tituloB.classList.toggle("visivel", nitidoB && !noFim);
    const alvoOp = nitidoA || nitidoB ? 0.0 : 1;
    uniformesParticulas.uOpacidade.value += (alvoOp - uniformesParticulas.uOpacidade.value) * 0.12;

    mostrar(camadaHero, prog < 0.08);
    mostrar(camadaSobre, prog > 0.93 && !noFim);
    particulas.visible = !noFim;
    dica.classList.toggle("visivel", prog < 0.03);
    ancorarCamadas();
  }

  // velocidade da câmera -> rastros
  const vel = camera.position.distanceTo(ultimaPos) / Math.max(dt, 0.001);
  ultimaPos.copy(camera.position);
  const intensidade = reduzido ? 0 : Math.min(1, Math.max(0, (vel - 2) / 18));
  avanco += vel * dt;
  rastros.material.uniforms.uAvanco.value = avanco;
  rastros.material.uniforms.uEstica.value = intensidade * 7;
  rastros.material.uniforms.uAlfa.value = intensidade * 0.55;

  // portal
  portal.rotation.z = t * 0.12;
  portal.rotation.y = Math.sin(t * 0.4) * 0.12;

  // logo: de frente com leve inclinação; segue o ponteiro; arrastado, gira e volta para a frente
  if (arrastando == null) {
    velArraste *= 0.93;
    giroArraste += velArraste;
    const frente = Math.round(giroArraste / (2 * Math.PI)) * 2 * Math.PI;
    giroArraste += (frente - giroArraste) * 0.035;
  } else {
    giroArraste += velArraste;
  }
  const balanco = reduzido ? 0 : Math.sin(t * 0.5) * 0.08;
  logo.rotation.y = INCL_Y + giroArraste + ponteiro.sx * 0.22 + balanco;
  logo.rotation.x = INCL_X - ponteiro.sy * 0.16;
  logo.position.y = (disposicao ? disposicao.logo.y : 0) + (reduzido ? 0 : Math.sin(t * 0.8) * 0.06);

  globo.rotation.y = t * 0.15;
  globo.rotation.x = Math.sin(t * 0.3) * 0.2;

  renderer.render(cena, camera);
  requestAnimationFrame(quadro);
}

// ---------- Tamanho da tela ----------
let esperaTamanho;
addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight, false);
  posicionarPortal();
  clearTimeout(esperaTamanho);
  esperaTamanho = setTimeout(montarParticulas, 250);
});

// ---------- Início ----------
document.getElementById("comecar").addEventListener("click", (e) => {
  e.preventDefault();
  const fim = etapaHero.offsetHeight + etapaSalto.offsetHeight;
  scrollTo({ top: fim + 10, behavior: reduzido ? "auto" : "smooth" });
});

await montarParticulas();
requestAnimationFrame(quadro);

if (window.AberturaOrion) {
  window.AberturaOrion.iniciar({
    logo: "../abertura-orion/orion-logo.png",
    aoTerminar: comecarMergulho,
  });
} else {
  raiz.classList.remove("orion-abertura-pendente");
  comecarMergulho();
}
