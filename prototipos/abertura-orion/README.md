# Abertura ORION (protótipo)

Animação de apresentação do logotipo: estrelas surgem, se conectam pelos traços do
próprio logo (anel e letras), as linhas retas se curvam até formar o anel, e o **logo
original** aparece exatamente por onde a constelação passou. No fim, um brilho percorre
o fio horizontal do logo e acende a estrela de 4 pontas.

Duração: cerca de 5,5 s (pode pular com o botão ou a tecla `Esc`). Aparece **uma vez por
sessão**.

Versão no Figma (storyboard das 5 fases + frame animado com keyframes, tokens de cor):
https://www.figma.com/design/zia0KXgrwC5bP7AwtkGpdo

## Arquivos

| Arquivo              | O que é                                                                 |
| -------------------- | ----------------------------------------------------------------------- |
| `abertura-orion.js`  | A animação (SVG + JavaScript puro, sem bibliotecas, ~7 KB com gzip).  |
| `abertura-orion.css` | Estilos da camada de abertura.                                          |
| `orion-logo.png`     | Logo oficial (PNG transparente, 856×900), extraído do protótipo atual. Não é editado. |
| `index.html`         | Página de demonstração.                                                 |

## Como ver

Abra um servidor nesta pasta (arquivo aberto direto com duplo clique não carrega o logo
em alguns navegadores):

```powershell
python -m http.server 5178 --directory prototipos
```

Depois acesse `http://localhost:5178/abertura-orion/?repetir` (só a abertura) ou
`http://localhost:5178/site-orion/?repetir` (abertura + site).

Opção `alvo`: com `alvo: "#logo-topo"`, no fim o símbolo voa e pousa no logo do cabeçalho em vez
de só esmaecer. O logo do cabeçalho precisa usar o mesmo recorte:
`<svg viewBox="238 192 308 292"><image href="orion-logo.png" width="856" height="900"/></svg>`.

- `?repetir` mostra a abertura de novo.
- `?repetir&reduzido` simula a preferência "reduzir movimento".
- `?repetir&quadro=2000` congela no instante 2000 ms (para revisar o design quadro a quadro).

## Decisões de design

- **Cores do logo intactas**: o final é o PNG oficial, sem filtro, sem gradiente. Ao
  terminar, a máscara é removida e o arquivo aparece 100% original.
- **Geometria real**: as coordenadas da constelação foram medidas no próprio PNG
  (centro e raio do anel, posição das esferas, eixo de cada letra, fio e estrela).
- **Pouca partícula**: 26 estrelas da constelação e um céu de fundo bem discreto.
- **Acessibilidade**: respeita `prefers-reduced-motion` (só um esmaecimento curto), tem
  botão "Pular abertura" com foco visível e atalho `Esc`.
- **Desempenho**: sem bibliotecas; o céu é desenhado uma única vez em canvas; a animação
  espera o logo carregar antes da revelação; sem JavaScript, o site abre normalmente.

## Como levar para o Next.js (etapa 2)

1. Copie `orion-logo.png` para `frontend/public/` e `abertura-orion.js` para
   `frontend/public/abertura-orion.js`.
2. Importe `abertura-orion.css` no `src/app/globals.css` (ou copie o conteúdo).
3. No `src/app/layout.tsx`, dentro do `<head>`, adicione o script que evita o "piscar":

   ```tsx
   <script
     dangerouslySetInnerHTML={{
       __html:
         "try{if(sessionStorage.getItem('orion-abertura-vista')!=='1')document.documentElement.classList.add('orion-abertura-pendente')}catch(e){}",
     }}
   />
   ```

4. Crie um componente cliente que carrega e inicia a abertura:

   ```tsx
   "use client";
   import Script from "next/script";

   export function AberturaOrion() {
     return (
       <Script
         src="/abertura-orion.js"
         strategy="afterInteractive"
         onReady={() => (window as any).AberturaOrion.iniciar({ logo: "/orion-logo.png" })}
       />
     );
   }
   ```

5. Use `<AberturaOrion />` no layout do site público (`src/app/(publico)/layout.tsx`).

> Os passos 3 a 5 ainda não foram testados porque o app Next.js não existe nesta branch.
