"""
NavTools - 核心配置模块
"""
from functools import lru_cache
from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import validator


class Settings(BaseSettings):
    """应用配置"""
    
    # 应用信息
    APP_NAME: str = "NavTools"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # 数据库
    DATABASE_URL: str = "sqlite:///./navtools.db"
    
    # JWT 配置
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ALGORITHM: str = "HS256"
    
    # 默认管理员
    DEFAULT_ADMIN_USERNAME: str = "admin"
    DEFAULT_ADMIN_PASSWORD: str = "Admin@123"
    DEFAULT_ADMIN_EMAIL: str = "admin@navtools.tools"
    
    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:5173"
    
    # 日志
    LOG_LEVEL: str = "INFO"
    
    @validator("ALLOWED_ORIGINS")
    def parse_allowed_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v
    
    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """获取配置实例 (缓存)"""
    return Settings()
