// ============================================================
//                        EVENTOS.JS 
// ============================================================

function carregarEventos() {

    const eventosData = localStorage.getItem('eventosSelecionados');

    const container = document.getElementById('eventosContainer');
    const dataInfo = document.getElementById('dataInfo');

    if (!container || !dataInfo) return;

    if (!eventosData) {
        container.innerHTML = `
            <div class="sem-eventos">
                <p>📭 Nenhum evento selecionado.</p>
                <p style="margin-top: 1rem;">
                    Volte ao calendário e clique em um evento para ver os detalhes.
                </p>
            </div>
        `;
        dataInfo.innerHTML = '📅 Nenhum evento carregado';
        return;
    }

    try {
        const { ano, mes, dia } = JSON.parse(eventosData);

        const todosEventosStorage = localStorage.getItem('todosEventos');
        let eventosAtualizados = [];

        if (todosEventosStorage) {
            const todosEventos = JSON.parse(todosEventosStorage);
            const chave = `${ano}_${mes}_${dia}`;

            eventosAtualizados = todosEventos[chave] || [];
        }

        const nomesMeses = [
            "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
            "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
        ];

        const dataFormatada =
            `${String(dia).padStart(2,'0')}/${String(mes + 1).padStart(2,'0')}/${ano}`;

        dataInfo.innerHTML = `📅 ${dataFormatada} - ${nomesMeses[mes]}`;

        if (!eventosAtualizados.length) {

            container.innerHTML = `
                <div class="sem-eventos">
                    <p>📭 Nenhum evento registrado para esta data.</p>

                    <button id="btnRegistrarAqui" class="btn-registrar" style="margin-top: 1rem;">
                        📝 Registrar Evento
                    </button>
                </div>
            `;

            document.getElementById('btnRegistrarAqui')?.addEventListener('click', () => {
                localStorage.setItem('dataSelecionada', JSON.stringify({ ano, mes, dia }));
                window.location.href = 'formulario.html';
            });

            return;
        }

        // 🔥 salva apenas para navegação (não é fonte de verdade)
        localStorage.setItem('dataSelecionada', JSON.stringify({ ano, mes, dia }));

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

        const eventosOrdenados = [...eventosAtualizados].sort((a, b) =>
            (a.horario || '00:00').localeCompare(b.horario || '00:00')
        );

        let html = '';

        eventosOrdenados.forEach(evento => {

            const desc = evento.descricao || '';

            html += `
                <div class="evento-card" data-id="${evento.id}">
                    <div class="evento-titulo">${escapeHtml(evento.titulo)}</div>
                    <div class="evento-tipo">${tipoMap[evento.tipo] || '🎭 Cultural'}</div>
                    <div class="evento-horario">⏰ ${escapeHtml(evento.horario || 'Horário não definido')}</div>
                    <div class="evento-descricao-resumida">
                        ${escapeHtml(desc).substring(0, 100)}${desc.length > 100 ? '...' : ''}
                    </div>
                    <div class="evento-horario">📆 ${escapeHtml(evento.dataInicio || dataFormatada)} até ${escapeHtml(evento.dataFim || dataFormatada)}</div>
                    <div style="margin-top:8px;display:flex;gap:8px;"><button class="btn btn-secondary btn-editar" data-id="${evento.id}">✏️ Editar</button><button class="btn btn-danger btn-excluir" data-id="${evento.id}">🗑️ Excluir</button></div>
                </div>
            `;
        });

        container.innerHTML = html;

        document.querySelectorAll('.evento-card').forEach(card => {

            card.addEventListener('click', () => {

                const id = card.dataset.id;

                const evento = eventosOrdenados.find(
                    e => String(e.id) === String(id)
                );

                if (!evento) return;

                const dataFormatada =
                    `${String(dia).padStart(2,'0')}/${String(mes + 1).padStart(2,'0')}/${ano}`;

                abrirModal({
                    titulo: evento.titulo,
                    data: dataFormatada,
                    horario: evento.horario,
                    tipo: tipoMap[evento.tipo] || '🎭 Cultural',
                    descricao: evento.descricao,
                    linkIngressos: evento.linkIngressos,
                    imagemUrl: evento.imagemUrl
                });
            });
        });

        document.querySelectorAll('.btn-editar').forEach(btn=>{btn.addEventListener('click',(ev)=>{ev.stopPropagation();const id=btn.dataset.id;const evento=eventosOrdenados.find(e=>String(e.id)===String(id));if(!evento)return;localStorage.setItem('eventoEditando',JSON.stringify(evento));localStorage.setItem('dataSelecionada',JSON.stringify({ano:evento.ano,mes:evento.mes,dia:evento.dia,id:evento.id}));window.location.href='formulario.html';});});
        document.querySelectorAll('.btn-excluir').forEach(btn=>{btn.addEventListener('click',(ev)=>{ev.stopPropagation();const id=btn.dataset.id;if(!confirm('Deseja realmente excluir este evento?')) return;const all=JSON.parse(localStorage.getItem('todosEventos')||'{}');const key=`${ano}_${mes}_${dia}`;all[key]=(all[key]||[]).filter(e=>String(e.id)!==String(id));localStorage.setItem('todosEventos',JSON.stringify(all));carregarEventos();});});

    } catch (e) {
        console.error('Erro ao carregar eventos:', e);

        container.innerHTML = `
            <div class="sem-eventos">
                <p>⚠️ Erro ao carregar os eventos.</p>
                <p style="margin-top: 1rem;">Tente novamente ou volte ao calendário.</p>
            </div>
        `;
    }
}


