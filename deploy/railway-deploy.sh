#!/bin/bash

# PostAssist Railway Deployment Script
# This script automates the deployment of PostAssist to Railway with Redis

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Railway CLI is installed
check_railway_cli() {
    if ! command -v railway &> /dev/null; then
        error "Railway CLI is not installed"
        info "Install it with: npm install -g @railway/cli"
        exit 1
    fi
    success "Railway CLI is installed"
}

# Check if user is logged in to Railway
check_railway_auth() {
    if ! railway whoami &> /dev/null; then
        error "You are not logged in to Railway"
        info "Run: railway login"
        exit 1
    fi
    success "Logged in to Railway"
}

# Create or link Railway project
setup_railway_project() {
    info "Setting up Railway project..."
    
    # Check if already linked to a project
    if railway status &> /dev/null; then
        success "Already linked to a Railway project"
        return
    fi
    
    # Ask user if they want to create new project or link existing
    echo -e "${YELLOW}Do you want to:${NC}"
    echo "1) Create a new Railway project"
    echo "2) Link to an existing project"
    read -p "Enter your choice (1 or 2): " choice
    
    case $choice in
        1)
            info "Creating new Railway project..."
            railway new || {
                error "Failed to create Railway project"
                exit 1
            }
            success "Created new Railway project"
            ;;
        2)
            info "Linking to existing project..."
            railway link || {
                error "Failed to link to Railway project"
                exit 1
            }
            success "Linked to existing Railway project"
            ;;
        *)
            error "Invalid choice"
            exit 1
            ;;
    esac
}

# Add Redis service (Managed by Railway)
setup_redis_service() {
    info "Setting up managed Redis service..."
    info "Note: Railway provides Redis as a managed service (not containerized)"
    
    # Check if Redis service already exists
    if railway services | grep -q "redis"; then
        success "Managed Redis service already exists"
        return
    fi
    
    # Add managed Redis service
    info "Adding Railway managed Redis service..."
    railway add --service redis || {
        error "Failed to add managed Redis service"
        exit 1
    }
    
    success "✅ Managed Redis service added successfully!"
    info "Railway will automatically provide REDIS_URL environment variable"
}

# Set environment variables
setup_environment_variables() {
    info "Setting up environment variables..."
    
    # Check if API keys are already set
    if railway variables | grep -q "OPENAI_API_KEY"; then
        success "OPENAI_API_KEY already set"
    else
        read -p "Enter your OpenAI API key: " OPENAI_API_KEY
        railway variables set OPENAI_API_KEY="$OPENAI_API_KEY" || {
            error "Failed to set OPENAI_API_KEY"
            exit 1
        }
        success "OPENAI_API_KEY set successfully"
    fi
    
    if railway variables | grep -q "TAVILY_API_KEY"; then
        success "TAVILY_API_KEY already set"
    else
        read -p "Enter your Tavily API key: " TAVILY_API_KEY
        railway variables set TAVILY_API_KEY="$TAVILY_API_KEY" || {
            error "Failed to set TAVILY_API_KEY"
            exit 1
        }
        success "TAVILY_API_KEY set successfully"
    fi
    
    # Set optional configuration
    railway variables set DEBUG="false" || warning "Failed to set DEBUG variable"
    railway variables set OPENAI_MODEL="gpt-4o-mini" || warning "Failed to set OPENAI_MODEL variable"
    railway variables set OPENAI_TEMPERATURE="0.7" || warning "Failed to set OPENAI_TEMPERATURE variable"
    
    success "Environment variables configured"
}

# Deploy application
deploy_application() {
    info "Deploying application to Railway..."
    
    # Deploy the application
    railway up || {
        error "Failed to deploy application"
        exit 1
    }
    
    success "Application deployed successfully"
}

# Show deployment info
show_deployment_info() {
    info "Gathering deployment information..."
    
    # Get deployment URL
    APP_URL=$(railway domain 2>/dev/null || echo "Not available")
    
    echo -e "\n${GREEN}🚀 Deployment Complete!${NC}"
    echo -e "${BLUE}======================================${NC}"
    echo -e "${YELLOW}Application URL:${NC} $APP_URL"
    echo -e "${YELLOW}Health Check:${NC} $APP_URL/health"
    echo -e "${YELLOW}API Documentation:${NC} $APP_URL/docs"
    echo -e "${YELLOW}Redis Cache:${NC} ✅ Managed by Railway"
    echo -e "${BLUE}======================================${NC}"
    
    echo -e "\n${YELLOW}Useful Commands:${NC}"
    echo "View logs: railway logs"
    echo "Open app: railway open"
    echo "Check status: railway status"
    echo "View variables: railway variables"
    
    echo -e "\n${YELLOW}Next Steps:${NC}"
    echo "1. Test your API endpoints"
    echo "2. Set up custom domain (optional)"
    echo "3. Configure monitoring"
    echo "4. Set up CI/CD with GitHub"
}

# Main deployment function
main() {
    echo -e "${BLUE}🚀 PostAssist Railway Deployment${NC}"
    echo -e "${BLUE}=================================${NC}\n"
    
    check_railway_cli
    check_railway_auth
    setup_railway_project
    setup_redis_service
    setup_environment_variables
    deploy_application
    show_deployment_info
    
    success "Deployment completed successfully!"
}

# Run main function
main "$@" 