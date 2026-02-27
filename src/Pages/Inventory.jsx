import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'
import { Package, Pencil, Save, X } from 'lucide-react'

const SIZES = ['S', 'M', 'L', 'XL', 'XXL']

const Inventory = ({ token }) => {
  const [inventory, setInventory] = useState([])
  const [editing, setEditing] = useState(null)
  const [editStock, setEditStock] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  const fetchInventory = async () => {
    try {
      console.log('Fetching inventory...')
      const res = await axios.get(backendUrl + '/api/product/list')
      console.log('Inventory response:', res.data)
      if (res.data.success) {
        console.log('Setting inventory state:', res.data.product.length, 'products')
        setInventory(res.data.product)
      }
      else toast.error(res.data.message)
    } catch (err) {
      console.log('Fetch inventory error:', err)
      toast.error(err.message)
    }
  }

  useEffect(() => {
    fetchInventory()
  }, [])

  const startEdit = (productId, size, stock) => {
    setEditing({ productId, size })
    setEditStock(stock === 'N/A' ? 0 : stock ?? 0)
  }

  const cancelEdit = () => {
    setEditing(null)
    setEditStock('')
  }

  const saveStock = async (productId, size) => {
    try {
      console.log('Saving stock:', { productId, size, stock: Number(editStock), token })
      const res = await axios.post(
        backendUrl + '/api/product/update-stock',
        { productId, size, stock: Number(editStock) },
        { headers: { token } }
      )
      console.log('Save stock response:', res.data)
      console.log('Full product object:', res.data.product)
      console.log('Product stock:', res.data.product?.stock)

      if (res.data.success) {
        toast.success('Stock updated')
        cancelEdit()
        await fetchInventory()
        setRefreshKey(prev => prev + 1) // Force re-render
        console.log('Inventory refreshed after update')
      } else toast.error(res.data.message)
    } catch (err) {
      console.log('Save stock error:', err)
      toast.error(err.message)
    }
  }

  const stockColor = (value) =>
    value === 0
      ? 'text-red-600'
      : value < 5
      ? 'text-orange-600'
      : 'text-green-600'

  return (
    <div className='p-6 space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold text-gray-800 flex items-center gap-2'>
          <Package className='w-7 h-7 text-blue-600' /> Inventory Management
        </h1>
        <span className='text-sm text-gray-500'>Total products: {inventory.length}</span>
      </div>

      {/* Table */}
      <div className='bg-white rounded-2xl shadow border overflow-hidden'>
        {/* Header row */}
        <div className='hidden md:grid grid-cols-[1fr_2fr_repeat(5,1fr)_1.5fr] px-6 py-4 bg-gray-50 text-sm font-semibold text-gray-600'>
          <span>Image</span>
          <span>Product</span>
          {SIZES.map((s) => (
            <span key={s} className='text-center'>{s}</span>
          ))}
          <span className='text-center'>Hint</span>
        </div>

        {/* Body */}
        <div className='divide-y'>
          {inventory.map((item) => (
            <div
              key={item._id}
              className='grid grid-cols-2 md:grid-cols-[1fr_2fr_repeat(5,1fr)_1.5fr] gap-2 px-6 py-4 text-sm hover:bg-gray-50 transition items-center'
            >
              {/* Product Image */}
              <div className='flex justify-center'>
                <img
                  src={item.image?.[0] || '/placeholder-image.png'}
                  alt={item.name}
                  className='w-12 h-12 object-cover rounded border'
                />
              </div>

              {/* Product name */}
              <p className='font-medium text-gray-800'>{item.name}</p>

              {/* Sizes */}
              {SIZES.map((size) => {
                const hasStock = item.sizeStocks && item.sizeStocks[size] !== undefined
                const value = hasStock ? item.sizeStocks[size] : 0
                const isEditing = editing?.productId === item._id && editing?.size === size

                return (
                  <div key={size} className='flex justify-center'>
                    {isEditing ? (
                      <div className='flex items-center gap-1'>
                        <input
                          type='number'
                          min='0'
                          value={editStock}
                          onChange={(e) => setEditStock(e.target.value)}
                          className='w-14 px-2 py-1 border rounded text-center text-xs'
                        />
                        <button
                          onClick={() => saveStock(item._id, size)}
                          className='text-green-600 hover:bg-green-50 p-1 rounded'
                        >
                          <Save className='w-4 h-4' />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className='text-gray-500 hover:bg-gray-100 p-1 rounded'
                        >
                          <X className='w-4 h-4' />
                        </button>
                      </div>
                    ) : (
                      <div className='flex flex-col items-center gap-1'>
                        <span className={`font-semibold ${stockColor(value)}`}>
                          {value}
                        </span>
                        <button
                          onClick={() => startEdit(item._id, size, hasStock ? item.sizeStocks[size] : 0)}
                          className='text-xs text-blue-600 hover:underline flex items-center gap-1'
                        >
                          <Pencil className='w-3 h-3' /> Edit
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Hint */}
              <span className='text-xs text-gray-400 text-center'>Click ✏️ to edit</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Inventory
