const hoje = new Date();

let anoAtual = hoje.getFullYear();
let mesAtual = hoje.getMonth();

const mesSelect = document.getElementById('mesSelect');
const anoSelect = document.getElementById('anoSelect');
const mesAnoTitulo = document.getElementById('mesAnoTitulo');
const calendarioBody = document.getElementById('calendarioBody');
const eventosProximosContainer = document.getElementById('eventosProximosContainer');

const nomesMeses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril',
    'Maio', 'Junho', 'Julho', 'Agosto',
    'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

function init() {
    const user=JSON.parse(localStorage.getItem('usuarioLogado')||'null');
    if(!user){ window.location.href='login.html'; return; }

    // EVENTOS DE TESTE - remover depois
    if (!localStorage.getItem('todosEventos')) {
        const a = anoAtual, m = mesAtual;
        const dados = {};
        dados[`${a}_${m}_21`] = [{ id: 1, ano: a, mes: m, dia: 21, titulo: "Evento Teste", tipo: "cultural", horario: "19:00", descricao: "Teste.", linkIngressos: "", imagemUrl: "" }];
        dados[`${a}_${m}_23`] = [{ id: 2, ano: a, mes: m, dia: 23, titulo: "Show de Jazz", tipo: "show", horario: "21:00", descricao: "Jazz.", linkIngressos: "", imagemUrl: "" }];
        localStorage.setItem('todosEventos', JSON.stringify(dados));
        console.log("✅ Eventos de teste criados");
    }


    mesSelect.value = mesAtual;

    const anoAtualVal = new Date().getFullYear();
    anoSelect.innerHTML = '';
    for (let a = anoAtualVal ; a <= anoAtualVal + 10; a++) {
        const opt = document.createElement('option');
        opt.value = a;
        opt.textContent = a;
        if (a === anoAtual) opt.selected = true;
        anoSelect.appendChild(opt);
    }

    atualizarTitulo();
    renderizarCalendario();
    carregarProximosEventos();

    mesSelect.addEventListener('change', () => {
        mesAtual = parseInt(mesSelect.value);
        atualizarTitulo();
        renderizarCalendario();
        carregarProximosEventos();
    });

    anoSelect.addEventListener('change', () => {
        anoAtual = parseInt(anoSelect.value);
        atualizarTitulo();
        renderizarCalendario();
        carregarProximosEventos();
    });

    document.getElementById('logoutBtn')?.addEventListener('click',()=>{localStorage.removeItem('usuarioLogado');window.location.href='login.html';});

    iniciarCarrossel();

    document.getElementById('registrarEventoBtn')
        ?.addEventListener('click', () => {
            window.location.href = 'formulario.html';
        });
}


function atualizarTitulo() {
    mesAnoTitulo.textContent =
        `${nomesMeses[mesAtual].toLowerCase()} ${anoAtual}`;
}


function getEventosPorData(ano, mes, dia) {

    const todosEventos = localStorage.getItem('todosEventos');
    if (!todosEventos) return [];

    const eventosObj = JSON.parse(todosEventos);
    const chave = `${ano}_${mes}_${dia}`;

    return eventosObj[chave] || [];
}

// ============================================================
// CALENDÁRIO
// ============================================================

function renderizarCalendario() {

    const primeiroDia = new Date(anoAtual, mesAtual, 1);
    const ultimoDia = new Date(anoAtual, mesAtual + 1, 0);

    const diaInicioSemana = primeiroDia.getDay();
    const totalDias = ultimoDia.getDate();

    const dataMesAnterior = new Date(anoAtual, mesAtual, 0);
    const totalDiasMesAnterior = dataMesAnterior.getDate();

    let html = '';
    let diaCount = 0;

    // Dias do mês anterior
    for (let i = diaInicioSemana - 1; i >= 0; i--) {
        const dia = totalDiasMesAnterior - i;

        html += `
            <td class="other-month">
                <div class="day-number">${dia}</div>
            </td>
        `;

        diaCount++;
    }

    const hojeLocal = new Date();

    const ehMesAtual =
        hojeLocal.getFullYear() === anoAtual &&
        hojeLocal.getMonth() === mesAtual;

    // Dias do mês atual
    for (let dia = 1; dia <= totalDias; dia++) {

        const eventos = getEventosPorData(anoAtual, mesAtual, dia);
        const temEvento = eventos.length > 0;

        const isToday =
            ehMesAtual && hojeLocal.getDate() === dia;

        let eventosHtml = '';

        if (temEvento) {

            eventos.slice(0, 2).forEach(evento => {
                eventosHtml += `
                    <div class="event-badge"
                        onclick="event.stopPropagation(); verEventos(${anoAtual}, ${mesAtual}, ${dia})">
                        ${evento.titulo.substring(0, 12)}
                    </div>
                `;
            });

            if (eventos.length > 2) {
                eventosHtml += `
                    <div class="event-more"
                        onclick="event.stopPropagation(); verEventos(${anoAtual}, ${mesAtual}, ${dia})">
                        +${eventos.length - 2} outros
                    </div>
                `;
            }
        }

        html += `
            <td class="${isToday ? 'today' : ''}"
                onclick="verEventos(${anoAtual}, ${mesAtual}, ${dia})">

                <div class="day-number">${dia}</div>
                ${eventosHtml}
            </td>
        `;

        diaCount++;

        if (diaCount % 7 === 0 && dia !== totalDias) {
            html += `</tr><tr>`;
        }
    }

    // Dias do próximo mês
    const diasRestantes = 7 - (diaCount % 7);

    if (diasRestantes < 7) {
        for (let dia = 1; dia <= diasRestantes; dia++) {
            html += `
                <td class="other-month">
                    <div class="day-number">${dia}</div>
                </td>
            `;
        }
    }

    calendarioBody.innerHTML = `<tr>${html}</tr>`;
}

