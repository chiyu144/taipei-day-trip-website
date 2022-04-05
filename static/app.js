import { userApi } from './apis.js'
import { checkUserState } from './utils.js'

const showMsgAuth = (msg) => {
  const msgAuth = document.querySelector('.msg-auth');
  !msgAuth.classList.contains('sentinel-auth') && msgAuth.classList.add('sentinel-auth');
  msgAuth.textContent = `${msg}`
};
const clearMsgAuth = () => {
  const msgAuth = document.querySelector('.msg-auth');
  msgAuth.textContent = '';
  msgAuth.classList.contains('sentinel-auth') && msgAuth.classList.remove('sentinel-auth');
};

export const getUser = async(triggerAuth, bookingNum) => {
  const member = await checkUserState();
  if (member) {
    const userState = await userApi('GET');
    triggerAuth.textContent = '登出系統';
    bookingNum.textContent = userState.data.booking_num;
    bookingNum.style.visibility = 'visible';
    sessionStorage.setItem('member', JSON.stringify(userState.data));
  } else {
    triggerAuth.textContent = '登入/註冊';
    bookingNum.style.visibility = 'hidden';
    sessionStorage.setItem('member', '');
  }
};
export const postUser = async({ userEmail, userPassword, userName }) => {
  const res = await userApi('POST', {
    name: userName,
    email: userEmail,
    password: userPassword
  });
  if (res?.ok) { showMsgAuth('註冊成功，請重新登入'); };
  if (res?.error) { showMsgAuth(res.message); }
};
export const patchUser = async({ userEmail, userPassword }) => {
  const res = await userApi('PATCH', {
    email: userEmail,
    password: userPassword
  });
  if (res?.ok) { window.location.reload(); };
  if (res?.error) { showMsgAuth(res.message); };
};
export const deleteUser = async() => {
  const res = await userApi('DELETE');
  if (res?.ok) { window.location.reload(); };
};


window.addEventListener('load', async() => {
  const navBooking = document.querySelector('#nav-booking');
  const formAuth = document.querySelector('#form-auth');
  const titleAuth = formAuth.querySelector('div:first-child');
  const fieldUserName = document.querySelector('.field-user-name');
  const buttonAuth = formAuth.querySelector('button');
  const msgToggleAuth = document.querySelector('#toggle-auth > span');
  const toggleAuth = document.querySelector('#toggle-auth > a');
  const triggerAuth = document.querySelector('#trigger-auth');
  const triggers = document.querySelectorAll('[data-modal]');
  const bookingNum = document.querySelector('#nav-booking-num');
  
  await getUser(triggerAuth, bookingNum);

  navBooking.addEventListener('click', async(e) => {
    e.preventDefault();
    if(await checkUserState()) {
      window.location.href = '/booking';
    } else {
      triggerAuth.click();
    }
  });
  
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
          clearMsgAuth();
          formAuth.reset();
        });
      });
    });
  });

  triggerAuth.addEventListener('click', async(e) => {
    e.preventDefault();
    if (triggerAuth.textContent === '登出系統') {
      await deleteUser();
    };
  });

  toggleAuth?.addEventListener('click', e => {
    e.preventDefault();
    titleAuth.textContent = titleAuth.textContent === '登入會員帳號' ? '註冊會員帳號' : '登入會員帳號';
    msgToggleAuth.textContent = msgToggleAuth.textContent === '還沒有帳戶？' ? '已有帳戶？' : '還沒有帳戶？';
    toggleAuth.textContent = toggleAuth.textContent === '點此註冊' ? '點此登入' : '點此註冊';
    fieldUserName.classList.toggle('anime-field-user-name');
    buttonAuth.textContent = buttonAuth.textContent === '登入帳戶' ? '註冊帳戶' : '登入帳戶';
    clearMsgAuth();
    formAuth.reset();
  });

  formAuth.addEventListener('submit', async(e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const userEmail =  formData.get('user-email');
    const userPassword = formData.get('user-password');
    const userName = formData.get('user-name');
    if (buttonAuth.textContent === '登入帳戶') {
      await patchUser({ userEmail, userPassword });
    } else if (buttonAuth.textContent === '註冊帳戶') {
      await postUser({ userEmail, userPassword, userName });
    };
  });
});
