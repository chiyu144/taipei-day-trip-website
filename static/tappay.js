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
      '.valid': { 'color': '#448899' },
      '.invalid': { 'color': '#cc4b4b' },
      // '@media screen and (max-width: 480px)': {
      //   'input': {  }
      // }
    }
  });
};

export const tappayValidation = (tappayFields, submitButton) => {
  TPDirect.card.onUpdate(function (update) {
    if (update.canGetPrime) {
      submitButton.removeAttribute('disabled');
    } else {
      submitButton.setAttribute('disabled', true);
    };
  
    // cardTypes = ['mastercard', 'visa', 'jcb', 'amex', 'unionpay','unknown']
    // if (update.cardType === 'visa') {  }
  
    if (update.status.number === 2) {
      tappayFields[0].classList.add('input-invalid');
    } else if (update.status.number === 0) {
      tappayFields[0].classList.remove('input-invalid');
    } else {
      tappayFields[0].classList.remove('input-invalid');
    };
  
    if (update.status.expiry === 2) {
      tappayFields[1].classList.add('input-invalid');
    } else if (update.status.expiry === 0) {
      tappayFields[1].classList.remove('input-invalid');
    } else {
      tappayFields[1].classList.remove('input-invalid');
    };
  
    if (update.status.ccv === 2) {
      tappayFields[2].classList.add('input-invalid');
    } else if (update.status.ccv === 0) {
      tappayFields[2].classList.remove('input-invalid');
    } else {
      tappayFields[2].classList.remove('input-invalid');
    };
  });
};