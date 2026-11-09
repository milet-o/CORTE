import { Tossup } from '../../types/quizbowl';

export interface BatchItem {
  id: string;
  category: string;
  subcategory: string;
  difficulty: number;
  clues: string[];
  powerClue: string;
  giveaway: string;
  answerCanonical: string;
  acceptAliases: string[];
  promptAliases: string[];
  explanation: string;
  wikiUrl: string;
}

export const CHEMISTRY_PHYSICS_QUESTIONS: BatchItem[] = [
  // 1. Hidrogênio
  {
    id: 'batch-chem-hidrogenio',
    category: 'Ciência',
    subcategory: 'Química',
    difficulty: 1,
    clues: [
      'Foi reconhecido pela primeira vez como uma substância discreta em 1766 por Henry Cavendish, que o denominou "ar inflamável".',
      'Na espectroscopia atômica, a fórmula de Rydberg e as séries de Lyman, Balmer e Paschen foram deduzidas para mapear suas linhas de emissão espectral.'
    ],
    powerClue: 'No diagrama de fases em pressões de megabares, postula-se que ele entre em um estado líquido metálico supercondutor que compõe o interior de Júpiter (*)',
    giveaway: 'Identifique este elemento químico mais simples e abundante de todo o universo observável, cujo núcleo mais comum consiste de um único próton com número atômico 1.',
    answerCanonical: 'Hidrogênio',
    acceptAliases: ['Hidrogenio', 'H', 'Gás Hidrogênio', 'H2'],
    promptAliases: ['gás inflamável', 'primeiro elemento'],
    explanation: 'O hidrogênio (H, número atômico 1) compõe cerca de 75% da massa bariônica do universo e é o mais leve dos elementos químicos.',
    wikiUrl: 'https://pt.wikipedia.org/wiki/Hidrog%C3%AAnio'
  },
  // 2. Lítio
  {
    id: 'batch-chem-litio',
    category: 'Ciência',
    subcategory: 'Química Inorgânica',
    difficulty: 1,
    clues: [
      'Foi descoberto em 1817 pelo químico sueco Johan August Arfwedson a partir do mineral petalita na ilha de Utö.',
      'Em psiquiatria, seus sais como o carbonato são largamente prescritos como estabilizadores de humor de primeira linha no transtorno bipolar.'
    ],
    powerClue: 'Apresenta o maior potencial eletroquímico padrão de redução (-3,04 V), o que o torna a base ideal para baterias recarregáveis de íon de alta densidade energética (*)',
    giveaway: 'Nomeie este metal alcalino mais leve de todos, com número atômico 3 e densidade tão baixa que flutua na água e em óleo mineral.',
    answerCanonical: 'Lítio',
    acceptAliases: ['Litio', 'Li'],
    promptAliases: ['metal alcalino', 'metal de bateria'],
    explanation: 'O lítio (Li, Z=3) é o metal menos denso entre os elementos sólidos e componente crucial de baterias recarregáveis.',
    wikiUrl: 'https://pt.wikipedia.org/wiki/L%C3%ADtio'
  },
  // 3. Berílio
  {
    id: 'batch-chem-berilio',
    category: 'Ciência',
    subcategory: 'Química Inorgânica',
    difficulty: 2,
    clues: [
      'Seus compostos possuem um sabor adocicado marcante que levou o químico Louis-Nicolas Vauquelin a batizá-lo inicialmente de "glucínio".',
      'Sua inalação em poeiras industriais provoca uma grave afecção pulmonar inflamatória e granulomatosa incurável.'
    ],
    powerClue: 'Por possuir baixíssima absorção de raios-X e peso atômico reduzido, chapas finas deste metal são usadas como janelas transparentes em tubos de raio-X (*)',
    giveaway: 'Identifique este metal alcalinoterroso de número atômico 4, elemento constituinte das gemas esmeralda e água-marinha.',
    answerCanonical: 'Berílio',
    acceptAliases: ['Berilio', 'Be', 'Glucínio', 'Glucinio'],
    promptAliases: ['metal alcalinoterroso', 'elemento da esmeralda'],
    explanation: 'O berílio (Be, Z=4) é um metal alcalinoterroso leve, rígido e tóxico, abundante em berilos como esmeraldas.',
    wikiUrl: 'https://pt.wikipedia.org/wiki/Ber%C3%ADlio'
  },
  // 4. Boro
  {
    id: 'batch-chem-boro',
    category: 'Ciência',
    subcategory: 'Química Inorgânica',
    difficulty: 2,
    clues: [
      'William Lipscomb recebeu o Prêmio Nobel de Química de 1976 ao elucidar as ligações de três centros com dois elétrons em seus hidretos policíclicos.',
      'Seu isótopo 10 possui altíssima seção de choque para captura de nêutrons térmicos, sendo usado em barras de controle de reatores e na terapia BNCT.'
    ],
    powerClue: 'Seu mineral borax foi historicamente utilizado na ourivesaria e sua incorporação na sílica gera o vidro borossilicato conhecido comercialmente como Pyrex (*)',
    giveaway: 'Nomeie este semimetal de número atômico 5, situado no grupo 13 da tabela periódica logo acima do alumínio.',
    answerCanonical: 'Boro',
    acceptAliases: ['Boro', 'B'],
    promptAliases: ['semimetal', 'elemento do bórax'],
    explanation: 'O boro (B, Z=5) é um metaloide trivalente usado em materiais de alta resistência, vidros térmicos e semicondutores.',
    wikiUrl: 'https://pt.wikipedia.org/wiki/Boro'
  },
  // 5. Carbono
  {
    id: 'batch-chem-carbono',
    category: 'Ciência',
    subcategory: 'Química Orgânica',
    difficulty: 1,
    clues: [
      'Willard Libby desenvolveu a técnica de datação arqueológica que utiliza o decaimento radioativo de seu isótopo 14 com meia-vida de 5.730 anos.',
      'Sua capacidade ímpar de formar cadeias estáveis lineares, ramificadas e anelares via hibridizações sp, sp2 e sp3 funda a química orgânica.'
    ],
    powerClue: 'Entre seus alótropos conhecidos encontram-se o grafite condutor, o fulereno esférico C60 e o diamante de altíssima dureza (*)',
    giveaway: 'Qual é este elemento fundamental para a vida com número atômico 6 e símbolo C?',
    answerCanonical: 'Carbono',
    acceptAliases: ['Carbono', 'C'],
    promptAliases: ['elemento orgânico', 'base da vida'],
    explanation: 'O carbono (C, Z=6) é o pilar estrutural da vida terrestre pela sua versátil tetravalência.',
    wikiUrl: 'https://pt.wikipedia.org/wiki/Carbono'
  },
  // 6. Nitrogênio
  {
    id: 'batch-chem-nitrogenio',
    category: 'Ciência',
    subcategory: 'Química',
    difficulty: 1,
    clues: [
      'Daniel Rutherford isolou este gás em 1772 retirando oxigênio e gás carbônico do ar e o denominou "ar mefítico".',
      'Antoine Lavoisier chamou-o de "ázoto", significando "sem vida", por ser incapaz de sustentar a respiração celular animal.'
    ],
    powerClue: 'Os dois átomos de sua molécula diatômica estão unidos por uma fortíssima ligação covalente tripla que exige o processo Haber-Bosch para ser rompida industrialmente (*)',
    giveaway: 'Identifique este gás que compõe aproximadamente setenta e oito por cento do volume da atmosfera da Terra, de número atômico 7.',
    answerCanonical: 'Nitrogênio',
    acceptAliases: ['Nitrogenio', 'N', 'Azoto', 'N2', 'Gás Nitrogênio'],
    promptAliases: ['gás atmosférico', 'azoto'],
    explanation: 'O nitrogênio (N, Z=7) é o componente majoritário do ar atmosférico e nutriente basilar em aminoácidos e DNA.',
    wikiUrl: 'https://pt.wikipedia.org/wiki/Nitrog%C3%AAnio'
  },
  // 7. Flúor
  {
    id: 'batch-chem-fluor',
    category: 'Ciência',
    subcategory: 'Química',
    difficulty: 1,
    clues: [
      'Muitos químicos pioneiros, como Humphry Davy e os irmãos Knox, sofreram graves envenenamentos ou morreram tentando isolar este halogênio de reatividade violenta.',
      'Henri Moissan finalmente conseguiu isolá-lo em 1886 por eletrólise de fluoreto de hidrogênio em platina, ganhando o Nobel de Química de 1906.'
    ],
    powerClue: 'Na escala de eletronegatividade de Linus Pauling, este halogênio ocupa o valor máximo absoluto de 3,98 (*)',
    giveaway: 'Nomeie este elemento halogênio gasoso e amarelo-pálido de número atômico 9, amplamente adicionado à água encanada e cremes dentais para prevenir cáries.',
    answerCanonical: 'Flúor',
    acceptAliases: ['Fluor', 'F', 'F2', 'Gás Flúor'],
    promptAliases: ['halogênio', 'elemento mais eletronegativo'],
    explanation: 'O flúor (F, Z=9) é o elemento químico mais eletronegativo e reativo da tabela periódica.',
    wikiUrl: 'https://pt.wikipedia.org/wiki/Fl%C3%BAor'
  },
  // 8. Neônio
  {
    id: 'batch-chem-neonio',
    category: 'Ciência',
    subcategory: 'Química',
    difficulty: 1,
    clues: [
      'Foi descoberto em 1898 pelos químicos britânicos William Ramsay e Morris Travers através da destilação fracionada do ar líquido.',
      'Seu nome deriva da palavra grega que significa "novo", sugerida pelo filho de treze anos de Ramsay.'
    ],
    powerClue: 'Quando excitado por alta tensão elétrica em tubos de descarga de baixa pressão, emite uma intensa e inconfundível luz de coloração vermelho-alaranjada (*)',
    giveaway: 'Identifique este gás nobre de número atômico 10, famoso por sua utilização em luminosos de publicidade urbana.',
    answerCanonical: 'Neônio',
    acceptAliases: ['Neonio', 'Ne'],
    promptAliases: ['gás nobre', 'luz de letreiro'],
    explanation: 'O neônio (Ne, Z=10) é um gás nobre inerte célebre pelo brilho avermelhado em luminosos.',
    wikiUrl: 'https://pt.wikipedia.org/wiki/Ne%C3%B3nio'
  },
  // 9. Sódio
  {
    id: 'batch-chem-sodio',
    category: 'Ciência',
    subcategory: 'Química Inorgânica',
    difficulty: 1,
    clues: [
      'Foi isolado em 1807 pelo químico britânico Humphry Davy através da eletrólise de soda cáustica fundida.',
      'No teste de chama da química analítica, seus sais emitem uma intensa e persistente linha amarela dupla em 589 nanômetros (as linhas D).'
    ],
    powerClue: 'Reage vigorosamente com água liberando gás hidrogênio e hidróxido, gerando calor suficiente para incendiar o gás liberado (*)',
    giveaway: 'Nomeie este metal alcalino de número atômico 11 que, combinado com o cloro, forma o sal de cozinha comum.',
    answerCanonical: 'Sódio',
    acceptAliases: ['Sodio', 'Na'],
    promptAliases: ['metal alcalino', 'elemento do sal'],
    explanation: 'O sódio (Na, Z=11) é um metal alcalino altamente reativo e mineral essencial para os potenciais de ação neuromusculares.',
    wikiUrl: 'https://pt.wikipedia.org/wiki/S%C3%B3dio'
  },
  // 10. Magnésio
  {
    id: 'batch-chem-magnesio',
    category: 'Ciência',
    subcategory: 'Química',
    difficulty: 1,
    clues: [
      'Seu nome homenageia uma região da Tessália na Grécia de onde provinham óxidos conhecidos desde a Antiguidade.',
      'Queima no ar com uma chama branca ofuscante de altíssima temperatura, sendo usado historicamente como flash fotográfico e em sinalizadores marítimos.'
    ],
    powerClue: 'Na bioquímica vegetal, um átomo central deste elemento está coordenado no centro do anel de porfirina da molécula de clorofila (*)',
    giveaway: 'Qual é este metal alcalinoterroso de número atômico 12 e símbolo Mg?',
    answerCanonical: 'Magnésio',
    acceptAliases: ['Magnesio', 'Mg'],
    promptAliases: ['metal alcalinoterroso', 'elemento da clorofila'],
    explanation: 'O magnésio (Mg, Z=12) é essencial para todas as células vivas e centro catalítico da clorofila na fotossíntese.',
    wikiUrl: 'https://pt.wikipedia.org/wiki/Magn%C3%A9sio'
  },
  // 11. Silício
  {
    id: 'batch-chem-silicio',
    category: 'Ciência',
    subcategory: 'Ciência dos Materiais',
    difficulty: 1,
    clues: [
      'Foi isolado na sua forma pura em 1824 pelo químico sueco Jöns Jacob Berzelius ao aquecer tetrafluoreto com potássio.',
      'Sua estrutura cristalina é análoga à do diamante e, com oxigênio, compõe os silicatos que formam mais de noventa por cento da crosta terrestre.'
    ],
    powerClue: 'Graças ao seu bandgap de 1,1 elétron-volts, lingotes monocristalinos obtidos pelo método de Czochralski são fatiados em wafers para fabricação de chips microprocessadores (*)',
    giveaway: 'Identifique este semimetal de número atômico 14 que batiza o famoso polo tecnológico californiano do Vale do Silício.',
    answerCanonical: 'Silício',
    acceptAliases: ['Silicio', 'Si'],
    promptAliases: ['semicondutor', 'semimetal dos computadores'],
    explanation: 'O silício (Si, Z=14) é o segundo elemento mais abundante na crosta terrestre e matéria-prima da indústria microeletrônica.',
    wikiUrl: 'https://pt.wikipedia.org/wiki/Sil%C3%ADcio'
  },
  // 12. Fósforo
  {
    id: 'batch-chem-fosforo',
    category: 'Ciência',
    subcategory: 'Química',
    difficulty: 1,
    clues: [
      'Foi descoberto em 1669 pelo alquimista alemão Hennig Brand enquanto destilava centenas de litros de urina em busca da Pedra Filosofal.',
      'Seu alótropo branco é pirofórico e extremamente tóxico, enquanto sua forma vermelha mais estável é empregada na lixa das caixas de fósforo.'
    ],
    powerClue: 'Seu nome em grego significa "o portador da luz" por emitir uma luminescência esverdeada contínua no escuro ao oxidar lentamente ao ar (*)',
    giveaway: 'Nomeie este elemento não-metálico de número atômico 15 constituinte vital do esqueleto de fosfato do DNA e da moeda energética ATP.',
    answerCanonical: 'Fósforo',
    acceptAliases: ['Fosforo', 'P'],
    promptAliases: ['não-metal', 'elemento do atp'],
    explanation: 'O fósforo (P, Z=15) é um elemento essencial para a vida, compondo ossos, membranas celulares e ácidos nucleicos.',
    wikiUrl: 'https://pt.wikipedia.org/wiki/F%C3%B3sforo'
  },
  // 13. Enxofre
  {
    id: 'batch-chem-enxofre',
    category: 'Ciência',
    subcategory: 'Química',
    difficulty: 1,
    clues: [
      'Na Bíblia e em textos antigos, era referido como pedra de enxofre ou "brimstone", associado ao fogo do inferno e fumaças vulcânicas.',
      'No processo industrial de vulcanização patenteado por Charles Goodyear em 1839, pontes moleculares deste elemento ligam cadeias de borracha para torná-la elástica e resistente.'
    ],
    powerClue: 'Apresenta cristais de cor amarelo-limão brilhante formados por anéis octaatômicos S8 e seu gás hidrogenado H2S tem cheiro repugnante de ovo podre (*)',
    giveaway: 'Identifique este calcogênio sólido amarelo de número atômico 16, cujo ácido oxigenado H2SO4 é o composto químico mais produzido no mundo.',
    answerCanonical: 'Enxofre',
    acceptAliases: ['Enxofre', 'S'],
    promptAliases: ['calcogênio', 'elemento amarelo'],
    explanation: 'O enxofre (S, Z=16) é um não-metal amarelo abundante na natureza em áreas vulcânicas e matéria-prima do ácido sulfúrico.',
    wikiUrl: 'https://pt.wikipedia.org/wiki/Enxofre'
  },
  // 14. Cloro
  {
    id: 'batch-chem-cloro',
    category: 'Ciência',
    subcategory: 'Química',
    difficulty: 1,
    clues: [
      'Carl Wilhelm Scheele o gerou pela primeira vez em 1774 reagindo dióxido de manganês com ácido clorídrico, embora acreditasse ser um composto oxigenado.',
      'Foi empregado tragicamente como a primeira arma química de sufocamento em massa pelas forças alemãs na Segunda Batalha de Ypres em 1915.'
    ],
    powerClue: 'Seu nome provém do grego chloros pela sua coloração verde-amarelada em estado gasoso e seu íon hipoclorito é a base da água sanitária (*)',
    giveaway: 'Nomeie este halogênio de número atômico 17 amplamente utilizado na desinfecção e tratamento de água potável e piscinas.',
    answerCanonical: 'Cloro',
    acceptAliases: ['Cloro', 'Cl', 'Cl2', 'Gás Cloro'],
    promptAliases: ['halogênio', 'desinfetante'],
    explanation: 'O cloro (Cl, Z=17) é um gás tóxico e oxidante vigoroso indispensável na indústria de purificação de água e plásticos PVC.',
    wikiUrl: 'https://pt.wikipedia.org/wiki/Cloro'
  },
  // 15. Titânio
  {
    id: 'batch-chem-titanio',
    category: 'Ciência',
    subcategory: 'Metalurgia',
    difficulty: 1,
    clues: [
      'Foi descoberto em 1791 pelo reverendo e mineralogista amador William Gregor na Cornualha e nomeado por Klaproth em honra aos gigantes primordiais da mitologia grega.',
      'Seu óxido TiO2 é o pigmento branco mais brilhante e opaco do mundo, presente em tintas de parede, papel e protetores solares.'
    ],
    powerClue: 'Apresenta a maior relação resistência mecânica-densidade entre todos os metais e excelente osteointegração biológica em implantes cirúrgicos (*)',
    giveaway: 'Identifique este metal de transição leve, cinzento e ultrarresistente à corrosão de número atômico 22, fundamental para turbinas aeroespaciais.',
    answerCanonical: 'Titânio',
    acceptAliases: ['Titanio', 'Ti'],
    promptAliases: ['metal de transição', 'metal de implante'],
    explanation: 'O titânio (Ti, Z=22) é um metal refratário leve e biocompatível essencial para próteses médicas e fuselagens aeronáuticas.',
    wikiUrl: 'https://pt.wikipedia.org/wiki/Tit%C3%A2nio'
  },
  // 16. Ferro
  {
    id: 'batch-chem-ferro',
    category: 'Ciência',
    subcategory: 'Metalurgia e Astrofísica',
    difficulty: 1,
    clues: [
      'Na nucleossíntese estelar de estrelas massivas, seu isótopo 56 marca o ápice da energia de ligação por núcleon, encerrando reações exotérmicas e colapsando o núcleo em supernova.',
      'Sua liga com pequenas porcentagens de carbono forma o aço, sustentáculo da infraestrutura moderna.'
    ],
    powerClue: 'No corpo humano adulto, cerca de quatro gramas deste elemento atuam coordenados ao grupo heme das proteínas hemoglobina e mioglobina (*)',
    giveaway: 'Qual é este metal ferromagnético de número atômico 26 e símbolo Fe, o elemento mais abundante em massa no planeta Terra?',
    answerCanonical: 'Ferro',
    acceptAliases: ['Ferro', 'Fe'],
    promptAliases: ['metal ferromagnético', 'elemento da hemoglobina'],
    explanation: 'O ferro (Fe, Z=26) é o núcleo do planeta Terra e o metal mais produzido da história humana.',
    wikiUrl: 'https://pt.wikipedia.org/wiki/Ferro'
  },
  // 17. Cobre
  {
    id: 'batch-chem-cobre',
    category: 'Ciência',
    subcategory: 'Metalurgia',
    difficulty: 1,
    clues: [
      'Os antigos romanos o extraíam intensamente na ilha de Chipre, de onde derivou seu nome latino aes cyprium.',
      'Sua liga primitiva com estanho inaugurou uma era inteira do desenvolvimento tecnológico e bélico da civilização humana.'
    ],
    powerClue: 'Apresenta a segunda maior condutividade elétrica entre todos os elementos da tabela periódica, perdendo apenas para a prata (*)',
    giveaway: 'Identifique este metal avermelhado e dúctil de número atômico 29 amplamente empregado em fiações elétricas e cabos condutores.',
    answerCanonical: 'Cobre',
    acceptAliases: ['Cobre', 'Cu'],
    promptAliases: ['metal avermelhado', 'metal dos fios'],
    explanation: 'O cobre (Cu, Z=29) foi um dos primeiros metais trabalhados pela humanidade e base da rede elétrica moderna.',
    wikiUrl: 'https://pt.wikipedia.org/wiki/Cobre'
  },
  // 18. Ouro
  {
    id: 'batch-chem-ouro',
    category: 'Ciência',
    subcategory: 'Química e Mineralogia',
    difficulty: 1,
    clues: [
      'Efeitos da relatividade especial sobre seus elétrons orbitais 6s contraem a nuvem eletrônica e deslocam sua absorção para o azul, conferindo-lhe sua cor amarela quente singular.',
      'É o metal mais maleável e dúctil conhecido, podendo uma única onça ser esticada em uma folha de centenas de metros quadrados.'
    ],
    powerClue: 'Dissolve-se prontamente na mistura corrosiva de ácidos nítrico e clorídrico conhecida como água régia, formando o ânion tetracloroaurato (*)',
    giveaway: 'Nomeie este metal precioso nobre e inalterável de número atômico 79 e símbolo Au.',
    answerCanonical: 'Ouro',
    acceptAliases: ['Ouro', 'Au'],
    promptAliases: ['metal precioso', 'metal amarelo nobre'],
    explanation: 'O ouro (Au, Z=79) é um metal nobre resistente à oxidação, tradicional padrão monetário e símbolo milenar de riqueza.',
    wikiUrl: 'https://pt.wikipedia.org/wiki/Ouro'
  },
  // 19. Mercúrio
  {
    id: 'batch-chem-mercurio',
    category: 'Ciência',
    subcategory: 'Química',
    difficulty: 1,
    clues: [
      'Na medicina antiga e alquimia, era conhecido como hidrargírio ou "prata viva", simbolizado pelo caduceu do mensageiro dos deuses.',
      'A exposição crônica aos seus vapores causava tremores e demência em fabricantes de chapéus vitorianos, inspirando o Chapeleiro Maluco de Lewis Carroll.'
    ],
    powerClue: 'Forma amálgamas com quase todos os metais convencionais e é o único metal elementar que permanece no estado líquido em condições normais de temperatura e pressão (*)',
    giveaway: 'Qual é este metal pesado e líquido prateado de número atômico 80 e símbolo Hg, tradicionalmente usado em termômetros e barômetros?',
    answerCanonical: 'Mercúrio',
    acceptAliases: ['Mercurio', 'Hg', 'Prata-viva', 'Prata viva'],
    promptAliases: ['metal líquido', 'elemento de termômetro'],
    explanation: 'O mercúrio (Hg, Z=80) é um metal de transição líquido à temperatura ambiente e altamente tóxico para o sistema nervoso.',
    wikiUrl: 'https://pt.wikipedia.org/wiki/Merc%C3%BArio_(elemento_qu%C3%ADmico)'
  },
  // 20. Chumbo
  {
    id: 'batch-chem-chumbo',
    category: 'Ciência',
    subcategory: 'Química e Toxicologia',
    difficulty: 1,
    clues: [
      'Os antigos romanos o utilizavam amplamente em aquedutos e encanamentos urbanos, termo que deu origem à palavra latina plumbum e ao português "encanamento" em várias línguas.',
      'O geoquímico Clair Patterson descobriu sua contaminação atmosférica global ao tentar medir a idade da Terra através da datação urânio-chumbo em meteoritos.'
    ],
    powerClue: 'Por sua altíssima densidade e número atômico, é o material padrão empregado na blindagem contra radiação ionizante de raios gama e raios-X (*)',
    giveaway: 'Identifique este metal pesado maleável e tóxico de número atômico 82, cujo envenenamento patológico crônico é denominado saturnismo.',
    answerCanonical: 'Chumbo',
    acceptAliases: ['Chumbo', 'Pb'],
    promptAliases: ['metal pesado', 'metal de blindagem'],
    explanation: 'O chumbo (Pb, Z=82) é o produto final das séries de decaimento do urânio e tório, outrora adicionado à gasolina e tintas.',
    wikiUrl: 'https://pt.wikipedia.org/wiki/Chumbo'
  },
  // 21. Efeito Fotoelétrico
  {
    id: 'batch-phys-efeito-fotoeletrico',
    category: 'Ciência',
    subcategory: 'Física Moderna',
    difficulty: 1,
    clues: [
      'Heinrich Hertz observou pela primeira vez em 1887 que centelhas elétricas entre eletrodos saltavam com mais facilidade quando iluminadas por luz ultravioleta.',
      'Philipp Lenard constatou que a energia cinética dos elétrons ejetados não dependia da intensidade do feixe luminoso, contrariando a teoria ondulatória clássica de Maxwell.'
    ],
    powerClue: 'Sua explicação teórica em 1905 baseou-se na hipótese de que a luz é quantizada em pacotes discretos chamados fótons com energia E = h*f (*)',
    giveaway: 'Qual é este fenômeno físico de emissão de elétrons por uma superfície metálica atingida por radiação eletromagnética, trabalho que rendeu a Albert Einstein o Prêmio Nobel de Física de 1921?',
    answerCanonical: 'Efeito Fotoelétrico',
    acceptAliases: ['Efeito Fotoeletrico', 'Efeito Foto-elétrico', 'Fotoeletricidade'],
    promptAliases: ['emissão fotoelétrica', 'nobel de einstein'],
    explanation: 'O efeito fotoelétrico comprovou a natureza corpuscular da luz e foi o marco fundador da mecânica quântica moderna.',
    wikiUrl: 'https://pt.wikipedia.org/wiki/Efeito_fotoel%C3%A9trico'
  },
  // 22. Princípio da Incerteza de Heisenberg
  {
    id: 'batch-phys-principio-incerteza',
    category: 'Ciência',
    subcategory: 'Mecânica Quântica',
    difficulty: 2,
    clues: [
      'O autor utilizou o célebre experimento mental do microscópio de raios gama para ilustrar como o ato de medir perturba o estado quântico observado.',
      'Em termos matemáticos formais na mecânica matricial, decorre diretamente do fato de os operadores de posição e momento linear não comutarem.'
    ],
    powerClue: 'Estabelece que o produto das incertezas delta x e delta p de uma partícula é sempre maior ou igual à constante de Planck reduzida dividida por dois (*)',
    giveaway: 'Identifique este postulado fundamental formulado em 1927 pelo físico alemão Werner Heisenberg que dita a impossibilidade de conhecer simultaneamente a posição e o momento de um elétron.',
    answerCanonical: 'Princípio da Incerteza de Heisenberg',
    acceptAliases: ['Princípio da Incerteza', 'Principio da Incerteza', 'Incerteza de Heisenberg', 'Relações de Incerteza'],
    promptAliases: ['princípio de heisenberg', 'relação quântica'],
    explanation: 'O Princípio da Incerteza de Heisenberg demonstra que certas grandezas físicas conjugadas não possuem valores simultaneamente determinados.',
    wikiUrl: 'https://pt.wikipedia.org/wiki/Princ%C3%ADpio_da_incerteza_de_Heisenberg'
  },
  // 23. Lei da Gravitação Universal
  {
    id: 'batch-phys-gravitacao-universal',
    category: 'Ciência',
    subcategory: 'Física Clássica',
    difficulty: 1,
    clues: [
      'Foi publicada formalmente no Livro III dos Philosophiae Naturalis Principia Mathematica em 1687 a pedido do astrônomo Edmond Halley.',
      'O valor numérico da constante proporcional G que a rege foi determinado com precisão pela primeira vez em 1798 por Henry Cavendish usando uma balança de torção.'
    ],
    powerClue: 'Postula que a força de atração entre duas massas pontuais é diretamente proporcional ao produto de suas massas e inversamente proporcional ao quadrado da distância entre elas (*)',
    giveaway: 'Nomeie esta famosa lei física fundamental formulada por Sir Isaac Newton.',
    answerCanonical: 'Lei da Gravitação Universal',
    acceptAliases: ['Gravitação Universal', 'Gravitacao Universal', 'Lei da Gravidade de Newton', 'Gravitação Newtoniana'],
    promptAliases: ['lei da gravidade', 'lei de newton'],
    explanation: 'A Lei da Gravitação Universal unificou a queda dos corpos na Terra com o movimento elíptico dos planetas no céu.',
    wikiUrl: 'https://pt.wikipedia.org/wiki/Lei_da_gravita%C3%A7%C3%A3o_universal'
  },
  // 24. Pêndulo de Foucault
  {
    id: 'batch-phys-pendulo-foucault',
    category: 'Ciência',
    subcategory: 'Física Clássica',
    difficulty: 2,
    clues: [
      'Sua primeira demonstração pública célebre ocorreu sob a cúpula do Panteão de Paris em 1851 usando uma esfera de latão de vinte e oito quilos suspensa por um fio de sessenta e sete metros.',
      'O período completo de rotação aparente de seu plano de oscilação é dado matematicamente por vinte e quatro horas dividido pelo seno da latitude geográfica do local.'
    ],
    powerClue: 'A rotação contínua e gradual do seu plano de oscilação em sentido horário no Hemisfério Norte decorre da ação da força inercial de Coriolis (*)',
    giveaway: 'Identifique este famoso dispositivo mecânico concebido pelo físico francês Léon Foucault para demonstrar experimentalmente a rotação da Terra em torno do próprio eixo.',
    answerCanonical: 'Pêndulo de Foucault',
    acceptAliases: ['Pendulo de Foucault', 'O Pêndulo de Foucault'],
    promptAliases: ['experimento de rotação', 'pêndulo do panteão'],
    explanation: 'O Pêndulo de Foucault foi o primeiro experimento dinâmico simples a provar a rotação terrestre sem necessidade de observações astronômicas.',
    wikiUrl: 'https://pt.wikipedia.org/wiki/P%C3%AAndulo_de_Foucault'
  },
  // 25. Radiação Cósmica de Fundo em Micro-ondas
  {
    id: 'batch-phys-radiacao-fundo',
    category: 'Ciência',
    subcategory: 'Cosmologia',
    difficulty: 2,
    clues: [
      'Foi prevista teoricamente no final dos anos 1940 pelos físicos George Gamow, Ralph Alpher e Robert Herman como um resquício térmico da nucleossíntese primordial.',
      'Foi detectada por acaso em 1965 pelos radioastrônomos Arno Penzias e Robert Wilson nos laboratórios Bell usando uma antena em corneta em Holmdel, que rendeu o Nobel de 1978.'
    ],
    powerClue: 'Seu espectro ajusta-se com espantosa exatidão ao de um corpo negro perfeito a uma temperatura de 2,725 Kelvin com minúsculas anisotropias de microkelvin mapeadas pelos satélites COBE, WMAP e Planck (*)',
    giveaway: 'Identifique este eco de radiação eletromagnética remanescente do Big Bang que permeia todo o cosmos observável.',
    answerCanonical: 'Radiação Cósmica de Fundo em Micro-ondas',
    acceptAliases: ['Radiação Cósmica de Fundo', 'Radiacao Cosmica de Fundo', 'CMB', 'CMBR', 'Radiação de Fundo'],
    promptAliases: ['radiação primordial', 'eco do big bang'],
    explanation: 'A Radiação Cósmica de Fundo é a luz mais antiga do universo, emitida na época da recombinação cerca de 380 mil anos após o Big Bang.',
    wikiUrl: 'https://pt.wikipedia.org/wiki/Radia%C3%A7%C3%A3o_c%C3%B3smica_de_fundo_em_micro-ondas'
  }
];

export function getBatchQuestions(): Tossup[] {
  return CHEMISTRY_PHYSICS_QUESTIONS.map(q => {
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
