import { Tossup } from '../../types/quizbowl';
import { BatchItem } from './batch-01-chemistry-physics';

export const ANCIENT_EMPIRES_WARS_QUESTIONS: BatchItem[] = [
  // 1. Império Aquemênida / Persa
  {
    id: 'batch-hist-imperio-aquemenida',
    category: 'História',
    subcategory: 'Impérios Antigos',
    difficulty: 2,
    clues: [
      'Foi fundado após a rebelião vitoriosa contra o rei medo Astíages em 550 a.C. e consolidou seu centro cerimonial na monumental cidade de Persépolis.',
      'Sua administração imperial pioneira dividiu o território em cerca de vinte províncias governadas por sátrapas, unificadas pela famosa Estrada Real de Sardes a Susa.'
    ],
    powerClue: 'Sob Ciro, o Grande, conquistou a Babilônia e libertou os judeus do cativeiro, episódio documentado no famoso Cilindro de Ciro (*)',
    giveaway: 'Nomeie este primeiro grande império persa da Antiguidade clássica governado por Dario e Xerxes, que travou as Guerras Médicas contra as cidades-estado gregas.',
    answerCanonical: 'Império Aquemênida',
    acceptAliases: ['Império Persa', 'Imperio Aquemenida', 'Imperio Persa', 'Primeiro Império Persa'],
    promptAliases: ['império da Pérsia', 'império de Ciro'],
    explanation: 'O Império Aquemênida (550-330 a.C.) foi o maior império do mundo antigo até ser conquistado por Alexandre, o Grande.',
    wikiUrl: 'https://pt.wikipedia.org/wiki/Imp%C3%A9rio_Aquem%C3%AAnida'
  },
  // 2. Batalha de Maratona
  {
    id: 'batch-hist-batalha-maratona',
    category: 'História',
    subcategory: 'Guerras Médicas',
    difficulty: 1,
    clues: [
      'O general ateniense Milcíades ordenou o avanço rápido em falange com o centro intencionalmente enfraquecido e as alas reforçadas para realizar um duplo envolvimento das forças inimigas.',
      'Segundo a tradição popular narrada por Luciano de Samósata, o mensageiro Fidípides correu cerca de quarenta quilômetros até a Acrópole para anunciar a vitória com a palavra "Nenikékamen" antes de cair morto.'
    ],
    powerClue: 'Neste confronto decisivo de 490 a.C., os hoplitas atenienses e plateienses rechaçaram a primeira invasão persa enviada pelo rei Dario I nas costas da Ática (*)',
    giveaway: 'Qual o nome desta histórica batalha da Antiguidade grega que deu origem à mais famosa prova de corrida de longa distância dos Jogos Olímpicos?',
    answerCanonical: 'Batalha de Maratona',
    acceptAliases: ['Maratona', 'Batalha de Maratona de 490 a.C.'],
    promptAliases: ['batalha grega', 'confronto de fidípides'],
    explanation: 'A Batalha de Maratona (490 a.C.) foi o triunfo heroico dos atenienses contra a infantaria persa na Primeira Guerra Médica.',
    wikiUrl: 'https://pt.wikipedia.org/wiki/Batalha_de_Maratona'
  },
  // 3. Guerra do Peloponeso
  {
    id: 'batch-hist-guerra-peloponeso',
    category: 'História',
    subcategory: 'Grécia Antiga',
    difficulty: 1,
    clues: [
      'Seu estopim envolveu desavenças coloniais em Epidamno e Potideia e o decreto econômico de Mégara imposto pelo líder Péricles.',
      'O historiador Tucídides registrou suas fases com rigor metodológico pioneiro e analisou como o medo de Esparta diante da ascensão de Atenas tornou o conflito inevitável, conceito hoje chamado "Armadilha de Tucídides".'
    ],
    powerClue: 'A desastrosa Expedição à Sicília promovida pelo ardiloso Alcibíades dizimou a frota ateniense, culminando na derrota definitiva na Batalha de Egospótamos (*)',
    giveaway: 'Identifique esta grande guerra civil de vinte e sete anos entre a Liga de Delos liderada por Atenas e a Liga do Peloponeso chefiada por Esparta.',
    answerCanonical: 'Guerra do Peloponeso',
    acceptAliases: ['A Guerra do Peloponeso', 'Guerras do Peloponeso'],
    promptAliases: ['guerra entre Atenas e Esparta', 'conflito grego'],
    explanation: 'A Guerra do Peloponeso (431-404 a.C.) encerrou a Idade de Ouro de Atenas e devastou o mundo clássico grego.',
    wikiUrl: 'https://pt.wikipedia.org/wiki/Guerra_do_Peloponeso'
  },
  // 4. Batalha de Canas
  {
    id: 'batch-hist-batalha-canas',
    category: 'História',
    subcategory: 'Guerras Púnicas',
    difficulty: 1,
    clues: [
      'Os cônsules romanos Lúcio Emílio Paulo e Caio Terêncio Varrão alternavam diariamente o comando supremo de mais de oitenta mil legionários na planície da Apúlia.',
      'O general invasor posicionou sua infantaria hispânica e gaulesa em uma linha convexa que cedeu propositalmente sob a pressão romana, permitindo que a cavalaria de Asdrúbal e a infantaria pesada líbia fechassem o cerco pelos flancos.'
    ],
    powerClue: 'Esta obra-prima tática de duplo cerco e aniquilação total de agosto de 216 a.C. resultou na perda de até setenta mil soldados de Roma (*)',
    giveaway: 'Nomeie esta célebre batalha da Segunda Guerra Púnica vencida de forma esmagadora pelo general cartaginês Aníbal Barca.',
    answerCanonical: 'Batalha de Canas',
    acceptAliases: ['Canas', 'Batalha de Cannae'],
    promptAliases: ['batalha de aníbal', 'derrota romana em canas'],
    explanation: 'A Batalha de Canas (216 a.C.) permanece até hoje como o exemplo tático supremo de manobra de duplo envelope da história militar.',
    wikiUrl: 'https://pt.wikipedia.org/wiki/Batalha_de_Canas'
  },
  // 5. Império Bizantino
  {
    id: 'batch-hist-imperio-bizantino',
    category: 'História',
    subcategory: 'Impérios Antigos',
    difficulty: 1,
    clues: [
      'Durante a Revolta de Nika em 532, a imperatriz Teodora recusou-se a fugir ao declarar perante o conselho que "a púrpura é uma bela mortalha".',
      'Sua marinha repeliu dois grandes cercos árabes lançando contra os navios de madeira uma mistura incendiária secreta de nafta projetada por sifões de bronze, o temido "fogo grego".'
    ],
    powerClue: 'Sob Justiniano I, compilou o monumental código jurídico Corpus Juris Civilis e ergueu a Basílica de Santa Sofia com sua monumental cúpula dourada (*)',
    giveaway: 'Identifique este império de língua e cultura grega que sobreviveu por mais de mil anos como o Império Romano do Oriente até a queda de sua capital Constantinopla em 1453.',
    answerCanonical: 'Império Bizantino',
    acceptAliases: ['Imperio Bizantino', 'Império Romano do Oriente', 'Imperio Romano do Oriente', 'Bizâncio', 'Bizancio'],
    promptAliases: ['roma oriental', 'império de constantinopla'],
    explanation: 'O Império Bizantino preservou o legado romano e helênico durante toda a Idade Média a partir de Constantinopla.',
    wikiUrl: 'https://pt.wikipedia.org/wiki/Imp%C3%A9rio_Bizantino'
  },
  // 6. Batalha de Hastings
  {
    id: 'batch-hist-batalha-hastings',
    category: 'História',
    subcategory: 'Idade Média',
    difficulty: 1,
    clues: [
      'Foi detalhadamente bordada e imortalizada em fios de lã colorida sobre linho em uma famosa peça têxtil de quase setenta metros de comprimento conhecida como a Tapeçaria de Bayeux.',
      'O rei saxão Harold Godwinson havia acabado de marchar exaustivamente centenas de quilômetros após derrotar os invasores vikings de Harald Hardrada na Batalha de Stamford Bridge.'
    ],
    powerClue: 'A cavalaria normanda fingiu retiradas sucessivas para quebrar a impenetrável parede de escudos saxã, culminando na morte do rei Harold ferido por uma flecha no olho (*)',
    giveaway: 'Qual foi esta decisiva batalha travada em 14 de outubro de 1066 que permitiu a Guilherme, o Conquistador assumir a coroa da Inglaterra?',
    answerCanonical: 'Batalha de Hastings',
    acceptAliases: ['Hastings', 'Batalha de Hastings de 1066'],
    promptAliases: ['conquista normanda', 'batalha de guilherme'],
    explanation: 'A Batalha de Hastings (1066) marcou o início da conquista normanda da Inglaterra e transformou a língua inglesa com a influência do francês medieval.',
    wikiUrl: 'https://pt.wikipedia.org/wiki/Batalha_de_Hastings'
  },
  // 7. Império Otomano
  {
    id: 'batch-hist-imperio-otomano',
    category: 'História',
    subcategory: 'Impérios e Guerras',
    difficulty: 1,
    clues: [
      'Seu exército regular mantinha como tropa de choque de elite a infantaria disciplinada dos janízaros, recrutada pelo sistema de tributo humano infantil chamado devshirme.',
      'No século XIX e início do século XX, suas crises fiscais crônicas e perdas territoriais nos Bálcãs fizeram com que o czar Nicolau I da Rússia o apelidasse de "o homem doente da Europa".'
    ],
    powerClue: 'Em 1453, o jovem sultão Maomé II conquistou Constantinopla usando canhões de cerco gigantes fundidos pelo húngaro Urbano (*)',
    giveaway: 'Identifique este vasto estado islâmico transcontinental fundado por Osmã I que governou o sudeste europeu, o norte da África e o Oriente Médio até sua dissolução após a Primeira Guerra Mundial.',
    answerCanonical: 'Império Otomano',
    acceptAliases: ['Imperio Otomano', 'Império Turco-Otomano', 'Estado Otomano'],
    promptAliases: ['império turco', 'estado dos sultões'],
    explanation: 'O Império Otomano foi uma potência global por seis séculos, sucedida em 1923 pela República da Turquia de Mustafa Kemal Atatürk.',
    wikiUrl: 'https://pt.wikipedia.org/wiki/Imp%C3%A9rio_Otomano'
  },
  // 8. Batalha de Austerlitz
  {
    id: 'batch-hist-batalha-austerlitz',
    category: 'História',
    subcategory: 'Guerras Napoleônicas',
    difficulty: 1,
    clues: [
      'Napoleão fingiu fragilidade proposital em sua ala direita perto de Telnitz para induzir as forças combinadas do general Kutusov a desguarnecerem suas posições defensivas.',
      'Tropas do marechal Soult avançaram em meio à densa névoa matinal e tomaram de assalto a estratégica colina de Pratzen, partindo o exército inimigo em dois.'
    ],
    powerClue: 'Travada em 2 de dezembro de 1805, no primeiro aniversário da coroação imperial de Bonaparte, é universalmente conhecida como a "Batalha dos Três Imperadores" (*)',
    giveaway: 'Nomeie esta maior vitória militar da carreira de Napoleão Bonaparte, que destruiu a Terceira Coligação liderada pelo czar Alexandre I da Rússia e pelo imperador Francisco II da Áustria.',
    answerCanonical: 'Batalha de Austerlitz',
    acceptAliases: ['Austerlitz', 'Batalha dos Três Imperadores', 'Batalha dos Tres Imperadores'],
    promptAliases: ['vitória de napoleão', 'batalha dos três imperadores'],
    explanation: 'Austerlitz (1805) foi o triunfo tático definitivo do Grande Armée de Napoleão, levando à dissolução do Sacro Império Romano-Germânico.',
    wikiUrl: 'https://pt.wikipedia.org/wiki/Batalha_de_Austerlitz'
  },
  // 9. Batalha de Kursk
  {
    id: 'batch-hist-batalha-kursk',
    category: 'História',
    subcategory: 'Segunda Guerra Mundial',
    difficulty: 1,
    clues: [
      'A inteligência soviética soube com meses de antecedência os planos de ataque através da rede de espiões Lucy na Suíça e da decodificação britânica da máquina Enigma.',
      'O marechal Georgy Zhukov construiu oito linhas defensivas sucessivas fortificadas com campos minados, canhões antitanque em matilhas e trincheiras profundas.'
    ],
    powerClue: 'A Operação Cidadela culminou em 12 de julho de 1943 no violento choque no vilarejo de Prokhorovka, consagrado como o maior combate de tanques de guerra blindados de toda a história militar (*)',
    giveaway: 'Identifique esta gigantesca batalha travada no verão de 1943 na União Soviética, na qual o Exército Vermelho quebrou a espinha dorsal dos panzers da Alemanha nazista.',
    answerCanonical: 'Batalha de Kursk',
    acceptAliases: ['Kursk', 'Operação Cidadela', 'Operacao Cidadela'],
    promptAliases: ['batalha de tanques', 'combate de prokhorovka'],
    explanation: 'A Batalha de Kursk (1943) envolveu mais de 6.000 blindados e 2 milhões de soldados, transferindo a iniciativa estratégica no front oriental definitivamente para os soviéticos.',
    wikiUrl: 'https://pt.wikipedia.org/wiki/Batalha_de_Kursk'
  },
  // 10. Batalha de Midway
  {
    id: 'batch-hist-batalha-midway',
    category: 'História',
    subcategory: 'Segunda Guerra Mundial',
    difficulty: 1,
    clues: [
      'Os criptoanalistas da marinha americana da Estação HYPO sob o comando de Joseph Rochefort interceptaram mensagens e deduziram que o codinome de objetivo "AF" referia-se a este atol.',
      'Durante a manhã decisiva de 4 de junho de 1942, bombardeiros de mergulho Dauntless do porta-aviões USS Enterprise desceram das nuvens exatamente no momento em que os caças Zero estavam no nível do mar reabastecendo.'
    ],
    powerClue: 'Em um intervalo de menos de seis minutos, foram bombardeados e incendiados os porta-aviões de esquadra japoneses Akagi, Kaga e Soryu (*)',
    giveaway: 'Qual foi esta monumental batalha aeronaval travada no Oceano Pacífico em 1942, considerada o ponto de virada definitivo contra o Império do Japão na Segunda Guerra Mundial?',
    answerCanonical: 'Batalha de Midway',
    acceptAliases: ['Midway', 'Batalha do Atol de Midway'],
    promptAliases: ['batalha aeronaval', 'confronto no pacífico'],
    explanation: 'A Batalha de Midway (1942) resultou na destruição de 4 porta-aviões da Marinha Imperial Japonesa, marcando a virada dos Aliados no Pacífico.',
    wikiUrl: 'https://pt.wikipedia.org/wiki/Batalha_de_Midway'
  },
  // 11. Batalha de Riachuelo
  {
    id: 'batch-hist-batalha-riachuelo',
    category: 'História',
    subcategory: 'Guerra do Paraguai',
    difficulty: 1,
    clues: [
      'A esquadra inimiga comandada pelo capitão Pedro Ignacio Meza planejava um ataque surpresa ao amanhecer rebocando chatas artilhadas na foz do arroio homônimo no rio Paraná.',
      'O comandante brasileiro içou em sua nau capitânia o famoso sinal de bandeiras navais: "O Brasil espera que cada um cumpra o seu dever".'
    ],
    powerClue: 'Percebendo que as manobras com artilharia convencional eram lentas, o almirante Barroso utilizou a proa reforçada da fragata Amazonas para abalroar e afundar os navios paraguaios um a um (*)',
    giveaway: 'Identifique este monumental combate naval travado em 11 de junho de 1865, considerado a maior batalha fluvial da história da América do Sul e o feito supremo da Marinha do Brasil.',
    answerCanonical: 'Batalha do Riachuelo',
    acceptAliases: ['Riachuelo', 'Batalha Naval do Riachuelo'],
    promptAliases: ['batalha naval da guerra do paraguai', 'combate de barroso'],
    explanation: 'A Batalha do Riachuelo garantiu o bloqueio dos rios da bacia platina pela Marinha Imperial e impediu a expansão de Solano López.',
    wikiUrl: 'https://pt.wikipedia.org/wiki/Batalha_do_Riachuelo'
  },
  // 12. Tenochtitlán (Nomes Antigos)
  {
    id: 'batch-hist-tenochtitlan',
    category: 'História',
    subcategory: 'Nomes Antigos & Arqueologia',
    difficulty: 2,
    clues: [
      'Segundo o mito fundador de seus sacerdotes, sua construção teve início quando avistaram uma águia pousada sobre um nopal devorando uma serpente em uma ilha do lago Texcoco.',
      'Sua malha urbana era cortada por canais navegáveis e conectada a terra firme por três grandes calçadas protegidas por diques de controle de enchentes.'
    ],
    powerClue: 'No centro de seu recinto sagrado erguia-se o Templo Mayor dedicado conjuntamente aos deuses Huitzilopochtli e Tlaloc (*)',
    giveaway: 'Nomeie esta monumental capital do Império Asteca que foi sitiada e arrasada pelos conquistadores de Hernán Cortés em 1521, sobre cujas ruínas foi erguida a atual Cidade do México.',
    answerCanonical: 'Tenochtitlán',
    acceptAliases: ['Tenochtitlan', 'México-Tenochtitlán', 'Mexico-Tenochtitlan'],
    promptAliases: ['capital asteca', 'cidade no lago texcoco'],
    explanation: 'Tenochtitlán foi uma das maiores cidades do mundo em 1519, com mais de 200 mil habitantes, soterrada sob a moderna Cidade do México.',
    wikiUrl: 'https://pt.wikipedia.org/wiki/Tenochtitl%C3%A1n'
  },
  // 13. Constantinopla (Nomes Antigos)
  {
    id: 'batch-hist-constantinopla',
    category: 'História',
    subcategory: 'Nomes Antigos & Topônimos',
    difficulty: 1,
    clues: [
      'Foi fundada originalmente por colonos gregos de Mégara no século VII a.C. com o nome arcaico de Bizâncio no estreito de Bósforo.',
      'Sua entrada marítima no Chifre de Ouro era defendida por uma gigantesca corrente flutuante de elos de ferro forjado que impedia a penetração de esquadras invasoras.'
    ],
    powerClue: 'O imperador Constantino, o Grande a rebatizou em 330 d.C. como Nova Roma, mas ela consagrou-se historicamente pelo nome do seu patrono imperial (*)',
    giveaway: 'Qual foi esta célebre capital milenar do Império Bizantino e posteriormente do Império Otomano, rebatizada no século XX como a cidade de Istambul?',
    answerCanonical: 'Constantinopla',
    acceptAliases: ['Constantinopla', 'Nova Roma', 'Bizâncio Antigo'],
    promptAliases: ['antigo nome de istambul', 'capital de constantino'],
    explanation: 'Constantinopla foi o coração do Império Romano do Oriente e do Império Otomano, rebatizada oficialmente como Istambul em 1930.',
    wikiUrl: 'https://pt.wikipedia.org/wiki/Constantinopla'
  },
  // 14. Batalha de Waterloo
  {
    id: 'batch-hist-batalha-waterloo',
    category: 'História',
    subcategory: 'Guerras Napoleônicas',
    difficulty: 1,
    clues: [
      'O general britânico ordenou que seus soldados da guarda de infantaria se deitassem no chão atrás de uma crista no terreno para se protegerem da barragem de artilharia da "Grande Bateria".',
      'O marechal francês Michel Ney lançou prematuramente sucessivas cargas de cavalaria pesada que foram massacradas pelos quadrados britânicos inabaláveis.'
    ],
    powerClue: 'A chegada oportuna no fim da tarde das forças prussianas do marechal Gebhard von Blücher selou a derrocada definitiva das forças francesas em 18 de junho de 1815 (*)',
    giveaway: 'Nomeie esta famosa batalha travada na Bélgica na qual Napoleão Bonaparte foi derrotado pela coalizão do Duque de Wellington, encerrando o Governo dos Cem Dias e seu império.',
    answerCanonical: 'Batalha de Waterloo',
    acceptAliases: ['Waterloo', 'Batalha de Waterloo de 1815'],
    promptAliases: ['derrota final de napoleão', 'batalha de wellington'],
    explanation: 'A Batalha de Waterloo (1815) encerrou a era napoleônica e levou ao exílio final de Napoleão na ilha de Santa Helena.',
    wikiUrl: 'https://pt.wikipedia.org/wiki/Batalha_de_Waterloo'
  },
  // 15. Batalha de Termópilas
  {
    id: 'batch-hist-batalha-termopilas',
    category: 'História',
    subcategory: 'Guerras Médicas',
    difficulty: 1,
    clues: [
      'O poeta Simónides compôs o comovente epitáfio que dizia: "Estrangeiro, vai dizer a Esparta que aqui jazemos em obediência às suas leis".',
      'Um traidor local chamado Efialtes de Traquis revelou aos invasores uma trilha secreta nas montanhas de Anopeia que permitiu contornar e cercar os defensores pela retaguarda.'
    ],
    powerClue: 'O rei espartano Leônidas I dispensou o grosso do exército aliado e comandou uma resistência suicida heroica junto com trezentos cidadãos espartanos contra as hordas do rei Xerxes I em 480 a.C. (*)',
    giveaway: 'Qual é este lendário confronto bélico travado em um desfiladeiro costeiro estreito da Grécia central, símbolo máximo do sacrifício militar espartano?',
    answerCanonical: 'Batalha das Termópilas',
    acceptAliases: ['Termópilas', 'Batalha de Termópilas', 'Termopilas'],
    promptAliases: ['batalha dos 300', 'combate de leônidas'],
    explanation: 'A Batalha das Termópilas (480 a.C.) atrasou a invasão persa e inspirou os gregos a vencerem em Salamina e Plateias.',
    wikiUrl: 'https://pt.wikipedia.org/wiki/Batalha_das_Term%C3%B3pilas'
  }
];

export function getBatchQuestions(): Tossup[] {
  return ANCIENT_EMPIRES_WARS_QUESTIONS.map(q => {
    const fullText = [
      ...q.clues,
      q.powerClue,
      q.giveaway
    ].join(' ');

    const formattedAnswer = `<b><u>${q.answerCanonical}</u></b>` +
      (q.acceptAliases.length > 0 ? ` [aceite também <i>${q.acceptAliases.join(', ')}</i>]` : '');

    return {
      id: q.id,
      origin: 'qbreader',
      category: q.category,
      subcategory: q.subcategory,
      difficulty: q.difficulty,
      question_pt: fullText,
      formatted_answer_pt: formattedAnswer,
      answer_canonical_pt: q.answerCanonical,
      accept_aliases: q.acceptAliases,
      prompt_aliases: q.promptAliases,
      lead_in: q.clues[0],
      giveaway: q.giveaway,
      explanation: q.explanation,
      wiki_url: q.wikiUrl
    };
  });
}
