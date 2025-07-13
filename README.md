# PostAssist

AI-powered LinkedIn post generation for machine learning papers with multi-agent verification

📊 **[View Full Business Case](./BUSINESS_CASE.md)**

## A Multi-Agent LinkedIn Post Generation

**PostAssist** is an AI-powered assistant that generates engaging LinkedIn posts about machine learning research papers. This complete **FastAPI backend** uses a sophisticated multi-agent system powered by **LangGraph** to research, create, and verify high-quality content.

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
# Clone and setup
git clone <repository-url>
cd 06_Multi_Agent_with_LangGraph

# Create environment file
cp .env.example .env
# Edit .env with your API keys

# Start with Docker Compose
docker-compose up
```

### Option 2: Manual Setup

```bash
# Make start script executable and run
chmod +x start.sh
./start.sh
```

### Option 3: Development Mode

```bash
# Setup development environment
python scripts/dev.py setup

# Start development server with hot reload
python scripts/dev.py run
```

## 📖 API Documentation

Once running, visit:
- **Interactive API Docs**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

## 🏗 Project Structure

```
06_Multi_Agent_with_LangGraph/
├── app/                          # FastAPI Backend Application
│   ├── main.py                   # FastAPI app with all endpoints
│   ├── config.py                 # Configuration and settings
│   ├── models/                   # Pydantic models
│   │   ├── requests.py           # Request models
│   │   ├── responses.py          # Response models
│   │   └── state.py              # LangGraph state models
│   ├── tools/                    # LangChain tools
│   │   ├── linkedin_tools.py     # LinkedIn-specific tools
│   │   └── search_tools.py       # Research and search tools
│   └── agents/                   # Multi-agent system
│       ├── helpers.py            # Agent utilities
│       ├── content_team.py       # Content creation team
│       ├── verification_team.py  # Verification team
│       └── meta_supervisor.py    # Meta-supervisor
├── examples/                     # Usage examples
│   └── example_client.py         # Complete API client example
├── scripts/                      # Utility scripts
│   ├── dev.py                    # Development utilities
│   ├── test_api.py               # API testing suite
│   └── utils.py                  # General utilities
├── Multi_Agent_RAG_LangGraph.ipynb  # Original notebook
├── requirements.txt              # Python dependencies
├── Dockerfile                    # Docker configuration
├── docker-compose.yml           # Docker Compose setup
└── start.sh                     # Quick start script
```

## 🎯 API Endpoints

### Core Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/generate-post` | Generate LinkedIn post about ML paper |
| `GET` | `/status/{task_id}` | Check task status and get results |
| `POST` | `/verify-post` | Verify post technical accuracy & style |
| `POST` | `/batch-generate` | Generate multiple posts in batch |
| `GET` | `/health` | Health check and service status |

### Example Usage

```python
import requests

# Generate a LinkedIn post
response = requests.post("http://localhost:8000/generate-post", json={
    "paper_title": "Attention Is All You Need",
    "additional_context": "Focus on practical NLP applications",
    "target_audience": "professional",
    "tone": "professional"
})

task_id = response.json()["task_id"]

# Check status
status = requests.get(f"http://localhost:8000/status/{task_id}")
print(status.json())
```

## 🧠 Multi-Agent Architecture

The system uses a hierarchical multi-agent structure:

```
🎯 Meta-Supervisor 
    ↓
👥 Content Creation Team
    ├── 🔬 Paper Researcher (Tavily search, ArXiv research)
    └── ✍️  LinkedIn Creator (Post generation, hashtag optimization)
    ↓
🎯 Meta-Supervisor 
    ↓
✅ Verification Team  
    ├── 🔍 Technical Verifier (Accuracy checking)
    └── 📱 Style Checker (LinkedIn compliance)
    ↓
🏁 Final LinkedIn Post
```

### Key Features

- **Autonomous Operation**: Each agent works independently within its specialty
- **Quality Assurance**: Two-stage verification for technical accuracy and style
- **Scalable Design**: Easy to add new agents or modify existing workflows
- **Robust Error Handling**: Comprehensive error handling and recovery
- **Async Processing**: Background task processing with real-time status updates

## 🛠 Development

### Development Commands

```bash
# Setup development environment
python scripts/dev.py setup

# Run development server (with hot reload)
python scripts/dev.py run

# Run test suite
python scripts/dev.py test

# Format code
python scripts/dev.py format

# Lint code
python scripts/dev.py lint

# Type checking
python scripts/dev.py typecheck

# Run all checks + start server
python scripts/dev.py all
```

### Testing

```bash
# Run comprehensive API tests
python scripts/test_api.py

# Test specific endpoint
python scripts/test_api.py --url http://localhost:8000

# Save test results
python scripts/test_api.py --output test_results.json
```

### Utilities

```bash
# Generate sample requests
python scripts/utils.py samples

# Create cURL examples
python scripts/utils.py curl

# Check API health
python scripts/utils.py health

# Create deployment checklist
python scripts/utils.py checklist
```

## 🔧 Configuration

### Required Environment Variables

```bash
# Required API Keys
OPENAI_API_KEY=your_openai_api_key_here
TAVILY_API_KEY=your_tavily_api_key_here

# Optional Configuration
DEBUG=false
HOST=0.0.0.0
PORT=8000
REDIS_URL=redis://localhost:6379
```

### Application Settings

The application can be configured via `app/config.py`:
- OpenAI model selection and parameters
- Rate limiting settings
- File storage configuration  
- Logging levels
- LangGraph recursion limits

## 🚀 Deployment

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f
```

### Manual Deployment

```bash
# Install dependencies
pip install -r requirements.txt

# Set production environment
export DEBUG=false

# Run with production server
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Production Checklist

Run the deployment checklist generator:

```bash
python scripts/utils.py checklist
```

This creates a comprehensive `DEPLOYMENT_CHECKLIST.md` with all necessary deployment steps.

## 📊 Example Output

**Generated LinkedIn Post:**
```
🚀 **Transforming the Future of AI: Attention Is All You Need**

The groundbreaking paper that introduced the Transformer architecture has 
fundamentally changed how we approach natural language processing.

💡 **Key Takeaways:**

1. Self-attention mechanisms enable parallel processing
2. Eliminates the need for recurrent layers
3. Achieved state-of-the-art results with simpler architecture
4. Became the foundation for BERT, GPT, and T5

What are your thoughts on this research? How do you see it impacting your industry?

#MachineLearning #AI #Research #Innovation #TechTrends #Transformers #NLP
```

## 🔗 Related Files

- **Original Notebook**: `Multi_Agent_RAG_LangGraph.ipynb` - Contains the original implementation and detailed explanations
- **API Documentation**: `app/README.md` - Detailed API documentation
- **Examples**: `examples/` - Complete usage examples and sample code
- **Docker Config**: `Dockerfile` & `docker-compose.yml` - Containerization setup

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`python scripts/test_api.py`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For issues and questions:

1. Check the [API documentation](http://localhost:8000/docs) 
2. Review the [deployment checklist](DEPLOYMENT_CHECKLIST.md)
3. Run the health check: `python scripts/utils.py health`
4. Check the logs for error details
5. Ensure API keys are properly configured

## 🎉 Acknowledgments

- Built with [FastAPI](https://fastapi.tiangolo.com/) for high-performance async API
- Powered by [LangGraph](https://langchain-ai.github.io/langgraph/) for multi-agent orchestration
- Uses [OpenAI GPT](https://openai.com/) models for intelligent content generation
- Integrates [Tavily](https://tavily.com/) for comprehensive web search