/*
 * Vídeos em loop dos projetos.
 * - Tocam sozinhos (mudos) só quando estão na tela; pausam quando saem.
 * - Não tocam sozinhos se a pessoa pediu "reduzir movimento" ou "economia de dados",
 *   nem em conexões lentas: aparece a capa com um botão de tocar.
 * - O botão de pausar/tocar sempre funciona, e a escolha da pessoa é respeitada.
 */
(function () {
  "use strict";

  var reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var con = navigator.connection || {};
  var economia = !!con.saveData || /(^|-)2g$/.test(con.effectiveType || "");
  var automatico = !reduzido && !economia;

  function preparar(caixa) {
    var video = caixa.querySelector("video");
    var botao = caixa.querySelector(".midia__controle");
    if (!video || !botao) return;
    var pausadoPelaPessoa = false;
    var visivel = false;

    function atualizarBotao() {
      var parado = video.paused;
      botao.classList.toggle("parado", parado);
      botao.setAttribute("aria-label", parado ? "Tocar vídeo" : "Pausar vídeo");
    }
    video.addEventListener("play", atualizarBotao);
    video.addEventListener("pause", atualizarBotao);
    atualizarBotao();

    function tocar() {
      if (video.preload !== "auto") video.preload = "auto";
      var p = video.play();
      if (p && p.catch) p.catch(atualizarBotao);
    }

    botao.addEventListener("click", function (ev) {
      ev.preventDefault();
      ev.stopPropagation();
      if (video.paused) {
        pausadoPelaPessoa = false;
        tocar();
      } else {
        pausadoPelaPessoa = true;
        video.pause();
      }
    });

    new IntersectionObserver(
      function (entradas) {
        visivel = entradas[0].isIntersecting;
        if (caixa.dataset.completo) return; // vídeo completo: quem controla é a pessoa
        if (visivel && automatico && !pausadoPelaPessoa) tocar();
        else if (!visivel && !video.paused) video.pause();
      },
      { threshold: 0.35 }
    ).observe(caixa);

    // Começa a baixar um pouco antes de aparecer, para não ficar na capa à toa.
    if (automatico) {
      new IntersectionObserver(
        function (entradas, obs) {
          if (entradas[0].isIntersecting) {
            video.preload = "auto";
            obs.disconnect();
          }
        },
        { rootMargin: "400px 0px" }
      ).observe(caixa);
    }
  }

  window.prepararVideosOrion = function (raiz) {
    (raiz || document).querySelectorAll("[data-midia], .projeto__midia").forEach(preparar);
  };
  window.prepararVideosOrion();
})();
