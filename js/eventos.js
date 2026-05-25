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

<<<<<<< HEAD
const formatarData = data => {
  if (!data) return '';

  if (data.includes('-')) {
    const partes = data.split('-');

    if (partes[0].length === 4) {
      const [ano, mes, dia] = partes;
      return `${dia}-${mes}-${ano}`;
    }

    const [dia, mes, ano] = partes;
    return `${dia.padStart(2, '0')}-${mes.padStart(2, '0')}-${ano}`;
  }

  if (data.includes('/')) {
    const [dia, mes, ano] = data.split('/');
    return `${dia.padStart(2, '0')}-${mes.padStart(2, '0')}-${ano}`;
  }

  return data;
};
const dataParaComparacao = data => {
  if (!data) return '';

  if (data.includes('-')) {
    const partes = data.split('-');

    if (partes[0].length === 4) return data;

    const [dia, mes, ano] = partes;
    return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
  }

  if (data.includes('/')) {
    const [dia, mes, ano] = data.split('/');
    return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
  }

  return data;
};

const dataSel = JSON.parse(localStorage.getItem('eventosSelecionados') || 'null');
const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado') || 'null');
const isAdmin = usuarioLogado?.u === 'admin' && usuarioLogado?.r === 'admin';
document.body.classList.toggle('perfil-admin', isAdmin);
const removerEventoDeTodasAsDatas = (todos, id) => {
  Object.keys(todos).forEach(chave => {
    todos[chave] = (todos[chave] || []).filter(x => String(x.id) !== String(id));

    if (!todos[chave].length) {
      delete todos[chave];
    }
  });
};
const getEventosDaData = (todos, ano, mes, dia) => {
  const chave = `${ano}_${mes}_${dia}`;
  const dataAtual = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
  const eventos = [...(todos[chave] || [])];
  const ids = new Set(eventos.map(e => String(e.id)));

  Object.values(todos).flat().forEach(e => {
    const inicio = dataParaComparacao(e.dataInicioEvento || e.dataInicio);
    const fim = dataParaComparacao(e.dataFimEvento || e.dataFim || e.dataInicioEvento || e.dataInicio);

    if (inicio && fim && dataAtual >= inicio && dataAtual <= fim && !ids.has(String(e.id))) {
      eventos.push(e);
      ids.add(String(e.id));
    }
  });

  return eventos;
};
const textoHorario = evento => (
  `${evento.horarioInicio || evento.horario || 'Horário não definido'}${evento.horarioFim ? ` até ${evento.horarioFim}` : ''}`
);
const textoPeriodo = (evento, dataPadrao) => (
  `${formatarData(evento.dataInicioEvento || evento.dataInicio || dataPadrao)} até ${formatarData(evento.dataFimEvento || evento.dataFim || dataPadrao)}`
);
const abrirModal = (evento, dataPadrao) => {
  document.getElementById('modalTitulo').textContent = evento.titulo || '';
  document.getElementById('modalData').textContent = textoPeriodo(evento, dataPadrao);
  document.getElementById('modalHorario').textContent = textoHorario(evento);
  document.getElementById('modalTipo').textContent = tipoMap[evento.tipo] || '🎭 Cultural';

  const descricaoLinha = document.getElementById('modalDescricaoLinha');
  document.getElementById('modalDescricao').textContent = evento.descricao || '';
  descricaoLinha.style.display = evento.descricao ? 'flex' : 'none';

  const ingressosLinha = document.getElementById('modalIngressosLinha');
  const ingressos = document.getElementById('modalIngressos');
  ingressosLinha.style.display = evento.linkIngressos ? 'flex' : 'none';
  ingressos.innerHTML = evento.linkIngressos
    ? `<a class="modal-link" href="${evento.linkIngressos}" target="_blank" rel="noopener noreferrer">${evento.linkIngressos}</a>`
    : '';

  const imagemLinha = document.getElementById('modalImagemLinha');
  const imagem = document.getElementById('modalImagem');
  imagemLinha.style.display = evento.imagemUrl ? 'flex' : 'none';
  imagem.innerHTML = evento.imagemUrl
    ? `<img src="${evento.imagemUrl}" class="modal-imagem" alt="Folder de divulgação">`
    : '';

  document.getElementById('eventoModal').style.display = 'flex';
};
const fecharModal = () => {
  document.getElementById('eventoModal').style.display = 'none';
};
const container = document.getElementById('eventosContainer'),
  dataInfo = document.getElementById('dataInfo');

