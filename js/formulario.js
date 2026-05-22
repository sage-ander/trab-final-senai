const form = document.getElementById('eventoForm');
const titulo = document.getElementById('titulo');
const tipo = document.getElementById('tipo');
const horario = document.getElementById('horario');
const descricao = document.getElementById('descricao');
const linkIngressos = document.getElementById('linkIngressos');
const dataEvento = document.getElementById('dataEvento');
const dataInicio = document.getElementById('dataInicio');
const dataFim = document.getElementById('dataFim');
const erroDataFim = document.getElementById('errorDataFim');

document.getElementById('btnVoltar').onclick = () => location.href = 'index.html';
const baseData = JSON.parse(localStorage.getItem('dataSelecionada') || localStorage.getItem('eventosSelecionados') || 'null');
if (baseData) dataEvento.value = `${baseData.ano}-${String(baseData.mes+1).padStart(2,'0')}-${String(baseData.dia).padStart(2,'0')}`;

const editando = JSON.parse(localStorage.getItem('eventoEditando') || 'null');
if (editando) {
  titulo.value = editando.titulo || '';
  tipo.value = editando.tipo || 'cultural';
  horario.value = editando.horario || '';
  descricao.value = editando.descricao || '';
  linkIngressos.value = editando.linkIngressos || '';
  dataInicio.value = editando.dataInicio || '';
  dataFim.value = editando.dataFim || '';
}

form.addEventListener('submit', e => {
  e.preventDefault();
  if (dataFim.value < dataInicio.value) return erroDataFim.style.display = 'block';
  erroDataFim.style.display = 'none';

  const [ano, mes, dia] = (dataEvento.value || new Date().toISOString().slice(0,10)).split('-').map(Number);
  const evento = { id: editando?.id || Date.now(), ano, mes: mes-1, dia, titulo: titulo.value.trim(), tipo: tipo.value, horario: horario.value, descricao: descricao.value.trim(), linkIngressos: linkIngressos.value.trim(), dataInicio: dataInicio.value, dataFim: dataFim.value };
  const todos = JSON.parse(localStorage.getItem('todosEventos') || '{}');

  if (editando) {
    const chaveAntiga = `${editando.ano}_${editando.mes}_${editando.dia}`;
    todos[chaveAntiga] = (todos[chaveAntiga] || []).filter(x => String(x.id) !== String(editando.id));
  }

  const chave = `${evento.ano}_${evento.mes}_${evento.dia}`;
  todos[chave] = [...(todos[chave] || []), evento];
  localStorage.setItem('todosEventos', JSON.stringify(todos));
  localStorage.setItem('dataSelecionada', JSON.stringify({ ano: evento.ano, mes: evento.mes, dia: evento.dia }));
  localStorage.removeItem('eventoEditando');
  location.href = 'index.html';
});
