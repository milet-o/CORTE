import { Tossup } from '../types/quizbowl';

export interface QBRawTossup {
  _id: string;
  question: string;
  formatted_answer?: string;
  answer: string;
  category: string;
  subcategory: string;
  difficulty: number;
  set?: {
    name: string;
    year: number;
  };
}

export function organizeQuestionSyntax(text: string): string {
  return text
    .replace(/For 10 points each,/gi, '')
    .replace(/For 10 points, name this/gi, 'Nomeie este(a)')
    .replace(/For 10 points, name these/gi, 'Nomeie estes(as)')
    .replace(/For 10 points, identify this/gi, 'Identifique este(a)')
    .replace(/For 10 points, what/gi, 'Qual')
    .replace(/For 10 points, who/gi, 'Quem')
    .replace(/For 10 points,\s*/gi, '')
    .replace(/Por 10 pontos,\s*/gi, '');
}

export function getCuratedUniversalQuestions(): Tossup[] {
  return [
    {
      id: 'qb-universal-einstein',
      origin: 'qbreader',
      category: 'Ciência',
      subcategory: 'Física',
      difficulty: 2,
      question_pt: 'Uma carta endereçada a Franklin D. Roosevelt por este cientista e Leó Szilárd alertou os Estados Unidos sobre o perigo do urânio na Alemanha nazista. Em 1905, durante seu chamado "Annus Mirabilis", ele publicou quatro artigos pioneiros na revista Annalen der Physik, incluindo a formulação teórica do efeito fotoelétrico. (*) Nomeie este físico teórico que formulou a Teoria da Relatividade e a famosa equação E = mc².',
      formatted_answer_pt: '<b><u>Albert Einstein</u></b> [ou <b><u>Einstein</u></b>]',
      answer_canonical_pt: 'Albert Einstein',
      accept_aliases: ['Einstein', 'Albert Einstein'],
      prompt_aliases: ['físico alemão', 'cientista da relatividade'],
      lead_in: 'Uma carta endereçada a Roosevelt por este cientista alertou sobre o urânio na Alemanha nazista.',
      giveaway: 'Nomeie este físico teórico que formulou a Teoria da Relatividade e a famosa equação E = mc².',
      explanation: 'Albert Einstein (1879-1955) recebeu o Nobel de Física de 1921 pela explicação do efeito fotoelétrico e revolucionou a cosmologia com a Relatividade Geral e Especial.',
      wiki_url: 'https://pt.wikipedia.org/wiki/Albert_Einstein'
    },
    {
      id: 'qb-universal-iliad',
      origin: 'qbreader',
      category: 'Literatura',
      subcategory: 'Literatura Clássica',
      difficulty: 2,
      question_pt: 'No primeiro canto deste épico, o sacerdote Crises suplica ao deus Apolo que envie uma praga de flechas contra o acampamento grego após sua filha Criseida ser sequestrada pelo rei Agamêmnon. A trama tem seu clímax quando o herói Aquiles tem uma crise de fúria pela morte de seu companheiro Pátroclo (*) e mata o príncipe Heitor em combate singular, arrastando seu cadáver em volta das muralhas de Troia. Qual o nome desta monumental epopeia grega atribuída a Homero sobre o cerco de Troia?',
      formatted_answer_pt: '<b><u>Ilíada</u></b> [ou <b><u>A Ilíada</u></b>; aceite <i>Iliad</i>]',
      answer_canonical_pt: 'Ilíada',
      accept_aliases: ['A Ilíada', 'Iliad', 'Iliada'],
      prompt_aliases: ['poema de Homero', 'epopeia de Troia'],
      lead_in: 'No primeiro canto deste épico, o sacerdote Crises suplica ao deus Apolo que envie uma praga...',
      giveaway: 'Qual o nome desta monumental epopeia grega atribuída a Homero sobre o cerco de Troia?',
      explanation: 'A Ilíada narra as semanas finais do cerco à cidade de Troia e a cólera devastadora de Aquiles contra Agamêmnon e Heitor.',
      wiki_url: 'https://pt.wikipedia.org/wiki/Il%C3%ADada'
    },
    {
      id: 'qb-universal-dna',
      origin: 'qbreader',
      category: 'Ciência',
      subcategory: 'Biologia',
      difficulty: 1,
      question_pt: 'A chamada "Fotografia 51", obtida através de difração de raio-X pela química Rosalind Franklin e Raymond Gosling, foi crucial para deduzir a estrutura geométrica desta molécula. Erwin Chargaff descobriu que a quantidade de adenina é sempre proporcional à de timina, e a de citosina à de guanina nesta macromolécula. (*) James Watson e Francis Crick ganharam notoriedade mundial ao propor o modelo em dupla hélice desta substância em 1953. Identifique este ácido nucleico que carrega as instruções genéticas de quase todos os seres vivos.',
      formatted_answer_pt: '<b><u>DNA</u></b> [ou <b><u>Ácido Desoxirribonucleico</u></b>; aceite <i>ADN</i>]',
      answer_canonical_pt: 'DNA',
      accept_aliases: ['Ácido Desoxirribonucleico', 'Acido Desoxirribonucleico', 'ADN'],
      prompt_aliases: ['ácido nucleico', 'código genético'],
      lead_in: 'A chamada "Fotografia 51", obtida por difração de raio-X por Rosalind Franklin, revelou esta molécula.',
      giveaway: 'Identifique este ácido nucleico que carrega as instruções genéticas de quase todos os seres vivos.',
      explanation: 'O DNA armazena toda a informação genética celular em uma dupla hélice de nucleotídeos unidos por pontes de hidrogênio.',
      wiki_url: 'https://pt.wikipedia.org/wiki/DNA'
    },
    {
      id: 'qb-universal-fr-rev',
      origin: 'qbreader',
      category: 'História',
      subcategory: 'História Mundial',
      difficulty: 2,
      question_pt: 'Durante este processo histórico, membros do Terceiro Estado prestaram o célebre Juramento do Jogo da Péla após serem trancados do lado de fora dos Estados Gerais. Sob a liderança do Comitê de Salvação Pública liderado por Maximilien Robespierre, instituiu-se o período do Terror, no qual milhares foram decapitados pela guilhotina (*). O estopim popular da revolta em Paris foi a tomada da fortaleza-prisão da Bastilha em 14 de julho de 1789. Qual foi este grande marco revolucionário que derrubou o rei Luís XVI e transformou a França?',
      formatted_answer_pt: '<b><u>Revolução Francesa</u></b> [aceite <i>A Revolução Francesa</i> ou <i>French Revolution</i>]',
      answer_canonical_pt: 'Revolução Francesa',
      accept_aliases: ['A Revolução Francesa', 'French Revolution', 'Revolucao Francesa'],
      prompt_aliases: ['queda da monarquia francesa', 'revolução de 1789'],
      lead_in: 'Durante este evento, membros do Terceiro Estado prestaram o Juramento do Jogo da Péla.',
      giveaway: 'Qual foi este grande marco revolucionário que derrubou o rei Luís XVI e transformou a França?',
      explanation: 'A Revolução Francesa (1789-1799) encerrou o Antigo Regime na França com os ideais de Liberdade, Igualdade e Fraternidade.',
      wiki_url: 'https://pt.wikipedia.org/wiki/Revolu%C3%A7%C3%A3o_Francesa'
    },
    {
      id: 'qb-universal-beethoven',
      origin: 'qbreader',
      category: 'Artes',
      subcategory: 'Música',
      difficulty: 2,
      question_pt: 'No manuscrito de sua Terceira Sinfonia, originalmente dedicada a Napoleão Bonaparte, este compositor rasgou a folha de rosto com tanta violência que furou o papel ao descobrir que Bonaparte havia se coroado imperador, renomeando-a para Sinfonia Heroica. Sua Nona Sinfonia é célebre por incorporar coral e solistas na interpretação do poema "Ode à Alegria" de Schiller (*). Identifique este monumental compositor alemão clássico e pré-romântico que compôs sua famosa Quinta Sinfonia e continuou criando obras-primas mesmo após ficar totalmente surdo.',
      formatted_answer_pt: '<b><u>Ludwig van Beethoven</u></b> [ou <b><u>Beethoven</u></b>]',
      answer_canonical_pt: 'Ludwig van Beethoven',
      accept_aliases: ['Beethoven', 'van Beethoven', 'Ludwig van Beethoven'],
      prompt_aliases: ['compositor de Bonn', 'compositor alemão'],
      lead_in: 'No manuscrito de sua Terceira Sinfonia, ele rasgou a folha de rosto furando o papel com a pena...',
      giveaway: 'Identifique este monumental compositor alemão que compôs sua Quinta Sinfonia e a Ode à Alegria mesmo após perder totalmente a audição.',
      explanation: 'Ludwig van Beethoven (1770-1827) foi uma das figuras mais revolucionárias da história da música ocidental, criando 9 sinfonias monumentais.',
      wiki_url: 'https://pt.wikipedia.org/wiki/Ludwig_van_Beethoven'
    },
    {
      id: 'qb-universal-newton',
      origin: 'qbreader',
      category: 'Ciência',
      subcategory: 'Física',
      difficulty: 1,
      question_pt: 'Em seu tratado Opticks de 1704, demonstrou que a luz branca é composta pelo espectro visível ao decompô-la usando um prisma de vidro. Envolveu-se em uma amarga controvérsia de prioridade intelectual contra Gottfried Wilhelm Leibniz pelo desenvolvimento do cálculo infinitesimal (*). Em sua obra-prima de 1687, os Philosophiae Naturalis Principia Mathematica, formulou as três leis do movimento e a lei da gravitação universal após a clássica anedota da maçã caindo em Woolsthorpe. Nomeie este físico e matemático inglês.',
      formatted_answer_pt: '<b><u>Sir Isaac Newton</u></b> [ou <b><u>Newton</u></b>]',
      answer_canonical_pt: 'Isaac Newton',
      accept_aliases: ['Newton', 'Sir Isaac Newton'],
      prompt_aliases: ['físico inglês', 'matemático inglês'],
      lead_in: 'Em seu tratado Opticks de 1704, decompôs a luz solar branca através de um prisma...',
      giveaway: 'Nomeie este físico e matemático inglês célebre pela formulação das três leis fundamentais da mecânica clássica e da gravitação.',
      explanation: 'Isaac Newton (1643-1727) estabeleceu os alicerces da física e da astronomia modernas com o cálculo e a lei da gravidade.',
      wiki_url: 'https://pt.wikipedia.org/wiki/Isaac_Newton'
    },
    {
      id: 'qb-universal-curie',
      origin: 'qbreader',
      category: 'Ciência',
      subcategory: 'Química',
      difficulty: 2,
      question_pt: 'Durante a Primeira Guerra Mundial, projetou e financiou veículos radiológicos móveis conhecidos nas frentes de batalha como "Petites Curies" para radiografar soldados feridos. Junto com seu marido Pierre, isolou amostras do minério de pechblenda e batizou um novo elemento em homenagem ao seu país natal invadido pelo Império Russo (*). Foi a primeira pessoa na história a receber dois Prêmios Nobel, um em Física em 1903 e outro em Química em 1911 pela descoberta do rádio e do polônio. Nomeie esta cientista franco-polonesa pioneira no estudo da radioatividade.',
      formatted_answer_pt: '<b><u>Marie Curie</u></b> [ou <b><u>Maria Skłodowska-Curie</u></b>; aceite <i>Curie</i>]',
      answer_canonical_pt: 'Marie Curie',
      accept_aliases: ['Curie', 'Maria Sklodowska-Curie', 'Madame Curie', 'Maria Skłodowska-Curie'],
      prompt_aliases: ['física polonesa', 'química polonesa'],
      lead_in: 'Durante a Primeira Guerra, projetou ambulâncias radiológicas apelidadas de Petites Curies...',
      giveaway: 'Nomeie esta cientista franco-polonesa pioneira nos estudos da radioatividade e vencedora de dois prêmios Nobel.',
      explanation: 'Marie Curie (1867-1934) descobriu os elementos rádio e polônio e cunhou o termo radioatividade, sendo a única pessoa a vencer Nobel em duas ciências diferentes.',
      wiki_url: 'https://pt.wikipedia.org/wiki/Marie_Curie'
    },
    {
      id: 'qb-universal-darwin',
      origin: 'qbreader',
      category: 'Ciência',
      subcategory: 'Biologia',
      difficulty: 1,
      question_pt: 'Ele apressou a publicação de sua teoria após receber em 1858 uma carta com um ensaio praticamente idêntico enviado da Malásia pelo jovem naturalista Alfred Russel Wallace. Durante sua viagem de quase cinco anos ao redor do mundo a bordo do navio hidrográfico HMS Beagle (*), estudou os tentilhões e tartarugas gigantes no arquipélago das ilhas Galápagos. Em 1859, publicou a obra "A Origem das Espécies". Nomeie este naturalista britânico que propôs a teoria da evolução através da seleção natural.',
      formatted_answer_pt: '<b><u>Charles Darwin</u></b> [ou <b><u>Darwin</u></b>]',
      answer_canonical_pt: 'Charles Darwin',
      accept_aliases: ['Darwin', 'Charles Robert Darwin'],
      prompt_aliases: ['naturalista inglês', 'pai da evolução'],
      lead_in: 'Ele apressou a publicação de sua teoria após receber uma carta com um ensaio idêntico de Alfred Russel Wallace...',
      giveaway: 'Nomeie este naturalista britânico autor de A Origem das Espécies e proponente da seleção natural.',
      explanation: 'Charles Darwin (1809-1882) transformou as ciências biológicas ao propor que todas as formas de vida descendem de ancestrais comuns por meio da seleção natural.',
      wiki_url: 'https://pt.wikipedia.org/wiki/Charles_Darwin'
    },
    {
      id: 'qb-universal-davinci',
      origin: 'qbreader',
      category: 'Artes',
      subcategory: 'Pintura',
      difficulty: 1,
      question_pt: 'Ele utilizou sua técnica de camadas transparentes chamada sfumato para criar a transição suave de sombras e expressões enigmáticas nos rostos de suas modelos. No refeitório do convento dominicano de Santa Maria delle Grazie em Milão, pintou em têmpera e óleo sobre gesso seco uma representação do momento exato em que Cristo anuncia a traição de um apóstolo (*). Autor do desenho anatômico do Homem Vitruviano e pintor de A Última Ceia, pintou a esposa do mercador Francesco del Giocondo. Nomeie este polímata italiano do Renascimento autor da Mona Lisa.',
      formatted_answer_pt: '<b><u>Leonardo da Vinci</u></b> [ou <b><u>da Vinci</u></b>; aceite <i>Leonardo</i>]',
      answer_canonical_pt: 'Leonardo da Vinci',
      accept_aliases: ['da Vinci', 'Leonardo', 'Leonardo di ser Piero da Vinci'],
      prompt_aliases: ['pintor florentino', 'gênio renascentista'],
      lead_in: 'Ele aperfeiçoou a técnica do sfumato para fundir contornos e expressões sem linhas rígidas...',
      giveaway: 'Nomeie este mestre renascentista italiano que pintou A Última Ceia e o retrato da Mona Lisa.',
      explanation: 'Leonardo da Vinci (1452-1519) personificou o ideal renascentista da união entre arte, anatomia, engenharia e ciência.',
      wiki_url: 'https://pt.wikipedia.org/wiki/Leonardo_da_Vinci'
    },
    {
      id: 'qb-universal-vangogh',
      origin: 'qbreader',
      category: 'Artes',
      subcategory: 'Pintura',
      difficulty: 2,
      question_pt: 'Sua correspondência íntima com o irmão marchant de arte Theo serviu como a principal fonte biográfica para reconstruir seu processo criativo e suas crises de saúde mental. Ele sonhava em criar a "Oficina do Sul" na Casa Amarela em Arles ao lado de Paul Gauguin, parceria que ruiu após uma violenta discussão que culminou na mutilação de parte de sua orelha esquerda (*). Durante sua internação voluntária no asilo psiquiátrico de Saint-Rémy-de-Provence, pintou um céu noturno turbulento em espirais amarelas sobre a silhueta de um cipreste escuro. Nomeie este pintor pós-impressionista holandês que pintou A Noite Estrelada e Os Girassóis.',
      formatted_answer_pt: '<b><u>Vincent van Gogh</u></b> [ou <b><u>van Gogh</u></b>]',
      answer_canonical_pt: 'Vincent van Gogh',
      accept_aliases: ['van Gogh', 'Vincent Willem van Gogh', 'Van Gogh'],
      prompt_aliases: ['pintor holandês', 'pós-impressionista'],
      lead_in: 'Sua correspondência com seu irmão Theo permitiu catalogar suas centenas de telas quase nunca vendidas em vida...',
      giveaway: 'Nomeie este pintor holandês pós-impressionista célebre por telas como Os Girassóis e A Noite Estrelada.',
      explanation: 'Vincent van Gogh (1853-1890) criou obras com pinceladas enérgicas e cores emocionais intensas que anteciparam o expressionismo.',
      wiki_url: 'https://pt.wikipedia.org/wiki/Vincent_van_Gogh'
    },
    {
      id: 'qb-universal-shakespeare',
      origin: 'qbreader',
      category: 'Literatura',
      subcategory: 'Teatro',
      difficulty: 1,
      question_pt: 'Membro acionista da companhia teatral Lord Chamberlain\'s Men, ajudou a construir o anfiteatro circular The Globe às margens do rio Tâmisa em Londres. Dedicou uma famosa coleção de cento e cinquenta e quatro sonetos a um jovem nobre e a uma misteriosa "Dama Escura" (*). Criador de tragédias imortais como Macbeth, Rei Lear e Otelo, escreveu a peça sobre o príncipe da Dinamarca que conversa com o crânio do bobo Yorick e pronuncia "Ser ou não ser, eis a questão". Nomeie este dramaturgo e poeta inglês apelidado de o "Bardo de Avon".',
      formatted_answer_pt: '<b><u>William Shakespeare</u></b> [ou <b><u>Shakespeare</u></b>]',
      answer_canonical_pt: 'William Shakespeare',
      accept_aliases: ['Shakespeare', 'William Shakespeare', 'O Bardo'],
      prompt_aliases: ['dramaturgo elisabetano', 'bardo de avon'],
      lead_in: 'Ele foi o principal dramaturgo da trupe do teatro The Globe sob o reinado de Elizabeth I...',
      giveaway: 'Nomeie este dramaturgo inglês autor das tragédias de Hamlet e Romeu e Julieta.',
      explanation: 'William Shakespeare (1564-1616) é universalmente considerado o maior dramaturgo da língua inglesa e um dos ápices da literatura ocidental.',
      wiki_url: 'https://pt.wikipedia.org/wiki/William_Shakespeare'
    },
    {
      id: 'qb-universal-quixote',
      origin: 'qbreader',
      category: 'Literatura',
      subcategory: 'Romance',
      difficulty: 1,
      question_pt: 'No prólogo da segunda parte desta narrativa, o autor ridiculariza a versão apócrifa e plagiada publicada sob o pseudônimo de Alonso Fernández de Avellaneda. O protagonista batiza seu pangaré esquálido de Rocinante e jura amor eterno à camponesa Aldonza Lorenzo, a quem chama pelo nome nobre de Dulcineia del Toboso (*). Acompanhado pelo lavrador vizinho Sancho Pança montado em seu burro cinzento, o fidalgo enlouquece após ler romances de cavalaria e investe com sua lança contra moinhos de vento acreditando serem gigantes. Qual o título desta obra-prima espanhola de 1605 escrita por Miguel de Cervantes?',
      formatted_answer_pt: '<b><u>Dom Quixote</u></b> [ou <b><u>Don Quijote de la Mancha</u></b>]',
      answer_canonical_pt: 'Dom Quixote',
      accept_aliases: ['Dom Quixote de la Mancha', 'Don Quixote', 'Don Quijote', 'Dom Quixote das Manchas'],
      prompt_aliases: ['livro de Cervantes', 'cavaleiro da triste figura'],
      lead_in: 'No prólogo da segunda parte, o autor ridicularizou o plágio de Avellaneda antes de concluir as aventuras...',
      giveaway: 'Qual o título deste romance de Miguel de Cervantes sobre o cavaleiro andante que lutava contra moinhos de vento?',
      explanation: 'Dom Quixote de la Mancha (1605/1615), de Miguel de Cervantes, é o marco de fundação do romance moderno ocidental.',
      wiki_url: 'https://pt.wikipedia.org/wiki/Dom_Quixote'
    },
    {
      id: 'qb-universal-dante',
      origin: 'qbreader',
      category: 'Literatura',
      subcategory: 'Poesia Épica',
      difficulty: 2,
      question_pt: 'Ele inventou para sua obra-prima a métrica da terza rima, estruturando cento e quarenta e dois tercetos encadeados em hendecassílabos divididos em cem cantos. Exilado de sua cidade natal de Florença devido aos conflitos faccionais entre os Guelfos Brancos e Negros, foi guiado espiritualmente por sua musa inspiradora Beatriz Portinari (*). No início de sua jornada, perdido em uma selva escura, é resgatado pela sombra do poeta romano Virgílio, que o conduz através dos nove círculos concêntricos até Lúcifer no lago de gelo de Cocite. Nomeie este poeta italiano medieval autor da Divina Comédia.',
      formatted_answer_pt: '<b><u>Dante Alighieri</u></b> [ou <b><u>Dante</u></b>]',
      answer_canonical_pt: 'Dante Alighieri',
      accept_aliases: ['Dante', 'Dante Alighieri'],
      prompt_aliases: ['poeta florentino', 'autor da divina comedia'],
      lead_in: 'Ele inventou a estrutura da terza rima para narrar sua viagem teológica através do além...',
      giveaway: 'Nomeie este poeta florentino autor de A Divina Comédia, que descreveu o Inferno, o Purgatório e o Paraíso.',
      explanation: 'Dante Alighieri (1265-1321) estabeleceu as bases do italiano moderno como língua literária com A Divina Comédia.',
      wiki_url: 'https://pt.wikipedia.org/wiki/Dante_Alighieri'
    },
    {
      id: 'qb-universal-orwell-1984',
      origin: 'qbreader',
      category: 'Literatura',
      subcategory: 'Romance Distópico',
      difficulty: 1,
      question_pt: 'O protagonista trabalha reescrevendo arquivos históricos no Ministério da Verdade e aluga um quarto secreto sem teletelas sobre a loja do senhor Charrington para encontrar sua amante rebelde Júlia. Após ser traído e preso pela Polícia do Pensamento liderada por O\'Brien (*), é torturado e submetido aos seus piores pavores no Quarto 101 com uma gaiola de ratos carnívoros. Ambientado no superestado totalitário da Oceânia governado pelo Partido e pelo rosto onipresente do Grande Irmão, qual o título deste clássico romance distópico de George Orwell?',
      formatted_answer_pt: '<b><u>1984</u></b> [ou <b><u>Mil Novecentos e Oitenta e Quatro</u></b>]',
      answer_canonical_pt: '1984',
      accept_aliases: ['1984', 'Mil Novecentos e Oitenta e Quatro', 'Nineteen Eighty-Four'],
      prompt_aliases: ['livro do Grande Irmão', 'obra de Orwell'],
      lead_in: 'O protagonista Winston Smith trabalha no Ministério da Verdade falsificando o passado em favor do Partido...',
      giveaway: 'Qual o título desta clássica distopia antitotalitária de George Orwell centrada na vigilância do Grande Irmão?',
      explanation: '1984 (publicado em 1949 por George Orwell) cunhou conceitos influentes como Novilíngua, Teletela, Duplipensar e Big Brother.',
      wiki_url: 'https://pt.wikipedia.org/wiki/1984_(livro)'
    },
    {
      id: 'qb-universal-rome',
      origin: 'qbreader',
      category: 'História',
      subcategory: 'História Antiga',
      difficulty: 1,
      question_pt: 'A vitória naval na Batalha de Áccio contra as forças combinadas de Marco Antônio e da rainha Cleópatra do Egito encerrou as guerras civis republicanas deste estado. Seu primeiro soberano monárquico autocrático recebeu do Senado o título sagrado de Augusto em 27 antes de Cristo (*), inaugurando o período de prosperidade conhecido como Pax Romana. Durante a dinastia Flaviana, foi erguido o Anfiteatro Flaviano para combates de gladiadores, conhecido como Coliseu. Identifique este monumental império da Antiguidade centrado na península Itálica que governou toda a bacia do mar Mediterrâneo.',
      formatted_answer_pt: '<b><u>Império Romano</u></b> [ou <b><u>Roma Antiga</u></b>; aceite <i>Roma</i>]',
      answer_canonical_pt: 'Império Romano',
      accept_aliases: ['Roma Antiga', 'Roma', 'O Império Romano'],
      prompt_aliases: ['estado romano', 'civilização romana'],
      lead_in: 'A vitória naval em Áccio consolidou o poder de Otávio e extinguiu a República governada pelo Senado...',
      giveaway: 'Identifique este grande império da Antiguidade clássica cuja capital às margens do rio Tibre sediou o Coliseu e o Fórum.',
      explanation: 'O Império Romano foi uma das civilizações mais influentes da história mundial, legando o direito civil, as línguas neolatinas e a arquitetura monumental.',
      wiki_url: 'https://pt.wikipedia.org/wiki/Imp%C3%A9rio_Romano'
    },
    {
      id: 'qb-universal-ww1',
      origin: 'qbreader',
      category: 'História',
      subcategory: 'História Contemporânea',
      difficulty: 1,
      question_pt: 'A Batalha de Galípoli no estreito de Dardanelos foi um fracasso catastrófico para as tropas britânicas do corpo ANZAC sob ordens de Winston Churchill contra os defensores do Império Otomano. No front ocidental, confrontos brutais e atoleiros de lama nas batalhas de Verdun e do Somme consolidaram a guerra estática de trincheiras (*). O estopim diplomático foi o assassinato do herdeiro do trono austro-húngaro, o arquiduque Francisco Ferdinando, pelo nacionalista sérvio Gavrilo Princip em Sarajevo em 1914. Identifique este primeiro grande conflito bélico em escala global encerrado pelo Tratado de Versalhes em 1918.',
      formatted_answer_pt: '<b><u>Primeira Guerra Mundial</u></b> [ou <b><u>A Grande Guerra</u></b>; aceite <i>Primeira Guerra</i>]',
      answer_canonical_pt: 'Primeira Guerra Mundial',
      accept_aliases: ['Primeira Guerra', 'A Grande Guerra', 'Grande Guerra', 'I Guerra Mundial', '1ª Guerra Mundial'],
      prompt_aliases: ['guerra de 1914', 'guerra das trincheiras'],
      lead_in: 'A desastrosa campanha de Galípoli e o front do Somme marcaram a carnificina das novas metralhadoras e gases tóxicos...',
      giveaway: 'Identifique este primeiro grande conflito global deflagrado em 1914 após o assassinato do arquiduque Francisco Ferdinando.',
      explanation: 'A Primeira Guerra Mundial (1914-1918) redesenhou o mapa europeu com a queda dos impérios Russo, Alemão, Austro-Húngaro e Otomano.',
      wiki_url: 'https://pt.wikipedia.org/wiki/Primeira_Guerra_Mundial'
    },
    {
      id: 'qb-universal-coldwar',
      origin: 'qbreader',
      category: 'História',
      subcategory: 'História Contemporânea',
      difficulty: 1,
      question_pt: 'Durante este período geopolítico, a doutrina militar MAD (Destruição Mútua Assegurada) garantiu que nenhum dos dois blocos antagônicos utilizasse seu arsenal atômico de forma direta. O mundo esteve à beira de uma aniquilação nuclear durante treze dias em outubro de 1962 na Crise dos Mísseis de Cuba (*). Caracterizado pela corrida espacial e por guerras por procuração na Coreia e no Vietnã, colocou em disputa a OTAN e os signatários do Pacto de Varsóvia. Qual o nome deste confronto ideológico e econômico global travado entre os Estados Unidos e a União Soviética até a queda do Muro de Berlim?',
      formatted_answer_pt: '<b><u>Guerra Fria</u></b> [ou <b><u>A Guerra Fria</u></b>; aceite <i>Cold War</i>]',
      answer_canonical_pt: 'Guerra Fria',
      accept_aliases: ['A Guerra Fria', 'Cold War'],
      prompt_aliases: ['disputa entre EUA e URSS', 'conflito pós-guerra'],
      lead_in: 'A doutrina da Destruição Mútua Assegurada balizou a corrida armamentista e a corrida espacial...',
      giveaway: 'Qual o nome desta disputa ideológica e bipolar entre Estados Unidos e União Soviética que dividiu o mundo no século XX?',
      explanation: 'A Guerra Fria (1947-1991) definiu a política mundial do pós-Segunda Guerra entre o bloco capitalista americano e o bloco socialista soviético.',
      wiki_url: 'https://pt.wikipedia.org/wiki/Guerra_Fria'
    },
    {
      id: 'qb-universal-periodic-table',
      origin: 'qbreader',
      category: 'Ciência',
      subcategory: 'Química',
      difficulty: 1,
      question_pt: 'Henry Moseley reformulou sua organização em 1913 ao demonstrar que ela deveria ser ordenada pela contagem de cargas nucleares positivas e não pelas massas atômicas calculadas. O criador de sua versão mais famosa previu com espantosa precisão a existência e as propriedades térmicas de elementos até então desconhecidos apelidados de eka-boro, eka-alumínio e eka-silício (*). Em 1869, o químico siberiano Dmitri Mendeleev ordenou os elementos químicos conhecidos em períodos horizontais e famílias verticais de propriedades similares. Nomeie esta tabela tabular que organiza todos os elementos químicos conhecidos pelo seu número atômico.',
      formatted_answer_pt: '<b><u>Tabela Periódica</u></b> [ou <b><u>Tabela Periódica dos Elementos</u></b>]',
      answer_canonical_pt: 'Tabela Periódica',
      accept_aliases: ['Tabela Periódica dos Elementos', 'A Tabela Periódica'],
      prompt_aliases: ['quadro de elementos', 'tabela de Mendeleev'],
      lead_in: 'Henry Moseley demonstrou que sua seriação dependia da contagem de prótons do núcleo atômico...',
      giveaway: 'Nomeie esta organização sistemática e visual de todos os elementos químicos conhecidos concebida por Dmitri Mendeleev.',
      explanation: 'A Tabela Periódica organiza os 118 elementos químicos conhecidos em ordem crescente de número atômico e de acordo com sua configuração eletrônica.',
      wiki_url: 'https://pt.wikipedia.org/wiki/Tabela_peri%C3%B3dica'
    },
    {
      id: 'qb-universal-quantum',
      origin: 'qbreader',
      category: 'Ciência',
      subcategory: 'Física',
      difficulty: 2,
      question_pt: 'Para resolver a catástrofe do ultravioleta na radiação de corpo negro em 1900, um físico propôs que a energia só podia ser emitida ou absorvida em pacotes discretos proporcionais a uma constante universal h. Louis de Broglie expandiu este conceito ao formular a dualidade onda-partícula da matéria (*). Mais tarde, Werner Heisenberg estabeleceu o princípio de que é impossível conhecer simultaneamente com precisão absoluta a posição e o momento linear de uma partícula subatômica. Qual é este ramo da física teórica pioneiramente explorado por Max Planck, Niels Bohr e Erwin Schrödinger para descrever a natureza na escala subatômica?',
      formatted_answer_pt: '<b><u>Mecânica Quântica</u></b> [ou <b><u>Física Quântica</u></b>; aceite <i>Teoria Quântica</i>]',
      answer_canonical_pt: 'Mecânica Quântica',
      accept_aliases: ['Física Quântica', 'Teoria Quântica', 'Mecanica Quantica', 'Fisica Quantica'],
      prompt_aliases: ['física subatômica', 'estudo dos quanta'],
      lead_in: 'Max Planck resolveu a catástrofe do ultravioleta ao demonstrar que a energia viaja em pacotes indivisíveis...',
      giveaway: 'Qual é este revolucionário ramo da física moderna que estuda o comportamento probabilístico de partículas no nível subatômico?',
      explanation: 'A Mecânica Quântica revolucionou a compreensão da matéria e da energia ao descrever fenômenos probabilísticos e discretos na escala do infinitamente pequeno.',
      wiki_url: 'https://pt.wikipedia.org/wiki/Mec%C3%A2nica_qu%C3%A2ntica'
    },
    {
      id: 'qb-universal-mozart',
      origin: 'qbreader',
      category: 'Artes',
      subcategory: 'Música',
      difficulty: 1,
      question_pt: 'Ele compôs suas três últimas grandes sinfonias em um período vertiginoso de apenas seis semanas durante o verão de 1788, culminando na Sinfonia Número 41 em Dó Maior apelidada de "Júpiter". Suas colaborações operísticas com o libretista Lorenzo Da Ponte geraram obras-primas como As Bodas de Fígaro, Cosí fan Tutte e Don Giovanni (*). Nascido em Salzburgo, este prodígio tocou violino e cravo perante as cortes europeias com apenas seis anos de idade e deixou inacabado seu sombrio Requiem ao falecer aos trinta e cinco anos. Nomeie este genial compositor austríaco do período clássico que compôs a ópera A Flauta Mágica.',
      formatted_answer_pt: '<b><u>Wolfgang Amadeus Mozart</u></b> [ou <b><u>Mozart</u></b>]',
      answer_canonical_pt: 'Wolfgang Amadeus Mozart',
      accept_aliases: ['Mozart', 'Wolfgang Mozart', 'Amadeus Mozart'],
      prompt_aliases: ['compositor austríaco', 'prodígio de Salzburgo'],
      lead_in: 'Ele compôs a Sinfonia Júpiter e colaborou intensamente com o libretista Lorenzo Da Ponte...',
      giveaway: 'Nomeie este célebre prodígio e compositor austríaco autor de A Flauta Mágica e do Requiem em Ré Menor.',
      explanation: 'Wolfgang Amadeus Mozart (1756-1791) foi um dos maiores expoentes do Classicismo musical vienense, autor de mais de 600 obras icônicas.',
      wiki_url: 'https://pt.wikipedia.org/wiki/Wolfgang_Amadeus_Mozart'
    }
  ];
}
