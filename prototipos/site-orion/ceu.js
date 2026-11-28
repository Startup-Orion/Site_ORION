/*
 * Céu real de Manaus: onde está Órion agora.
 * Cálculo astronômico simples (precisão de ~1°, suficiente para o site), sem serviço externo.
 * Referência: Alnilam, a estrela do meio do cinturão (AR 5h36m13s, Dec −1°12′).
 */
(function () {
  "use strict";

  var MANAUS = { lat: -3.119, lon: -60.0217 }; // lon negativa = oeste
  var ALNILAM = { ar: 84.0534, dec: -1.2019 }; // graus
  var RAD = Math.PI / 180;
  var SIDERAL = 360.98564736629; // graus por dia

  function norm(g) {
    return ((g % 360) + 360) % 360;
  }
  function diasJ2000(data) {
    return data.getTime() / 86400000 + 2440587.5 - 2451545.0;
  }
  function horaSideralLocal(data) {
    return norm(280.46061837 + SIDERAL * diasJ2000(data) + MANAUS.lon);
  }
  // Posição de um astro (AR/Dec em graus) vista de Manaus.
  function posicao(ar, dec, data) {
    var H = norm(horaSideralLocal(data) - ar);
    if (H > 180) H -= 360; // ângulo horário entre −180 e 180 (negativo = ainda subindo)
    var phi = MANAUS.lat * RAD;
    var d = dec * RAD;
    var h = H * RAD;
    var alt = Math.asin(Math.sin(phi) * Math.sin(d) + Math.cos(phi) * Math.cos(d) * Math.cos(h)) / RAD;
    // Ângulo paralático: quanto a figura está girada em relação ao "norte para cima".
    var q = Math.atan2(Math.sin(h), Math.tan(phi) * Math.cos(d) - Math.sin(d) * Math.cos(h)) / RAD;
    return { alt: alt, H: H, q: q };
  }
  // Sol (fórmula aproximada) para saber se é dia.
  function sol(data) {
    var n = diasJ2000(data);
    var L = norm(280.46 + 0.9856474 * n);
    var g = norm(357.528 + 0.9856003 * n) * RAD;
    var lambda = (L + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * RAD;
    var eps = (23.439 - 0.0000004 * n) * RAD;
    var ar = norm(Math.atan2(Math.cos(eps) * Math.sin(lambda), Math.cos(lambda)) / RAD);
    var dec = Math.asin(Math.sin(eps) * Math.sin(lambda)) / RAD;
    return posicao(ar, dec, data);
  }
  // Próximo nascer de Órion (quando o ângulo horário chega a −H0).
  function proximoNascer(data, H) {
    var H0 = Math.acos(-Math.tan(MANAUS.lat * RAD) * Math.tan(ALNILAM.dec * RAD)) / RAD;
    var graus = norm(-H0 - H);
    var horas = (graus / 15) * 0.99727; // horas siderais -> horas solares
    return new Date(data.getTime() + horas * 3600000);
  }
  function horaManaus(data) {
    return data.toLocaleTimeString("pt-BR", { timeZone: "America/Manaus", hour: "2-digit", minute: "2-digit" }).replace(":", "h");
  }
  function mesmoDia(a, b) {
    var f = { timeZone: "America/Manaus", year: "numeric", month: "2-digit", day: "2-digit" };
    return a.toLocaleDateString("pt-BR", f) === b.toLocaleDateString("pt-BR", f);
  }

  function calcular(data) {
    data = data || new Date();
    var o = posicao(ALNILAM.ar, ALNILAM.dec, data);
    var s = sol(data);
    var dia = s.alt > -6;
    var acima = o.alt > 0;
    var texto;
    var graus = Math.round(o.alt);
    if (acima && !dia) {
      texto = "Agora, Órion está a " + graus + "° acima do horizonte de Manaus, inclinado como você vê aqui.";
    } else if (acima && dia) {
      texto = "Órion está a " + graus + "° acima de Manaus, escondido pela luz do dia. A inclinação é a mesma que você vê aqui.";
    } else {
      var nasce = proximoNascer(data, o.H);
      texto =
        "Órion está abaixo do horizonte de Manaus agora. Nasce " +
        (mesmoDia(nasce, data) ? "hoje" : "amanhã") + " às " + horaManaus(nasce) + ", inclinado como você vê aqui.";
    }
    return { altitude: o.alt, giro: o.q, acima: acima, dia: dia, texto: texto };
  }

  window.OrionCeu = { calcular: calcular };
})();
