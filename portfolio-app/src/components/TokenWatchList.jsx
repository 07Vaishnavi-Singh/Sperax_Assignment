import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

// Ensure to define or import this object
const tokenAddresses = {
    1: {
        'ETH': '0x0000000000000000000000000000000000000000',
        'USDT': '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        'USDC': '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606EB48',
        'DAI': '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        'WBTC': '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
        'LINK': '0x514910771AF9Ca656af840dff83E8264EcF986CA',
        'UNI': '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
        'MKR': '0x9f8F72aA9304C8B593d555F12ef6589Cc3A579A2',
        'AAVE': '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
        'COMP': '0xc00e94Cb662C3520282E6f5717214004A7f26888',
        'SNX': '0xC011A72400E58ecD99Ee497CF89E3775d4bd732F',
        'YFI': '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e',
        'SUSHI': '0x6B3595068778DD592e39A122f4f5a5CF09C90fE2',
        'BAL': '0xba100000625a3754423978a60c9317c58a424e3D',
        'BAT': '0x0D8775F648430679A709E98d2b0Cb6250d2887EF',
        'ZRX': '0xE41d2489571d322189246DaFA5ebDe1F4699F498',
        'CRV': '0xD533a949740bb3306d119CC777fa900bA034cd52',
        '1INCH': '0x111111111117dC0aa78b770fA6A738034120C302',
        'MANA': '0x0F5D2fB29fb7d3CFeE444a200298f468908cC942',
        'ENJ': '0xf629cBd94d3791C9250152BD8DfBDF380E2a3B9c',
        'PUSH':'0xf418588522d5dd018b425e472991e52ebbeeeeee'
    }
};

// Assume tokenAddresses and ERC20_ABI are defined elsewhere

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
    const [walletAddress, setWalletAddress] = useState('');
    const [historicalBalances, setHistoricalBalances] = useState({});
    const [dateRange, setDateRange] = useState({ fromDate: null, toDate: null });
    const [totalValue, setTotalValue] = useState(0);
    const [prices, setPrices] = useState({});
    const [sortOrder, setSortOrder] = useState('asc');
    const [sortBy, setSortBy] = useState('symbol');

    useEffect(() => {
        if (tokens.length > 0 && walletAddress) {
            fetchBalances();
            fetchPrices();
        }
    }, [tokens, walletAddress]);

    useEffect(() => {
        if (tokens.length > 0 && dateRange.fromDate && dateRange.toDate && walletAddress) {
            tokens.forEach(token => fetchHistoricalBalances(token.symbol));
        }
    }, [tokens, dateRange, walletAddress]);

    useEffect(() => {
        calculateTotalValue();
    }, [balances, prices]);

    const connectWallet = async () => {
        if (typeof window.ethereum !== 'undefined') {
            try {
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                const address = await signer.getAddress();
                setWalletAddress(address);
            } catch (error) {
                console.error('Failed to connect wallet:', error);
                setError('Failed to connect wallet. Please try again.');
            }
        } else {
            setError('Please install MetaMask to use this feature.');
        }
    };

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
            setHistoricalBalances(prevBalances => ({
                ...prevBalances,
                [symbol]: data
            }));
        } catch (error) {
            console.error(`Failed to fetch historical balances for ${symbol}:`, error);
            setTokenErrors(prevErrors => ({
                ...prevErrors,
                [symbol]: `Error fetching historical data: ${error.message}`
            }));
        }
    };

    const fetchPrices = async () => {
        const updatedPrices = {};
        for (const token of tokens) {
            try {
                const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${token.symbol.toLowerCase()}&vs_currencies=usd`);
                const data = await response.json();
                updatedPrices[token.symbol] = data[token.symbol.toLowerCase()].usd;
            } catch (error) {
                console.error(`Failed to fetch price for ${token.symbol}:`, error);
            }
        }
        setPrices(updatedPrices);
    };

    const calculateTotalValue = () => {
        let total = 0;
        for (const token of tokens) {
            const balance = parseFloat(balances[token.symbol]) || 0;
            const price = prices[token.symbol] || 0;
            total += balance * price;
        }
        setTotalValue(total);
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

        if (!tokenAddresses[1][upperCaseToken]) {
            setError('Token not supported.');
            return;
        }

        setTokens([...tokens, { symbol: upperCaseToken }]);
        setNewToken('');
        setError('');
    };

    const handleDateRangeChange = (dates) => {
        const [start, end] = dates;
        setDateRange({ fromDate: start, toDate: end });
    };

    const handleSort = (key) => {
        setSortOrder(prevOrder => prevOrder === 'asc' ? 'desc' : 'asc');
        setSortBy(key);
    };

    const sortedTokens = [...tokens].sort((a, b) => {
        const symbolA = a.symbol.toUpperCase();
        const symbolB = b.symbol.toUpperCase();

        if (sortOrder === 'asc') {
            return sortBy === 'symbol' ? symbolA.localeCompare(symbolB) : parseFloat(balances[symbolA] || 0) - parseFloat(balances[symbolB] || 0);
        } else {
            return sortBy === 'symbol' ? symbolB.localeCompare(symbolA) : parseFloat(balances[symbolB] || 0) - parseFloat(balances[symbolA] || 0);
        }
    });

    return (
        <div>
            <h2>Token Watch List</h2>
            <button onClick={connectWallet}>Connect Wallet</button>
            <input 
                type="text" 
                placeholder="Enter token symbol" 
                value={newToken} 
                onChange={(e) => setNewToken(e.target.value)} 
            />
            <button onClick={handleAddToken}>Add Token</button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <ul>
                {sortedTokens.map((token, index) => (
                    <li key={index}>
                        {token.symbol}: {balances[token.symbol]} {token.symbol}
                        {tokenErrors[token.symbol] && (
                            <p style={{ color: 'red' }}>{tokenErrors[token.symbol]}</p>
                        )}
                    </li>
                ))}
            </ul>
            <div>
                <h3>Sort by:</h3>
                <button onClick={() => handleSort('symbol')}>Symbol</button>
                <button onClick={() => handleSort('balance')}>Balance</button>
            </div>
            <div>
                <h3>Total Value: ${totalValue.toFixed(2)}</h3>
            </div>
            <div>
                <h3>Select Date Range</h3>
                <DatePicker
                    selected={dateRange.fromDate}
                    onChange={handleDateRangeChange}
                    startDate={dateRange.fromDate}
                    endDate={dateRange.toDate}
                    selectsRange
                    inline
                />
            </div>
            <div>
                <h3>Historical Balances</h3>
                {tokens.map((token, index) => (
                    <div key={index}>
                        <h4>{token.symbol}</h4>
                        {historicalBalances[token.symbol] && (
                            <BalanceChart data={historicalBalances[token.symbol]} symbol={token.symbol} />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TokenWatchList;
