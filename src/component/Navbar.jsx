import React from 'react'

const Navbar = ({setToken}) => {
  return (
    <div className='flex items-center py-2 px-[4%] justify-between'>
        <div className='flex items-center space-x-2'>
            <svg width="40" height="36" viewBox="0 0 36 32" fill="none" xmlns="http://www.w3.org/2000/svg" className='text-indigo-600'>
                {/* First B */}
                <path d="M4 4H12C14.2 4 16 5.8 16 8V12C16 14.2 14.2 16 12 16H8V20H12C16.4 20 20 16.4 20 12V8C20 3.6 16.4 0 12 0H4V4Z" fill="currentColor"/>
                <rect x="8" y="8" width="4" height="4" fill="white"/>
                {/* Second B - Mirrored */}
                <path d="M16 4H24C26.2 4 28 5.8 28 8V12C28 14.2 26.2 16 24 16H20V20H24C28.4 20 32 16.4 32 12V8C32 3.6 28.4 0 24 0H16V4Z" fill="currentColor"/>
                <rect x="20" y="8" width="4" height="4" fill="white"/>
            </svg>
            <span className='text-2xl font-bold text-gray-900 tracking-tight'>Double B</span>
        </div>
        <button onClick={()=>setToken('')} className='bg-gray-600 text-white px-5 py-2 sm:py-2 rounded-full text-xs sm:text-sm'>Logout</button>
    </div>
  )
}

export default Navbar
