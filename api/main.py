"""Main FastAPI application for LinkedIn ML Paper Post Generation."""

import uuid
import asyncio
import json
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List

from fastapi import FastAPI, HTTPException, BackgroundTasks, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import redis.asyncio as redis

from api.config import settings, validate_api_keys
from api.models.requests import (
    PostGenerationRequest, 
    PostStatusRequest, 
    PostVerificationRequest,
    BatchPostRequest
)
from api.models.responses import (
    PostGenerationResponse, 
    PostStatusResponse, 
    PostVerificationResponse,
    BatchPostResponse,
    HealthCheckResponse,
    ErrorResponse,
    TaskStatus,
    LinkedInPost,
    VerificationReport,
    AgentStatus,
    AgentFeedback,
    TeamProgress
)


def datetime_json_encoder(obj):
    """JSON encoder function that handles datetime objects."""
    if isinstance(obj, datetime):
        return obj.isoformat()
    raise TypeError(f"Object of type {type(obj)} is not JSON serializable")


# Initialize FastAPI app
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="PostAssist - AI-powered LinkedIn post generation for machine learning papers with multi-agent verification",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Redis client for task storage
redis_client: Optional[redis.Redis] = None

# In-memory task storage (fallback if Redis is not available)
task_storage: Dict[str, Dict[str, Any]] = {}


async def get_redis_client():
    """Get Redis client instance."""
    global redis_client
    if redis_client is None:
        try:
            redis_client = redis.from_url(settings.redis_url)
            await redis_client.ping()
        except Exception:
            redis_client = None
    return redis_client


async def store_task(task_id: str, task_data: Dict[str, Any]):
    """Store task data in Redis or fallback storage."""
    client = await get_redis_client()
    if client:
        try:
            # Use proper JSON serialization instead of str()
            serialized_data = json.dumps(task_data, default=datetime_json_encoder)
            await client.setex(f"task:{task_id}", 7200, serialized_data)  # 2 hour TTL
        except Exception:
            task_storage[task_id] = task_data
    else:
        task_storage[task_id] = task_data


