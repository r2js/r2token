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
      const { email = '', type = 'login' } = data;
      const getData = Object.assign(data, { email, type });
      const { token } = getToken(getData, secret);
      const saveObj = { email, type, token };

      return mToken.findOrCreate(
        saveObj, Object.assign({}, saveObj, { data: _.omit(getData, 'email', 'type') })
      );
    },

    check(token, type = 'login') {
      return mToken.findOneOrError({ token })
        .then((data) => {
          const decoded = decodeToken(data.token, secret);
          if (type !== data.type || type !== decoded.type) {
            return Promise.reject('wrong token type!');
          }

          return data;
        });
    },

    remove(tokenStr) {
      return mToken.remove({ token: tokenStr });
    },
  };
};
