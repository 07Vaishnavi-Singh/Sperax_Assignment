import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

// Make sure to define or import this object
const tokenAddresses = {
    1: {
    'ETH': '0x0000000000000000000000000000000000000000', // Ethereum
    'USDT': '0xdAC17F958D2ee523a2206206994597C13D831ec7', // Tether USD
    'USDC': '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606EB48', // USD Coin
    'DAI': '0x6B175474E89094C44Da98b954EedeAC495271d0F', // Dai Stablecoin
    'WBTC': '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // Wrapped Bitcoin
    'LINK': '0x514910771AF9Ca656af840dff83E8264EcF986CA', // Chainlink
    'UNI': '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', // Uniswap
    'MKR': '0x9f8F72aA9304C8B593d555F12ef6589Cc3A579A2', // Maker
    'AAVE': '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9', // Aave
    'COMP': '0xc00e94Cb662C3520282E6f5717214004A7f26888', // Compound
    'SNX': '0xC011A72400E58ecD99Ee497CF89E3775d4bd732F', // Synthetix Network Token
    'YFI': '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e', // yearn.finance
    'SUSHI': '0x6B3595068778DD592e39A122f4f5a5CF09C90fE2', // SushiSwap
    'BAL': '0xba100000625a3754423978a60c9317c58a424e3D', // Balancer
    'BAT': '0x0D8775F648430679A709E98d2b0Cb6250d2887EF', // Basic Attention Token
    'ZRX': '0xE41d2489571d322189246DaFA5ebDe1F4699F498', // 0x Protocol Token
    'CRV': '0xD533a949740bb3306d119CC777fa900bA034cd52', // Curve DAO Token
    '1INCH': '0x111111111117dC0aa78b770fA6A738034120C302', // 1inch
    'MANA': '0x0F5D2fB29fb7d3CFeE444a200298f468908cC942', // Decentraland
    'ENJ': '0xf629cBd94d3791C9250152BD8DfBDF380E2a3B9c', // EnjinCoin
    'PUSH':'0xf418588522d5dd018b425e472991e52ebbeeeeee'
    }
};

const BalanceChart = ({ data, symbol }) => {
    return (
        <LineChart width={600} height={300} data={data}>
            <XAxis dataKey="date" />
            <YAxis />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="balance" stroke="#8884d8" name={`${symbol} Balance`} />
        </LineChart>
    );
};

