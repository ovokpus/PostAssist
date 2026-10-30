import os
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # API Configuration
    app_name: str = "PostAssist"
    app_version: str = "1.0.0"
    debug: bool = False
    host: str = "0.0.0.0"
    port: int = int(os.environ.get("PORT", 8000))  # Railway sets PORT env var
    
    # Railway Environment Detection
    railway_environment: Optional[str] = os.environ.get("RAILWAY_ENVIRONMENT")
    is_railway_deployment: bool = railway_environment is not None
    
    # OpenAI Configuration
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"
    openai_temperature: float = 0.7
    
    # Tavily Configuration  
    tavily_api_key: str = ""
    
    # Redis Configuration (for task queue)
    redis_url: str = "redis://localhost:6379"
    redis_task_ttl: int = 7200  # 2 hours default (in seconds)
    redis_max_memory: str = "256mb"  # Maximum memory for Redis
    redis_max_memory_policy: str = "allkeys-lru"  # Eviction policy
    
    # Rate Limiting
    rate_limit_requests: int = 100
    rate_limit_window: int = 3600  # 1 hour
    
    # Concurrency Control
    max_concurrent_generations: int = 3  # Max simultaneous post generations
    max_concurrent_verifications: int = 5  # Max simultaneous verifications
    verification_timeout: int = 120  # Verification timeout in seconds
    
    # File Storage
    working_directory: str = "./content/data"
    max_file_size: int = 10_000_000  # 10MB
    
    # LangGraph Configuration
    recursion_limit: int = 50
    max_tokens: int = 4000
    
    # Logging
    log_level: str = "INFO"
    log_file: str = "app.log"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"  # Ignore extra environment variables


# Global settings instance
settings = Settings()


def get_settings() -> Settings:
    """Get the current settings instance."""
    return settings


def missing_api_keys() -> list:
    """Names of the model/search keys that are not configured."""
    return [name for name, value in (("OPENAI_API_KEY", settings.openai_api_key),
                                     ("TAVILY_API_KEY", settings.tavily_api_key)) if not value]


def validate_api_keys(strict: bool = False):
    """Check the required API keys. Raises when strict; otherwise warns so the UI and /health
    still run locally without keys (generation then fails with a clear error)."""
    missing = missing_api_keys()
    if missing and strict:
        raise ValueError(f"{', '.join(missing)} environment variable(s) required")
    if missing:
        print(f"⚠️  {', '.join(missing)} not set: post generation and verification will not work")


# Set environment variables for LangChain
os.environ["OPENAI_API_KEY"] = settings.openai_api_key
os.environ["TAVILY_API_KEY"] = settings.tavily_api_key 