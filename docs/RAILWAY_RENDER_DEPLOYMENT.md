# 🚀 Railway & Render Deployment Guide

คู่มือ Deploy Cafe POS System ไปยัง Railway และ Render

## 📋 เตรียมความพร้อม

### 1. MongoDB Atlas (Database)

1. สร้างบัญชีที่ https://www.mongodb.com/cloud/atlas/register
2. สร้าง Cluster ฟรี
3. ตั้งค่า Database Access:
   - Username: `cafepos`
   - Password: สร้าง password ที่แข็งแรง
4. ตั้งค่า Network Access:
   - เพิ่ม IP: `0.0.0.0/0` (Allow from anywhere)
5. คัดลอก Connection String:
   ```
   mongodb+srv://cafepos:<password>@cluster0.xxxxx.mongodb.net/cafe-pos?retryWrites=true&w=majority
   ```

### 2. Push Code to GitHub

```bash
git add .
git commit -m "Prepare for Railway and Render deployment"
git push origin main
```

---

## 🚂 Deploy to Railway

### Step 1: สร้างโปรเจค

1. ไปที่ https://railway.app/
2. Sign in with GitHub
3. คลิก "New Project"
4. เลือก "Deploy from GitHub repo"
5. เลือก repository: `POS-Cafe-System`

### Step 2: ตั้งค่า Environment Variables

ไปที่ Variables tab และเพิ่ม:

```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://cafepos:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/cafe-pos?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-make-it-very-long-and-random-at-least-32-characters
JWT_EXPIRES_IN=7d
CLIENT_URL=${{RAILWAY_PUBLIC_DOMAIN}}
```

**หมายเหตุ:** `${{RAILWAY_PUBLIC_DOMAIN}}` จะถูกแทนที่อัตโนมัติด้วย domain ของคุณ

### Step 3: Generate Domain

1. ไปที่ Settings tab
2. คลิก "Generate Domain"
3. คัดลอก domain (เช่น `cafe-pos-system.up.railway.app`)

### Step 4: Deploy

Railway จะ deploy อัตโนมัติ!

- ดูสถานะที่ Deployments tab
- ดู logs ที่ View Logs
- เมื่อเสร็จจะเห็น "Build successful"

### Step 5: Seed Database (ครั้งแรก)

เปิด Railway Shell:

```bash
cd server
npm run seed
```

หรือใช้ Railway CLI:

```bash
railway run npm run seed --prefix server
```

### Step 6: เข้าใช้งาน

เปิด browser ไปที่: `https://your-app.up.railway.app`

Login:
- Username: `admin`
- Password: `admin123`

---

## 🎨 Deploy to Render

### Step 1: สร้าง Web Service

1. ไปที่ https://render.com/
2. Sign in with GitHub
3. คลิก "New +" → "Web Service"
4. เลือก repository: `POS-Cafe-System`

### Step 2: ตั้งค่า Service

**Basic Settings:**
- Name: `cafe-pos-system`
- Region: `Singapore` (ใกล้ไทยที่สุด)
- Branch: `main`
- Root Directory: (ว่างไว้)
- Runtime: `Node`
- Build Command: 
  ```bash
  npm install --prefix client && npm run build --prefix client && npm install --prefix server --omit=dev
  ```
- Start Command:
  ```bash
  npm start --prefix server
  ```

**Instance Type:**
- Free (หรือเลือกตามต้องการ)

### Step 3: ตั้งค่า Environment Variables

คลิก "Advanced" และเพิ่ม:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `3000` |
| `MONGODB_URI` | `mongodb+srv://cafepos:YOUR_PASSWORD@...` |
| `JWT_SECRET` | `your-super-secret-jwt-key-32-chars-min` |
| `JWT_EXPIRES_IN` | `7d` |
| `CLIENT_URL` | (จะได้หลัง deploy - ใส่ทีหลัง) |

### Step 4: Create Web Service

คลิก "Create Web Service"

Render จะเริ่ม build และ deploy อัตโนมัติ

### Step 5: อัปเดต CLIENT_URL

1. หลัง deploy เสร็จ คัดลอก URL (เช่น `https://cafe-pos-system.onrender.com`)
2. ไปที่ Environment
3. แก้ไข `CLIENT_URL` เป็น URL ที่ได้
4. Save Changes (จะ redeploy อัตโนมัติ)

### Step 6: Seed Database

ใช้ Render Shell:

1. ไปที่ Shell tab
2. รันคำสั่ง:
```bash
cd server
npm run seed
```

### Step 7: เข้าใช้งาน

