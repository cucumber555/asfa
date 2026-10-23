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

const SUPABASE_URL = 'https://mujmwouyopgxwtezhlzv.supabase.co';
const SUPABASE_KEY = 'sb_publishable_uiChi46cHC53f6QAm8TALQ_MGknEOQ9';

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);



const loginBtn = document.getElementById('loginBtn');
const accountMenu = document.getElementById('accountMenu');
const accountBtn = document.getElementById('accountBtn');
const accountDropdown = document.getElementById('accountDropdown');
const accountAvatar = document.getElementById('accountAvatar');
const accountInitial = document.getElementById('accountInitial');
const accountName = document.getElementById('accountName');
const accountEmail = document.getElementById('accountEmail');
const logoutBtn = document.getElementById('logoutBtn');

function updateAccount(user) {
  if (!user) {
    loginBtn.hidden = false;
    accountMenu.hidden = true;
    accountDropdown.hidden = true;
    accountBtn.setAttribute('aria-expanded', 'false');
    return;
  }

  const metadata = user.user_metadata || {};
  const name =
    metadata.full_name ||
    metadata.name ||
    user.email?.split('@')[0] ||
    'ASFA 사용자';

  const avatarUrl = metadata.avatar_url || metadata.picture || '';

  loginBtn.hidden = true;
  accountMenu.hidden = false;
  accountName.textContent = name;
  accountEmail.textContent = user.email || '';

  accountInitial.textContent = [...name][0]?.toUpperCase() || 'A';

  if (avatarUrl) {
    accountAvatar.src = avatarUrl;
    accountAvatar.hidden = false;
    accountInitial.hidden = true;

    accountAvatar.onerror = () => {
      accountAvatar.hidden = true;
      accountInitial.hidden = false;
    };
  } else {
    accountAvatar.hidden = true;
    accountInitial.hidden = false;
  }
}

// 로그인 버튼
loginBtn.addEventListener('click', async () => {
  const { error } = await supabaseClient.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'https://asfa.oscadia.net/'
    }
  });

  if (error) {
    showToast('로그인 오류: ' + error.message);
    console.error(error);
  }
});

// 동그란 프로필 아이콘
accountBtn.addEventListener('click', () => {
  const isOpen = accountDropdown.hidden;
  accountDropdown.hidden = !isOpen;
  accountBtn.setAttribute('aria-expanded', String(isOpen));
});

// 메뉴 바깥을 클릭하면 닫기
document.addEventListener('click', event => {
  if (!accountMenu.contains(event.target)) {
    accountDropdown.hidden = true;
    accountBtn.setAttribute('aria-expanded', 'false');
  }
});

// 로그아웃
logoutBtn.addEventListener('click', async () => {
  const { error } = await supabaseClient.auth.signOut();

  if (error) {
    showToast('로그아웃 오류: ' + error.message);
    console.error(error);
    return;
  }

  updateAccount(null);
  showToast('로그아웃했어요.');
});

// 로그인 상태 감지 및 새로고침 후 상태 복원
supabaseClient.auth.onAuthStateChange((_event, session) => {
  updateAccount(session?.user || null);
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
