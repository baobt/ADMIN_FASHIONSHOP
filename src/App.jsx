import React, { useEffect, useState } from 'react'
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
import ServerWakeUpLoader from './component/ServerWakeUpLoader'
import { ToastContainer, toast } from 'react-toastify';

export const backendUrl = import.meta.env.VITE_BACKEND_URL
export const currency = 'đ'

const App = () => {
  const [token,setToken] = useState(localStorage.getItem('token')?localStorage.getItem('token'):'')
  const [serverReady, setServerReady] = useState(false)

  useEffect(()=>{
    localStorage.setItem('token',token)
  },[token])

  useEffect(() => {
    const wakeServer = async () => {
      try {
        console.log('Admin: Attempting to wake up server...')
        const response = await fetch(`${backendUrl}/api/ping`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        const data = await response.json()

        if (response.ok && data.success) {
          console.log('Admin: Server and database are fully ready:', data)
          setServerReady(true)
          // Admin is ready to load - no additional context setup needed
        } else {
          console.log('Admin: Server not fully ready:', data.message)
          throw new Error(data.message || 'Server not ready')
        }
      } catch (error) {
        console.log('Admin: Server wake-up attempt failed, retrying in 3 seconds...', error.message)
        // Retry after 3 seconds
        setTimeout(wakeServer, 3000)
      }
    }

    // Start the wake-up process
    wakeServer()
  }, [])

  // Show loading screen until server is ready
  if (!serverReady) {
    return <ServerWakeUpLoader />
  }

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
             <Route path='/orders' element={<Orders token={token}/>}/>
             <Route path='/inventory' element={<Inventory token={token}/>}/>
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
