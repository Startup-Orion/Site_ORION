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

  // Céu de fundo discreto
  (function () {
    var s = 11;
    function r() {
      s = (s * 1103515245 + 12345) >>> 0;
      return s / 4294967296;
    }
    for (var i = 0; i < 46; i++) {
      var c = document.createElementNS(NS, "circle");
      c.setAttribute("cx", (r() * 560).toFixed(1));
      c.setAttribute("cy", (r() * 420).toFixed(1));
      c.setAttribute("r", (0.5 + r() * 1.1).toFixed(2));
      c.setAttribute("opacity", (0.12 + r() * 0.35).toFixed(2));
      gFundo.appendChild(c);
    }
  })();

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
  function desenhar(completa) {
    var lista = estrelasAtuais();
    var vivos = {};
    // estrelas
    lista.forEach(function (e, i) {
      var chave = "e:" + e.id;
      vivos[chave] = true;
      var g = desenhadas[chave];
      if (!g) {
        g = document.createElementNS(NS, "g");
        g.setAttribute("class", "monte__estrela" + (reduzido ? "" : " nova"));
        g.innerHTML = '<circle class="halo" r="16"></circle><circle class="nucleo" r="4.5"></circle><text></text>';
        gEstrelas.appendChild(g);
        desenhadas[chave] = g;
      }
      g.setAttribute("transform", "translate(" + e.x + " " + e.y + ")");
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
      if (!l) {
        l = document.createElementNS(NS, "line");
        l.setAttribute("pathLength", "1");
        l.setAttribute("class", "monte__linha" + (completa && p[1] === lista[0] ? " fecho" : ""));
        gLinhas.appendChild(l);
        desenhadas[chave] = l;
        if (!reduzido) {
          l.style.strokeDashoffset = "1";
          requestAnimationFrame(function () {
            requestAnimationFrame(function () {
              l.style.strokeDashoffset = "0";
            });
          });
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
