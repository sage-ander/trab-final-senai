// Captura a data e hora atual do sistema do usuário
const hoje = new Date();

// Array com os nomes dos meses para exibição textual no título do calendário
const meses = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

// Mapeamento dos elementos do DOM (HTML) que serão manipulados pelo JavaScript
const mesSelect = document.getElementById('mesSelect');
const anoSelect = document.getElementById('anoSelect');
const mesAnoTitulo = document.getElementById('mesAnoTitulo');
const calendarioBody = document.getElementById('calendarioBody');
const eventosProximosContainer = document.getElementById('eventosProximosContainer');
const btnSair = document.getElementById('btnSair');
const loginBtn = document.getElementById('loginBtn');
const registrarEventoBtn = document.getElementById('registrarEventoBtn');

// Recupera os dados do usuário autenticado salvos no navegador (LocalStorage)
const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado') || 'null');

// Define uma constante booleana (true/false) para saber se o usuário atual é um administrador
const isAdmin = usuarioLogado?.u === 'admin' && usuarioLogado?.r === 'admin';

// Define o ano e o mês iniciais do calendário baseados na data de hoje
let anoAtual = hoje.getFullYear();
let mesAtual = hoje.getMonth();

// Array global que armazenará todos os eventos vindos do banco de dados MySQL
let todosEventosBanco = [];

// Ouvintes de eventos (Event Listeners) para reagir às ações do usuário na tela
mesSelect.addEventListener('change', () => atualizarCalendario(Number(mesSelect.value), anoAtual));
anoSelect.addEventListener('change', () => atualizarCalendario(mesAtual, Number(anoSelect.value)));
calendarioBody.addEventListener('click', abrirDiaSelecionado);

if (eventosProximosContainer) eventosProximosContainer.addEventListener('click', abrirEventoProximo);
if (registrarEventoBtn) registrarEventoBtn.addEventListener('click', abrirFormularioNovo);
if (btnSair) btnSair.addEventListener('click', sair);
if (loginBtn) loginBtn.addEventListener('click', () => location.href = 'login.html');

// Execução das funções de inicialização assim que o script é carregado
configurarPerfil();
inicializarAnos();
carregarEventosDoServidor();

/**
 * Controla a exibição dos botões de login e logout na tela.
 * Se o usuário for administrador, exibe o botão "Sair" e esconde o "Login".
 * Se for um visitante comum, faz o inverso.
 */
function configurarPerfil() {
  if (!btnSair) return;
  btnSair.style.display = isAdmin ? 'inline-block' : 'none';
  if (loginBtn) loginBtn.style.display = isAdmin ? 'none' : 'inline-block';
}

/**
 * Preenche o elemento <select> de anos dinamicamente criando opções de 5 anos
 * para trás e 5 anos para frente a partir do ano atual. Também força o <select>
 * de meses a marcar visualmente o mês correto em que estamos hoje.
 */
function inicializarAnos() {
  // Seta o valor do select de meses para o mês atual de hoje (ex: 5 para Junho)
  if (mesSelect) {
    mesSelect.value = mesAtual;
  }

  // Gera as opções de anos no select e deixa o ano corrente pré-selecionado de forma dinâmica
  for (let ano = anoAtual - 5; ano <= anoAtual + 5; ano++) {
    const opt = document.createElement('option');
    opt.value = ano; 
    opt.textContent = ano;
    opt.selected = ano === anoAtual;
    anoSelect.appendChild(opt);
  }
}

/**
 * Faz uma requisição assíncrona (via Fetch API) para o arquivo PHP no servidor.
 * Busca a lista completa de eventos cadastrados no banco de dados, guarda no
 * array global e, in seguida, dispara a renderização do calendário na tela.
 */