เปิด browser ไปที่: `https://cafe-pos-system.onrender.com`

Login:
- Username: `admin`
- Password: `admin123`

---

## 🔧 Configuration Files

โปรเจคมีไฟล์ config สำหรับ deployment:

### Railway
- `railway.json` - Railway configuration
- `nixpacks.toml` - Nixpacks build configuration

### Render
- `render.yaml` - Render Blueprint
- `Procfile` - Process file

### Both
- `server/package.json` - มี start script สำหรับ production

---

## 📊 เปรียบเทียบ Railway vs Render

| Feature | Railway | Render |
|---------|---------|--------|
| **Free Tier** | $5 credit/month | 750 hours/month |
| **Build Time** | เร็วกว่า | ช้ากว่า |
| **Cold Start** | เร็ว | ช้า (free tier) |
| **Region** | US, EU | Singapore, US, EU |
| **Database** | ต้องใช้ MongoDB Atlas | ต้องใช้ MongoDB Atlas |
| **Custom Domain** | ✅ Free | ✅ Free |
| **SSL** | ✅ Auto | ✅ Auto |
| **Logs** | ✅ Real-time | ✅ Real-time |
| **Shell Access** | ✅ | ✅ |

### แนะนำ:
- **Railway** - ถ้าต้องการความเร็วและ cold start ที่ดี
- **Render** - ถ้าต้องการ free tier ที่ใช้ได้นานกว่า

---

## 🐛 Troubleshooting

### ปัญหา: Build Failed

**Railway:**
```bash
# ดู build logs
railway logs

# ลอง build ใหม่
railway up
```

**Render:**
- ดู logs ใน Dashboard
- ตรวจสอบ Build Command ถูกต้อง
- ตรวจสอบ Node version

### ปัญหา: MongoDB Connection Error

```
MongooseError: connect ECONNREFUSED
```

**วิธีแก้:**
1. ตรวจสอบ `MONGODB_URI` ถูกต้อง
2. ตรวจสอบ password ไม่มีอักขระพิเศษ (ถ้ามีต้อง encode)
3. ตรวจสอบ Network Access ใน MongoDB Atlas เปิด `0.0.0.0/0`
4. ตรวจสอบ Database User มีสิทธิ์ read/write

### ปัญหา: Application Error

```
Application failed to respond
```

**วิธีแก้:**
1. ตรวจสอบ `PORT` environment variable
2. ตรวจสอบ server start command
3. ดู logs หา error
4. ตรวจสอบ `NODE_ENV=production`

### ปัญหา: Static Files Not Found

```
Cannot GET /
```

**วิธีแก้:**
1. ตรวจสอบ client build สำเร็จ
2. ตรวจสอบ `client/dist` folder มีไฟล์
3. ตรวจสอบ server serve static files จาก `../client/dist`

### ปัญหา: Socket.IO Connection Failed

```
WebSocket connection failed
```

**วิธีแก้:**
1. ตรวจสอบ `CLIENT_URL` ตั้งค่าถูกต้อง
2. ตรวจสอบ CORS configuration
3. ตรวจสอบ WebSocket support (Railway และ Render รองรับ)

---

## 🔄 การอัปเดต

### Railway

```bash
# Push to GitHub
git push origin main

# Railway จะ auto-deploy
```

หรือใช้ Railway CLI:

```bash
railway up
```

### Render

```bash
# Push to GitHub
git push origin main

# Render จะ auto-deploy
```

หรือ Manual Deploy:
1. ไปที่ Dashboard
2. คลิก "Manual Deploy"
3. เลือก branch `main`

---

## 📝 Environment Variables Checklist

ก่อน deploy ตรวจสอบ:

- [ ] `NODE_ENV=production`
- [ ] `PORT=3000`
- [ ] `MONGODB_URI` (จาก MongoDB Atlas)
- [ ] `JWT_SECRET` (อย่างน้อย 32 ตัวอักษร)
- [ ] `JWT_EXPIRES_IN=7d`
- [ ] `CLIENT_URL` (domain ของคุณ)

---

## 🎉 เสร็จสิ้น!

แอพของคุณพร้อมใช้งานแล้ว!

**Next Steps:**
1. เปลี่ยนรหัสผ่าน admin
2. ตั้งค่าข้อมูลร้าน
3. เพิ่มสินค้า
4. เริ่มขาย! ☕

---

## 📞 Support

หากมีปัญหา:
- Railway: https://railway.app/help
- Render: https://render.com/docs
- MongoDB Atlas: https://www.mongodb.com/docs/atlas/

---

Made with ❤️ for coffee lovers ☕