const TokenWatchList = () => {
    const [tokens, setTokens] = useState([]);
    const [newToken, setNewToken] = useState('');
    const [balances, setBalances] = useState({});
    const [error, setError] = useState('');
    const [tokenErrors, setTokenErrors] = useState({});
    const [walletAddress, setWalletAddress] = useState('0x3a5FB222EF77e7Dd413a30b317F23D99031b69ff');
    const [historicalBalances, setHistoricalBalances] = useState({});
    const [dateRange, setDateRange] = useState({ fromDate: null, toDate: null });

    useEffect(() => {
        if (tokens.length > 0) {
            fetchBalances();
        }
    }, [tokens, walletAddress]);

    useEffect(() => {
        if (tokens.length > 0 && dateRange.fromDate && dateRange.toDate) {
            tokens.forEach(token => fetchHistoricalBalances(token.symbol));
        }
    }, [tokens, dateRange]);

    const fetchBalances = async () => {
        const updatedBalances = {};
        const errors = {};

        for (const token of tokens) {
            try {
                const provider = new ethers.providers.JsonRpcProvider('https://rpc.ankr.com/eth/150aa8fab13e61e50ba49ac1cd0c06e26ae190e4c907691044886fdda314bfb6');
                const tokenContract = new ethers.Contract(tokenAddresses[1][token.symbol], ERC20_ABI, provider);
                const balance = await tokenContract.balanceOf(walletAddress);
                const decimals = await tokenContract.decimals();
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


    const fetchHistoricalBalances = async (symbol) => {
        if (!dateRange.fromDate || !dateRange.toDate) {
            console.error("Invalid date range.");
            return;
        }
    
        try {
            const params = new URLSearchParams({
                chain: '1', // Ethereum mainnet
                address: walletAddress,
                tokenAddress: tokenAddresses[1][symbol],
                symbol: symbol,
                fromDate: dateRange.fromDate.toISOString(),
                toDate: dateRange.toDate.toISOString()
            });
    
            const response = await fetch(`/getHistoricalBalance?${params.toString()}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setHistoricalBalances(prevBalances => {
                const newBalances = {
                    ...prevBalances,
                    [symbol]: data
                };
                console.log('Updated historical balances:', newBalances);
                return newBalances;
            });
        } catch (error) {
            console.error(`Failed to fetch historical balances for ${symbol}:`, error);
            setTokenErrors(prevErrors => ({
                ...prevErrors,
                [symbol]: `Error fetching historical data: ${error.message}`
            }));
        }
    };

    const handleAddToken = async () => {
        if (!newToken) {
            setError('Please enter a token symbol.');
            return;
        }

        const upperCaseToken = newToken.toUpperCase();

        if (tokens.find(token => token.symbol === upperCaseToken)) {
            setError('Token already added.');
            return;
        }

        const tokenAddress = tokenAddresses[1][upperCaseToken];
        if (!tokenAddress) {
            setError('Token symbol is not recognized.');
            return;
        }

        setTokens(prevTokens => {
            const newTokens = [...prevTokens, { symbol: upperCaseToken }];
            console.log('Updated tokens:', newTokens);
            return newTokens;
        });
        setNewToken('');
        setError('');
    };

    const handleRemoveToken = (symbol) => {
        setTokens(prevTokens => prevTokens.filter(token => token.symbol !== symbol));
        setBalances(prevBalances => {
            const newBalances = { ...prevBalances };
            delete newBalances[symbol];
            return newBalances;
        });
        setHistoricalBalances(prevBalances => {
            const newBalances = { ...prevBalances };
            delete newBalances[symbol];
            return newBalances;
        });
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
                {error && <p className="ml-4 text-red-500">{error}</p>}
            </div>
            <div className="mb-4">
                <DatePicker
                    selected={dateRange.fromDate}
                    onChange={date => setDateRange(prev => ({ ...prev, fromDate: date }))}
                    placeholderText="From Date"
                    className="mr-2 px-3 py-2 border border-gray-600 rounded bg-gray-800 text-white focus:outline-none focus:border-blue-500"
                />
                <DatePicker
                    selected={dateRange.toDate}
                    onChange={date => setDateRange(prev => ({ ...prev, toDate: date }))}
                    placeholderText="To Date"
                    className="mr-2 px-3 py-2 border border-gray-600 rounded bg-gray-800 text-white focus:outline-none focus:border-blue-500"
                />
                <button 
                    onClick={() => tokens.forEach(token => fetchHistoricalBalances(token.symbol))}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none"
                >
                    Fetch Historical Balances
                </button>
            </div>
            <div className="max-h-96 overflow-y-auto">
                {tokens.length === 0 ? (
                    <p className="text-gray-500">No tokens added.</p>
                ) : (
                    <ul>
                        {tokens.map((token, index) => (
                            <li
                                key={index}
                                className="flex flex-col py-2 border-b border-gray-700"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <span className="font-bold mr-2">{token.symbol}</span>
                                        <span className="text-sm">
                                            {tokenErrors[token.symbol] || balances[token.symbol] || 'Loading...'}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveToken(token.symbol)}
                                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded focus:outline-none"
                                    >
                                        Remove
                                    </button>
                                </div>
                                {historicalBalances[token.symbol] && (
                                    <BalanceChart data={historicalBalances[token.symbol]} symbol={token.symbol} />
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default TokenWatchList;