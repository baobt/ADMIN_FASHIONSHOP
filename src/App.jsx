import React, { use, useEffect, useState } from 'react'
import Navbar from './component/Navbar'
import SideBar from './component/SideBar'
import { Route,Routes } from 'react-router-dom'
import Add from './Pages/Add'
import List from './Pages/List'
import Orders from './Pages/Orders'
import Inventory from './Pages/Inventory'
import Reviews from './Pages/Reviews'
import Dashboard from './Pages/Dashboard'
import Chat from './Pages/Chat'
import Login from './component/Login'
import { ToastContainer, toast } from 'react-toastify';

export const backendUrl = import.meta.env.VITE_BACKEND_URL
export const currency = 'đ'

const App = () => {


  const [token,setToken] = useState(localStorage.getItem('token')?localStorage.getItem('token'):'')

  useEffect(()=>{
    localStorage.setItem('token',token)
  },[token])

  return ( 
    <div className='bg-gray-50 min-h-screen'>
      <ToastContainer/>
      {token === ""
      ? <Login setToken={setToken}/>
    : <>
      <Navbar setToken={setToken}/>
      <hr/>
      <div className='flex w-full'>
        <SideBar/>
        <div className='w-[70%] mx-auto ml-[max(5vw,25px)]  my-8 text-gray-600 text-base'>
          <Routes>
             <Route path='/' element={<Dashboard token={token}/>}/>
             <Route path='/dashboard' element={<Dashboard token={token}/>}/>
             <Route path='/add' element={<Add token={token}/>}/>
             <Route path='/list' element={<List token={token}/>}/>
             <Route path='/inventory' element={<Inventory token={token}/>}/>
             <Route path='/orders' element={<Orders token={token}/>}/>
             <Route path='/reviews' element={<Reviews token={token}/>}/>
             <Route path='/chat' element={<Chat token={token}/>}/>
          </Routes>
        </div>
      </div>
    </>
    }
   
    </div>
  )
}

export default App