// ============================================================
// ABRIR EVENTOS DO DIA
// ============================================================

function verEventos(ano, mes, dia) {

    const eventos = getEventosPorData(ano, mes, dia);

    localStorage.setItem('eventosSelecionados', JSON.stringify({
        ano,
        mes,
        dia,
        eventos,
        eventoUnico: false
    }));

    window.location.href = 'eventos.html';
}

function verEvento(ano, mes, dia) {
    verEventos(ano, mes, dia);
}

// ============================================================
// PRÓXIMOS EVENTOS
// ============================================================

function carregarProximosEventos() {

    const todosEventos = localStorage.getItem('todosEventos');

    if (!todosEventos) {
        eventosProximosContainer.innerHTML = `
            <div class="card-eventos">
                <h3>📅 Próximos Eventos</h3>
                <p>Nenhum evento próximo registrado.</p>
            </div>
        `;
        return;
    }

    const eventosObj = JSON.parse(todosEventos);
    let proximosEventos = [];

    for (let i = 0; i < 30; i++) {

        const data = new Date(anoAtual, mesAtual, 1 + i);
        if (data.getMonth() > mesAtual + 1) break;

        const ano = data.getFullYear();
        const mes = data.getMonth();
        const dia = data.getDate();

        const chave = `${ano}_${mes}_${dia}`;

        if (eventosObj[chave]) {
            eventosObj[chave].forEach(evento => {
                proximosEventos.push({
                    ...evento,
                    data: `${dia}/${mes + 1}/${ano}`
                });
            });
        }
    }

    proximosEventos.sort((a, b) => {

        const [dA, mA, aA] = a.data.split('/');
        const [dB, mB, aB] = b.data.split('/');

        return new Date(aA, mA - 1, dA) -
               new Date(aB, mB - 1, dB);
    });

    const eventosExibir = proximosEventos.slice(0, 5);

    if (eventosExibir.length === 0) {
        eventosProximosContainer.innerHTML = `
            <div class="card-eventos">
                <h3>📅 Próximos Eventos</h3>
                <p>Nenhum evento próximo registrado.</p>
            </div>
        `;
        return;
    }

    let html = `<div class="card-eventos"><h3>📅 Próximos Eventos</h3>`;

    eventosExibir.forEach(evento => {

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

        html += `
            <div class="evento-item"
                onclick="verEventoPorData('${evento.data}', '${evento.id}')">

                <div class="evento-data">📅 ${evento.data}</div>
                <strong>${evento.titulo}</strong>
                <div>⏰ ${evento.horario} | ${tipoMap[evento.tipo] || '🎭 Cultural'}</div>
            </div>
        `;
    });

    html += `</div>`;
    eventosProximosContainer.innerHTML = html;
}

// ============================================================
// VER EVENTO ESPECÍFICO
// ============================================================

function verEventoPorData(dataStr, eventoId) {

    const [dia, mes, ano] = dataStr.split('/');

    const eventos = getEventosPorData(
        parseInt(ano),
        parseInt(mes) - 1,
        parseInt(dia)
    );

    const eventoEspecifico = eventos.filter(
        e => e.id.toString() === eventoId.toString()
    );

    localStorage.setItem('eventosSelecionados', JSON.stringify({
        ano: parseInt(ano),
        mes: parseInt(mes) - 1,
        dia: parseInt(dia),
        eventos: eventoEspecifico,
        eventoUnico: true
    }));

    window.location.href = 'eventos.html';
}

// ============================================================
// GLOBAL
// ============================================================

window.verEventos = verEventos;
window.verEvento = verEvento;
window.verEventoPorData = verEventoPorData;

// ============================================================
// START
// ============================================================

init();

window.addEventListener('pageshow', () => {
    renderizarCalendario();
    carregarProximosEventos();
});
function iniciarCarrossel(){const slides=[...document.querySelectorAll('.carousel-slide')];if(!slides.length)return;let i=0;const show=n=>slides.forEach((s,idx)=>s.classList.toggle('active',idx===n));document.getElementById('nextSlide')?.addEventListener('click',()=>{i=(i+1)%slides.length;show(i)});document.getElementById('prevSlide')?.addEventListener('click',()=>{i=(i-1+slides.length)%slides.length;show(i)});setInterval(()=>{i=(i+1)%slides.length;show(i)},4000);}