function carregarEventosDoServidor() {
  // MUDADO: Caminho corrigido de '../api/eventos.php' para 'api/eventos.php'
  fetch('../api/eventos.php')
    .then(res => res.json())
    .then(dados => {
      if (dados.erro) return console.error('Erro na API:', dados.erro);
      todosEventosBanco = dados;
      desenharCalendario();
    })
    .catch(err => console.error('Erro de conexão com o servidor:', err));
}

/**
 * Atualiza as variáveis globais de controle de tempo sempre que o usuário
 * escolhe um mês ou ano diferente nos menus suspensos e redesenha a tela.
 */
function atualizarCalendario(mes, ano) {
  mesAtual = mes;
  anoAtual = ano;
  desenharCalendario();
}

/**
 * Função principal de renderização da interface. Ela calcula o primeiro dia do
 * mês, a quantidade total de dias, atualiza o título textual da página, limpa
 * o calendário anterior e desenha a nova tabela do mês dia por dia com as linhas correspondentes.
 */
function desenharCalendario() {
  // Atualiza o texto do título principal e sincroniza os valores visuais dos selects
  if (mesAnoTitulo) mesAnoTitulo.textContent = `${meses[mesAtual]} ${anoAtual}`;
  if (mesSelect) mesSelect.value = mesAtual;
  if (anoSelect) anoSelect.value = anoAtual;
  
  calendarioBody.innerHTML = '';

  // Descobre em qual dia da semana (0 a 6) o mês começa e quantos dias o mês possui no total
  const primeiroDia = new Date(anoAtual, mesAtual, 1).getDay();
  const totalDias = new Date(anoAtual, mesAtual + 1, 0).getDate();
  let linha = document.createElement('tr');

  // Preenche com células vazias os dias da semana que antecedem o dia 1 do mês
  for (let i = 0; i < primeiroDia; i++) linha.appendChild(document.createElement('td'));

  // Cria as células numeradas para cada dia do mês atual
  for (let dia = 1; dia <= totalDias; dia++) {
    if (linha.children.length === 7) {
      calendarioBody.appendChild(linha);
      linha = document.createElement('tr');
    }
    linha.appendChild(criarCelulaDia(dia));
  }

  // Completa a última semana do mês com células vazias caso ela não termine em um sábado
  while (linha.children.length && linha.children.length < 7) linha.appendChild(document.createElement('td'));
  if (linha.children.length) calendarioBody.appendChild(linha);

  // Renderiza a lista lateral/inferior de próximos eventos
  desenharListaEventos();
}

/**
 * Cria o elemento HTML (<td>) correspondente a um dia específico do calendário.
 * Verifica se existem eventos agendados para aquele dia e adiciona as marcações visuais
 * e classes CSS necessárias (como a quantidade de eventos do dia).
 */
function criarCelulaDia(dia) {
  const eventos = getEventos(anoAtual, mesAtual, dia);
  const td = document.createElement('td');
  td.className = 'dia-atual';
  td.dataset.dia = dia;
  
  let htmlConteudo = `<div class="dia-numero">${dia}</div>`;

  // MUDADO: Em vez de mostrar "X eventos", gera blocos laranjas empilhados com texto preto
  if (eventos.length) {
    td.classList.add('tem-evento');
    
    const blocosEventos = eventos.map(e => `
      <div class="evento-bloco-mini" 
           style="background-color: #ff9800; color: #000000; margin-top: 4px; padding: 2px 4px; border-radius: 3px; font-size: 11px; font-weight: bold; text-align: left; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; pointer-events: none;">
        ${e.titulo}
      </div>
    `).join('');
    
    htmlConteudo += blocosEventos;
  }

  td.innerHTML = htmlConteudo;
  return td;
}

/**
 * Monta o painel lateral ou container informativo exibindo os 5 primeiros eventos
 * mais próximos retornados do banco. Se não houver nenhum evento, exibe uma mensagem amigável.
 */
