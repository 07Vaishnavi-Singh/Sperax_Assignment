import React, { useState } from 'react';
import { ethers } from 'ethers';

// Replace with actual ERC20 ABI
const ERC20_ABI = [
    "function allowance(address owner, address spender) view returns (uint256)",
    "function decimals() view returns (uint8)",
];

const Allowance = () => {
    const [contractAddress, setContractAddress] = useState('');
    const [spenderAddress, setSpenderAddress] = useState(''); // Add input for spender address
    const [allowance, setAllowance] = useState(null);
    const [error, setError] = useState('');

    const fetchAllowance = async () => {
        const walletAddress = '0xYourWalletAddress'; // Replace with your wallet address

        if (!contractAddress || !spenderAddress) {
            setError('Please provide both token contract and spender addresses.');
            return;
        }

        try {
            const provider = new ethers.providers.JsonRpcProvider('https://rpc.ankr.com/eth');
            const tokenContract = new ethers.Contract(contractAddress, ERC20_ABI, provider);
            
            // Fetch allowance
            const allowance = await tokenContract.allowance(walletAddress, spenderAddress);
            
            const decimals = await tokenContract.decimals(); // Get token decimals
            setAllowance(ethers.utils.formatUnits(allowance, decimals)); // Format allowance based on decimals
            setError('');
        } catch (error) {
            console.error('Failed to fetch allowance:', error);
            setError('Failed to fetch allowance. Please check the addresses and try again.');
            setAllowance(null);
        }
    };

    return (
        <div className="p-4 bg-gray-800 text-white">
            <h2 className="text-xl font-bold mb-4">Check Token Allowance</h2>
            <div className="mb-4">
                <label className="block mb-2">Token Contract Address:</label>
                <input
                    type="text"
                    value={contractAddress}
                    onChange={(e) => setContractAddress(e.target.value)}
                    placeholder="Enter Token Contract Address"
                    className="p-2 border border-gray-400 rounded bg-gray-700 text-white"
                />
            </div>
            <div className="mb-4">
                <label className="block mb-2">Spender Address:</label>
                <input
                    type="text"
                    value={spenderAddress}
                    onChange={(e) => setSpenderAddress(e.target.value)}
                    placeholder="Enter Spender Address"
                    className="p-2 border border-gray-400 rounded bg-gray-700 text-white"
                />
            </div>
            <button
                onClick={fetchAllowance}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
                Check Allowance
            </button>
            {error && <p className="text-red-500 mt-4">{error}</p>}
            {allowance !== null && (
                <div className="mt-4">
                    <h3 className="text-lg font-bold">Allowance:</h3>
                    <p>{allowance} Tokens</p>
                </div>
            )}
        </div>
    );
};

export default Allowance;
