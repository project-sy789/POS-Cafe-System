# ☕ Cafe POS System

ระบบ Point of Sale (POS) สำหรับร้านคาเฟ่ พัฒนาด้วย MERN Stack (MongoDB, Express, React, Node.js)

## 📚 Documentation

- [Installation Guide](docs/INSTALLATION.md) - คู่มือติดตั้งแบบละเอียด
- [Deployment Checklist](docs/DEPLOYMENT_CHECKLIST.md) - Checklist สำหรับ deploy
- [Contributing Guide](docs/CONTRIBUTING.md) - คู่มือสำหรับ contributors
- [Changelog](docs/CHANGELOG.md) - บันทึกการเปลี่ยนแปลง

## ✨ Features

### 🛒 POS (Point of Sale)
- ระบบขายหน้าร้านที่ใช้งานง่าย
- รองรับการสั่งซื้อแบบ Dine-In และ Take-Away
- ระบบตะกร้าสินค้าพร้อมคำนวณภาษีอัตโนมัติ
- รองรับการชำระเงินด้วยเงินสดและ QR Code (PromptPay)
- พิมพ์ใบเสร็จพร้อมข้อมูลร้านครบถ้วน

### 👨‍🍳 Barista Station
- แสดงคิวออเดอร์แบบ Real-time
- อัปเดตสถานะออเดอร์ (Pending → Preparing → Ready → Completed)
- แสดงรายละเอียดสินค้าและตัวเลือกเพิ่มเติม
- รองรับหลายบาริสต้าทำงานพร้อมกัน

### 📊 Dashboard (Manager)
- ภาพรวมยอดขายและสถิติ
- รายงานยอดขายรายวัน/รายเดือน
- จัดการสินค้า (เพิ่ม/แก้ไข/ลบ)
- จัดการหมวดหมู่สินค้า
- จัดการผู้ใช้งาน (Cashier, Barista)
- ตั้งค่าระบบ (ชื่อร้าน, ภาษี, PromptPay, ธีม UI)

### 🎨 Theme System
- **Default Theme:** สีสันสดใส เหมาะสำหรับการใช้งานทั่วไป
- **Minimal Theme:** ธีมมินิมอล สะอาดตา เน้นความเรียบง่าย
- เปลี่ยนธีมได้ทันทีโดยไม่ต้อง reload

### ⭐ Featured Category
- ปรับแต่งปุ่มหมวดหมู่แรกในหน้า POS
- 3 โหมด: แสดงทั้งหมด / แสดงสินค้าขายดี / ซ่อนปุ่ม
- กำหนดชื่อและไอคอนได้เอง

### 🔧 Product Options
- เพิ่มตัวเลือกสินค้า (ขนาด, ความหวาน, ท็อปปิ้ง)
- กำหนดราคาเพิ่มเติมสำหรับแต่ละตัวเลือก
- รองรับหลายกลุ่มตัวเลือกต่อสินค้า

### 🔄 Real-time Updates
- ใช้ Socket.IO สำหรับอัปเดตแบบ Real-time
- ออเดอร์ใหม่แสดงทันทีที่หน้า Barista
- สถานะออเดอร์อัปเดตทันทีทุกหน้า

## 🚀 Tech Stack

### Frontend
- **React 18** - UI Library
- **Vite** - Build Tool
- **TailwindCSS** - Styling
- **Zustand** - State Management
- **React Router** - Routing
- **Socket.IO Client** - Real-time Communication
- **Axios** - HTTP Client
- **React Hot Toast** - Notifications
- **Lucide React** - Icons

### Backend
- **Node.js** - Runtime
- **Express** - Web Framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Socket.IO** - Real-time Communication
- **JWT** - Authentication
- **Bcrypt** - Password Hashing
- **Multer** - File Upload
- **QRCode** - QR Code Generation

## 📋 Prerequisites

- Node.js 16+ 
- MongoDB 5+
- npm or yarn

## 🛠️ Installation

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/cafe-pos-system.git
cd cafe-pos-system
```

### 2. Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Environment Setup

#### Server (.env)

สร้างไฟล์ `.env` ใน folder `server`:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/cafe-pos

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# CORS Configuration
CLIENT_URL=http://localhost:5173
```

#### Client (.env)

สร้างไฟล์ `.env` ใน folder `client`:

```env
VITE_API_URL=http://localhost:3000
```

### 4. Seed Database

```bash
cd server
npm run seed
```

คำสั่งนี้จะสร้าง:
- ผู้ใช้งานตัวอย่าง (admin, cashier, barista)
- หมวดหมู่สินค้า
- สินค้าตัวอย่าง
- ตัวเลือกสินค้า
- การตั้งค่าเริ่มต้น

### 5. Run Application

#### Development Mode

```bash
# Terminal 1 - Run Server
cd server
npm run dev

# Terminal 2 - Run Client
cd client
npm run dev
```

#### Production Mode

```bash
# Build Client
cd client
npm run build

# Run Server (serves built client)
cd ../server
npm start
```

## 👥 Demo Accounts

