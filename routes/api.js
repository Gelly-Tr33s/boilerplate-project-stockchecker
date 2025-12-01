'use strict';

const crypto = require('crypto');

module.exports = function (app) {

  // In-memory like storage
  const likesDB = {};

  function getAnonymizedIP(req) {
    const ip = req.ip || req.headers['x-forwarded-for'] || '0.0.0.0';
    return crypto.createHash('sha256').update(ip).digest('hex');
  }

  async function fetchStock(stock) {
    const url = `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock}/quote`;
    const response = await fetch(url);
    const data = await response.json();

    return {
      stock: data.symbol,
      price: data.latestPrice
    };
  }

  app.route('/api/stock-prices')
    .get(async (req, res) => {
      const { stock, like } = req.query;
      const ipHash = getAnonymizedIP(req);

      try {
        // ----- Single stock -----
        if (!Array.isArray(stock)) {
          const stockInfo = await fetchStock(stock.toUpperCase());

          if (!likesDB[stockInfo.stock]) likesDB[stockInfo.stock] = new Set();

          if (like) likesDB[stockInfo.stock].add(ipHash);

          return res.json({
            stockData: {
              stock: stockInfo.stock,
              price: stockInfo.price,
              likes: likesDB[stockInfo.stock].size
            }
          });
        }

        // ----- Two stocks -----
        const stock1 = stock[0].toUpperCase();
        const stock2 = stock[1].toUpperCase();

        const data1 = await fetchStock(stock1);
        const data2 = await fetchStock(stock2);

        if (!likesDB[stock1]) likesDB[stock1] = new Set();
        if (!likesDB[stock2]) likesDB[stock2] = new Set();

        if (like) {
          likesDB[stock1].add(ipHash);
          likesDB[stock2].add(ipHash);
        }

        const likes1 = likesDB[stock1].size;
        const likes2 = likesDB[stock2].size;

        return res.json({
          stockData: [
            {
              stock: data1.stock,
              price: data1.price,
              rel_likes: likes1 - likes2
            },
            {
              stock: data2.stock,
              price: data2.price,
              rel_likes: likes2 - likes1
            }
          ]
        });

      } catch (err) {
        console.error(err);
        res.json({ error: 'Error fetching stock data' });
      }
    });
};

