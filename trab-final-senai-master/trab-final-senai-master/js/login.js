 const ADMIN_USER = 'admin';
const ADMIN_PASS = 'admin123';
const loginForm = document.getElementById('loginForm');
const usuarioInput = document.getElementById('usuario');
const senhaInput = document.getElementById('senha');
const erroMensagem = document.getElementById('erro');

loginForm.addEventListener('submit', fazerLogin);

/*
=========
LOGIN
=========
*/
function fazerLogin(e) {
  e.preventDefault();
  erroMensagem.textContent = '';

  if (usuarioInput.value.trim() !== ADMIN_USER || senhaInput.value !== ADMIN_PASS) {
    erroMensagem.style.color = 'red';
    erroMensagem.textContent = 'Usuário ou senha inválidos. Acesso restrito ao Admin.';
    return;
  }

  localStorage.setItem('usuarioLogado', JSON.stringify({ u: ADMIN_USER, s: ADMIN_PASS, r: 'admin' }));
  window.location.href = 'index.html';
}
