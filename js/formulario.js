const form = document.getElementById('eventoForm');
const titulo = document.getElementById('titulo');
const tipo = document.getElementById('tipo');
<<<<<<< HEAD
const horarioInicio = document.getElementById('horarioInicio');
const horarioFim = document.getElementById('horarioFim');
const descricao = document.getElementById('descricao');
const linkIngressos = document.getElementById('linkIngressos');
const dataInicioEvento = document.getElementById('dataInicioEvento');
const dataFimEvento = document.getElementById('dataFimEvento');
const erroDataFim = document.getElementById('errorDataFim');
const imagem = document.getElementById('imagem');
const dropArea = document.getElementById('dropArea');
const btnProcurar = document.getElementById('btnProcurar');
const btnAlterar = document.getElementById('btnAlterar');
const btnRemover = document.getElementById('btnRemover');
const nomeArquivo = document.getElementById('nomeArquivo');
const previewContainer = document.getElementById('previewContainer');
const previewImg = document.getElementById('previewImg');
const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado') || 'null');
const isAdmin = usuarioLogado?.u === 'admin' && usuarioLogado?.r === 'admin';
let imagemUrl = '';
let imagemNome = '';
const criarDataLocal = valor => {
  const [ano, mes, dia] = valor.split('-').map(Number);
  return new Date(ano, mes - 1, dia);
};
const chaveDaData = data => `${data.getFullYear()}_${data.getMonth()}_${data.getDate()}`;
const removerEventoDeTodasAsDatas = (todos, id) => {
  Object.keys(todos).forEach(chave => {
    todos[chave] = (todos[chave] || []).filter(x => String(x.id) !== String(id));

    if (!todos[chave].length) {
      delete todos[chave];
    }
  });
};
const adicionarEventoNoPeriodo = (todos, evento) => {
  const inicio = criarDataLocal(evento.dataInicioEvento);
  const fim = criarDataLocal(evento.dataFimEvento);

  for (const data = new Date(inicio); data <= fim; data.setDate(data.getDate() + 1)) {
    const chave = chaveDaData(data);
    const eventoNoDia = {
      ...evento,
      ano: data.getFullYear(),
      mes: data.getMonth(),
      dia: data.getDate()
    };

    todos[chave] = [
      ...(todos[chave] || []).filter(x => String(x.id) !== String(evento.id)),
      eventoNoDia
    ];
  }
};
const atualizarPreviewImagem = () => {
  nomeArquivo.textContent = imagemNome || 'Nenhum arquivo selecionado.';
  previewImg.src = imagemUrl || '';
  previewContainer.classList.toggle('active', Boolean(imagemUrl));
};
const carregarImagem = arquivo => {
  if (!arquivo || !arquivo.type.startsWith('image/')) return;

  const reader = new FileReader();
  reader.onload = () => {
    imagemUrl = reader.result;
    imagemNome = arquivo.name;
    atualizarPreviewImagem();
  };
  reader.readAsDataURL(arquivo);
};

=======
const horario = document.getElementById('horario');
const descricao = document.getElementById('descricao');
const linkIngressos = document.getElementById('linkIngressos');
const dataEvento = document.getElementById('dataEvento');
const dataInicio = document.getElementById('dataInicio');
const dataFim = document.getElementById('dataFim');
const erroDataFim = document.getElementById('errorDataFim');

>>>>>>> 49b53805ee6ed8232fa735f62524a7913a1cde56
document.getElementById('btnVoltar').onclick = () => location.href = 'index.html';
const baseData = JSON.parse(
  localStorage.getItem('dataSelecionada') || localStorage.getItem('eventosSelecionados') || 'null'
);

if (baseData) {
<<<<<<< HEAD
  const dataSelecionada = `${baseData.ano}-${String(baseData.mes + 1).padStart(2, '0')}-${String(baseData.dia).padStart(2, '0')}`;
  dataInicioEvento.value = dataSelecionada;
  dataFimEvento.value = dataSelecionada;
}

let editando = JSON.parse(localStorage.getItem('eventoEditando') || 'null');
if (editando && !isAdmin) {
  localStorage.removeItem('eventoEditando');
  editando = null;
  location.href = 'eventos.html';
}

