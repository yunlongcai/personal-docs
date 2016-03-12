'use strict';

const process = require('process');

/**
 * internal state of promise
 *          { => fulfilled 
 * pending  |
 *          { => rejected
 * 
 */
function CPromise(fn) {
  let _state = 'pending';
  let _value = null;
  let _deferreds = [];

  this.then = function (onResolved, onRejected) {
    let newPromise = new CPromise(function (resolve, reject) {
      handle({
        onResolved: onResolved,
        resolve: resolve,
        onRejected: onRejected,
        reject: reject
      });
    });
    return newPromise;
  }

  this.catch = function(onRejected) {
    return this.then(undefined, onRejected);
  }

  function handle(deferred) {
    if (_state === 'pending') {
      _deferreds.push(deferred);
      return;
    }

    process.nextTick(() => {

      let newValue;
      if (_state === 'fulfilled') {
        if (deferred.onResolved) {
          newValue = deferred.onResolved(_value);
        } else {
          newValue = _value;
        }
        deferred.resolve(newValue);

      } else {
        if (deferred.onRejected) {
          newValue = deferred.onRejected(_value);
        } else {
          newValue = _value;
        }
        deferred.reject(newValue);
      }

    });
  }

  function handleDeferreds() {
    _deferreds.forEach(function (deferred) {
      handle(deferred);
    });
  }

  function resolve(newValue) {
    if (newValue === this) {
      throw new TypeError('cannot be the same promise.');
    }
    
    // 如果是一个类 promise 对象，递归调用 resolve 函数。
    // 这个 resolve 代表当前的 promise ， 通过闭包的方式，保留当前的变量，如 _state, _value, _deferreds
    if (newValue && typeof newValue.then === 'function') {
      newValue.then(resolve);
      return;
    }

    if (_state !== 'pending') {
      return;
    }

    _state = 'fulfilled';
    _value = newValue;

    handleDeferreds();

  }

  function reject(reason) {
    if (_state !== 'pending') {
      return;
    }
    
    _state = 'rejected';
    _value = reason;
    
    handleDeferreds();
  }

  fn(resolve, reject);
}


let promise = new CPromise(function (resolve, reject) {
  process.nextTick(() => {
    resolve(10);
  });
});

promise.then(function (value) {
  console.log(value);
  return value + 1;
}).then(function (value) {
  console.log(value);
  return value + 1;
}).then(function (value) {
  console.log(value);
  return value + 1;
}).then(function (value) {
  console.log(value);
  return value + 1;
});

let promise2 = new CPromise(function (resolve, reject) {
  process.nextTick(() => {
    reject('ERR: ');
  });
});

promise2.then(function(value) {
  
}, function(err) {
  console.log(err);
  return err + 'NEW ';
});

let promise3 = new CPromise(function(resolve, reject) {
  resolve(10);
});

promise3.then(function (value) {
  console.log(value);
  return value + 1;
}).then(function (value) {
  console.log(value);
  return value + 1;
}).then(function (value) {
  console.log(value);
  return value + 1;
}).then(function (value) {
  console.log(value);
  return value + 1;
});

let promise4 = new CPromise(function(resolve, reject) {
  reject(10);
});

promise4.then(function (value) {
  console.log(value);
  return value + 1;
}).then(function (value) {
  console.log(value);
  return value + 1;
}).then(function (value) {
  console.log(value);
  return value + 1;
}).then(function (value) {
  console.log(value);
  return value + 1;
}).catch(function(err) {
  console.log('Err: ' + err);
  return err;
});