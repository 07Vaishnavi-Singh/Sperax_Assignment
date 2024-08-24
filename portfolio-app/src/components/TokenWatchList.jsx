import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Replace with actual ERC20 ABI
const ERC20_ABI = 
    [
        {
          "constant": true,
          "inputs": [],
          "name": "name",
          "outputs": [{"name": "", "type": "string"}],
          "type": "function"
        },
        {
          "constant": true,
          "inputs": [],
          "name": "symbol",
          "outputs": [{"name": "", "type": "string"}],
          "type": "function"
        },
        {
          "constant": true,
          "inputs": [],
          "name": "decimals",
          "outputs": [{"name": "", "type": "uint8"}],
          "type": "function"
        },
        {
          "constant": true,
          "inputs": [],
          "name": "totalSupply",
          "outputs": [{"name": "", "type": "uint256"}],
          "type": "function"
        },
        {
          "constant": true,
          "inputs": [{"name": "_owner", "type": "address"}],
          "name": "balanceOf",
          "outputs": [{"name": "balance", "type": "uint256"}],
          "type": "function"
        },
        {
          "constant": false,
          "inputs": [{"name": "_to", "type": "address"}, {"name": "_value", "type": "uint256"}],
          "name": "transfer",
          "outputs": [{"name": "", "type": "bool"}],
          "type": "function"
        },
        {
          "constant": false,
          "inputs": [{"name": "_from", "type": "address"}, {"name": "_to", "type": "address"}, {"name": "_value", "type": "uint256"}],
          "name": "transferFrom",
          "outputs": [{"name": "", "type": "bool"}],
          "type": "function"
        },
        {
          "constant": false,
          "inputs": [{"name": "_spender", "type": "address"}, {"name": "_value", "type": "uint256"}],
          "name": "approve",
          "outputs": [{"name": "", "type": "bool"}],
          "type": "function"
        },
        {
          "constant": true,
          "inputs": [{"name": "_owner", "type": "address"}, {"name": "_spender", "type": "address"}],
          "name": "allowance",
          "outputs": [{"name": "", "type": "uint256"}],
          "type": "function"
        },
        {
          "anonymous": false,
          "inputs": [{"indexed": true, "name": "from", "type": "address"}, {"indexed": true, "name": "to", "type": "address"}, {"indexed": false, "name": "value", "type": "uint256"}],
          "name": "Transfer",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [{"indexed": true, "name": "owner", "type": "address"}, {"indexed": true, "name": "spender", "type": "address"}, {"indexed": false, "name": "value", "type": "uint256"}],
          "name": "Approval",
          "type": "event"
        },
        {
          "constant": false,
          "inputs": [{"name": "_spender", "type": "address"}, {"name": "_value", "type": "uint256"}, {"name": "_extraData", "type": "bytes"}],
          "name": "approveAndCall",
          "outputs": [{"name": "success", "type": "bool"}],
          "type": "function"
        },
        {
          "constant": false,
          "inputs": [{"name": "_amount", "type": "uint256"}],
          "name": "burn",
          "outputs": [{"name": "success", "type": "bool"}],
          "type": "function"
        },
        {
          "constant": false,
          "inputs": [{"name": "_from", "type": "address"}, {"name": "_amount", "type": "uint256"}],
          "name": "burnFrom",
          "outputs": [{"name": "success", "type": "bool"}],
          "type": "function"
        },
        {
          "constant": false,
          "inputs": [{"name": "_to", "type": "address"}, {"name": "_amount", "type": "uint256"}],
          "name": "mint",
          "outputs": [{"name": "success", "type": "bool"}],
          "type": "function"
        },
        {
          "constant": false,
          "inputs": [],
          "name": "pause",
          "outputs": [],
          "type": "function"
        },
        {
          "constant": false,
          "inputs": [],
          "name": "unpause",
          "outputs": [],
          "type": "function"
        },
        {
          "constant": true,
          "inputs": [],
          "name": "paused",
          "outputs": [{"name": "", "type": "bool"}],
          "type": "function"
        }
      ];


// Hardcoded token addresses for Ethereum Mainnet
const tokenAddresses = {
    1: { // Ethereum Mainnet
        'ETH': '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        'DAI': '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        'USDC': '0xaf88d065e77c8cc2239327c5edb3a432268e5831',
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
        'GRT': '0x7fA3b1464BF1E2D3d8F1dDE5B6394472C29F6A6B',
        'PUSH': '0xf418588522d5dd018b425E472991E52EBBeEEEEE'
    },
};