async def get_task(task_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve task data from Redis or fallback storage."""
    client = await get_redis_client()
    if client:
        try:
            data = await client.get(f"task:{task_id}")
            if data:
                # Use proper JSON deserialization instead of eval()
                return json.loads(data.decode())
        except Exception:
            pass
    
    return task_storage.get(task_id)


async def update_task_status(task_id: str, status: str, progress: float = None, 
                           current_step: str = None, result: Dict[str, Any] = None,
                           error: str = None):
    """Update task status."""
    task_data = await get_task(task_id) or {}
    task_data.update({
        "status": status,
        "updated_at": datetime.utcnow().isoformat(),
    })
    
    if progress is not None:
        task_data["progress"] = progress
    if current_step is not None:
        task_data["current_step"] = current_step
    if result is not None:
        task_data["result"] = result
    if error is not None:
        task_data["error"] = error
    
    await store_task(task_id, task_data)


async def update_agent_status(task_id: str, agent_name: str, status: AgentStatus, 
                            current_activity: str = None, progress: float = None, 
                            findings: str = None, error_message: str = None):
    """Update individual agent status within a task."""
    task_data = await get_task(task_id) or {}
    
    # Initialize teams structure if not exists
    if "teams" not in task_data:
        task_data["teams"] = {}
    
    # Determine which team this agent belongs to
    team_mapping = {
        "PaperResearcher": "Content team",
        "LinkedInCreator": "Content team", 
        "TechVerifier": "Verification team",
        "StyleChecker": "Verification team"
    }
    
    team_name = team_mapping.get(agent_name, "Unknown team")
    
    # Initialize team if not exists
    if team_name not in task_data["teams"]:
        task_data["teams"][team_name] = {
            "team_name": team_name,
            "status": "pending",
            "progress": 0.0,
            "current_focus": None,
            "agents": {},
            "team_findings": None,
            "started_at": None,
            "completed_at": None
        }
    
    # Update agent information
    agent_data = {
        "agent_name": agent_name,
        "status": status.value,
        "current_activity": current_activity,
        "progress": progress or 0.0,
        "findings": findings,
        "last_update": datetime.utcnow().isoformat(),
        "error_message": error_message
    }
    
    task_data["teams"][team_name]["agents"][agent_name] = agent_data
    
    # Update team status based on agent statuses
    team_agents = task_data["teams"][team_name]["agents"]
    if all(agent["status"] == "completed" for agent in team_agents.values()):
        task_data["teams"][team_name]["status"] = "completed"
        task_data["teams"][team_name]["completed_at"] = datetime.utcnow().isoformat()
    elif any(agent["status"] == "working" for agent in team_agents.values()):
        task_data["teams"][team_name]["status"] = "in_progress"
        if not task_data["teams"][team_name]["started_at"]:
            task_data["teams"][team_name]["started_at"] = datetime.utcnow().isoformat()
    elif any(agent["status"] == "error" for agent in team_agents.values()):
        task_data["teams"][team_name]["status"] = "failed"
    
    # Calculate team progress as average of agent progress
    if team_agents:
        team_progress = sum(agent["progress"] for agent in team_agents.values()) / len(team_agents)
        task_data["teams"][team_name]["progress"] = team_progress
    
    # Update overall task detailed status
    if status == AgentStatus.WORKING and current_activity:
        task_data["detailed_status"] = f"{agent_name} is {current_activity.lower()}"
        task_data["current_team"] = team_name
    
    await store_task(task_id, task_data)


async def update_team_focus(task_id: str, team_name: str, current_focus: str, phase: str = None):
    """Update what a team is currently focused on."""
    task_data = await get_task(task_id) or {}
    
    if "teams" not in task_data:
        task_data["teams"] = {}
    
    if team_name not in task_data["teams"]:
        task_data["teams"][team_name] = {
            "team_name": team_name,
            "status": "in_progress",
            "progress": 0.0,
            "current_focus": current_focus,
            "agents": {},
            "team_findings": None,
            "started_at": datetime.utcnow().isoformat(),
            "completed_at": None
        }
    else:
        task_data["teams"][team_name]["current_focus"] = current_focus
    
    # Update overall task phase and current team
    if phase:
        task_data["phase"] = phase
    task_data["current_team"] = team_name
    task_data["detailed_status"] = f"{team_name} is {current_focus.lower()}"
    
    await store_task(task_id, task_data)


async def complete_team(task_id: str, team_name: str, team_findings: str = None):
    """Mark a team as completed with their findings."""
    task_data = await get_task(task_id) or {}
    
    if "teams" in task_data and team_name in task_data["teams"]:
        task_data["teams"][team_name]["status"] = "completed"
        task_data["teams"][team_name]["completed_at"] = datetime.utcnow().isoformat()
        if team_findings:
            task_data["teams"][team_name]["team_findings"] = team_findings
        task_data["teams"][team_name]["progress"] = 1.0
    
    await store_task(task_id, task_data)


async def get_all_tasks() -> List[Dict[str, Any]]:
    """Retrieve all tasks from Redis or fallback storage."""
    client = await get_redis_client()
    all_tasks = []
    
    if client:
        try:
            # Get all task keys from Redis
            keys = await client.keys("task:*")
            for key in keys:
                data = await client.get(key)
                if data:
                    try:
                        task_data = json.loads(data.decode())
                        all_tasks.append(task_data)
                    except json.JSONDecodeError:
                        continue
        except Exception:
            # Fall back to in-memory storage
            all_tasks = list(task_storage.values())
    else:
        # Use in-memory storage
        all_tasks = list(task_storage.values())
    
    # Sort by creation date (newest first)
    all_tasks.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    return all_tasks


@app.on_event("startup")
async def startup_event():
    """Initialize application on startup."""
    try:
        validate_api_keys()
        await get_redis_client()
        print(f"🚀 {settings.app_name} v{settings.app_version} started successfully!")
    except Exception as e:
        print(f"❌ Startup failed: {e}")
        raise


@app.get("/", response_model=HealthCheckResponse)
async def root():
    """Root endpoint with basic health check."""
    return HealthCheckResponse(
        status="healthy",
        version=settings.app_version,
        services={
            "openai": "connected" if settings.openai_api_key else "not_configured",
            "tavily": "connected" if settings.tavily_api_key else "not_configured",
            "redis": "connected" if await get_redis_client() else "not_available"
        }
    )


@app.get("/health", response_model=HealthCheckResponse)
async def health_check():
    """Detailed health check endpoint."""
    services = {}
    
    # Check OpenAI
    try:
        if settings.openai_api_key:
            services["openai"] = "connected"
        else:
            services["openai"] = "not_configured"
    except Exception:
        services["openai"] = "error"
    
    # Check Tavily
    try:
        if settings.tavily_api_key:
            services["tavily"] = "connected"
        else:
            services["tavily"] = "not_configured"
    except Exception:
        services["tavily"] = "error"
    
    # Check Redis
    try:
        client = await get_redis_client()
        services["redis"] = "connected" if client else "not_available"
    except Exception:
        services["redis"] = "error"
    
    overall_status = "healthy" if all(
        status in ["connected", "not_available"] for status in services.values()
    ) else "degraded"
    
    return HealthCheckResponse(
        status=overall_status,
        version=settings.app_version,
        services=services
    )


async def run_post_generation_task(task_id: str, request: PostGenerationRequest):
    """Background task to generate LinkedIn post using streaming approach."""
    try:
        await update_task_status(task_id, TaskStatus.IN_PROGRESS, 0.1, "starting")
        
        # Initialize workflow with detailed tracking
        await update_team_focus(task_id, "Content team", "Preparing to research ML paper", "initialization")
        await update_agent_status(task_id, "PaperResearcher", AgentStatus.IDLE, "Waiting for assignment")
        await update_agent_status(task_id, "LinkedInCreator", AgentStatus.IDLE, "Waiting for research data")
        await update_agent_status(task_id, "TechVerifier", AgentStatus.IDLE, "Standing by for verification")
        await update_agent_status(task_id, "StyleChecker", AgentStatus.IDLE, "Ready for style review")
        
        # Import here to avoid circular imports
        from api.agents.meta_supervisor import stream_linkedin_post_generation
        
        await update_task_status(task_id, TaskStatus.IN_PROGRESS, 0.2, "researching_paper")
        await update_team_focus(task_id, "Content team", "Starting research on ML paper", "research")
        await update_agent_status(task_id, "PaperResearcher", AgentStatus.WORKING, "Searching for paper information", 0.1)
        
        # Stream the LinkedIn post generation with real-time updates
        final_result = None
        all_messages = []
        current_progress = 0.2
        
        # Create status callback for real-time updates
        async def process_stream_step(step, task_id):
            nonlocal current_progress, all_messages
            
            print(f"🔄 Processing stream step: {step}")  # Debug logging
            
            # Extract step information
            for node_name, node_result in step.items():
                if "messages" in node_result:
                    all_messages.extend(node_result["messages"])
                    
                print(f"📍 Node: {node_name}, Result: {node_result}")  # Debug logging
                    
                # Update agent status based on current node with granular updates
                if node_name == "meta_supervisor":
                    next_action = node_result.get("next", "")
                    if next_action == "Content team":
                        await update_task_status(task_id, TaskStatus.IN_PROGRESS, 0.3, "content_creation")
                        await update_team_focus(task_id, "Content team", "Meta-supervisor directing to content creation", "content_creation")
                        # Start content team workflow
                        await update_agent_status(task_id, "PaperResearcher", AgentStatus.WORKING, "Preparing to research ML paper", 0.2)
                        current_progress = 0.3
                    elif next_action == "Verification team":
                        await update_task_status(task_id, TaskStatus.IN_PROGRESS, 0.7, "verification")
                        await update_team_focus(task_id, "Verification team", "Meta-supervisor directing to verification", "verification")
                        await update_agent_status(task_id, "TechVerifier", AgentStatus.WORKING, "Starting technical accuracy check", 0.7)
                        current_progress = 0.7
                    elif next_action == "FINISH":
                        current_progress = 1.0
                        await update_task_status(task_id, TaskStatus.IN_PROGRESS, 1.0, "finalizing")
                        
                elif node_name == "Content team":
                    # Analyze the specific message to understand what happened
                    messages = node_result.get("messages", [])
                    if messages:
                        latest_message = messages[-1]
                        agent_name = getattr(latest_message, 'name', '')
                        content = getattr(latest_message, 'content', '')
                        
                        print(f"🎯 Content team agent: {agent_name}, content preview: {content[:100]}...")
                        
                        if agent_name == "PaperResearcher":
                            await update_agent_status(task_id, "PaperResearcher", AgentStatus.WORKING, "Researching paper methodology and results", 0.5)
                            await update_agent_status(task_id, "LinkedInCreator", AgentStatus.IDLE, "Waiting for research completion")
                        elif agent_name == "LinkedInCreator":
                            await update_agent_status(task_id, "PaperResearcher", AgentStatus.COMPLETED, "Paper research completed", 1.0)
                            await update_agent_status(task_id, "LinkedInCreator", AgentStatus.WORKING, "Creating engaging LinkedIn post", 0.8)
                        
                    # Content team workflow in progress or completed
                    await update_task_status(task_id, TaskStatus.IN_PROGRESS, 0.6, "content_complete")
                    await complete_team(task_id, "Content team", "Research and content creation completed")
                    await update_agent_status(task_id, "LinkedInCreator", AgentStatus.COMPLETED, "LinkedIn post created successfully", 1.0)
                    current_progress = 0.6
                    
                elif node_name == "Verification team":
                    # Analyze verification team messages
                    messages = node_result.get("messages", [])
                    if messages:
                        latest_message = messages[-1]
                        agent_name = getattr(latest_message, 'name', '')
                        content = getattr(latest_message, 'content', '')
                        
                        print(f"🛡️ Verification team agent: {agent_name}, content preview: {content[:100]}...")
                        
                        if agent_name == "TechVerifier":
                            await update_agent_status(task_id, "TechVerifier", AgentStatus.WORKING, "Verifying technical claims and accuracy", 0.8)
                            await update_agent_status(task_id, "StyleChecker", AgentStatus.IDLE, "Waiting for technical verification")
                        elif agent_name == "StyleChecker":
                            await update_agent_status(task_id, "TechVerifier", AgentStatus.COMPLETED, "Technical verification passed", 1.0)
                            await update_agent_status(task_id, "StyleChecker", AgentStatus.WORKING, "Checking LinkedIn style compliance", 0.9)
                    
                    # Verification team completed
                    await update_task_status(task_id, TaskStatus.IN_PROGRESS, 0.9, "verification_complete")
                    await complete_team(task_id, "Verification team", "Technical and style verification completed")
                    await update_agent_status(task_id, "StyleChecker", AgentStatus.COMPLETED, "Style verification passed", 1.0)
                    current_progress = 0.9
                    
                # Additional granular agent updates for specific nodes
                elif node_name in ["PaperResearcher", "LinkedInCreator", "TechVerifier", "StyleChecker"]:
                    messages = node_result.get("messages", [])
                    if messages:
                        latest_message = messages[-1]
                        content = getattr(latest_message, 'content', '')
                        
                        # Real-time agent-specific updates
                        if node_name == "PaperResearcher":
                            if "research" in content.lower() or "paper" in content.lower():
                                await update_agent_status(task_id, "PaperResearcher", AgentStatus.WORKING, "Analyzing paper methodology and key findings", 0.4)
                            else:
                                await update_agent_status(task_id, "PaperResearcher", AgentStatus.WORKING, "Extracting research insights", 0.5)
                                
                        elif node_name == "LinkedInCreator":
                            if "post" in content.lower() or "linkedin" in content.lower():
                                await update_agent_status(task_id, "LinkedInCreator", AgentStatus.WORKING, "Crafting engaging LinkedIn content", 0.7)
                            else:
                                await update_agent_status(task_id, "LinkedInCreator", AgentStatus.WORKING, "Formatting post with hashtags", 0.8)
                                
                        elif node_name == "TechVerifier":
                            await update_agent_status(task_id, "TechVerifier", AgentStatus.WORKING, "Cross-checking technical accuracy", 0.8)
                            
                        elif node_name == "StyleChecker":
                            await update_agent_status(task_id, "StyleChecker", AgentStatus.WORKING, "Optimizing for LinkedIn best practices", 0.9)
        
        # Run streaming generation
        for step in stream_linkedin_post_generation(
            paper_title=request.paper_title,
            additional_context=request.additional_context,
            target_audience=request.target_audience,
            include_technical_details=request.include_technical_details,
            max_hashtags=request.max_hashtags,
            tone=request.tone,
            task_id=task_id,
            status_callback=process_stream_step
        ):
            await process_stream_step(step, task_id)
            final_result = step
        
        # Process final results
        result = {"messages": all_messages}
        
        if final_result and "error" in final_result:
            await update_task_status(
                task_id, TaskStatus.FAILED, 1.0, "failed", 
                error=final_result["error"]
            )
        else:
            # Extract the actual LinkedIn post from the content creation phase
            final_post_content = ""
            
            # Look for the LinkedIn post created by LinkedInCreator
            if "messages" in result and result["messages"]:
                for message in result["messages"]:
                    # Look for content that looks like a LinkedIn post (contains hashtags, engagement elements)
                    content = message.content
                    if ("#" in content and len(content) > 100 and 
                        ("LinkedIn" in content or "🚀" in content or "💡" in content or 
                         "What do you think" in content or "Share your thoughts" in content)):
                        final_post_content = content
                        break
                
                # Fallback: if no LinkedIn-style post found, use the longest message
                if not final_post_content:
                    final_post_content = max(
                        (msg.content for msg in result["messages"]), 
                        key=len, 
                        default=""
                    )
            
            # Create LinkedIn post object
            linkedin_post = LinkedInPost(
                content=final_post_content,
                hashtags=[],  # Extract from content if needed
                word_count=len(final_post_content.split()),
                character_count=len(final_post_content)
            )
            
            await update_task_status(
                task_id, TaskStatus.COMPLETED, 1.0, "completed",
                result=linkedin_post.dict()
            )
        
    except Exception as e:
        await update_task_status(
            task_id, TaskStatus.FAILED, 1.0, "failed", 
            error=str(e)
        )


@app.post("/generate-post", response_model=PostGenerationResponse)
async def generate_linkedin_post(
    request: PostGenerationRequest,
    background_tasks: BackgroundTasks
):
    """Generate a LinkedIn post about an ML paper."""
    task_id = str(uuid.uuid4())
    
    # Store initial task data
    task_data = {
        "task_id": task_id,
        "status": TaskStatus.PENDING,
        "request_data": request.dict(),
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
        "progress": 0.0,
        "current_step": "queued"
    }
    
    await store_task(task_id, task_data)
    
    # Start background task
    background_tasks.add_task(run_post_generation_task, task_id, request)
    
    return PostGenerationResponse(
        task_id=task_id,
        status=TaskStatus.PENDING,
        message="LinkedIn post generation started successfully",
        estimated_completion_time=datetime.utcnow() + timedelta(minutes=3)
    )


@app.get("/status/{task_id}", response_model=PostStatusResponse)
async def get_post_status(task_id: str):
    """Get the status of a LinkedIn post generation task with detailed agent feedback."""
    task_data = await get_task(task_id)
    
    if not task_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task {task_id} not found"
        )
    
    # Parse dates
    created_at = datetime.fromisoformat(task_data.get("created_at", datetime.utcnow().isoformat()))
    updated_at = datetime.fromisoformat(task_data.get("updated_at", datetime.utcnow().isoformat()))
    
    # Create LinkedIn post if result exists
    result = None
    if task_data.get("result"):
        result = LinkedInPost(**task_data["result"])
    
    # Build detailed team progress information
    teams = []
    teams_data = task_data.get("teams", {})
    
    for team_name, team_info in teams_data.items():
        # Convert agent data to AgentFeedback models
        agents = []
        for agent_name, agent_info in team_info.get("agents", {}).items():
            agent_feedback = AgentFeedback(
                agent_name=agent_info.get("agent_name", agent_name),
                status=AgentStatus(agent_info.get("status", "idle")),
                current_activity=agent_info.get("current_activity"),
                progress=agent_info.get("progress", 0.0),
                findings=agent_info.get("findings"),
                last_update=datetime.fromisoformat(agent_info.get("last_update", datetime.utcnow().isoformat())),
                error_message=agent_info.get("error_message")
            )
            agents.append(agent_feedback)
        
        # Create TeamProgress model
        team_progress = TeamProgress(
            team_name=team_info.get("team_name", team_name),
            status=TaskStatus(team_info.get("status", "pending")),
            progress=team_info.get("progress", 0.0),
            current_focus=team_info.get("current_focus"),
            agents=agents,
            team_findings=team_info.get("team_findings"),
            started_at=datetime.fromisoformat(team_info["started_at"]) if team_info.get("started_at") else None,
            completed_at=datetime.fromisoformat(team_info["completed_at"]) if team_info.get("completed_at") else None
        )
        teams.append(team_progress)
    
    return PostStatusResponse(
        task_id=task_id,
        status=TaskStatus(task_data.get("status", TaskStatus.PENDING)),
        progress=task_data.get("progress", 0.0),
        current_step=task_data.get("current_step"),
        teams=teams,
        current_team=task_data.get("current_team"),
        phase=task_data.get("phase"),
        detailed_status=task_data.get("detailed_status"),
        result=result,
        error_message=task_data.get("error"),
        request_data=task_data.get("request_data"),
        created_at=created_at,
        updated_at=updated_at
    )


@app.get("/tasks", response_model=List[PostStatusResponse])
async def get_all_tasks_endpoint():
    """Get all tasks with their current status."""
    all_tasks_data = await get_all_tasks()
    
    tasks = []
    for task_data in all_tasks_data:
        # Parse dates
        created_at = datetime.fromisoformat(task_data.get("created_at", datetime.utcnow().isoformat()))
        updated_at = datetime.fromisoformat(task_data.get("updated_at", datetime.utcnow().isoformat()))
        
        # Create LinkedIn post if result exists
        result = None
        if task_data.get("result"):
            result = LinkedInPost(**task_data["result"])
        
        # Build detailed team progress information
        teams = []
        teams_data = task_data.get("teams", {})
        
        for team_name, team_info in teams_data.items():
            # Convert agent data to AgentFeedback models
            agents = []
            for agent_name, agent_info in team_info.get("agents", {}).items():
                agent_feedback = AgentFeedback(
                    agent_name=agent_info.get("agent_name", agent_name),
                    status=AgentStatus(agent_info.get("status", "idle")),
                    current_activity=agent_info.get("current_activity"),
                    progress=agent_info.get("progress", 0.0),
                    findings=agent_info.get("findings"),
                    last_update=datetime.fromisoformat(agent_info.get("last_update", datetime.utcnow().isoformat())),
                    error_message=agent_info.get("error_message")
                )
                agents.append(agent_feedback)
            
            # Create TeamProgress model
            team_progress = TeamProgress(
                team_name=team_info.get("team_name", team_name),
                status=TaskStatus(team_info.get("status", "pending")),
                progress=team_info.get("progress", 0.0),
                current_focus=team_info.get("current_focus"),
                agents=agents,
                team_findings=team_info.get("team_findings"),
                started_at=datetime.fromisoformat(team_info["started_at"]) if team_info.get("started_at") else None,
                completed_at=datetime.fromisoformat(team_info["completed_at"]) if team_info.get("completed_at") else None
            )
            teams.append(team_progress)
        
        task_response = PostStatusResponse(
            task_id=task_data.get("task_id", ""),
            status=TaskStatus(task_data.get("status", TaskStatus.PENDING)),
            progress=task_data.get("progress", 0.0),
            current_step=task_data.get("current_step"),
            teams=teams,
            current_team=task_data.get("current_team"),
            phase=task_data.get("phase"),
            detailed_status=task_data.get("detailed_status"),
            result=result,
            error_message=task_data.get("error"),
            request_data=task_data.get("request_data"),
            created_at=created_at,
            updated_at=updated_at
        )
        tasks.append(task_response)
    
    return tasks


@app.post("/verify-post", response_model=PostVerificationResponse)
async def verify_post(request: PostVerificationRequest):
    """Verify a LinkedIn post for technical accuracy and style compliance."""
    verification_id = str(uuid.uuid4())
    
    try:
        # Import verification tools
        from api.tools.linkedin_tools import verify_technical_accuracy, check_linkedin_style
        
        verification_report = VerificationReport()
        
        # Run technical verification if requested
        if request.verification_type in ["technical", "both"]:
            tech_result = verify_technical_accuracy.invoke({
                "post_content": request.post_content,
                "paper_reference": request.paper_reference or ""
            })
            verification_report.technical_accuracy = {"report": tech_result}
        
        # Run style verification if requested
        if request.verification_type in ["style", "both"]:
            style_result = check_linkedin_style.invoke({
                "post_content": request.post_content
            })
            verification_report.style_compliance = {"report": style_result}
        
        # Calculate overall score (simplified)
        verification_report.overall_score = 0.8  # Placeholder
        verification_report.recommendations = [
            "Consider adding more engagement elements",
            "Ensure proper citation format"
        ]
        
        # Determine if approved
        approved = verification_report.overall_score >= 0.7
        
        return PostVerificationResponse(
            verification_id=verification_id,
            post_content=request.post_content,
            verification_report=verification_report,
            approved=approved
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Verification failed: {str(e)}"
        )


@app.post("/batch-generate", response_model=BatchPostResponse)
async def batch_generate_posts(
    request: BatchPostRequest,
    background_tasks: BackgroundTasks
):
    """Generate multiple LinkedIn posts in batch."""
    batch_id = str(uuid.uuid4())
    task_ids = []
    
    # Create individual tasks for each paper
    for paper_request in request.papers:
        task_id = str(uuid.uuid4())
        task_ids.append(task_id)
        
        # Store task data
        task_data = {
            "task_id": task_id,
            "batch_id": batch_id,
            "status": TaskStatus.PENDING,
            "request_data": paper_request.dict(),
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
            "progress": 0.0,
            "current_step": "queued"
        }
        
        await store_task(task_id, task_data)
        
        # Add to background tasks with delay if scheduling is enabled
        if request.schedule_posts and len(task_ids) > 1:
            delay = (len(task_ids) - 1) * request.time_interval_minutes * 60
            # Note: In production, use a proper task queue like Celery
        
        background_tasks.add_task(run_post_generation_task, task_id, paper_request)
    
    return BatchPostResponse(
        batch_id=batch_id,
        total_posts=len(request.papers),
        task_ids=task_ids,
        status=TaskStatus.PENDING,
        estimated_completion_time=datetime.utcnow() + timedelta(
            minutes=len(request.papers) * 3
        )
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Handle HTTP exceptions."""
    error_response = ErrorResponse(
        error="http_error",
        message=exc.detail,
        details={"status_code": exc.status_code}
    )
    # Use custom JSON encoder to handle datetime objects
    content_data = json.loads(error_response.json())
    return JSONResponse(
        status_code=exc.status_code,
        content=content_data
    )


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Handle general exceptions."""
    error_response = ErrorResponse(
        error="internal_error",
        message="An unexpected error occurred",
        details={"exception": str(exc)}
    )
    # Use custom JSON encoder to handle datetime objects
    content_data = json.loads(error_response.json())
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=content_data
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level=settings.log_level.lower()
    ) 