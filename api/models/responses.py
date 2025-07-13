from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum


class TaskStatus(str, Enum):
    """Enumeration for task status values."""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class AgentStatus(str, Enum):
    """Enumeration for individual agent status values."""
    IDLE = "idle"
    WORKING = "working"
    COMPLETED = "completed"
    ERROR = "error"


class AgentFeedback(BaseModel):
    """Model for individual agent feedback."""
    
    agent_name: str = Field(
        description="Name of the agent",
        examples=["PaperResearcher", "LinkedInCreator", "TechVerifier", "StyleChecker"]
    )
    
    status: AgentStatus = Field(
        description="Current status of the agent"
    )
    
    current_activity: Optional[str] = Field(
        default=None,
        description="What the agent is currently doing",
        examples=["Searching for paper information", "Creating engaging content", "Verifying technical claims"]
    )
    
    progress: float = Field(
        description="Agent's progress (0.0 to 1.0)",
        ge=0.0,
        le=1.0,
        default=0.0
    )
    
    findings: Optional[str] = Field(
        default=None,
        description="Key findings or outputs from the agent"
    )
    
    last_update: datetime = Field(
        default_factory=datetime.utcnow,
        description="When this agent was last updated"
    )
    
    error_message: Optional[str] = Field(
        default=None,
        description="Error message if agent failed"
    )


class TeamProgress(BaseModel):
    """Model for team-level progress tracking."""
    
    team_name: str = Field(
        description="Name of the team",
        examples=["Content team", "Verification team"]
    )
    
    status: TaskStatus = Field(
        description="Overall team status"
    )
    
    progress: float = Field(
        description="Team's overall progress (0.0 to 1.0)",
        ge=0.0,
        le=1.0,
        default=0.0
    )
    
    current_focus: Optional[str] = Field(
        default=None,
        description="What the team is currently focused on",
        examples=["Researching ML paper methodology", "Verifying technical accuracy"]
    )
    
    agents: List[AgentFeedback] = Field(
        default=[],
        description="Individual agent feedback within the team"
    )
    
    team_findings: Optional[str] = Field(
        default=None,
        description="Key outputs or findings from the team"
    )
    
    started_at: Optional[datetime] = Field(
        default=None,
        description="When the team started working"
    )
    
    completed_at: Optional[datetime] = Field(
        default=None,
        description="When the team completed their work"
    )


class PostGenerationResponse(BaseModel):
    """Response model for post generation requests."""
    
    task_id: str = Field(
        description="Unique task identifier for tracking the request",
        examples=["123e4567-e89b-12d3-a456-426614174000"]
    )
    
    status: TaskStatus = Field(
        description="Current status of the post generation task"
    )
    
    message: str = Field(
        description="Human-readable status message",
        examples=["LinkedIn post generation started successfully"]
    )
    
    estimated_completion_time: Optional[datetime] = Field(
        default=None,
        description="Estimated time when the task will be completed"
    )


class LinkedInPost(BaseModel):
    """Model representing a generated LinkedIn post."""
    
    content: str = Field(
        description="The generated LinkedIn post content",
        max_length=3000
    )
    
    hashtags: List[str] = Field(
        default=[],
        description="List of hashtags included in the post",
        max_length=20
    )
    
    engagement_score: Optional[float] = Field(
        default=None,
        description="Predicted engagement score (0.0 to 1.0)",
        ge=0.0,
        le=1.0
    )
    
    word_count: int = Field(
        description="Number of words in the post content",
        ge=0
    )
    
    character_count: int = Field(
        description="Number of characters in the post content",
        ge=0
    )


class VerificationReport(BaseModel):
    """Model for post verification reports."""
    
    technical_accuracy: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Technical accuracy verification results"
    )
    
    style_compliance: Optional[Dict[str, Any]] = Field(
        default=None,
        description="LinkedIn style compliance results"
    )
    
    overall_score: Optional[float] = Field(
        default=None,
        description="Overall quality score (0.0 to 1.0)",
        ge=0.0,
        le=1.0
    )
    
    recommendations: List[str] = Field(
        default=[],
        description="List of improvement recommendations"
    )
    
    verified_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Timestamp when verification was completed"
    )


