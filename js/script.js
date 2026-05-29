const hoje = new Date(),
  meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
let anoAtual = hoje.getFullYear(), mesAtual = hoje.getMonth();

const mesSelect = document.getElementById('mesSelect'),
  anoSelect = document.getElementById('anoSelect'),
  mesAnoTitulo = document.getElementById('mesAnoTitulo'),
  calendarioBody = document.getElementById('calendarioBody'),
  eventosProximosContainer = document.getElementById('eventosProximosContainer');

// --- AUTENTICAÇÃO E CONTROLE DE PERFIL ---
const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado') || 'null');
const isAdmin = usuarioLogado?.u === 'admin' && usuarioLogado?.r === 'admin';
const btnSair = document.getElementById('btnSair');
const loginBtn = document.getElementById('loginBtn');

if (btnSair) {
  if (isAdmin) {
    btnSair.style.display = 'inline-block';
    if (loginBtn) loginBtn.style.display = 'none';
    btnSair.onclick = () => {
      localStorage.removeItem('usuarioLogado');
      location.reload();
    };
  } else {
    btnSair.style.display = 'none';
    if (loginBtn) loginBtn.style.display = 'inline-block';
  }
}

// --- COMUNICAÇÃO COM O BANCO DE DADOS (API) ---
let todosEventosBanco = []; // Armazena temporariamente os dados vindos do MySQL

/* FUNÇÃO PRINCIPAL: Faz uma requisição GET ao servidor PHP, busca todos os 
  eventos cadastrados na tabela do MySQL e ordena o início do calendário.
*/
function carregarEventosDoServidor() {
  fetch('api/eventos.php')
    .then(res => res.json())
    .then(dados => {
      if (dados.erro) {
        console.log(dados.erro)
        console.error("Erro na API:", dados.erro);
        return;
      }
      todosEventosBanco = dados; // Salva a lista recebida
      desenhar(); // Renderiza visualmente o calendário na tela
    })
    .catch(err => console.error("Erro de conexão com o servidor:", err));
}

/* FUNÇÃO PRINCIPAL: Varre o array obtido do banco de dados e retorna apenas os 
  eventos que ocorrem ou passam pela data específica enviada por parâmetro.
*/
function getEventos(ano, mes, dia) {
  const mesFormatado = String(mes + 1).padStart(2, '0');
  const diaFormatado = String(dia).padStart(2, '0');
  const dataString = `${ano}-${mesFormatado}-${diaFormatado}`;

  return todosEventosBanco.filter(e => {
    return dataString >= e.dataInicioEvento && dataString <= e.dataFimEvento;
  });
}

/* FUNÇÃO PRINCIPAL: Mapeia e prepara todos os eventos recebidos do banco de dados 
  para alimentar a lista lateral de próximos eventos na interface principal.
*/
function getTodosEventos() {
  return todosEventosBanco.map(e => ({
    ...e,
    data: e.dataInicioEvento
  }));
}

// --- CONFIGURAÇÃO E MONTAGEM DA INTERFACE (DOM) ---

/* FUNÇÃO PRINCIPAL: Cria dinamicamente as opções do menu de seleção de anos 
  e adiciona ouvintes de evento para atualizar o calendário ao mudar o mês/ano.
*/
function inicializarControles() {
  for (let i = anoAtual - 5; i <= anoAtual + 5; i++) {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = i;
    if (i === anoAtual) opt.selected = true;
    anoSelect.appendChild(opt);
  }

  mesSelect.addEventListener('change', () => {
    mesAtual = parseInt(mesSelect.value);
    desenhar();
  });

  anoSelect.addEventListener('change', () => {
    anoAtual = parseInt(anoSelect.value);
    desenhar();
  });
}

/* FUNÇÃO PRINCIPAL: Grava no localStorage o dia em que o usuário clicou 
  para que a página de detalhes (eventos.html) saiba qual dia renderizar.
*/
function setSelecionados(ano, mes, dia, eventos) {
  localStorage.setItem('dataSelecionada', JSON.stringify({ ano, mes, dia }));
}

