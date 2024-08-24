// OperationsBar.js
import React from 'react';

const OperationsBar = ({ setActiveOperation }) => {
  return (
    <div className="bg-gradient-to-r from-purple-900 via-pink-800 to-red-800 py-2 px-4 rounded-full inline-flex justify-center items-center shadow-lg">
      <button 
        onClick={() => setActiveOperation('addToken')} 
        className="text-white hover:bg-white hover:text-purple-900 font-medium text-sm mx-2 px-4 py-1 rounded-full transition-colors duration-200">
        Add Token
      </button>
      <button 
        onClick={() => setActiveOperation('allowance')} 
        className="text-white hover:bg-white hover:text-pink-800 font-medium text-sm mx-2 px-4 py-1 rounded-full transition-colors duration-200">
        Allowance
      </button>
      <button 
        onClick={() => setActiveOperation('approval')} 
        className="text-white hover:bg-white hover:text-red-800 font-medium text-sm mx-2 px-4 py-1 rounded-full transition-colors duration-200">
        Approval
      </button>
      <button 
        onClick={() => setActiveOperation('transfer')} 
        className="text-white hover:bg-white hover:text-purple-900 font-medium text-sm mx-2 px-4 py-1 rounded-full transition-colors duration-200">
        Transfer
      </button>
    </div>
  );
};

export default OperationsBar;
