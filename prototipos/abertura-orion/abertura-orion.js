/*
 * Abertura ORION — animação de apresentação do logotipo.
 *
 * Ideia: estrelas surgem, se conectam pelos traços reais do logo (anel, letras),
 * as linhas retas da constelação se curvam até virar o anel, e o logo ORIGINAL
 * (orion-logo.png, sem nenhuma alteração de cor) aparece exatamente por onde a
 * constelação passou. No fim, um brilho percorre o fio horizontal do próprio logo
 * e acende a estrela de 4 pontas.
 *
 * Sem dependências. Uso:
 *   AberturaOrion.iniciar({ logo: "/orion-logo.png", aoTerminar() { ... } });
 *
 * Todas as coordenadas abaixo estão em pixels do arquivo orion-logo.png (856 x 900),
 * medidas a partir do próprio arquivo. Assim a constelação encaixa no logo real.
 */
(function (global) {
  "use strict";

  var COR = { azul: "#37B5FF", branco: "#FFFFFF" };
  var CHAVE_SESSAO = "orion-abertura-vista";

  // ---------- Geometria do logo (medida no PNG original) ----------
  var CENTRO = { x: 384, y: 337.3 }; // centro do anel
  var RAIO = 115; // raio da linha central do anel (borda interna 95, externa 135)
  var ESFERA_AZUL = { x: 327.4, y: 243.7, r: 39.5 };
  var ESFERA_BRANCA = { x: 434.1, y: 435.9, r: 36.5 };
  var FIO = { x1: 104, x2: 742, y: 591.5 }; // fio horizontal que corta as letras
  var ESTRELA = { x: 748, y: 591.5 }; // estrela de 4 pontas no fim do fio
  // Recorte do símbolo (anel). Use o mesmo viewBox no logo do cabeçalho:
  // <svg viewBox="238 192 308 292"><image href="orion-logo.png" width="856" height="900"/></svg>
  var SIMBOLO = { x: 238, y: 192, w: 308, h: 292 };

  function noAnel(graus) {
    var a = (graus * Math.PI) / 180;
    return { x: CENTRO.x + RAIO * Math.cos(a), y: CENTRO.y + RAIO * Math.sin(a) };
  }

  // Estrelas do anel: arco azul (de -121° a 63°) e arco branco (de 63° a 239°).
  var A = {
    azul: { x: ESFERA_AZUL.x, y: ESFERA_AZUL.y },
    a1: noAnel(-60),
    a2: noAnel(0),
    branca: { x: ESFERA_BRANCA.x, y: ESFERA_BRANCA.y },
    b1: noAnel(122),
    b2: noAnel(181),
  };

  var ARCOS = [
    [A.azul, A.a1, COR.azul],
    [A.a1, A.a2, COR.azul],
    [A.a2, A.branca, COR.azul],
    [A.branca, A.b1, COR.branco],
    [A.b1, A.b2, COR.branco],
    [A.b2, A.azul, COR.branco],
  ];

  // Linha central de cada letra. "raio" = arredondamento final do canto.
  function p(x, y) {
    return { x: x, y: y };
  }
  var LETRAS = [
    { cor: COR.branco, fechado: true, inicio: 1150, raio: 16, pts: [p(91.5, 521), p(152.5, 521), p(152.5, 666), p(91.5, 666)] }, // O
    { cor: COR.branco, fechado: false, inicio: 1270, raio: 12, pts: [p(249.5, 675), p(249.5, 524), p(308.5, 524), p(308.5, 675)] }, // R
    { cor: COR.branco, fechado: false, raio: 0, inicio: 1420, pts: [p(249.5, 596.5), p(308.5, 596.5)] }, // barra do R
    { cor: COR.branco, fechado: false, inicio: 1390, raio: 0, pts: [p(402, 513), p(402, 675)] }, // I
    { cor: COR.azul, fechado: true, inicio: 1510, raio: 16, pts: [p(500, 521), p(561, 521), p(561, 666), p(500, 666)] }, // O
    { cor: COR.azul, fechado: false, inicio: 1630, raio: 14, pts: [p(658, 675), p(658, 522), p(716.5, 522), p(716.5, 675)] }, // N
  ];

  // Ligações entre o anel e as letras: só existem durante a constelação.
  var LIGACOES = [
    [A.b2, p(91.5, 521)],
    [A.branca, p(402, 513)],
    [A.a2, p(561, 521)],
  ];

  // Estrelas (pontos luminosos) da constelação.
  var ESTRELAS = [
    { x: A.azul.x, y: A.azul.y, cor: COR.azul, maior: true },
    { x: A.a1.x, y: A.a1.y, cor: COR.azul },
    { x: A.a2.x, y: A.a2.y, cor: COR.azul },
    { x: A.branca.x, y: A.branca.y, cor: COR.branco, maior: true },
    { x: A.b1.x, y: A.b1.y, cor: COR.branco },
    { x: A.b2.x, y: A.b2.y, cor: COR.branco },
  ];
  LETRAS.forEach(function (l) {
    l.pts.forEach(function (pt) {
      var repetida = ESTRELAS.some(function (e) {
        return Math.abs(e.x - pt.x) < 1 && Math.abs(e.y - pt.y) < 1;
      });
      if (!repetida) ESTRELAS.push({ x: pt.x, y: pt.y, cor: l.cor });
    });
  });

  // ---------- Utilidades ----------
  function limitar(v) {
    return v < 0 ? 0 : v > 1 ? 1 : v;
  }
  function trecho(t, inicio, duracao) {
    return limitar((t - inicio) / duracao);
  }
  function saidaCubica(x) {
    return 1 - Math.pow(1 - x, 3);
  }
  function entradaSaidaCubica(x) {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  }
  function saidaSuave(x) {
    return 1 - Math.pow(1 - x, 4);
  }
  function f(n) {
    return Math.round(n * 100) / 100;
  }

  // Gerador pseudoaleatório com semente fixa: a animação é sempre igual.
  function aleatorio(semente) {
    var s = semente >>> 0;
    return function () {
      s = (s + 0x6d2b79f5) >>> 0;
      var t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Corda reta -> arco do anel, conforme a curvatura (0 = reta, 1 = arco final).
  function caminhoArco(a, b, curvatura) {
    var k = curvatura / RAIO;
    if (k < 1e-4) return "M" + f(a.x) + " " + f(a.y) + "L" + f(b.x) + " " + f(b.y);
    var r = 1 / k;
    return "M" + f(a.x) + " " + f(a.y) + "A" + f(r) + " " + f(r) + " 0 0 1 " + f(b.x) + " " + f(b.y);
  }

  // Linha poligonal com cantos arredondados (raio 0 = cantos vivos, como constelação).
  function caminhoLetra(pts, raio, fechado) {
    var n = pts.length;
    if (n === 2) return "M" + f(pts[0].x) + " " + f(pts[0].y) + "L" + f(pts[1].x) + " " + f(pts[1].y);
    function canto(i) {
      var ant = pts[(i - 1 + n) % n];
      var v = pts[i];
      var prox = pts[(i + 1) % n];
      var d1 = Math.hypot(v.x - ant.x, v.y - ant.y);
      var d2 = Math.hypot(prox.x - v.x, prox.y - v.y);
      var r = Math.min(raio, d1 / 2, d2 / 2);
      return {
        entrada: { x: v.x + ((ant.x - v.x) / d1) * r, y: v.y + ((ant.y - v.y) / d1) * r },
        v: v,
        saida: { x: v.x + ((prox.x - v.x) / d2) * r, y: v.y + ((prox.y - v.y) / d2) * r },
      };
    }
    var d = "";
    var i, c;
    if (fechado) {
      var meio = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
      d = "M" + f(meio.x) + " " + f(meio.y);
      for (i = 1; i <= n; i++) {
        c = canto(i % n);
        d += "L" + f(c.entrada.x) + " " + f(c.entrada.y) + "Q" + f(c.v.x) + " " + f(c.v.y) + " " + f(c.saida.x) + " " + f(c.saida.y);
      }
      return d + "Z";
    }
    d = "M" + f(pts[0].x) + " " + f(pts[0].y);
    for (i = 1; i < n - 1; i++) {
      c = canto(i);
      d += "L" + f(c.entrada.x) + " " + f(c.entrada.y) + "Q" + f(c.v.x) + " " + f(c.v.y) + " " + f(c.saida.x) + " " + f(c.saida.y);
    }
    return d + "L" + f(pts[n - 1].x) + " " + f(pts[n - 1].y);
  }

  var NS = "http://www.w3.org/2000/svg";
  function el(nome, attrs, pai) {
    var e = document.createElementNS(NS, nome);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (pai) pai.appendChild(e);
    return e;
  }

  function jaFoiVista() {
    try {
      return sessionStorage.getItem(CHAVE_SESSAO) === "1";
    } catch (e) {
      return false;
    }
  }
  function marcarVista() {
    try {
      sessionStorage.setItem(CHAVE_SESSAO, "1");
    } catch (e) {
      /* navegação privada: tudo bem, só não lembra */
    }
  }

  // ---------- Céu de fundo (canvas desenhado uma única vez) ----------
  function desenharCeu(canvas) {
    var dpr = Math.min(global.devicePixelRatio || 1, 2);
    var w = canvas.clientWidth;
    var h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    var ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    var rnd = aleatorio(7);
    var total = Math.round(Math.min(90, (w * h) / 16000));
    for (var i = 0; i < total; i++) {
      var x = rnd() * w;
      var y = rnd() * h;
      var r = 0.4 + rnd() * rnd() * 1.1;
      ctx.globalAlpha = 0.12 + rnd() * 0.45;
      ctx.fillStyle = rnd() < 0.25 ? COR.azul : COR.branco;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ---------- Montagem ----------
  function iniciar(opcoes) {
    opcoes = opcoes || {};
    var raiz = document.documentElement;
    var logo = opcoes.logo || "orion-logo.png";
    var umaVez = opcoes.umaVezPorSessao !== false;
    var aoTerminar = typeof opcoes.aoTerminar === "function" ? opcoes.aoTerminar : function () {};
    var reduzido =
      opcoes.movimentoReduzido != null
        ? !!opcoes.movimentoReduzido
        : global.matchMedia && global.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (umaVez && !opcoes.forcar && jaFoiVista()) {
      raiz.classList.remove("orion-abertura-pendente");
      aoTerminar();
      return { pular: function () {}, terminado: Promise.resolve() };
    }

    var id = "oa" + Math.random().toString(36).slice(2, 7);

    var camada = document.createElement("div");
    camada.className = "orion-abertura";

    var fundo = document.createElement("div");
    fundo.className = "orion-abertura__fundo";
    camada.appendChild(fundo);

    var ceu = document.createElement("canvas");
    ceu.className = "orion-abertura__ceu";
    ceu.setAttribute("aria-hidden", "true");
    camada.appendChild(ceu);

    var palco = document.createElement("div");
    palco.className = "orion-abertura__palco";
    camada.appendChild(palco);

    var svg = el("svg", {
      class: "orion-abertura__svg",
      viewBox: "40 180 780 520",
      role: "img",
      "aria-label": "ORION",
    });
    palco.appendChild(svg);

    var defs = el("defs", {}, svg);
    [["azul", COR.azul], ["branco", COR.branco]].forEach(function (par) {
      var g = el("radialGradient", { id: id + "-halo-" + par[0] }, defs);
      el("stop", { offset: "0", "stop-color": par[1], "stop-opacity": "0.55" }, g);
      el("stop", { offset: "0.35", "stop-color": par[1], "stop-opacity": "0.16" }, g);
      el("stop", { offset: "1", "stop-color": par[1], "stop-opacity": "0" }, g);
    });
    var gBrilho = el("radialGradient", { id: id + "-brilho" }, defs);
    el("stop", { offset: "0", "stop-color": COR.azul, "stop-opacity": "0.5" }, gBrilho);
    el("stop", { offset: "1", "stop-color": COR.azul, "stop-opacity": "0" }, gBrilho);

    function halo(cor) {
      return "url(#" + id + "-halo-" + (cor === COR.azul ? "azul" : "branco") + ")";
    }

    // Brilho discreto atrás do anel (aparece só no fim).
    var brilhoFundo = el(
      "ellipse",
      { cx: CENTRO.x, cy: CENTRO.y + 8, rx: 240, ry: 210, fill: "url(#" + id + "-brilho)", opacity: "0" },
      svg
    );

    // Máscara: as linhas "engrossam" e revelam o PNG original por onde passam.
    var mascara = el("mask", { id: id + "-mascara", maskUnits: "userSpaceOnUse", x: "0", y: "0", width: "856", height: "900" }, defs);
    var mArcos = ARCOS.map(function (a) {
      return el(
        "path",
        { d: caminhoArco(a[0], a[1], 1), fill: "none", stroke: "#fff", "stroke-width": "0", "stroke-linecap": "round" },
        mascara
      );
    });
    var mEsferas = [ESFERA_AZUL, ESFERA_BRANCA].map(function (e) {
      return el("circle", { cx: e.x, cy: e.y, r: "0", fill: "#fff" }, mascara);
    });
    var mLetras = LETRAS.map(function (l) {
      return el(
        "path",
        {
          d: caminhoLetra(l.pts, l.raio, l.fechado),
          fill: "none",
          stroke: "#fff",
          "stroke-width": "0",
          "stroke-linecap": "square",
          "stroke-linejoin": "round",
        },
        mascara
      );
    });
    var mFio = el(
      "path",
      {
        d: "M" + FIO.x1 + " " + FIO.y + "L" + (ESTRELA.x + 14) + " " + FIO.y,
        fill: "none",
        stroke: "#fff",
        "stroke-width": "22",
        pathLength: "1",
        "stroke-dasharray": "1 2",
        "stroke-dashoffset": "1",
      },
      mascara
    );

    var imagem = el(
      "image",
      { href: logo, x: "0", y: "0", width: "856", height: "900", mask: "url(#" + id + "-mascara)" },
      svg
    );
    imagem.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", logo);

    // Cópia só do símbolo (mesmo recorte do logo do cabeçalho). Usada no voo até o menu:
    // o logo completo some e fica só o símbolo, pixel a pixel igual.
    var recorte = el("clipPath", { id: id + "-simbolo" }, defs);
    el("rect", { x: SIMBOLO.x, y: SIMBOLO.y, width: SIMBOLO.w, height: SIMBOLO.h }, recorte);
    var imagemSimbolo = el(
      "image",
      { href: logo, x: "0", y: "0", width: "856", height: "900", "clip-path": "url(#" + id + "-simbolo)", opacity: "0" },
      svg
    );

    // Constelação
    var gConst = el("g", { fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" }, svg);
    var gLig = el("g", {}, gConst);
    var lLig = LIGACOES.map(function (l) {
      return el(
        "path",
        {
          d: caminhoLetra(l, 0, false),
          stroke: COR.branco,
          "stroke-opacity": "0.22",
          "stroke-width": "1",
          "vector-effect": "non-scaling-stroke",
          pathLength: "1",
          "stroke-dasharray": "1 2",
          "stroke-dashoffset": "1",
        },
        gLig
      );
    });
    function linha(cor) {
      return el(
        "path",
        {
          stroke: cor,
          "stroke-opacity": "0.85",
          "stroke-width": "1.4",
          "vector-effect": "non-scaling-stroke",
          pathLength: "1",
          "stroke-dasharray": "1 2",
          "stroke-dashoffset": "1",
        },
        gConst
      );
    }
    var lArcos = ARCOS.map(function (a) {
      return linha(a[2]);
    });
    var lLetras = LETRAS.map(function (l) {
      return linha(l.cor);
    });

    // Estrelas: entram levemente deslocadas e "se alinham" no lugar.
    var rnd = aleatorio(2024);
    var ordem = ESTRELAS.map(function (_, i) {
      return i;
    });
    for (var i = ordem.length - 1; i > 0; i--) {
      var j = Math.floor(rnd() * (i + 1));
      var tmp = ordem[i];
      ordem[i] = ordem[j];
      ordem[j] = tmp;
    }
    var gEstrelas = el("g", {}, svg);
    var estrelas = ESTRELAS.map(function (e, idx) {
      var ang = rnd() * Math.PI * 2;
      var dist = 14 + rnd() * 22;
      var g = el("g", { opacity: "0" }, gEstrelas);
      el("circle", { r: e.maior ? 30 : 15, fill: halo(e.cor) }, g);
      el("circle", { r: e.maior ? 5.5 : 3.2, fill: e.cor }, g);
      return {
        g: g,
        x: e.x,
        y: e.y,
        dx: Math.cos(ang) * dist,
        dy: Math.sin(ang) * dist,
        inicio: 120 + ordem.indexOf(idx) * 34,
      };
    });

    // Brilho que percorre o fio e a estrela de 4 pontas.
    var cometa = el("g", { opacity: "0" }, svg);
    el("circle", { r: "16", fill: halo(COR.azul) }, cometa);
    el("circle", { r: "3", fill: COR.branco }, cometa);
    var lampejo = el("g", { opacity: "0" }, svg);
    el("circle", { r: "34", fill: halo(COR.azul) }, lampejo);
    var raioEstrela = el(
      "path",
      {
        d: "M0 -30C1.6 -5 5 -1.6 30 0C5 1.6 1.6 5 0 30C-1.6 5 -5 1.6 -30 0C-5 -1.6 -1.6 -5 0 -30Z",
        fill: COR.branco,
      },
      lampejo
    );

    var botao = document.createElement("button");
    botao.type = "button";
    botao.className = "orion-abertura__pular";
    botao.textContent = "Pular abertura";
    camada.appendChild(botao);

    document.body.appendChild(camada);
    raiz.classList.add("orion-abertura-travada");
    raiz.classList.remove("orion-abertura-pendente");
    desenharCeu(ceu);
    requestAnimationFrame(function () {
      ceu.classList.add("visivel");
      botao.classList.add("visivel");
    });

    // Paralaxe sutil do céu com o mouse (só em telas com ponteiro fino).
    var temMouse = global.matchMedia && global.matchMedia("(pointer: fine)").matches;
    function aoMoverMouse(ev) {
      var px = ev.clientX / global.innerWidth - 0.5;
      var py = ev.clientY / global.innerHeight - 0.5;
      ceu.style.transform = "translate3d(" + f(-px * 12) + "px," + f(-py * 12) + "px,0)";
    }
    if (temMouse && !reduzido) global.addEventListener("pointermove", aoMoverMouse, { passive: true });

    // Imagem pronta? Se não, a animação espera antes de revelar.
    var imagemPronta = false;
    var pre = new Image();
    pre.onload = pre.onerror = function () {
      imagemPronta = true;
    };
    pre.src = logo;
    if (pre.complete) imagemPronta = true;

    var resolver;
    var terminado = new Promise(function (r) {
      resolver = r;
    });

    // ---------- Linha do tempo (ms) ----------
    var T = {
      revelar: 2600, // começo da revelação do logo
      fio: 3350, // brilho começa a percorrer o fio
      fimFio: 3900,
      lampejo: 3820,
      estavel: 4400,
      saida: 4950,
    };
    var DURACAO_SAIDA = 600;

    var t = 0;
    var ultimo = null;
    var saindo = false;
    var encerrado = false;
    var mascaraRemovida = false;

    function quadro(tempo) {
      // Atenuações
      var pf;

      // 1. Estrelas surgem e se alinham.
      for (var i = 0; i < estrelas.length; i++) {
        var s = estrelas[i];
        var pe = saidaCubica(trecho(tempo, s.inicio, 700));
        var pulso = Math.sin(Math.PI * trecho(tempo, 2380 + (s.x - 80) * 0.5, 360)) * 0.45;
        var some = 1 - trecho(tempo, 2900, 450);
        var esc = (0.4 + 0.6 * pe) * (1 + pulso);
        s.g.setAttribute("opacity", f(pe * some));
        s.g.setAttribute(
          "transform",
          "translate(" + f(s.x + s.dx * (1 - pe)) + " " + f(s.y + s.dy * (1 - pe)) + ") scale(" + f(esc) + ")"
        );
      }

      // 2. Conexões desenham os traços; 3. as retas se curvam e os cantos arredondam.
      var curva = entradaSaidaCubica(trecho(tempo, 2050, 520));
      var someLinhas = 1 - trecho(tempo, 2800, 500);
      for (var a = 0; a < lArcos.length; a++) {
        pf = entradaSaidaCubica(trecho(tempo, 880 + a * 110, 380));
        lArcos[a].setAttribute("d", caminhoArco(ARCOS[a][0], ARCOS[a][1], curva));
        lArcos[a].setAttribute("stroke-dashoffset", f(1 - pf));
        lArcos[a].setAttribute("opacity", f(someLinhas));
      }
      for (var l = 0; l < lLetras.length; l++) {
        var letra = LETRAS[l];
        pf = entradaSaidaCubica(trecho(tempo, letra.inicio, 520));
        lLetras[l].setAttribute("d", caminhoLetra(letra.pts, letra.raio * curva, letra.fechado));
        lLetras[l].setAttribute("stroke-dashoffset", f(1 - pf));
        lLetras[l].setAttribute("opacity", f(someLinhas));
      }
      var someLig = 1 - trecho(tempo, 2650, 400);
      for (var g = 0; g < lLig.length; g++) {
        pf = saidaCubica(trecho(tempo, 1500 + g * 120, 450));
        lLig[g].setAttribute("stroke-dashoffset", f(1 - pf));
        lLig[g].setAttribute("opacity", f(someLig));
      }

      // 4. Revelação: o PNG original aparece pelos traços.
      for (var m = 0; m < mArcos.length; m++) {
        mArcos[m].setAttribute("stroke-width", f(112 * saidaSuave(trecho(tempo, T.revelar + m * 60, 520))));
      }
      mEsferas[0].setAttribute("r", f(66 * saidaSuave(trecho(tempo, T.revelar, 460))));
      mEsferas[1].setAttribute("r", f(62 * saidaSuave(trecho(tempo, T.revelar + 180, 460))));
      for (var n = 0; n < mLetras.length; n++) {
        mLetras[n].setAttribute("stroke-width", f(58 * saidaSuave(trecho(tempo, T.revelar + 150 + n * 70, 480))));
      }

      // 5. Finalização: brilho percorre o fio e acende a estrela.
      var pFio = entradaSaidaCubica(trecho(tempo, T.fio, T.fimFio - T.fio));
      mFio.setAttribute("stroke-dashoffset", f(1 - pFio));
      var xCometa = FIO.x1 + (ESTRELA.x - FIO.x1) * pFio;
      var visCometa = trecho(tempo, T.fio, 120) * (1 - trecho(tempo, T.fimFio - 60, 200));
      cometa.setAttribute("opacity", f(visCometa));
      cometa.setAttribute("transform", "translate(" + f(xCometa) + " " + FIO.y + ")");

      var pl = trecho(tempo, T.lampejo, T.estavel - T.lampejo);
      var forca = Math.sin(Math.PI * pl);
      lampejo.setAttribute("opacity", f(forca));
      lampejo.setAttribute(
        "transform",
        "translate(" + ESTRELA.x + " " + ESTRELA.y + ") scale(" + f(0.25 + 0.6 * forca) + ")"
      );
      raioEstrela.setAttribute("transform", "rotate(" + f(pl * 25) + ")");

      brilhoFundo.setAttribute("opacity", f(0.2 * saidaCubica(trecho(tempo, 3000, 900))));

      // Logo estabilizado: tira a máscara para exibir o arquivo original 100% intacto.
      if (!mascaraRemovida && tempo >= T.fimFio + 40) {
        imagem.removeAttribute("mask");
        mascaraRemovida = true;
      }
    }

    function quadroReduzido(tempo) {
      // Sem movimento: o logo original aparece com um esmaecimento simples.
      gConst.setAttribute("opacity", "0");
      gEstrelas.setAttribute("opacity", "0");
      if (!mascaraRemovida) {
        imagem.removeAttribute("mask");
        mascaraRemovida = true;
      }
      imagem.setAttribute("opacity", f(trecho(tempo, 0, 400)));
      brilhoFundo.setAttribute("opacity", f(0.2 * trecho(tempo, 0, 400)));
    }

    function elementoAlvo() {
      var a = opcoes.alvo;
      if (typeof a === "string") a = document.querySelector(a);
      if (!a || !a.getBoundingClientRect) return null;
      var r = a.getBoundingClientRect();
      return r.width > 0 && r.height > 0 ? r : null;
    }

    // Voo até o logo do cabeçalho: o símbolo encolhe e pousa no menu enquanto o fundo some.
    function voar(rAlvo) {
      var DURACAO_VOO = 950;
      var rSvg = svg.getBoundingClientRect();
      var rPalco = palco.getBoundingClientRect();
      var k = rSvg.width / 780; // viewBox: 780 unidades de largura, começando em x=40, y=180
      var esq = rSvg.left + (SIMBOLO.x - 40) * k;
      var topo = rSvg.top + (SIMBOLO.y - 180) * k;
      var escala = rAlvo.width / (SIMBOLO.w * k);

      if (!mascaraRemovida) {
        imagem.removeAttribute("mask");
        mascaraRemovida = true;
      }
      [gConst, gEstrelas, cometa, lampejo].forEach(function (g) {
        g.setAttribute("opacity", "0");
      });
      imagemSimbolo.setAttribute("opacity", "1");
      imagem.style.transition = "opacity 380ms ease";
      brilhoFundo.style.transition = "opacity 380ms ease";
      palco.style.transformOrigin = f(esq - rPalco.left) + "px " + f(topo - rPalco.top) + "px";
      palco.style.transition = "transform " + DURACAO_VOO + "ms cubic-bezier(0.65, 0, 0.25, 1)";
      camada.classList.add("voando");
      requestAnimationFrame(function () {
        imagem.style.opacity = "0";
        brilhoFundo.style.opacity = "0";
        palco.style.transform =
          "translate(" + f(rAlvo.left - esq) + "px," + f(rAlvo.top - topo) + "px) scale(" + f(escala * 1000) / 1000 + ")";
      });
      setTimeout(encerrar, DURACAO_VOO + 40);
    }

    function sair() {
      if (saindo) return;
      saindo = true;
      marcarVista();
      raiz.classList.remove("orion-abertura-travada");
      var rAlvo = !reduzido && elementoAlvo();
      if (rAlvo) {
        voar(rAlvo);
        return;
      }
      camada.classList.add("saindo");
      setTimeout(encerrar, reduzido ? 320 : DURACAO_SAIDA);
    }

    function encerrar() {
      if (encerrado) return;
      encerrado = true;
      global.removeEventListener("pointermove", aoMoverMouse);
      global.removeEventListener("keydown", aoTeclar);
      if (camada.parentNode) camada.parentNode.removeChild(camada);
      aoTerminar();
      resolver();
    }

    var fimReduzido = 1500;
    function laco(agora) {
      if (encerrado) return;
      if (ultimo == null) ultimo = agora;
      var dt = Math.min(agora - ultimo, 50); // evita saltos se a aba ficar em segundo plano
      ultimo = agora;
      // Segura antes da revelação até o PNG carregar (conexões lentas).
      if (!(t >= T.revelar - 40 && !imagemPronta)) t += dt;
      // Para revisão de design: ?quadro=1800 congela a animação nesse instante (ms).
      if (typeof opcoes.congelarEm === "number") t = Math.min(t, opcoes.congelarEm);

      if (reduzido) {
        quadroReduzido(t);
        if (t >= fimReduzido) sair();
      } else {
        quadro(t);
        if (t >= T.saida) sair();
      }
      if (!saindo || t < T.estavel) requestAnimationFrame(laco);
    }

    function pular() {
      if (saindo) return;
      if (!reduzido) {
        t = T.estavel;
        quadro(t);
      }
      sair();
    }
    function aoTeclar(ev) {
      if (ev.key === "Escape") pular();
    }
    botao.addEventListener("click", pular);
    global.addEventListener("keydown", aoTeclar);

    requestAnimationFrame(laco);

    return { pular: pular, terminado: terminado };
  }

  global.AberturaOrion = { iniciar: iniciar };
})(window);
