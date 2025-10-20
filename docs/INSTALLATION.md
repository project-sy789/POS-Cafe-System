# 📦 Installation Guide - Cafe POS System

คู่มือติดตั้งระบบ POS สำหรับร้านคาเฟ่แบบละเอียด

## 📋 ข้อกำหนดระบบ

### Software Requirements

- **Node.js** 16.x หรือสูงกว่า
- **MongoDB** 5.x หรือสูงกว่า
- **npm** 8.x หรือสูงกว่า (มากับ Node.js)
- **Git** (สำหรับ clone repository)

### Hardware Requirements

- **RAM:** 4GB ขึ้นไป (แนะนำ 8GB)
- **Storage:** 1GB ว่างสำหรับติดตั้ง
- **CPU:** Dual-core ขึ้นไป

## 🔧 ขั้นตอนการติดตั้ง

### Step 1: ติดตั้ง Node.js

#### Windows

1. ดาวน์โหลด Node.js จาก https://nodejs.org/
2. เลือก LTS version (แนะนำ)
3. รันไฟล์ติดตั้งและทำตามขั้นตอน
4. ตรวจสอบการติดตั้ง:

```bash
node --version
npm --version
```

#### macOS

```bash
# ใช้ Homebrew
brew install node

# หรือดาวน์โหลดจาก https://nodejs.org/
```

#### Linux (Ubuntu/Debian)

```bash
# ติดตั้ง Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# ตรวจสอบ
node --version
npm --version
```

### Step 2: ติดตั้ง MongoDB

#### Windows

1. ดาวน์โหลด MongoDB Community Server จาก https://www.mongodb.com/try/download/community
2. รันไฟล์ติดตั้ง
3. เลือก "Complete" installation
4. ติดตั้ง MongoDB Compass (GUI tool) ด้วย
5. เริ่มต้น MongoDB Service:

```bash
# MongoDB จะรันอัตโนมัติเป็น Windows Service
# ตรวจสอบสถานะ:
net start MongoDB
```

#### macOS

```bash
# ใช้ Homebrew
brew tap mongodb/brew
brew install mongodb-community

# เริ่มต้น MongoDB
brew services start mongodb-community

# ตรวจสอบ
mongosh
```

#### Linux (Ubuntu/Debian)

```bash
# Import MongoDB public GPG Key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Create list file
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update package database
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# ตรวจสอบ
sudo systemctl status mongod
mongosh
```

### Step 3: Clone Repository

```bash
# Clone จาก GitHub
git clone https://github.com/yourusername/cafe-pos-system.git

# เข้าไปใน folder
cd cafe-pos-system
```

### Step 4: ติดตั้ง Dependencies

#### Server

```bash
cd server
npm install
```

Dependencies ที่จะติดตั้ง:
- express
- mongoose
- socket.io
- jsonwebtoken
- bcrypt
- multer
- cors
- dotenv
- และอื่นๆ

#### Client

```bash
cd ../client
npm install
```

Dependencies ที่จะติดตั้ง:
- react
- react-dom
- react-router-dom
- socket.io-client
- axios
- zustand
- tailwindcss
- และอื่นๆ

### Step 5: ตั้งค่า Environment Variables

#### Server Environment (.env)

สร้างไฟล์ `.env` ใน folder `server`:

```bash
cd server
touch .env  # macOS/Linux
# หรือสร้างไฟล์ด้วย text editor
```

เพิ่มเนื้อหา:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/cafe-pos

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-make-it-very-long-and-random
JWT_EXPIRES_IN=7d

# CORS Configuration
CLIENT_URL=http://localhost:5173
```

**⚠️ สำคัญ:** เปลี่ยน `JWT_SECRET` เป็นค่าที่ปลอดภัยในการใช้งานจริง!

#### Client Environment (.env)

สร้างไฟล์ `.env` ใน folder `client`:

```bash
cd ../client
touch .env  # macOS/Linux
```

เพิ่มเนื้อหา:

```env
VITE_API_URL=http://localhost:3000
```

### Step 6: Seed Database

```bash
cd server
npm run seed
```

คำสั่งนี้จะสร้าง:

#### ผู้ใช้งาน (Users)
- **admin** / admin123 (Manager)
- **cashier1** / cashier123 (Cashier)
- **barista1** / barista123 (Barista)

#### หมวดหมู่ (Categories)
- กาแฟ (Coffee)
- ชา (Tea)
- เครื่องดื่มเย็น (Cold Drinks)
- ขนม (Desserts)

#### สินค้า (Products)
- กาแฟลาเต้, คาปูชิโน่, เอสเพรสโซ่
- ชาเขียว, ชาไทย
- น้ำส้ม, น้ำแอปเปิ้ล
- เค้กช็อกโกแลต, คุกกี้

#### ตัวเลือกสินค้า (Product Options)
- ขนาด (Size): เล็ก, กลาง, ใหญ่
- ความหวาน (Sweetness): 0%, 25%, 50%, 75%, 100%
- ท็อปปิ้ง (Toppings): วิปครีม, ไข่มุก, เยลลี่

#### การตั้งค่า (Settings)
- ชื่อร้าน: My Café
- อัตราภาษี: 7%
- PromptPay ID: (ต้องตั้งค่าเอง)

### Step 7: รันระบบ

#### Development Mode (แนะนำสำหรับพัฒนา)

เปิด 2 Terminal:

**Terminal 1 - Server:**
```bash
cd server
npm run dev
```

คุณจะเห็น:
```
Server running on port 3000
MongoDB connected successfully
Socket.IO server initialized
```

**Terminal 2 - Client:**
```bash
cd client
npm run dev
```

คุณจะเห็น:
```
VITE v5.0.8  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

