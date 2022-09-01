const isEmpty = (obj) => {
  return Object.keys(obj).length === 0;
}

const sleep = (time) => {
  return new Promise((resolve) => setTimeout(resolve, time));
}

// named export
module.exports = {
  isEmpty,
  sleep,
};