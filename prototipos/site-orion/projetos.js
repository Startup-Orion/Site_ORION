/*
 * Dados do portfólio. Para adicionar um projeto ou evento, copie um bloco e troque os textos,
 * os vídeos (pasta video/) e as fotos (pasta img/galeria/). No app Next.js, isto vira uma
 * tabela cadastrada pelo painel /admin.
 *
 * Em "texto", cada item é um parágrafo. Links: [texto do link](https://endereco).
 */
window.PROJETOS_ORION = [
  {
    slug: "orion-lite",
    titulo: "ORION Lite",
    chamada: "Do projeto acadêmico à formação da startup",
    tipo: "Tecnologia assistiva",
    quando: "Inov@tech 2025",
    selo: "1º lugar no Inov@tech 2025",
    resumo:
      "Câmera, visão computacional e síntese de voz para identificar obstáculos e orientar pessoas com deficiência visual.",
    texto: [
      "O ORION Lite nasceu de uma pergunta simples: como a tecnologia pode ajudar uma pessoa com deficiência visual a se deslocar com mais autonomia e segurança? A resposta começou a tomar forma em um protótipo de tecnologia assistiva que combina câmera, visão computacional e síntese de voz para identificar obstáculos e transmitir informações ao usuário. A proposta usa uma câmera acoplada a um fone de ouvido, buscando uma alternativa discreta para apoiar a percepção do ambiente.",
      "Em 2025, a equipe apresentou o projeto no Inov@tech e conquistou o primeiro lugar. A feira deu visibilidade ao trabalho, colocou o protótipo diante do público e mostrou à equipe que uma iniciativa acadêmica podia evoluir para uma solução com potencial de impacto. Essa experiência foi um incentivo decisivo para transformar o grupo em uma startup.",
      "Foi nesse percurso que começou a se formar a ORION: primeiro, em torno do desenvolvimento do ORION Lite; depois, com a ambição de aplicar conhecimento em software, inteligência artificial, visão computacional, Internet das Coisas e automação a outros desafios. O Inov@tech marcou, assim, tanto o reconhecimento de um projeto quanto o início de uma trajetória empreendedora.",
    ],
    tecnologias: ["Inteligência artificial", "Visão computacional", "Síntese de voz", "Sistemas embarcados"],
    links: [
      {
        rotulo: "Matéria da Fametro sobre a conquista",
        url: "https://noticias.fametro.edu.br/projeto-orion-garante-vitoria-no-inovtech-2025-e-destaca-talento-dos-alunos-da-fametro/",
      },
    ],
    foto: { src: "img/orion-inovatech.jpg", alt: "Equipe do ORION Lite reunida com o troféu de campeão no Inov@tech 2025" },
    galeria: [
      { src: "img/galeria/orion-lite-1.jpg", alt: "Integrantes da ORION apresentando o protótipo no estande" },
      { src: "img/galeria/orion-lite-2.jpg", alt: "Visitantes acompanhando a demonstração do ORION Lite no computador" },
      { src: "img/galeria/orion-lite-3.jpg", alt: "Anúncio dos vencedores do Inov@tech 2025" },
      { src: "img/galeria/orion-lite-4.jpg", alt: "Equipe comemorando o resultado no palco" },
      { src: "img/galeria/orion-lite-5.jpg", alt: "Foto oficial da equipe diante do painel do Inov@tech" },
      { src: "img/galeria/orion-lite-6.jpg", alt: "Integrante da ORION segurando o troféu do primeiro lugar" },
    ],
    contexto: "projeto-orion",
    temAudio: false, // o vídeo original não tem som
  },
  {
    slug: "teko-kaa",
    titulo: "Teko Ka’a",
    chamada: "Teko Ka’a no Inov@tech",
    tipo: "Agricultura inteligente",
    quando: "Inov@tech 2026",
    selo: "9º lugar entre mais de 100 projetos",
    resumo:
      "Estufa inteligente de baixo custo que monitora o cultivo, aciona irrigação e ventilação e analisa as plantas com visão computacional.",
    texto: [
      "O Teko Ka’a é um protótipo de estufa inteligente desenvolvido para ajudar pequenos produtores a acompanhar e controlar melhor o cultivo. A ideia surgiu da observação de estufas em Manaus, onde atividades como irrigação, ventilação e acompanhamento das plantas ainda dependem muito do manejo manual. Sem dados acessíveis sobre o ambiente e o cultivo, fica mais difícil tomar decisões e evitar desperdícios de água e energia.",
      "Para enfrentar esse desafio, o projeto integra sensores, automação, Internet das Coisas e visão computacional em uma estrutura local e de baixo custo. Uma Raspberry Pi 4 coordena o sistema, que monitora condições como umidade do solo, temperatura e umidade do ambiente, aciona a irrigação e a ventilação e reúne as informações em uma dashboard acessível por navegador ou tablet na rede local. O módulo de visão computacional usa OpenCV e PlantCV para analisar imagens das plantas.",
      "A participação do Teko Ka’a no Inov@tech 2026 levou essa proposta a um espaço de apresentação e troca com a comunidade acadêmica e o público interessado em inovação. Foi também uma oportunidade de compartilhar o desenvolvimento de uma solução aplicada a desafios reais da produção agrícola e de avançar o projeto a partir das conversas e experiências do evento.",
    ],
    tecnologias: ["Raspberry Pi 4", "Internet das Coisas", "Automação", "OpenCV", "PlantCV", "Visão computacional"],
    links: [],
    foto: { src: "img/teko-kaa.jpg", alt: "Painel do Teko Ka’a com mapa visual da planta e indicadores de saúde vegetal" },
    galeria: [
      { src: "img/galeria/teko-kaa-1.jpg", alt: "Integrante apresentando o pôster do Teko Ka’a no Inov@tech 2026" },
      { src: "img/galeria/teko-kaa-2.jpg", alt: "Visitante observando a maquete da estufa inteligente" },
      { src: "img/galeria/teko-kaa-3.jpg", alt: "Equipe mostrando os sensores e a automação da estufa" },
      { src: "img/galeria/teko-kaa-4.jpg", alt: "Modelo 3D da estufa Teko Ka’a na tela" },
      { src: "img/galeria/teko-kaa-5.jpg", alt: "Auditório lotado no Inov@tech 2026" },
      { src: "img/galeria/teko-kaa-6.jpg", alt: "Integrantes da equipe do Teko Ka’a" },
    ],
    contexto: "projeto-teko",
    temAudio: true,
  },
  {
    slug: "ada-conecta",
    titulo: "Ada Conecta 2026",
    chamada: "ORION no Ada Conecta 2026",
    tipo: "Evento, 2ª edição",
    quando: "10 de outubro de 2026, Venturus, Manaus",
    selo: "Mulheres na tecnologia",
    resumo:
      "A ORION apresentou a startup e seus serviços no encontro da Manas Tech que dá visibilidade às mulheres na tecnologia no Amazonas.",
    texto: [
      "A ORION participou da segunda edição do Ada Conecta, promovida pela comunidade Manas Tech, em Manaus. O evento reuniu pessoas e iniciativas em torno de tecnologia, inovação e protagonismo feminino no setor. Para a ORION, foi uma oportunidade de apresentar a startup, divulgar seus serviços e compartilhar um pouco da trajetória construída desde os projetos apresentados no Inov@tech.",
      "Durante o encontro, a equipe apresentou sua atuação em áreas como desenvolvimento de software, inteligência artificial, visão computacional, Internet das Coisas e automação. A participação também permitiu conversar com o público, criar conexões e mostrar como experiências acadêmicas podem se transformar em iniciativas empreendedoras.",
      "A Geovana, única integrante feminina da ORION, representou a startup no evento e teve a oportunidade de assumir esse protagonismo. Sua participação destacou a importância da presença feminina nos espaços de tecnologia e refletiu sua evolução dentro da equipe. Agradecemos à Manas Tech e à organização do Ada Conecta pelo espaço e pela iniciativa de aproximar pessoas e fortalecer o ecossistema tecnológico da região.",
    ],
    tecnologias: ["Mulheres na tecnologia", "Inteligência artificial", "Ecossistema de inovação"],
    links: [
      { rotulo: "Ada Conecta e Manas Tech", url: "https://manastech.com.br/ada-conecta" },
      { rotulo: "Página do evento no Sympla", url: "https://www.sympla.com.br/evento/ada-conecta-2-edicao/3536056" },
    ],
    foto: { src: "img/ada-conecta.jpg", alt: "Participantes reunidos no Ada Conecta em Manaus" },
    galeria: [
      { src: "img/galeria/ada-conecta-1.jpg", alt: "Painel de entrada do Ada Conecta, evento feminino de tecnologia" },
      { src: "img/galeria/ada-conecta-2.jpg", alt: "Integrantes da ORION no estande durante o evento" },
      { src: "img/galeria/ada-conecta-3.jpg", alt: "Mesas dos expositores no Venturus" },
      { src: "img/galeria/ada-conecta-4.jpg", alt: "Público circulando entre os estandes" },
      { src: "img/galeria/ada-conecta-5.jpg", alt: "Apresentação no auditório do Venturus" },
      { src: "img/galeria/ada-conecta-6.jpg", alt: "Equipe da ORION no palco do Ada Conecta" },
    ],
    contexto: "projeto-ada",
    temAudio: true,
  },
];
