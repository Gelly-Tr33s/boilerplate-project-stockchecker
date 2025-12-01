'use strict';

const crypto = require('crypto');

module.exports = function (app) {

  // In-memory like storage
  const likesDB = {};

  function getAnonymizedIP(req) {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
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
      const isLike = like === 'true'; // Strict boolean check

      try {
        // ----- Single stock -----
        if (!Array.isArray(stock)) {
          const stockName = stock.toUpperCase();
          const stockInfo = await fetchStock(stockName);

          if (!likesDB[stockName]) likesDB[stockName] = new Set();
          if (isLike) likesDB[stockName].add(ipHash);

          return res.json({
            stockData: {
              stock: stockInfo.stock,
              price: stockInfo.price,
              likes: likesDB[stockName].size
            }
          });
        }

        // ----- Two stocks -----
        // Use Promise.all to fetch concurrently (prevents timeouts)
        const [stock1, stock2] = [stock[0].toUpperCase(), stock[1].toUpperCase()];
        
        const [data1, data2] = await Promise.all([
            fetchStock(stock1),
            fetchStock(stock2)
        ]);

        if (!likesDB[stock1]) likesDB[stock1] = new Set();
        if (!likesDB[stock2]) likesDB[stock2] = new Set();

        if (isLike) {
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
        res.status(500).json({ error: 'Error fetching stock data' });
      }
    });
};