if (editando) {
  titulo.value = editando.titulo || '';
  tipo.value = editando.tipo || 'cultural';
  horarioInicio.value = editando.horarioInicio || editando.horario || '';
  horarioFim.value = editando.horarioFim || '';
  descricao.value = editando.descricao || '';
  linkIngressos.value = editando.linkIngressos || '';
  dataInicioEvento.value = editando.dataInicioEvento || editando.dataInicio || '';
  dataFimEvento.value = editando.dataFimEvento || editando.dataFim || '';
  imagemUrl = editando.imagemUrl || '';
  imagemNome = editando.imagemNome || (imagemUrl ? 'Folder cadastrado' : '');
  atualizarPreviewImagem();
}

btnProcurar.onclick = () => imagem.click();
btnAlterar.onclick = () => imagem.click();
btnRemover.onclick = () => {
  imagem.value = '';
  imagemUrl = '';
  imagemNome = '';
  atualizarPreviewImagem();
};
imagem.onchange = () => carregarImagem(imagem.files[0]);
dropArea.onclick = e => {
  if (e.target === btnProcurar) return;
  imagem.click();
};
['dragenter', 'dragover'].forEach(evento => {
  dropArea.addEventListener(evento, e => {
    e.preventDefault();
    dropArea.classList.add('drag-over');
  });
});
['dragleave', 'drop'].forEach(evento => {
  dropArea.addEventListener(evento, e => {
    e.preventDefault();
    dropArea.classList.remove('drag-over');
  });
});
dropArea.addEventListener('drop', e => carregarImagem(e.dataTransfer.files[0]));

form.addEventListener('submit', e => {
  e.preventDefault();

  const dataFimInvalida = dataFimEvento.value < dataInicioEvento.value;
  const horarioFimInvalido = dataFimEvento.value === dataInicioEvento.value &&
    horarioInicio.value &&
    horarioFim.value &&
    horarioFim.value < horarioInicio.value;

  if (dataFimInvalida || horarioFimInvalido) {
=======
  dataEvento.value = `${baseData.ano}-${String(baseData.mes + 1).padStart(2, '0')}-${String(baseData.dia).padStart(2, '0')}`;
}

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

  if (dataFim.value < dataInicio.value) {
>>>>>>> 49b53805ee6ed8232fa735f62524a7913a1cde56
    return erroDataFim.style.display = 'block';
  }

  erroDataFim.style.display = 'none';

<<<<<<< HEAD
  const [ano, mes, dia] = (dataInicioEvento.value || new Date().toISOString().slice(0, 10)).split('-').map(Number);
=======
  const [ano, mes, dia] = (dataEvento.value || new Date().toISOString().slice(0, 10)).split('-').map(Number);
>>>>>>> 49b53805ee6ed8232fa735f62524a7913a1cde56
  const evento = {
    id: editando?.id || Date.now(),
    ano,
    mes: mes - 1,
    dia,
    titulo: titulo.value.trim(),
    tipo: tipo.value,
<<<<<<< HEAD
    horarioInicio: horarioInicio.value,
    horarioFim: horarioFim.value,
    descricao: descricao.value.trim(),
    linkIngressos: linkIngressos.value.trim(),
    dataInicioEvento: dataInicioEvento.value,
    dataFimEvento: dataFimEvento.value,
    imagemUrl,
    imagemNome
=======
    horario: horario.value,
    descricao: descricao.value.trim(),
    linkIngressos: linkIngressos.value.trim(),
    dataInicio: dataInicio.value,
    dataFim: dataFim.value
>>>>>>> 49b53805ee6ed8232fa735f62524a7913a1cde56
  };
  const todos = JSON.parse(localStorage.getItem('todosEventos') || '{}');

  if (editando) {
<<<<<<< HEAD
    removerEventoDeTodasAsDatas(todos, editando.id);
  }

  adicionarEventoNoPeriodo(todos, evento);
=======
    const chaveAntiga = `${editando.ano}_${editando.mes}_${editando.dia}`;
    todos[chaveAntiga] = (todos[chaveAntiga] || []).filter(x => String(x.id) !== String(editando.id));
  }

  const chave = `${evento.ano}_${evento.mes}_${evento.dia}`;
  todos[chave] = [...(todos[chave] || []), evento];
>>>>>>> 49b53805ee6ed8232fa735f62524a7913a1cde56
  localStorage.setItem('todosEventos', JSON.stringify(todos));
  localStorage.setItem(
    'dataSelecionada',
    JSON.stringify({ ano: evento.ano, mes: evento.mes, dia: evento.dia })
  );
  localStorage.removeItem('eventoEditando');
  location.href = 'index.html';
});