if (!dataSel) {
  container.innerHTML = '<div class="sem-eventos"><p>📭 Nenhum evento selecionado.</p></div>';
  dataInfo.textContent = '📅 Nenhum evento carregado';
} else {
  const { ano, mes, dia } = dataSel,
    chave = `${ano}_${mes}_${dia}`;
  const todosEventos = JSON.parse(localStorage.getItem('todosEventos') || '{}');
  const eventos = getEventosDaData(todosEventos, ano, mes, dia)
    .sort((a, b) => (a.horarioInicio || a.horario || '').localeCompare(b.horarioInicio || b.horario || ''));
  const d = `${String(dia).padStart(2, '0')}-${String(mes + 1).padStart(2, '0')}-${ano}`;

  dataInfo.textContent = `📅 ${d}`;
  localStorage.setItem('dataSelecionada', JSON.stringify({ ano, mes, dia }));

  container.innerHTML = eventos.length
    ? eventos
      .map(e => (
        `<div class="evento-card" data-id="${e.id}">` +
        `<div class="evento-titulo">${e.titulo}</div>` +
        `<div class="evento-tipo">${tipoMap[e.tipo] || '🎭 Cultural'}</div>` +
        `<div class="evento-horario">⏰ ${textoHorario(e)}</div>` +
        `<div class="evento-horario">📆 ${textoPeriodo(e, d)}</div>` +
        (isAdmin ? '<div style="margin-top:8px;display:flex;gap:8px;">' : '') +
        (isAdmin ? `<button class="btn btn-secondary btn-editar" data-id="${e.id}">✏️ Editar</button>` : '') +
        (isAdmin ? `<button class="btn btn-danger btn-excluir" data-id="${e.id}">🗑️ Excluir</button>` : '') +
        (isAdmin ? '</div>' : '') +
        '</div>'
      ))
      .join('')
    : '<div class="sem-eventos"><p>📭 Nenhum evento registrado para esta data.</p></div>';

  document.getElementById('btnRegistrarAqui')?.addEventListener(
    'click',
    () => location.href = 'formulario.html'
  );

  document.querySelectorAll('.evento-card').forEach(card => {
    card.onclick = () => {
      const evento = eventos.find(x => String(x.id) === String(card.dataset.id));
      if (evento) abrirModal(evento, d);
    };
  });

  if (isAdmin) {
    document.querySelectorAll('.btn-editar').forEach(btn => btn.onclick = e => {
      e.stopPropagation();

      const evento = eventos.find(x => String(x.id) === btn.dataset.id);
      localStorage.setItem('eventoEditando', JSON.stringify(evento));
      location.href = 'formulario.html';
    });

    document.querySelectorAll('.btn-excluir').forEach(btn => btn.onclick = e => {
      e.stopPropagation();

      if (!confirm('Deseja realmente excluir este evento?')) return;

      const all = JSON.parse(localStorage.getItem('todosEventos') || '{}');
      removerEventoDeTodasAsDatas(all, btn.dataset.id);
      localStorage.setItem('todosEventos', JSON.stringify(all));
      location.reload();
    });
  }
}

document.getElementById('btnVoltar').onclick = () => location.href = 'index.html';
document.getElementById('btnRegistrar').onclick = () => location.href = 'formulario.html';
document.querySelector('.modal-fechar').onclick = fecharModal;
document.querySelector('.modal-fechar-btn').onclick = fecharModal;
document.getElementById('eventoModal').onclick = e => {
  if (e.target.id === 'eventoModal') fecharModal();
};
=======
const dataSel = JSON.parse(localStorage.getItem('eventosSelecionados') || 'null');
const container = document.getElementById('eventosContainer'),
  dataInfo = document.getElementById('dataInfo');

if (!dataSel) {
  container.innerHTML = '<div class="sem-eventos"><p>📭 Nenhum evento selecionado.</p></div>';
  dataInfo.textContent = '📅 Nenhum evento carregado';
} else {
  const { ano, mes, dia } = dataSel,
    chave = `${ano}_${mes}_${dia}`;
  const eventos = (JSON.parse(localStorage.getItem('todosEventos') || '{}')[chave] || [])
    .sort((a, b) => (a.horario || '').localeCompare(b.horario || ''));
  const d = `${String(dia).padStart(2, '0')}/${String(mes + 1).padStart(2, '0')}/${ano}`;

  dataInfo.textContent = `📅 ${d}`;
  localStorage.setItem('dataSelecionada', JSON.stringify({ ano, mes, dia }));

  container.innerHTML = eventos.length
    ? eventos
      .map(e => (
        `<div class="evento-card" data-id="${e.id}">` +
        `<div class="evento-titulo">${e.titulo}</div>` +
        `<div class="evento-tipo">${tipoMap[e.tipo] || '🎭 Cultural'}</div>` +
        `<div class="evento-horario">⏰ ${e.horario || 'Horário não definido'}</div>` +
        `<div class="evento-horario">📆 ${e.dataInicio || d} até ${e.dataFim || d}</div>` +
        '<div style="margin-top:8px;display:flex;gap:8px;">' +
        `<button class="btn btn-secondary btn-editar" data-id="${e.id}">✏️ Editar</button>` +
        `<button class="btn btn-danger btn-excluir" data-id="${e.id}">🗑️ Excluir</button>` +
        '</div>' +
        '</div>'
      ))
      .join('')
    : '<div class="sem-eventos"><p>📭 Nenhum evento registrado para esta data.</p></div>';

  document.getElementById('btnRegistrarAqui')?.addEventListener(
    'click',
    () => location.href = 'formulario.html'
  );

  document.querySelectorAll('.btn-editar').forEach(btn => btn.onclick = e => {
    e.stopPropagation();

    const evento = eventos.find(x => String(x.id) === btn.dataset.id);
    localStorage.setItem('eventoEditando', JSON.stringify(evento));
    location.href = 'formulario.html';
  });

  document.querySelectorAll('.btn-excluir').forEach(btn => btn.onclick = e => {
    e.stopPropagation();

    if (!confirm('Deseja realmente excluir este evento?')) return;

    const all = JSON.parse(localStorage.getItem('todosEventos') || '{}');
    all[chave] = (all[chave] || []).filter(x => String(x.id) !== btn.dataset.id);
    localStorage.setItem('todosEventos', JSON.stringify(all));
    location.reload();
  });
}

document.getElementById('btnVoltar').onclick = () => location.href = 'index.html';
document.getElementById('btnRegistrar').onclick = () => location.href = 'formulario.html';
>>>>>>> 49b53805ee6ed8232fa735f62524a7913a1cde56
