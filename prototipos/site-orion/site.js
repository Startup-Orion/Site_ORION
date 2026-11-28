/* Site ORION (protótipo). Sem bibliotecas. */
(function () {
  "use strict";

  var modo3D = document.documentElement.classList.contains("com-3d");
  if (!modo3D) {
    var sobre3D = document.getElementById("sobre");
    var sobre2D = document.getElementById("sobre-2d");
    if (sobre3D && sobre2D) {
      sobre3D.id = "sobre-3d";
      sobre2D.id = "sobre";
    }
  }

  var reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var temMouse = window.matchMedia("(pointer: fine)").matches;
  var raiz = document.documentElement;

  // ---------- WhatsApp (integração real via wa.me) ----------
  var WHATSAPP = "5592991339221"; // (92) 99133-9221
  var CONTEXTOS = {
    geral: { rotulo: "Conversar no WhatsApp", texto: "Olá, ORION! Vim pelo site e quero conversar." },
    inicio: { rotulo: "Conversar sobre minha ideia", texto: "Olá, ORION! Vim pelo site e tenho uma ideia para conversar." },
    sobre: { rotulo: "Conhecer a ORION", texto: "Olá, ORION! Quero conhecer melhor a startup e o trabalho de vocês." },
    servicos: { rotulo: "Pedir um orçamento", texto: "Olá, ORION! Quero saber mais sobre os serviços e pedir um orçamento." },
    "servico-sites": { rotulo: "Falar sobre sites e sistemas", texto: "Olá, ORION! Quero desenvolver um site ou sistema. Podemos conversar?" },
    "servico-marca": { rotulo: "Falar sobre identidade visual", texto: "Olá, ORION! Quero fortalecer minha marca com identidade visual e design." },
    "servico-suporte": { rotulo: "Pedir suporte técnico", texto: "Olá, ORION! Preciso de suporte para meu computador." },
    "servico-inovacao": { rotulo: "Falar sobre um projeto novo", texto: "Olá, ORION! Tenho um projeto de inovação ou automação para conversar." },
    projetos: { rotulo: "Falar sobre os projetos", texto: "Olá, ORION! Vi o portfólio de vocês e quero saber mais." },
    "projeto-orion": { rotulo: "Saber sobre o ORION Lite", texto: "Olá, ORION! Quero saber sobre o ORION Lite (tecnologia assistiva com visão computacional)." },
    "projeto-teko": { rotulo: "Saber sobre o Teko Ka’a", texto: "Olá, ORION! Quero saber sobre o projeto Teko Ka’a (estufa inteligente)." },
    "projeto-ada": { rotulo: "Falar sobre eventos", texto: "Olá, ORION! Vi a participação de vocês no Ada Conecta e quero conversar." },
    monte: { rotulo: "Prefiro conversar direto", texto: "Olá, ORION! Vim pelo site e prefiro conversar direto sobre meu projeto." },
    trajetoria: { rotulo: "Propor uma parceria", texto: "Olá, ORION! Quero conversar sobre uma parceria." },
    equipe: { rotulo: "Falar com a equipe", texto: "Olá, ORION! Quero conversar com a equipe." },
  };
  function linkWhats(texto) {
    return "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(texto);
  }
  document.querySelectorAll("[data-whats]").forEach(function (a) {
    var c = CONTEXTOS[a.getAttribute("data-whats")] || CONTEXTOS.geral;
    a.href = linkWhats(c.texto);
  });

  // Botão flutuante: muda conforme a parte da página que está no centro da tela.
  var flutuante = document.getElementById("whats-flutuante");
  var flutTexto = document.getElementById("whats-texto");
  var contextoAtual = null;
  var heroAcoesVisiveis = true;
  function definirContexto(nome, forcar) {
    if (nome === contextoAtual && !forcar) return;
    contextoAtual = nome;
    // Some no contato (o formulário já faz isso) e enquanto os botões do hero estão na tela.
    // também some no "Monte a constelação": a seção já termina com o envio pelo WhatsApp
    var escondido = nome === "contato" || nome === "monte" || !nome || heroAcoesVisiveis;
    flutuante.classList.toggle("escondido", escondido);
    flutuante.setAttribute("aria-hidden", escondido ? "true" : "false");
    flutuante.tabIndex = escondido ? -1 : 0;
    if (escondido) return;
    var c = CONTEXTOS[nome] || CONTEXTOS.geral;
    flutuante.href = linkWhats(c.texto);
    flutTexto.classList.add("trocando");
    setTimeout(function () {
      flutTexto.textContent = c.rotulo;
      flutTexto.classList.remove("trocando");
    }, 180);
  }
  var visiveis = new Set();
  var zonas = Array.prototype.slice.call(document.querySelectorAll("[data-contexto]"));
  var obsContexto = new IntersectionObserver(
    function (entradas) {
      entradas.forEach(function (e) {
        if (e.isIntersecting) visiveis.add(e.target);
        else visiveis.delete(e.target);
      });
      // O mais específico vence (um projeto dentro de "projetos", por exemplo).
      var escolhido = null;
      zonas.forEach(function (z) {
        if (visiveis.has(z) && (!escolhido || escolhido.contains(z))) escolhido = z;
      });
      definirContexto(escolhido ? escolhido.getAttribute("data-contexto") : "geral");
      // Menu: marca a seção atual.
      var secao = escolhido && escolhido.closest("section");
      document.querySelectorAll(".menu a").forEach(function (a) {
        a.classList.toggle("atual", !!secao && a.getAttribute("href") === "#" + secao.id);
      });
    },
    { rootMargin: "-48% 0px -48% 0px" }
  );
  zonas.forEach(function (z) {
    obsContexto.observe(z);
  });
  if (modo3D) {
    window.addEventListener("orion-hero", function (ev) {
      heroAcoesVisiveis = !!ev.detail;
      definirContexto(contextoAtual, true);
    });
  } else {
    new IntersectionObserver(function (entradas) {
      heroAcoesVisiveis = entradas[0].isIntersecting;
      definirContexto(contextoAtual, true);
    }).observe(document.querySelector("#hero-2d .hero__acoes"));
  }

  // ---------- Cabeçalho e menu ----------
  var topo = document.getElementById("topo");
  function aoRolar() {
    topo.classList.toggle("rolado", window.scrollY > 12);
  }
  window.addEventListener("scroll", aoRolar, { passive: true });
  aoRolar();

  var menu = document.getElementById("menu");
  var menuBotao = document.querySelector(".menu-botao");
  menuBotao.addEventListener("click", function () {
    var aberto = menu.classList.toggle("aberto");
    menuBotao.setAttribute("aria-expanded", aberto ? "true" : "false");
  });
  menu.addEventListener("click", function (ev) {
    if (ev.target.closest("a")) {
      menu.classList.remove("aberto");
      menuBotao.setAttribute("aria-expanded", "false");
    }
  });

  // ---------- Ícones de traço que se desenham ----------
  // Copia o desenho do <symbol> para dentro do ícone (o CSS não alcança o conteúdo de <use>).
  document.querySelectorAll(".desenhavel svg.ico-grande use").forEach(function (u) {
    var simbolo = document.querySelector(u.getAttribute("href"));
    var svg = u.parentNode;
    if (!simbolo) return;
    svg.setAttribute("viewBox", simbolo.getAttribute("viewBox"));
    Array.prototype.forEach.call(simbolo.children, function (filho) {
      var copia = filho.cloneNode(true);
      if (copia.classList.contains("t")) copia.setAttribute("pathLength", "1");
      svg.appendChild(copia);
    });
    svg.removeChild(u);
  });
  var obsDesenho = new IntersectionObserver(
    function (entradas) {
      entradas.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("desenhado");
          obsDesenho.unobserve(e.target);
        }
      });
    },
    { rootMargin: "0px 0px -15% 0px" }
  );
  document.querySelectorAll(".desenhavel").forEach(function (d) {
    obsDesenho.observe(d);
    if (!temMouse || reduzido) return;
    d.addEventListener("pointerenter", function () {
      if (!d.classList.contains("desenhado")) return;
      d.classList.remove("desenhado");
      void d.offsetWidth; // reinicia a animação
      d.classList.add("desenhado");
    });
  });

  // ---------- Cinturão de Órion interativo ----------
  var cinturao = document.getElementById("cinturao");
  var linhasSvg = cinturao.querySelector(".cinturao__linhas");
  var camadaAstros = cinturao.querySelector(".cinturao__estrelas");
  var cartao = document.getElementById("cinturao-cartao");
  var ASTROS = [
    { id: "meissa", nome: "Meissa", x: 300, y: 70, t: 5, z: 0.3 },
    { id: "betelgeuse", nome: "Betelgeuse", x: 140, y: 112, t: 10, z: 0.55 },
    { id: "bellatrix", nome: "Bellatrix", x: 448, y: 152, t: 8, z: 0.45 },
    {
      id: "alnitak", nome: "Alnitak", x: 228, y: 336, t: 13, z: 1.1, servico: "servico-sites",
      rotulo: "Sites e sistemas", rot: { left: "-152px", top: "14px" }, rotMovel: { left: "-64px", top: "18px" },
      texto: "Sites institucionais e comerciais, sistemas personalizados e produtos SaaS.",
    },
    {
      id: "alnilam", nome: "Alnilam", x: 300, y: 308, t: 14, z: 1.2, servico: "servico-marca",
      rotulo: "Marca e design", rot: { left: "-46px", top: "-44px" },
      texto: "Identidade visual, logotipos, artes para redes sociais e materiais de divulgação.",
    },
    {
      id: "mintaka", nome: "Mintaka", x: 372, y: 282, t: 12, z: 1.05, servico: "servico-inovacao",
      rotulo: "Projetos e inovação", rot: { left: "20px", top: "-4px" },
      texto: "Protótipos, IA e visão computacional, IoT, automação e consultoria técnica.",
    },
    { id: "saiph", nome: "Saiph", x: 200, y: 548, t: 7, z: 0.5 },
    {
      id: "rigel", nome: "Rigel", x: 476, y: 524, t: 11, z: 0.7, servico: "servico-suporte",
      rotulo: "Suporte tecnológico", rot: { left: "-60px", top: "18px" },
      texto: "Manutenção, formatação, instalação de softwares, diagnóstico e suporte.",
    },
  ];
  var LIGACOES = [
    ["meissa", "betelgeuse"], ["meissa", "bellatrix"], ["betelgeuse", "alnitak"], ["bellatrix", "mintaka"],
    ["alnitak", "alnilam", true], ["alnilam", "mintaka", true], ["alnitak", "saiph"], ["mintaka", "rigel"],
  ];
  var porId = {};
  var NS = "http://www.w3.org/2000/svg";
  var ehToque = !temMouse;
  document.getElementById("cinturao-dica").textContent =
    (ehToque ? "Toque" : "Clique") + " numa estrela do cinturão para ver o serviço";

  ASTROS.forEach(function (a, i) {
    var el = document.createElement(a.servico ? "button" : "span");
    el.className = "astro" + (a.t >= 9 ? " astro--raios" : "");
    el.style.setProperty("--dur", (3.2 + (i % 4) * 0.9).toFixed(1) + "s");
    el.style.setProperty("--t", a.t + "px");
    el.style.setProperty("--atraso", (i * 0.37).toFixed(2) + "s");
    if (a.servico) {
      el.type = "button";
      el.setAttribute("aria-expanded", "false");
      el.setAttribute("aria-controls", "cinturao-cartao");
      el.setAttribute("aria-label", a.nome + ": " + a.rotulo);
      el.style.setProperty("--cor", "#cfeeff");
    } else {
      el.setAttribute("aria-hidden", "true");
    }
    var ponto = document.createElement("span");
    ponto.className = "astro__ponto";
    el.appendChild(ponto);
    var rot = document.createElement("span");
    rot.className = a.servico ? "astro__rotulo" : "astro__nome";
    rot.textContent = a.servico ? a.rotulo : a.nome;
    if (a.rot) {
      rot.style.left = a.rot.left;
      rot.style.top = a.rot.top;
    }
    el.appendChild(rot);
    camadaAstros.appendChild(el);
    a.el = el;
    a.ox = 0;
    a.oy = 0;
    porId[a.id] = a;
  });
  var linhas = LIGACOES.map(function (l, i) {
    var ln = document.createElementNS(NS, "line");
    if (l[2]) ln.setAttribute("class", "cinto");
    ln.setAttribute("pathLength", "1");
    ln.style.strokeDasharray = "1 2";
    ln.style.strokeDashoffset = reduzido ? "0" : "1";
    ln.style.transition = "stroke-dashoffset 900ms cubic-bezier(0.2,0.7,0.2,1) " + (300 + i * 110) + "ms";
    linhasSvg.appendChild(ln);
    // Pulso: um brilho curto que viaja pela linha, como uma ideia passando pela conexão.
    var pulso = document.createElementNS(NS, "line");
    pulso.setAttribute("class", "pulso" + (l[2] ? " pulso--cinto" : ""));
    pulso.setAttribute("pathLength", "1");
    pulso.style.animationDelay = (2.4 + i * 0.55).toFixed(2) + "s";
    linhasSvg.appendChild(pulso);
    return { el: ln, pulso: pulso, a: porId[l[0]], b: porId[l[1]] };
  });

  var escala = 1;
  // Giro da constelação (graus): começa "norte para cima" e gira até a inclinação real no céu de Manaus.
  var giro = 0;
  var CENTRO = { x: 300, y: 320 };
  function posicionar(a) {
    var r = giro * Math.PI / 180;
    var encaixe = 1 - 0.14 * Math.abs(Math.sin(r)); // encolhe um pouco quando deitada, para caber
    var dx = a.x - CENTRO.x;
    var dy = a.y - CENTRO.y;
    a.bx = CENTRO.x + (dx * Math.cos(r) - dy * Math.sin(r)) * encaixe;
    a.by = CENTRO.y + (dx * Math.sin(r) + dy * Math.cos(r)) * encaixe;
  }
  function posicionarRotulos() {
    var movel = window.innerWidth < 680;
    var inclinada = Math.abs(((giro + 540) % 360) - 180) > 20;
    ASTROS.forEach(function (a) {
      var rot = a.el.querySelector(".astro__rotulo");
      if (!rot) return;
      if (!inclinada) {
        var p = movel && a.rotMovel ? a.rotMovel : a.rot;
        rot.style.left = p.left;
        rot.style.top = p.top;
        rot.style.transform = "";
      } else {
        // Com a figura girada, o rótulo vai para o lado com mais espaço.
        var paraEsquerda = a.bx > 330;
        rot.style.left = paraEsquerda ? "-18px" : "18px";
        rot.style.top = "-9px";
        rot.style.transform = paraEsquerda ? "translateX(-100%)" : "";
      }
    });
  }
  function medir() {
    escala = cinturao.clientWidth / 600;
    ASTROS.forEach(posicionar);
    posicionarRotulos();
  }
  function desenharCinturao() {
    ASTROS.forEach(function (a) {
      var x = a.bx * escala + a.ox * a.z;
      var y = a.by * escala + a.oy * a.z;
      a.el.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px)";
    });
    linhas.forEach(function (l) {
      l.el.setAttribute("x1", (l.a.bx + (l.a.ox * l.a.z) / escala).toFixed(1));
      l.el.setAttribute("y1", (l.a.by + (l.a.oy * l.a.z) / escala).toFixed(1));
      l.el.setAttribute("x2", (l.b.bx + (l.b.ox * l.b.z) / escala).toFixed(1));
      l.el.setAttribute("y2", (l.b.by + (l.b.oy * l.b.z) / escala).toFixed(1));
      ["x1", "y1", "x2", "y2"].forEach(function (k) {
        l.pulso.setAttribute(k, l.el.getAttribute(k));
      });
    });
  }

  // Céu real de Manaus: gira o cinturão até a inclinação de agora e conta onde Órion está.
  var textoCeu = document.getElementById("cinturao-ceu");
  var heroSecao = document.getElementById("cinturao");
  function girarPara(alvoGiro, duracao) {
    var inicio = giro;
    var delta = ((alvoGiro - inicio + 540) % 360) - 180; // caminho mais curto
    if (reduzido || !duracao) {
      giro = inicio + delta;
      medir();
      desenharCinturao();
      return;
    }
    var t0 = null;
    function quadro(agora) {
      if (t0 == null) t0 = agora;
      var k = Math.min(1, (agora - t0) / duracao);
      var e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      giro = inicio + delta * e;
      medir();
      desenharCinturao();
      if (k < 1) requestAnimationFrame(quadro);
    }
    requestAnimationFrame(quadro);
  }
  function atualizarCeu(duracao) {
    if (!window.OrionCeu) return;
    var c = window.OrionCeu.calcular();
    textoCeu.textContent = c.texto;
    heroSecao.classList.toggle("ceu-dia", c.dia);
    girarPara(c.giro, duracao);
  }
  medir();
  desenharCinturao();
  window.addEventListener("resize", function () {
    medir();
    desenharCinturao();
  });

  // Paralaxe: estrelas mais "próximas" (z maior) se movem mais.
  var alvo = { x: 0, y: 0 };
  var atual = { x: 0, y: 0 };
  var animando = false;
  var AMPLITUDE = 18;
  function passo() {
    atual.x += (alvo.x - atual.x) * 0.08;
    atual.y += (alvo.y - atual.y) * 0.08;
    ASTROS.forEach(function (a) {
      a.ox = atual.x * AMPLITUDE;
      a.oy = atual.y * AMPLITUDE;
    });
    desenharCinturao();
    if (Math.abs(alvo.x - atual.x) > 0.001 || Math.abs(alvo.y - atual.y) > 0.001) {
      requestAnimationFrame(passo);
    } else {
      animando = false;
    }
  }
  function mirar(x, y) {
    alvo.x = Math.max(-1, Math.min(1, x));
    alvo.y = Math.max(-1, Math.min(1, y));
    if (!animando) {
      animando = true;
      requestAnimationFrame(passo);
    }
  }
  if (!reduzido) {
    window.addEventListener(
      "pointermove",
      function (ev) {
        if (ev.pointerType !== "mouse") return;
        var r = cinturao.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) return;
        mirar((ev.clientX - (r.left + r.width / 2)) / (r.width * 0.8), (ev.clientY - (r.top + r.height / 2)) / (r.height * 0.8));
      },
      { passive: true }
    );
    // Celular: inclinação do aparelho.
    var aoInclinar = function (ev) {
      if (ev.gamma == null) return;
      mirar(ev.gamma / 30, (ev.beta - 45) / 30);
    };
    if (window.DeviceOrientationEvent) {
      if (typeof DeviceOrientationEvent.requestPermission === "function") {
        // iPhone: pede permissão no primeiro toque no cinturão.
        cinturao.addEventListener(
          "click",
          function () {
            DeviceOrientationEvent.requestPermission()
              .then(function (s) {
                if (s === "granted") window.addEventListener("deviceorientation", aoInclinar);
              })
              .catch(function () {});
          },
          { once: true }
        );
      } else {
        window.addEventListener("deviceorientation", aoInclinar);
      }
    }
  }

  // Cartão do serviço ao tocar numa estrela.
  var estrelaAberta = null;
  function abrirEstrela(a) {
    if (estrelaAberta) estrelaAberta.el.setAttribute("aria-expanded", "false");
    estrelaAberta = a;
    a.el.setAttribute("aria-expanded", "true");
    document.getElementById("cc-estrela").textContent = "Estrela " + a.nome;
    document.getElementById("cc-titulo").textContent = a.rotulo;
    document.getElementById("cc-texto").textContent = a.texto;
    document.getElementById("cc-whats").href = linkWhats(CONTEXTOS[a.servico].texto);
    document.getElementById("cc-ver").setAttribute("href", "#" + a.servico);
    cartao.hidden = false;
    // reinicia a animação de entrada
    cartao.style.animation = "none";
    void cartao.offsetWidth;
    cartao.style.animation = "";
    document.getElementById("cc-whats").focus({ preventScroll: true });
  }
  function fecharEstrela(devolverFoco) {
    if (!estrelaAberta) return;
    cartao.hidden = true;
    estrelaAberta.el.setAttribute("aria-expanded", "false");
    if (devolverFoco) estrelaAberta.el.focus();
    estrelaAberta = null;
  }
  ASTROS.forEach(function (a) {
    if (!a.servico) return;
    a.el.addEventListener("click", function (ev) {
      ev.stopPropagation();
      if (estrelaAberta === a) fecharEstrela(true);
      else abrirEstrela(a);
    });
  });
  cartao.querySelector(".cinturao__fechar").addEventListener("click", function () {
    fecharEstrela(true);
  });
  document.addEventListener("keydown", function (ev) {
    if (ev.key === "Escape") fecharEstrela(true);
  });
  document.addEventListener("click", function (ev) {
    if (estrelaAberta && !cartao.contains(ev.target)) fecharEstrela(false);
  });
  document.getElementById("cc-ver").addEventListener("click", function () {
    var alvoServico = document.querySelector(this.getAttribute("href"));
    fecharEstrela(false);
    if (alvoServico) {
      setTimeout(function () {
        alvoServico.classList.remove("destaque");
        void alvoServico.offsetWidth;
        alvoServico.classList.add("destaque");
      }, 500);
    }
  });

  // ---------- Portfólio: cartões com profundidade ----------
  if (temMouse && !reduzido) {
    document.querySelectorAll(".projeto__cartao").forEach(function (c) {
      c.addEventListener("pointermove", function (ev) {
        var r = c.getBoundingClientRect();
        var px = (ev.clientX - r.left) / r.width;
        var py = (ev.clientY - r.top) / r.height;
        c.classList.add("ativo");
        c.style.setProperty("--ry", ((px - 0.5) * 8).toFixed(2) + "deg");
        c.style.setProperty("--rx", ((0.5 - py) * 6).toFixed(2) + "deg");
      });
      c.addEventListener("pointerleave", function () {
        c.classList.remove("ativo");
        c.style.setProperty("--rx", "0deg");
        c.style.setProperty("--ry", "0deg");
      });
    });
  }

  // ---------- Trajetória desenhada pela rolagem ----------
  var linhaTempo = document.getElementById("linha-tempo");
  var ltSvg = linhaTempo.querySelector(".linha-tempo__svg");
  var ltBase = linhaTempo.querySelector(".linha-tempo__base");
  var ltLuz = linhaTempo.querySelector(".linha-tempo__luz");
  var marcos = Array.prototype.slice.call(linhaTempo.querySelectorAll(".marco"));
  var pontos = [];
  var acumulado = [];
  var total = 1;
  function montarLinha() {
    var base = linhaTempo.getBoundingClientRect();
    pontos = marcos.map(function (m) {
      var r = m.querySelector(".marco__estrela").getBoundingClientRect();
      return { x: r.left + r.width / 2 - base.left, y: r.top + r.height / 2 - base.top };
    });
    ltSvg.setAttribute("viewBox", "0 0 " + base.width + " " + base.height);
    var d = "";
    acumulado = [0];
    pontos.forEach(function (p, i) {
      d += (i ? "L" : "M") + p.x.toFixed(1) + " " + p.y.toFixed(1);
      if (i) acumulado.push(acumulado[i - 1] + Math.hypot(p.x - pontos[i - 1].x, p.y - pontos[i - 1].y));
    });
    total = acumulado[acumulado.length - 1] || 1;
    ltBase.setAttribute("d", d);
    ltLuz.setAttribute("d", d);
    atualizarLinha();
  }
  function atualizarLinha() {
    if (!pontos.length) return;
    var base = linhaTempo.getBoundingClientRect();
    var yLuz = window.innerHeight * 0.62 - base.top; // a luz acompanha ~60% da altura da tela
    var comp = 0;
    for (var i = 0; i < pontos.length; i++) {
      var aceso = yLuz >= pontos[i].y;
      marcos[i].classList.toggle("aceso", aceso || reduzido);
      if (i > 0 && yLuz > pontos[i - 1].y) {
        var fr = Math.min(1, (yLuz - pontos[i - 1].y) / (pontos[i].y - pontos[i - 1].y));
        comp = acumulado[i - 1] + (acumulado[i] - acumulado[i - 1]) * fr;
      }
    }
    if (reduzido) comp = total;
    ltLuz.style.strokeDashoffset = (1 - comp / total).toFixed(4);
    // Cometa na ponta da luz: aparece enquanto a linha está sendo desenhada pela rolagem.
    var emCurso = comp > 2 && comp < total - 2 && !reduzido;
    cometa.classList.toggle("visivel", emCurso);
    if (emCurso) {
      var pt = ltBase.getPointAtLength(comp);
      var pa = ltBase.getPointAtLength(Math.max(0, comp - 6));
      var ang = (Math.atan2(pt.y - pa.y, pt.x - pa.x) * 180) / Math.PI;
      cometa.style.transform = "translate(" + pt.x.toFixed(1) + "px," + pt.y.toFixed(1) + "px) rotate(" + ang.toFixed(1) + "deg)";
    }
  }
  var cometa = document.createElement("span");
  cometa.className = "linha-tempo__cometa";
  cometa.setAttribute("aria-hidden", "true");
  linhaTempo.appendChild(cometa);
  var rolando = false;
  window.addEventListener(
    "scroll",
    function () {
      if (rolando) return;
      rolando = true;
      requestAnimationFrame(function () {
        atualizarLinha();
        rolando = false;
      });
    },
    { passive: true }
  );
  window.addEventListener("resize", montarLinha);
  window.addEventListener("load", montarLinha);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(montarLinha);
  montarLinha();

  // ---------- Valores da equipe acendem em sequência ----------
  var valores = document.querySelectorAll(".valores li");
  new IntersectionObserver(
    function (entradas, obs) {
      entradas.forEach(function (e) {
        if (!e.isIntersecting) return;
        valores.forEach(function (v, i) {
          setTimeout(function () {
            v.classList.add("aceso");
          }, reduzido ? 0 : 220 * i);
        });
        obs.disconnect();
      });
    },
    { rootMargin: "0px 0px -25% 0px" }
  ).observe(document.querySelector(".valores"));

  // ---------- Formulário: monta a mensagem e abre o WhatsApp ----------
  var form = document.getElementById("formulario");
  var erro = document.getElementById("f-erro");
  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var campos = [form.nome, form.servico, form.mensagem];
    var faltando = campos.filter(function (c) {
      var vazio = !c.value.trim();
      c.setAttribute("aria-invalid", vazio ? "true" : "false");
      return vazio;
    });
    if (faltando.length) {
      var NOMES = { nome: "seu nome", servico: "o assunto", mensagem: "sua ideia" };
      var lista = faltando.map(function (c) {
        return NOMES[c.name];
      });
      var juntos = lista.length > 1 ? lista.slice(0, -1).join(", ") + " e " + lista[lista.length - 1] : lista[0];
      erro.textContent = "Falta preencher " + juntos + " para montarmos a mensagem.";
      erro.hidden = false;
      faltando[0].focus();
      return;
    }
    erro.hidden = true;
    var texto =
      "Olá, ORION! Meu nome é " + form.nome.value.trim() + ".\n" +
      "Assunto: " + form.servico.value + "\n\n" +
      form.mensagem.value.trim() + "\n\n(Mensagem enviada pelo site)";
    window.open(linkWhats(texto), "_blank", "noopener");
  });

  // ---------- Abertura + entrada do hero ----------
  // Céu animado atrás do hero (camadas, cintilar, estrelas cadentes)
  var fundoHero = document.querySelector(".hero-fundo");
  if (fundoHero && window.OrionEstrelas) {
    var heroEl = document.getElementById("hero-2d");
    new ResizeObserver(function () {
      fundoHero.style.height = heroEl.offsetHeight + 120 + "px";
    }).observe(heroEl);
    window.OrionEstrelas.ceu(fundoHero.querySelector("canvas"), { densidade: 1, cadentes: true, paralaxe: 16 });
  }

  new IntersectionObserver(
    function (entradas, obs) {
      if (!entradas[0].isIntersecting) return;
      obs.disconnect();
      cinturao.classList.add("ativo");
      linhas.forEach(function (l) {
        l.el.style.strokeDashoffset = "0";
      });
      // Depois que as linhas se desenham, a constelação gira para a posição real no céu de Manaus.
      setTimeout(function () {
        atualizarCeu(1800);
        setInterval(function () {
          atualizarCeu(1200);
        }, 60000);
      }, reduzido ? 0 : 1500);
    },
    { rootMargin: "0px 0px -20% 0px" }
  ).observe(cinturao);

  function revelarSite() {
    raiz.classList.remove("com-abertura");
    requestAnimationFrame(function () {
      document.body.classList.add("hero-pronto");
      setTimeout(montarLinha, 1300);
    });
  }
  // A cena 3D chama isto ao fim do mergulho.
  window.OrionSite = { revelar: revelarSite };
  if (!reduzido) document.body.classList.add("anima-entrada");
  if (modo3D) {
    /* espaco3d.js inicia a abertura e o mergulho */
  } else if (window.AberturaOrion) {
    window.AberturaOrion.iniciar({
      logo: "../abertura-orion/orion-logo.png",
      alvo: "#logo-topo",
      aoTerminar: revelarSite,
    });
  } else {
    raiz.classList.remove("orion-abertura-pendente");
    revelarSite();
  }
})();
