# Viagem pela constelação ORION (prova de conceito 3D)

Teste da direção A: o site como um espaço 3D por onde a pessoa viaja enquanto rola.

## O que tem aqui

1. **Abertura** (a mesma de `../abertura-orion/`).
2. **Portal**: o anel do logo em 3D aparece exatamente onde estava o anel da abertura e a câmera
   o atravessa, com rastros de velocidade.
3. **Hero no espaço**: o título se forma de ~14 mil partículas e, no fim, o texto real (nítido)
   assume exatamente no mesmo lugar. Logo ORION completo em 3D (anel + nome + fio com a estrela),
   no estilo do próprio PNG: peças planas com a frente nas cores exatas e a extrusão escura
   (azul-escuro e cinza do PNG) dando volume. Acompanha o mouse/inclinação, pode ser arrastado
   e volta sozinho para a frente.
4. **Salto até "Sobre"** guiado pela rolagem: o título se desfaz em poeira estelar, a câmera
   viaja pelo céu e as partículas formam o novo título; painel de vidro e globo-constelação.

## Como ver

```powershell
python -m http.server 5178 --directory prototipos
```

Acesse `http://localhost:5178/viagem-3d/` (`?repetir` mostra a abertura de novo).

## Tecnologia e cuidados

- **Three.js 0.170** (via CDN, sem build). No app Next.js: React Three Fiber.
- **Sem pós-processamento (bloom)**: cada estrela tem seu próprio degradê suave e raios de 4 pontas;
  isso deixa tudo nítido e as cores do logo exatas.
- **Desempenho**: 61 quadros/s em placa de vídeo integrada (Intel UHD). No celular, menos estrelas.
- **Plano B**: sem WebGL, abre o site atual. "Reduzir movimento": sem mergulho nem rastros.
- O texto de verdade continua no HTML (títulos ocultos para leitores de tela e buscadores).

## Arquivos

| Arquivo      | O que faz                                                         |
| ------------ | ----------------------------------------------------------------- |
| `index.html` | Estrutura: etapas da rolagem e camadas de conteúdo.               |
| `viagem.css` | Camadas fixas, painel de vidro, botões, dica de rolagem.          |
| `viagem.js`  | Cena 3D: céu, logo 3D, portal, partículas, câmera e rolagem.      |
