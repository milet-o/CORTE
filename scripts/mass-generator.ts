import * as fs from 'fs';
import * as path from 'path';
import { Tossup } from '../types/quizbowl';
import { BRAZILIAN_TOPICS } from './wikipedia-brasil';
import { getCuratedUniversalQuestions } from './fetch-qbreader';

export interface MassTopic {
  title: string;
  category: string;
  subcategory: string;
  difficulty: number;
  clues: string[];
  powerClue: string;
  giveaway: string;
  canonicalAnswer: string;
  acceptAliases: string[];
  promptAliases: string[];
  explanation: string;
}

/**
 * Banco massivo de tópicos diversificados: Química, Física, Cidades do Brasil,
 * Personalidades, Políticos, Curiosidades do Mundo e Biologia.
 */
export const MASS_EXPANSION_TOPICS: MassTopic[] = [
  // --- QUÍMICA & FÍSICA (Exemplo do usuário: Deutério, Água Pesada, Hélio, etc.) ---
  {
    title: 'Deutério',
    category: 'Ciência',
    subcategory: 'Química e Física Nuclear',
    difficulty: 2,
    clues: [
      'Foi descoberto em 1931 pelo químico Harold Urey, feito que lhe rendeu o Prêmio Nobel de Química de 1934.',
      'Na astrofísica estelar, é um combustível essencial nos estágios primordiais de fusão de anãs marrons e protoestrelas.'
    ],
    powerClue: 'Seu composto óxido com oxigênio, conhecido popularmente como água pesada, é empregado como moderador de nêutrons em reatores nucleares CANDU (*)',
    giveaway: 'Identifique este isótopo estável do hidrogênio cujo núcleo atômico é formado por exatamente um próton e um nêutron, representado pela letra D ou Hidrogênio-2.',
    canonicalAnswer: 'Deutério',
    acceptAliases: ['Deuterio', 'Hidrogênio-2', 'Hidrogenio-2', 'Água Pesada', 'Agua Pesada', '2H'],
    promptAliases: ['isótopo do hidrogênio', 'hidrogênio pesado'],
    explanation: 'O deutério (²H ou D) é um dos isótopos estáveis do hidrogênio. Seu núcleo possui um próton e um nêutron, e seu óxido forma a água pesada utilizada em reatores nucleares.'
  },
  {
    title: 'Água Pesada',
    category: 'Ciência',
    subcategory: 'Química',
    difficulty: 2,
    clues: [
      'Durante a Segunda Guerra Mundial, a resistência norueguesa e os Aliados sabotaram a usina de Vemork na Operação Gunnerside para impedir que a Alemanha nazista a usasse em seu projeto atômico.',
      'Possui densidade aproximadamente onze por cento maior do que a substância convencional correspondente a vinte graus Celsius.'
    ],
    powerClue: 'Ela atua como um excelente moderador em reatores de urânio natural por possuir uma seção de choque de absorção de nêutrons térmicos extraordinariamente baixa (*)',
    giveaway: 'Nomeie este composto químico formado pela ligação de oxigênio com dois átomos do isótopo deutério, representado pela fórmula D2O.',
    canonicalAnswer: 'Água Pesada',
    acceptAliases: ['Agua Pesada', 'Óxido de Deutério', 'Oxido de Deuterio', 'D2O'],
    promptAliases: ['água de deutério', 'moderador nuclear'],
    explanation: 'A água pesada (óxido de deutério, D₂O) substitui os átomos de hidrogênio comuns por deutério, sendo vital para moderar nêutrons em reatores nucleares.'
  },
  {
    title: 'Hélio',
    category: 'Ciência',
    subcategory: 'Química',
    difficulty: 1,
    clues: [
      'Foi detectado pela primeira vez como uma linha espectral amarela brilhante na cromosfera solar durante o eclipse de 1868 pelo astrônomo francês Pierre Janssen.',
      'Em temperaturas próximas ao zero absoluto, seu isótopo 4 entra em um estado de superfluidez com viscosidade rigorosamente nula chamado líquido de He-II.'
    ],
    powerClue: 'Na cadeia próton-próton que alimenta o Sol, quatro núcleos de hidrogênio fundem-se continuamente para gerar núcleos deste elemento (*)',
    giveaway: 'Identifique este segundo elemento mais abundante e mais leve de todo o universo observável, um gás nobre de número atômico 2.',
    canonicalAnswer: 'Hélio',
    acceptAliases: ['Helio', 'He'],
    promptAliases: ['gás nobre', 'segundo elemento'],
    explanation: 'O hélio (He, número atômico 2) é um gás nobre inerte e incolor, sendo o segundo elemento mais abundante do universo após o hidrogênio.'
  },
  {
    title: 'Grafeno',
    category: 'Ciência',
    subcategory: 'Física dos Materiais',
    difficulty: 2,
    clues: [
      'Foi isolado com sucesso pela primeira vez em 2004 pelos físicos Andre Geim e Konstantin Novoselov usando simplesmente fita adesiva sobre grafite.',
      'Seus elétrons de condução movem-se com velocidades relativísticas como se não possuíssem massa de repouso, descritos por bicos de Dirac.'
    ],
    powerClue: 'Apresenta resistência mecânica cerca de duzentas vezes superior à do aço estrutural e excelente condutividade térmica e elétrica (*)',
    giveaway: 'Nomeie este nanomaterial bidimensional composto por uma única camada atômica de carbono hibridizado sp2 disposta em uma rede hexagonal semelhante a favos de mel.',
    canonicalAnswer: 'Grafeno',
    acceptAliases: ['O Grafeno'],
    promptAliases: ['camada de carbono', 'alótropo de carbono'],
    explanation: 'O grafeno é uma forma alotrópica bidimensional do carbono, extremamente resistente e condutora, que rendeu o Nobel de Física de 2010.'
  },
  {
    title: 'Buraco Negro',
    category: 'Ciência',
    subcategory: 'Astrofísica',
    difficulty: 1,
    clues: [
      'O físico britânico Roger Penrose demonstrou que sua formação decorre inevitavelmente do colapso gravitacional na Relatividade Geral, ganhando o Nobel de 2020.',
      'Stephen Hawking teorizou que eles podem evaporar lentamente ao longo de éons emitindo partículas através de um efeito quântico perto da sua borda.'
    ],
    powerClue: 'A fronteira sem retorno que delimita sua região de não escape é formalmente conhecida como o horizonte de eventos (*)',
    giveaway: 'Qual o nome desta região do espaço-tempo com gravidade tão colossal que absolutamente nada, nem mesmo a luz, consegue escapar de seu interior?',
    canonicalAnswer: 'Buraco Negro',
    acceptAliases: ['Buracos Negros', 'Buraco negro supermassivo'],
    promptAliases: ['singularidade gravitacional', 'horizonte de eventos'],
    explanation: 'Um buraco negro é um corpo celeste com gravidade tão intensa que nada pode escapar após cruzar o horizonte de eventos.'
  },

  // --- CIDADES DO BRASIL ---
  {
    title: 'Ouro Preto',
    category: 'Cidades do Brasil',
    subcategory: 'Minas Gerais',
    difficulty: 1,
    clues: [
      'Foi o epicentro da Inconfidência Mineira em 1789 e serviu como capital da província e estado até a fundação de Belo Horizonte em 1897.',
      'Abriga o Museu da Inconfidência na antiga Casa de Câmara e Cadeia e o Museu de Mineralogia na Escola de Minas.'
    ],
    powerClue: 'Suas ladeiras barrocas preservam as maiores obras-primas da escultura de Aleijadinho e da pintura de mestre Ataíde, como a Igreja de São Francisco de Assis (*)',
    giveaway: 'Nomeie este histórico município mineiro originalmente chamado de Vila Rica, o primeiro sítio brasileiro declarado Patrimônio Cultural da Humanidade pela UNESCO.',
    canonicalAnswer: 'Ouro Preto',
    acceptAliases: ['Vila Rica', 'Município de Ouro Preto'],
    promptAliases: ['cidade barroca de minas', 'capital antiga de minas'],
    explanation: 'Ouro Preto (antiga Vila Rica) foi o centro do ciclo do ouro e da Inconfidência Mineira, preservando o mais famoso conjunto barroco do Brasil.'
  },
  {
    title: 'Paraty',
    category: 'Cidades do Brasil',
    subcategory: 'Rio de Janeiro',
    difficulty: 2,
    clues: [
      'Era o principal ponto de transbordo e escoamento terrestre do Caminho do Ouro até que a Estrada Real foi redirecionada diretamente para o Rio de Janeiro.',
      'Suas ruas calçadas com pedras "pé-de-moleque" foram arquitetonicamente planejadas para que a maré cheia da baía lave o centro histórico durante a lua cheia.'
    ],
    powerClue: 'Sedia anualmente desde 2003 a FLIP, a principal festa literária internacional realizada em território brasileiro (*)',
    giveaway: 'Identifique esta histórica e charmosa cidade litorânea do sul do estado do Rio de Janeiro, famosa por suas cachaças artesanais e casario colonial à beira-mar.',
    canonicalAnswer: 'Paraty',
    acceptAliases: ['Parati', 'Município de Paraty'],
    promptAliases: ['cidade da FLIP', 'cidade colonial do rio'],
    explanation: 'Paraty é uma cidade colonial histórica da Costa Verde fluminense, famosa pela arquitetura colonial inundada pelas marés e pela FLIP.'
  },
  {
    title: 'Petrópolis',
    category: 'Cidades do Brasil',
    subcategory: 'Rio de Janeiro',
    difficulty: 2,
    clues: [
      'Nesta cidade serrana foi assinado o Tratado de 1903 pelo barão do Rio Branco que oficializou a anexação do território do Acre ao Brasil junto à Bolívia.',
      'Nela localiza-se a Encantada, curiosa residência de verão projetada pelo inventor Alberto Santos-Dumont com escadas em formato de asas.'
    ],
    powerClue: 'Seu Palácio Imperial serviu como residência de verão favorita da família imperial brasileira de Dom Pedro II (*)',
    giveaway: 'Qual é este município serrano fluminense conhecido como a "Cidade Imperial", onde repousam os restos mortais de Dom Pedro II e da princesa Isabel?',
    canonicalAnswer: 'Petrópolis',
    acceptAliases: ['Petropolis', 'Cidade Imperial'],
    promptAliases: ['cidade serrana do rio', 'cidade de dom pedro'],
    explanation: 'Petrópolis, a Cidade Imperial na Serra dos Órgãos (RJ), foi planejada pelo major Köeler a pedido de Dom Pedro II como refúgio de verão da monarquia.'
  },
  {
    title: 'Salvador',
    category: 'Cidades do Brasil',
    subcategory: 'Bahia',
    difficulty: 1,
    clues: [
      'Foi fundada em 1549 pelo primeiro governador-geral Tomé de Sousa por ordem direta do rei Dom João III para centralizar a administração colonial portuguesa.',
      'Seu traçado urbano clássico divide-se entre a Cidade Alta e a Cidade Baixa, conectadas historicamente pelo imponente Elevador Lacerda.'
    ],
    powerClue: 'Seu centro histórico abriga o Pelourinho, célebre pela Igreja e Convento de São Francisco e pelos ensaios do bloco afro Olodum (*)',
    giveaway: 'Nomeie esta capital da Bahia, que foi a primeira capital oficial de toda a história do Brasil até a transferência para o Rio de Janeiro em 1763.',
    canonicalAnswer: 'Salvador',
    acceptAliases: ['Salvador da Bahia', 'São Salvador da Bahia de Todos os Santos'],
    promptAliases: ['primeira capital', 'capital da bahia'],
    explanation: 'Salvador foi a primeira capital do Brasil (1549-1763), coração da cultura afro-brasileira e dona de um riquíssimo patrimônio arquitetônico colonial.'
  },
  {
    title: 'Brasília',
    category: 'Cidades do Brasil',
    subcategory: 'Distrito Federal',
    difficulty: 1,
    clues: [
      'A profecia de um sonho de São João Bosco em 1883 previa o nascimento de uma grande civilização entre os paralelos 15 e 20 no interior do continente sul-americano.',
      'O arquiteto Lúcio Costa venceu o concurso nacional do Plano Piloto estruturando seu traçado em formato de avião ao longo do Eixo Rodoviário e Eixo Monumental.'
    ],
    powerClue: 'A Praça dos Três Poderes reúne edifícios icônicos de concreto armado e curvas sinuosas desenhados pelo arquiteto Oscar Niemeyer (*)',
    giveaway: 'Identifique esta cidade planejada inaugurada em 21 de abril de 1960 durante o governo de Juscelino Kubitschek como a capital federal do Brasil.',
    canonicalAnswer: 'Brasília',
    acceptAliases: ['Brasilia', 'Capital Federal', 'Distrito Federal'],
    promptAliases: ['plano piloto', 'capital do brasil'],
    explanation: 'Brasília foi inaugurada em 1960 no Planalto Central como a nova capital do Brasil, projetada por Lúcio Costa e Oscar Niemeyer.'
  },
  {
    title: 'Manaus',
    category: 'Cidades do Brasil',
    subcategory: 'Amazonas',
    difficulty: 1,
    clues: [
      'Originou-se em torno da fortaleza militar de São José da Barra do Rio Negro erguida no século XVII para proteger a foz da bacia amazônica contra invasões.',
      'Perto do seu porto ocorre o fenômeno hidrológico do Encontro das Águas escuras do rio Negro com as águas barrentas do rio Solimões sem se misturarem por quilômetros.'
    ],
    powerClue: 'Durante o auge do Ciclo da Borracha na Belle Époque amazônica, foi erguido em estilo renascentista o Teatro Amazonas com cúpula de cerâmicas policromadas (*)',
    giveaway: 'Nomeie esta maior metrópole da Região Norte e capital do estado do Amazonas, famosa pelo seu Polo Industrial e Zona Franca.',
    canonicalAnswer: 'Manaus',
    acceptAliases: ['Cidade de Manaus', 'Capital do Amazonas'],
    promptAliases: ['capital amazônica', 'cidade do teatro amazonas'],
    explanation: 'Manaus é a capital do Amazonas, centro financeiro da região norte e metrópole do Ciclo da Borracha e da Zona Franca de Manaus.'
  },

  // --- PERSONALIDADES BRASILEIRAS ---
  {
    title: 'Ayrton Senna',
    category: 'Personalidades do Brasil',
    subcategory: 'Esportes',
    difficulty: 1,
    clues: [
      'Sua atuação magistral sob tempestades torrenciais, como no GP de Mônaco de 1984 com a modesta Toleman e em Donington Park em 1993, consagrou-o como o maior piloto de chuva da história.',
      'Manteve uma lendária e feroz rivalidade esportiva internacional contra o piloto francês Alain Prost na equipe McLaren.'
    ],
    powerClue: 'Conquistou três campeonatos mundiais de Fórmula 1 nos anos de 1988, 1990 e 1991 pilotando os carros pintados de vermelho e branco da McLaren (*)',
    giveaway: 'Nomeie este lendário piloto automobilístico brasileiro idolatrado nacionalmente, que faleceu tragicamente no circuito de Ímola em maio de 1994.',
    canonicalAnswer: 'Ayrton Senna',
    acceptAliases: ['Senna', 'Ayrton Senna da Silva'],
    promptAliases: ['piloto brasileiro', 'tricampeão de f1'],
    explanation: 'Ayrton Senna (1960-1994) foi tricampeão mundial de Fórmula 1 e um dos maiores ídolos esportivos da história do Brasil.'
  },
  {
    title: 'Pelé',
    category: 'Personalidades do Brasil',
    subcategory: 'Esportes',
    difficulty: 1,
    clues: [
      'Estreou em Copas do Mundo na Suécia em 1958 com apenas dezessete anos de idade, marcando dois gols na grande final contra a seleção anfitriã.',
      'Marcou seu milésimo gol na carreira no estádio do Maracanã em novembro de 1969, convertendo um pênalti contra o Vasco da Gama pelo Santos Futebol Clube.'
    ],
    powerClue: 'É o único jogador em toda a história do futebol a ter conquistado três títulos de Copa do Mundo da FIFA como atleta, em 1958, 1962 e 1970 (*)',
    giveaway: 'Identifique este atleta mineiro nascido como Edson Arantes do Nascimento, reverenciado mundialmente como o "Rei do Futebol".',
    canonicalAnswer: 'Pelé',
    acceptAliases: ['Pele', 'Edson Arantes do Nascimento', 'Rei Pelé', 'Rei do Futebol'],
    promptAliases: ['o rei do futebol', 'camisa 10 do santos'],
    explanation: 'Pelé (1940-2022) marcou mais de 1.200 gols e venceu 3 Copas do Mundo (1958, 1962, 1970), eleito o Atleta do Século XX.'
  },
  {
    title: 'Oscar Niemeyer',
    category: 'Personalidades do Brasil',
    subcategory: 'Arquitetura',
    difficulty: 1,
    clues: [
      'Em seu primeiro grande trabalho solo com Juscelino Kubitschek nos anos 1940, desenhou o conjunto arquitetônico da Pampulha em Belo Horizonte.',
      'Membro histórico do Partido Comunista Brasileiro, exilou-se na França durante a ditadura militar e desenhou a sede do Partido Comunista Francês em Paris.'
    ],
    powerClue: 'Ele declarou célebremente que o que o atraía não era o ângulo reto nem a linha dura criada pelo homem, mas a curva livre e sensual encontrada nas montanhas e no corpo da mulher (*)',
    giveaway: 'Nomeie este mestre da arquitetura moderna mundial que desenhou o Palácio do Planalto, o Congresso Nacional e a Catedral de Brasília.',
    canonicalAnswer: 'Oscar Niemeyer',
    acceptAliases: ['Niemeyer', 'Oscar Ribeiro de Almeida Niemeyer Soares Filho'],
    promptAliases: ['arquiteto de brasília', 'arquiteto modernista'],
    explanation: 'Oscar Niemeyer (1907-2012) foi um dos maiores arquitetos do século XX, pioneiro no uso escultural e curvo do concreto armado.'
  },
  {
    title: 'Elis Regina',
    category: 'Personalidades do Brasil',
    subcategory: 'Música Popular Brasileira',
    difficulty: 2,
    clues: [
      'Venceu o Primeiro Festival de Música Popular Brasileira em 1965 interpretando com gestos dramáticos a canção "Arrastão", de Edu Lobo e Vinicius de Moraes.',
      'Gravou com Tom Jobim em Los Angeles em 1974 o antológico álbum que imortalizou o dueto em "Águas de Março".'
    ],
    powerClue: 'Apelidada carinhosamente de "Pimentinha" e "Furacão", deu voz definitiva ao hino da anistia "O Bêbado e a Equilibrista" de Aldir Blanc e João Bosco (*)',
    giveaway: 'Identifique esta magistral cantora gaúcha considerada por muitos a maior intérprete feminina da história da música popular brasileira.',
    canonicalAnswer: 'Elis Regina',
    acceptAliases: ['Elis', 'Elis Regina Carvalho Costa', 'Pimentinha'],
    promptAliases: ['cantora de águas de março', 'a pimentinha'],
    explanation: 'Elis Regina (1945-1982) foi uma das vozes mais técnicas e viscerais do Brasil, marcando a Era dos Festivais e a MPB.'
  },

  // --- POLÍTICOS & GOVERNANTES DO BRASIL ---
  {
    title: 'Tancredo Neves',
    category: 'Políticos do Brasil',
    subcategory: 'República Nova',
    difficulty: 2,
    clues: [
      'Atuou como Ministro da Justiça no segundo governo de Getúlio Vargas e desempenhou o papel de Primeiro-Ministro durante a breve experiência parlamentarista de 1961.',
      'Governador de Minas Gerais, uniu a oposição democrática através da Aliança Democrática ao lado de dissidentes do regime militar.'
    ],
    powerClue: 'Foi eleito presidente pelo Colégio Eleitoral em janeiro de 1985 derrotando Paulo Maluf e encerrando formalmente os 21 anos da ditadura militar (*)',
    giveaway: 'Nomeie este político mineiro que adoeceu gravemente na véspera da posse presidencial em março de 1985, vindo a falecer sem assumir o cargo.',
    canonicalAnswer: 'Tancredo Neves',
    acceptAliases: ['Tancredo', 'Tancredo de Almeida Neves'],
    promptAliases: ['presidente eleito em 85', 'político mineiro'],
    explanation: 'Tancredo Neves (1910-1985) simbolizou a transição democrática brasileira em 1985, mas faleceu antes da posse, transmitindo o cargo a José Sarney.'
  },
  {
    title: 'Dom Pedro I',
    category: 'Políticos do Brasil',
    subcategory: 'Império do Brasil',
    difficulty: 1,
    clues: [
      'Escreveu a música oficial do Hino da Independência do Brasil e posteriormente compôs o Hino da Carta Constitucional portuguesa.',
      'Após o episódio da Noite das Garrafadas e crescente impopularidade, abdicou da coroa brasileira em 1831 em favor de seu filho de apenas cinco anos para lutar na Guerra Civil Portuguesa.'
    ],
    powerClue: 'No dia 9 de janeiro de 1822 desobedeceu as ordens das Cortes de Lisboa pronunciando a célebre frase do "Dia do Fico" (*)',
    giveaway: 'Identifique este primeiro imperador do Brasil que proclamou a Independência às margens do riacho do Ipiranga em 7 de setembro de 1822.',
    canonicalAnswer: 'Dom Pedro I',
    acceptAliases: ['Pedro I', 'D. Pedro I', 'Dom Pedro Primeiro', 'Pedro IV de Portugal'],
    promptAliases: ['o imperador da independência', 'primeiro imperador'],
    explanation: 'Dom Pedro I (1798-1834) proclamou a Independência do Brasil em 1822, outorgou a primeira Constituição em 1824 e abdicou em 1831.'
  },
  {
    title: 'Ulysses Guimarães',
    category: 'Políticos do Brasil',
    subcategory: 'República Nova',
    difficulty: 2,
    clues: [
      'Em 1973 lançou sua ousada "anticandidatura" presidencial pelo MDB como forma de protesto público contra a farsa eleitoral do regime militar.',
      'Faleceu em outubro de 1992 em um acidente trágico de helicóptero no litoral de Angra dos Reis, sendo que seu corpo jamais foi resgatado do mar.'
    ],
    powerClue: 'Como presidente da Assembleia Nacional Constituinte de 1988, ergueu o exemplar da nova Carta Magna apelidando-a de "Constituição Cidadã" (*)',
    giveaway: 'Nomeie este histórico líder político paulista conhecido como o "Senhor Diretas" pelo seu papel na redemocratização do Brasil.',
    canonicalAnswer: 'Ulysses Guimarães',
    acceptAliases: ['Ulysses Guimaraes', 'Doutor Ulysses', 'Dr. Ulysses'],
    promptAliases: ['senhor diretas', 'presidente da constituinte'],
    explanation: 'Ulysses Guimarães (1916-1992) foi o presidente da Assembleia Constituinte de 1988 e a maior voz civil pela redemocratização do Brasil.'
  },

  // --- CURIOSIDADES & MARAVILHAS MUNDIAIS ---
  {
    title: 'Fossa das Marianas',
    category: 'Curiosidades do Mundo',
    subcategory: 'Geografia Oceânica',
    difficulty: 2,
    clues: [
      'O oceanógrafo Jacques Piccard e Don Walsh alcançaram suas profundezas em janeiro de 1960 a bordo do batiscafo Trieste projetado por Auguste Piccard.',
      'O cineasta James Cameron realizou em 2012 a primeira descida solitária ao fundo de sua depressão pilotando o submarino Deepsea Challenger.'
    ],
    powerClue: 'Seu ponto mais extremo e profundo, localizado no fundo do oceano Pacífico ocidental, é denominado Depressão Challenger (*)',
    giveaway: 'Qual o nome desta fossa oceânica que abriga o ponto mais profundo de toda a hidrosfera terrestre, descendo a quase onze mil metros abaixo do nível do mar?',
    canonicalAnswer: 'Fossa das Marianas',
    acceptAliases: ['Fossas das Marianas', 'Marianas Trench', 'Depressão Challenger'],
    promptAliases: ['fossa mais profunda', 'ponto mais fundo do oceano'],
    explanation: 'A Fossa das Marianas, no Oceano Pacífico, é o local mais profundo dos oceanos da Terra, atingindo quase 11 km de profundidade na Depressão Challenger.'
  },
  {
    title: 'Aurora Boreal',
    category: 'Curiosidades do Mundo',
    subcategory: 'Fenômenos Naturais',
    difficulty: 1,
    clues: [
      'A cor verde esmeralda mais comum deste fenômeno óptico é emitida pela excitação e recombinação de átomos de oxigênio a cerca de cem quilômetros de altitude.',
      'O astrônomo Galileu Galilei cunhou este termo em 1619 combinando a deusa romana do amanhecer com o nome do vento do norte da mitologia grega.'
    ],
    powerClue: 'Ela é gerada quando partículas carregadas de vento solar colidem com o campo magnético da magnetosfera terrestre e canalizam-se nos polos (*)',
    giveaway: 'Nomeie este espetacular fenômeno luminoso de cortinas coloridas ondulantes que ocorre no céu noturno das altas latitudes do Hemisfério Norte.',
    canonicalAnswer: 'Aurora Boreal',
    acceptAliases: ['A Aurora Boreal', 'Auroras Boreais', 'Luzes do Norte'],
    promptAliases: ['aurora polar', 'luzes nórdicas'],
    explanation: 'A Aurora Boreal é um fenômeno luminoso que ocorre no Hemisfério Norte decorrente do impacto de ventos solares com a atmosfera e campo magnético da Terra.'
  },
  {
    title: 'Mitocôndria',
    category: 'Ciência',
    subcategory: 'Biologia Celular',
    difficulty: 1,
    clues: [
      'A bióloga Lynn Margulis propôs a teoria da endossimbiose para explicar sua origem evolutiva a partir de antigas proteobactérias aeróbicas fagocitadas.',
      'Possui seu próprio material genético circular e ribossomos independentes do núcleo da célula eucariótica, sendo herdada quase exclusivamente por via materna.'
    ],
    powerClue: 'Em suas cristas internas e matriz ocorre o Ciclo de Krebs e a fosforilação oxidativa pela cadeia transportadora de elétrons (*)',
    giveaway: 'Identifique esta organela celular fundamental popularmente conhecida como a "usina de energia" da célula por ser responsável pela produção da molécula de ATP.',
    canonicalAnswer: 'Mitocôndria',
    acceptAliases: ['Mitocondria', 'Mitocôndrias', 'Mitocondrias'],
    promptAliases: ['organela de energia', 'usina de atp'],
    explanation: 'A mitocôndria é a organela responsável pela respiração celular aeróbica e síntese de ATP na maioria das células eucarióticas.'
  }
];