#### Production Mode

```bash
# Build Client
cd client
npm run build

# Run Server (จะ serve client ที่ build แล้ว)
cd ../server
npm start
```

### Step 8: เข้าสู่ระบบ

1. เปิด browser ไปที่ http://localhost:5173
2. Login ด้วย:
   - Username: **admin**
   - Password: **admin123**
3. เริ่มใช้งาน!

## ✅ ตรวจสอบการติดตั้ง

### ตรวจสอบ Server

```bash
# ตรวจสอบว่า server ทำงาน
curl http://localhost:3000/api/health

# ควรได้ response:
# {"status":"ok","message":"Server is running"}
```

### ตรวจสอบ MongoDB

```bash
# เข้า MongoDB shell
mongosh

# ตรวจสอบ database
use cafe-pos
show collections

# ควรเห็น collections:
# - users
# - products
# - categories
# - orders
# - settings
# - productoptions
```

### ตรวจสอบ Client

1. เปิด http://localhost:5173
2. เปิด DevTools (F12)
3. ตรวจสอบ Console ไม่มี error
4. ตรวจสอบ Network tab เห็น API calls

## 🐛 แก้ปัญหาที่พบบ่อย

### ปัญหา: MongoDB Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**วิธีแก้:**
```bash
# ตรวจสอบว่า MongoDB ทำงานหรือไม่
# Windows
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### ปัญหา: Port Already in Use

```
Error: listen EADDRINUSE: address already in use :::3000
```

**วิธีแก้:**
```bash
# หา process ที่ใช้ port 3000
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9

# หรือเปลี่ยน PORT ใน .env
PORT=3001
```

### ปัญหา: npm install ล้มเหลว

```
npm ERR! code EACCES
```

**วิธีแก้:**
```bash
# ลบ node_modules และ package-lock.json
rm -rf node_modules package-lock.json

# ติดตั้งใหม่
npm install

# หรือใช้ --legacy-peer-deps
npm install --legacy-peer-deps
```

### ปัญหา: Cannot find module

```
Error: Cannot find module 'express'
```

**วิธีแก้:**
```bash
# ติดตั้ง dependencies ใหม่
cd server
npm install

cd ../client
npm install
```

### ปัญหา: CORS Error

```
Access to XMLHttpRequest blocked by CORS policy
```

**วิธีแก้:**
1. ตรวจสอบ `CLIENT_URL` ใน server `.env`
2. ตรวจสอบ `VITE_API_URL` ใน client `.env`
3. Restart server

### ปัญหา: Socket.IO Connection Failed

```
WebSocket connection failed
```

**วิธีแก้:**
1. ตรวจสอบว่า server ทำงาน
2. ตรวจสอบ `VITE_API_URL` ถูกต้อง
3. Clear browser cache
4. Hard reload (Ctrl+Shift+R)

## 🔄 การอัปเดตระบบ

```bash
# Pull latest code
git pull origin main

# Update server dependencies
cd server
npm install

# Update client dependencies
cd ../client
npm install

# Rebuild client
npm run build

# Restart server
cd ../server
npm run dev
```

## 🗑️ การถอนการติดตั้ง

```bash
# ลบ project folder
cd ..
rm -rf cafe-pos-system

# ลบ MongoDB database (ถ้าต้องการ)
mongosh
use cafe-pos
db.dropDatabase()
exit

# ถอนการติดตั้ง MongoDB (ถ้าต้องการ)
# Windows: ใช้ Control Panel → Programs
# macOS: brew uninstall mongodb-community
# Linux: sudo apt-get remove mongodb-org
```

## 📞 ขอความช่วยเหลือ

หากพบปัญหาในการติดตั้ง:

1. ตรวจสอบ [Troubleshooting](#-แกปญหาทพบบอย) ด้านบน
2. เปิด Issue บน GitHub
3. ติดต่อผู้พัฒนา

## 🎉 เสร็จสิ้น!

ตอนนี้คุณพร้อมใช้งานระบบ POS แล้ว!

ขั้นตอนถัดไป:
1. เปลี่ยนรหัสผ่าน admin
2. ตั้งค่าข้อมูลร้าน (Settings)
3. เพิ่มสินค้าของคุณเอง
4. เริ่มขาย! ☕

---

Made with ❤️ for coffee lovers