function desenharListaEventos() {
  if (!eventosProximosContainer) return;

  const itens = todosEventosBanco.slice(0, 5).map(e => `
    <div class="evento-item" data-data="${e.dataInicioEvento}">
      <div class="evento-data">📅 ${formatarData(e.dataInicioEvento)} até ${formatarData(e.dataFimEvento)}</div>
      <strong>${e.titulo}</strong>
      <div>⏰ ${e.horarioInicio || 'Horário não definido'}${e.horarioFim ? ` até ${e.horarioFim}` : ''}</div>
    </div>
  `).join('') || '<p>Nenhum evento próximo registrado.</p>';

  eventosProximosContainer.innerHTML = `<div class="card-eventos"><h3>📅 Próximos Eventos</h3>${itens}</div>`;
}

/**
 * Trata o clique do usuário em cima de um dia da tabela do calendário. Ele captura o número
 * do dia clicado, salva essa data completa temporariamente no LocalStorage do navegador e
 * redireciona o usuário para a página de gerenciamento de eventos detalhados (`eventos.html`).
 */
function abrirDiaSelecionado(e) {
  const celula = e.target.closest('td[data-dia]');
  if (!celula) return;
  salvarDataSelecionada(anoAtual, mesAtual, Number(celula.dataset.dia));
  location.href = 'eventos.html';
}

/**
 * Trata o clique do usuário em um item da lista de "Próximos Eventos". Ele lê a data
 * associada ao evento, realiza o ajuste do mês (subtraindo 1 pois o JS conta de 0 a 11),
 * salva no LocalStorage e redireciona para ver o dia detalhado na página de eventos.
 */
function abrirEventoProximo(e) {
  const item = e.target.closest('.evento-item');
  if (!item) return;

  const [ano, mes, dia] = item.dataset.data.split('-').map(Number);
  salvarDataSelecionada(ano, mes - 1, dia);
  location.href = 'eventos.html';
}

/**
 * Redireciona o usuário para a página do formulário de criação. Limpa qualquer
 * rastro de evento antigo em edição no LocalStorage para garantir que a tela abra vazia.
 */
function abrirFormularioNovo() {
  localStorage.removeItem('eventoEditando');
  location.href = 'formulario.html';
}

/**
 * Realiza o logout do usuário administrador. Remove as credenciais guardadas no
 * LocalStorage do navegador e atualiza a página corrente para reajustar a interface.
 */
function sair() {
  if (!isAdmin) return;
  localStorage.removeItem('usuarioLogado');
  location.reload();
}

/**
 * Filtra a lista global de eventos vindos do banco para descobrir quais deles estão ocorrendo
 * na data informada por parâmetro. Suporta eventos que duram múltiplos dias (compara por intervalo).
 */
function getEventos(ano, mes, dia) {
  // Ajusta o mês somando 1 e forçando 2 dígitos (Ex: mês 5 vira "06")
  const mesFormatado = String(mes + 1).padStart(2, '0');
  const diaFormatado = String(dia).padStart(2, '0');
  
  // Monta a string no formato exato do banco: YYYY-MM-DD (ex: 2026-06-09)
  const dataChave = `${ano}-${mesFormatado}-${diaFormatado}`;
  
  return todosEventosBanco.filter(e => dataChave >= e.dataInicioEvento && dataChave <= e.dataFimEvento);
}

/**
 * Grava um objeto JSON no LocalStorage contendo o ano, mês e dia selecionados, permitindo que
 * outras páginas do sistema saibam qual data o usuário estava visualizando no calendário.
 */
function salvarDataSelecionada(ano, mes, dia) {
  localStorage.setItem('dataSelecionada', JSON.stringify({ ano, mes, dia }));
}

/**
 * Converte strings de data no formato do banco de dados (AAAA-MM-DD) para o padrão
 * visual de leitura brasileiro (DD/MM/AAAA) para exibir corretamente na interface do usuário.
 */
function formatarData(str) {
  if (!str) return '';
  const [ano, mes, dia] = str.split('-');
  return `${dia}/${mes}/${ano}`;
}