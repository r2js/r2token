const chai = require('chai');
const r2base = require('r2base');
const r2mongoose = require('r2mongoose');
const r2query = require('r2query');
const r2system = require('r2system');
const r2plugin = require('r2plugin');
const r2token = require('../index');

const { expect } = chai;
process.chdir(__dirname);

const app = r2base();
app.start()
  .serve(r2mongoose, { database: 'r2test' })
  .serve(r2query)
  .serve(r2system)
  .serve(r2plugin)
  .serve(r2token, { secret: '1234' })
  .into(app);

const Mongoose = app.service('Mongoose');
const Token = app.service('Token');

before((done) => {
  Mongoose.set('debug', false);
  done();
});

function dropDatabase(done) {
  this.timeout(0);
  Mongoose.connection.db.dropDatabase();
  done();
}

after(dropDatabase);

describe('r2token', () => {
  it('should create token', (done) => {
    Token.create({ email: 'test@app.com', name: 'Test', slug: 'test' })
      .then((tokenData) => {
        const { email, type, token, data } = tokenData.doc;
        expect(email).to.equal('test@app.com');
        expect(type).to.equal('login');
        expect(token).to.not.equal(undefined);
        expect(data).to.deep.equal({ slug: 'test', name: 'Test' });
        done();
      })
      .catch(done);
  });

  it('should check token', (done) => {
    Token.create({ email: 'test2@app.com', name: 'Test 2', slug: 'test2' })
      .then(data => Token.check(data.doc.token))
      .then((tokenData) => {
        const { email, type, token, data } = tokenData;
        expect(email).to.equal('test2@app.com');
        expect(type).to.equal('login');
        expect(token).to.not.equal(undefined);
        expect(data).to.deep.equal({ slug: 'test2', name: 'Test 2' });
        done();
      })
      .catch(done);
  });

  it('should remove token', (done) => {
    Token.create({ email: 'test3@app.com', name: 'Test 3', slug: 'test3' })
      .then(data => Token.remove(data.doc.token))
      .then((data) => {
        expect(data.result).to.deep.equal({ n: 1, ok: 1 });
        done();
      });
  });

  it('should not create token via same email', (done) => {
    Token.create({ email: 'test@app.com', name: 'Test', slug: 'test' })
      .then((tokenData) => {
        expect(tokenData.created).to.equal(false);
        const { email, type, token, data } = tokenData.doc;
        expect(email).to.equal('test@app.com');
        expect(type).to.equal('login');
        expect(token).to.not.equal(undefined);
        expect(data).to.deep.equal({ slug: 'test', name: 'Test' });
        done();
      })
      .catch(done);
  });

  it('should not create token via invalid token type', (done) => {
    Token.create({ email: 'test@app.com', name: 'Test', slug: 'test' })
      .then(data => Token.check(data.doc.token, 'testAction'))
      .then(done)
      .catch((err) => {
        expect(err).to.equal('wrong token type!');
        done();
      });
  });
});
