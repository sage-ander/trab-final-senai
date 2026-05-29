const tipoMap = {
  cultural: '🎭 Cultural', show: '🎤 Show/Música', teatro: '🎪 Teatro/Dança',
  oficina: '📚 Oficina/Workshop', exposicao: '🖼️ Exposição/Museu',
  festival: '🎉 Festival/Feira', palestra: '🎓 Palestra/Debate', outro: '✨ Outro'
};

// --- CONTROLE DE SESSÃO LOCAL ---
const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado') || 'null');
const isAdmin = usuarioLogado?.u === 'admin' && usuarioLogado?.r === 'admin';

// --- BUSCA INICIAL DOS DETALHES DO DIA ---
const selecionados = JSON.parse(localStorage.getItem('dataSelecionada') || '{}');
const { ano, mes, dia } = selecionados;

/* FUNÇÃO PRINCIPAL: Faz a chamada GET para a API buscando todos os dados reais do MySQL, 
  filtra apenas as ocorrências do dia selecionado e engata o início da construção da tela.
*/
fetch('../api/eventos.php')
  .then(res => res.json())
  .then(todosEventos => {
    const mesFormatado = String(mes + 1).padStart(2, '0');
    const diaFormatado = String(dia).padStart(2, '0');
    const dataString = `${ano}-${mesFormatado}-${diaFormatado}`;

    // Filtra os eventos do banco que abrangem o dia atual selecionado
    const eventosDoDia = todosEventos.filter(e => {
      return dataString >= e.dataInicioEvento && dataString <= e.dataFimEvento;
    });

    // Inicia a renderização do HTML passando a lista filtrada
    initTela(eventosDoDia, `${diaFormatado}/${mesFormatado}/${ano}`, todosEventos);
  })
  .catch(err => console.error("Erro ao carregar detalhes do evento:", err));

/* FUNÇÃO PRINCIPAL: Cria os cards visuais na tela para cada evento do dia. Se o usuário for 
  administrador, injeta dinamicamente as escutas de cliques nos botões de Editar e Excluir.
*/
function initTela(eventos, dataTexto, todosGerais) {
  document.getElementById('dataInfo').textContent = `📅 Eventos de: ${dataTexto}`;
  const container = document.getElementById('eventosContainer');
  container.innerHTML = '';

  if (eventos.length === 0) {
    container.innerHTML = `
      <div class="sem-eventos">
        <p>📭 Nenhum evento programado para este dia.</p>
      </div>`;
    return;
  }

  eventos.forEach(ev => {
    const card = document.createElement('div');
    card.className = 'evento-card';
    card.dataset.id = ev.id;

    card.innerHTML = `
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
    `;
    container.appendChild(card);
  });

  // Ouvinte de clique nos cards para abrir o painel modal completo
  document.querySelectorAll('.evento-card').forEach(card => {
    card.onclick = () => {
      const ev = eventos.find(x => String(x.id) === String(card.dataset.id));
      if (ev) abrirModal(ev, dataTexto);
    };
  });

  // Tratativas exclusivas do perfil administrador
  if (isAdmin) {
    // Configura o botão de EDITAR (salva o objeto no localStorage e abre o formulário)
    document.querySelectorAll('.btn-editar').forEach(btn => btn.onclick = e => {
      e.stopPropagation();
      const ev = eventos.find(x => String(x.id) === btn.dataset.id);
      localStorage.setItem('eventoEditando', JSON.stringify(ev));
      location.href = 'formulario.html';
    });

    // Configura o botão de EXCLUIR (manda uma requisição HTTP DELETE com headers de validação para o PHP)
    document.querySelectorAll('.btn-excluir').forEach(btn => btn.onclick = e => {
      e.stopPropagation();
      if (!confirm('Deseja realmente deletar este evento permanentemente do banco de dados?')) return;

      const idEvento = btn.dataset.id;

      fetch(`../api/eventos.php?id=${idEvento}`, {
        method: 'DELETE',
        headers: {
          'X-Admin-User': usuarioLogado?.u || '',
          'X-Admin-Pass': usuarioLogado?.s || ''
        }
      })
      .then(res => {
        if (res.status === 403) throw new Error("Ação proibida! Credenciais inválidas.");
        return res.json();
      })
      .then(dados => {
        if (dados.sucesso) {
          alert("Evento removido com sucesso!");
          location.reload();
        } else {
          alert("Erro: " + dados.erro);
        }
      })
      .catch(err => alert(err.message));
    });
  }
}

// --- COMPONENTE MODAL (JANELA DE DETALHES COMPLETA) ---

/* FUNÇÃO PRINCIPAL: Preenche os spans do modal flutuante com as informações detalhadas 
  do evento clicado e altera o display CSS para torná-lo visível na interface.
*/
function abrirModal(ev, dTexto) {
  document.getElementById('modalTitulo').textContent = ev.titulo;
  document.getElementById('modalData').textContent = `${formatarDataModal(ev.dataInicioEvento)} até ${formatarDataModal(ev.dataFimEvento)}`;
  document.getElementById('modalHorario').textContent = `${ev.horarioInicio}${ev.horarioFim ? ` às ${ev.horarioFim}` : ''}`;
  document.getElementById('modalTipo').textContent = tipoMap[ev.tipo] || ev.tipo;

  const descLinha = document.getElementById('modalDescricaoLinha');
  if (ev.descricao) {
    document.getElementById('modalDescricao').textContent = ev.descricao;
    descLinha.style.display = 'block';
  } else descLinha.style.display = 'none';

  const ingLinha = document.getElementById('modalIngressosLinha');
  if (ev.linkIngressos) {
    document.getElementById('modalIngressos').innerHTML = `<a href="${ev.linkIngressos}" target="_blank" class="link-ingresso">Comprar / Ver Informações ↗</a>`;
    ingLinha.style.display = 'block';
  } else ingLinha.style.display = 'none';

  document.getElementById('eventoModal').style.display = 'flex';
}

function formatarDataModal(str) {
  if (!str) return '';
  const [a, m, d] = str.split('-');
  return `${d}/${m}/${a}`;
}

document.querySelector('.modal-fechar-btn').onclick = () => {
  document.getElementById('eventoModal').style.display = 'none';
};

document.getElementById('btnVoltar').onclick = () => location.href = 'index.html';
document.getElementById('btnRegistrar').onclick = () => {
  localStorage.removeItem('eventoEditando');
  location.href = 'formulario.html';
};