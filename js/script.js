const hoje = new Date(),
  meses = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro'
  ];
let anoAtual = hoje.getFullYear(),
  mesAtual = hoje.getMonth();
const mesSelect = document.getElementById('mesSelect'),
  anoSelect = document.getElementById('anoSelect'),
  mesAnoTitulo = document.getElementById('mesAnoTitulo'),
  calendarioBody = document.getElementById('calendarioBody'),
  eventosProximosContainer = document.getElementById('eventosProximosContainer');

<<<<<<< HEAD
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
const getEventos = (a, m, d) => {
  const eventosObj = JSON.parse(localStorage.getItem('todosEventos') || '{}');
  const chave = `${a}_${m}_${d}`;
  const dataAtual = `${a}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const eventos = [...(eventosObj[chave] || [])];
  const ids = new Set(eventos.map(e => String(e.id)));

  Object.values(eventosObj).flat().forEach(e => {
    const inicio = dataParaComparacao(e.dataInicioEvento || e.dataInicio);
    const fim = dataParaComparacao(e.dataFimEvento || e.dataFim || e.dataInicioEvento || e.dataInicio);

    if (inicio && fim && dataAtual >= inicio && dataAtual <= fim && !ids.has(String(e.id))) {
      eventos.push(e);
      ids.add(String(e.id));
    }
  });

  return eventos;
};
const formatarDataProximos = (dia, mes, ano) => (
  `${String(dia).padStart(2, '0')}-${String(mes).padStart(2, '0')}-${ano}`
);
const formatarDataSalva = data => {
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
const setSelecionados = (ano, mes, dia, eventos, eventoUnico = false) => localStorage.setItem(
  'eventosSelecionados',
  JSON.stringify({ ano, mes, dia, eventos, eventoUnico })
);

mesSelect.value = mesAtual;
for (let a = hoje.getFullYear(); a <= hoje.getFullYear() + 10; a++) {
  anoSelect.innerHTML += `<option value="${a}" ${a === anoAtual ? 'selected' : ''}>${a}</option>`;
}

function desenhar() {
  mesAnoTitulo.textContent = `${meses[mesAtual].toLowerCase()} ${anoAtual}`;
  const inicio = new Date(anoAtual, mesAtual, 1).getDay(),
    total = new Date(anoAtual, mesAtual + 1, 0).getDate(),
    prevTotal = new Date(anoAtual, mesAtual, 0).getDate();
  let html = '',
    count = 0;

  for (let i = inicio - 1; i >= 0; i--) {
    html += `<td class="other-month"><div class="day-number">${prevTotal - i}</div></td>`;
    count++;
  }

  const h = new Date(),
    isMes = h.getFullYear() === anoAtual && h.getMonth() === mesAtual;

  for (let dia = 1; dia <= total; dia++) {
    const eventos = getEventos(anoAtual, mesAtual, dia)
      .sort((a, b) => (a.horarioInicio || a.horario || '').localeCompare(b.horarioInicio || b.horario || ''));
    const badges = eventos.length
      ? '<div class="event-list">' + eventos
      .map(e => (
        `<div class="event-badge" onclick="event.stopPropagation();verEventos(${anoAtual},${mesAtual},${dia})">` +
        `${e.titulo.substring(0, 12)}</div>`
      ))
      .join('') + '</div>'
      : '';

=======
if (!JSON.parse(localStorage.getItem('usuarioLogado') || 'null')) {
  location.href = 'login.html';
}

const getEventos = (a, m, d) => (
  JSON.parse(localStorage.getItem('todosEventos') || '{}')[`${a}_${m}_${d}`] || []
);
const setSelecionados = (ano, mes, dia, eventos, eventoUnico = false) => localStorage.setItem(
  'eventosSelecionados',
  JSON.stringify({ ano, mes, dia, eventos, eventoUnico })
);

mesSelect.value = mesAtual;
for (let a = hoje.getFullYear(); a <= hoje.getFullYear() + 10; a++) {
  anoSelect.innerHTML += `<option value="${a}" ${a === anoAtual ? 'selected' : ''}>${a}</option>`;
}

function desenhar() {
  mesAnoTitulo.textContent = `${meses[mesAtual].toLowerCase()} ${anoAtual}`;
  const inicio = new Date(anoAtual, mesAtual, 1).getDay(),
    total = new Date(anoAtual, mesAtual + 1, 0).getDate(),
    prevTotal = new Date(anoAtual, mesAtual, 0).getDate();
  let html = '',
    count = 0;

  for (let i = inicio - 1; i >= 0; i--) {
    html += `<td class="other-month"><div class="day-number">${prevTotal - i}</div></td>`;
    count++;
  }

  const h = new Date(),
    isMes = h.getFullYear() === anoAtual && h.getMonth() === mesAtual;

  for (let dia = 1; dia <= total; dia++) {
    const eventos = getEventos(anoAtual, mesAtual, dia);
    const badges = eventos
      .slice(0, 2)
      .map(e => (
        `<div class="event-badge" onclick="event.stopPropagation();verEventos(${anoAtual},${mesAtual},${dia})">` +
        `${e.titulo.substring(0, 12)}</div>`
      ))
      .join('') + (
        eventos.length > 2
          ? (
            `<div class="event-more" onclick="event.stopPropagation();verEventos(${anoAtual},${mesAtual},${dia})">` +
            `+${eventos.length - 2} outros</div>`
          )
          : ''
      );

>>>>>>> 49b53805ee6ed8232fa735f62524a7913a1cde56
    html += (
      `<td class="${isMes && h.getDate() === dia ? 'today' : ''}" onclick="verEventos(${anoAtual},${mesAtual},${dia})">` +
      `<div class="day-number">${dia}</div>` +
      `${badges}</td>`
    );

    if (++count % 7 === 0 && dia !== total) {
      html += '</tr><tr>';
    }
  }

  const faltam = 7 - (count % 7);
<<<<<<< HEAD

  if (faltam < 7) {
    for (let dia = 1; dia <= faltam; dia++) {
      html += `<td class="other-month"><div class="day-number">${dia}</div></td>`;
    }
  }

  calendarioBody.innerHTML = `<tr>${html}</tr>`;

  const eventosObj = JSON.parse(localStorage.getItem('todosEventos') || '{}');
  let lista = [];
  const eventosAdicionados = new Set();

  for (let i = 0; i < 30; i++) {
    const d = new Date(anoAtual, mesAtual, 1 + i);

    if (d.getMonth() > mesAtual + 1) break;

    const chave = `${d.getFullYear()}_${d.getMonth()}_${d.getDate()}`;
    (eventosObj[chave] || []).forEach(e => {
      if (eventosAdicionados.has(String(e.id))) return;

      eventosAdicionados.add(String(e.id));
      lista.push({
        ...e,
        data: formatarDataProximos(d.getDate(), d.getMonth() + 1, d.getFullYear()),
        dataOrdenacao: e.dataInicioEvento || `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      });
    });
  }

  lista.sort((a, b) => (
    new Date(a.dataOrdenacao) - new Date(b.dataOrdenacao)
=======

  if (faltam < 7) {
    for (let dia = 1; dia <= faltam; dia++) {
      html += `<td class="other-month"><div class="day-number">${dia}</div></td>`;
    }
  }

  calendarioBody.innerHTML = `<tr>${html}</tr>`;

  const eventosObj = JSON.parse(localStorage.getItem('todosEventos') || '{}');
  let lista = [];

  for (let i = 0; i < 30; i++) {
    const d = new Date(anoAtual, mesAtual, 1 + i);

    if (d.getMonth() > mesAtual + 1) break;

    const chave = `${d.getFullYear()}_${d.getMonth()}_${d.getDate()}`;
    (eventosObj[chave] || []).forEach(e => lista.push({
      ...e,
      data: `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`
    }));
  }

  lista.sort((a, b) => (
    new Date(a.data.split('/').reverse().join('-')) - new Date(b.data.split('/').reverse().join('-'))
>>>>>>> 49b53805ee6ed8232fa735f62524a7913a1cde56
  ));
  eventosProximosContainer.innerHTML = `<div class="card-eventos"><h3>📅 Próximos Eventos</h3>${(
    lista
      .slice(0, 5)
      .map(e => (
        `<div class="evento-item" onclick="verEventoPorData('${e.data}','${e.id}')">` +
<<<<<<< HEAD
        `<div class="evento-data">📅 ${formatarDataSalva(e.dataInicioEvento || e.data)} até ${formatarDataSalva(e.dataFimEvento || e.data)}</div>` +
        `<strong>${e.titulo}</strong>` +
        `<div>⏰ ${e.horarioInicio || e.horario || 'Horário não definido'}${e.horarioFim ? ` até ${e.horarioFim}` : ''}</div>` +
=======
        `<div class="evento-data">📅 ${e.data}</div>` +
        `<strong>${e.titulo}</strong>` +
        `<div>⏰ ${e.horario || ''}</div>` +
>>>>>>> 49b53805ee6ed8232fa735f62524a7913a1cde56
        '</div>'
      ))
      .join('')
  ) || '<p>Nenhum evento próximo registrado.</p>'}</div>`;
}

window.verEventos = (ano, mes, dia) => {
  setSelecionados(ano, mes, dia, getEventos(ano, mes, dia));
  location.href = 'eventos.html';
};
window.verEventoPorData = (data, id) => {
<<<<<<< HEAD
  const [dia, mes, ano] = data.split(/[-/]/).map(Number);
=======
  const [dia, mes, ano] = data.split('/').map(Number);
>>>>>>> 49b53805ee6ed8232fa735f62524a7913a1cde56

  setSelecionados(
    ano,
    mes - 1,
    dia,
    getEventos(ano, mes - 1, dia).filter(e => String(e.id) === String(id)),
    true
  );
  location.href = 'eventos.html';
};
window.verEvento = window.verEventos;

mesSelect.onchange = () => (
  mesAtual = +mesSelect.value,
  desenhar()
);
anoSelect.onchange = () => (
  anoAtual = +anoSelect.value,
  desenhar()
);
<<<<<<< HEAD
document.getElementById('loginBtn').onclick = () => location.href = 'login.html';
document.getElementById('registrarEventoBtn').onclick = () => location.href = 'formulario.html';

// Carrossel comentado a pedido.
// const slides = [...document.querySelectorAll('.carousel-slide')];
// if (slides.length) {
//   let i = 0,
//     show = n => slides.forEach((s, idx) => s.classList.toggle('active', idx === n));
//
//   document.getElementById('nextSlide').onclick = () => show(i = (i + 1) % slides.length);
//   document.getElementById('prevSlide').onclick = () => show(i = (i - 1 + slides.length) % slides.length);
//   setInterval(() => show(i = (i + 1) % slides.length), 4000);
// }

=======
document.getElementById('logoutBtn').onclick = () => (
  localStorage.removeItem('usuarioLogado'),
  location.href = 'login.html'
);
document.getElementById('registrarEventoBtn').onclick = () => location.href = 'formulario.html';

const slides = [...document.querySelectorAll('.carousel-slide')];
if (slides.length) {
  let i = 0,
    show = n => slides.forEach((s, idx) => s.classList.toggle('active', idx === n));

  document.getElementById('nextSlide').onclick = () => show(i = (i + 1) % slides.length);
  document.getElementById('prevSlide').onclick = () => show(i = (i - 1 + slides.length) % slides.length);
  setInterval(() => show(i = (i + 1) % slides.length), 4000);
}

>>>>>>> 49b53805ee6ed8232fa735f62524a7913a1cde56
window.addEventListener('pageshow', desenhar);
desenhar();
