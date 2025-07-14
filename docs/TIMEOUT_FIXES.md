# ⏱️ PostAssist Timeout Fixes Guide

*Performance Optimization and Timeout Handling for AI Agent Workflows*

## 📋 Documentation Navigation

### 🏠 Main Documentation
- **📖 [README.md](../README.md)** - Project overview and getting started
- **🔀 [MERGE.md](../MERGE.md)** - Branch management and merge instructions

### 🛠️ Technical Guides
- **🤖 [Agentic AI Guide](./AGENTIC_AI_GUIDE.md)** - Multi-agent system architecture and implementation
- **⚙️ [Backend Technical Guide](./BACKEND_TECHNICAL_GUIDE.md)** - FastAPI backend deep dive
- **🎨 [Frontend Technical Guide](./FRONTEND_TECHNICAL_GUIDE.md)** - Next.js frontend architecture

### 📊 Configuration & Setup
- **💼 [Business Case](./BUSINESS_CASE.md)** - Project rationale and market analysis
- **🚀 [Railway Deployment Guide](../deploy/README.md)** - Complete Railway deployment with Redis setup
- **⚡ [Cache Configuration](./CACHE_CONFIGURATION.md)** - Redis caching setup and optimization
- **⏱️ [Timeout Fixes](./TIMEOUT_FIXES.md)** - Performance optimization and timeout handling

### 🔧 Component Documentation
- **🔌 [API Documentation](../api/README.md)** - Backend API reference
- **💻 [Frontend Documentation](../frontend/README.md)** - Frontend component guide

---

## 🎯 Overview

**Issue**: When running batch post generation and verification simultaneously, the verification request would timeout after 30 seconds due to resource contention.

## ✅ Solutions Implemented

### 1. **Extended Timeouts** ⏰
- **Verification requests**: 30s → **2 minutes** (120s)
- **Batch generation**: 30s → **5 minutes** (300s)
- **Backend verification**: Added 2-minute timeout with proper error handling

### 2. **Concurrency Control** 🚦
- **Max simultaneous post generations**: 3 (configurable)
- **Max simultaneous verifications**: 5 (configurable)
- **Semaphore-based resource management** to prevent overload

### 3. **Better Error Handling** 🛡️
```javascript
// Frontend now shows helpful error messages:
"Verification timed out after 120 seconds. The backend may be busy processing other requests. Please try again in a few moments."
```

### 4. **Resource Management** ⚙️
- **Background tasks are queued** instead of overwhelming the system
- **OpenAI API calls are throttled** to prevent rate limits
- **Redis caching** reduces redundant processing

## 🚀 How to Use Multiple Operations

### ✅ **Recommended Workflow**
1. **Start batch generation** in one tab
2. **Wait 1-2 minutes** for it to get going
3. **Then use verification** in another tab
4. **Monitor progress** in the main dashboard

### ⚙️ **Configuration Options**

Add to your `.env` file to customize limits:

```bash
# Concurrency Control
MAX_CONCURRENT_GENERATIONS=3    # Max simultaneous post generations
MAX_CONCURRENT_VERIFICATIONS=5  # Max simultaneous verifications  
VERIFICATION_TIMEOUT=120        # Verification timeout (seconds)

# Longer timeouts for heavy operations
REDIS_TASK_TTL=14400           # 4 hours (from 2 hours)
```

## 📊 Performance Guidelines

### **Light Usage** (1-2 operations)
- All operations complete quickly
- No timeouts expected

### **Medium Usage** (3-5 operations)  
- Batch generation: 3-5 minutes per post
- Verification: 30-60 seconds
- Some queuing may occur

### **Heavy Usage** (5+ operations)
- Batch generation: 5-10 minutes per post
- Verification: 60-120 seconds  
- Operations queued for resource management

## 🔍 Monitoring Your Operations

### **Check Current Load**
```bash
# See all active tasks
curl http://localhost:8000/tasks | jq '.[].status' | grep -c "in_progress"

# Check Redis memory usage  
redis-cli info memory | grep used_memory_human
```

### **Backend Health Check**
```bash
curl http://localhost:8000/health
```

Look for:
- `"redis": "connected"` - Good
- `"openai": "connected"` - Good  
- `"tavily": "connected"` - Good

## 🎯 Best Practices

### **For Batch Operations**
- **Start with small batches** (2-3 posts) to test
- **Monitor progress** before starting more
- **Use scheduling** to spread out API calls

### **For Verification**
- **Wait for current operations** to reduce load
- **Use longer posts** benefit from 2-minute timeout
- **Check backend health** if repeated failures

### **Resource Management**
- **Check Redis memory** if operations are slow
- **Restart backend** if completely stuck (rare)
- **Increase cache size** for heavy usage (see [CACHE_CONFIGURATION.md](CACHE_CONFIGURATION.md))

## 🚨 Troubleshooting

### **"Request timed out"**
- ✅ Wait 2-3 minutes and try again
- ✅ Check if batch generation is running  
- ✅ Verify backend health endpoint

### **"Backend may be busy"**
- ✅ Check task status dashboard
- ✅ Wait for current operations to complete
- ✅ Consider increasing concurrent limits

### **Repeated failures**
- ✅ Restart the backend: `./start.sh`
- ✅ Check Redis memory usage
- ✅ Verify API keys are working

## 📈 Performance Metrics

**Before fixes:**
- ❌ 30s timeout causing failures
- ❌ Resource contention
- ❌ Poor error messages

**After fixes:**
- ✅ 120s verification timeout
- ✅ 300s batch timeout  
- ✅ Controlled concurrency
- ✅ Helpful error messages
- ✅ Better resource management

---

**Need more performance?** See [CACHE_CONFIGURATION.md](CACHE_CONFIGURATION.md) for scaling options! 🚀 