| Role | Username | Password | Permissions |
|------|----------|----------|-------------|
| **Manager** | admin | admin123 | Full access to all features |
| **Cashier** | cashier1 | cashier123 | POS, Barista, limited dashboard |
| **Barista** | barista1 | barista123 | Barista station only |

## 📱 Pages & Routes

### Public Routes
- `/login` - Login page

### Protected Routes
- `/pos` - POS page (Cashier, Manager)
- `/barista` - Barista station (Cashier, Manager)
- `/dashboard` - Dashboard home (Manager only)
- `/dashboard/products` - Product management (Manager only)
- `/dashboard/categories` - Category management (Manager only)
- `/dashboard/users` - User management (Manager only)
- `/dashboard/reports` - Sales reports (Manager only)
- `/dashboard/settings` - System settings (Manager only)

## 🎨 Theme Customization

### Changing Theme

1. Login as Manager
2. Go to Dashboard → Settings → 🎨 ธีม
3. Select theme:
   - **ธีมปกติ (Default)** - Colorful theme with blue accents
   - **ธีมมินิมอล (Minimal)** - Grayscale minimal theme
4. Click "บันทึกการตั้งค่า"

### Theme Differences

| Feature | Default Theme | Minimal Theme |
|---------|---------------|---------------|
| Background | Blue tint (#EFF6FF) | Gray (#F5F5F5) |
| Accent Color | Blue (#2563EB) | Dark Gray (#404040) |
| Shadows | Prominent | Minimal/None |
| Border Radius | Large (8px) | Small (4px) |
| Overall Feel | Colorful & Modern | Clean & Simple |

## ⚙️ Configuration

### Store Settings

Configure your store information in Dashboard → Settings:

#### 🏪 Store Information
- Store Name
- Address
- Phone Number

#### 💰 Tax Settings
- Tax Rate (default 7%)
- Tax Calculation Method:
  - Add tax on top of price
  - Include tax in price

#### 💳 Payment Settings
- PromptPay ID (Phone number or National ID)

#### ⭐ Featured Category
- Display Mode: All Products / Best Sellers / Hidden
- Custom Label (max 20 characters)
- Custom Icon (emoji or image)

#### 🎨 UI Theme
- Default Theme
- Minimal Theme

#### 🖼️ Branding
- Favicon Upload
- Logo Upload

## 📊 Database Schema

### Collections

- **users** - User accounts (Manager, Cashier, Barista)
- **products** - Product catalog
- **categories** - Product categories
- **orders** - Customer orders
- **settings** - System settings
- **productoptions** - Product customization options

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (RBAC)
- Protected API routes
- CORS configuration
- Input validation
- XSS protection

## 🚀 Deployment

### Deploy to Production

1. **Build Frontend:**
```bash
cd client
npm run build
```

2. **Configure Environment:**
- Update `.env` with production values
- Set `NODE_ENV=production`
- Use production MongoDB URI
- Update `CLIENT_URL` to production domain

3. **Deploy Backend:**
- Deploy to your preferred platform (Heroku, DigitalOcean, AWS, etc.)
- Ensure MongoDB is accessible
- Set environment variables

4. **Serve Static Files:**
The server automatically serves the built client from `client/dist`

### Environment Variables for Production

```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/cafe-pos
JWT_SECRET=your-production-secret-key-very-long-and-random
JWT_EXPIRES_IN=7d
CLIENT_URL=https://your-domain.com
```

## 📝 API Documentation

### Authentication

```bash
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

### Products

```bash
GET    /api/products
GET    /api/products/:id
POST   /api/products
PUT    /api/products/:id
DELETE /api/products/:id
GET    /api/products/best-sellers
```

### Orders

```bash
GET    /api/orders
GET    /api/orders/:id
POST   /api/orders
PUT    /api/orders/:id
DELETE /api/orders/:id
GET    /api/orders/sales-report
```

### Categories

```bash
GET    /api/categories
POST   /api/categories
PUT    /api/categories/:id
DELETE /api/categories/:id
```

### Users

```bash
GET    /api/users
POST   /api/users
PUT    /api/users/:id
DELETE /api/users/:id
```

### Settings

```bash
GET    /api/settings
PUT    /api/settings
```

## 🐛 Troubleshooting

### MongoDB Connection Error

```bash
# Make sure MongoDB is running
mongod

# Or use MongoDB Compass to check connection
```

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or change PORT in .env
```

### Socket.IO Connection Issues

- Check if server is running
- Verify `VITE_API_URL` in client `.env`
- Check browser console for errors
- Clear browser cache and reload

### Theme Not Changing

- Hard reload browser (Ctrl+Shift+R)
- Clear localStorage: `localStorage.clear()`
- Check console for errors

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

Your Name - [@yourusername](https://github.com/yourusername)

## 🙏 Acknowledgments

- React Team for the amazing library
- MongoDB Team for the database
- Socket.IO Team for real-time capabilities
- TailwindCSS Team for the styling framework
- All open-source contributors

## 📞 Support

For support, email your-email@example.com or open an issue on GitHub.

---

Made with ❤️ for coffee lovers ☕
