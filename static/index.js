'use strict';

const MyForm = (() => {
  const MyForm = function(form) {
    const action = form.action;
    const formResult = form.querySelector('#resultContainer');
    const submitBtn = form.querySelector('#submitButton');
    const sumNumbers = str => {
      const numbers = str.split('').filter(item => {
        const parsedNumber = Number.parseInt(item);
          return !Number.isNaN(parsedNumber); 
        });
    
        return numbers.reduce((acc, x) => {
          return acc + Number.parseInt(x);
        }, 0);
      }
    const validateByPattern = pattern => value => pattern.test(value);
    const checkTotalNumbers = value => sumNumbers(value) < 30;

    const validationRules = [
      {
        id: 'inputFio',
        predicates: [
          validateByPattern(/^[a-zа-я]+\s[a-zа-я]+\s[a-zа-я]+$/i)
        ],
        error: 'Invalid name'
      },
      {
        id: 'inputEmail',
        predicates: [
          validateByPattern(/@ya\.ru$|@yandex\.(ru|ua|by|kz|com)$/i)
        ],
        error: 'Invalid email'
      },
      {
        id: 'inputPhone',
        predicates: [
          validateByPattern(/\+7\(\d{3}\)\d{3}\-\d{2}\-\d{2}/i), 
          checkTotalNumbers
        ],
        error: 'Invalid phone'
      },
    ];

    this.setData = data => {
      const inputs = form.querySelectorAll('input');
      Array.prototype.forEach.call(inputs, x => {
        x.value = data[x.id] || '';
      })
    }
    
    this.getData = () => {
      const inputs = form.querySelectorAll('input');
    
      return Array.prototype.reduce.call(inputs, (acc, x) => {
        acc[x.id] = x.value;
        return acc;
      }, {});
    }
    
    this.validate = () => {
      const data = this.getData();
    
      const errors = validationRules.reduce((acc, x) => {
        const value = data[x.id];
        const isFieldValid = x.predicates.every(predicate => predicate(value));
  
        if (!isFieldValid) {
          form[x.id].classList.add('form__input--error');
          return acc.concat([x.error]);
        }
    
        return acc;
      }, []);
    
      return {
        isValid: errors.length === 0, 
        errorFields: errors
      };
    }
  
    const modifyFormState = (status, message) => {
      const resultClass = {
        success: 'form__result--success',
        error: 'form__result--error',
        progress: 'form__result--progress'
      };
  
      // it's okay, classList.remove doesn't throw exception if class doesn't exist
      formResult.classList.remove(resultClass.progress);
      formResult.classList.add(resultClass[status]);
  
      if (status === 'error') {
        const errorMessage = document.createElement('div');
        errorMessage.classList.add('form__error-message');
        errorMessage.textContent = message;
        formResult.appendChild(errorMessage);
      }
    };
    
    const sendRequest = body => {
      const xhr = new XMLHttpRequest();
      console.log('Sending request to ' + action);
      
      xhr.open("POST", action, true);
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      
      xhr.onreadystatechange = function() {
        if (this.readyState === 4 && this.response) {
          const parsedResponse = JSON.parse(this.response);
          const { status, timeout, reason } = parsedResponse;
          modifyFormState(status, reason);
  
          if (status === 'progress') {
            setTimeout(sendRequest, timeout, body);
          }
        }
      }
    
      xhr.send(body);
    }
    
    this.submit = event => {
      event && event.preventDefault();
    
      const { isValid } = this.validate();
      const data = this.getData();
      const queryParams = Object.keys(data).reduce((acc, x) => {
        if (data[x]) {
          return acc.concat(form[x].name + '=' + encodeURIComponent(data[x]));
        }
        return acc;
      }, []);
      const body = queryParams.join('&');
  
      if (isValid) {
        submitBtn.classList.add('form__btn--disabled');
        submitBtn.disabled = true;
        
        sendRequest(body);
      }
    };

    form.addEventListener('submit', this.submit);
  };

  return MyForm;
})();

const form = new MyForm(document.getElementById('myForm'));