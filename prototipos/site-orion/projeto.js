/* Página "Saiba mais" de um projeto ou evento. Lê ?p=<slug> e monta a partir de projetos.js. */
(function () {
  "use strict";

  var WHATSAPP = "5592991339221";
  var lista = window.PROJETOS_ORION || [];
  var slug = new URLSearchParams(location.search).get("p");
  var indice = lista.findIndex(function (p) {
    return p.slug === slug;
  });
  if (indice < 0) {
    location.replace("index.html#projetos");
    return;
  }
  var p = lista[indice];
  var proximo = lista[(indice + 1) % lista.length];

  function esc(t) {
    return String(t).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  // Parágrafo com links no formato [texto](https://...)
  function paragrafo(t) {
    return esc(t).replace(/\[([^\]]+)\]\((https:\/\/[^)\s]+)\)/g, function (_, rotulo, url) {
      return '<a href="' + url + '" target="_blank" rel="noopener">' + rotulo + "</a>";
    });
  }
  function linkWhats(texto) {
    return "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(texto);
  }
  var whats = linkWhats("Olá, ORION! Vi a página do " + p.titulo + " no site e quero saber mais.");
  document.title = p.titulo + " — ORION";
  document.getElementById("topo-whats").href = whats;
  document.getElementById("rodape-whats").href = whats;

  // Fotos: a foto principal (horizontal) abre a galeria, seguida dos quadros dos vídeos.
  var fotos = [p.foto].concat(p.galeria);

  var html =
    '<section class="detalhe__topo">' +
    '  <div class="detalhe__texto">' +
    '    <a class="detalhe__voltar" href="index.html#projetos"><svg class="ico" aria-hidden="true"><use href="#i-voltar" /></svg> Portfólio</a>' +
    '    <p class="projeto__tipo">' + esc(p.tipo) + "</p>" +
    '    <h1 class="detalhe__titulo" style="view-transition-name: titulo-' + p.slug + '">' + esc(p.titulo) + "</h1>" +
    '    <p class="detalhe__chamada">' + esc(p.chamada) + "</p>" +
    '    <p class="detalhe__quando">' + esc(p.quando) + "</p>" +
    '    <p class="projeto__selo"><svg class="ico" aria-hidden="true"><use href="#i-ideia" /></svg> ' + esc(p.selo) + "</p>" +
    '    <p class="detalhe__resumo">' + esc(p.resumo) + "</p>" +
    '    <div class="hero__acoes">' +
    '      <a class="botao botao--primario" href="' + whats + '" target="_blank" rel="noopener"><svg class="ico" aria-hidden="true"><use href="#i-whatsapp" /></svg> Conversar sobre este projeto</a>' +
    "    </div>" +
    "  </div>" +
    '  <div class="detalhe__midia" style="view-transition-name: midia-' + p.slug + '">' +
    '    <video class="detalhe__video" controls playsinline preload="auto" poster="video/' + p.slug + '-capa.jpg" src="video/' + p.slug + '-completo.mp4" aria-label="Vídeo: ' + esc(p.titulo) + '"></video>' +
    (p.temAudio
      ? '    <button class="detalhe__som" type="button" hidden><svg class="ico" aria-hidden="true"><use href="#i-som" /></svg> Ativar som</button>'
      : "") +
    "  </div>" +
    "</section>" +
    '<section class="detalhe__historia">' +
    '  <div class="detalhe__artigo">' +
    p.texto.map(function (t) {
      return "<p>" + paragrafo(t) + "</p>";
    }).join("") +
    "  </div>" +
    '  <aside class="detalhe__ficha" aria-label="Ficha do projeto">' +
    "    <h2>Tecnologias e temas</h2>" +
    '    <ul class="etiquetas">' +
    p.tecnologias.map(function (t) {
      return "<li>" + esc(t) + "</li>";
    }).join("") +
    "</ul>" +
    (p.links.length
      ? "<h2>Saiba mais</h2><ul class=\"detalhe__links\">" +
        p.links.map(function (l) {
          return '<li><a href="' + esc(l.url) + '" target="_blank" rel="noopener">' + esc(l.rotulo) +
            ' <svg class="ico" aria-hidden="true"><use href="#i-seta" /></svg></a></li>';
        }).join("") +
        "</ul>"
      : "") +
    "  </aside>" +
    "</section>" +
    '<section class="detalhe__galeria" id="galeria">' +
    '  <h2 class="secao__titulo">Registros</h2>' +
    '  <ul class="galeria">' +
    fotos.map(function (f, i) {
      return '<li class="galeria__item' + (i === 0 ? " galeria__item--destaque" : "") + '" style="--i:' + i + '">' +
        '<button type="button" data-foto="' + i + '" aria-label="Ampliar: ' + esc(f.alt) + '">' +
        '<img src="' + esc(f.src) + '" alt="' + esc(f.alt) + '" loading="lazy" /></button></li>';
    }).join("") +
    "  </ul>" +
    "</section>" +
    '<section class="detalhe__proximo">' +
    '  <a class="proximo" href="projeto.html?p=' + proximo.slug + '">' +
    '    <span class="proximo__rotulo">Próximo</span>' +
    '    <span class="proximo__titulo">' + esc(proximo.titulo) + "</span>" +
    '    <span class="proximo__tipo">' + esc(proximo.tipo) + ", " + esc(proximo.quando) + "</span>" +
    '    <svg class="ico" aria-hidden="true"><use href="#i-seta" /></svg>' +
    "  </a>" +
    "</section>";
  document.getElementById("conteudo").innerHTML = html;

  // ---------- Vídeo completo, com som ----------
  // Tenta tocar com som (o navegador costuma permitir porque a pessoa acabou de clicar no site).
  // Se bloquear, toca mudo e mostra "Ativar som". Quem pediu menos movimento dá o play.
  var video = document.querySelector(".detalhe__video");
  var botaoSom = document.querySelector(".detalhe__som");
  var reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function mostrarBotaoSom() {
    if (botaoSom) botaoSom.hidden = !video.muted || video.paused;
  }
  video.addEventListener("volumechange", mostrarBotaoSom);
  video.addEventListener("play", mostrarBotaoSom);
  if (botaoSom) {
    botaoSom.addEventListener("click", function () {
      video.muted = false;
      video.volume = 1;
      if (video.paused) video.play();
    });
  }
  if (!reduzido) {
    video.muted = !p.temAudio;
    video.play().catch(function () {
      video.muted = true;
      video.play().catch(function () {});
    });
  }

  // ---------- Galeria em tela cheia ----------
  var dialogo = document.getElementById("lightbox");
  var img = document.getElementById("lightbox-img");
  var legenda = document.getElementById("lightbox-legenda");
  var atual = 0;
  var origem = null;
  function mostrar(i) {
    atual = (i + fotos.length) % fotos.length;
    img.src = fotos[atual].src;
    img.alt = fotos[atual].alt;
    legenda.textContent = fotos[atual].alt + "  (" + (atual + 1) + " de " + fotos.length + ")";
  }
  document.querySelector(".galeria").addEventListener("click", function (ev) {
    var b = ev.target.closest("[data-foto]");
    if (!b) return;
    origem = b;
    mostrar(Number(b.getAttribute("data-foto")));
    dialogo.showModal();
  });
  dialogo.querySelector(".lightbox__fechar").addEventListener("click", function () {
    dialogo.close();
  });
  dialogo.querySelector(".lightbox__ant").addEventListener("click", function () {
    mostrar(atual - 1);
  });
  dialogo.querySelector(".lightbox__prox").addEventListener("click", function () {
    mostrar(atual + 1);
  });
  dialogo.addEventListener("click", function (ev) {
    if (ev.target === dialogo) dialogo.close(); // clique fora da foto fecha
  });
  dialogo.addEventListener("keydown", function (ev) {
    if (ev.key === "ArrowLeft") mostrar(atual - 1);
    if (ev.key === "ArrowRight") mostrar(atual + 1);
  });
  dialogo.addEventListener("close", function () {
    if (origem) origem.focus();
  });
  // Arrastar para os lados no celular
  var x0 = null;
  dialogo.addEventListener("pointerdown", function (ev) {
    x0 = ev.clientX;
  });
  dialogo.addEventListener("pointerup", function (ev) {
    if (x0 == null) return;
    var dx = ev.clientX - x0;
    x0 = null;
    if (Math.abs(dx) > 50) mostrar(atual + (dx < 0 ? 1 : -1));
  });

  // Fotos aparecem em cascata ao chegar na galeria
  new IntersectionObserver(
    function (entradas, obs) {
      if (entradas[0].isIntersecting) {
        document.querySelector(".galeria").classList.add("visivel");
        obs.disconnect();
      }
    },
    { rootMargin: "0px 0px -10% 0px" }
  ).observe(document.querySelector(".galeria"));

  // ---------- Menu no celular ----------
  var menu = document.getElementById("menu");
  var menuBotao = document.querySelector(".menu-botao");
  menuBotao.addEventListener("click", function () {
    var aberto = menu.classList.toggle("aberto");
    menuBotao.setAttribute("aria-expanded", aberto ? "true" : "false");
  });
})();
