const users = [
  { u: 'admin', s: 'admin123', r: 'admin' },
  { u: 'cliente', s: 'cliente123', r: 'cliente' }
];

document.getElementById('loginForm').addEventListener('submit', e => {
  e.preventDefault();

  const u = usuario.value.trim();
  const s = senha.value;
  const f = users.find(x => x.u === u && x.s === s);

  if (!f) {
    erro.textContent = 'Usuário ou senha inválidos';
    return;
  }

  localStorage.setItem('usuarioLogado', JSON.stringify(f));
  window.location.href = 'index.html';
});
