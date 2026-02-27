import React, { useEffect, useState } from 'react'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'
import axios from 'axios'
import { Star, MessageSquare, User, Reply, Send } from 'lucide-react'

const Reviews = ({ token }) => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyText, setReplyText] = useState('')

  const fetchAllReviews = async () => {
    try {
      const response = await axios.get(backendUrl + '/api/review/all', {
        headers: { token }
      })

      if (response.data.success) {
        setReviews(response.data.reviews)
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllReviews()
  }, [token])

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  const handleReply = async (reviewId) => {
    if (!replyText.trim()) {
      toast.error('Please enter a reply')
      return
    }

    try {
      const response = await axios.post(backendUrl + '/api/review/admin-reply', {
        reviewId,
        reply: replyText
      }, { headers: { token } })

      if (response.data.success) {
        toast.success('Reply sent successfully!')
        setReplyText('')
        setReplyingTo(null)
        fetchAllReviews() // Refresh to show the reply
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error('Failed to send reply')
    }
  }

  if (loading) {
    return (
      <div className='p-6 flex justify-center items-center'>
        <div className='text-gray-500'>Loading reviews...</div>
      </div>
    )
  }

  return (
    <div className='p-6'>
      <div className='flex items-center justify-between mb-6'>
        <h3 className='text-2xl font-bold text-gray-800 flex items-center gap-2'>
          <MessageSquare className='w-7 h-7 text-blue-600' />
          Product Reviews
        </h3>
        <span className='text-sm text-gray-500'>Total reviews: {reviews.length}</span>
      </div>

      <div className='space-y-4'>
        {reviews.length === 0 ? (
          <div className='text-center py-8 text-gray-500'>
            <MessageSquare className='w-12 h-12 mx-auto mb-4 text-gray-300' />
            <p>No reviews found</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className='bg-white border rounded-lg p-6 shadow-sm'>
              {/* Review Header */}
              <div className='flex items-start justify-between mb-4'>
                <div className='flex items-center gap-3'>
                  <div className='w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center'>
                    <User className='w-5 h-5 text-gray-600' />
                  </div>
                  <div>
                    <p className='font-medium text-gray-900'>{review.userName}</p>
                    <p className='text-sm text-gray-500'>
                      {new Date(review.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-1'>
                  {renderStars(review.rating)}
                  <span className='ml-2 text-sm font-medium'>{review.rating}/5</span>
                </div>
              </div>

              {/* Product Info */}
              <div className='flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded'>
                <img
                  src={review.productId?.image?.[0] || '/placeholder-image.png'}
                  alt={review.productId?.name || 'Product'}
                  className='w-12 h-12 object-cover rounded'
                />
                <div>
                  <p className='font-medium text-gray-900'>{review.productId?.name || 'Unknown Product'}</p>
                  <p className='text-sm text-gray-500'>
                    {review.orderId ? `Order #${review.orderId.slice(-8)}` : 'Direct Review'}
                  </p>
                </div>
              </div>

              {/* Review Comment */}
              <div className='bg-gray-50 rounded p-4'>
                <p className='text-gray-700 leading-relaxed'>{review.comment}</p>
              </div>

              {/* Admin Reply Section */}
              {review.adminReply && (
                <div className='mt-4 ml-6 border-l-4 border-blue-500 pl-4 bg-blue-50 rounded p-4'>
                  <div className='flex items-center gap-2 mb-2'>
                    <div className='w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center'>
                      <span className='text-xs font-bold text-white'>A</span>
                    </div>
                    <span className='font-medium text-blue-900'>Admin Reply</span>
                    <span className='text-xs text-blue-600'>
                      {new Date(review.adminReplyDate).toLocaleDateString()}
                    </span>
                  </div>
                  <p className='text-blue-800 leading-relaxed'>{review.adminReply}</p>
                </div>
              )}

              {/* Reply Button & Form */}
              <div className='mt-4 flex justify-end'>
                <button
                  onClick={() => {
                    setReplyingTo(replyingTo === review._id ? null : review._id)
                    setReplyText('')
                  }}
                  className='flex items-center gap-2 px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition'
                >
                  <Reply className='w-4 h-4' />
                  {replyingTo === review._id ? 'Cancel' : 'Reply'}
                </button>
              </div>

              {/* Reply Form */}
              {replyingTo === review._id && (
                <div className='mt-4 p-4 bg-gray-50 rounded-lg'>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder='Write your reply to this review...'
                    className='w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none'
                    rows={3}
                  />
                  <div className='mt-3 flex justify-end gap-2'>
                    <button
                      onClick={() => setReplyingTo(null)}
                      className='px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 transition'
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleReply(review._id)}
                      className='flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition'
                    >
                      <Send className='w-4 h-4' />
                      Send Reply
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Reviews
