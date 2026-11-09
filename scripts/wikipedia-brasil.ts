import { Tossup } from '../types/quizbowl';

export interface WikiTopicDefinition {
  title: string;
  category: string;
  subcategory: string;
  difficulty: number;
  obscureClues: string[];
  powerClue: string;
  standardClues: string[];
  giveaway: string;
  canonicalAnswer: string;
  acceptAliases: string[];
  promptAliases: string[];
  rejectAliases?: string[];
  explanation: string;
}

export const BRAZILIAN_TOPICS: WikiTopicDefinition[] = [
  {
    title: 'Revolta da Vacina',
    category: 'História',
    subcategory: 'História do Brasil',
    difficulty: 3,
    obscureClues: [
      'Durante esta rebelião, o coronel Ataliba Gomes tentou aproveitar o descontentamento popular para tramar um golpe militar junto à Escola Militar da Praia Vermelha.',
      'O jornal oposicionista Correio da Manhã acusava o governo de violar o recato familiar com a proposta apelidada de "lei do massacre civil".'
    ],
    powerClue: 'A revolta teve seu estopim no bairro da Saúde após a publicação de um projeto de regulamentação elaborado pelo sanitarista Oswaldo Cruz (*)',
    standardClues: [
      'O presidente Rodrigues Alves chegou a decretar estado de sítio na capital federal em novembro de 1904.',
      'Centenas de revoltosos foram capturados pelas forças armadas e deportados em navios para o território do Acre.'
    ],
    giveaway: 'Identifique este motim popular ocorrido no Rio de Janeiro que se insurgiu contra a imunização compulsória contra a varíola.',
    canonicalAnswer: 'Revolta da Vacina',
    acceptAliases: ['A Revolta da Vacina', 'Revolta da Vacina de 1904'],
    promptAliases: ['revolta no Rio', 'revolta sanitária', 'motim da vacina'],
    rejectAliases: ['Revolta da Chibata', 'Revolta da Armada'],
    explanation: 'A Revolta da Vacina ocorreu em novembro de 1904 no Rio de Janeiro, motivada pela campanha de vacinação obrigatória contra a varíola liderada por Oswaldo Cruz e pelo plano de reurbanização higienista do prefeito Pereira Passos.'
  },
  {
    title: 'Inconfidência Mineira',
    category: 'História',
    subcategory: 'História do Brasil',
    difficulty: 2,
    obscureClues: [
      'Um dos membros desta conspiração, o poeta Cláudio Manuel da Costa, foi encontrado enforcado sob circunstâncias suspeitas em sua cela na Casa dos Contos.',
      'Os conjurados planejavam fundar uma universidade em Vila Rica e adotar uma bandeira inspirada na Revolução Americana com o lema latino "Libertas Quae Sera Tamen".'
    ],
    powerClue: 'A conspiração foi delatada ao governador Visconde de Barbacena pelo coronel Joaquim Silvério dos Reis para ter suas dívidas perdoadas (*)',
    standardClues: [
      'O movimento foi impulsionado pelo medo da "derrama", a cobrança forçada de cem arrobas de ouro atrasadas pelo fisco da Coroa Portuguesa em 1789.',
      'A maioria dos participantes intelectuais e padres foi condenada ao degredo na África pelo tribunal do Tribunal da Alçada.'
    ],
    giveaway: 'Nomeie esta conspiração republicana colonial cujo único réu executado na forca foi Joaquim José da Silva Xavier, o Tiradentes.',
    canonicalAnswer: 'Inconfidência Mineira',
    acceptAliases: ['Conjuração Mineira', 'Revolta de Tiradentes'],
    promptAliases: ['inconfidência', 'conjuração', 'revolta mineira'],
    rejectAliases: ['Conjuração Baiana', 'Revolução Pernambucana'],
    explanation: 'A Inconfidência Mineira (1789) ocorreu na capitania de Minas Gerais contra o domínio português e os pesados impostos sobre o ouro. Tiradentes foi o único executado em 21 de abril de 1792.'
  },
  {
    title: 'Guerra de Canudos',
    category: 'História',
    subcategory: 'História do Brasil',
    difficulty: 3,
    obscureClues: [
      'A terceira expedição militar enviada contra este povoado foi dizimada e viu a morte do lendário comandante coronel Antônio Moreira César.',
      'O arraial foi erguido às margens do rio Vaza-Barris na fazenda abandonada de Belo Monte, atraindo sertanejos, ex-escravizados e retirantes da seca.'
    ],
    powerClue: 'O líder desta comunidade peregrinava pelo sertão restaurando igrejas e pregava contra o casamento civil e a República, sendo chamado de "Bom Jesus" (*)',
    standardClues: [
      'A cobertura jornalística deste conflito foi realizada para O Estado de S. Paulo pelo engenheiro e escritor Euclides da Cunha.',
      'A campanha militar mobilizou quatro expedições do Exército Brasileiro até a destruição total da comunidade em 1897, descrita na obra Os Sertões.'
    ],
    giveaway: 'Qual o nome deste conflito armado no sertão da Bahia liderado pelo beato messiânico Antônio Conselheiro?',
    canonicalAnswer: 'Guerra de Canudos',
    acceptAliases: ['Canudos', 'Campanha de Canudos'],
    promptAliases: ['arraial de Canudos', 'Belo Monte'],
    rejectAliases: ['Guerra do Contestado', 'Guerra dos Farrapos'],
    explanation: 'A Guerra de Canudos (1896-1897) foi um confronto entre o Exército Brasileiro e os seguidores de Antônio Conselheiro no sertão baiano, imortalizado por Euclides da Cunha em "Os Sertões".'
  },
  {
    title: 'Semana de Arte Moderna',
    category: 'Artes',
    subcategory: 'Cultura Brasileira',
    difficulty: 2,
    obscureClues: [
      'Na segunda noite deste evento, o pianista e compositor Guiomar Novaes tocou peças que desafiavam o gosto acadêmico, enquanto vaias ruidosas ecoavam nos camarotes.',
      'O artista plástico Di Cavalcanti foi o responsável por desenhar a capa do catálogo e o programa oficial das festividades.'
    ],
    powerClue: 'Durante a leitura do poema satírico "Os Sapos", de Manuel Bandeira, o público presente reagiu com vaias, gritos e latidos ao ouvir a ridicularização dos parnasianos (*)',
    standardClues: [
      'O evento foi patrocinado pela elite cafeeira paulista e reuniu intelectuais como Mário de Andrade e Oswald de Andrade no Theatro Municipal de São Paulo.',
      'O movimento catalisou as bases do modernismo no Brasil e culminou posteriormente no Manifesto Antropófago e na pintura Abaporu de Tarsila do Amaral.'
    ],
    giveaway: 'Nomeie este festival cultural realizado em fevereiro de 1922 que revolucionou a literatura, a música e as artes plásticas brasileiras.',
    canonicalAnswer: 'Semana de Arte Moderna',
    acceptAliases: ['Semana de Arte Moderna de 1922', 'Semana de 22', 'Semana Moderna de 22'],
    promptAliases: ['movimento modernista', 'Semana de Arte'],
    rejectAliases: ['Modernismo'],
    explanation: 'A Semana de Arte Moderna ocorreu entre 13 e 17 de fevereiro de 1922 no Theatro Municipal de São Paulo, marcando o início oficial do Modernismo no Brasil.'
  },
  {
    title: 'Revolta da Chibata',
    category: 'História',
    subcategory: 'História do Brasil',
    difficulty: 3,
    obscureClues: [
      'O marinheiro Marcelino Rodrigues Menezes recebeu duzentas e cinquenta chibatadas diante da tripulação reunida a bordo do encouraçado Minas Geraes, servindo de estopim para a revolta.',
      'Mesmo após o presidente Hermes da Fonseca prometer anistia aos amotinados, muitos líderes foram encarcerados e mortos por asfixia nas masmorras da Ilha das Cobras.'
    ],
    powerClue: 'Os marinheiros revoltosos apontaram os canhões dos modernos encouraçados dreadnought contra a Baía de Guanabara sob a liderança do timoneiro João Cândido (*)',
    standardClues: [
      'O líder da rebelião ficou célebre na cultura popular como o "Almirante Negro", cantado por Aldir Blanc e João Bosco na canção "O Mestre-Sala dos Mares".',
      'O motim exigia o fim dos castigos corporais na Marinha do Brasil e melhores condições de alimentação e soldo em 1910.'
    ],
    giveaway: 'Identifique esta revolta naval brasileira liderada por marinheiros negros que pôs fim ao uso de chibatadas como punição nas forças marítimas.',
    canonicalAnswer: 'Revolta da Chibata',
    acceptAliases: ['A Revolta da Chibata', 'Motim da Chibata'],
    promptAliases: ['revolta dos marinheiros', 'motim da marinha'],
    rejectAliases: ['Revolta da Armada', 'Revolta da Vacina'],
    explanation: 'A Revolta da Chibata (1910), liderada por João Cândido ("O Almirante Negro"), mobilizou os marinheiros contra os castigos físicos medievais ainda vigentes na Marinha do Brasil.'
  },
  {
    title: 'Quilombo dos Palmares',
    category: 'História',
    subcategory: 'História do Brasil',
    difficulty: 2,
    obscureClues: [
      'O líder Ganga Zumba firmou um controverso acordo de paz em 1678 com o governador da capitania de Pernambuco, o que provocou uma cisão interna e sua posterior deposição por envenenamento.',
      'Sua capital fortificada localizava-se na Serra da Barriga, na capitania de Pernambuco, atual estado de Alagoas, congregando dezenas de mocambos como o de Macaco.'
    ],
    powerClue: 'A destruição final deste assentamento autônomo foi chefiada em 1694 pelas forças mercenárias do bandeirante paulista Domingos Jorge Velho (*)',
    standardClues: [
      'Este refúgio durou quase um século e chegou a abrigar mais de vinte mil habitantes que resistiram às incursões de tropas holandesas e portuguesas.',
      'O líder que recusou a rendição e chefiou a resistência final foi traído e decapitado em 20 de novembro de 1695, data hoje comemorada como o Dia da Consciência Negra.'
    ],
    giveaway: 'Qual foi este maior refúgio autônomo de resistência negra na história colonial brasileira, governado por Ganga Zumba e Zumbi?',
    canonicalAnswer: 'Quilombo dos Palmares',
    acceptAliases: ['Palmares', 'Quilombo de Palmares'],
    promptAliases: ['mocambo de Palmares', 'quilombo'],
    rejectAliases: ['Quilombo do Campo Grande'],
    explanation: 'O Quilombo dos Palmares foi o maior símbolo de resistência contra a escravidão no Brasil, liderado por Ganga Zumba e posteriormente por Zumbi dos Palmares na Serra da Barriga.'
  },
  {
    title: 'Machado de Assis',
    category: 'Literatura',
    subcategory: 'Literatura Brasileira',
    difficulty: 1,
    obscureClues: [
      'Este autor foi presidente fundador da Academia Brasileira de Letras em 1897, ocupando a Cadeira número 23 cujo patrono era seu amigo José de Alencar.',
      'Na novela "O Alienista", seu personagem Simão Bacamarte funda a Casa Verde na vila de Itaguaí para internar cidadãos supostamente desequilibrados.'
    ],
    powerClue: 'A virada de sua carreira para a fase realista é marcada por um romance narrado por um "defunto autor" dedicado ao verme que primeiro roeu as frias carnes de seu cadáver (*)',
    standardClues: [
      'Em outro romance célebre, o narrador Bentinho é atormentado pelo ciúme e pelas suspeitas de infidelidade de sua esposa Capitu com seu melhor amigo Escobar.',
      'Criador da teoria do "Humanitismo" professada pelo filósofo Quincas Borba, este gênio carioca escreveu Dom Casmurro e Memórias Póstumas de Brás Cubas.'
    ],
    giveaway: 'Nomeie este mestre da literatura brasileira, autor de Dom Casmurro e imortalizado pelo epíteto de "Bruxo do Cosme Velho".',
    canonicalAnswer: 'Machado de Assis',
    acceptAliases: ['Joaquim Maria Machado de Assis', 'Machado'],
    promptAliases: ['Bruxo do Cosme Velho'],
    rejectAliases: ['José de Alencar', 'Lima Barreto', 'Aluísio Azevedo'],
    explanation: 'Machado de Assis (1839-1908) foi o fundador da Academia Brasileira de Letras e pioneiro do Realismo com Memórias Póstumas de Brás Cubas e Dom Casmurro.'
  },
  {
    title: 'Guerra do Paraguai',
    category: 'História',
    subcategory: 'História do Brasil',
    difficulty: 2,
    obscureClues: [
      'O estopim militar deste confronto foi o apresamento do vapor brasileiro Marquês de Olinda no rio Paraguai e a posterior invasão da província de Mato Grosso.',
      'O marquês e depois duque de Caxias coordenou a célebre "Dezembrada", série de vitórias fulminantes que incluiu as batalhas de Itororó, Avaí e Lomas Valentinas.'
    ],
    powerClue: 'Em junho de 1865, a esquadra imperial sob o comando do almirante Barroso obteve uma vitória estratégica decisiva na Batalha Naval do Riachuelo (*)',
    standardClues: [
      'O conflito envolveu a Tríplice Aliança, formada pelo Império do Brasil, a Argentina e o Uruguai, contra as forças do presidente Francisco Solano López.',
      'O confronto só se encerrou em março de 1870 com a morte de Solano López no combate de Cerro Corá, após dizimar grande parte da população masculina paraguaia.'
    ],
    giveaway: 'Qual foi este maior confronto bélico internacional da história da América do Sul, travado entre 1864 e 1870?',
    canonicalAnswer: 'Guerra do Paraguai',
    acceptAliases: ['A Guerra do Paraguai', 'Guerra da Tríplice Aliança'],
    promptAliases: ['guerra contra Solano López', 'conflito da bacia do prata'],
    rejectAliases: ['Guerra Cisplatina', 'Guerra do Chaco'],
    explanation: 'A Guerra do Paraguai (1864-1870) foi travada pela Tríplice Aliança contra o Paraguai de Solano López, resultando em vitória aliada e devastação demográfica no Paraguai.'
  },
  {
    title: 'Juscelino Kubitschek',
    category: 'História',
    subcategory: 'História do Brasil',
    difficulty: 2,
    obscureClues: [
      'Logo no início de seu mandato presidencial, teve de sufocar duas revoltas de oficiais da Força Aérea Brasileira conhecidas como a Revolta de Jacareacanga e a Revolta de Aragarças.',
      'Sua eleição foi garantida após o Movimento de 11 de Novembro liderado pelo general marechal Henrique Lott para assegurar a posse constitucional.'
    ],
    powerClue: 'Este político mineiro governou com o Plano de Metas e adotou o célebre lema desenvolvimentista de "Cinquenta anos de progresso em cinco de governo" (*)',
    standardClues: [
      'Durante seu mandato, a indústria automobilística nacional se expandiu com a chegada da Volkswagen e a criação da Sudene.',
      'Contratou Lúcio Costa para o plano piloto urbanístico e Oscar Niemeyer para os projetos arquitetônicos que ergueram a nova capital no Planalto Central.'
    ],
    giveaway: 'Identifique este presidente da República conhecido pela sigla JK, que transferiu a capital federal e inaugurou Brasília em 1960.',
    canonicalAnswer: 'Juscelino Kubitschek',
    acceptAliases: ['JK', 'Juscelino Kubitschek de Oliveira', 'Juscelino'],
    promptAliases: ['presidente JK'],
    rejectAliases: ['Jânio Quadros', 'João Goulart', 'Getúlio Vargas'],
    explanation: 'Juscelino Kubitschek (1902-1976), o "Presidente Bossa Nova", liderou o Plano de Metas e transferiu a capital federal do Rio de Janeiro para Brasília em 21 de abril de 1960.'
  },
  {
    title: 'Grande Sertão: Veredas',
    category: 'Literatura',
    subcategory: 'Literatura Brasileira',
    difficulty: 3,
    obscureClues: [
      'O narrador faz um pacto fáustico mudo com o diabo nas veredas das Veredas Mortas, embora viva em constante dúvida teológica se o demônio de fato existe.',
      'A trama culmina na sangrenta batalha contra o bando traidor dos "Judas" chefiado por Hermógenes no Paredão dos Umbus.'
    ],
    powerClue: 'A obra é narrada em um monólogo contínuo de mais de seiscentas páginas sem divisão em capítulos pelo ex-jagunço Riobaldo Tatarana (*)',
    standardClues: [
      'O protagonista mantém um amor intenso e misterioso pelo companheiro de armas Diadorim, cuja identidade feminina de Maria Deodorina da Silva só é revelada após sua morte em combate.',
      'O livro encerra com a célebre reflexão "O sertão é do tamanho do mundo. O sertão está em toda parte. (...) Amável senhor meu, (...) Nonada. O diabo não há. (...) Homem humano. Travessia."'
    ],
    giveaway: 'Qual o título desta obra-prima modernista de 1956 escrita pelo mineiro Guimarães Rosa sobre as veredas do sertão e a travessia de Riobaldo?',
    canonicalAnswer: 'Grande Sertão: Veredas',
    acceptAliases: ['Grande Sertao Veredas', 'Grande Sertão', 'Grande Sertao'],
    promptAliases: ['obra de Guimarães Rosa', 'romance de Riobaldo'],
    rejectAliases: ['Sagarana', 'Corpo de Baile'],
    explanation: 'Grande Sertão: Veredas (1956), obra-prima de Guimarães Rosa, reinventa o léxico sertanejo em um épico filosófico centrado no jagunço Riobaldo e seu companheiro Diadorim.'
  },
  {
    title: 'Getúlio Vargas',
    category: 'História',
    subcategory: 'História do Brasil',
    difficulty: 1,
    obscureClues: [
      'A criação do Departamento de Imprensa e Propaganda (DIP) durante seu regime exerceu forte censura e distribuiu cartilhas escolares celebrando sua imagem paternal.',
      'O atentado da Rua Tonelero contra o jornalista Carlos Lacerda resultou na morte do major Rubens Vaz e desencadeou uma crise militar insustentável em seu gabinete.'
    ],
    powerClue: 'Ele assumiu a liderança nacional na Revolução de 1930 após o assassinato de seu companheiro de chapa João Pessoa (*)',
    standardClues: [
      'Instituiu a Consolidação das Leis do Trabalho (CLT), criou a Companhia Siderúrgica Nacional e aprovou o monopólio da Petrobras com a campanha "O Petróleo é Nosso".',
      'Seu mandato encerrou-se tragicamente no Palácio do Catete com um tiro no coração em agosto de 1954, deixando a célebre carta-testamento com a frase "Saio da vida para entrar na história".'
    ],
    giveaway: 'Nomeie este presidente gaúcho que comandou o Estado Novo e foi a figura política mais influente do Brasil no século XX.',
    canonicalAnswer: 'Getúlio Vargas',
    acceptAliases: ['Vargas', 'Getulio Vargas', 'Getúlio Dornelles Vargas'],
    promptAliases: ['presidente gaúcho', 'ditador do Estado Novo'],
    rejectAliases: ['Eurico Gaspar Dutra', 'Washington Luís'],
    explanation: 'Getúlio Vargas (1882-1954) governou o Brasil por quase duas décadas (1930-1945 e 1951-1954), transformando as leis trabalhistas e a industrialização nacional.'
  },
  {
    title: 'Dom Pedro II',
    category: 'História',
    subcategory: 'História do Brasil',
    difficulty: 2,
    obscureClues: [
      'Apaixonado por astronomia e línguas antigas, traduziu sonetos do hebraico e do árabe e financiou pessoalmente pesquisas de Louis Pasteur na Europa.',
      'Ele esteve presente na Exposição Universal de Filadélfia de 1876, onde testou o protótipo de telefone de Alexander Graham Bell e exclamou: "Meu Deus, isto fala!".'
    ],
    powerClue: 'Teve sua coroação antecipada aos quatorze anos de idade através do chamado Golpe da Maioridade em 1840 (*)',
    standardClues: [
      'Seu reinado de quase meio século equilibrou a alternância no poder entre os partidos Liberal e Conservador sob o modelo do parlamentarismo às avessas.',
      'Foi deposto sem oferecer resistência após a proclamação da República pelo marechal Deodoro da Fonseca em 15 de novembro de 1889, morrendo exilado em Paris.'
    ],
    giveaway: 'Nomeie este último imperador do Brasil, conhecido como "O Magnânimo", filho de Pedro I.',
    canonicalAnswer: 'Dom Pedro II',
    acceptAliases: ['Pedro II', 'D. Pedro II', 'Dom Pedro Segundo', 'Pedro de Alcântara'],
    promptAliases: ['o imperador', 'segundo imperador'],
    rejectAliases: ['Dom Pedro I', 'Dom João VI'],
    explanation: 'Dom Pedro II (1825-1891) foi o segundo e último monarca do Império do Brasil, reinando por 58 anos com ênfase em erudição, estabilidade e diplomacia.'
  },
  {
    title: 'Carlos Drummond de Andrade',
    category: 'Literatura',
    subcategory: 'Literatura Brasileira',
    difficulty: 2,
    obscureClues: [
      'Publicou na Revista de Antropofagia o poema de dez versos que repete sete vezes uma palavra sobre um obstáculo geológico, gerando um escândalo e centenas de paródias nos jornais da época.',
      'Sua cidade natal de Itabira é descrita com amargura e ferro em obras como o livro "Alguma Poesia" de 1930.'
    ],
    powerClue: 'Durante a Segunda Guerra Mundial, escreveu poesias de engajamento social e dor humana reunidas no livro "Sentimento do Mundo" e "A Rosa do Povo" (*)',
    standardClues: [
      'Em outro poema clássico, pergunta com melancolia existencial: "E agora, José? A festa acabou, a luz apagou, o povo sumiu, a noite esfriou".',
      'Sua estátua de bronze sentado no calçadão da praia de Copacabana é um dos marcos culturais mais fotografados do Rio de Janeiro.'
    ],
    giveaway: 'Identifique este poeta mineiro considerado um dos maiores da língua portuguesa, autor de "No meio do caminho tinha uma pedra".',
    canonicalAnswer: 'Carlos Drummond de Andrade',
    acceptAliases: ['Drummond', 'Carlos Drummond'],
    promptAliases: ['poeta de Itabira', 'poeta mineiro'],
    rejectAliases: ['Manuel Bandeira', 'Vinicius de Moraes', 'João Cabral de Melo Neto'],
    explanation: 'Carlos Drummond de Andrade (1902-1987) foi o expoente máximo da segunda fase modernista no Brasil, com uma poesia que transitou da ironia ao engajamento social e à metafísica.'
  },
  {
    title: 'Clarice Lispector',
    category: 'Literatura',
    subcategory: 'Literatura Brasileira',
    difficulty: 2,
    obscureClues: [
      'Nascida na Ucrânia durante a Guerra Civil Russa com o nome Haia, emigrou bebê com sua família judia que fugia dos pogroms para o Recife.',
      'Sua estreia literária aos vinte e três anos com o romance "Perto do Coração Selvagem" causou assombro na crítica pelo uso refinado do fluxo de consciência influenciado por Virginia Woolf.'
    ],
    powerClue: 'No conto "Amor", a protagonista Ana tem uma epifania perturbadora ao observar um cego mascando chicletes no bonde (*)',
    standardClues: [
      'Em sua última obra publicada em vida, o narrador fictício Rodrigo S.M. relata a vida miserável e ingênua da datilógrafa alagoana Macabéa no Rio de Janeiro.',
      'Autora de "A Paixão Segundo G.H.", na qual a protagonista esmaga e ingere uma barata em um armário, esta mestra da prosa intimista escreveu A Hora da Estrela.'
    ],
    giveaway: 'Nomeie esta célebre escritora brasileira famosa pela profundidade psicológica e filosófica de seus romances.',
    canonicalAnswer: 'Clarice Lispector',
    acceptAliases: ['Clarice', 'Haia Pinkhasivna Lispector'],
    promptAliases: ['autora de A Hora da Estrela'],
    rejectAliases: ['Lygia Fagundes Telles', 'Rachel de Queiroz'],
    explanation: 'Clarice Lispector (1920-1977) revolucionou a literatura em prosa no Brasil com sua prosa poética existencialista, fluxo de consciência e epifanias cotidianas.'
  },
  {
    title: 'Alberto Santos-Dumont',
    category: 'Ciência',
    subcategory: 'Tecnologia e Invenções',
    difficulty: 2,
    obscureClues: [
      'Venceu o cobiçado Prêmio Deutsch de la Meurthe em 1901 ao contornar a Torre Eiffel em Paris a bordo do seu dirigível dirigível Número 6.',
      'Ele projetou o elegante monoplano "Demoiselle", cujas plantas distribuiu gratuitamente na revista Popular Mechanics para incentivar o desenvolvimento da aviação mundial.'
    ],
    powerClue: 'A pedido de seu amigo joalheiro Louis Cartier, popularizou o relógio de pulso masculino para cronometrar seus voos sem tirar as mãos dos comandos (*)',
    standardClues: [
      'Em 23 de outubro de 1906, voou cerca de sessenta metros a quase três metros de altura diante de uma multidão e dos juízes do Aeroclube da França no Campo de Bagatelle.',
      'O feito foi realizado pelo biplano com asas de célula de Hargrave apelidado de "Oiseau de Proie", conhecido pelo número de sua patente na fuselagem.'
    ],
    giveaway: 'Identifique este inventor brasileiro reverenciado como o "Pai da Aviação", que realizou o histórico voo do 14-Bis.',
    canonicalAnswer: 'Santos-Dumont',
    acceptAliases: ['Alberto Santos-Dumont', 'Santos Dumont', 'Alberto Santos Dumont'],
    promptAliases: ['o aviador brasileiro', 'criador do 14-bis'],
    rejectAliases: ['Irmãos Wright', 'Bartolomeu de Gusmão'],
    explanation: 'Alberto Santos-Dumont (1873-1932) foi um dos pioneiros da aviação, realizando o primeiro voo público homologado de um aparelho mais pesado que o ar com impulsão própria em 1906.'
  },
  {
    title: 'Vital Brazil',
    category: 'Ciência',
    subcategory: 'Medicina e Biologia',
    difficulty: 3,
    obscureClues: [
      'Foi discípulo e assistente de Adolfo Lutz na Seção de Bacteriologia do Instituto Bacteriológico de São Paulo durante as campanhas contra o cólera e a febre tifoide.',
      'Para viabilizar a extração em larga escala de veneno, estabeleceu um pioneiro sistema de permuta com fazendeiros do interior, trocando serpentes capturadas por tubos de soro esterilizados.'
    ],
    powerClue: 'Ele refutou a teoria de Albert Calmette e demonstrou a especificidade imunológica dos venenos ofídicos (*)',
    standardClues: [
      'Foi o fundador e primeiro diretor do Instituto Butantan em São Paulo e mais tarde criou o Instituto Vital Brazil em Niterói.',
      'Desenvolveu os primeiros soros antiofídicos específicos contra a picada de jararacas, cascavéis e surucucus, salvando milhares de vidas no campo.'
    ],
    giveaway: 'Nomeie este médico e sanitarista mineiro pioneiro no desenvolvimento de soros contra picadas de cobras venenosas e escorpiões.',
    canonicalAnswer: 'Vital Brazil',
    acceptAliases: ['Vital Brazil Mineiro da Campanha', 'Vital Brasil'],
    promptAliases: ['médico do Butantan', 'sanitarista do Butantan'],
    rejectAliases: ['Oswaldo Cruz', 'Carlos Chagas'],
    explanation: 'Vital Brazil (1865-1950) descobriu a especificidade do soro antiofídico e fundou o Instituto Butantan, transformando o Brasil em referência mundial no tratamento de acidentes com animais peçonhentos.'
  },
  {
    title: 'Bossa Nova',
    category: 'Artes',
    subcategory: 'Música Brasileira',
    difficulty: 2,
    obscureClues: [
      'O acorde dissonante característico deste gênero foi consolidado no violão de batida sincopada durante a gravação do álbum "Canção do Amor Demais" interpretado por Elizeth Cardoso.',
      'O movimento ganhou consagração nos Estados Unidos após o histórico concerto realizado no Carnegie Hall em Nova York em novembro de 1962.'
    ],
    powerClue: 'A canção inaugural do movimento, "Chega de Saudade", lançada em 1958, uniu letra melancólica e a voz sussurrada sem vibrato de João Gilberto (*)',
    standardClues: [
      'Seus principais letristas e compositores foram o diplomata Vinicius de Moraes e o maestro Antônio Carlos Jobim.',
      'Uma de suas composições mais famosas, inspirada na jovem Helô Pinheiro caminhando rumo ao mar de Ipanema, tornou-se a segunda música mais regravada do mundo.'
    ],
    giveaway: 'Identifique este movimento musical surgido no final dos anos 1950 na zona sul do Rio de Janeiro que reinventou o samba com harmonias do jazz.',
    canonicalAnswer: 'Bossa Nova',
    acceptAliases: ['A Bossa Nova', 'Bossa-Nova'],
    promptAliases: ['movimento do samba jazz', 'estilo de João Gilberto'],
    rejectAliases: ['Tropicália', 'Samba-Canção', 'Choro'],
    explanation: 'A Bossa Nova revolucionou a música brasileira e mundial no final da década de 1950 com João Gilberto, Tom Jobim e Vinicius de Moraes, criando clássicos como "Garota de Ipanema".'
  },
  {
    title: 'Guerra dos Farrapos',
    category: 'História',
    subcategory: 'História do Brasil',
    difficulty: 3,
    obscureClues: [
      'O revolucionário italiano Giuseppe Garibaldi participou dos combates navais transportando dois lanchões sobre carretas puxadas por juntas de bois através da terra até a lagoa Tramandaí.',
      'Um dos episódios mais sombrios da revolta foi o Massacre de Porongos, onde o corpo de lanceiros negros foi desarmado e encurralado na madrugada pelas tropas imperiais.'
    ],
    powerClue: 'A revolta proclamou a República Rio-Grandense e mais tarde a efêmera República Juliana na província vizinha de Santa Catarina (*)',
    standardClues: [
      'Iniciada em 1835 por estancieiros liderados por Bento Gonçalves, protestava contra os pesados impostos cobrados pela Coroa sobre o charque gaúcho em favor do produto argentino.',
      'O conflito militar de dez anos foi pacificado em 1845 pelo Barão de Caxias através da assinatura do Tratado de Ponche Verde.'
    ],
    giveaway: 'Qual foi esta mais longa revolta separatista e republicana da história do Brasil imperial, travada no Rio Grande do Sul?',
    canonicalAnswer: 'Guerra dos Farrapos',
    acceptAliases: ['Revolução Farroupilha', 'Farroupilha', 'Guerra Farroupilha'],
    promptAliases: ['revolta dos farrapos', 'revolta no Rio Grande do Sul'],
    rejectAliases: ['Cabanagem', 'Sabinada', 'Balaiada'],
    explanation: 'A Guerra dos Farrapos (1835-1845) foi uma insurreição republicana e regionalista no Rio Grande do Sul motivada pelo descontentamento com os impostos imperiais sobre o charque.'
  },
  {
    title: 'Pantanal',
    category: 'Geografia',
    subcategory: 'Geografia do Brasil',
    difficulty: 2,
    obscureClues: [
      'Formado tectonicamente pelo afundamento da crosta terrestre durante a orogenia andina, atua como um imenso reservatório de retenção hídrica na bacia hidrográfica do rio Paraguai.',
      'A vegetação apresenta uma formação mosaica singular que mescla espécies do Cerrado, da Amazônia, da Mata Atlântica e do Chaco paraguaio.'
    ],
    powerClue: 'Seu ciclo ecológico é inteiramente regido pela alternância radical entre o período das cheias e a vazante, cobrindo até oitenta por cento de sua área com água (*)',
    standardClues: [
      'Abriga a maior densidade populacional de onças-pintadas do planeta e é o habitat emblemático de aves aquáticas como o tuiuiú.',
      'Localiza-se principalmente nos estados de Mato Grosso e Mato Grosso do Sul, estendendo-se pelas fronteiras da Bolívia e do Paraguai.'
    ],
    giveaway: 'Identifique este bioma reconhecido pela UNESCO como Reserva da Biosfera, considerado a maior planície de inundação contínua do mundo.',
    canonicalAnswer: 'Pantanal',
    acceptAliases: ['Complexo do Pantanal', 'Pantanal Matogrossense'],
    promptAliases: ['planície mato-grossense', 'região alagada'],
    rejectAliases: ['Cerrado', 'Caatinga', 'Pampas'],
    explanation: 'O Pantanal é a maior planície inundável do planeta Terra, cobrindo cerca de 150 mil km² no Centro-Oeste brasileiro com uma biodiversidade exuberante adaptada às cheias sazonais.'
  },
  {
    title: 'Ditadura Militar Brasileira',
    category: 'História',
    subcategory: 'História do Brasil',
    difficulty: 2,
    obscureClues: [
      'A Guerrilha do Araguaia, organizada pelo PCdoB na divisa do Pará com Goiás, foi combatida por três expedições secretas do Exército na selva entre 1972 e 1974.',
      'O caso Riocentro em 1981 expôs a atuação clandestina da linha dura militar quando uma bomba explodiu acidentalmente no colo de um sargento durante um show do Dia do Trabalhador.'
    ],
    powerClue: 'A decretação do Ato Institucional Número 5 (AI-5) em dezembro de 1968 pelo general Costa e Silva marcou o início dos chamados "anos de chumbo" (*)',
    standardClues: [
      'O regime foi instaurado após o golpe que derrubou o presidente João Goulart em 31 de março de 1964.',
      'O ciclo encerrou-se após duas décadas com a promulgação da Lei da Anistia, a campanha popular das "Diretas Já" e a eleição de Tancredo Neves pelo Colégio Eleitoral em 1985.'
    ],
    giveaway: 'Identifique este período autoritário de vinte e um anos comandado por generais das Forças Armadas no Brasil contemporâneo.',
    canonicalAnswer: 'Ditadura Militar',
    acceptAliases: ['Ditadura Militar Brasileira', 'Regime Militar', 'Ditadura de 64', 'Ditadura Civil-Militar'],
    promptAliases: ['regime dos generais', 'governo militar de 1964'],
    rejectAliases: ['Estado Novo', 'República Velha'],
    explanation: 'A Ditadura Militar no Brasil durou de 1964 a 1985, caracterizada por fechamento político, censura, perseguição a opositores e pelo chamado "Milagre Econômico".'
  }
];

