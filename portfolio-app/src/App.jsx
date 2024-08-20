
import React, { useState } from 'react'
import Headers from './components/Headers.jsx'
import TokenWatchList from './components/TokenWatchList.jsx';
import Allowance from './components/Allowance.jsx';

function App() {
 
  return (
    <>
        <Headers/>
        <TokenWatchList/>
        <Allowance/>
    </>
  )
}

export default App
