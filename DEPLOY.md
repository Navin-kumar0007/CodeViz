# Deploying CodeViz

CodeViz executes user code in **Docker sandbox containers**, so the backend needs
a **Docker-capable host** (a real VM). Serverless/PaaS that block spawning
containers (most Vercel/Netlify/Render/Railway free tiers) **will not run code
execution.**

Two supported paths:

- **A. Host deploy (recommended)** — backend runs directly on the VM and uses the
  host Docker daemon for sandboxes. Simplest and most reliable.
- **B. All-in-containers** — `docker-compose.yml` (see the bottom). Works, but the
  sandbox needs the Docker socket + a matched run-dir path.

---

## A. Host deploy (recommended)

### 1. Provision a VM
Ubuntu 22.04, **2 vCPU / 4 GB RAM minimum** (code execution is memory-hungry).
DigitalOcean / Hetzner / EC2. Point your domain's DNS `A` record at the VM IP.

### 2. Install dependencies
```bash
# Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER   # re-login after this

# Node 20 + nginx + mongo tools + certbot
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs nginx certbot python3-certbot-nginx mongodb-database-tools
```

### 3. MongoDB Atlas
Create a free cluster at mongodb.com/atlas → a DB user → allow the VM's IP →
copy the `mongodb+srv://…` connection string (you'll put it in `.env`).

### 4. Clone + configure
```bash
sudo mkdir -p /opt/codeviz && sudo chown $USER /opt/codeviz
git clone <your-repo> /opt/codeviz && cd /opt/codeviz

cp backend/.env.example backend/.env
nano backend/.env          # fill MONGO_URI, JWT_SECRET (openssl rand -hex 32),
                           # FRONTEND_URL=https://yourdomain.com, AI keys, etc.

cd backend && npm ci --omit=dev && cd ..
```

### 5. Build the sandbox runner image (required for code execution)
```bash
docker build -t codeviz-runner:latest -f backend/runners/Dockerfile.runner backend/runners
docker images | grep codeviz-runner   # confirm it built
```

### 6. Build the frontend
```bash
cd frontend
npm ci
VITE_API_URL=https://yourdomain.com npm run build
sudo mkdir -p /var/www/codeviz && sudo cp -r dist/* /var/www/codeviz/
cd ..
```

### 7. Run the backend (systemd)
```bash
# create a service user in the docker group
sudo useradd -r -G docker -s /usr/sbin/nologin codeviz || true
sudo chown -R codeviz:docker /opt/codeviz

sudo cp deploy/codeviz.service /etc/systemd/system/
# edit paths/user in the unit if different, then:
sudo systemctl daemon-reload && sudo systemctl enable --now codeviz
sudo systemctl status codeviz          # should be active
journalctl -u codeviz -f               # watch logs
```

### 8. nginx
```bash
sudo cp deploy/nginx.conf /etc/nginx/sites-available/codeviz
sudo sed -i 's/YOURDOMAIN.com/yourdomain.com/g' /etc/nginx/sites-available/codeviz
sudo ln -s /etc/nginx/sites-available/codeviz /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

### 9. HTTPS
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 10. Seed content + create your admin
```bash
cd /opt/codeviz/backend
node seeds/seedCourses.js            # 42 courses / 136 lessons
node seeds/seedQuizzes.js            # if present
node seeds/seedEditorials.js         # problem editorials (AI, slow)
node seeds/seedVisuals.js            # lesson animations (AI, slow)
# create an admin:
node -e "require('dotenv').config();const m=require('mongoose');const U=require('./models/User');(async()=>{await m.connect(process.env.MONGO_URI);await U.create({name:'Admin',email:'you@example.com',password:'CHANGE_ME_8+',role:'admin'});console.log('admin created');await m.disconnect()})()"
```

### 11. Backups (A4)
```bash
chmod +x /opt/codeviz/deploy/backup.sh
crontab -e
# add:
0 3 * * *  /opt/codeviz/deploy/backup.sh >> /var/log/codeviz-backup.log 2>&1
```

### Verify
- `https://yourdomain.com` loads the app
- Sign up / log in works
- **Run code** in the Practice IDE → you get output + a visualization (proves the sandbox works)
- `journalctl -u codeviz` shows no errors

---

## B. All-in-containers (docker-compose)

```bash
# once, on the host:
docker build -t codeviz-runner:latest -f backend/runners/Dockerfile.runner backend/runners
sudo mkdir -p /opt/codeviz/runs
cp backend/.env.example backend/.env   # fill it in (BIND_HOST + EXEC_DIR are set by compose)
export PUBLIC_URL=https://yourdomain.com

docker compose up -d --build
```
`web` (nginx) serves the SPA on :80 and proxies `/api`, `/run`, `/trace`,
`/socket.io` to `backend`. Add HTTPS with a reverse proxy (Caddy) or certbot on
the host in front of :80.

> The backend container mounts the host Docker socket and `/opt/codeviz/runs` at
> the same path so sandbox containers (spawned on the host daemon) can mount each
> run's code. Don't change `EXEC_DIR` without changing the bind mount to match.

---

## Environment reference
See `backend/.env.example`. In production the server **refuses to boot** unless
`JWT_SECRET` (long/random), `MONGO_URI`, and `FRONTEND_URL` are set.

## Updating a deployment
```bash
cd /opt/codeviz && git pull
cd frontend && npm ci && VITE_API_URL=https://yourdomain.com npm run build && sudo cp -r dist/* /var/www/codeviz/ && cd ..
cd backend && npm ci --omit=dev && cd ..
sudo systemctl restart codeviz
# rebuild the runner image only if backend/runners/ changed
```
