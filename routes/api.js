'use strict';
//const fetch = require('node-fetch');
const crypto = require('crypto');


module.exports = function (app) {

  // In-memory storage
  const stockLikes = {}; // { STOCK: Set([hashedIPs]) }

  function hashIP(ip) {
    return crypto.createHash("sha256").update(ip).digest("hex");
  }

  async function getStockData(stock) {
    const url = `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock}/quote`;
    const response = await fetch(url);
    const data = await response.json();
    return {
      stock: data.symbol,
      price: data.latestPrice
    };
  } 

  app.route('/api/stock-prices')
    .get(async function (req, res){
 
      try {
        let { stock, like } = req.query;
        let ip = req.ip || req.connection.remoteAddress;
        const hashedIP = hashIP(ip);
        like = like === 'true';

        // allow array or single value
        if (!Array.isArray(stock)) stock = [stock];

        const results = [];

        for (let s of stock) {
          const symbol = s.toUpperCase();

          // initialize likes set
          if (!stockLikes[symbol]) stockLikes[symbol] = new Set();

          if (like) {
            stockLikes[symbol].add(hashedIP);
          }

          const stockData = await getStockData(symbol);
          const likes = stockLikes[symbol].size;

          results.push({
            stock: stockData.stock,
            price: stockData.price,
            likes
          });
        }

        // If 2 stocks → convert to rel_likes format
        if (results.length === 2) {
          const [s1, s2] = results;
          const rel1 = s1.likes - s2.likes;
          const rel2 = s2.likes - s1.likes;

          return res.json({
            stockData: [
              { stock: s1.stock, price: s1.price, rel_likes: rel1 },
              { stock: s2.stock, price: s2.price, rel_likes: rel2 }
            ]
          });
        }

        // Single stock
        return res.json({ stockData: results[0] });

      } catch (err) {
        return res.json({ error: 'External API error', details: err.message });
      }      

    });
    
};
