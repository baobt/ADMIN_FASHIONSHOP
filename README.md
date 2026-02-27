# Ecommerce Admin Dashboard

A comprehensive admin panel built with React for managing e-commerce operations, including product management, order processing, customer support, and analytics.

## 🚀 Features

### 👨‍💼 Admin Authentication
- **Secure Login** - Admin-only access with role verification
- **Session Management** - Automatic logout and token refresh
- **Access Control** - Role-based permissions and restrictions

### 📦 Product Management
- **Product CRUD** - Create, read, update, delete products
- **Inventory Control** - Stock level management and alerts
- **Image Upload** - Cloudinary integration for product images
- **Category Management** - Organize products by categories
- **Bulk Operations** - Mass update and delete operations

### 📋 Order Management
- **Order Processing** - Complete order lifecycle management
- **Status Updates** - Track orders from placement to delivery
- **Customer Information** - Access to order and customer details
- **Order History** - Complete audit trail of order changes
- **Export Functionality** - Generate reports and invoices

### 💬 Customer Support
- **Real-time Chat** - Live customer support interface
- **Conversation Management** - Handle multiple customer conversations
- **Message History** - Persistent chat logs and transcripts
- **Typing Indicators** - Real-time user activity notifications
- **Status Management** - Active, waiting, and closed conversations

### 📊 Analytics & Reporting
- **Sales Analytics** - Revenue tracking and performance metrics
- **Customer Insights** - User behavior and demographics
- **Product Performance** - Best-selling items and trends
- **Inventory Reports** - Stock levels and reorder alerts
- **Custom Dashboards** - Personalized analytics views

### 👥 User Management
- **Customer Database** - View and manage user accounts
- **User Activity** - Track user behavior and engagement
- **Account Management** - User profile and permission controls
- **Communication** - Send notifications and updates

### 🔍 Review Management
- **Review Moderation** - Approve or reject customer reviews
- **Rating Analytics** - Product rating trends and insights
- **Response Management** - Admin responses to customer reviews
- **Quality Control** - Maintain review quality standards

## 🛠️ Technology Stack

- **React 18** - Modern UI framework with hooks
- **Vite** - Lightning-fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing and navigation
- **Axios** - Promise-based HTTP client
- **Socket.io-client** - Real-time bidirectional communication
- **React Toastify** - Toast notifications
- **Lucide React** - Beautiful icon library
- **Chart.js/React-Chartjs-2** - Data visualization

## 📁 Project Structure

```
admin/
├── public/                 # Static assets
│   └── vite.svg
├── src/
│   ├── assets/            # Images, icons, and media files
│   │   ├── assets.js      # Asset exports and configurations
│   │   └── [admin-assets]/ # Admin-specific media
│   ├── components/        # Reusable UI components
│   │   ├── Navbar.jsx     # Admin navigation bar
│   │   ├── SideBar.jsx    # Admin sidebar menu
│   │   ├── Login.jsx      # Admin authentication
│   │   └── [other-components]/
│   ├── Pages/             # Admin page components
│   │   ├── Dashboard.jsx  # Main dashboard
│   │   ├── Add.jsx        # Add new products
│   │   ├── List.jsx       # Product listing
│   │   ├── Orders.jsx     # Order management
│   │   ├── Inventory.jsx  # Inventory control
│   │   ├── Reviews.jsx    # Review management
│   │   ├── Chat.jsx       # Customer support chat
│   │   └── [other-pages]/
│   ├── context/           # React Context providers
│   │   └── AdminContext.jsx # Admin state management
│   ├── App.jsx            # Main application component
│   ├── main.jsx           # Application entry point
│   └── index.css          # Global styles
├── .env                   # Environment variables
├── .gitignore            # Git ignore rules
├── eslint.config.js      # ESLint configuration
├── index.html            # HTML template
├── package.json          # Dependencies and scripts
├── README.md             # This file
└── vite.config.js        # Vite configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- Running backend API server

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/ecommerce-admin.git
   cd ecommerce-admin
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   ```bash
   cp .env.example .env
   ```

   Configure the following variables in `.env`:
   ```env
   VITE_BACKEND_URL=http://localhost:4000
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to `http://localhost:5174`

## 📋 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint

# Code Quality
npm run lint:fix     # Fix ESLint issues
npm run format       # Format code with Prettier
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_BACKEND_URL` | Backend API URL | `http://localhost:4000` |

### Admin Credentials

Default admin credentials (configured in backend):
- **Email:** admin@example.com
- **Password:** admin123

## 🎨 UI Components

### Design System

The admin panel uses a consistent design system:

- **Primary Color:** Blue (#3B82F6) for actions and links
- **Secondary Color:** Gray (#6B7280) for secondary elements
- **Success Color:** Green (#10B981) for positive actions
- **Warning Color:** Yellow (#F59E0B) for warnings
- **Error Color:** Red (#EF4444) for errors


## 🔄 State Management

### AdminContext

Global admin state management:

```javascript
const AdminContext = createContext()

export const AdminContextProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [analytics, setAnalytics] = useState({})

  // Context value
  const value = {
    token, setToken,
    products, setProducts,
    orders, setOrders,
    analytics, setAnalytics,
    backendUrl
  }

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  )
}
```

## 📊 Dashboard Analytics

### Key Metrics

- **Total Revenue** - Overall sales performance
- **Order Count** - Number of orders processed
- **Customer Count** - Total registered customers
- **Product Count** - Total products in catalog

### Charts & Visualizations

- **Sales Trends** - Revenue over time
- **Order Status** - Order fulfillment status
- **Top Products** - Best-selling items
- **Customer Growth** - User registration trends

## 📦 Product Management

### Product CRUD Operations

```javascript
// Add new product
const addProduct = async (productData) => {
  const response = await axios.post(`${backendUrl}/api/product/add`, productData, {
    headers: { token }
  })
  return response.data
}

// Update existing product
const updateProduct = async (productId, productData) => {
  const response = await axios.post(`${backendUrl}/api/product/update`, {
    id: productId,
    ...productData
  }, {
    headers: { token }
  })
  return response.data
}
```

### Image Upload

Products support multiple images with Cloudinary integration:

```javascript
const uploadImage = async (file) => {
  const formData = new FormData()
  formData.append('image', file)

  const response = await axios.post(`${backendUrl}/api/product/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      token
    }
  })
  return response.data
}
```

## 📋 Order Management

### Order Status Flow

```
Order Placed → Packing → Shipped → Out for Delivery → Delivered
     ↓           ↓        ↓            ↓              ↓
  Cancelled  Cancelled Cancelled   Cancelled     Completed
```

### Order Operations

- **View Details** - Complete order information
- **Update Status** - Change order status
- **Add Notes** - Internal order notes
- **Contact Customer** - Customer communication
- **Generate Invoice** - PDF invoice generation

## 💬 Real-time Chat Support

### Chat Features

- **Live Conversations** - Real-time messaging with customers
- **Multiple Chats** - Handle multiple conversations simultaneously
- **Message History** - Persistent chat logs
- **File Sharing** - Image and document uploads
- **Typing Indicators** - Real-time activity notifications


```


## 🔐 Security Features

### Authentication

- **JWT Tokens** - Secure session management
- **Role Verification** - Admin-only access control
- **Session Timeout** - Automatic logout after inactivity
- **Password Policies** - Strong password requirements


### Running Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deployment Options

- **Netlify** - Static hosting with form handling
- **Vercel** - Serverless deployment
- **Firebase Hosting** - Google's hosting solution
- **AWS S3 + CloudFront** - Scalable cloud hosting















