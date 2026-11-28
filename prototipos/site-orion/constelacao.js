/*
 * "Monte a constelação do seu projeto": diagnóstico em 4 perguntas.
 * Cada resposta acende uma estrela; no fim, resumo + mensagem pronta para o WhatsApp.
 */
(function () {
  "use strict";

  var WHATSAPP = "5592991339221";
  var NS = "http://www.w3.org/2000/svg";
  var reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var PERGUNTAS = [
    {
      chave: "necessidades",
      titulo: "Do que o seu projeto precisa?",
      ajuda: "Pode escolher mais de uma opção.",
      multipla: true,
      opcoes: [
        { valor: "Site", estrela: "Site", faremos: "Site rápido, bonito no celular e fácil de atualizar" },
        { valor: "Sistema ou aplicativo", estrela: "Sistema", faremos: "Sistema sob medida para a sua rotina" },
        { valor: "Identidade visual", estrela: "Marca", faremos: "Identidade visual e materiais para as redes" },
        { valor: "Suporte técnico", estrela: "Suporte", faremos: "Diagnóstico e manutenção dos seus equipamentos" },
        { valor: "Automação ou IoT", estrela: "Automação", faremos: "Automação com sensores e controle à distância" },
        { valor: "Inteligência artificial", estrela: "IA", faremos: "Solução com IA ou visão computacional" },
      ],
    },
    {
      chave: "estagio",
      titulo: "Em que ponto você está?",
      opcoes: [
        { valor: "Só tenho a ideia", estrela: "Ideia", passo: "Começamos por uma conversa para transformar a ideia em um plano." },
        { valor: "Já tenho algo e quero melhorar", estrela: "Evolução", passo: "Começamos entendendo o que você já tem e o que precisa mudar." },
        { valor: "Preciso resolver algo urgente", estrela: "Urgência", passo: "Começamos com um diagnóstico rápido para resolver o mais urgente." },
      ],
    },
    {
      chave: "prazo",
      titulo: "Para quando você precisa?",
      opcoes: [
        { valor: "Este mês", estrela: "Este mês" },
        { valor: "Nos próximos 3 meses", estrela: "3 meses" },
        { valor: "Sem pressa", estrela: "Sem pressa" },
      ],
    },
    {
      chave: "publico",
      titulo: "Para quem é?",
      opcoes: [
        { valor: "Meu negócio", estrela: "Negócio" },
        { valor: "Uma organização ou instituição", estrela: "Organização" },
        { valor: "Um projeto pessoal ou acadêmico", estrela: "Pessoal" },
      ],
    },
  ];
  // Posições das estrelas, na ordem em que acendem (desenho levemente sinuoso, como uma constelação).
  var VAGAS = [
    [86, 300], [150, 206], [238, 246], [306, 152], [388, 204], [462, 116], [340, 316], [430, 334], [500, 252],
  ];

  var respostas = { necessidades: [], estagio: null, prazo: null, publico: null, nome: "" };
  var passo = 0;
  var caixa = document.getElementById("monte-perguntas");
  var svg = document.getElementById("monte-svg");
  var gFundo = svg.querySelector(".monte__fundo");
  var gLinhas = svg.querySelector(".monte__linhas");
  var gEstrelas = svg.querySelector(".monte__estrelas");
  var nomeCeu = document.getElementById("monte-nome");
  var desenhadas = {};

  function esc(t) {
    return String(t).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function opcao(pergunta, valor) {
    return pergunta.opcoes.find(function (o) {
      return o.valor === valor;
    });
  }

  // Céu animado atrás da constelação + gradientes de brilho das estrelas
  var canvasCeu = document.querySelector(".monte__ceu canvas");
  if (canvasCeu && window.OrionEstrelas) {
    window.OrionEstrelas.ceu(canvasCeu, { densidade: 0.9, cadentes: true, paralaxe: 10, semente: 9 });
  }
  var defs = document.createElementNS(NS, "defs");
  defs.innerHTML =
    '<radialGradient id="monte-brilho"><stop offset="0" stop-color="#ffffff" stop-opacity="0.9"/>' +
    '<stop offset="0.18" stop-color="#9fdcff" stop-opacity="0.55"/><stop offset="0.5" stop-color="#37b5ff" stop-opacity="0.16"/>' +
    '<stop offset="1" stop-color="#37b5ff" stop-opacity="0"/></radialGradient>' +
    '<linearGradient id="monte-raio-h"><stop offset="0" stop-color="#e6f6ff" stop-opacity="0"/>' +
    '<stop offset="0.5" stop-color="#e6f6ff"/><stop offset="1" stop-color="#e6f6ff" stop-opacity="0"/></linearGradient>' +
    '<linearGradient id="monte-raio-v" x2="0" y2="1"><stop offset="0" stop-color="#e6f6ff" stop-opacity="0"/>' +
    '<stop offset="0.5" stop-color="#e6f6ff"/><stop offset="1" stop-color="#e6f6ff" stop-opacity="0"/></linearGradient>';
  svg.insertBefore(defs, svg.firstChild);

  // ---------- Constelação ----------
  function estrelasAtuais() {
    var lista = respostas.necessidades.map(function (v) {
      return { id: "n-" + v, rotulo: opcao(PERGUNTAS[0], v).estrela };
    });
    ["estagio", "prazo", "publico"].forEach(function (k, i) {
      if (respostas[k]) lista.push({ id: k, rotulo: opcao(PERGUNTAS[i + 1], respostas[k]).estrela });
    });
    return lista.map(function (e, i) {
      e.x = VAGAS[i][0];
      e.y = VAGAS[i][1];
      return e;
    });
  }
  var canvasFaiscas = document.createElement("canvas");
  canvasFaiscas.className = "monte__faiscas";
  canvasFaiscas.setAttribute("aria-hidden", "true");
  svg.parentNode.appendChild(canvasFaiscas);
  var faiscas = window.OrionFaiscas ? window.OrionFaiscas.criar(canvasFaiscas) : null;
  var NASCER = 750; // ms: tempo da poeira até virar estrela
  var jaCompleta = false;
  function paraCanvas(x, y) {
    var rs = svg.getBoundingClientRect();
    var rc = canvasFaiscas.getBoundingClientRect();
    var s = Math.min(rs.width / 560, rs.height / 420); // preserveAspectRatio "meet"
    return {
      x: rs.left - rc.left + (rs.width - 560 * s) / 2 + x * s,
      y: rs.top - rc.top + (rs.height - 420 * s) / 2 + y * s,
    };
  }

  function desenhar(completa) {
    var lista = estrelasAtuais();
    var vivos = {};
    var novas = {};
    var comFaiscas = faiscas && !reduzido;
    // estrelas
    lista.forEach(function (e, i) {
      var chave = "e:" + e.id;
      vivos[chave] = true;
      var g = desenhadas[chave];
      if (!g) {
        g = document.createElementNS(NS, "g");
        g.setAttribute("class", "monte__estrela" + (comFaiscas ? " esperando" : reduzido ? "" : " nova"));
        g.innerHTML =
          '<circle class="onda" r="8"></circle>' +
          '<circle class="halo" r="24" fill="url(#monte-brilho)"></circle>' +
          '<g class="raios"><rect x="-20" y="-0.7" width="40" height="1.4" fill="url(#monte-raio-h)"></rect>' +
          '<rect x="-0.7" y="-20" width="1.4" height="40" fill="url(#monte-raio-v)"></rect></g>' +
          '<circle class="nucleo" r="3.4"></circle><text></text>';
        g.style.setProperty("--d", ((i * 0.73) % 2.6).toFixed(2) + "s");
        gEstrelas.appendChild(g);
        desenhadas[chave] = g;
        if (comFaiscas) {
          novas[e.id] = true;
          (function (g, pc) {
            faiscas.convergir([{ x: pc.x, y: pc.y, n: 46 }], {
              dur: NASCER,
              onChegar: function () {
                g.classList.remove("esperando");
                g.classList.add("nova");
                faiscas.explodir(pc.x, pc.y, { n: 14, vel: 80 });
              },
            });
          })(g, paraCanvas(e.x, e.y));
        }
      }
      g.setAttribute("transform", "translate(" + e.x + " " + e.y + ")");
      g.style.setProperty("--ordem", i);
      var t = g.querySelector("text");
      t.textContent = e.rotulo;
      var esquerda = e.x > 430;
      t.setAttribute("x", esquerda ? -12 : 12);
      t.setAttribute("y", -12);
      t.setAttribute("text-anchor", esquerda ? "end" : "start");
    });
    // linhas entre estrelas consecutivas (e o fechamento, quando completa)
    var pares = [];
    for (var i = 1; i < lista.length; i++) pares.push([lista[i - 1], lista[i]]);
    if (completa && lista.length > 2) pares.push([lista[lista.length - 1], lista[0]]);
    pares.forEach(function (p) {
      var chave = "l:" + p[0].id + ">" + p[1].id;
      vivos[chave] = true;
      var l = desenhadas[chave];
      var pl = desenhadas["p" + chave];
      if (!pl) {
        pl = document.createElementNS(NS, "line");
        pl.setAttribute("pathLength", "1");
        pl.setAttribute("class", "monte__pulso");
        pl.style.animationDelay = (0.9 + (Object.keys(desenhadas).length % 7) * 0.45).toFixed(2) + "s";
        gLinhas.appendChild(pl);
        desenhadas["p" + chave] = pl;
      }
      vivos["p" + chave] = true;
      pl.setAttribute("x1", p[0].x);
      pl.setAttribute("y1", p[0].y);
      pl.setAttribute("x2", p[1].x);
      pl.setAttribute("y2", p[1].y);
      if (!l) {
        l = document.createElementNS(NS, "line");
        l.setAttribute("pathLength", "1");
        l.setAttribute("class", "monte__linha" + (completa && p[1] === lista[0] ? " fecho" : ""));
        gLinhas.appendChild(l);
        desenhadas[chave] = l;
        if (!reduzido) {
          var espera = novas[p[1].id] ? NASCER : 0;
          l.style.strokeDashoffset = "1";
          l.style.transitionDelay = espera + "ms";
          requestAnimationFrame(function () {
            requestAnimationFrame(function () {
              l.style.strokeDashoffset = "0";
            });
          });
          if (comFaiscas) {
            var a = paraCanvas(p[0].x, p[0].y), b = paraCanvas(p[1].x, p[1].y);
            faiscas.cometa(a.x, a.y, b.x, b.y, { dur: 780, atraso: espera });
          }
        }
      }
      l.setAttribute("x1", p[0].x);
      l.setAttribute("y1", p[0].y);
      l.setAttribute("x2", p[1].x);
      l.setAttribute("y2", p[1].y);
    });
    // remove o que saiu
    Object.keys(desenhadas).forEach(function (k) {
      if (!vivos[k]) {
        desenhadas[k].remove();
        delete desenhadas[k];
      }
    });
    svg.classList.toggle("completa", !!completa);
    if (completa && !jaCompleta && comFaiscas) {
      var pts = lista.map(function (e) {
        return paraCanvas(e.x, e.y);
      });
      pts.forEach(function (pc, i) {
        faiscas.explodir(pc.x, pc.y, { n: 22, vel: 140, atraso: 0.25 + i * 0.14 });
      });
      var xs = pts.map(function (p) { return p.x; });
      var ys = pts.map(function (p) { return p.y; });
      var cx = (Math.min.apply(null, xs) + Math.max.apply(null, xs)) / 2;
      var cy = (Math.min.apply(null, ys) + Math.max.apply(null, ys)) / 2;
      setTimeout(function () {
        faiscas.orbitar(cx, cy, {
          rx: (Math.max.apply(null, xs) - Math.min.apply(null, xs)) / 2 + 40,
          ry: (Math.max.apply(null, ys) - Math.min.apply(null, ys)) / 2 + 30,
          n: 120,
          dur: 4800,
        });
      }, 500 + pts.length * 140);
    }
    jaCompleta = !!completa;
  }

  // ---------- Perguntas ----------
  function podeAvancar() {
    var p = PERGUNTAS[passo];
    return p.multipla ? respostas[p.chave].length > 0 : !!respostas[p.chave];
  }
  function mostrarPergunta(focar) {
    var p = PERGUNTAS[passo];
    var html =
      '<p class="monte__passo">Pergunta ' + (passo + 1) + " de " + PERGUNTAS.length + "</p>" +
      '<h3 class="monte__titulo" tabindex="-1">' + esc(p.titulo) + "</h3>" +
      (p.ajuda ? '<p class="monte__ajuda">' + esc(p.ajuda) + "</p>" : "") +
      '<div class="monte__opcoes" role="group" aria-label="' + esc(p.titulo) + '">' +
      p.opcoes.map(function (o) {
        var marcado = p.multipla ? respostas[p.chave].indexOf(o.valor) > -1 : respostas[p.chave] === o.valor;
        return '<button type="button" class="monte__opcao" aria-pressed="' + marcado + '" data-valor="' + esc(o.valor) + '">' +
          '<span class="monte__marca" aria-hidden="true"></span>' + esc(o.valor) + "</button>";
      }).join("") +
      "</div>" +
      '<div class="monte__nav">' +
      (passo > 0 ? '<button type="button" class="botao botao--fantasma botao--pequeno" data-acao="voltar">Voltar</button>' : "<span></span>") +
      '<button type="button" class="botao botao--primario botao--pequeno" data-acao="avancar"' + (podeAvancar() ? "" : " disabled") + ">" +
      (passo === PERGUNTAS.length - 1 ? "Ver minha constelação" : "Continuar") + "</button>" +
      "</div>";
    caixa.innerHTML = html;
    if (focar) caixa.querySelector(".monte__titulo").focus({ preventScroll: true });
  }
  function mostrarResultado() {
    var nec = respostas.necessidades.map(function (v) {
      return opcao(PERGUNTAS[0], v).faremos;
    });
    var est = opcao(PERGUNTAS[1], respostas.estagio);
    var nome = respostas.nome.trim();
    var mensagem =
      "Olá, ORION! Montei a constelação do meu projeto no site:\n" +
      "• Preciso de: " + respostas.necessidades.join(", ") + "\n" +
      "• Estágio: " + respostas.estagio + "\n" +
      "• Prazo: " + respostas.prazo + "\n" +
      "• Para: " + respostas.publico +
      (nome ? "\n\nMeu nome é " + nome + "." : "");
    var link = "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(mensagem);
    caixa.innerHTML =
      '<p class="monte__passo">Pronto</p>' +
      '<h3 class="monte__titulo" tabindex="-1">' + (nome ? "A constelação do projeto de " + esc(nome) : "A constelação do seu projeto") + "</h3>" +
      '<p class="monte__ajuda">O que faríamos juntos:</p>' +
      '<ul class="monte__lista">' + nec.map(function (t) {
        return "<li>" + esc(t) + "</li>";
      }).join("") + "</ul>" +
      '<p class="monte__proximo">' + esc(est.passo) + " Prazo: " + esc(respostas.prazo.toLowerCase()) + ".</p>" +
      '<div class="monte__nav">' +
      '<button type="button" class="botao botao--fantasma botao--pequeno" data-acao="recomecar">Recomeçar</button>' +
      '<a class="botao botao--primario botao--pequeno" href="' + link + '" target="_blank" rel="noopener">' +
      '<svg class="ico" aria-hidden="true"><use href="#i-whatsapp" /></svg> Enviar pelo WhatsApp</a>' +
      "</div>";
    nomeCeu.textContent = nome ? "Constelação de " + nome : "A sua constelação";
    desenhar(true);
    caixa.querySelector(".monte__titulo").focus({ preventScroll: true });
  }
  function mostrarNome() {
    caixa.innerHTML =
      '<p class="monte__passo">Último detalhe</p>' +
      '<h3 class="monte__titulo" tabindex="-1">Como podemos te chamar?</h3>' +
      '<p class="monte__ajuda">Opcional. O nome entra na mensagem e batiza a sua constelação.</p>' +
      '<form class="monte__form" novalidate>' +
      '<label class="sr" for="monte-campo-nome">Seu nome</label>' +
      '<input id="monte-campo-nome" class="monte__campo" autocomplete="given-name" placeholder="Seu nome" value="' + esc(respostas.nome) + '" />' +
      '<div class="monte__nav">' +
      '<button type="button" class="botao botao--fantasma botao--pequeno" data-acao="voltar">Voltar</button>' +
      '<button type="submit" class="botao botao--primario botao--pequeno">Ver minha constelação</button>' +
      "</div></form>";
    var campo = caixa.querySelector("#monte-campo-nome");
    campo.addEventListener("input", function () {
      respostas.nome = campo.value;
      nomeCeu.textContent = campo.value.trim() ? "Constelação de " + campo.value.trim() : "";
    });
    caixa.querySelector("form").addEventListener("submit", function (ev) {
      ev.preventDefault();
      passo = PERGUNTAS.length + 1;
      mostrarResultado();
    });
    caixa.querySelector(".monte__titulo").focus({ preventScroll: true });
  }
  function irPara(n) {
    passo = n;
    if (n < PERGUNTAS.length) mostrarPergunta(true);
    else mostrarNome();
    desenhar(false);
  }

  caixa.addEventListener("click", function (ev) {
    var op = ev.target.closest(".monte__opcao");
    if (op) {
      var p = PERGUNTAS[passo];
      var v = op.getAttribute("data-valor");
      if (p.multipla) {
        var i = respostas[p.chave].indexOf(v);
        if (i > -1) respostas[p.chave].splice(i, 1);
        else respostas[p.chave].push(v);
        mostrarPergunta(false);
        caixa.querySelector('.monte__opcao[data-valor="' + CSS.escape(v) + '"]').focus();
      } else {
        respostas[p.chave] = v;
        mostrarPergunta(false);
        caixa.querySelector('.monte__opcao[data-valor="' + CSS.escape(v) + '"]').focus();
        // escolha única: avança sozinho depois de a estrela acender
        setTimeout(function () {
          if (PERGUNTAS[passo] === p && respostas[p.chave] === v) irPara(passo + 1);
        }, reduzido ? 0 : 650);
      }
      desenhar(false);
      return;
    }
    var acao = ev.target.closest("[data-acao]");
    if (!acao) return;
    var a = acao.getAttribute("data-acao");
    if (a === "avancar" && podeAvancar()) irPara(passo + 1);
    if (a === "voltar") irPara(Math.max(0, passo - 1));
    if (a === "recomecar") {
      respostas = { necessidades: [], estagio: null, prazo: null, publico: null, nome: "" };
      nomeCeu.textContent = "";
      irPara(0);
    }
  });

  mostrarPergunta(false);
})();