class PostStatusResponse(BaseModel):
    """Response model for post status requests."""
    
    task_id: str = Field(
        description="Task identifier"
    )
    
    status: TaskStatus = Field(
        description="Current task status"
    )
    
    progress: float = Field(
        description="Task completion progress (0.0 to 1.0)",
        ge=0.0,
        le=1.0
    )
    
    current_step: Optional[str] = Field(
        default=None,
        description="Current processing step",
        examples=["researching_paper", "creating_post", "verifying_content"]
    )
    
    # New detailed agent feedback
    teams: List[TeamProgress] = Field(
        default=[],
        description="Detailed progress from each agent team"
    )
    
    current_team: Optional[str] = Field(
        default=None,
        description="Which team is currently active",
        examples=["Content team", "Verification team"]
    )
    
    phase: Optional[str] = Field(
        default=None,
        description="Current phase of the workflow",
        examples=["research", "content_creation", "verification", "completion"]
    )
    
    detailed_status: Optional[str] = Field(
        default=None,
        description="Detailed status message from the active agent",
        examples=["PaperResearcher is analyzing methodology section", "LinkedInCreator is crafting engaging content"]
    )
    
    result: Optional[LinkedInPost] = Field(
        default=None,
        description="Generated LinkedIn post (if completed)"
    )
    
    verification: Optional[VerificationReport] = Field(
        default=None,
        description="Verification report (if completed)"
    )
    
    error_message: Optional[str] = Field(
        default=None,
        description="Error message (if failed)"
    )
    
    request_data: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Original request data for this task"
    )
    
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Task creation timestamp"
    )
    
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Last update timestamp"
    )


class PostVerificationResponse(BaseModel):
    """Response model for post verification requests."""
    
    verification_id: str = Field(
        description="Unique verification identifier"
    )
    
    post_content: str = Field(
        description="The content that was verified"
    )
    
    verification_report: VerificationReport = Field(
        description="Detailed verification results"
    )
    
    approved: bool = Field(
        description="Whether the post passed verification"
    )


class BatchPostResponse(BaseModel):
    """Response model for batch post generation requests."""
    
    batch_id: str = Field(
        description="Unique batch identifier"
    )
    
    total_posts: int = Field(
        description="Total number of posts in the batch",
        ge=1
    )
    
    task_ids: List[str] = Field(
        description="List of individual task IDs for each post"
    )
    
    status: TaskStatus = Field(
        description="Overall batch status"
    )
    
    estimated_completion_time: Optional[datetime] = Field(
        default=None,
        description="Estimated completion time for the entire batch"
    )


class HealthCheckResponse(BaseModel):
    """Response model for health check endpoint."""
    
    status: str = Field(
        description="API health status",
        examples=["healthy"]
    )
    
    version: str = Field(
        description="API version",
        examples=["1.0.0"]
    )
    
    timestamp: datetime = Field(
        default_factory=datetime.utcnow,
        description="Health check timestamp"
    )
    
    services: Dict[str, str] = Field(
        description="Status of dependent services",
        examples=[{"openai": "connected", "tavily": "connected", "redis": "connected"}]
    )


class ErrorResponse(BaseModel):
    """Response model for API errors."""
    
    error: str = Field(
        description="Error type or code",
        examples=["validation_error", "api_key_invalid", "rate_limit_exceeded"]
    )
    
    message: str = Field(
        description="Human-readable error message",
        examples=["The provided paper title is too short"]
    )
    
    details: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Additional error details"
    )
    
    timestamp: datetime = Field(
        default_factory=datetime.utcnow,
        description="Error timestamp"
    ) 