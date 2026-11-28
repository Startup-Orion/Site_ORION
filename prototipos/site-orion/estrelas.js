/*
 * Céu animado compartilhado (canvas): estrelas em 3 camadas de profundidade que cintilam,
 * reagem ao mouse e, de vez em quando, uma estrela cadente. Cores do logo, sem arco-íris.
 * - Só anima enquanto está na tela; para quando a aba fica oculta.
 * - "Reduzir movimento": desenha o céu parado, sem cadentes.
 * Uso: OrionEstrelas.ceu(canvas, { densidade: 1, cadentes: true, paralaxe: 14 })
 */
(function () {
  "use strict";

  var reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var CORES = ["255,255,255", "255,255,255", "255,255,255", "55,181,255", "190,228,255"];

  function ceu(canvas, opcoes) {
    opcoes = opcoes || {};
    var densidade = opcoes.densidade || 1;
    var comCadentes = opcoes.cadentes !== false && !reduzido;
    var paralaxe = opcoes.paralaxe == null ? 14 : opcoes.paralaxe;
    var ctx = canvas.getContext("2d");
    var w = 0, h = 0, dpr = 1;
    var estrelas = [];
    var cadentes = [];
    var proximaCadente = 0;
    var mouse = { x: 0, y: 0, ax: 0, ay: 0 };
    var visivel = false;
    var rodando = false;
    var semente = opcoes.semente || 3;

    function aleatorio() {
      semente = (semente * 1103515245 + 12345) >>> 0;
      return semente / 4294967296;
    }
    function criar() {
      estrelas = [];
      var total = Math.round(((w * h) / 9000) * densidade);
      for (var i = 0; i < total; i++) {
        var z = aleatorio(); // 0 = longe, 1 = perto
        var r = 0.35 + z * z * 1.5;
        estrelas.push({
          x: aleatorio(),
          y: aleatorio(),
          z: z,
          r: r,
          a: 0.18 + aleatorio() * 0.55,
          cor: CORES[Math.floor(aleatorio() * CORES.length)],
          vel: 0.6 + aleatorio() * 2.2,
          fase: aleatorio() * Math.PI * 2,
          raios: r > 1.45 && aleatorio() < 0.7, // as maiores ganham raios de 4 pontas
        });
      }
    }
    function medir() {
      var r = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      w = r.width;
      h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      criar();
      if (!rodando) desenhar(0);
    }

    function raios(x, y, tam, alfa, cor) {
      var g = ctx.createLinearGradient(x - tam, y, x + tam, y);
      g.addColorStop(0, "rgba(" + cor + ",0)");
      g.addColorStop(0.5, "rgba(" + cor + "," + alfa + ")");
      g.addColorStop(1, "rgba(" + cor + ",0)");
      ctx.fillStyle = g;
      ctx.fillRect(x - tam, y - 0.5, tam * 2, 1);
      g = ctx.createLinearGradient(x, y - tam, x, y + tam);
      g.addColorStop(0, "rgba(" + cor + ",0)");
      g.addColorStop(0.5, "rgba(" + cor + "," + alfa + ")");
      g.addColorStop(1, "rgba(" + cor + ",0)");
      ctx.fillStyle = g;
      ctx.fillRect(x - 0.5, y - tam, 1, tam * 2);
    }

    function novaCadente() {
      var paraDireita = aleatorio() < 0.5;
      var ang = (paraDireita ? 25 : 155) + (aleatorio() * 16 - 8);
      cadentes.push({
        x: w * (0.15 + aleatorio() * 0.7),
        y: h * (0.05 + aleatorio() * 0.35),
        ang: (ang * Math.PI) / 180,
        vel: 700 + aleatorio() * 500,
        comp: 90 + aleatorio() * 110,
        vida: 0,
        dur: 0.9 + aleatorio() * 0.5,
      });
    }

    function desenhar(t) {
      ctx.clearRect(0, 0, w, h);
      mouse.ax += (mouse.x - mouse.ax) * 0.05;
      mouse.ay += (mouse.y - mouse.ay) * 0.05;
      for (var i = 0; i < estrelas.length; i++) {
        var e = estrelas[i];
        var cint = reduzido ? 1 : 0.6 + 0.4 * Math.sin(t * 0.001 * e.vel + e.fase);
        var x = e.x * w - mouse.ax * paralaxe * e.z;
        var y = e.y * h - mouse.ay * paralaxe * e.z;
        var alfa = e.a * cint;
        ctx.fillStyle = "rgba(" + e.cor + "," + alfa.toFixed(3) + ")";
        ctx.beginPath();
        ctx.arc(x, y, e.r, 0, 6.2832);
        ctx.fill();
        if (e.raios) raios(x, y, e.r * (4 + 3 * cint), alfa * 0.55, e.cor);
      }
      // estrelas cadentes
      for (var k = cadentes.length - 1; k >= 0; k--) {
        var c = cadentes[k];
        c.vida += 1 / 60;
        var p = c.vida / c.dur;
        if (p >= 1) {
          cadentes.splice(k, 1);
          continue;
        }
        var dist = c.vel * c.vida;
        var hx = c.x + Math.cos(c.ang) * dist;
        var hy = c.y + Math.sin(c.ang) * dist;
        var tx = hx - Math.cos(c.ang) * c.comp;
        var ty = hy - Math.sin(c.ang) * c.comp;
        var brilho = Math.sin(Math.PI * p);
        var g = ctx.createLinearGradient(tx, ty, hx, hy);
        g.addColorStop(0, "rgba(55,181,255,0)");
        g.addColorStop(1, "rgba(220,242,255," + (0.85 * brilho).toFixed(3) + ")");
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.4;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(hx, hy);
        ctx.stroke();
        ctx.fillStyle = "rgba(255,255,255," + brilho.toFixed(3) + ")";
        ctx.beginPath();
        ctx.arc(hx, hy, 1.6, 0, 6.2832);
        ctx.fill();
      }
      if (comCadentes && t > proximaCadente) {
        if (proximaCadente) novaCadente();
        proximaCadente = t + 5000 + aleatorio() * 9000;
      }
    }

    var ultimo = 0;
    function laco(t) {
      if (!visivel || document.hidden) {
        rodando = false;
        return;
      }
      // ~40 quadros por segundo bastam para o cintilar
      if (t - ultimo > 24) {
        ultimo = t;
        desenhar(t);
      }
      requestAnimationFrame(laco);
    }
    function iniciar() {
      if (rodando || reduzido) return;
      rodando = true;
      requestAnimationFrame(laco);
    }

    new ResizeObserver(medir).observe(canvas);
    new IntersectionObserver(function (e) {
      visivel = e[0].isIntersecting;
      if (visivel) iniciar();
    }).observe(canvas);
    document.addEventListener("visibilitychange", function () {
      if (!document.hidden && visivel) iniciar();
    });
    if (!reduzido && paralaxe) {
      window.addEventListener(
        "pointermove",
        function (ev) {
          if (ev.pointerType !== "mouse") return;
          mouse.x = ev.clientX / window.innerWidth - 0.5;
          mouse.y = ev.clientY / window.innerHeight - 0.5;
        },
        { passive: true }
      );
    }
    medir();
    return { medir: medir };
  }

  window.OrionEstrelas = { ceu: ceu };
})();
