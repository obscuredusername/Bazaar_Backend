import { useState } from 'react'
import reactLogo from './assets/react.svg'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import ProductDetailsPage from './pages/ProductDetailsPage'
import viteLogo from '/logo.png'
import './App.css'
import AddProductPage from './pages/AddProductPage'

function App() {
  const [count, setCount] = useState(0)

  return (
   <Routes>
      <Route path ='/' element={<Home />}/>
      <Route path='/add-product' element={<AddProductPage/>}/>
      <Route path= '/post' element={<ProductDetailsPage/>}/>
   </Routes>
  )
}

export default App
