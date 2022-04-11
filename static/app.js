import { userApi } from './apis.js'
import { checkUserState, inputValidation, checkClassExist, clearInputInvalidStyle } from './utils.js'

let isLogin = false;

const showAuthMsg = (msg) => {
  const authMsg = document.querySelector('.msg-auth');
  !authMsg.classList.contains('sentinel-auth') && authMsg.classList.add('sentinel-auth');
  authMsg.textContent = `${msg}`
};
const clearAuthMsg = () => {
  const authMsg = document.querySelector('.msg-auth');
  authMsg.textContent = '';
  authMsg.classList.contains('sentinel-auth') && authMsg.classList.remove('sentinel-auth');
};

export const getUser = async(authModalTrigger, bookingNum) => {
  const member = await checkUserState();
  if (member) {
    authModalTrigger.textContent = '登出系統';
    bookingNum.textContent = member.booking_num;
    bookingNum.style.visibility = 'visible';
    sessionStorage.setItem('member', JSON.stringify(member));
    isLogin = true;
  } else {
    if (window.location.pathname === '/booking') { window.location.href = '/' } 
    authModalTrigger.textContent = '登入/註冊';
    bookingNum.style.visibility = 'hidden';
    sessionStorage.setItem('member', '');
    isLogin = false;
  }
};
export const postUser = async({ userEmail, userPassword, userName }) => {
  const res = await userApi('POST', {
    name: userName,
    email: userEmail,
    password: userPassword
  });
  if (res?.ok) { showAuthMsg('註冊成功，請重新登入'); };
  if (res?.error) { showAuthMsg(res.message); }
};
export const patchUser = async({ userEmail, userPassword }) => {
  const res = await userApi('PATCH', {
    email: userEmail,
    password: userPassword
  });
  if (res?.ok) { window.location.reload(); };
  if (res?.error) { showAuthMsg(res.message); };
};
export const deleteUser = async() => {
  const res = await userApi('DELETE');
  if (res?.ok) { window.location.reload(); };
};


window.addEventListener('load', async() => {
  const bookingNav = document.querySelector('#nav-booking');
  const authForm = document.querySelector('#form-auth');
  const authFormTitle = authForm.querySelector('div:first-child');
  const userNameField = document.querySelector('.field-user-name');
  const authInputs = document.querySelectorAll('#form-auth input');
  const authButton = authForm.querySelector('button');
  const authMsgToggle = document.querySelector('#toggle-auth > span');
  const authToggle = document.querySelector('#toggle-auth > a');
  const authModalTrigger = document.querySelector('#trigger-auth');
  const modalTriggers = document.querySelectorAll('[data-modal]');
  const bookingNum = document.querySelector('#nav-booking-num');
  
  await getUser(authModalTrigger, bookingNum);

  bookingNav.addEventListener('click', async(e) => {
    e.preventDefault();
    if(sessionStorage.getItem('member') !== '') {
      window.location.href = '/booking';
    } else {
      authModalTrigger.click();
    }
  });
  
  modalTriggers.forEach(modalTrigger => {
    modalTrigger.addEventListener('click', e => {
      e.preventDefault();
      if (modalTrigger.id === 'trigger-auth' && isLogin) { return; }; 
      const modal = document.getElementById(modalTrigger.dataset.modal);
      modal.classList.add('open-modal');
      const modalExits = modal.querySelectorAll('.exit-modal');
      modalExits.forEach(modalExit => {
        modalExit.addEventListener('click', e => {
          e.preventDefault();
          modal.classList.remove('open-modal');
          clearAuthMsg();
          if (modalTrigger.id === 'trigger-auth') {
            authForm.reset();
            const invalidElements = authForm.querySelectorAll('.input-invalid');
            clearInputInvalidStyle(invalidElements);
          };
        });
      });
    });
  });

  authModalTrigger.addEventListener('click', async(e) => {
    e.preventDefault();
    isLogin && await deleteUser();
  });

  authToggle?.addEventListener('click', e => {
    e.preventDefault();
    authFormTitle.textContent = authFormTitle.textContent === '登入會員帳號' ? '註冊會員帳號' : '登入會員帳號';
    authMsgToggle.textContent = authMsgToggle.textContent === '還沒有帳戶？' ? '已有帳戶？' : '還沒有帳戶？';
    authToggle.textContent = authToggle.textContent === '點此註冊' ? '點此登入' : '點此註冊';
    userNameField.classList.toggle('anime-field-user-name');
    authButton.textContent = authButton.textContent === '登入帳戶' ? '註冊帳戶' : '登入帳戶';
    clearAuthMsg();
    const invalidElements = authForm.querySelectorAll('.input-invalid');
    invalidElements.length > 0 && clearInputInvalidStyle(invalidElements);
    authForm.reset();
  });

  authInputs.addEventListener('keyup', e => {
    checkClassExist(e.currentTarget, 'input-invalid') && e.currentTarget.classList.remove('input-invalid');
    checkClassExist(e.currentTarget.nextElementSibling, 'input-icon-invalid') && e.currentTarget.nextElementSibling.classList.remove('input-icon-invalid');
  });
  authInputs.addEventListener('blur', e => inputValidation('email', e.currentTarget, e.currentTarget.value));

  authForm.addEventListener('submit', async(e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const userEmail =  formData.get('user-email');
    const userPassword = formData.get('user-password');
    const userName = formData.get('user-name');

    if (authButton.textContent === '登入帳戶') {
      await patchUser({ userEmail, userPassword });
    } else if (authButton.textContent === '註冊帳戶') {
      await postUser({ userEmail, userPassword, userName });
    };
  });
});
