const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  // Increase timeout to 5000ms to handle slow external API calls
  this.timeout(5000);

  test('Viewing one stock: GET request to /api/stock-prices/', function(done) {
    chai.request(server)
      .get('/api/stock-prices')
      .query({ stock: 'GOOG' })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'stockData');
        assert.property(res.body.stockData, 'stock');
        assert.property(res.body.stockData, 'price');
        assert.property(res.body.stockData, 'likes');
        assert.equal(res.body.stockData.stock, 'GOOG');
        assert.isNumber(res.body.stockData.price);
        assert.isNumber(res.body.stockData.likes);
        done();
      });
  });

  test('Viewing one stock and liking it: GET request to /api/stock-prices/', function(done) {
    chai.request(server)
      .get('/api/stock-prices')
      .query({ stock: 'GOOG', like: 'true' })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'stockData');
        assert.equal(res.body.stockData.stock, 'GOOG');
        assert.isNumber(res.body.stockData.likes);
        assert.isAbove(res.body.stockData.likes, 0);
        done();
      });
  });

  test('Viewing the same stock and liking it again: GET request to /api/stock-prices/', function(done) {
    chai.request(server)
      .get('/api/stock-prices')
      .query({ stock: 'GOOG', like: 'true' })
      .end(function(err, res) {
        const firstLikes = res.body.stockData.likes;
        
        chai.request(server)
          .get('/api/stock-prices')
          .query({ stock: 'GOOG', like: 'true' })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.stockData.stock, 'GOOG');
            assert.equal(res.body.stockData.likes, firstLikes); // Likes should not increase
            done();
          });
      });
  });

  test('Viewing two stocks: GET request to /api/stock-prices/', function(done) {
    chai.request(server)
      .get('/api/stock-prices')
      .query({ stock: ['GOOG', 'MSFT'] })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body.stockData);
        assert.equal(res.body.stockData.length, 2);
        
        const stock1 = res.body.stockData[0];
        const stock2 = res.body.stockData[1];

        assert.property(stock1, 'rel_likes');
        assert.property(stock2, 'rel_likes');
        assert.equal(stock1.rel_likes + stock2.rel_likes, 0); // They should be opposites
        done();
      });
  });

  test('Viewing two stocks and liking them: GET request to /api/stock-prices/', function(done) {
    chai.request(server)
      .get('/api/stock-prices')
      .query({ stock: ['GOOG', 'MSFT'], like: 'true' })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body.stockData);
        
        const stock1 = res.body.stockData[0];
        const stock2 = res.body.stockData[1];

        assert.property(stock1, 'rel_likes');
        assert.property(stock2, 'rel_likes');
        assert.equal(stock1.rel_likes + stock2.rel_likes, 0);
        done();
      });
  });

});