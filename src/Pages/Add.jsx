import React, { useState } from 'react'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'
import { PackagePlus } from 'lucide-react'

const SIZES = ['S', 'M', 'L', 'XL', 'XXL']

const Add = ({ token }) => {
  const [images, setImages] = useState([null, null, null, null])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('Men')
  const [subCategory, setSubCategory] = useState('Topwear')
  const [bestseller, setBestseller] = useState(false)
  const [sizes, setSizes] = useState([])
  const [stock, setStock] = useState({ S: 0, M: 0, L: 0, XL: 0, XXL: 0 })

  const toggleSize = (size) => {
    setSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    )
  }

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    try {
      const formData = new FormData()
      formData.append('name', name)
      formData.append('description', description)
      formData.append('price', price)
      formData.append('category', category)
      formData.append('subCategory', subCategory)
      formData.append('bestseller', bestseller)
      formData.append('sizes', JSON.stringify(sizes))
      formData.append('sizeStocks', JSON.stringify(stock))

      images.forEach((img, i) => img && formData.append(`image${i + 1}`, img))

      const res = await axios.post(
        backendUrl + '/api/product/add',
        formData,
        { headers: { token } }
      )

      if (res.data.success) {
        toast.success(res.data.message)
        setName('')
        setDescription('')
        setPrice('')
        setImages([null, null, null, null])
        setSizes([])
        setStock({ S: 0, M: 0, L: 0, XL: 0, XXL: 0 })
      } else toast.error(res.data.message)
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <form onSubmit={onSubmitHandler} className='p-6 space-y-8'>
      {/* Header */}
      <h1 className='text-3xl font-bold flex items-center gap-2 text-gray-800'>
        <PackagePlus className='w-7 h-7 text-blue-600' /> Add New Product
      </h1>

      {/* Images */}
      <div className='bg-white p-6 rounded-2xl shadow border'>
        <p className='font-semibold mb-4'>Product Images</p>
        <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
          {images.map((img, idx) => (
            <label key={idx} className='cursor-pointer'>
              <img
                src={img ? URL.createObjectURL(img) : assets.upload_area}
                className='w-full h-28 object-cover rounded-lg border hover:opacity-80'
              />
              <input
                type='file'
                hidden
                onChange={(e) => {
                  const copy = [...images]
                  copy[idx] = e.target.files[0]
                  setImages(copy)
                }}
              />
            </label>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className='bg-white p-6 rounded-2xl shadow border space-y-4'>
        <div>
          <label className='font-medium'>Product Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className='w-full mt-1 px-4 py-2 border rounded-lg'
            required
          />
        </div>

        <div>
          <label className='font-medium'>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className='w-full mt-1 px-4 py-2 border rounded-lg'
            rows={4}
            required
          />
        </div>

        <div className='grid sm:grid-cols-3 gap-4'>
          <select onChange={(e) => setCategory(e.target.value)} className='px-3 py-2 border rounded-lg'>
            <option>Men</option>
            <option>Women</option>
            <option>Kids</option>
          </select>

          <select onChange={(e) => setSubCategory(e.target.value)} className='px-3 py-2 border rounded-lg'>
            <option>Topwear</option>
            <option>Bottomwear</option>
            <option>Winterwear</option>
          </select>

          <input
            type='number'
            placeholder='Price'
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className='px-3 py-2 border rounded-lg'
          />
        </div>
      </div>

      {/* Sizes */}
      <div className='bg-white p-6 rounded-2xl shadow border'>
        <p className='font-semibold mb-4'>Sizes & Stock</p>
        <div className='flex flex-wrap gap-4'>
          {SIZES.map((s) => (
            <div key={s} className='flex flex-col items-center gap-2'>
              <button
                type='button'
                onClick={() => toggleSize(s)}
                className={`px-4 py-1 rounded-full border font-medium ${
                  sizes.includes(s)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100'
                }`}
              >
                {s}
              </button>
              {sizes.includes(s) && (
                <input
                  type='number'
                  min='0'
                  value={stock[s]}
                  onChange={(e) =>
                    setStock((prev) => ({ ...prev, [s]: Number(e.target.value) }))
                  }
                  className='w-20 px-2 py-1 border rounded text-center text-sm'
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bestseller */}
      <label className='flex items-center gap-2 cursor-pointer'>
        <input
          type='checkbox'
          checked={bestseller}
          onChange={() => setBestseller((p) => !p)}
        />
        <span>Add to bestseller</span>
      </label>

      {/* Submit */}
      <button className='px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold'>
        Add Product
      </button>
    </form>
  )
}

export default Add
