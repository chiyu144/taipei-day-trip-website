import { getUserApi } from './apis.js'

export const getUser = async(triggerAuth) => {
  const userState = await getUserApi();
  triggerAuth.textContent = userState.data ? '登出系統' : '登入/註冊';
};

window.addEventListener('load', async() => {  
  const triggers = document.querySelectorAll('[data-modal]');
  triggers.forEach(trigger => {
    trigger.addEventListener('click', e => {
      e.preventDefault();
      const modal = document.getElementById(trigger.dataset.modal);
      modal.classList.add('open-modal');
      const exits = modal.querySelectorAll('.exit-modal');
      exits.forEach(exit => {
        exit.addEventListener('click', e => {
          e.preventDefault();
          modal.classList.remove('open-modal');
        });
      });
    });
  });
  
  const triggerAuth = document.querySelector('#trigger-auth');
  await getUser(triggerAuth);

  const titleAuth = document.querySelector('#form-auth > div:first-child');
  const userEmail = document.querySelector('#form-auth #user-email');
  const userPassword = document.querySelector('#form-auth #user-password');
  const userName = document.querySelector('#form-auth #user-name');
  const userNameField = document.querySelector('.user-name-field');
  const buttonAuth = document.querySelector('#form-auth > button');
  const msgToggleAuth = document.querySelector('#toggle-auth > span');
  const toggleAuth = document.querySelector('#toggle-auth > a');
  toggleAuth?.addEventListener('click', e => {
    e.preventDefault();
    titleAuth.textContent = titleAuth.textContent === '登入會員帳號' ? '註冊會員帳號' : '登入會員帳號';
    msgToggleAuth.textContent = msgToggleAuth.textContent === '還沒有帳戶？' ? '已有帳戶？' : '還沒有帳戶？';
    toggleAuth.textContent = toggleAuth.textContent === '點此註冊' ? '點此登入' : '點此註冊';
    userNameField.classList.toggle('anime-user-name-field');
    buttonAuth.textContent = buttonAuth.textContent === '登入帳戶' ? '註冊帳戶' : '登入帳戶';
  })
});
