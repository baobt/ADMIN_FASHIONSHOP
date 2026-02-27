import React from 'react'
import { useState } from 'react'
import { useEffect } from 'react'
import axios from 'axios'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'

const Orders = ({ token }) => {

  const [orders, setOrders] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalOrders, setTotalOrders] = useState(0)

  const fetchOrders = async (page = currentPage, limit = itemsPerPage) => {
    if (!token) {
      return null;
    }
    try {
      const response = await axios.post(
        backendUrl + '/api/order/list',
        { page, limit },
        { headers: { token } }
      )
      if (response.data.success) {
        setOrders(response.data.orders)
        setTotalOrders(response.data.totalOrders || 0)
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const statusHandler = async (event,orderId) => {
    try {

      const response = await axios.post(backendUrl + '/api/order/status',{orderId,status:event.target.value},{headers:{token}})

      if(response.data.success){
        await fetchOrders()
      }
    } catch (error) {
      console.log(error)
      toast.error(reponse.data.message)
    }
  }

  const markAsPaid = async (orderId) => {
    try {
      const response = await axios.post(backendUrl + '/api/order/mark-paid', { orderId }, { headers: { token } })

      if (response.data.success) {
        toast.success('Order marked as paid!')
        await fetchOrders()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error('Failed to mark as paid')
    }
  }
  useEffect(() => {
    fetchOrders()
  }, [token, currentPage, itemsPerPage])

  // Pagination helpers
  const totalPages = Math.ceil(totalOrders / itemsPerPage)
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalOrders)

  return (
    <div className='p-6'>
      <h3 className='text-2xl font-bold mb-6'>Order Management</h3>

      <div className='space-y-4'>
        {orders.length === 0 ? (
          <div className='text-center py-8 text-gray-500'>
            <p>No orders found</p>
          </div>
        ) : (
          orders.map((order, index) => (
            <div key={index} className='bg-white border rounded-lg p-6 shadow-sm'>
              {/* Order Header */}
              <div className='flex items-center justify-between mb-4'>
                <div className='flex items-center gap-3'>
                  <img className='w-8 h-8' src={assets.parcel_icon} alt='' />
                  <div>
                    <p className='font-semibold text-gray-900'>Order #{order._id.slice(-8)}</p>
                    <p className='text-sm text-gray-500'>{new Date(order.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className='text-right'>
                  <p className='font-bold text-lg text-gray-900'>{currency}{order.amount.toLocaleString()}</p>
                  <p className='text-sm text-gray-500'>Items: {order.items.length}</p>
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                {/* Items Summary */}
                <div className='md:col-span-2'>
                  <h4 className='font-medium text-gray-900 mb-2'>Items</h4>
                  <div className='space-y-2'>
                    {order.items.slice(0, 3).map((item, idx) => (
                      <div key={idx} className='flex items-center gap-3 text-sm'>
                        <img className='w-10 h-10 object-cover rounded' src={item.image[0]} alt='' />
                        <div className='flex-1'>
                          <p className='font-medium'>{item.name}</p>
                          <p className='text-gray-600'>Size: {item.size} × Qty: {item.quantity}</p>
                        </div>
                        <p className='font-medium'>{currency}{item.price.toLocaleString()}</p>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <p className='text-sm text-gray-500'>+{order.items.length - 3} more items</p>
                    )}
                  </div>
                </div>

                {/* Customer & Status */}
                <div className='space-y-4'>
                  <div>
                    <h4 className='font-medium text-gray-900 mb-1'>Customer</h4>
                    <p className='text-sm font-medium'>{order.address.firstName} {order.address.lastName}</p>
                    <p className='text-sm text-gray-600'>{order.address.phone}</p>
                    <p className='text-xs text-gray-500 mt-1'>
                      {order.address.street}, {order.address.city}
                    </p>
                  </div>

                  <div>
                    <h4 className='font-medium text-gray-900 mb-1'>Payment</h4>
                    <p className='text-sm'>{order.paymentMethod}</p>
                    <p className={`text-sm font-medium ${order.payment ? 'text-green-600' : 'text-orange-600'}`}>
                      {order.payment ? 'Paid' : 'Pending'}
                    </p>
                    {!order.payment && order.paymentMethod === 'COD' && (
                      <button
                        onClick={() => markAsPaid(order._id)}
                        className='mt-2 px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition'
                      >
                        Mark as Paid
                      </button>
                    )}
                  </div>

                  <div>
                    <h4 className='font-medium text-gray-900 mb-2'>Status</h4>
                    <select
                      onChange={(event)=>statusHandler(event,order._id)}
                      value={order.status}
                      className='w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                    >
                      <option value="Order Placed">Order Placed</option>
                      <option value="Packing">Packing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Out for delivery">Out for delivery</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalOrders > itemsPerPage && (
        <div className='flex items-center justify-between mt-8'>
          {/* Items per page selector */}
          <div className='flex items-center gap-2'>
            <span className='text-sm text-gray-600'>Show:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value))
                setCurrentPage(1)
              }}
              className='px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span className='text-sm text-gray-600'>per page</span>
          </div>

          {/* Page info */}
          <div className='text-sm text-gray-600'>
            Showing {startItem} to {endItem} of {totalOrders} orders
          </div>

          {/* Page navigation */}
          <div className='flex items-center gap-2'>
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className='px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              Previous
            </button>

            {/* Page numbers */}
            <div className='flex gap-1'>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const pageNum = i + 1
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 border rounded text-sm ${
                      currentPage === pageNum
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
              {totalPages > 5 && (
                <>
                  <span className='px-2 py-1 text-gray-500'>...</span>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className={`px-3 py-1 border rounded text-sm ${
                      currentPage === totalPages
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className='px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Orders
