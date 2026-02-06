"""
NavTools - 数据库配置 (支持 SQLite / MySQL / PostgreSQL / Supabase)
"""
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy.pool import StaticPool, NullPool

from app.core.config import get_settings

settings = get_settings()

def get_engine():
    """创建数据库引擎"""
    db_url = settings.DATABASE_URL
    
    # Supabase PostgreSQL 支持
    if 'supabase' in db_url or db_url.startswith('postgresql://'):
        # 转换为异步 URL
        if db_url.startswith('postgresql://'):
            db_url = db_url.replace('postgresql://', 'postgresql+asyncpg://', 1)
        elif db_url.startswith('postgres://'):
            db_url = db_url.replace('postgres://', 'postgresql+asyncpg://', 1)
        
        return create_async_engine(
            db_url,
            echo=settings.DEBUG,
            pool_pre_ping=True,
            pool_size=5,
            max_overflow=10,
            pool_recycle=3600,
        )
    
    # SQLite 配置
    elif db_url.startswith("sqlite"):
        return create_async_engine(
            db_url.replace("sqlite:///", "sqlite+aiosqlite:///"),
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
            echo=settings.DEBUG
        )
    
    # MySQL / 其他
    else:
        return create_async_engine(
            db_url,
            echo=settings.DEBUG,
            pool_pre_ping=True,
            pool_size=5,
            max_overflow=10,
        )

# 创建引擎
engine = get_engine()

# 异步会话工厂
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

# 声明基类
Base = declarative_base()


async def get_db():
    """获取数据库会话 (依赖注入用)"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db():
    """初始化数据库 (创建表)"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
