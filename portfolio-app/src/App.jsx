// App.js
import React, { useState } from 'react';
import Header from './components/Headers.jsx';

const App = () => {
  const [activeOperation, setActiveOperation] = useState('');

  const renderContent = () => {
    switch(activeOperation) {
      case 'addToken':
        return <div>Add Token Content</div>;
      case 'allowance':
        return <div>Allowance Content</div>;
      case 'approval':
        return <div>Approval Content</div>;
      case 'transfer':
        return <div>Transfer Content</div>;
      default:
        return <div>Select an operation</div>;
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen text-white">
      <Header setActiveOperation={setActiveOperation} />
      <div className="container mx-auto px-4 pt-6">
        {renderContent()}
      </div>
    </div>
  );
};

export default App;