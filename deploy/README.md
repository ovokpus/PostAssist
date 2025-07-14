# 🚀 Railway Deployment for PostAssist

This directory contains all the necessary files and scripts to deploy PostAssist to Railway with **managed Redis cache support**.

## 🎯 Deployment Summary

✅ **Complete Railway Setup** - Automated scripts for full deployment  
✅ **Managed Redis Cache** - Railway provides Redis as a managed service  
✅ **Production-Ready** - Health checks, auto-scaling, HTTPS  
✅ **Multiple Options** - Full automated, quick deploy, or manual steps  
✅ **Zero Redis Maintenance** - Railway handles all Redis operations

## 📁 Files Created for Railway Deployment

### 🔧 **Configuration Files**
- **`railway.toml`** - Railway deployment configuration (root directory)
- **`docker-compose.railway.yml`** - Railway-specific Docker Compose (excludes Redis)
- **`Dockerfile`** - Updated for Railway PORT environment variable
- **`api/config.py`** - Enhanced to handle Railway environment variables

### 📜 **Deployment Scripts**
```
deploy/
├── README.md                    # This comprehensive deployment guide
├── railway-deploy.sh           # Full automated deployment script
├── quick-deploy.sh             # Quick deployment for pre-configured setups
└── railway.env.template        # Environment variables reference
```

### ✅ **Key Railway Optimizations**
- **🔌 Dynamic Port Binding** - Uses Railway's `PORT` environment variable
- **🌍 Environment Detection** - Detects Railway vs local development
- **🗄️ Managed Redis Integration** - Automatic Redis service provisioning
- **💚 Health Check Endpoints** - Railway-compatible health monitoring
- **🔄 Auto-restart Policies** - Configured for production reliability
- **📊 Real-time Monitoring** - Built-in metrics and logging

## 📋 Prerequisites

