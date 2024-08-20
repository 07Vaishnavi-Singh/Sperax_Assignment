const express = require('express');
const Moralis = require('moralis').default;
const ethers = require('ethers'); 

  
Moralis.start({
    apiKey:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjQwZTk4NzFjLTM5OWMtNGVlMy1hYTdhLTQzMjZhZDY3M2Y3MCIsIm9yZ0lkIjoiMzQwNjUwIiwidXNlcklkIjoiMzUwMTk4IiwidHlwZSI6IlBST0pFQ1QiLCJ0eXBlSWQiOiIzYWI3ZTAxZi1jZjRjLTRmNmMtOTE5Ny0zMWVjODM2YmYzMzIiLCJpYXQiOjE2ODc0NDA3OTcsImV4cCI6NDg0MzIwMDc5N30.1mRPiRO6rI5j2-PLNNZzCrzJjtS8RpJSPZ535S2Paps",
  });

const app = express();
const PORT = 5000;

app.use(express.json());


app.get('/getNativeBalance', async (req, res) => {
    const { chain, address, tokenAddress , symbol } = req.body;
  
    try {
         const response = await Moralis.EvmApi.balance.getNativeBalance({
            "chain": chain,
            "address": address
          });
          res.json(response.raw);
    
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch Native balance' });
    }
  });

app.get('/getBalance', async (req, res) => {
  const { chain, address, tokenAddress, symbol  } = req.body;

  try {
   const response = await Moralis.EvmApi.token.getWalletTokenBalances({
        "chain": chain,
        "address": address
      });
      const tokens = response.raw;
      const token = tokens.find(t => t.symbol.toUpperCase() === symbol.toUpperCase());

      if (token) {
        const balance = ethers.utils.formatUnits(token.balance, token.decimals);
        res.json({ balance });
      } else{
        const balance = 0;
        res.json({balance})
      }

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch balance' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
