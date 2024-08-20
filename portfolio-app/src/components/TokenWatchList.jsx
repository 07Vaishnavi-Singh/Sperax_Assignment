import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';

// Replace with actual ERC20 ABI
const ERC20_ABI = [
    "function totalSupply() view returns (uint256)",
    "function balanceOf(address owner) view returns (uint256)",
    "function transfer(address to, uint256 value) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function approve(address spender, uint256 value) returns (bool)",
    "function transferFrom(address from, address to, uint256 value) returns (bool)",
    "event Transfer(address indexed from, address indexed to, uint256 value)",
    "event Approval(address indexed owner, address indexed spender, uint256 value)",
    "function decimals() view returns (uint8)",
    "function name() view returns (string)",
    "function symbol() view returns (string)"
  ];
  
// Hardcoded token addresses for Ethereum Mainnet
const tokenAddresses = {
    1: { // Ethereum Mainnet
      'ETH': '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      'DAI': '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      'USDC': '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      'USDT': '0xdac17f958d2ee523a2206206994597c13d831ec7',
      'UNI': '0x5C69b1c8D2f817c04D7D8a7d529b08Bf16c4b65',
      'LINK': '0x514910771af9ca656af840dff83e8264ecf986ca',
      'WBTC': '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
      'MKR': '0xA1Ff1A1f5F19A2a6Bfcd8D6Be3a8c545E74B67F2',
      'SUSHI': '0x6b3595068778dd592e39a122f4f5a5f9b6a26f83',
      'BAT': '0x0D8775F648430679A709E98d2b0Cb6250d2887EF',
      'COMP': '0xc00e94cb662c3520282e6f5717214004a7f26888',
      'AAVE': '0x7FcF7D2C702BF9e062eD8AB7A7cBEf7a18D8D848',
      'CRV': '0xD533a949740bb3306d119CC777fa900bA034cd52',
      'YFI': '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6c19D8',
      'LDO': '0x5A98FcBEA516Cf06857cF2F5dC20e6d8d8d4d9d9',
      'RUNE': '0x7C8F4348BC8d2a7d16Fbe7BC01F046bC3f007f08',
      '1INCH': '0x111111111117dC0aa78b770fA6A738034120C302',
      'GRT': '0x7fA3b1464BF1E2D3d8F1dDE5B6394472C29F6A6B'
    },
  };
  
 
const TokenWatchList = () => {
    const [tokens, setTokens] = useState([]);
    const [newToken, setNewToken] = useState('');
    const [balances, setBalances] = useState({});
    const [error, setError] = useState('');
    const [tokenErrors, setTokenErrors] = useState({});
  
    // Replace with your Ethereum provider URL
    const provider = new ethers.providers.JsonRpcProvider('https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID');
  
    const fetchBalances = async () => {
      const updatedBalances = {};
      const errors = {};
      const chainId = 1; // Ethereum Mainnet chain ID
      for (const token of tokens) {
        try {
          const address = tokenAddresses[chainId][token.symbol];
          if (!address) {
            errors[token.symbol] = 'Token does not exist or symbol is incorrect';
            updatedBalances[token.symbol] = 'Error';
            continue;
          }
  
          const contract = new ethers.Contract(address, ERC20_ABI, provider);
          const balance = await contract.balanceOf('0xYourWalletAddressHere'); // Replace with actual wallet address
          const decimals = await contract.decimals();
          updatedBalances[token.symbol] = ethers.utils.formatUnits(balance, decimals);
        } catch (error) {
          console.error(`Failed to fetch balance for ${token.symbol}:`, error);
          updatedBalances[token.symbol] = 'Error';
          errors[token.symbol] = 'Failed to fetch balance';
        }
      }
      setBalances(updatedBalances);
      setTokenErrors(errors);
    };
  
    useEffect(() => {
      if (tokens.length > 0) {
        fetchBalances();
      }
    }, [tokens]);
  
    const handleAddToken = async () => {
      if (!newToken) return;
      const symbol = newToken.toUpperCase();
      const address = tokenAddresses[1][symbol]; // Use Ethereum Mainnet chain ID
  
      if (!address) {
        setError('Token does not exist or symbol is incorrect');
        return;
      }
  
      if (tokens.find(token => token.symbol === symbol)) {
        setError('Token already added');
        return;
      }
  
      setTokens([...tokens, { symbol }]);
      setNewToken('');
      setError('');
    };
  
    return (
      <div className="p-4 bg-gray-800 text-white">
        <div className="mb-4 flex items-center">
          <input
            type="text"
            placeholder="Add token by symbol"
            value={newToken}
            onChange={(e) => setNewToken(e.target.value)}
            className="mr-2 p-2 border border-gray-400 rounded bg-gray-700 text-white"
          />
          <button
            onClick={handleAddToken}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Add Token
          </button>
          {error && <p className="ml-4 text-red-500">{error}</p>}
        </div>
  
        <ul>
          {tokens.length === 0 ? (
            <p className="text-gray-500">No tokens added.</p>
          ) : (
            tokens.map((token, index) => (
              <li key={index} className="mb-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold">{token.symbol}</span>
                  <span>
                    {tokenErrors[token.symbol] || balances[token.symbol] || 'Loading...'}
                  </span>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    );
  };
  
  export default TokenWatchList;