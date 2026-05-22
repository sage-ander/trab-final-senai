const tipoMap = {cultural:'🎭 Cultural',show:'🎤 Show/Música',teatro:'🎪 Teatro/Dança',oficina:'📚 Oficina/Workshop',exposicao:'🖼️ Exposição/Museu',festival:'🎉 Festival/Feira',palestra:'🎓 Palestra/Debate',outro:'✨ Outro'};
const dataSel = JSON.parse(localStorage.getItem('eventosSelecionados') || 'null');
const container = document.getElementById('eventosContainer'), dataInfo = document.getElementById('dataInfo');

if (!dataSel) {
  container.innerHTML = '<div class="sem-eventos"><p>📭 Nenhum evento selecionado.</p></div>';
  dataInfo.textContent = '📅 Nenhum evento carregado';
} else {
  const {ano,mes,dia} = dataSel, chave = `${ano}_${mes}_${dia}`;
  const eventos = (JSON.parse(localStorage.getItem('todosEventos')||'{}')[chave] || []).sort((a,b)=>(a.horario||'').localeCompare(b.horario||''));
  const d = `${String(dia).padStart(2,'0')}/${String(mes+1).padStart(2,'0')}/${ano}`;
  dataInfo.textContent = `📅 ${d}`;
  localStorage.setItem('dataSelecionada', JSON.stringify({ano,mes,dia}));

  container.innerHTML = eventos.length ? eventos.map(e=>`<div class="evento-card" data-id="${e.id}"><div class="evento-titulo">${e.titulo}</div><div class="evento-tipo">${tipoMap[e.tipo]||'🎭 Cultural'}</div><div class="evento-horario">⏰ ${e.horario||'Horário não definido'}</div><div class="evento-horario">📆 ${e.dataInicio||d} até ${e.dataFim||d}</div><div style="margin-top:8px;display:flex;gap:8px;"><button class="btn btn-secondary btn-editar" data-id="${e.id}">✏️ Editar</button><button class="btn btn-danger btn-excluir" data-id="${e.id}">🗑️ Excluir</button></div></div>`).join('') : '<div class="sem-eventos"><p>📭 Nenhum evento registrado para esta data.</p></div>';

  document.getElementById('btnRegistrarAqui')?.addEventListener('click',()=>location.href='formulario.html');
  document.querySelectorAll('.btn-editar').forEach(btn=>btn.onclick=e=>{e.stopPropagation();const evento=eventos.find(x=>String(x.id)===btn.dataset.id);localStorage.setItem('eventoEditando',JSON.stringify(evento));location.href='formulario.html';});
  document.querySelectorAll('.btn-excluir').forEach(btn=>btn.onclick=e=>{e.stopPropagation();if(!confirm('Deseja realmente excluir este evento?'))return;const all=JSON.parse(localStorage.getItem('todosEventos')||'{}');all[chave]=(all[chave]||[]).filter(x=>String(x.id)!==btn.dataset.id);localStorage.setItem('todosEventos',JSON.stringify(all));location.reload();});
}

document.getElementById('btnVoltar').onclick = () => location.href='index.html';
document.getElementById('btnRegistrar').onclick = () => location.href='formulario.html';
