
import React, { useState } from 'react'
import Header from './components/Header.jsx'

function App() {
  var [a, seta] = useState(0);
  return (
    <>
        <div>Heyyy!!!!!!!!</div>
        <h1>{a}</h1>
        <button onClick={()=>seta(a+1)}> Click ME </button>
        <Header/>
    </>
  )
}

export default App
