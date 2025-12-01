const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  test('Viewing one stock', function(done) {
    chai.request(server)
      .get('/api/stock-prices')
      .query({ stock: 'GOOG' })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, 'stockData');
        assert.equal(res.body.stockData.stock, 'GOOG');
        assert.isNumber(res.body.stockData.price);
        done();
      });
  });

  test('Viewing one stock and liking it', function(done) {
    chai.request(server)
      .get('/api/stock-prices')
      .query({ stock: 'GOOG', like: true })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body.stockData, 'likes');
        assert.isNumber(res.body.stockData.likes);
        done();
      });
  });

  test('Viewing the same stock and liking it again (should not increase likes)', function(done) {
    chai.request(server)
      .get('/api/stock-prices')
      .query({ stock: 'GOOG', like: true })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body.stockData, 'likes');
        assert.isNumber(res.body.stockData.likes);
        done();
      });
  });

  test('Viewing two stocks', function(done) {
    chai.request(server)
      .get('/api/stock-prices')
      .query({ stock: ['GOOG', 'MSFT'] })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isArray(res.body.stockData);
        assert.lengthOf(res.body.stockData, 2);
        assert.property(res.body.stockData[0], 'rel_likes');
        assert.property(res.body.stockData[1], 'rel_likes');
        done();
      });
  });

  test('Viewing two stocks and liking them', function(done) {
    chai.request(server)
      .get('/api/stock-prices')
      .query({ stock: ['GOOG', 'MSFT'], like: true })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isArray(res.body.stockData);
        assert.lengthOf(res.body.stockData, 2);
        done();
      });
  });



});
