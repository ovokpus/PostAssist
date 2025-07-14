# 💻 PostAssist Frontend Documentation

*Next.js Frontend Component Guide and Development Setup*

## 📋 Documentation Navigation

### 🏠 Main Documentation
- **📖 [README.md](../README.md)** - Project overview and getting started
- **🔀 [MERGE.md](../MERGE.md)** - Branch management and merge instructions

### 🛠️ Technical Guides
- **🤖 [Agentic AI Guide](../docs/AGENTIC_AI_GUIDE.md)** - Multi-agent system architecture and implementation
- **⚙️ [Backend Technical Guide](../docs/BACKEND_TECHNICAL_GUIDE.md)** - FastAPI backend deep dive
- **🎨 [Frontend Technical Guide](../docs/FRONTEND_TECHNICAL_GUIDE.md)** - Next.js frontend architecture

### 📊 Configuration & Setup
- **💼 [Business Case](../docs/BUSINESS_CASE.md)** - Project rationale and market analysis
- **🚀 [Railway Deployment Guide](../deploy/README.md)** - Complete Railway deployment with Redis setup
- **⚡ [Cache Configuration](../docs/CACHE_CONFIGURATION.md)** - Redis caching setup and optimization
- **⏱️ [Timeout Fixes](../docs/TIMEOUT_FIXES.md)** - Performance optimization and timeout handling

### 🔧 Component Documentation
- **🔌 [API Documentation](../api/README.md)** - Backend API reference
- **💻 [Frontend Documentation](./README.md)** - Frontend component guide

---

## 🚀 Frontend Overview

