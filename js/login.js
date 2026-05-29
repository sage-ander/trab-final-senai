// --- CONFIGURAÇÃO ÚNICA DO ADMINISTRADOR ---
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'admin123';

const loginForm = document.getElementById('loginForm');
const usuarioInput = document.getElementById('usuario');
const senhaInput = document.getElementById('senha');
const erroMensagem = document.getElementById('erro');

/* FUNÇÃO PRINCIPAL: Valida se as credenciais digitadas pertencem ao único
   administrador do sistema. Se sim, gera o crachá no localStorage.
*/
loginForm.addEventListener('submit', e => {
  e.preventDefault();
  erroMensagem.textContent = '';

  const usuarioDigitado = usuarioInput.value.trim();
  const senhaDigitada = senhaInput.value;

  // Checa diretamente contra as constantes do Admin
  if (usuarioDigitado !== ADMIN_USER || senhaDigitada !== ADMIN_PASS) {
    erroMensagem.style.color = 'red';
    erroMensagem.textContent = 'Usuário ou senha inválidos. Acesso restrito ao Admin.';
    return;
  }

  // Emite o crachá do Admin
  const perfilAdmin = { u: ADMIN_USER, s: ADMIN_PASS, r: 'admin' };
  localStorage.setItem('usuarioLogado', JSON.stringify(perfilAdmin));

  window.location.href = 'index.html';
});