// ============================================================
// MODAL
// ============================================================

function abrirModal(dados) {

    document.getElementById('modalTitulo').textContent = dados.titulo || '';
    document.getElementById('modalData').textContent = dados.data || '';
    document.getElementById('modalHorario').textContent = dados.horario || 'Horário não definido';
    document.getElementById('modalTipo').textContent = dados.tipo || '';

    const descricaoLinha = document.getElementById('modalDescricaoLinha');
    const descricaoEl = document.getElementById('modalDescricao');

    if (dados.descricao && dados.descricao.trim()) {
        descricaoEl.innerHTML = escapeHtml(dados.descricao).replace(/\n/g, '<br>');
        descricaoLinha.style.display = 'flex';
    } else {
        descricaoLinha.style.display = 'none';
    }

    const ingressosLinha = document.getElementById('modalIngressosLinha');
    const ingressosEl = document.getElementById('modalIngressos');

    if (dados.linkIngressos && dados.linkIngressos.trim()) {
        ingressosEl.innerHTML = `
            <a href="${dados.linkIngressos}" target="_blank" rel="noopener noreferrer">
                ${dados.linkIngressos}
            </a>
        `;
        ingressosLinha.style.display = 'flex';
    } else {
        ingressosLinha.style.display = 'none';
    }

    const imagemLinha = document.getElementById('modalImagemLinha');
    const imagemEl = document.getElementById('modalImagem');

    if (dados.imagemUrl && dados.imagemUrl.trim()) {
        imagemEl.innerHTML = `
            <img src="${dados.imagemUrl}" class="modal-imagem"
                 onerror="this.style.display='none'">
        `;
        imagemLinha.style.display = 'flex';
    } else {
        imagemLinha.style.display = 'none';
    }

    document.getElementById('eventoModal').style.display = 'flex';
}

function fecharModal() {
    document.getElementById('eventoModal').style.display = 'none';
}


// ============================================================
// HELPERS
// ============================================================

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function voltarCalendario() {
    window.location.href = 'index.html';
}

function registrarNovoEvento() {

    const eventosData = localStorage.getItem('eventosSelecionados');

    if (eventosData) {
        try {
            const { ano, mes, dia } = JSON.parse(eventosData);

            localStorage.setItem(
                'dataSelecionada',
                JSON.stringify({ ano, mes, dia })
            );

        } catch {}
    }

    window.location.href = 'formulario.html';
}


// ============================================================
// INIT 
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

    carregarEventos();

    document.getElementById('btnVoltar')?.addEventListener('click', voltarCalendario);
    document.getElementById('btnRegistrar')?.addEventListener('click', registrarNovoEvento);

    document.querySelector('.modal-fechar')?.addEventListener('click', fecharModal);
    document.querySelector('.modal-fechar-btn')?.addEventListener('click', fecharModal);

    const modal = document.getElementById('eventoModal');

    modal?.addEventListener('click', (e) => {
        if (e.target === modal) fecharModal();
    });

    
});