
/* ========================================
   ASFA main.js
   Login + Profile + Workspace + Pricing
======================================== */

// Toast messages
const toast = document.getElementById('toast');
let toastTimer;

function showToast(message) {
  if (!toast) {
    console.log(message);
    return;
  }

  toast.textContent = message;
  toast.classList.add('show');

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}


// Mobile navigation
const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');

menuToggle?.addEventListener('click', () => {
  if (!mainNav) return;

  const open = mainNav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
});

mainNav?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mainNav.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');
  });
});


// Supabase connection
const SUPABASE_URL =
  'https://mujmwouyopgxwtezhlzv.supabase.co';

const SUPABASE_KEY =
  'sb_publishable_uiChi46cHC53f6QAm8TALQ_MGknEOQ9';

if (!window.supabase) {
  throw new Error(
    'Supabase SDK를 불러오지 못했습니다. index.html의 script를 확인하세요.'
  );
}

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);


// Account elements
const loginBtn = document.getElementById('loginBtn');
const accountMenu = document.getElementById('accountMenu');
const accountBtn = document.getElementById('accountBtn');
const accountDropdown = document.getElementById('accountDropdown');
const accountAvatar = document.getElementById('accountAvatar');
const accountInitial = document.getElementById('accountInitial');
const accountName = document.getElementById('accountName');
const accountEmail = document.getElementById('accountEmail');
const logoutBtn = document.getElementById('logoutBtn');


// Update header account UI
function updateAccount(user) {
  if (!loginBtn || !accountMenu) return;

  if (!user) {
    loginBtn.hidden = false;
    accountMenu.hidden = true;

    if (accountDropdown) {
      accountDropdown.hidden = true;
    }

    accountBtn?.setAttribute('aria-expanded', 'false');
    return;
  }

  const metadata = user.user_metadata || {};

  const name =
    metadata.full_name ||
    metadata.name ||
    user.email?.split('@')[0] ||
    'ASFA 사용자';

  const avatarUrl =
    metadata.avatar_url ||
    metadata.picture ||
    '';

  loginBtn.hidden = true;
  accountMenu.hidden = false;

  if (accountName) {
    accountName.textContent = name;
  }

  if (accountEmail) {
    accountEmail.textContent = user.email || '';
  }

  if (accountInitial) {
    accountInitial.textContent =
      [...name][0]?.toUpperCase() || 'A';
    accountInitial.hidden = false;
  }

  if (accountAvatar) {
    accountAvatar.onerror = () => {
      accountAvatar.hidden = true;

      if (accountInitial) {
        accountInitial.hidden = false;
      }
    };

    if (avatarUrl) {
      accountAvatar.src = avatarUrl;
      accountAvatar.hidden = false;

      if (accountInitial) {
        accountInitial.hidden = true;
      }
    } else {
      accountAvatar.removeAttribute('src');
      accountAvatar.hidden = true;
    }
  }
}


// Save Google account profile to Supabase
async function syncAsfaProfile(user) {
  if (!user) return;

  const metadata = user.user_metadata || {};

  const displayName =
    metadata.full_name ||
    metadata.name ||
    user.email?.split('@')[0] ||
    'ASFA 사용자';

  const avatarUrl =
    metadata.avatar_url ||
    metadata.picture ||
    null;

  const { data, error } = await supabaseClient
    .from('asfa_profiles')
    .upsert(
      {
        user_id: user.id,
        display_name: displayName,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString()
      },
      {
        onConflict: 'user_id'
      }
    )
    .select();

  if (error) {
    console.error(
      'ASFA 프로필 저장 오류:',
      error.message,
      error
    );
    showToast('프로필 저장 실패: ' + error.message);
    return;
  }

  console.log('ASFA 프로필 저장 성공:', data);
}


// Google login
loginBtn?.addEventListener('click', async () => {
  const { error } = await supabaseClient.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'https://asfa.oscadia.net/'
    }
  });

  if (error) {
    console.error('Google 로그인 오류:', error);
    showToast('로그인 오류: ' + error.message);
  }
});


// Toggle profile dropdown
accountBtn?.addEventListener('click', () => {
  if (!accountDropdown) return;

  const isOpen = accountDropdown.hidden;
  accountDropdown.hidden = !isOpen;

  accountBtn.setAttribute(
    'aria-expanded',
    String(isOpen)
  );
});


// Close dropdown when clicking outside
document.addEventListener('click', event => {
  if (
    accountMenu &&
    !accountMenu.contains(event.target)
  ) {
    if (accountDropdown) {
      accountDropdown.hidden = true;
    }

    accountBtn?.setAttribute('aria-expanded', 'false');
  }
});


// Logout
logoutBtn?.addEventListener('click', async () => {
  const { error } = await supabaseClient.auth.signOut();

  if (error) {
    console.error('로그아웃 오류:', error);
    showToast('로그아웃 오류: ' + error.message);
    return;
  }

  updateAccount(null);
  showToast('로그아웃했어요.');
});


// Listen for authentication changes.
// Do not run database requests directly inside
// the Supabase auth callback.
supabaseClient.auth.onAuthStateChange(
  (_event, session) => {
    const user = session?.user || null;

    updateAccount(user);

    if (user) {
      setTimeout(() => {
        syncAsfaProfile(user);
      }, 0);
    }
  }
);


// Restore the existing session on page load
supabaseClient.auth.getSession().then(
  ({ data, error }) => {
    if (error) {
      console.error(
        '로그인 상태 확인 오류:',
        error
      );
      return;
    }

    const user = data.session?.user || null;

    updateAccount(user);

    if (user) {
      syncAsfaProfile(user);
    }
  }
);


// Workspace button
document
  .getElementById('workspaceBtn')
  ?.addEventListener('click', () => {
    showToast(
      '작업 공간 기능은 다음 단계에서 연결할 예정이에요.'
    );
  });


// Billing selector
document.querySelectorAll('[data-billing]').forEach(button => {
  button.addEventListener('click', () => {
    if (button.dataset.billing === 'monthly') {
      showToast(
        '월간 구독은 추후 공개될 예정이에요.'
      );
      return;
    }

    document.querySelectorAll('[data-billing]').forEach(item => {
      item.classList.remove('billing-active');
    });

    button.classList.add('billing-active');
  });
});


// Pricing buttons
document.querySelectorAll('.price-button').forEach(button => {
  button.addEventListener('click', () => {
    if (button.getAttribute('href') === '#workspace') {
      showToast(
        '현재는 미리보기입니다. 실제 가입과 결제는 추후 연결됩니다.'
      );
    }
  });
});
