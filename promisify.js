const promisifyMy = (fn) => {
  return (...args) => {
    return new Promise((resolve, reject) => {
      function customCallback(err, ...results) {
        if (err) {
          return reject(err);
        }
        return resolve(results.length === 1 ? results[0] : results);
      }
      args.push(customCallback);
      fn.call(this, ...args);
    });
  };
};

const promisifyMyAll = (obj) => {
  const objValue = Object.values(obj);
  for (let item of objValue) {
    let getFunction = promisifyMy(item);
    getFunction(1, 2).then((res) => {
      console.log(res);
    });
  }
};

const obj = {
  getSum: (number1, number2, callback) => {
    if (!number1 || !number2) {
      return callback(new Error("Missing dependencies"), null);
    }
    const sum = number1 + number2;
    const message = `Sum is ${sum}`;
    return callback(null, sum, message);
  },

  getMultiplication: (number1, number2, callback) => {
    if (!number1 || !number2) {
      return callback(new Error("Missing dependencies"), null);
    }
    const multiplication = number1 * number2;
    const message = `multiplication is ${multiplication}`;
    return callback(null, multiplication, message);
  },
};

promisifyMyAll(obj);
