import React, { useState, useEffect, useRef } from 'react'
import { MessageSquare, Send, Users, Clock, CheckCircle, AlertCircle, X, MessageCircle, Trash2 } from 'lucide-react'
import { io } from 'socket.io-client'
import { toast } from 'react-toastify'

const Chat = () => {
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [socket, setSocket] = useState(null)
  const messagesEndRef = useRef(null)

  // Initialize socket connection
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token && !socket) {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'
      const newSocket = io(backendUrl, {
        transports: ['websocket', 'polling']
      })

      newSocket.on('connect', () => {
        console.log('Admin connected to chat server')
        newSocket.emit('join_admin')
      })

      // Listen for new messages from users
      newSocket.on('new_message', (data) => {
        console.log('New message received:', data)
        // Refresh conversations list
        fetchConversations()
        // If this conversation is selected, refresh messages
        if (selectedConversation && selectedConversation._id === data.conversationId) {
          fetchMessages(data.conversationId)
        }
        toast.info(`Tin nhắn mới từ khách hàng!`)
      })

      // Listen for typing indicators
      newSocket.on('user_typing', (data) => {
        // Handle typing indicator if needed
      })

      setSocket(newSocket)
    }

    return () => {
      if (socket) {
        socket.disconnect()
      }
    }
  }, [])

  // Fetch all conversations
  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('token')
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'

      const response = await fetch(`${backendUrl}/api/chat/admin/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          token
        }
      })

      const data = await response.json()
      if (data.success) {
        setConversations(data.conversations)
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
    }
  }

  // Fetch messages for a conversation
  const fetchMessages = async (conversationId) => {
    try {
      const token = localStorage.getItem('token')
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'

      const response = await fetch(`${backendUrl}/api/chat/admin/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          token
        },
        body: JSON.stringify({ conversationId })
      })

      const data = await response.json()
      if (data.success) {
        setMessages(data.messages)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || loading) return

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'

      const response = await fetch(`${backendUrl}/api/chat/admin/send-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          token
        },
        body: JSON.stringify({
          conversationId: selectedConversation._id,
          message: newMessage.trim()
        })
      })

      const data = await response.json()
      if (data.success) {
        // Emit socket event
        if (socket) {
          socket.emit('admin_send_message', {
            conversationId: selectedConversation._id,
            message: newMessage.trim(),
            userId: selectedConversation.userId
          })
        }

        setMessages(prev => [...prev, data.message])
        setNewMessage('')

        // Update conversation status to active if it was waiting
        if (selectedConversation.status === 'waiting') {
          updateConversationStatus(selectedConversation._id, 'active')
        }
      } else {
        toast.error(data.message || 'Failed to send message')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
    } finally {
      setLoading(false)
    }
  }

  // Update conversation status
  const updateConversationStatus = async (conversationId, status) => {
    try {
      const token = localStorage.getItem('token')
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'

      const response = await fetch(`${backendUrl}/api/chat/admin/update-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          token
        },
        body: JSON.stringify({ conversationId, status })
      })

      const data = await response.json()
      if (data.success) {
        // Update local state
        setConversations(prev =>
          prev.map(conv =>
            conv._id === conversationId ? { ...conv, status } : conv
          )
        )
        if (selectedConversation && selectedConversation._id === conversationId) {
          setSelectedConversation(prev => ({ ...prev, status }))
        }
      }
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  // Handle conversation selection
  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation)
    fetchMessages(conversation._id)
  }

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Fetch conversations on component mount
  useEffect(() => {
    fetchConversations()
  }, [])

  // Format time
  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'waiting':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'closed':
        return <X className="w-4 h-4 text-gray-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />
    }
  }

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-50'
      case 'waiting':
        return 'text-yellow-600 bg-yellow-50'
      case 'closed':
        return 'text-gray-600 bg-gray-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  // Delete conversation
  const deleteConversation = async () => {
    if (!selectedConversation) return

    // Show confirmation dialog
    const confirmDelete = window.confirm(
      `Bạn có chắc chắn muốn xóa cuộc trò chuyện với ${selectedConversation.userInfo.name}? Tất cả tin nhắn sẽ bị xóa vĩnh viễn.`
    )

    if (!confirmDelete) return

    try {
      const token = localStorage.getItem('token')
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'

      const response = await fetch(`${backendUrl}/api/chat/admin/delete-conversation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          token
        },
        body: JSON.stringify({ conversationId: selectedConversation._id })
      })

      const data = await response.json()
      if (data.success) {
        toast.success('Cuộc trò chuyện đã được xóa thành công')
        // Refresh conversations list
        fetchConversations()
        // Clear selected conversation
        setSelectedConversation(null)
        setMessages([])
      } else {
        toast.error(data.message || 'Không thể xóa cuộc trò chuyện')
      }
    } catch (error) {
      console.error('Error deleting conversation:', error)
      toast.error('Có lỗi xảy ra khi xóa cuộc trò chuyện')
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Conversations Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Chat Support</h2>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {conversations.length} cuộc trò chuyện
          </p>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <MessageSquare className="w-12 h-12 mb-3 text-gray-300" />
              <p className="text-sm">Chưa có cuộc trò chuyện nào</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {conversations.map((conversation) => (
                <div
                  key={conversation._id}
                  onClick={() => handleConversationSelect(conversation)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedConversation?._id === conversation._id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900 text-sm">
                          {conversation.userInfo.name}
                        </h3>
                        {getStatusIcon(conversation.status)}
                      </div>
                      <p className="text-xs text-gray-500 mb-1">
                        {conversation.userInfo.email}
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        {conversation.lastMessage || 'Chưa có tin nhắn'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {new Date(conversation.lastMessageTime).toLocaleDateString('vi-VN')}
                      </p>
                      {conversation.unreadCount.admin > 0 && (
                        <div className="mt-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {conversation.unreadCount.admin}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(conversation.status)}`}>
                      {conversation.status === 'active' ? 'Đang hoạt động' :
                       conversation.status === 'waiting' ? 'Đang chờ' : 'Đã đóng'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {selectedConversation.userInfo.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {selectedConversation.userInfo.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedConversation.status}
                    onChange={(e) => updateConversationStatus(selectedConversation._id, e.target.value)}
                    className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="waiting">Đang chờ</option>
                    <option value="active">Đang hoạt động</option>
                    <option value="closed">Đã đóng</option>
                  </select>

                  {/* Delete button - only show for closed conversations */}
                  {selectedConversation.status === 'closed' && (
                    <button
                      onClick={deleteConversation}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                      title="Xóa cuộc trò chuyện"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
              <div className="space-y-4">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.senderModel === 'admin' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-md p-3 rounded-lg text-sm ${
                        msg.senderModel === 'admin'
                          ? 'bg-blue-500 text-white'
                          : 'bg-white text-gray-900 border border-gray-200'
                      }`}
                    >
                      <p>{msg.message}</p>
                      <p className={`text-xs mt-1 ${
                        msg.senderModel === 'admin' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {formatTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  disabled={loading}
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || loading}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {loading ? 'Đang gửi...' : 'Gửi'}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Chọn cuộc trò chuyện
              </h3>
              <p className="text-gray-500">
                Chọn một cuộc trò chuyện từ danh sách để bắt đầu chat với khách hàng
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Chat
