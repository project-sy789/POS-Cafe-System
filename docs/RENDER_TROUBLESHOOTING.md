# 🔧 Render Deployment Troubleshooting

## ปัญหาที่แก้ไขแล้ว ✅

### ❌ Error: vite: not found

**สาเหตุ:**
```bash
sh: 1: vite: not found
==> Build failed 😞
```

Render ใช้ `npm install --production` ซึ่งไม่ติดตั้ง devDependencies (vite อยู่ใน devDependencies)

**วิธีแก้:**
เปลี่ยนจาก:
```bash
cd client && npm install && npm run build && cd ../server && npm install --production
```

เป็น:
```bash
npm install --prefix client && npm run build --prefix client && npm install --prefix server --omit=dev
```

**อธิบาย:**
- `npm install --prefix client` - ติดตั้ง dependencies ทั้งหมด (รวม devDependencies) สำหรับ client
- `npm run build --prefix client` - build client ด้วย vite
- `npm install --prefix server --omit=dev` - ติดตั้งเฉพาะ production dependencies สำหรับ server

---

## 🚀 Build Commands ที่ถูกต้อง

### Render

**Build Command:**
```bash
npm install --prefix client && npm run build --prefix client && npm install --prefix server --omit=dev
```

**Start Command:**
```bash
npm start --prefix server
```

### Railway

ใช้ config ใน `railway.json`:
```json
{
  "build": {
    "buildCommand": "npm install --prefix client && npm run build --prefix client && npm install --prefix server --omit=dev"
  },
  "deploy": {
    "startCommand": "npm start --prefix server"
  }
}
```

---

## 📝 Render Dashboard Settings

1. ไปที่ Render Dashboard
2. เลือก Web Service ของคุณ
3. ไปที่ Settings
4. อัปเดต:

**Build Command:**
```
cd client && npm ci && npm run build && cd ../server && npm ci --omit=dev
```

**Start Command:**
```
cd server && npm start
```

**หมายเหตุ:** 
- ใช้ `npm ci` แทน `npm install` เพื่อติดตั้งตาม package-lock.json แบบแม่นยำ
- `npm ci` จะติดตั้ง devDependencies โดยอัตโนมัติ (จำเป็นสำหรับ vite)
- สำหรับ server ใช้ `--omit=dev` เพื่อไม่ติดตั้ง devDependencies

5. Save Changes
6. Manual Deploy → Deploy latest commit

---

## ✅ ตรวจสอบว่า Deploy สำเร็จ

### 1. ดู Build Logs

ควรเห็น:
```
==> Running build command...
added 158 packages (client)
✓ built in XXXms (client build)
added XX packages (server)
==> Build successful ✓
```

### 2. ดู Deploy Logs

ควรเห็น:
```
Server running on port 3000
MongoDB connected successfully
Socket.IO server initialized
```

### 3. ทดสอบ URL

เปิด browser ไปที่:
```
https://your-app.onrender.com
```

ควรเห็นหน้า Login

---

## 🐛 ปัญหาอื่นๆ ที่อาจพบ

### ปัญหา: MongoDB Connection Error

```
MongooseError: connect ECONNREFUSED
```

**วิธีแก้:**
1. ตรวจสอบ `MONGODB_URI` ใน Environment Variables
2. ตรวจสอบ MongoDB Atlas Network Access: `0.0.0.0/0`
3. ตรวจสอบ Database User มีสิทธิ์

### ปัญหา: Application Error

```
Application failed to respond
```

**วิธีแก้:**
1. ตรวจสอบ Environment Variables:
   - `NODE_ENV=production`
   - `PORT=3000`
   - `JWT_SECRET` (อย่างน้อย 32 ตัวอักษร)
2. ดู logs หา error
3. ตรวจสอบ `CLIENT_URL` ตั้งค่าถูกต้อง

### ปัญหา: Static Files Not Found

```
Cannot GET /
```

**วิธีแก้:**
1. ตรวจสอบ client build สำเร็จ
2. ตรวจสอบ `client/dist` folder มีไฟล์
3. ตรวจสอบ server.js serve static files:
```javascript
app.use(express.static(path.join(__dirname, '../client/dist')))
```

---

## 🔄 Manual Redeploy

ถ้า auto-deploy ไม่ทำงาน:

1. ไปที่ Render Dashboard
2. เลือก Web Service
3. คลิก "Manual Deploy"
4. เลือก "Deploy latest commit"
5. รอ build เสร็จ

---

## 📊 Environment Variables

ตรวจสอบว่ามีครบ:

```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key-32-chars-minimum
JWT_EXPIRES_IN=7d
CLIENT_URL=https://your-app.onrender.com
```

---

## ✅ Checklist

ก่อน deploy:
- [ ] Push code ล่าสุดไป GitHub
- [ ] Build command ถูกต้อง
- [ ] Start command ถูกต้อง
- [ ] Environment variables ครบ
- [ ] MongoDB Atlas พร้อมใช้งาน

หลัง deploy:
- [ ] Build successful
- [ ] Deploy successful
- [ ] URL เปิดได้
- [ ] Login ทำงาน
- [ ] Database เชื่อมต่อได้

---

## 🎉 Deploy สำเร็จ!

ถ้าทุกอย่างเรียบร้อย คุณจะเห็น:

1. ✅ Build successful
2. ✅ Deploy live
3. ✅ URL เปิดได้
4. ✅ Login page แสดง
5. ✅ Login ได้ด้วย admin/admin123

**Next Steps:**
1. Seed database (ถ้ายังไม่ได้ทำ)
2. เปลี่ยนรหัสผ่าน admin
3. ตั้งค่าข้อมูลร้าน
4. เริ่มใช้งาน! ☕

---

Made with ❤️ for coffee lovers
