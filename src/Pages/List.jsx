import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'
import { Pencil, Save, X, Trash2, Package } from 'lucide-react'

const List = ({ token }) => {
  const [list, setList] = useState([])
  const [editing, setEditing] = useState(null)
  const [editPrice, setEditPrice] = useState('')

  const fetchList = async () => {
    try {
      const res = await axios.get(backendUrl + '/api/product/list')
      if (res.data.success) setList(res.data.product)
      else toast.error(res.data.message)
    } catch (err) {
      toast.error(err.message)
    }
  }

  useEffect(() => {
    fetchList()
  }, [])

  const removeProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return
    try {
      const res = await axios.post(
        backendUrl + '/api/product/remove',
        { id },
        { headers: { token } }
      )

      if (res.data.success) {
        toast.success(res.data.message)
        fetchList()
      } else toast.error(res.data.message)
    } catch (err) {
      toast.error(err.message)
    }
  }

  const startEdit = (id, price) => {
    setEditing(id)
    setEditPrice(price)
  }

  const cancelEdit = () => {
    setEditing(null)
    setEditPrice('')
  }

  const savePrice = async (id) => {
    try {
      const res = await axios.post(
        backendUrl + '/api/product/update',
        { id, price: editPrice },
        { headers: { token } }
      )

      if (res.data.success) {
        toast.success('Price updated')
        cancelEdit()
        fetchList()
      } else toast.error(res.data.message)
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <div className='p-6 space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold text-gray-800 flex items-center gap-2'>
          <Package className='w-7 h-7 text-blue-600' /> Product List
        </h1>
        <span className='text-sm text-gray-500'>Total: {list.length}</span>
      </div>

      {/* Table */}
      <div className='bg-white rounded-2xl shadow border overflow-hidden'>
        {/* Head */}
        <div className='hidden md:grid grid-cols-[80px_2fr_1fr_1fr_1fr_1fr_1fr] px-6 py-4 bg-gray-50 text-sm font-semibold text-gray-600'>
          <span>Image</span>
          <span>Name</span>
          <span>Category</span>
          <span>Sales</span>
          <span>Price</span>
          <span className='text-center'>Edit</span>
          <span className='text-center'>Delete</span>
        </div>

        {/* Body */}
        <div className='divide-y'>
          {list.map((item) => (
            <div
              key={item._id}
              className='grid grid-cols-2 md:grid-cols-[80px_2fr_1fr_1fr_1fr_1fr_1fr] items-center gap-2 px-6 py-4 text-sm hover:bg-gray-50 transition'
            >
              <img
                src={item.image[0]}
                alt={item.name}
                className='w-14 h-14 object-cover rounded-lg border'
              />

              <div>
                <p className='font-medium text-gray-800'>{item.name}</p>
                <p className='text-xs text-gray-400'>ID: {item._id.slice(-6)}</p>
              </div>

              <span className='text-gray-600'>{item.category}</span>

              {/* Sales Count */}
              <div className='flex flex-col'>
                <span className='font-medium text-green-600'>{item.salesCount || 0} sold</span>
                {item.salesCount === 0 && (
                  <span className='text-xs text-orange-600'>Not sold yet</span>
                )}
                {item.salesCount > 0 && item.salesCount < 10 && (
                  <span className='text-xs text-blue-600'>Low sales</span>
                )}
                {item.salesCount >= 10 && (
                  <span className='text-xs text-green-600'>Popular</span>
                )}
              </div>

              {editing === item._id ? (
                <input
                  type='number'
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className='border px-3 py-1 rounded w-28'
                />
              ) : (
                <span className='font-semibold'>
                  {currency}{item.price.toLocaleString()}
                </span>
              )}

              {/* Edit */}
              {editing === item._id ? (
                <div className='flex justify-center gap-2'>
                  <button
                    onClick={() => savePrice(item._id)}
                    className='p-1 rounded text-green-600 hover:bg-green-50'
                  >
                    <Save className='w-4 h-4' />
                  </button>
                  <button
                    onClick={cancelEdit}
                    className='p-1 rounded text-gray-500 hover:bg-gray-100'
                  >
                    <X className='w-4 h-4' />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => startEdit(item._id, item.price)}
                  className='flex justify-center text-blue-600 hover:text-blue-700'
                >
                  <Pencil className='w-4 h-4' />
                </button>
              )}

              {/* Delete */}
              <button
                onClick={() => removeProduct(item._id)}
                className='flex justify-center text-red-600 hover:text-red-700'
              >
                <Trash2 className='w-4 h-4' />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default List
