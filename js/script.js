const hoje = new Date(), meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
let anoAtual = hoje.getFullYear(), mesAtual = hoje.getMonth();
const mesSelect = document.getElementById('mesSelect'), anoSelect = document.getElementById('anoSelect'), mesAnoTitulo = document.getElementById('mesAnoTitulo'), calendarioBody = document.getElementById('calendarioBody'), eventosProximosContainer = document.getElementById('eventosProximosContainer');
if (!JSON.parse(localStorage.getItem('usuarioLogado') || 'null')) location.href = 'login.html';

const getEventos = (a,m,d) => (JSON.parse(localStorage.getItem('todosEventos') || '{}')[`${a}_${m}_${d}`] || []);
const setSelecionados = (ano,mes,dia,eventos,eventoUnico=false) => localStorage.setItem('eventosSelecionados', JSON.stringify({ ano, mes, dia, eventos, eventoUnico }));

mesSelect.value = mesAtual;
for (let a = hoje.getFullYear(); a <= hoje.getFullYear() + 10; a++) anoSelect.innerHTML += `<option value="${a}" ${a===anoAtual?'selected':''}>${a}</option>`;

function desenhar(){
  mesAnoTitulo.textContent = `${meses[mesAtual].toLowerCase()} ${anoAtual}`;
  const inicio = new Date(anoAtual, mesAtual, 1).getDay(), total = new Date(anoAtual, mesAtual + 1, 0).getDate(), prevTotal = new Date(anoAtual, mesAtual, 0).getDate();
  let html = '', count = 0;
  for (let i = inicio - 1; i >= 0; i--) html += `<td class="other-month"><div class="day-number">${prevTotal - i}</div></td>`, count++;
  const h = new Date(), isMes = h.getFullYear()===anoAtual && h.getMonth()===mesAtual;
  for (let dia = 1; dia <= total; dia++) {
    const eventos = getEventos(anoAtual, mesAtual, dia);
    const badges = eventos.slice(0,2).map(e=>`<div class="event-badge" onclick="event.stopPropagation();verEventos(${anoAtual},${mesAtual},${dia})">${e.titulo.substring(0,12)}</div>`).join('') + (eventos.length>2?`<div class="event-more" onclick="event.stopPropagation();verEventos(${anoAtual},${mesAtual},${dia})">+${eventos.length-2} outros</div>`:'');
    html += `<td class="${isMes&&h.getDate()===dia?'today':''}" onclick="verEventos(${anoAtual},${mesAtual},${dia})"><div class="day-number">${dia}</div>${badges}</td>`;
    if (++count % 7 === 0 && dia !== total) html += '</tr><tr>';
  }
  const faltam = 7 - (count % 7);
  if (faltam < 7) for (let dia = 1; dia <= faltam; dia++) html += `<td class="other-month"><div class="day-number">${dia}</div></td>`;
  calendarioBody.innerHTML = `<tr>${html}</tr>`;

  const eventosObj = JSON.parse(localStorage.getItem('todosEventos') || '{}');
  let lista = [];
  for (let i=0;i<30;i++) {
    const d = new Date(anoAtual, mesAtual, 1+i); if (d.getMonth() > mesAtual+1) break;
    const chave = `${d.getFullYear()}_${d.getMonth()}_${d.getDate()}`;
    (eventosObj[chave]||[]).forEach(e=>lista.push({...e,data:`${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`}));
  }
  lista.sort((a,b)=>new Date(a.data.split('/').reverse().join('-'))-new Date(b.data.split('/').reverse().join('-')));
  eventosProximosContainer.innerHTML = `<div class="card-eventos"><h3>📅 Próximos Eventos</h3>${(lista.slice(0,5).map(e=>`<div class="evento-item" onclick="verEventoPorData('${e.data}','${e.id}')"><div class="evento-data">📅 ${e.data}</div><strong>${e.titulo}</strong><div>⏰ ${e.horario||''}</div></div>`).join('')) || '<p>Nenhum evento próximo registrado.</p>'}</div>`;
}

window.verEventos = (ano,mes,dia) => { setSelecionados(ano,mes,dia,getEventos(ano,mes,dia)); location.href = 'eventos.html'; };
window.verEventoPorData = (data,id) => { const [dia,mes,ano]=data.split('/').map(Number); setSelecionados(ano,mes-1,dia,getEventos(ano,mes-1,dia).filter(e=>String(e.id)===String(id)),true); location.href='eventos.html'; };
window.verEvento = window.verEventos;

mesSelect.onchange = () => (mesAtual = +mesSelect.value, desenhar());
anoSelect.onchange = () => (anoAtual = +anoSelect.value, desenhar());
document.getElementById('logoutBtn').onclick = () => (localStorage.removeItem('usuarioLogado'), location.href='login.html');
document.getElementById('registrarEventoBtn').onclick = () => location.href='formulario.html';

const slides = [...document.querySelectorAll('.carousel-slide')];
if (slides.length) {
  let i = 0, show = n => slides.forEach((s,idx)=>s.classList.toggle('active',idx===n));
  document.getElementById('nextSlide').onclick = () => show(i = (i+1)%slides.length);
  document.getElementById('prevSlide').onclick = () => show(i = (i-1+slides.length)%slides.length);
  setInterval(() => show(i = (i+1)%slides.length), 4000);
}

window.addEventListener('pageshow', desenhar);
desenhar();
