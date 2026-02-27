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
                className={`px-3 py-1 text-sm rounded-md transition ${
                  chartPeriod === period.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>

        {/* Simple Bar Chart */}
        <div className='h-64 bg-gray-50 rounded-lg p-4'>
          {(() => {
            console.log('Rendering chart with data:', chartData);
            console.log('Data array:', chartData.data);
            console.log('Labels array:', chartData.labels);

            if (chartData.data && chartData.data.length > 0) {
              // Check if we have any non-zero values
              const hasRevenue = chartData.data.some(value => value > 0);

              if (!hasRevenue && !chartData.isSampleData) {
                // No real revenue data, show sample data prompt
                return (
                  <div className='flex items-center justify-center h-full'>
                    <div className='text-center'>
                      <BarChart3 className='w-12 h-12 text-gray-400 mx-auto mb-2' />
                      <p className='text-gray-500'>No revenue data for selected period</p>
                      <p className='text-sm text-gray-400 mt-1'>
                        Try changing the time period or create more orders
                      </p>
                    </div>
                  </div>
                );
              }

              return (
                <div className='flex items-end justify-between h-full space-x-1'>
                  {chartData.data.map((value, index) => {
                    console.log(`Bar ${index}: value=${value}, label=${chartData.labels?.[index]}`);
                    const maxValue = Math.max(...chartData.data);
                    const heightPercent = maxValue > 0 ? (value / maxValue) * 100 : 0;

                    // Ensure bars with value > 0 are visible
                    const displayHeight = value > 0 ? Math.max(heightPercent, 5) : (chartData.isSampleData ? Math.max(heightPercent, 2) : 0);

                    return (
                      <div key={index} className='flex-1 flex flex-col items-center relative'>
                        {/* Bar */}
                        <div
                          className={`w-full rounded-t transition-all duration-300 hover:opacity-80 ${
                            value > 0 ? 'bg-blue-500' : 'bg-gray-200'
                          }`}
                          style={{
                            height: `${displayHeight}%`,
                            minHeight: value > 0 ? '12px' : '0px'
                          }}
                          title={`${chartData.labels?.[index] || 'Unknown'}: ${currency}${value.toLocaleString()}`}
                        ></div>

                        {/* Value label on bar */}
                        {value > 0 && displayHeight > 15 && (
                          <div
                            className='absolute text-white text-xs font-bold flex items-center justify-center w-full'
                            style={{
                              bottom: '2px',
                              height: `${displayHeight - 4}%`
                            }}
                          >
                            {value >= 1000000 ? `${(value / 1000000).toFixed(1)}M` :
                             value >= 1000 ? `${(value / 1000).toFixed(0)}K` :
                             value.toLocaleString()}
                          </div>
                        )}

                        {/* Date label below bar */}
                        <div className='text-xs text-gray-600 mt-1 text-center'>
                          {chartPeriod === 'daily' ? (chartData.labels?.[index] ? new Date(chartData.labels[index]).getDate() : index) :
                           chartPeriod === 'weekly' ? `W${index + 1}` :
                           (chartData.labels?.[index] ? new Date(chartData.labels[index]).toLocaleDateString('en-US', { month: 'short' }) : index)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            } else {
              return (
                <div className='flex items-center justify-center h-full'>
                  <div className='text-center'>
                    <BarChart3 className='w-12 h-12 text-gray-400 mx-auto mb-2' />
                    <p className='text-gray-500'>No revenue data available</p>
                    <p className='text-sm text-gray-400 mt-1'>
                      Create some orders to see the revenue trend
                    </p>
                    <p className='text-xs text-red-500 mt-2'>
                      Debug: Check console for data logs
                    </p>
                  </div>
                </div>
              );
            }
          })()}

          {chartData.isSampleData && (
            <div className='mt-2 text-center'>
              <span className='inline-block px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded'>
                Sample Data - Create real orders to see actual revenue
              </span>
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
