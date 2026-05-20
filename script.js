// 1. Declaração de variáveis
var chaveStorage    = 'eventosCulturais';
var formulario      = document.getElementById('formEvento');
var listaEventos    = document.getElementById('listaEventos');
var filtroCategoria = document.getElementById('filtroCategoria');
var filtroData      = document.getElementById('filtroData');
var campoNome       = document.getElementById('nome');
var campoData       = document.getElementById('data');
var campoHorario    = document.getElementById('horario');
var campoLocal      = document.getElementById('local');
var campoCategoria  = document.getElementById('categoria');
var campoDescricao  = document.getElementById('descricao');

var eventos = [];

// 2. Lista inicial de eventos
var eventosIniciais = [
  {
    nome: 'Sarau na Praça',
    data: '2026-05-22',
    horario: '19:00',
    local: 'Praça Central',
    categoria: 'Música',
    descricao: 'Apresentações musicais de artistas locais.'
  },
  {
    nome: 'Peça Infantil',
    data: '2026-05-24',
    horario: '16:00',
    local: 'Teatro Municipal',
    categoria: 'Teatro',
    descricao: 'Espetáculo infantil para toda a família.'
  },
  {
    nome: 'Feira de Artesanato',
    data: '2026-05-25',
    horario: '10:00',
    local: 'Centro Cultural',
    categoria: 'Feira',
    descricao: 'Exposição e venda de artesanato da cidade.'
  }
];

// 3. Event listeners
formulario.addEventListener('submit', adicionarEvento);
filtroCategoria.addEventListener('change', filtrarEventos);
filtroData.addEventListener('change', filtrarEventos);

// Inicialização
carregarEventos();
mostrarEventos(eventos);

// 4. Funções básicas
function carregarEventos() {
  var dados = sessionStorage.getItem(chaveStorage);

  if (dados) {
    eventos = JSON.parse(dados);
  } else {
    eventos = eventosIniciais;
    salvarEventos();
  }
}

function salvarEventos() {
  sessionStorage.setItem(chaveStorage, JSON.stringify(eventos));
}

function mostrarEventos(lista) {
  listaEventos.innerHTML = '';

  if (lista.length === 0) {
    listaEventos.innerHTML = '<p class="text-muted">Nenhum evento encontrado.</p>';
    return;
  }

  for (var i = 0; i < lista.length; i++) {
    var evento = lista[i];

    listaEventos.innerHTML +=
      '<div class="col-md-6 col-lg-4">' +
        '<div class="card card-evento">' +
          '<div class="card-body">' +
            '<h3 class="h5">' + evento.nome + '</h3>' +
            '<p class="mb-1"><strong>Data:</strong> ' + evento.data + '</p>' +
            '<p class="mb-1"><strong>Horário:</strong> ' + evento.horario + '</p>' +
            '<p class="mb-1"><strong>Local:</strong> ' + evento.local + '</p>' +
            '<p class="mb-1"><strong>Categoria:</strong> ' + evento.categoria + '</p>' +
            '<p class="mb-3"><strong>Descrição:</strong> ' + evento.descricao + '</p>' +
            '<button class="btn btn-sm btn-danger" onclick="excluirEvento(' + i + ')">Excluir</button>' +
          '</div>' +
        '</div>' +
      '</div>';
  }
}

function adicionarEvento(e) {
  e.preventDefault();

  var novoEvento = {
    nome: campoNome.value,
    data: campoData.value,
    horario: campoHorario.value,
    local: campoLocal.value,
    categoria: campoCategoria.value,
    descricao: campoDescricao.value
  };

  eventos.push(novoEvento);
  salvarEventos();
  filtrarEventos();
  formulario.reset();
}

function excluirEvento(indice) {
  eventos.splice(indice, 1);
  salvarEventos();
  filtrarEventos();
}

function filtrarEventos() {
  var categoriaEscolhida = filtroCategoria.value;
  var dataEscolhida = filtroData.value;
  var listaFiltrada = [];

  for (var i = 0; i < eventos.length; i++) {
    var evento = eventos[i];
    var categoriaOk = categoriaEscolhida === 'Todos' || evento.categoria === categoriaEscolhida;
    var dataOk = dataEscolhida === '' || evento.data === dataEscolhida;

    if (categoriaOk && dataOk) {
      listaFiltrada.push(evento);
    }
  }

  mostrarEventos(listaFiltrada);
}