export async function fetchWikiMetadata(title: string): Promise<{ url: string; extract: string }> {
  try {
    const endpoint = `https://pt.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    const res = await fetch(endpoint, {
      headers: {
        'User-Agent': 'CORTE-Quizbowl-Engine/1.0 (https://github.com/corte-quizbowl; contact@corte.br)'
      }
    });

    if (!res.ok) {
      return {
        url: `https://pt.wikipedia.org/wiki/${encodeURIComponent(title)}`,
        extract: ''
      };
    }

    const data = await res.json();
    return {
      url: data.content_urls?.desktop?.page || `https://pt.wikipedia.org/wiki/${encodeURIComponent(title)}`,
      extract: data.extract || ''
    };
  } catch (err) {
    return {
      url: `https://pt.wikipedia.org/wiki/${encodeURIComponent(title)}`,
      extract: ''
    };
  }
}

export async function generateBrazilianQuestions(): Promise<Tossup[]> {
  const tossups: Tossup[] = [];

  for (const topic of BRAZILIAN_TOPICS) {
    console.log(`[WIKI-BR] Enriquecendo tópico: ${topic.title}...`);
    const wikiData = await fetchWikiMetadata(topic.title);

    const fullText = [
      ...topic.obscureClues,
      topic.powerClue,
      ...topic.standardClues,
      topic.giveaway
    ].join(' ');

    const formattedAnswer = `<b><u>${topic.canonicalAnswer}</u></b>` + 
      (topic.acceptAliases.length > 0 ? ` [aceite também <i>${topic.acceptAliases.join(', ')}</i>]` : '');

    tossups.push({
      id: `br-${topic.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      origin: 'wikipedia_br',
      category: topic.category,
      subcategory: topic.subcategory,
      difficulty: topic.difficulty,
      question_pt: fullText,
      formatted_answer_pt: formattedAnswer,
      answer_canonical_pt: topic.canonicalAnswer,
      accept_aliases: topic.acceptAliases,
      prompt_aliases: topic.promptAliases,
      reject_aliases: topic.rejectAliases,
      lead_in: topic.obscureClues[0],
      giveaway: topic.giveaway,
      explanation: topic.explanation,
      wiki_url: wikiData.url,
      wiki_extract: wikiData.extract || topic.explanation
    });
  }

  return tossups;
}
