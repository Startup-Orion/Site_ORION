/*
 * Demo "Veja o que o ORION Lite vê": detecção de objetos no navegador (TensorFlow.js + COCO-SSD)
 * e descrição por voz (Web Speech). Tudo roda no aparelho; nenhuma imagem sai dele.
 * A biblioteca (~6 MB) só é baixada quando a pessoa pede.
 */
(function () {
  "use strict";

  var SCRIPTS = [
    "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js",
    "https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.3/dist/coco-ssd.min.js",
  ];
  var FOTO_TESTE = "img/ada-conecta.jpg"; // equipe no palco do Ada Conecta (horizontal)
  var AZUL = "#37B5FF";

  var NOMES = {
    person: "pessoa", bicycle: "bicicleta", car: "carro", motorcycle: "moto", bus: "ônibus", truck: "caminhão",
    "traffic light": "semáforo", "stop sign": "placa de pare", bench: "banco", dog: "cachorro", cat: "gato",
    backpack: "mochila", umbrella: "guarda-chuva", handbag: "bolsa", suitcase: "mala", bottle: "garrafa",
    cup: "copo", chair: "cadeira", couch: "sofá", "potted plant": "planta", bed: "cama", "dining table": "mesa",
    tv: "tela", laptop: "notebook", mouse: "mouse", keyboard: "teclado", "cell phone": "celular", book: "livro",
    clock: "relógio", vase: "vaso", scissors: "tesoura", "teddy bear": "bicho de pelúcia", refrigerator: "geladeira",
    sink: "pia", oven: "forno", microwave: "micro-ondas", toilet: "vaso sanitário", remote: "controle remoto",
    "fire hydrant": "hidrante", bird: "pássaro", banana: "banana", apple: "maçã", orange: "laranja",
  };

  var el = function (id) {
    return document.getElementById(id);
  };
  var video = el("visao-video");
  var desenho = el("visao-desenho");
  var ctx = desenho.getContext("2d");
  var vazio = el("visao-vazio");
  var leitura = el("visao-leitura");
  var controles = el("visao-controles");
  var botaoCamera = el("visao-camera");
  var botaoFoto = el("visao-foto");
  var botaoVoz = el("visao-voz");
  var botaoParar = el("visao-parar");

  var modelo = null;
  var carregando = null;
  var fluxo = null;
  var rodando = false;
  var vozLigada = true;
  var ultimaFala = { texto: "", quando: 0 };

  function carregarScript(src) {
    return new Promise(function (ok, erro) {
      var s = document.createElement("script");
      s.src = src;
      s.crossOrigin = "anonymous";
      s.onload = ok;
      s.onerror = function () {
        erro(new Error("Não foi possível baixar " + src));
      };
      document.head.appendChild(s);
    });
  }
  function carregarModelo() {
    if (modelo) return Promise.resolve(modelo);
    if (carregando) return carregando;
    leitura.textContent = "Carregando a inteligência artificial (uns segundos na primeira vez)...";
    carregando = SCRIPTS.reduce(function (p, src) {
      return p.then(function () {
        return carregarScript(src);
      });
    }, Promise.resolve())
      .then(function () {
        return window.cocoSsd.load({ base: "lite_mobilenet_v2" });
      })
      .then(function (m) {
        modelo = m;
        return m;
      })
      .catch(function (e) {
        carregando = null;
        throw e;
      });
    return carregando;
  }

  // ---------- Descrição: onde está e quão perto ----------
  function descrever(d, largura, altura) {
    var x = d.bbox[0], y = d.bbox[1], w = d.bbox[2], h = d.bbox[3];
    var centro = (x + w / 2) / largura;
    var lado = centro < 0.36 ? "à esquerda" : centro > 0.64 ? "à direita" : "à frente";
    var area = (w * h) / (largura * altura);
    var distancia = area > 0.22 ? "perto" : area > 0.06 ? "a meia distância" : "longe";
    var nome = NOMES[d.class] || d.class;
    return { nome: nome, lado: lado, distancia: distancia, area: area, texto: nome + " " + lado + ", " + distancia };
  }
  function falar(texto) {
    if (!vozLigada || !("speechSynthesis" in window)) return;
    var agora = Date.now();
    // Fala quando a cena muda ou a cada 5 s, sem atropelar a frase anterior.
    if ((texto === ultimaFala.texto && agora - ultimaFala.quando < 5000) || speechSynthesis.speaking) return;
    ultimaFala = { texto: texto, quando: agora };
    var u = new SpeechSynthesisUtterance(texto);
    u.lang = "pt-BR";
    u.rate = 1.05;
    var voz = speechSynthesis.getVoices().find(function (v) {
      return /pt(-|_)BR/i.test(v.lang);
    });
    if (voz) u.voice = voz;
    speechSynthesis.speak(u);
  }
  function maiuscula(t) {
    return t.charAt(0).toUpperCase() + t.slice(1);
  }

  // ---------- Desenho: cantos no traço da constelação ----------
  function desenharDeteccoes(lista, largura, altura) {
    var esc = Math.max(1, largura / 640);
    ctx.lineWidth = 2.5 * esc;
    ctx.strokeStyle = AZUL;
    ctx.font = "600 " + Math.round(15 * esc) + "px 'DM Sans', system-ui, sans-serif";
    ctx.textBaseline = "middle";
    // Rótulo só nos 3 maiores, para não embolar quando há muita gente.
    var comRotulo = lista.slice().sort(function (a, b) {
      return b.bbox[2] * b.bbox[3] - a.bbox[2] * a.bbox[3];
    }).slice(0, 3);
    lista.forEach(function (d) {
      var x = d.bbox[0], y = d.bbox[1], w = d.bbox[2], h = d.bbox[3];
      var c = Math.min(w, h) * 0.22;
      ctx.beginPath();
      [[x, y, 1, 1], [x + w, y, -1, 1], [x, y + h, 1, -1], [x + w, y + h, -1, -1]].forEach(function (p) {
        ctx.moveTo(p[0] + c * p[2], p[1]);
        ctx.lineTo(p[0], p[1]);
        ctx.lineTo(p[0], p[1] + c * p[3]);
      });
      ctx.stroke();
      // estrela no canto
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(x, y, 3.2 * esc, 0, Math.PI * 2);
      ctx.fill();
      if (comRotulo.indexOf(d) < 0) return;
      var info = descrever(d, largura, altura);
      var rotulo = info.nome + ", " + info.distancia;
      var tw = ctx.measureText(rotulo).width + 16 * esc;
      var th = 24 * esc;
      var ty = Math.max(0, y - th - 6 * esc);
      ctx.fillStyle = "rgba(7, 11, 21, 0.78)";
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(x, ty, tw, th, th / 2);
      else ctx.rect(x, ty, tw, th);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.fillText(rotulo, x + 8 * esc, ty + th / 2);
    });
  }
  function resumir(lista, largura, altura) {
    if (!lista.length) return "Nada identificado por perto.";
    var infos = lista.map(function (d) {
      return descrever(d, largura, altura);
    }).sort(function (a, b) {
      return b.area - a.area;
    });
    var principal = maiuscula(infos[0].texto) + ".";
    var pessoas = infos.filter(function (i) {
      return i.nome === "pessoa";
    }).length;
    if (pessoas > 1) principal += " " + pessoas + " pessoas na imagem.";
    return principal;
  }

  // ---------- Câmera ----------
  function laco() {
    if (!rodando) return;
    if (video.readyState >= 2) {
      modelo.detect(video, 8, 0.55).then(function (lista) {
        if (!rodando) return;
        var w = video.videoWidth, h = video.videoHeight;
        if (desenho.width !== w) {
          desenho.width = w;
          desenho.height = h;
        }
        ctx.clearRect(0, 0, w, h);
        desenharDeteccoes(lista, w, h);
        var frase = resumir(lista, w, h);
        leitura.textContent = frase;
        if (lista.length) falar(frase);
        setTimeout(function () {
          requestAnimationFrame(laco);
        }, 120);
      });
    } else {
      requestAnimationFrame(laco);
    }
  }
  function ligarCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      leitura.textContent = "Este navegador não permite usar a câmera. Use o teste com a foto do evento.";
      return;
    }
    parar();
    botaoCamera.disabled = true;
    Promise.all([
      carregarModelo(),
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment", width: { ideal: 1280 } }, audio: false }),
    ])
      .then(function (r) {
        fluxo = r[1];
        video.srcObject = fluxo;
        return video.play();
      })
      .then(function () {
        document.getElementById("visao").classList.add("ativa", "camera");
        vazio.hidden = true;
        controles.hidden = false;
        rodando = true;
        leitura.textContent = "Aponte a câmera para o ambiente.";
        laco();
      })
      .catch(function (e) {
        var negado = e && (e.name === "NotAllowedError" || e.name === "SecurityError");
        leitura.textContent = negado
          ? "A câmera não foi liberada. Para testar, permita o acesso à câmera no navegador ou use a foto do evento."
          : e && e.name === "NotFoundError"
          ? "Nenhuma câmera encontrada. Use o teste com a foto do evento."
          : "Não foi possível iniciar a demo agora. Verifique a conexão e tente de novo.";
      })
      .finally(function () {
        botaoCamera.disabled = false;
      });
  }

  // ---------- Foto do evento ----------
  function testarFoto() {
    parar();
    botaoFoto.disabled = true;
    var img = new Image();
    img.src = FOTO_TESTE;
    Promise.all([carregarModelo(), img.decode()])
      .then(function () {
        return modelo.detect(img, 12, 0.5);
      })
      .then(function (lista) {
        var w = img.naturalWidth, h = img.naturalHeight;
        desenho.width = w;
        desenho.height = h;
        ctx.drawImage(img, 0, 0, w, h);
        desenharDeteccoes(lista, w, h);
        document.getElementById("visao").classList.add("ativa", "foto");
        vazio.hidden = true;
        controles.hidden = false;
        var frase = resumir(lista, w, h);
        leitura.textContent = frase;
        ultimaFala.texto = "";
        falar(frase);
      })
      .catch(function () {
        leitura.textContent = "Não foi possível iniciar a demo agora. Verifique a conexão e tente de novo.";
      })
      .finally(function () {
        botaoFoto.disabled = false;
      });
  }

  function parar() {
    rodando = false;
    if (fluxo) {
      fluxo.getTracks().forEach(function (t) {
        t.stop();
      });
      fluxo = null;
    }
    video.srcObject = null;
    if ("speechSynthesis" in window) speechSynthesis.cancel();
    ctx.clearRect(0, 0, desenho.width, desenho.height);
    document.getElementById("visao").classList.remove("ativa", "camera", "foto");
    vazio.hidden = false;
    controles.hidden = true;
    leitura.textContent = "";
  }

  botaoCamera.addEventListener("click", ligarCamera);
  botaoFoto.addEventListener("click", testarFoto);
  botaoParar.addEventListener("click", parar);
  botaoVoz.addEventListener("click", function () {
    vozLigada = !vozLigada;
    botaoVoz.setAttribute("aria-pressed", vozLigada ? "true" : "false");
    botaoVoz.textContent = vozLigada ? "Voz ligada" : "Voz desligada";
    if (!vozLigada && "speechSynthesis" in window) speechSynthesis.cancel();
  });
  // Saiu da seção ou trocou de aba: desliga a câmera.
  new IntersectionObserver(function (e) {
    if (!e[0].isIntersecting && fluxo) parar();
  }).observe(document.getElementById("experimente"));
  document.addEventListener("visibilitychange", function () {
    if (document.hidden && fluxo) parar();
  });
})();
