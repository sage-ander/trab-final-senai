const tipoMap = {
  cultural: '🎭 Cultural',
  show: '🎤 Show/Música',
  teatro: '🎪 Teatro/Dança',
  oficina: '📚 Oficina/Workshop',
  exposicao: '🖼️ Exposição/Museu',
  festival: '🎉 Festival/Feira',
  palestra: '🎓 Palestra/Debate',
  outro: '✨ Outro'
};

const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado') || 'null');
const isAdmin = usuarioLogado?.u === 'admin' && usuarioLogado?.r === 'admin';
const { ano, mes, dia } = JSON.parse(localStorage.getItem('dataSelecionada') || '{}');
const dataInfo = document.getElementById('dataInfo');
const eventosContainer = document.getElementById('eventosContainer');
const eventoModal = document.getElementById('eventoModal');
const btnVoltar = document.getElementById('btnVoltar');
const btnRegistrar = document.getElementById('btnRegistrar');
let eventosDoDia = [];
let dataTexto = '';

eventosContainer.addEventListener('click', handleEventoClick);
document.querySelector('.modal-fechar-btn').addEventListener('click', fecharModal);
btnVoltar.addEventListener('click', () => location.href = 'index.html');
btnRegistrar.addEventListener('click', abrirFormularioNovo);

/*
=========
CARREGAMENTO
=========
*/
fetch('../api/eventos.php')
  .then(res => res.json())
  .then(todosEventos => {
    const dataSelecionada = montarData(ano, mes, dia);
    dataTexto = `${String(dia).padStart(2, '0')}/${String(mes + 1).padStart(2, '0')}/${ano}`;
    eventosDoDia = todosEventos.filter(e => dataSelecionada >= e.dataInicioEvento && dataSelecionada <= e.dataFimEvento);
    renderizarEventos();
  })
  .catch(err => console.error('Erro ao carregar detalhes do evento:', err));

/*
=========
RENDERIZAÇÃO
=========
*/
function renderizarEventos() {
  dataInfo.textContent = `📅 Eventos de: ${dataTexto}`;

  if (!eventosDoDia.length) {
    eventosContainer.innerHTML = '<div class="sem-eventos"><p>📭 Nenhum evento programado para este dia.</p></div>';
    return;
  }

  eventosContainer.innerHTML = eventosDoDia.map(ev => `
    <div class="evento-card" data-id="${ev.id}">
      <div class="evento-card-header">
        <span class="badge-tipo">${tipoMap[ev.tipo] || '✨ Outro'}</span>
        <h3>${ev.titulo}</h3>
      </div>
      <div class="evento-card-body">
        <p>⏰ <strong>Horário:</strong> ${ev.horarioInicio}${ev.horarioFim ? ` até ${ev.horarioFim}` : ''}</p>
        ${ev.descricao ? `<p class="descricao-curta">${ev.descricao.substring(0, 80)}...</p>` : ''}
      </div>
      <div class="evento-card-actions">
        <button class="btn-acao btn-editar" data-id="${ev.id}">✏️ Editar</button>
        <button class="btn-acao btn-excluir" data-id="${ev.id}">❌ Excluir</button>
      </div>
    </div>
  `).join('');
}

function abrirModal(ev) {
  document.getElementById('modalTitulo').textContent = ev.titulo;
  document.getElementById('modalData').textContent = `${formatarData(ev.dataInicioEvento)} até ${formatarData(ev.dataFimEvento)}`;
  document.getElementById('modalHorario').textContent = `${ev.horarioInicio}${ev.horarioFim ? ` às ${ev.horarioFim}` : ''}`;
  document.getElementById('modalTipo').textContent = tipoMap[ev.tipo] || ev.tipo;
  preencherLinhaOpcional('modalDescricaoLinha', 'modalDescricao', ev.descricao);
  preencherLinhaOpcional('modalIngressosLinha', 'modalIngressos', ev.linkIngressos && `<a href="${ev.linkIngressos}" target="_blank" class="link-ingresso">Comprar / Ver Informações ↗</a>`, true);
  eventoModal.style.display = 'flex';
}

function preencherLinhaOpcional(linhaId, valorId, valor, html = false) {
  const linha = document.getElementById(linhaId);
  const campo = document.getElementById(valorId);
  linha.style.display = valor ? 'block' : 'none';
  if (valor) campo[html ? 'innerHTML' : 'textContent'] = valor;
}

function fecharModal() {
  eventoModal.style.display = 'none';
}

/*
=========
AÇÕES
=========
*/
function handleEventoClick(e) {
  const card = e.target.closest('.evento-card');
  if (!card) return;

  const ev = eventosDoDia.find(item => String(item.id) === String(card.dataset.id));
  if (!ev) return;

  if (isAdmin && e.target.closest('.btn-editar')) return editarEvento(ev);
  if (isAdmin && e.target.closest('.btn-excluir')) return excluirEvento(ev.id);
  abrirModal(ev);
}

function editarEvento(ev) {
  if (!isAdmin) return;
  localStorage.setItem('eventoEditando', JSON.stringify(ev));
  location.href = 'formulario.html';
}

function excluirEvento(id) {
  if (!isAdmin || !confirm('Deseja realmente deletar este evento permanentemente do banco de dados?')) return;

  fetch(`../api/eventos.php?id=${id}`, {
    method: 'DELETE',
    headers: {
      'X-Admin-User': usuarioLogado?.u || '',
      'X-Admin-Pass': usuarioLogado?.s || ''
    }
  })
    .then(res => {
      if (res.status === 403) throw new Error('Ação proibida! Credenciais inválidas.');
      return res.json();
    })
    .then(dados => {
      if (!dados.sucesso) return alert('Erro: ' + dados.erro);
      alert('Evento removido com sucesso!');
      location.reload();
    })
    .catch(err => alert(err.message));
}

function abrirFormularioNovo() {
  localStorage.removeItem('eventoEditando');
  location.href = 'formulario.html';
}

/*
=========
UTILITÁRIOS
=========
*/
function montarData(ano, mes, dia) {
  return `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
}

function formatarData(str) {
  if (!str) return '';
  const [a, m, d] = str.split('-');
  return `${d}/${m}/${a}`;
}
