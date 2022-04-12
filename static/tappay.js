
import { checkClassExist } from './utils.js'

export const tappaySetup = () => {
  let fields = {
    number: {
      element: '#card-number',
      placeholder: '**** **** **** ****'
    },
    expirationDate: {
      element: document.getElementById('card-expiration-date'),
      placeholder: 'MM / YY'
    },
    ccv: {
      element: '#card-ccv',
      placeholder: 'CCV'
    }
  };
  TPDirect.card.setup({
    fields: fields,
    styles: {
      'input': {
        'color': 'black',
        'font-size': '16px'
      },
      // 'input.ccv': {  },
      // 'input.expiration-date': {  },
      // 'input.card-number': {  },
      // ':focus': {  },
      // '.valid': { },
      '.invalid': { 'color': '#e72727' },
      // '@media screen and (max-width: 480px)': {
      //   'input': {  }
      // }
    }
  });
};

export const tappayValidation = tappayFields => {
  const inputIcons = [
    tappayFields[0].nextElementSibling,
    tappayFields[1].nextElementSibling,
    tappayFields[2].nextElementSibling
  ];
  TPDirect.card.onUpdate(function (update) {
    // if (update.canGetPrime) { } else {}
  
    // * cardTypes = ['mastercard', 'visa', 'jcb', 'amex', 'unionpay','unknown']
    // if (update.cardType === 'visa') {  }
  
    // * 2: invalid, 1: normal, 0: success
    if (update.status.number === 2) {
      !checkClassExist(inputIcons[0], 'input-icon-invalid') && inputIcons[0].classList.add('input-icon-invalid');
      !checkClassExist(tappayFields[0], 'input-invalid') && tappayFields[0].classList.add('input-invalid');
    } else {
      checkClassExist(inputIcons[0], 'input-icon-invalid') && inputIcons[0].classList.remove('input-icon-invalid');
      checkClassExist(tappayFields[0], 'input-invalid') && tappayFields[0].classList.remove('input-invalid');
    };
  
    if (update.status.expiry === 2) {
      !checkClassExist(inputIcons[1], 'input-icon-invalid') && inputIcons[1].classList.add('input-icon-invalid');
      !checkClassExist(tappayFields[1], 'input-invalid') && tappayFields[1].classList.add('input-invalid');
    } else {
      checkClassExist(inputIcons[1], 'input-icon-invalid') && inputIcons[1].classList.remove('input-icon-invalid');
      checkClassExist(tappayFields[1], 'input-invalid') && tappayFields[1].classList.remove('input-invalid');
    };
  
    if (update.status.ccv === 2) {
      !checkClassExist(tappayFields[2], 'input-invalid') && tappayFields[2].classList.add('input-invalid');
      !checkClassExist(inputIcons[2], 'input-icon-invalid') && inputIcons[2].classList.add('input-icon-invalid');
    } else {
      checkClassExist(inputIcons[2], 'input-icon-invalid') && inputIcons[2].classList.remove('input-icon-invalid');
      checkClassExist(tappayFields[2], 'input-invalid') && tappayFields[2].classList.remove('input-invalid');
    };
  });
};