A modern, responsive React/TypeScript frontend for PostAssist - AI-powered LinkedIn post generation with multi-agent verification.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Environment Configuration](#environment-configuration)
- [Development](#development)
- [API Integration](#api-integration)
- [Components](#components)
- [Pages](#pages)
- [Styling](#styling)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)

## ✨ Features

### Core Functionality
- **Post Generation**: AI-powered LinkedIn post creation from ML paper titles
- **Real-time Updates**: Live progress tracking during post generation
- **Multi-agent Verification**: Technical accuracy and style verification
- **Batch Processing**: Generate multiple posts simultaneously with individual configuration
- **Post Verification**: Standalone post verification tool with detailed analysis
- **Task Monitoring**: Comprehensive dashboard for tracking all generation tasks
- **Data Export**: CSV export for batch results and verification reports

### User Experience
- **Responsive Design**: Mobile-first, works on all devices
- **Dark Theme**: Professional dark blue theme optimized for readability
- **Real-time Feedback**: Live progress indicators and status updates
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Copy & Share**: Easy clipboard copy and LinkedIn sharing integration

### Technical Features
- **TypeScript**: Full type safety and IntelliSense support
- **Modern React**: Hooks, context, and functional components
- **API Integration**: Robust API client with retry logic and error handling
- **Performance**: Optimized for fast loading and smooth interactions

## 🛠 Tech Stack

### Frontend Framework
- **Next.js 15**: React framework with App Router
- **React 18**: Latest React with concurrent features
- **TypeScript**: Static type checking and enhanced developer experience

### Styling & UI
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful, customizable icons
- **Class Variance Authority**: Type-safe component variants
- **React Hot Toast**: Elegant toast notifications

### API & Data
- **Axios**: HTTP client with interceptors and retry logic
- **Custom API Client**: Specialized client for PostAssist API
- **Real-time Polling**: Live status updates during generation

### Development Tools
- **ESLint**: Code linting and style enforcement
- **Prettier**: Code formatting (configured in ESLint)
- **TypeScript Strict**: Enhanced type checking

## 📋 Prerequisites

- **Node.js** 18.17+ (LTS recommended)
- **npm** 9.0+ (comes with Node.js)
- **PostAssist API** running on port 8000

## 🚀 Installation & Setup

### 1. Clone & Navigate

```bash
cd frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env.local` file in the frontend directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# App Configuration
NEXT_PUBLIC_APP_NAME=PostAssist
NEXT_PUBLIC_APP_VERSION=1.0.0

# Development
NODE_ENV=development
```

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 🔧 Environment Configuration

### Required Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_API_URL` | PostAssist API base URL | `http://localhost:8000` | Yes |
| `NEXT_PUBLIC_APP_NAME` | Application name | `PostAssist` | No |
| `NEXT_PUBLIC_APP_VERSION` | Application version | `1.0.0` | No |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `NEXT_PUBLIC_ANALYTICS_ID` | Analytics tracking ID | - |
| `NEXT_PUBLIC_SENTRY_DSN` | Error tracking DSN | - |

## 💻 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Type checking
npm run type-check
```

### Development Workflow

1. **Start Backend API**: Ensure PostAssist API is running on port 8000
2. **Start Frontend**: Run `npm run dev` to start the development server
3. **Open Browser**: Navigate to `http://localhost:3000`
4. **Hot Reload**: Changes are automatically reflected in the browser

### Development Features

- **Fast Refresh**: React Fast Refresh for instant updates
- **TypeScript Support**: Full TypeScript compilation and type checking
- **Error Overlay**: Detailed error information in development
- **API Proxy**: Automatic API request handling

## 🔌 API Integration

### API Client

The frontend uses a custom API client (`/src/lib/api-client.ts`) that provides:

- **Automatic Retries**: Exponential backoff for failed requests
- **Request Interceptors**: Automatic timestamp addition
- **Error Handling**: Standardized error response handling
- **Polling Support**: Built-in task status polling

### API Endpoints

```typescript
// Generate post
generatePost(request: PostGenerationRequest): Promise<PostGenerationResponse>

// Get task status
getTaskStatus(taskId: string): Promise<PostStatusResponse>

// Poll task status
pollTaskStatus(taskId: string, onUpdate?: Function): Promise<PostStatusResponse>

// Get all tasks
getAllTasks(): Promise<PostStatusResponse[]>

// Verify post
verifyPost(request: PostVerificationRequest): Promise<PostVerificationResponse>

// Batch generate
batchGenerate(request: BatchPostRequest): Promise<BatchPostResponse>

// Health check
healthCheck(): Promise<HealthCheckResponse>
```

### Usage Example

```typescript
import { generatePost, pollTaskStatus } from '@/lib/api-client';

// Generate a post
const response = await generatePost({
  paper_title: "Attention Is All You Need",
  target_audience: "professional",
  tone: "professional"
});

// Poll for completion
const result = await pollTaskStatus(response.task_id, (status) => {
  console.log(`Progress: ${status.progress}%`);
});
```

## 🧩 Components

### UI Components (`/src/components/ui/`)

- **Button**: Versatile button component with variants and loading states
- **Input**: Form input with labels, validation, and icons
- **Textarea**: Multi-line text input with character counting
- **Select**: Dropdown selection with custom styling
- **Card**: Flexible card component for content display

### Layout Components (`/src/components/layout/`)

- **Header**: Application header with navigation and branding
- **HeaderSkeleton**: Loading skeleton for header

### Feature Components

- **PostForm**: Main post generation form
- **StatusDisplay**: Real-time generation progress
- **ResultCard**: Generated post display and actions

## 📄 Pages

### Home Page (`/src/app/page.tsx`)

**Main Features:**
- Post generation form
- Real-time progress tracking
- Generated post display
- Copy and share functionality

**Components Used:**
- Form inputs for paper title, context, audience, tone
- Progress indicators during generation
- Post preview with formatting
- Action buttons for copy/share

### Batch Page (`/batch`)

**Bulk Post Generation** - Create multiple LinkedIn posts simultaneously

**Features:**
- Multi-item form with add/remove functionality
- Individual configuration per post (title, context, audience, tone)
- Real-time progress tracking during bulk generation
- Results display with copy/clipboard functionality
- CSV export for batch results
- Comprehensive error handling and validation

**Components Used:**
- Dynamic form arrays for multiple posts
- Progress indicators for each post
- Batch results table with actions
- Export functionality

### Status Page (`/status`)

**Task Monitoring Dashboard** - Monitor all generation tasks

**Features:**
- Dashboard with statistics (total, completed, in-progress, failed)
- Task history table with search and filtering
- Auto-refresh toggle for real-time monitoring
- Task details panel with comprehensive status
- Connected to real API data

**Components Used:**
- Statistics cards with real-time data
- Filterable task table
- Auto-refresh mechanism
- Task detail modal/panel

### Verify Page (`/verify`)

**Post Verification Tool** - Standalone verification for existing posts

**Features:**
- Verification form with paper title and content input
- Verification type selection (Technical & Style, Technical Only, Style Only)
- Real-time character and word count tracking
- Detailed results with scoring breakdown
- Verification report with recommendations
- Report download functionality

**Components Used:**
- Verification form with text analysis
- Progress indicators during verification
- Results display with scoring
- Download functionality

### Future Enhancements

- **Analytics** (`/analytics`): Usage metrics and insights
- **Settings** (`/settings`): User preferences and configuration
- **History** (`/history`): Extended task history with analytics
- **Teams** (`/teams`): Multi-user collaboration features

## 🎨 Styling

### Design System

**Colors:**
- Primary: Blue gradient (#3b82f6 to #2563eb)
- Dark: Slate/gray palette for backgrounds
- Success: Green (#10b981)
- Error: Red (#ef4444)
- Warning: Yellow (#f59e0b)

**Typography:**
- Font: Inter (clean, professional)
- Headings: Bold, good contrast
- Body: Regular weight, optimal line height

**Spacing:**
- Consistent spacing scale (4px base)
- Responsive padding/margins
- Proper visual hierarchy

### Responsive Design

```css
/* Mobile First */
@media (max-width: 640px) { /* Mobile */ }
@media (max-width: 768px) { /* Tablet */ }
@media (max-width: 1024px) { /* Desktop */ }
@media (max-width: 1280px) { /* Large Desktop */ }
```

### Custom Classes

```css
.container { /* Responsive container */ }
.card { /* Card styling */ }
.button-primary { /* Primary button */ }
.gradient-text { /* Gradient text effect */ }
```

## 🧪 Testing

### Testing Setup

```bash
# Install testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom jest

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

### Testing Best Practices

1. **Component Testing**: Test UI components in isolation
2. **Integration Testing**: Test API integration and data flow
3. **E2E Testing**: Test complete user workflows
4. **Accessibility Testing**: Ensure WCAG compliance

### Example Test

```typescript
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';

test('renders button with text', () => {
  render(<Button>Click me</Button>);
  const buttonElement = screen.getByRole('button', { name: /click me/i });
  expect(buttonElement).toBeInTheDocument();
});
```

## 🚀 Deployment

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Environment Variables

```env
# Production environment
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.postassist.com
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### Deployment Platforms

#### Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

#### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

#### Traditional Hosting

```bash
# Build static files
npm run build

# Serve with any static file server
npx serve out
```

## 🔧 Configuration

### Next.js Configuration

```typescript
// next.config.ts
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['example.com'],
  },
};

export default nextConfig;
```

### Tailwind Configuration

```typescript
// tailwind.config.ts
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { /* Blue palette */ },
        dark: { /* Dark palette */ },
      },
    },
  },
  plugins: [],
};
```

## 🤝 Contributing

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

### Code Style

- Use TypeScript for all new code
- Follow ESLint configuration
- Use Prettier for formatting
- Write meaningful commit messages
- Add tests for new features

### Pull Request Process

1. Update documentation
2. Add tests for new features
3. Ensure all tests pass
4. Update changelog
5. Request review

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

- **Issues**: GitHub Issues
- **Documentation**: README and inline comments
- **API Documentation**: Backend API docs at `http://localhost:8000/docs`

## 🚀 Quick Start Checklist

- [ ] Node.js 18+ installed
- [ ] PostAssist API running on port 8000
- [ ] Frontend dependencies installed (`npm install`)
- [ ] Environment variables configured
- [ ] Development server started (`npm run dev`)
- [ ] Browser opened to `http://localhost:3000`

**You're ready to generate amazing LinkedIn posts! 🎉**
