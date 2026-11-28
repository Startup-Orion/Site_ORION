/*
 * Faíscas: motor de partículas leve (canvas 2D) para as constelações do site.
 * A mesma linguagem da intro 3D: estrelas que nascem de poeira estelar, cometas e explosões de luz.
 *
 * Uso:
 *   const f = OrionFaiscas.criar(canvas);
 *   f.convergir([{ x, y, n }], { dur: 1200, onChegar(i) {...} }); // poeira vira estrela
 *   f.cometa(x1, y1, x2, y2, { dur: 900, atraso: 0 });            // cometa traça uma linha
 *   f.explodir(x, y, { n: 24 });                                   // faíscas
 *   f.rastro(x, y, { angulo });                                    // cauda contínua
 *   f.orbitar(cx, cy, { rx, ry, n, dur });                         // nuvem orbitando
 *
 * - Só desenha enquanto há partículas vivas (o laço para sozinho).
 * - "Reduzir movimento": nada é animado e os callbacks são chamados na hora.
 */
(function () {
  "use strict";

  var reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var CORES = {
    azul: "55,181,255",
    branco: "255,255,255",
    gelo: "200,236,255",
  };
  var sprites = {};
  function sprite(nome) {
    if (sprites[nome]) return sprites[nome];
    var rgb = CORES[nome] || CORES.branco;
    var c = document.createElement("canvas");
    c.width = c.height = 64;
    var g = c.getContext("2d");
    var gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, "rgba(255,255,255,1)");
    gr.addColorStop(0.18, "rgba(" + rgb + ",0.9)");
    gr.addColorStop(0.45, "rgba(" + rgb + ",0.28)");
    gr.addColorStop(1, "rgba(" + rgb + ",0)");
    g.fillStyle = gr;
    g.fillRect(0, 0, 64, 64);
    sprites[nome] = c;
    return c;
  }
  function suave(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
  function saida(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function criar(canvas) {
    var ctx = canvas.getContext("2d");
    var w = 0, h = 0, dpr = 1;
    var parts = [];
    var rodando = false;
    var ultimo = 0;

    function medir() {
      var r = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width;
      h = r.height;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    new ResizeObserver(medir).observe(canvas);
    medir();

    function iniciar() {
      if (rodando || reduzido) return;
      rodando = true;
      ultimo = performance.now();
      requestAnimationFrame(laco);
    }

    function laco(agora) {
      var dt = Math.min(0.05, (agora - ultimo) / 1000);
      ultimo = agora;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      for (var i = parts.length - 1; i >= 0; i--) {
        var p = parts[i];
        p.idade += dt;
        if (p.idade < 0) continue; // ainda esperando o atraso
        var k = p.idade / p.vida;
        if (k >= 1) {
          if (p.fim) p.fim();
          parts.splice(i, 1);
          continue;
        }
        var x, y, alfa, tam = p.tam;
        if (p.tipo === "convergir") {
          var e = suave(k);
          // curva de Bézier: a poeira faz um arco até a estrela
          var u = 1 - e;
          x = u * u * p.x0 + 2 * u * e * p.cx + e * e * p.x1;
          y = u * u * p.y0 + 2 * u * e * p.cy + e * e * p.y1;
          alfa = Math.min(1, k * 4) * (0.35 + 0.65 * e);
          tam = p.tam * (1.2 - 0.5 * e);
        } else if (p.tipo === "cometa") {
          var ec = suave(k);
          x = p.x0 + (p.x1 - p.x0) * ec;
          y = p.y0 + (p.y1 - p.y0) * ec;
          alfa = Math.sin(Math.PI * Math.min(1, k * 1.15)) * 0.4 + 0.6;
          // a cabeça solta uma cauda de faíscas
          for (var n = 0; n < 2; n++) {
            soltar({
              tipo: "livre", x: x, y: y,
              vx: (Math.random() - 0.5) * 22 - (p.x1 - p.x0) * 0.08,
              vy: (Math.random() - 0.5) * 22 - (p.y1 - p.y0) * 0.08,
              vida: 0.45 + Math.random() * 0.35, tam: 4 + Math.random() * 5,
              cor: Math.random() < 0.5 ? "azul" : "gelo", arrasto: 2.2,
            });
          }
          if (k > 0.98 && p.fim) {
            p.fim();
            p.fim = null;
          }
        } else if (p.tipo === "orbita") {
          var ang = p.ang0 + p.giro * p.idade;
          x = p.cx + Math.cos(ang) * p.rx;
          y = p.cy + Math.sin(ang) * p.ry;
          alfa = Math.sin(Math.PI * k) * p.brilho;
        } else {
          // livre: velocidade com arrasto
          p.vx *= 1 - (p.arrasto || 1.5) * dt;
          p.vy *= 1 - (p.arrasto || 1.5) * dt;
          p.vy += (p.gravidade || 0) * dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          x = p.x;
          y = p.y;
          alfa = 1 - k;
          tam = p.tam * (1 - k * 0.5);
        }
        ctx.globalAlpha = Math.max(0, Math.min(1, alfa));
        ctx.drawImage(sprite(p.cor), x - tam / 2, y - tam / 2, tam, tam);
      }
      ctx.globalAlpha = 1;
      if (parts.length) requestAnimationFrame(laco);
      else {
        rodando = false;
        ctx.clearRect(0, 0, w, h);
      }
    }

    function soltar(p) {
      p.idade = -(p.atraso || 0);
      parts.push(p);
    }

    return {
      medir: medir,
      // Poeira espalhada converge e forma estrelas. alvos: [{ x, y, n, cor }]
      convergir: function (alvos, op) {
        op = op || {};
        var dur = (op.dur || 1200) / 1000;
        alvos.forEach(function (a, i) {
          if (reduzido) {
            if (op.onChegar) op.onChegar(i);
            return;
          }
          var raio = op.raio || Math.max(w, h) * 0.6;
          for (var k = 0; k < (a.n || 30); k++) {
            var ang = Math.random() * Math.PI * 2;
            var r = raio * (0.35 + Math.random() * 0.65);
            var x0 = a.x + Math.cos(ang) * r;
            var y0 = a.y + Math.sin(ang) * r;
            // ponto de controle: puxa a trajetória para o lado (efeito de redemoinho)
            var lado = (Math.random() < 0.5 ? -1 : 1) * r * 0.45;
            soltar({
              tipo: "convergir", x0: x0, y0: y0, x1: a.x, y1: a.y,
              cx: (x0 + a.x) / 2 - Math.sin(ang) * lado, cy: (y0 + a.y) / 2 + Math.cos(ang) * lado,
              vida: dur * (0.6 + Math.random() * 0.4), atraso: Math.random() * dur * 0.25,
              tam: 4 + Math.random() * 6, cor: a.cor || (Math.random() < 0.6 ? "gelo" : "azul"),
            });
          }
          if (op.onChegar) setTimeout(function () { op.onChegar(i); }, dur * 870);
        });
        iniciar();
      },
      // Explosão de faíscas a partir de um ponto
      explodir: function (x, y, op) {
        if (reduzido) return;
        op = op || {};
        var n = op.n || 24;
        for (var k = 0; k < n; k++) {
          var ang = Math.random() * Math.PI * 2;
          var v = (op.vel || 120) * (0.4 + Math.random());
          soltar({
            tipo: "livre", x: x, y: y, vx: Math.cos(ang) * v, vy: Math.sin(ang) * v,
            vida: 0.5 + Math.random() * 0.6, tam: 4 + Math.random() * 7,
            cor: op.cor || (Math.random() < 0.5 ? "gelo" : "azul"), arrasto: 2.6,
            atraso: op.atraso || 0,
          });
        }
        iniciar();
      },
      // Cometa que percorre uma linha, soltando cauda
      cometa: function (x1, y1, x2, y2, op) {
        op = op || {};
        if (reduzido) {
          if (op.onFim) op.onFim();
          return;
        }
        soltar({
          tipo: "cometa", x0: x1, y0: y1, x1: x2, y1: y2,
          vida: (op.dur || 900) / 1000, atraso: (op.atraso || 0) / 1000, tam: 14, cor: "branco",
          fim: op.onFim || null,
        });
        iniciar();
      },
      // Cauda contínua (chamada a cada quadro por quem anima a cabeça)
      rastro: function (x, y, op) {
        if (reduzido) return;
        op = op || {};
        var ang = op.angulo || 0;
        for (var k = 0; k < (op.n || 2); k++) {
          soltar({
            tipo: "livre", x: x, y: y,
            vx: -Math.cos(ang) * (20 + Math.random() * 30) + (Math.random() - 0.5) * 30,
            vy: -Math.sin(ang) * (20 + Math.random() * 30) + (Math.random() - 0.5) * 30,
            vida: 0.5 + Math.random() * 0.5, tam: 4 + Math.random() * 6,
            cor: Math.random() < 0.5 ? "azul" : "gelo", arrasto: 1.8,
          });
        }
        iniciar();
      },
      // Nuvem de partículas orbitando um ponto (fecho de constelação)
      orbitar: function (cx, cy, op) {
        if (reduzido) return;
        op = op || {};
        var n = op.n || 90;
        for (var k = 0; k < n; k++) {
          var esc = 0.55 + Math.random() * 0.6;
          soltar({
            tipo: "orbita", cx: cx, cy: cy,
            rx: (op.rx || 150) * esc, ry: (op.ry || 100) * esc,
            ang0: Math.random() * Math.PI * 2, giro: (0.35 + Math.random() * 0.5) * (Math.random() < 0.85 ? 1 : -1),
            vida: (op.dur || 4000) / 1000 * (0.7 + Math.random() * 0.3), atraso: Math.random() * 0.6,
            tam: 5 + Math.random() * 8, brilho: 0.55 + Math.random() * 0.45,
            cor: Math.random() < 0.55 ? "azul" : "gelo",
          });
        }
        iniciar();
      },
    };
  }

  window.OrionFaiscas = { criar: criar, reduzido: reduzido };
})();
