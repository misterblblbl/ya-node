'use strict';

const MyForm = (() => {
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

  const MyForm = function(form) {
    this.form = form;
    this.action = form.action;
    this.formResult = form.querySelector('#resultContainer');
    this.submitBtn = form.querySelector('#submitButton');
  
    this.validationRules = [
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
  
    this.validate = this.validate.bind(this);
    this.submit = this.submit.bind(this);
    this.getData = this.getData.bind(this);
    this.setData = this.setData.bind(this);
    this.sendRequest = this.sendRequest.bind(this);
    this.modifyFormState = this.modifyFormState.bind(this);
  
    form.addEventListener('submit', this.submit);
  }
  
  MyForm.prototype.setData = function(data) {
    const inputs = this.form.querySelectorAll('input');
    Array.prototype.forEach.call(inputs, x => {
      x.value = data[x.id] || '';
    })
  }
  
  MyForm.prototype.getData = function() {
    const inputs = this.form.querySelectorAll('input');
  
    return Array.prototype.reduce.call(inputs, (acc, x) => {
      acc[x.id] = x.value;
      return acc;
    }, {});
  }
  
  MyForm.prototype.validate = function() {
    const data = this.getData();
  
    const errors = this.validationRules.reduce((acc, x) => {
      const value = data[x.id];
      const isFieldValid = x.predicates.every(predicate => predicate(value));

      if (!isFieldValid) {
        this.form[x.id].classList.add('form__input--error');
        return acc.concat([x.error]);
      }
  
      return acc;
    }, []);
  
    return {
      isValid: errors.length === 0, 
      errorFields: errors
    };
  }

  MyForm.prototype.modifyFormState = function(status, message) {
    const resultClass = {
      success: 'form__result--success',
      error: 'form__result--error',
      progress: 'form__result--progress'
    };

    // it's okay, classList.remove doesn't throw exception if class doesn't exist
    this.formResult.classList.remove(resultClass.progress);
    this.formResult.classList.add(resultClass[status]);

    if (status === 'error') {
      const errorMessage = document.createElement('div');
      errorMessage.classList.add('form__error-message');
      errorMessage.textContent = message;
      this.formResult.appendChild(errorMessage);
    }
  }
  
  MyForm.prototype.sendRequest = function(body) {
    const self = this;
    const xhr = new XMLHttpRequest();
    console.log('Request to ' + this.action);
  
    xhr.open("POST", self.action, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  
    xhr.onreadystatechange = function() {
      if (this.readyState === 4 && this.response) {
        const parsedResponse = JSON.parse(this.response);
        const { status, timeout, reason } = parsedResponse;
        self.modifyFormState(status, reason);

        if (status === 'progress') {
          setTimeout(self.sendRequest, timeout, body);
        }
      }
    }
  
    xhr.send(body);
  }
  
  MyForm.prototype.submit = function(event) {
    event && event.preventDefault();
  
    const { isValid } = this.validate();
    const data = this.getData();
    const queryParams = Object.keys(data).reduce((acc, x) => {
      if (data[x]) {
        return acc.concat(this.form[x].name + '=' + encodeURIComponent(data[x]));
      }
      return acc;
    }, []);
    const body = queryParams.join('&');

    if (isValid) {
      this.submitBtn.classList.add('form__btn--disabled');
      this.submitBtn.disabled = true;
      
      this.sendRequest(body);
    }
  }

  return MyForm;
})();

const form = new MyForm(document.getElementById('myForm'));