Before deployment, ensure you have:
- [Railway CLI](https://docs.railway.app/develop/cli) installed
- Railway account
- OpenAI API key
- Tavily API key

## 🚀 Quick Start

### Option 1: Full Automated Deployment (CLI) - ✅ Creates Redis
```bash
# Run the full deployment script (includes Redis setup)
./deploy/railway-deploy.sh
```

### Option 2: Quick Deployment (CLI) - ✅ Creates Redis
```bash
# Run the quick deployment script (includes Redis setup)
./deploy/quick-deploy.sh
```

### Option 3: GitHub UI Deployment - ⚠️ Redis NOT Created
```bash
# 1. Connect GitHub repo in Railway UI (deploy branch)
# 2. Manually add Redis service in Railway dashboard
# 3. Set environment variables in Railway UI
```

### Option 4: Manual CLI Deployment - ⚠️ Manual Redis Setup
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Create new project
railway new

# Add Redis service (manual step)
railway add --service redis

# Set environment variables
railway variables set OPENAI_API_KEY="your-key"
railway variables set TAVILY_API_KEY="your-key"

# Deploy
railway up
```

## ⚠️ **Important: Redis Service Creation**

**🗄️ Redis is NOT automatically created** when deploying from GitHub UI. Here's what creates Redis automatically vs manually:

### ✅ **Automatic Redis Creation:**
- **📜 CLI Scripts** (`railway-deploy.sh`, `quick-deploy.sh`) - Include `railway add --service redis`
- **💻 Automated Deployment** - Scripts handle everything including Redis

### ❌ **Manual Redis Creation Required:**
- **🌐 GitHub UI Deployment** - Only creates your app service from repository
- **👨‍💻 Manual CLI Steps** - You must run `railway add --service redis` yourself

### 🎯 **Why the Difference?**
- **📁 Repository Scope**: GitHub repo only contains application code, not infrastructure services
- **🏗️ Railway.toml**: Defines your app service, but not database services  
- **🎛️ Service Separation**: Railway treats databases as separate managed services
- **💰 Cost Control**: Prevents accidental database creation without explicit approval

## 🛠️ Step-by-Step Deployment Guide

### 🎯 **Choose Your Deployment Method**

| Method | **🌐 GitHub UI** | **💻 CLI Scripts** | **👨‍💻 Manual CLI** |
|--------|------------------|-------------------|---------------------|
| **Ease** | 🟢 Easiest | 🟢 Automated | 🟡 Technical |
| **Redis Setup** | ⚠️ Manual (1-click) | ✅ Automatic | ⚠️ Manual |
| **Team-Friendly** | 🟢 Visual Dashboard | 🟡 Requires CLI | 🟡 Requires CLI |
| **Best For** | **First-time users** | **Developers** | **Advanced users** |

### 🌐 **Option A: GitHub UI Deployment (Recommended)**

#### 1. Connect GitHub Repository
1. **🌐 Go to [Railway.app](https://railway.app)** and login
2. **📂 Open your existing project** or click "New Project"
3. **🔗 Click "Deploy from GitHub repo"**
4. **📂 Select your "PostAssist" repository**
5. **🌿 Choose the "deploy" branch** (important!)
6. **🚀 Click "Deploy Now"**

#### 2. Add Redis Service (Manual)
1. **➕ In your project dashboard, click "New Service"**
2. **🗄️ Select "Database"**
3. **🔴 Choose "Redis"**
4. **✅ Click "Add Redis"**
5. **⏳ Wait for Redis to provision** (1-2 minutes)

#### 3. Set Environment Variables
1. **🎛️ Click on your PostAssist service** (not Redis)
2. **⚙️ Go to "Variables" tab**
3. **➕ Add these variables:**
   - `OPENAI_API_KEY` = "your-actual-openai-api-key"
   - `TAVILY_API_KEY` = "your-actual-tavily-api-key"
4. **💾 Railway will automatically redeploy** with new variables

#### 4. Generate Public URL
1. **🌐 In your PostAssist service, go to "Settings" tab**
2. **📡 Find "Networking" section**
3. **🔗 Click "Generate Domain"**
4. **✅ Your app is now live!**

### 💻 **Option B: CLI Deployment**

#### 1. Install Railway CLI
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login
```

#### 2. Create Railway Project
```bash
# Create new Railway project
railway new

# Link to existing project (if you have one)
railway link
```

#### 3. Add Redis Service (Managed by Railway)
```bash
# Add MANAGED Redis service to your Railway project
railway add --service redis

# This creates a MANAGED Redis instance (not containerized!)
# Railway automatically provides REDIS_URL environment variable
# Zero Redis maintenance required - Railway handles everything!
```

**🎯 Why Managed Redis is Superior:**
- ✅ **Zero maintenance** - Railway handles updates, patches, backups
- ✅ **Enterprise reliability** - High availability and monitoring built-in  
- ✅ **Auto-scaling** - Scales with your application demand
- ✅ **Security** - Enterprise-grade encryption and access control
- ✅ **Cost-effective** - Optimized infrastructure vs running your own container

#### 4. Set Environment Variables
```bash
# Set required environment variables
railway variables set OPENAI_API_KEY="your-openai-api-key"
railway variables set TAVILY_API_KEY="your-tavily-api-key"

# Optional: Set custom configuration
railway variables set OPENAI_MODEL="gpt-4o-mini"
railway variables set OPENAI_TEMPERATURE="0.7"
railway variables set DEBUG="false"
```

#### 5. Deploy the Application
```bash
# Deploy from current directory
railway up

# Or deploy with specific service
railway up --service postassist
```

## 🔧 Configuration Files

### `railway.toml`
Railway configuration file in the root directory that defines:
- Build settings (Dockerfile)
- Deploy settings (start command, health checks)
- Environment variables
- Restart policies

### `docker-compose.railway.yml`
Railway-specific Docker Compose configuration that:
- Excludes Redis (provided by Railway)
- Uses Railway environment variables
- Configures health checks

### `railway.env.template`
Template for environment variables with:
- Required variables (API keys)
- Optional configuration
- Railway CLI commands

## 📊 Environment Variables

### Required (You must set these)
- `OPENAI_API_KEY` - Your OpenAI API key
- `TAVILY_API_KEY` - Your Tavily API key

### Automatically Set by Railway
- `PORT` - Application port
- `REDIS_URL` - Redis connection URL
- `RAILWAY_ENVIRONMENT` - Environment name

### Optional Configuration
- `DEBUG` - Debug mode (default: false)
- `OPENAI_MODEL` - OpenAI model (default: gpt-4o-mini)
- `OPENAI_TEMPERATURE` - Model temperature (default: 0.7)

## 🗄️ Redis Cache Service (Managed by Railway)

### ✅ **Automatic Managed Redis**
Railway provides **managed Redis** instead of containerized Redis - this is **superior** for production:

#### 🚀 **Automatic Setup Process**
```bash
# 1. Deployment script automatically adds Redis
railway add --service redis

# 2. Railway creates managed Redis instance
# 3. Railway automatically injects REDIS_URL environment variable
# 4. Your app connects seamlessly - zero configuration!
```

#### 🔧 **Redis Features Included**
- **🎯 Zero Setup** - `railway add --service redis` and you're done
- **🔗 Auto-Connection** - `REDIS_URL` automatically provided
- **💾 256MB Memory** - Default (configurable in Railway dashboard)
- **🧠 LRU Eviction** - Optimal memory management policy
- **💿 Persistence** - Automatic data persistence and durability
- **🔄 Backups** - Automatic backups managed by Railway
- **📊 Monitoring** - Built-in Redis monitoring and alerts
- **🔒 Security** - Enterprise-grade encryption and patches
- **📈 Auto-scaling** - Scales automatically with your app
- **⚡ High Availability** - Railway manages failover and uptime

#### 🆚 **Redis: Container vs Managed Service**

| Feature | **❌ Containerized Redis** | **✅ Railway Managed Redis** |
|---------|---------------------------|-------------------------------|
| **Setup** | Manual Docker configuration | `railway add --service redis` |
| **Maintenance** | You handle updates/patches | Railway handles everything |
| **Monitoring** | Manual setup required | Built-in dashboard & alerts |
| **Backups** | Manual backup configuration | Automatic backups |
| **Security** | You configure & maintain | Enterprise-grade by Railway |
| **Scaling** | Manual resource management | Auto-scaling |
| **Uptime** | You handle failures | High availability guaranteed |
| **Cost** | Uses your compute resources | Optimized Railway infrastructure |
| **Expertise** | Requires Redis knowledge | Zero Redis expertise needed |

#### 🔍 **How It Works in Your App**
```python
# api/config.py automatically uses Railway's managed Redis
redis_url: str = "redis://localhost:6379"  # Local default

# ↓ Railway automatically overrides with:
# redis_url: str = "redis://red-xyz123.railway.app:6379"
```

#### 📊 **Monitor Your Redis**
```bash
# Check Redis service status
railway logs --service redis

# View Redis performance metrics  
railway metrics --service redis

# Check Redis connection URL
railway variables | grep REDIS_URL

# View all services (including Redis)
railway services
```

### 🎯 **Your Cache Power is Fully Hosted!**
- ✅ **Full Redis performance** for your AI agent workflows
- ✅ **Zero Redis maintenance** - focus on your app logic
- ✅ **Enterprise reliability** - Railway handles everything
- ✅ **Auto-scaling cache** - grows with your application

## 🔄 Deployment Process

1. **Authentication**: Login to Railway
2. **Project Setup**: Create/link Railway project
3. **Redis Service**: Add managed Redis service
4. **Environment Variables**: Set API keys and configuration
5. **Deployment**: Deploy application using Dockerfile
6. **Verification**: Check health and functionality

## 📱 Post-Deployment

### Access Your Application
```bash
# Open in browser
railway open

# Get deployment URL
railway domain

# View logs
railway logs

# Check status
railway status
```

### Mobile-Friendly URLs
Railway provides:
- **Production URL**: `https://your-app.railway.app`
- **Custom domain**: Configure in Railway dashboard
- **HTTPS**: Automatically enabled

### Test Your API
```bash
# Health check
curl https://your-app.railway.app/health

# API documentation
curl https://your-app.railway.app/docs
```

### Monitor Performance
```bash
# View metrics
railway metrics

# Check Redis status
railway logs --service redis

# View all services
railway services
```

## 🔄 Continuous Deployment

Railway supports automatic deployments from GitHub:
1. Connect your GitHub repository
2. Enable auto-deploy from main branch
3. Railway will automatically deploy on push

## 🔧 Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Check build logs
   railway logs --deployment
   
   # Rebuild
   railway up --detach
   ```

2. **Redis Connection Issues**
   ```bash
   # Check Redis service
   railway ps
   
   # Check Redis URL
   railway variables | grep REDIS_URL
   
   # Verify Redis service is running
   railway ps
   ```

3. **Environment Variables**
   ```bash
   # List all variables
   railway variables
   
   # Set missing variables
   railway variables set VARIABLE_NAME="value"
   
   # Environment Variables Not Set
   railway variables set VARIABLE_NAME="value"
   ```

4. **Port Issues**
   ```bash
   # Railway sets PORT automatically
   # Check if app is listening on correct port
   railway logs
   
   # Make sure your app uses process.env.PORT
   ```

## 🔐 Security Best Practices

- **Use Railway's environment variables** for secrets
- **Never commit API keys** to version control
- **Enable Railway's security features** and domain protection
- **Monitor usage** and set up alerts
- **Use Railway's built-in security features**

## 📈 Scaling

Railway auto-scales based on:
- CPU usage
- Memory usage
- Request volume

Configure scaling in the Railway dashboard.

## 💰 Cost Optimization

- **Use Railway's free tier** for development
- **Monitor resource usage** regularly
- **Set up usage alerts** to avoid surprises
- **Optimize Redis memory usage** for efficiency

## 🎯 Best Practices

1. **Security**
   - Use Railway's environment variables for secrets
   - Never commit API keys to version control
   - Enable Railway's security features

2. **Performance**
   - Monitor Redis memory usage
   - Set appropriate rate limits
   - Use health checks effectively

3. **Monitoring**
   - Set up alerts for failures
   - Monitor API response times
   - Check Redis performance

4. **Scaling**
   - Use Railway's auto-scaling features
   - Monitor resource usage
   - Set up load balancing if needed

## 📚 Additional Resources

- [Railway Documentation](https://docs.railway.app/)
- [Railway CLI Reference](https://docs.railway.app/develop/cli)
- [Redis on Railway](https://docs.railway.app/databases/redis)
- [Environment Variables](https://docs.railway.app/develop/variables)
- [Custom Domains](https://docs.railway.app/deploy/custom-domains)

## 🆘 Support

If you encounter issues:
1. Check the [Railway Status Page](https://status.railway.app/)
2. Review the [Railway Discord](https://discord.gg/railway)
3. Check the deployment logs: `railway logs`
4. Verify environment variables: `railway variables`

## 🚀 Next Steps

After successful deployment:
1. **Set up monitoring** - Use Railway's built-in metrics
2. **Configure custom domain** - Add your own domain
3. **Set up CI/CD** - Connect GitHub for auto-deployment
4. **Add staging environment** - Create separate staging service
5. **Monitor performance** - Use Railway's analytics and costs 