# Site ORION (protótipo)

Página inicial (`index.html`) e páginas "Saiba mais" do portfólio (`projeto.html?p=<slug>`).
HTML, CSS e JavaScript sem bibliotecas. A abertura vem de `../abertura-orion/`.

## Como ver

```powershell
python -m http.server 5178 --directory prototipos
```

Acesse `http://localhost:5178/site-orion/?repetir` (`?repetir` mostra a abertura de novo).

## Arquivos

| Arquivo            | O que faz                                                                 |
| ------------------ | ------------------------------------------------------------------------- |
| `index.html`       | Página inicial: hero com cinturão de Órion, serviços, portfólio, trajetória, contato. |
| `site.js`          | WhatsApp contextual, cinturão interativo, ícones, cartões 3D, trajetória, formulário. |
| `midia.js`         | Vídeos em loop: tocam só na tela; respeitam "reduzir movimento" e economia de dados. |
| `projeto.html/.js/.css` | Página "Saiba mais", montada a partir de `projetos.js`.               |
| `projetos.js`      | **Dados do portfólio** (textos, fotos, vídeos, links).                   |
| `video/`           | `<slug>-loop.mp4/.webm` (cartão), `<slug>-completo.mp4` (com som), `<slug>-capa.jpg`. |
| `img/galeria/`     | Fotos de cada projeto (quadros tirados dos vídeos).                       |

## Como adicionar um projeto ou evento

1. Copie um bloco em `projetos.js` e troque `slug`, textos, fotos e links.
2. Coloque os arquivos em `video/` e `img/galeria/` com o mesmo `slug`.
3. Copie um `<article class="projeto">` em `index.html` e troque o `slug` e os textos.

### Preparando os vídeos (ffmpeg)

Vídeo vertical de celular, cortes só com cenas do evento (sem falas), de 15 a 20 s no total:

```powershell
ffmpeg -ss 9 -t 2 -i bruto.mp4 -ss 12.4 -t 2.4 -i bruto.mp4 -filter_complex "[0:v]setpts=PTS-STARTPTS,fps=30,scale=480:854[a];[1:v]setpts=PTS-STARTPTS,fps=30,scale=480:854[b];[a][b]concat=n=2:v=1:a=0[v]" -map "[v]" -an -c:v libx264 -crf 25 -preset slow -pix_fmt yuv420p -movflags +faststart video/SLUG-loop.mp4
```

```powershell
ffmpeg -i video/SLUG-loop.mp4 -an -c:v libvpx-vp9 -b:v 0 -crf 38 video/SLUG-loop.webm
```

```powershell
ffmpeg -i bruto.mp4 -vf scale=480:854 -c:v libx264 -crf 27 -preset slow -c:a aac -b:a 96k -movflags +faststart video/SLUG-completo.mp4
```

```powershell
ffmpeg -i video/SLUG-loop.mp4 -frames:v 1 -q:v 4 video/SLUG-capa.jpg
```

> Os vídeos somam ~48 MB. No app Next.js, o ideal é guardá-los no Supabase Storage (ou outro
> serviço de arquivos) em vez de dentro do repositório Git.
