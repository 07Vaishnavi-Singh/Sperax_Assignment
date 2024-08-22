// OperationsBar.js
import React from 'react';

const OperationsBar = ({ setActiveOperation }) => {
  return (
    <div className="bg-gray-800 py-1 px-2 rounded-full flex justify-center items-center shadow-lg">
      <button onClick={() => setActiveOperation('addToken')} className="text-gray-300 hover:text-white font-medium text-xs mx-1 transition-colors duration-200">Add Token</button>
      <button onClick={() => setActiveOperation('allowance')} className="text-gray-300 hover:text-white font-medium text-xs mx-1 transition-colors duration-200">Allowance</button>
      <button onClick={() => setActiveOperation('approval')} className="text-gray-300 hover:text-white font-medium text-xs mx-1 transition-colors duration-200">Approval</button>
      <button onClick={() => setActiveOperation('transfer')} className="text-gray-300 hover:text-white font-medium text-xs mx-1 transition-colors duration-200">Transfer</button>
    </div>
  );
};

export default OperationsBar;