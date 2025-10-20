# 🚀 Deployment Checklist

## Pre-Deployment

### Code Preparation
- [ ] All features tested and working
- [ ] No console errors in browser
- [ ] No server errors in logs
- [ ] Code reviewed and cleaned
- [ ] Test files removed
- [ ] Comments added where needed
- [ ] README.md updated
- [ ] CHANGELOG.md updated

### Environment Configuration
- [ ] Production `.env` files created
- [ ] `JWT_SECRET` changed to secure random string
- [ ] `NODE_ENV` set to `production`
- [ ] MongoDB URI configured for production
- [ ] CORS `CLIENT_URL` set to production domain
- [ ] API URL configured in client

### Database
- [ ] MongoDB accessible from production server
- [ ] Database seeded with initial data
- [ ] Indexes created for performance
- [ ] Backup strategy in place

### Security
- [ ] JWT secret is strong and unique
- [ ] Passwords are hashed
- [ ] CORS properly configured
- [ ] Input validation in place
- [ ] File upload restrictions set
- [ ] Rate limiting configured (optional)

## Build Process

### Client Build
```bash
cd client
npm install
npm run build
# Verify dist/ folder created
```

### Server Setup
```bash
cd server
npm install --production
# Verify node_modules/ created
```

## Deployment Steps

### 1. Server Setup

#### Option A: VPS (DigitalOcean, Linode, etc.)

```bash
# SSH into server
ssh user@your-server-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
# Follow MongoDB installation guide for your OS

# Install PM2 (Process Manager)
sudo npm install -g pm2

# Clone repository
git clone https://github.com/yourusername/cafe-pos-system.git
cd cafe-pos-system

# Setup environment
cp server/.env.example server/.env
nano server/.env  # Edit with production values

# Install dependencies and build
./deploy.sh

# Start with PM2
cd server
pm2 start npm --name "cafe-pos" -- start
pm2 save
pm2 startup
```

#### Option B: Heroku

```bash
# Install Heroku CLI
# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Add MongoDB addon
heroku addons:create mongolab:sandbox

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret-key
heroku config:set CLIENT_URL=https://your-app-name.herokuapp.com

# Deploy
git push heroku main

# Run seed (if needed)
heroku run npm run seed
```

#### Option C: Docker

```bash
# Build and run with Docker Compose
docker-compose up -d

# Check logs
docker-compose logs -f
```

### 2. Domain & SSL

- [ ] Domain name configured
- [ ] DNS records set up
- [ ] SSL certificate installed (Let's Encrypt recommended)
- [ ] HTTPS enforced
- [ ] Redirect HTTP to HTTPS

### 3. Nginx Configuration (if using VPS)

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Serve static files
    location / {
        root /path/to/cafe-pos-system/client/dist;
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Proxy Socket.IO
    location /socket.io {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Post-Deployment

### Verification
- [ ] Website accessible via domain
- [ ] HTTPS working
- [ ] Login functionality works
- [ ] POS page loads correctly
- [ ] Barista page receives real-time updates
- [ ] Dashboard displays data
- [ ] File uploads work
- [ ] Receipt printing works
- [ ] Theme switching works
- [ ] All API endpoints respond correctly

### Monitoring
- [ ] Server monitoring set up (PM2, New Relic, etc.)
- [ ] Error logging configured
- [ ] Uptime monitoring (UptimeRobot, Pingdom)
- [ ] Database backups scheduled
- [ ] SSL certificate renewal automated

### Performance
- [ ] Page load times acceptable
- [ ] API response times good
- [ ] Database queries optimized
- [ ] Images optimized
- [ ] Caching configured (if needed)

### Security
- [ ] Firewall configured
- [ ] Only necessary ports open (80, 443, 22)
- [ ] SSH key authentication enabled
- [ ] Root login disabled
- [ ] Regular security updates scheduled

## Maintenance

### Regular Tasks
- [ ] Monitor server resources
- [ ] Check error logs
- [ ] Review database size
- [ ] Update dependencies
- [ ] Backup database
- [ ] Test backup restoration
- [ ] Review security advisories

### Updates
```bash
# Pull latest code
git pull origin main

# Install dependencies
cd server && npm install
cd ../client && npm install

# Build client
cd client && npm run build

# Restart server
pm2 restart cafe-pos
```

## Rollback Plan

If deployment fails:

```bash
# Revert to previous version
git revert HEAD
git push origin main

# Or checkout previous commit
git checkout <previous-commit-hash>

# Rebuild and restart
./deploy.sh
pm2 restart cafe-pos
```

## Emergency Contacts

- **Server Provider:** [Contact info]
- **Domain Registrar:** [Contact info]
- **Database Provider:** [Contact info]
- **Developer:** [Contact info]

## Useful Commands

### PM2
```bash
pm2 list                 # List all processes
pm2 logs cafe-pos        # View logs
pm2 restart cafe-pos     # Restart app
pm2 stop cafe-pos        # Stop app
pm2 delete cafe-pos      # Delete app
pm2 monit                # Monitor resources
```

### MongoDB
```bash
mongosh                  # Connect to MongoDB
use cafe-pos             # Switch to database
db.stats()               # Database statistics
db.orders.count()        # Count orders
```

### Nginx
```bash
sudo nginx -t            # Test configuration
sudo systemctl restart nginx  # Restart Nginx
sudo systemctl status nginx   # Check status
```

### System
```bash
df -h                    # Disk usage
free -m                  # Memory usage
top                      # Process monitor
htop                     # Better process monitor
```

## Success Criteria

Deployment is successful when:
- ✅ Application accessible via HTTPS
- ✅ All features working correctly
- ✅ No errors in logs
- ✅ Real-time updates functioning
- ✅ Database connected and responsive
- ✅ File uploads working
- ✅ Performance acceptable
- ✅ Security measures in place
- ✅ Monitoring active
- ✅ Backups configured

---

## Notes

- Always test in staging environment first
- Keep backups before major updates
- Document any custom configurations
- Monitor closely for first 24-48 hours after deployment

---

Made with ❤️ for coffee lovers ☕