/* FUNÇÃO PRINCIPAL: Reconverte strings de data vindas do MySQL ("YYYY-MM-DD") 
  para exibição amigável no formato brasileiro ("DD/MM/YYYY").
*/
function formatarDataSalva(str) {
  if (!str) return '';
  const [ano, mes, dia] = str.split('-');
  return `${dia}/${mes}/${ano}`;
}

/* FUNÇÃO PRINCIPAL: Gera dinamicamente a tabela HTML do calendário, calculando os dias do 
  mês atual, preenchendo os espaços vazios e aplicando estilos nos dias que contêm eventos.
*/
function desenhar() {
  mesAnoTitulo.textContent = `${meses[mesAtual]} ${anoAtual}`;
  mesSelect.value = mesAtual;
  anoSelect.value = anoAtual;

  const primeiroDia = new Date(anoAtual, mesAtual, 1).getDay();
  const totalDias = new Date(anoAtual, mesAtual + 1, 0).getDate();

  calendarioBody.innerHTML = '';
  let linha = document.createElement('tr');

  for (let i = 0; i < primeiroDia; i++) {
    linha.appendChild(document.createElement('td'));
  }

  for (let dia = 1; dia <= totalDias; dia++) {
    if (linha.children.length === 7) {
      calendarioBody.appendChild(linha);
      linha = document.createElement('tr');
    }

    const td = document.createElement('td');
    td.className = 'dia-atual';
    
    const dDiv = document.createElement('div');
    dDiv.className = 'dia-numero';
    dDiv.textContent = dia;
    td.appendChild(dDiv);

    const listaEventos = getEventos(anoAtual, mesAtual, dia);
    if (listaEventos.length > 0) {
      td.classList.add('tem-evento');
      const eDiv = document.createElement('div');
      eDiv.className = 'evento-marcador';
      eDiv.textContent = `${listaEventos.length} evento${listaEventos.length > 1 ? 's' : ''}`;
      td.appendChild(eDiv);
    }

    td.onclick = () => verEventos(anoAtual, mesAtual, dia);
    linha.appendChild(td);
  }

  if (linha.children.length > 0) {
    while (linha.children.length < 7) {
      linha.appendChild(document.createElement('td'));
    }
    calendarioBody.appendChild(linha);
  }

  desenharListaEventos();
}

/* FUNÇÃO PRINCIPAL: Monta e renderiza a seção inferior/lateral de "Próximos Eventos", 
  mostrando de forma cronológica até 5 atividades que estão salvas no banco.
*/
function desenharListaEventos() {
  if (!eventosProximosContainer) return;
  const lista = getTodosEventos();

  eventosProximosContainer.innerHTML = `<div class=\"card-eventos\"><h3>📅 Próximos Eventos</h3>${(
    lista
      .slice(0, 5)
      .map(e => (
        `<div class="evento-item" onclick="verEventoPorData('${e.data}','${e.id}')">` +
        `<div class="evento-data">📅 ${formatarDataSalva(e.dataInicioEvento)} até ${formatarDataSalva(e.dataFimEvento)}</div>` +
        `<strong>${e.titulo}</strong>` +
        `<div>⏰ ${e.horarioInicio || 'Horário não definido'}${e.horarioFim ? ` até ${e.horarioFim}` : ''}</div>` +
        '</div>'
      ))
      .join('')
  ) || '<p>Nenhum evento próximo registrado.</p>'}</div>`;
}

// --- REDIRECIONAMENTOS DE TELAS ---
window.verEventos = (ano, mes, dia) => {
  setSelecionados(ano, mes, dia, getEventos(ano, mes, dia));
  location.href = 'eventos.html';
};

window.verEventoPorData = (data, id) => {
  const [ano, mes, dia] = data.split('-').map(Number);
  setSelecionados(ano, mes - 1, dia, []);
  location.href = 'eventos.html';
};

const registrarEventoBtn = document.getElementById('registrarEventoBtn');
if (registrarEventoBtn) {
  registrarEventoBtn.onclick = () => {
    localStorage.removeItem('eventoEditando'); // Garante que abre limpo para cadastro
    location.href = 'formulario.html';
  };
}

// --- INICIALIZAÇÃO AUTOMÁTICA DO SISTEMA ---
inicializarControles();
carregarEventosDoServidor(); // Primeiro busca na API, depois desenha tudo