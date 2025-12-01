const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  this.timeout(5000);
  
  test('Viewing one stock: GET request to /api/stock-prices/', function(done) {
    chai.request(server)
      .keepOpen()
      .get('/api/stock-prices')
      .query({ stock: 'GOOG' })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'stockData');
        assert.isObject(res.body.stockData);
        assert.equal(res.body.stockData.stock, 'GOOG');
        assert.isNumber(res.body.stockData.price);
        assert.isNumber(res.body.stockData.likes);
        done();
      });
  });
  
  test('Viewing one stock and liking it: GET request to /api/stock-prices/', function(done) {
    chai.request(server)
      .keepOpen()
      .get('/api/stock-prices')
      .query({ stock: 'GOOG', like: true })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'stockData');
        assert.equal(res.body.stockData.stock, 'GOOG');
        assert.isNumber(res.body.stockData.price);
        assert.isNumber(res.body.stockData.likes);
        done();
      });
  });
  
  test('Viewing the same stock and liking it again: GET request to /api/stock-prices/', function(done) {
    chai.request(server)
      .keepOpen()
      .get('/api/stock-prices')
      .query({ stock: 'GOOG', like: true })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'stockData');
        assert.equal(res.body.stockData.stock, 'GOOG');
        assert.isNumber(res.body.stockData.price);
        assert.isNumber(res.body.stockData.likes);
        done();
      });
  });
  
  test('Viewing two stocks: GET request to /api/stock-prices/', function(done) {
    chai.request(server)
      .keepOpen()
      .get('/api/stock-prices')
      .query({ stock: ['GOOG', 'MSFT'] })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'stockData');
        assert.isArray(res.body.stockData);
        assert.lengthOf(res.body.stockData, 2);
        res.body.stockData.forEach(stock => {
          assert.isString(stock.stock);
          assert.isNumber(stock.price);
          assert.isNumber(stock.rel_likes);
        });
        done();
      });
  });
  
  test('Viewing two stocks and liking them: GET request to /api/stock-prices/', function(done) {
    chai.request(server)
      .keepOpen()
      .get('/api/stock-prices')
      .query({ stock: ['GOOG', 'MSFT'], like: true })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'stockData');
        assert.isArray(res.body.stockData);
        assert.lengthOf(res.body.stockData, 2);
        res.body.stockData.forEach(stock => {
          assert.isString(stock.stock);
          assert.isNumber(stock.price);
          assert.isNumber(stock.rel_likes);
        });
        done();
      });
  });
  
});