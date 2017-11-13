const _ = require('underscore');
const modelToken = require('./model/token');
const log = require('debug')('r2:token');

module.exports = function Token(app, conf) {
  const getConf = conf || app.config('jwt');
  if (!getConf) {
    return log('jwt config not found!');
  }

  const mToken = modelToken(app);
  const { secret } = getConf;
  const { getToken, decodeToken } = app.utils;

  return {
    create(data = {}) {
      const { email = 'test@r2js.org', type = 'login' } = data;
      const { token } = getToken({ email, type }, secret);
      const saveObj = { email, type, token };
      return mToken.findOrCreate(
        saveObj, Object.assign({}, saveObj, { data: _.omit(data, 'email', 'type') })
      );
    },

    check(token, type = 'login') {
      let tokenData;
      return mToken.findOneOrError({ token })
        .then((data) => {
          const decoded = decodeToken(data.token, secret);
          if (type !== data.type || type !== decoded.type) {
            return Promise.reject('wrong token type!');
          }

          tokenData = data;
          return this.remove(data.token);
        })
        .then(() => tokenData);
    },

    remove(tokenStr) {
      return mToken.remove({ token: tokenStr });
    },
  };
};
