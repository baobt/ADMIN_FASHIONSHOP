import React, { useEffect, useState } from 'react'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'
import axios from 'axios'
import {
  TrendingUp,
  ShoppingCart,
  Users,
  XCircle,
  DollarSign,
  BarChart3,
  Calendar,
  Filter
} from 'lucide-react'

const Dashboard = ({ token }) => {
  const [overview, setOverview] = useState({})
  const [chartData, setChartData] = useState({})
  const [topProducts, setTopProducts] = useState([])
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [timeFilter, setTimeFilter] = useState('today')
  const [chartPeriod, setChartPeriod] = useState('daily')

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      const [overviewRes, chartRes, productsRes, ordersRes] = await Promise.all([
        axios.get(backendUrl + `/api/analytics/overview?period=${timeFilter}`, { headers: { token } }),
        axios.get(backendUrl + `/api/analytics/revenue-chart?period=${chartPeriod}&range=month`, { headers: { token } }),
        axios.get(backendUrl + '/api/analytics/top-products?limit=5', { headers: { token } }),
        axios.get(backendUrl + '/api/analytics/recent-orders?limit=5', { headers: { token } })
      ])

      if (overviewRes.data.success) setOverview(overviewRes.data.data)
      if (chartRes.data.success) {
        setChartData(chartRes.data.data)
        console.log('Chart data received:', chartRes.data.data)
      }
      if (productsRes.data.success) setTopProducts(productsRes.data.data)
      if (ordersRes.data.success) setRecentOrders(ordersRes.data.data)

      // Log all responses for debugging
      console.log('Dashboard data loaded:', {
        overview: overviewRes.data,
        chart: chartRes.data,
        products: productsRes.data,
        orders: ordersRes.data
      })

    } catch (error) {
      console.log(error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [token, timeFilter, chartPeriod])

  const timeFilters = [
    { key: 'today', label: 'Today' },
    { key: 'week', label: 'Last 7 Days' },
    { key: 'month', label: 'This Month' }
  ]

  const chartPeriods = [
    { key: 'daily', label: 'Daily' },
    { key: 'weekly', label: 'Weekly' },
    { key: 'monthly', label: 'Monthly' }
  ]

  const overviewCards = [
    {
      title: 'Total Revenue',
      value: overview.totalRevenue ? `${currency}${overview.totalRevenue.toLocaleString()}` : `${currency}0`,
      icon: DollarSign,
      color: 'bg-green-500'
    },
    {
      title: 'Total Orders',
      value: overview.totalOrders || 0,
      icon: ShoppingCart,
      color: 'bg-blue-500'
    },
    {
      title: 'Customers',
      value: overview.uniqueCustomers || 0,
      icon: Users,
      color: 'bg-purple-500'
    },
    {
      title: 'Cancelled Orders',
      value: overview.cancelledOrders || 0,
      icon: XCircle,
      color: 'bg-red-500'
    }
  ]

  if (loading) {
    return (
      <div className='p-6 flex justify-center items-center min-h-screen'>
        <div className='text-gray-500'>Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className='p-6 space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div>
          <h1 className='text-3xl font-bold text-gray-800'>Dashboard</h1>
          <p className='text-gray-600 mt-1'>Analytics & Business Insights</p>
        </div>

        {/* Time Filter */}
        <div className='flex items-center gap-2'>
          <Filter className='w-4 h-4 text-gray-500' />
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className='px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
          >
            {timeFilters.map(filter => (
              <option key={filter.key} value={filter.key}>{filter.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {overviewCards.map((card, index) => (
          <div key={index} className='bg-white p-6 rounded-lg shadow-sm border'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>{card.title}</p>
                <p className='text-2xl font-bold text-gray-900 mt-1'>{card.value}</p>
              </div>
              <div className={`${card.color} p-3 rounded-full`}>
                <card.icon className='w-6 h-6 text-white' />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className='bg-white p-6 rounded-lg shadow-sm border'>
        <div className='flex items-center justify-between mb-6'>
          <div>
            <h2 className='text-xl font-semibold text-gray-800'>Revenue Trend</h2>
            <p className='text-gray-600 text-sm'>Revenue over time</p>
          </div>

          {/* Chart Period Toggle */}
          <div className='flex gap-2'>
            {chartPeriods.map(period => (
              <button
                key={period.key}
                onClick={() => setChartPeriod(period.key)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  chartPeriod === period.key
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>

        {/* Professional Bar Chart */}
        <div className='h-80 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border'>
          {(() => {
            if (chartData.data && chartData.data.length > 0) {
              const hasRevenue = chartData.data.some(value => value > 0);

              if (!hasRevenue && !chartData.isSampleData) {
                return (
                  <div className='flex flex-col items-center justify-center h-full'>
                    <div className='bg-white p-8 rounded-full shadow-lg mb-4'>
                      <BarChart3 className='w-16 h-16 text-gray-400' />
                    </div>
                    <h3 className='text-lg font-semibold text-gray-700 mb-2'>No Revenue Data</h3>
                    <p className='text-gray-500 text-center max-w-md'>
                      No revenue data available for the selected period.
                      Try changing the time period or create more orders to see trends.
                    </p>
                  </div>
                );
              }

              const maxValue = Math.max(...chartData.data);
              const minValue = Math.min(...chartData.data.filter(v => v > 0)) || 0;

              return (
                <div className='flex flex-col h-full'>
                  {/* Chart Area */}
                  <div className='flex-1 flex items-end justify-center gap-1 pb-2'>
                    {chartData.data.map((value, index) => {
                      // Calculate height with better scaling
                      let heightPercent = 0;
                      if (maxValue > 0) {
                        if (chartPeriod === 'daily') {
                          // For daily, ensure minimum visibility and better scaling
                          heightPercent = Math.max((value / maxValue) * 80, value > 0 ? 12 : 0);
                        } else {
                          // For weekly/monthly, use full range
                          heightPercent = (value / maxValue) * 80;
                        }
                      }

                      const isHighest = value === maxValue && value > 0;

                      return (
                        <div key={index} className='flex flex-col items-center group relative' style={{ width: '3.5%' }}>
                          {/* Value label above bar - only on hover */}
                          <div className='absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10'>
                            <div className='bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap'>
                              {currency}{value.toLocaleString()}
                            </div>
                          </div>

                          {/* Bar */}
                          <div className='relative w-full flex flex-col items-center mb-2'>
                            <div
                              className={`w-full rounded-t-md transition-all duration-300 hover:brightness-110 ${
                                value > 0
                                  ? isHighest
                                    ? 'bg-gradient-to-t from-blue-600 to-blue-400 shadow-md'
                                    : 'bg-gradient-to-t from-blue-500 to-blue-300'
                                  : 'bg-gray-200'
                              }`}
                              style={{
                                height: `${Math.max(heightPercent, 0)}px`,
                                minHeight: value > 0 ? '20px' : '0px'
                              }}
                            >
                              {/* Value inside bar for large bars */}
                              {value > 0 && heightPercent > 40 && (
                                <div className='absolute inset-x-0 top-1 flex items-center justify-center px-1'>
                                  <span className='text-white text-xs font-semibold drop-shadow-sm text-center leading-tight'>
                                    {value >= 1000000 ? `${(value / 1000000).toFixed(1)}M` :
                                     value >= 1000 ? `${(value / 1000).toFixed(0)}K` :
                                     value >= 100 ? value.toLocaleString() : value}
                                  </span>
                                </div>
                              )}

                              {/* Highlight for highest value */}
                              {isHighest && value > 0 && (
                                <div className='absolute -top-1 left-1/2 transform -translate-x-1/2'>
                                  <div className='w-0 h-0 border-l-1.5 border-r-1.5 border-b-3 border-transparent border-b-yellow-400'></div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Date label below bar */}
                          <div className='text-center leading-tight'>
                            <div className='text-xs font-medium text-gray-700'>
                              {chartPeriod === 'daily'
                                ? (chartData.labels?.[index] ? new Date(chartData.labels[index]).getDate() : index + 1)
                                : chartPeriod === 'weekly'
                                ? `W${index + 1}`
                                : (chartData.labels?.[index]
                                  ? new Date(chartData.labels[index]).toLocaleDateString('en-US', { month: 'short' })
                                  : `M${index + 1}`)
                              }
                            </div>
                            {chartPeriod === 'daily' && chartData.data.length <= 31 && (
                              <div className='text-xs text-gray-500 -mt-0.5'>
                                {chartData.labels?.[index]
                                  ? new Date(chartData.labels[index]).toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3)
                                  : ''}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Chart Footer */}
                  <div className='flex items-center justify-between pt-4 border-t border-gray-200'>
                    <div className='text-sm text-gray-600'>
                      {chartPeriod === 'daily' && 'Daily revenue for the past 30 days'}
                      {chartPeriod === 'weekly' && 'Weekly revenue for the past 12 weeks'}
                      {chartPeriod === 'monthly' && 'Monthly revenue for the past 12 months'}
                    </div>
                    <div className='text-sm font-medium text-gray-700'>
                      Total: {currency}{chartData.data.reduce((sum, val) => sum + val, 0).toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            } else {
              return (
                <div className='flex flex-col items-center justify-center h-full'>
                  <div className='bg-white p-8 rounded-full shadow-lg mb-4'>
                    <BarChart3 className='w-16 h-16 text-gray-400' />
                  </div>
                  <h3 className='text-lg font-semibold text-gray-700 mb-2'>No Data Available</h3>
                  <p className='text-gray-500 text-center max-w-md'>
                    No revenue data is available yet. Create some orders to start seeing trends.
                  </p>
                </div>
              );
            }
          })()}

          {chartData.isSampleData && (
            <div className='mt-4 text-center'>
              <div className='inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg'>
                <div className='w-2 h-2 bg-yellow-400 rounded-full animate-pulse'></div>
                <span className='text-sm font-medium text-yellow-800'>
                  Sample Data - Create real orders to see actual revenue trends
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Top Products */}
        <div className='bg-white p-6 rounded-lg shadow-sm border'>
          <h2 className='text-xl font-semibold text-gray-800 mb-4'>Top Products</h2>
          <div className='space-y-3'>
            {topProducts.length > 0 ? (
              topProducts.map((product, index) => (
                <div key={product.id} className='flex items-center gap-3 p-3 bg-gray-50 rounded'>
                  <div className='w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold'>
                    {index + 1}
                  </div>
                  <img
                    src={product.image?.[0] || '/placeholder-image.png'}
                    alt={product.name}
                    className='w-10 h-10 object-cover rounded'
                  />
                  <div className='flex-1'>
                    <p className='font-medium text-gray-900'>{product.name}</p>
                    <p className='text-sm text-gray-600'>
                      {product.quantity} sold • {currency}{product.revenue.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className='text-gray-500 text-center py-4'>No sales data available</p>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className='bg-white p-6 rounded-lg shadow-sm border'>
          <h2 className='text-xl font-semibold text-gray-800 mb-4'>Recent Orders</h2>
          <div className='space-y-3'>
            {recentOrders.length > 0 ? (
              recentOrders.slice(0, 5).map((order) => (
                <div key={order._id} className='flex items-center justify-between p-3 bg-gray-50 rounded'>
                  <div>
                    <p className='font-medium text-gray-900'>#{order._id.slice(-8)}</p>
                    <p className='text-sm text-gray-600'>
                      {new Date(order.date).toLocaleDateString()} • {order.paymentMethod}
                    </p>
                  </div>
                  <div className='text-right'>
                    <p className='font-medium text-gray-900'>{currency}{order.amount.toLocaleString()}</p>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'Packing' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className='text-gray-500 text-center py-4'>No recent orders</p>
            )}
          </div>
        </div>
      </div>

      {/* Payment Methods Summary */}
      <div className='bg-white p-6 rounded-lg shadow-sm border'>
        <h2 className='text-xl font-semibold text-gray-800 mb-4'>Payment Methods</h2>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div className='text-center p-4 bg-gray-50 rounded'>
            <p className='text-2xl font-bold text-gray-900'>{overview.paymentMethods?.COD || 0}</p>
            <p className='text-gray-600'>Cash on Delivery</p>
          </div>
          <div className='text-center p-4 bg-gray-50 rounded'>
            <p className='text-2xl font-bold text-gray-900'>{overview.paymentMethods?.MoMo || 0}</p>
            <p className='text-gray-600'>MoMo</p>
          </div>
          <div className='text-center p-4 bg-gray-50 rounded'>
            <p className='text-2xl font-bold text-gray-900'>{overview.paymentMethods?.PayPal || 0}</p>
            <p className='text-gray-600'>PayPal</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
