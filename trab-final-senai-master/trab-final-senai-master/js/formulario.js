 const form = document.getElementById('eventoForm');
const campos = {
  titulo: document.getElementById('titulo'),
  tipo: document.getElementById('tipo'),
  horarioInicio: document.getElementById('horarioInicio'),
  horarioFim: document.getElementById('horarioFim'),
  descricao: document.getElementById('descricao'),
  linkIngressos: document.getElementById('linkIngressos'),
  dataInicioEvento: document.getElementById('dataInicioEvento'),
  dataFimEvento: document.getElementById('dataFimEvento')
};
const erroDataFim = document.getElementById('errorDataFim');
const btnVoltar = document.getElementById('btnVoltar');
const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado') || 'null');
const editando = JSON.parse(localStorage.getItem('eventoEditando') || 'null');

form.addEventListener('submit', salvarEvento);
btnVoltar.addEventListener('click', voltarInicio);

/*
=========
INICIALIZAÇÃO
=========
*/
if (editando) preencherFormulario();

/*
=========
FORMULÁRIO
=========
*/
function preencherFormulario() {
  document.querySelector('.card-header h2').textContent = '✏️ Editar Evento';
  Object.keys(campos).forEach(nome => {
    campos[nome].value = editando[nome] || (nome === 'tipo' ? 'cultural' : '');
  });
}

function salvarEvento(e) {
  e.preventDefault();

  if (!datasValidas()) {
    erroDataFim.style.display = 'block';
    return;
  }

  erroDataFim.style.display = 'none';
  const evento = montarEvento();

  fetch('../api/eventos.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Admin-User': usuarioLogado?.u || '',
      'X-Admin-Pass': usuarioLogado?.s || ''
    },
    body: JSON.stringify(evento)
  })
    .then(res => {
      if (res.status === 403) throw new Error('Acesso negado! Apenas o administrador logado pode realizar esta ação.');
      if (!res.ok) throw new Error('Ocorreu um erro no servidor ao tentar salvar.');
      return res.json();
    })
    .then(dados => {
      if (!dados.sucesso) return alert('Erro enviado pelo banco: ' + dados.erro);
      alert(`Evento "${evento.titulo}" salvo com sucesso no banco de dados!`);
      localStorage.removeItem('eventoEditando');
      window.location.href = 'index.html';
    })
    .catch(err => alert(err.message));
}

function montarEvento() {
  const evento = {
    titulo: campos.titulo.value.trim(),
    tipo: campos.tipo.value,
    horarioInicio: campos.horarioInicio.value,
    horarioFim: campos.horarioFim.value,
    descricao: campos.descricao.value.trim(),
    linkIngressos: campos.linkIngressos.value.trim(),
    dataInicioEvento: campos.dataInicioEvento.value,
    dataFimEvento: campos.dataFimEvento.value
  };

  if (editando) evento.id = editando.id;
  return evento;
}

function datasValidas() {
  const inicio = new Date(campos.dataInicioEvento.value + 'T00:00:00');
  const fim = new Date(campos.dataFimEvento.value + 'T00:00:00');
  const horarioFimAntes = campos.dataInicioEvento.value === campos.dataFimEvento.value
    && campos.horarioFim.value
    && campos.horarioFim.value < campos.horarioInicio.value;

  return fim >= inicio && !horarioFimAntes;
}

function voltarInicio() {
  localStorage.removeItem('eventoEditando');
  window.location.href = 'index.html';
}