const TokenWatchList = () => {
    const [tokens, setTokens] = useState([]);
    const [newToken, setNewToken] = useState('');
    const [balances, setBalances] = useState({});
    const [error, setError] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [walletAddress, setWalletAddress] = useState('');
    const [provider, setProvider] = useState(null);

    useEffect(() => {
        if (window.ethereum) {
            const ethProvider = new ethers.providers.Web3Provider(window.ethereum);
            setProvider(ethProvider);
        }
    }, []);

    const connectWallet = async () => {
        if (provider) {
            try {
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                const signer = provider.getSigner();
                const address = await signer.getAddress();
                setWalletAddress(address);
            } catch (error) {
                console.error('Failed to connect wallet:', error);
                setError('Failed to connect wallet');
            }
        } else {
            setError('MetaMask not detected');
        }
    };

    const handleAddToken = () => {
        if (!newToken) return;
        const symbol = newToken.toUpperCase();
        
        if (tokens.find(token => token.symbol === symbol)) {
            setError('Token already added');
            return;
        }

        setTokens([...tokens, { symbol }]);
        setNewToken('');
        setError('');
    };

    const handleRemoveToken = (symbol) => {
        setTokens(tokens.filter(token => token.symbol !== symbol));
        const updatedBalances = { ...balances };
        delete updatedBalances[symbol];
        setBalances(updatedBalances);
    };

    const fetchBalances = async () => {
        if (!provider || !walletAddress) {
            setError('Please connect your wallet first');
            return;
        }

        const updatedBalances = {};
        const blockNumber = await provider.getBlockNumber(selectedDate);

        for (const token of tokens) {
            try {
                const tokenAddress = await getTokenAddress(token.symbol);
                if (!tokenAddress) {
                    updatedBalances[token.symbol] = 'Address not found';
                    continue;
                }

                const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
                const balance = await tokenContract.balanceOf(walletAddress, { blockTag: blockNumber });
                const decimals = await tokenContract.decimals();
                updatedBalances[token.symbol] = ethers.utils.formatUnits(balance, decimals);
            } catch (error) {
                console.error(`Failed to fetch balance for ${token.symbol}:`, error);
                updatedBalances[token.symbol] = 'Error';
            }
        }

        setBalances(updatedBalances);
    };

    const getTokenAddress = async (symbol) => {
        // This function should be implemented to return the token address for a given symbol
        // You can use a token list API or your own mapping
        // For demonstration, we'll return null
        return null;
    };

    return (
        <div className="bg-gray-900 text-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Token Watch List</h2>
            <div className="flex items-center mb-4">
                <input
                    type="text"
                    placeholder="Add token by symbol"
                    value={newToken}
                    onChange={(e) => setNewToken(e.target.value)}
                    className="mr-2 px-3 py-2 border border-gray-600 rounded bg-gray-800 text-white focus:outline-none focus:border-blue-500"
                />
                <button
                    onClick={handleAddToken}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none"
                >
                    Add Token
                </button>
            </div>
            <div className="flex items-center mb-4">
                <DatePicker
                    selected={selectedDate}
                    onChange={date => setSelectedDate(date)}
                    className="mr-2 px-3 py-2 border border-gray-600 rounded bg-gray-800 text-white focus:outline-none focus:border-blue-500"
                />
                <button
                    onClick={connectWallet}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none"
                >
                    {walletAddress ? 'Wallet Connected' : 'Connect Wallet'}
                </button>
                <button
                    onClick={fetchBalances}
                    className="ml-2 bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded focus:outline-none"
                >
                    Fetch Balances
                </button>
            </div>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <div className="max-h-96 overflow-y-auto">
                {tokens.length === 0 ? (
                    <p className="text-gray-500">No tokens added.</p>
                ) : (
                    <ul>
                        {tokens.map((token, index) => (
                            <li
                                key={index}
                                className="flex items-center justify-between py-2 border-b border-gray-700"
                            >
                                <div className="flex items-center">
                                    <span className="font-bold mr-2">{token.symbol}</span>
                                    <span className="text-sm">
                                        {balances[token.symbol] || 'Not fetched'}
                                    </span>
                                </div>
                                <button
                                    onClick={() => handleRemoveToken(token.symbol)}
                                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded focus:outline-none"
                                >
                                    Remove
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default TokenWatchList;