export async function generateMassDatabase(): Promise<Tossup[]> {
  console.log('--- INICIANDO COMPILAÇÃO DO BANCO EXPANDIDO DO CORTE ---');

  // 1. Tópicos do acervo inicial enriquecidos
  const brazilianBase = await import('./wikipedia-brasil').then(m => m.generateBrazilianQuestions());
  const universalBase = getCuratedUniversalQuestions();

  // 2. Novos tópicos massivos (Química, Cidades, Personalidades, Políticos, Curiosidades)
  const massTossups: Tossup[] = MASS_EXPANSION_TOPICS.map(topic => {
    const fullText = [
      ...topic.clues,
      topic.powerClue,
      topic.giveaway
    ].join(' ');

    const formattedAnswer = `<b><u>${topic.canonicalAnswer}</u></b>` +
      (topic.acceptAliases.length > 0 ? ` [aceite também <i>${topic.acceptAliases.join(', ')}</i>]` : '');

    return {
      id: `mass-${topic.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      origin: topic.category.includes('Brasil') ? 'wikipedia_br' : 'qbreader',
      category: topic.category,
      subcategory: topic.subcategory,
      difficulty: topic.difficulty,
      question_pt: fullText,
      formatted_answer_pt: formattedAnswer,
      answer_canonical_pt: topic.canonicalAnswer,
      accept_aliases: topic.acceptAliases,
      prompt_aliases: topic.promptAliases,
      lead_in: topic.clues[0],
      giveaway: topic.giveaway,
      explanation: topic.explanation,
      wiki_url: `https://pt.wikipedia.org/wiki/${encodeURIComponent(topic.title)}`
    };
  });

  const all = [...brazilianBase, ...universalBase, ...massTossups];
  console.log(`--- TOTAL COMPILADO: ${all.length} QUESTÕES ---`);
  return all;
}
