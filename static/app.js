import { userApi } from './apis.js'

export const getUser = async(triggerAuth) => {
  const userState = await userApi('GET');
  if (!userState?.data || userState.error) {
    triggerAuth.textContent = '登入/註冊';
  } else {
    triggerAuth.textContent = '登出系統';
  }
};
export const postUser = async({ userEmail, userPassword, userName }) => {
  const res = await userApi('POST', {
    name: userName,
    email: userEmail,
    password: userPassword
  });
  return res;
};
export const patchUser = async({ userEmail, userPassword }) => {
  const res = await userApi('PATCH', {
    email: userEmail,
    password: userPassword
  });
  return res;
};
export const deleteUser = async() => {
  const res = await userApi('DELETE');
  return res;
};
const showMsgAuth = (msgAuth, msg) => {
  !msgAuth.classList.contains('sentinel-auth') && msgAuth.classList.add('sentinel-auth');
  msgAuth.textContent = `${msg}`
};
const clearMsgAuth = msgAuth => {
  msgAuth.textContent = '';
  msgAuth.classList.contains('sentinel-auth') && msgAuth.classList.remove('sentinel-auth');
};


window.addEventListener('load', async() => {
  const formAuth = document.querySelector('#form-auth');
  const titleAuth = formAuth.querySelector('div:first-child');
  const fieldUserName = document.querySelector('.field-user-name');
  const msgAuth = document.querySelector('.msg-auth');
  const buttonAuth = formAuth.querySelector('button');
  const msgToggleAuth = document.querySelector('#toggle-auth > span');
  const toggleAuth = document.querySelector('#toggle-auth > a');
  const triggerAuth = document.querySelector('#trigger-auth');
  const triggers = document.querySelectorAll('[data-modal]');
  
  await getUser(triggerAuth);
  
  triggers.forEach(trigger => {
    trigger.addEventListener('click', e => {
      e.preventDefault();
      if (trigger.id === 'trigger-auth' && (trigger.textContent === '登出系統' || '')) { return; }; 
      const modal = document.getElementById(trigger.dataset.modal);
      modal.classList.add('open-modal');
      const exits = modal.querySelectorAll('.exit-modal');
      exits.forEach(exit => {
        exit.addEventListener('click', e => {
          e.preventDefault();
          modal.classList.remove('open-modal');
          clearMsgAuth(msgAuth);
          formAuth.reset();
        });
      });
    });
  });

  triggerAuth.addEventListener('click', async(e) => {
    e.preventDefault();
    if (triggerAuth.textContent === '登出系統') {
      const res = await deleteUser();
      if (res?.ok) { window.location.reload(); };
    };
  });

  toggleAuth?.addEventListener('click', e => {
    e.preventDefault();
    titleAuth.textContent = titleAuth.textContent === '登入會員帳號' ? '註冊會員帳號' : '登入會員帳號';
    msgToggleAuth.textContent = msgToggleAuth.textContent === '還沒有帳戶？' ? '已有帳戶？' : '還沒有帳戶？';
    toggleAuth.textContent = toggleAuth.textContent === '點此註冊' ? '點此登入' : '點此註冊';
    fieldUserName.classList.toggle('anime-field-user-name');
    buttonAuth.textContent = buttonAuth.textContent === '登入帳戶' ? '註冊帳戶' : '登入帳戶';
    clearMsgAuth(msgAuth);
    formAuth.reset();
  });

  formAuth.addEventListener('submit', async(e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const userEmail =  formData.get('user-email');
    const userPassword = formData.get('user-password');
    const userName = formData.get('user-name');
    if (buttonAuth.textContent === '登入帳戶') {
      const res = await patchUser({ userEmail, userPassword });
      if (res?.ok) { window.location.reload(); }
      if (res?.error) { showMsgAuth(msgAuth, res.message); }
    } else if (buttonAuth.textContent === '註冊帳戶') {
      const res = await postUser({ userEmail, userPassword, userName });
      if (res?.ok) { showMsgAuth(msgAuth, '註冊成功，請重新登入'); };
      if (res?.error) { showMsgAuth(msgAuth, res.message); }
    };
  });
});
