# Deployment Guide - Investme MVP

## Production Deployment

### Prerequisites
- Node.js 18+ LTS
- PostgreSQL 14+ with SSL support
- SSL certificate for HTTPS
- Domain name configured
- Environment with at least 2GB RAM

### Environment Variables
Create a `.env.production` file with the following variables:

```env
# Database
DATABASE_URL=postgresql://username:password@host:5432/investme_prod?sslmode=require
PGHOST=your-postgres-host
PGPORT=5432
PGUSER=your-postgres-user
PGPASSWORD=your-postgres-password
PGDATABASE=investme_prod

# Security
JWT_SECRET=your-super-secure-jwt-secret-key-min-32-chars
NODE_ENV=production

# Application
PORT=5000
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=/app/uploads

# Email (optional)
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
```

### Database Setup

1. **Create Production Database:**
```sql
CREATE DATABASE investme_prod;
CREATE USER investme_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE investme_prod TO investme_user;
```

2. **Apply Schema:**
```bash
npm run db:push
```

3. **Create Admin User:**
```sql
INSERT INTO admin_users (email, senha, nome, perfil) 
VALUES ('admin@yourdomain.com', '$2b$10$hashed_password', 'Administrator', 'admin');
```

### Application Deployment

#### Using PM2 (Recommended)

1. **Install PM2:**
```bash
npm install -g pm2
```

2. **Create PM2 Configuration:**
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'investme-mvp',
    script: 'server/index.ts',
    interpreter: 'node',
    interpreter_args: '--loader tsx',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}
```

3. **Start Application:**
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### Using Docker

1. **Create Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]
```

2. **Create docker-compose.yml:**
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - postgres
    restart: unless-stopped

  postgres:
    image: postgres:14-alpine
    environment:
      - POSTGRES_DB=investme_prod
      - POSTGRES_USER=${PGUSER}
      - POSTGRES_PASSWORD=${PGPASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

3. **Deploy with Docker:**
```bash
docker-compose up -d
```

### Reverse Proxy (Nginx)

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";

    # File upload limit
    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static file serving
    location /uploads/ {
        alias /app/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### SSL Certificate Setup

Using Let's Encrypt with Certbot:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
sudo certbot renew --dry-run
```

### Monitoring and Logging

#### Application Monitoring
```bash
# PM2 monitoring
pm2 monit

# View logs
pm2 logs investme-mvp

# Restart application
pm2 restart investme-mvp
```

#### Database Monitoring
```sql
-- Check active connections
SELECT count(*) FROM pg_stat_activity;

-- Monitor query performance
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```

#### Log Rotation
```bash
# /etc/logrotate.d/investme
/app/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 node node
    postrotate
        pm2 reloadLogs
    endscript
}
```

### Backup Strategy

#### Automated Database Backup
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="investme_prod"

pg_dump $DATABASE_URL > $BACKUP_DIR/investme_$DATE.sql
gzip $BACKUP_DIR/investme_$DATE.sql

# Keep only last 30 days
find $BACKUP_DIR -name "investme_*.sql.gz" -mtime +30 -delete
```

#### File Backup
```bash
# Backup uploads directory
rsync -av /app/uploads/ /backups/uploads/
```

### Security Hardening

#### Server Security
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Configure firewall
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable

# Disable root login
sudo sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sudo systemctl restart ssh
```

#### Application Security
- Use environment variables for all sensitive data
- Implement rate limiting (already configured)
- Regular security updates
- SQL injection protection (Drizzle ORM)
- XSS protection headers
- CSRF protection for forms

### Performance Optimization

#### Database Optimization
```sql
-- Create performance indexes
CREATE INDEX CONCURRENTLY idx_companies_user_status ON companies(userId, status);
CREATE INDEX CONCURRENTLY idx_credit_requests_status_created ON credit_requests(status, createdAt);
CREATE INDEX CONCURRENTLY idx_valuations_company_created ON valuations(companyId, createdAt DESC);

-- Update statistics
ANALYZE;
```

#### Application Optimization
- Enable gzip compression in Nginx
- Use CDN for static assets
- Implement Redis for session storage (optional)
- Database connection pooling (configured)

### Health Checks

#### Application Health Endpoint
```javascript
// Add to routes.ts
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version
  });
});
```

#### Database Health Check
```javascript
app.get('/health/db', async (req, res) => {
  try {
    await db.select().from(users).limit(1);
    res.json({ status: 'healthy' });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', error: error.message });
  }
});
```

### Deployment Checklist

- [ ] Environment variables configured
- [ ] Database created and migrated
- [ ] SSL certificate installed
- [ ] Reverse proxy configured
- [ ] Application deployed with PM2/Docker
- [ ] Monitoring setup
- [ ] Backup strategy implemented
- [ ] Security hardening completed
- [ ] Health checks functional
- [ ] Admin user created
- [ ] DNS configured
- [ ] Performance testing completed

### Rollback Procedure

1. **Stop current application:**
```bash
pm2 stop investme-mvp
```

2. **Restore previous version:**
```bash
git checkout previous-release-tag
npm ci
pm2 start investme-mvp
```

3. **Database rollback (if needed):**
```bash
psql $DATABASE_URL < backup_file.sql
```

### Maintenance Windows

Recommended maintenance schedule:
- **Daily**: Automated backups
- **Weekly**: Log rotation, security updates
- **Monthly**: Performance review, dependency updates
- **Quarterly**: Full security audit

### Support and Troubleshooting

For production issues, check:
1. Application logs: `pm2 logs`
2. System logs: `/var/log/syslog`
3. Nginx logs: `/var/log/nginx/`
4. Database logs: PostgreSQL logs
5. Disk space: `df -h`
6. Memory usage: `free -m`
7. Process status: `pm2 status`