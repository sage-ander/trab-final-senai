const form = document.getElementById('eventoForm');
const titulo = document.getElementById('titulo');
const tipo = document.getElementById('tipo');
const horarioInicio = document.getElementById('horarioInicio');
const horarioFim = document.getElementById('horarioFim');
const descricao = document.getElementById('descricao');
const linkIngressos = document.getElementById('linkIngressos');
const dataInicioEvento = document.getElementById('dataInicioEvento');
const dataFimEvento = document.getElementById('dataFimEvento');
const erroDataFim = document.getElementById('errorDataFim');

const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado') || 'null');
const isAdmin = usuarioLogado?.u === 'admin' && usuarioLogado?.r === 'admin';

/* FUNÇÃO PRINCIPAL: Verifica se há dados guardados na chave 'eventoEditando' 
  do localStorage. Se sim, preenche automaticamente os inputs (Modo Edição).
*/
const editando = JSON.parse(localStorage.getItem('eventoEditando') || 'null');
if (editando) {
  document.querySelector('.card-header h2').textContent = '✏️ Editar Evento';
  titulo.value = editando.titulo || '';
  tipo.value = editando.tipo || 'cultural';
  horarioInicio.value = editando.horarioInicio || '';
  horarioFim.value = editando.horarioFim || '';
  descricao.value = editando.descricao || '';
  linkIngressos.value = editando.linkIngressos || '';
  dataInicioEvento.value = editando.dataInicioEvento || '';
  dataFimEvento.value = editando.dataFimEvento || '';
}

// --- EVENTO DE SUBMISSÃO (SALVAR/ATUALIZAR) ---

/* FUNÇÃO PRINCIPAL: Intercepta o envio do formulário, valida consistência de datas 
  e envia os dados via requisição POST (JSON) para a API PHP com travas de autenticação admin.
*/
form.addEventListener('submit', e => {
  e.preventDefault();

  // Validação lógica básica de datas
  const dInicio = new Date(dataInicioEvento.value + 'T00:00:00');
  const dFim = new Date(dataFimEvento.value + 'T00:00:00');

  const dataFimInvalida = dFim < dInicio;
  const horarioFimInvalido = dataInicioEvento.value === dataFimEvento.value && horarioFim.value && horarioFim.value < horarioInicio.value;

  if (dataFimInvalida || horarioFimInvalido) {
    return erroDataFim.style.display = 'block';
  }
  erroDataFim.style.display = 'none';

  const nomeDoEvento = titulo.value.trim();

  // Estrutura o objeto de acordo com as colunas da tabela MySQL
  const evento = {
    titulo: nomeDoEvento,
    tipo: tipo.value,
    horarioInicio: horarioInicio.value,
    horarioFim: horarioFim.value,
    descricao: descricao.value.trim(),
    linkIngressos: linkIngressos.value.trim(),
    dataInicioEvento: dataInicioEvento.value,
    dataFimEvento: dataFimEvento.value
  };

  // Se o formulário estiver em modo Edição, anexa o ID original para o PHP realizar um UPDATE
  if (editando) {
    evento.id = editando.id;
  }

  // Faz o pedido para o garçom PHP, injetando as credenciais salvas no login
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
    if (res.status === 403) throw new Error("Acesso negado! Apenas o administrador logado pode realizar esta ação.");
    if (!res.ok) throw new Error("Ocorreu um erro no servidor ao tentar salvar.");
    return res.json();
  })
  .then(dados => {
    if (dados.sucesso) {
      alert(`Evento "${nomeDoEvento}" salvo com sucesso no banco de dados!`);
      localStorage.removeItem('eventoEditando'); // Limpa o estado de edição
      window.location.href = 'index.html';
    } else {
      alert("Erro enviado pelo banco: " + dados.erro);
    }
  })
  .catch(err => alert(err.message));
});

document.getElementById('btnVoltar').onclick = () => {
  localStorage.removeItem('eventoEditando');
  window.location.href = 'index.html';
};