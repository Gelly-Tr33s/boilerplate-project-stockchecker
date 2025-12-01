const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  
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
      .query({ stock: 'GOOG', like: true })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'stockData');
        assert.property(res.body.stockData, 'stock');
        assert.property(res.body.stockData, 'price');
        assert.property(res.body.stockData, 'likes');
        assert.equal(res.body.stockData.stock, 'GOOG');
        assert.isNumber(res.body.stockData.price);
        assert.isNumber(res.body.stockData.likes);
        assert.isAtLeast(res.body.stockData.likes, 1);
        done();
      });
  });

  test('Viewing the same stock and liking it again: GET request to /api/stock-prices/', function(done) {
    chai.request(server)
      .get('/api/stock-prices')
      .query({ stock: 'GOOG', like: true })
      .end(function(err, res) {
        const firstLikes = res.body.stockData.likes;
        
        // Try to like again from same IP
        chai.request(server)
          .get('/api/stock-prices')
          .query({ stock: 'GOOG', like: true })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.property(res.body, 'stockData');
            assert.property(res.body.stockData, 'stock');
            assert.property(res.body.stockData, 'price');
            assert.property(res.body.stockData, 'likes');
            assert.equal(res.body.stockData.stock, 'GOOG');
            assert.isNumber(res.body.stockData.price);
            assert.isNumber(res.body.stockData.likes);
            // Likes should be the same (only 1 like per IP)
            assert.equal(res.body.stockData.likes, firstLikes);
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
        assert.property(res.body, 'stockData');
        assert.isArray(res.body.stockData);
        assert.equal(res.body.stockData.length, 2);
        
        // Check first stock
        assert.property(res.body.stockData[0], 'stock');
        assert.property(res.body.stockData[0], 'price');
        assert.property(res.body.stockData[0], 'rel_likes');
        assert.equal(res.body.stockData[0].stock, 'GOOG');
        assert.isNumber(res.body.stockData[0].price);
        assert.isNumber(res.body.stockData[0].rel_likes);
        
        // Check second stock
        assert.property(res.body.stockData[1], 'stock');
        assert.property(res.body.stockData[1], 'price');
        assert.property(res.body.stockData[1], 'rel_likes');
        assert.equal(res.body.stockData[1].stock, 'MSFT');
        assert.isNumber(res.body.stockData[1].price);
        assert.isNumber(res.body.stockData[1].rel_likes);
        
        // Check that rel_likes are opposites
        assert.equal(
          res.body.stockData[0].rel_likes,
          -res.body.stockData[1].rel_likes
        );
        done();
      });
  });

  test('Viewing two stocks and liking them: GET request to /api/stock-prices/', function(done) {
    chai.request(server)
      .get('/api/stock-prices')
      .query({ stock: ['GOOG', 'MSFT'], like: true })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'stockData');
        assert.isArray(res.body.stockData);
        assert.equal(res.body.stockData.length, 2);
        
        // Check first stock
        assert.property(res.body.stockData[0], 'stock');
        assert.property(res.body.stockData[0], 'price');
        assert.property(res.body.stockData[0], 'rel_likes');
        assert.equal(res.body.stockData[0].stock, 'GOOG');
        assert.isNumber(res.body.stockData[0].price);
        assert.isNumber(res.body.stockData[0].rel_likes);
        
        // Check second stock
        assert.property(res.body.stockData[1], 'stock');
        assert.property(res.body.stockData[1], 'price');
        assert.property(res.body.stockData[1], 'rel_likes');
        assert.equal(res.body.stockData[1].stock, 'MSFT');
        assert.isNumber(res.body.stockData[1].price);
        assert.isNumber(res.body.stockData[1].rel_likes);
        
        // Check that rel_likes are opposites
        assert.equal(
          res.body.stockData[0].rel_likes,
          -res.body.stockData[1].rel_likes
        );
        done();
      });
  });

});