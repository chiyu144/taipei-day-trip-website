import { userApi } from './apis.js';
import { checkUserState, inputValidation, checkClassExist, clearInputInvalidAll, addInputInvalidAll } from './utils.js';

let isLogin = false;

const showAuthMsg = (msg) => {
  const authMsg = document.querySelector('.msg-auth');
  !authMsg.classList.contains('sentinel-auth') && authMsg.classList.add('sentinel-auth');
  authMsg.textContent = `${msg}`;
};
const clearAuthMsg = () => {
  const authMsg = document.querySelector('.msg-auth');
  authMsg.textContent = '';
  authMsg.classList.contains('sentinel-auth') && authMsg.classList.remove('sentinel-auth');
};

export const getUser = async (authModalTrigger, bookingNum, memberNav) => {
  const member = await checkUserState();
  if (member && member !== 'expired') {
    memberNav.style.display = 'inline-block';
    memberNav.textContent = `${member.sub_name[0]}`;
    authModalTrigger.textContent = '登出系統';
    bookingNum.textContent = member.booking_num;
    bookingNum.style.visibility = 'visible';
    sessionStorage.setItem('member', JSON.stringify(member));
    isLogin = true;
  } else {
    authModalTrigger.textContent = '登入/註冊';
    bookingNum.style.visibility = 'hidden';
    sessionStorage.setItem('member', '');
    isLogin = false;
  }
};
export const postUser = async ({ userEmail, userPassword, userName }, inputElements) => {
  const res = await userApi('POST', {
    name: userName,
    email: userEmail,
    password: userPassword,
  });
  if (res.ok) {
    clearInputInvalidAll(inputElements);
    showAuthMsg('註冊成功，請重新登入');
  }
  if (res.error) {
    showAuthMsg(res.message);
    addInputInvalidAll(inputElements);
  }
};
export const patchUser = async ({ userEmail, userPassword }, inputElements) => {
  const res = await userApi('PATCH', {
    email: userEmail,
    password: userPassword,
  });
  if (res.ok) {
    clearInputInvalidAll(inputElements);
    window.location.reload();
  }
  if (res.error) {
    showAuthMsg(res.message);
    addInputInvalidAll(inputElements);
  }
};
export const deleteUser = async () => {
  const res = await userApi('DELETE');
  if (res.ok) {
    window.location.reload();
  }
};

window.addEventListener('load', async () => {
  const bookingNav = document.querySelector('#nav-booking');
  const authForm = document.querySelector('#form-auth');
  const authFormTitle = authForm.querySelector('div:first-child');
  const fieldWrap = document.querySelector('.wrap-field');
  const authInputs = document.querySelectorAll('#form-auth input');
  const authButton = authForm.querySelector('button');
  const authMsgToggle = document.querySelector('#toggle-auth > span');
  const authToggle = document.querySelector('#toggle-auth > a');
  const authModalTrigger = document.querySelector('#trigger-auth');
  const modalTriggers = document.querySelectorAll('[data-modal]');
  const bookingNum = document.querySelector('#nav-booking-num');
  const memberNav = document.querySelector('#nav-member');
  const emailInput = document.querySelector('#user-email');
  const passwordInput = document.querySelector('#user-password');
  const nameInput = document.querySelector('#user-name');

  await getUser(authModalTrigger, bookingNum, memberNav);

  bookingNav.addEventListener('click', async (e) => {
    e.preventDefault();
    if (sessionStorage.getItem('member') !== '') {
      window.location.href = '/booking';
    } else {
      authModalTrigger.click();
    }
  });

  memberNav.addEventListener('click', async (e) => {
    e.preventDefault();
    if (sessionStorage.getItem('member') !== '') {
      window.location.href = '/member';
    } else {
      authModalTrigger.click();
    }
  });

  modalTriggers.forEach((modalTrigger) => {
    modalTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      if (modalTrigger.id === 'trigger-auth' && isLogin) {
        return;
      }
      const modal = document.getElementById(modalTrigger.dataset.modal);
      modal.classList.add('open-modal');
      const modalExits = modal.querySelectorAll('.exit-modal');
      modalExits.forEach((modalExit) => {
        modalExit.addEventListener('click', (e) => {
          e.preventDefault();
          modal.classList.remove('open-modal');
          if (modalTrigger.id === 'trigger-auth') {
            clearAuthMsg();
            authForm.reset();
            const invalidElements = authForm.querySelectorAll('.input-invalid');
            clearInputInvalidAll(invalidElements);
          }
        });
      });
    });
  });

  authModalTrigger.addEventListener('click', async (e) => {
    e.preventDefault();
    isLogin && (await deleteUser());
  });

  authToggle?.addEventListener('click', (e) => {
    e.preventDefault();
    authFormTitle.textContent = authFormTitle.textContent === '登入會員帳號' ? '註冊會員帳號' : '登入會員帳號';
    authMsgToggle.textContent = authMsgToggle.textContent === '還沒有帳戶？' ? '已有帳戶？' : '還沒有帳戶？';
    authToggle.textContent = authToggle.textContent === '點此註冊' ? '點此登入' : '點此註冊';
    fieldWrap.classList.toggle('anime-wrap-field');
    authButton.textContent = authButton.textContent === '登入帳戶' ? '註冊帳戶' : '登入帳戶';
    clearAuthMsg();
    const invalidElements = authForm.querySelectorAll('.input-invalid');
    invalidElements.length > 0 && clearInputInvalidAll(invalidElements);
    authForm.reset();
  });

  const validationTypes = ['email', 'password', 'name'];
  authInputs.forEach((authInput, index) => {
    authInput.addEventListener('keyup', (e) => {
      checkClassExist(e.currentTarget, 'input-invalid') && e.currentTarget.classList.remove('input-invalid');
      checkClassExist(e.currentTarget.nextElementSibling, 'input-icon-invalid') &&
        e.currentTarget.nextElementSibling.classList.remove('input-icon-invalid');
    });
    authInput.addEventListener('blur', (e) =>
      inputValidation(validationTypes[index], e.currentTarget, e.currentTarget.value)
    );
  });

  authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const userEmail = formData.get('user-email');
    const userPassword = formData.get('user-password');
    const userName = formData.get('user-name');
    if (authButton.textContent === '登入帳戶') {
      userEmail === '' || userPassword === ''
        ? ([emailInput, passwordInput].forEach((authInput, index) =>
            inputValidation(validationTypes[index], authInput, authInput.value)
          ),
          showAuthMsg('登入失敗，欄位皆不得為空'))
        : await patchUser({ userEmail, userPassword }, [emailInput, passwordInput]);
    } else if (authButton.textContent === '註冊帳戶') {
      userEmail === '' || userPassword === '' || userName === ''
        ? ([emailInput, passwordInput, nameInput].forEach((authInput, index) =>
            inputValidation(validationTypes[index], authInput, authInput.value)
          ),
          showAuthMsg('註冊失敗，欄位皆不得為空'))
        : await postUser({ userEmail, userPassword, userName }, [emailInput, passwordInput, nameInput]);
    }
  });
});
