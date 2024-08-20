
import React, { useState } from 'react'
import Headers from './components/Headers.jsx'
import TokenWatchList from './components/TokenWatchList.jsx';

function App() {
  var [a, seta] = useState(0);
  return (
    <>
      
        <Headers/>
        <TokenWatchList/>
    </>
  )
}

export default App
