const toast = document.getElementById('toast');
let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
}
const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');
menuToggle?.addEventListener('click', () => {
  const open = mainNav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
});
mainNav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  mainNav.classList.remove('open');
  menuToggle?.setAttribute('aria-expanded', 'false');
}));
document.getElementById('loginBtn')?.addEventListener('click', () => {
  showToast('Google 로그인은 Supabase 인증 설정을 연결한 뒤 사용할 수 있어요.');
});
document.getElementById('workspaceBtn')?.addEventListener('click', () => {
  showToast('작업 공간은 다음 단계에서 계정 및 파일 저장 기능과 연결할 예정이에요.');
});
document.querySelectorAll('[data-billing]').forEach(button => {
  button.addEventListener('click', () => {
    if (button.dataset.billing === 'monthly') {
      showToast('월간 구독은 추후 공개될 예정이에요. 현재는 연간 가격만 기획되어 있어요.');
      return;
    }
    document.querySelectorAll('[data-billing]').forEach(item => item.classList.remove('billing-active'));
    button.classList.add('billing-active');
  });
});
document.querySelectorAll('.price-button').forEach(button => {
  button.addEventListener('click', event => {
    if (button.getAttribute('href') === '#workspace') {
      // Navigation remains available; show clear prototype status.
      showToast('현재는 미리보기입니다. 실제 가입과 결제는 인증·결제 연결 후 제공됩니다.');
    }
  });
});
