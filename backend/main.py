"""
NavTools - FastAPI 应用入口
"""
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import get_settings
from app.core.exceptions import (
    BusinessException, NotFoundException, 
    UnauthorizedException, ForbiddenException,
    business_exception_handler, integrity_error_handler
)
from app.database import init_db
from app.routers import (
    auth, admin, tools, categories, 
    site_config, icons, audit_log, public
)
from devtools import devtools_router

# 配置日志
logging.basicConfig(
    level=getattr(logging, get_settings().LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


async def init_default_data():
    """初始化默认数据"""
    from sqlalchemy.ext.asyncio import AsyncSession
    from app.database import AsyncSessionLocal
    from app.models import AdminUser, SiteConfig, Category
    from app.core.security import get_password_hash
    from sqlalchemy import select
    
    async with AsyncSessionLocal() as db:
        # 检查是否已存在管理员
        result = await db.execute(select(AdminUser).limit(1))
        if not result.scalar_one_or_none():
            # 创建默认管理员
            settings = get_settings()
            admin = AdminUser(
                username=settings.DEFAULT_ADMIN_USERNAME,
                email=settings.DEFAULT_ADMIN_EMAIL,
                hashed_password=get_password_hash(settings.DEFAULT_ADMIN_PASSWORD),
                is_superuser=True,
                is_active=True
            )
            db.add(admin)
            logger.info(f"创建默认管理员: {settings.DEFAULT_ADMIN_USERNAME}")
        
        # 检查是否已存在网站配置
        result = await db.execute(select(SiteConfig).limit(1))
        if not result.scalar_one_or_none():
            # 创建默认网站配置
            config = SiteConfig(
                site_name="NavTools",
                site_description="实用工具集合网站",
                site_keywords="工具,实用工具,在线工具,开发工具"
            )
            db.add(config)
            logger.info("创建默认网站配置")
        
        await db.commit()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    # 启动时
    logger.info("正在初始化数据库...")
    await init_db()
    await init_default_data()
    logger.info("数据库初始化完成")
    
    yield
    
    # 关闭时
    logger.info("应用关闭")


# 创建 FastAPI 应用
app = FastAPI(
    title=get_settings().APP_NAME,
    version=get_settings().APP_VERSION,
    description="NavTools - 实用工具集合平台 API",
    docs_url="/docs" if get_settings().DEBUG else None,
    redoc_url="/redoc" if get_settings().DEBUG else None,
    lifespan=lifespan
)

# CORS 配置
settings = get_settings()
origins = settings.ALLOWED_ORIGINS if isinstance(settings.ALLOWED_ORIGINS, list) else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册异常处理器
app.add_exception_handler(BusinessException, business_exception_handler)
app.add_exception_handler(NotFoundException, business_exception_handler)
app.add_exception_handler(UnauthorizedException, business_exception_handler)
app.add_exception_handler(ForbiddenException, business_exception_handler)


# 健康检查
@app.get("/health")
async def health_check():
    """健康检查接口"""
    return {"status": "ok", "version": get_settings().APP_VERSION}


# 注册路由
app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(tools.router)
app.include_router(categories.router)
app.include_router(site_config.router)
app.include_router(icons.router)
app.include_router(audit_log.router)
app.include_router(public.router)
app.include_router(devtools_router)


# Vercel Serverless Handler
# 用于 Vercel 无服务器部署
import sys

# 确保当前目录在路径中 (Vercel 需要)
if "." not in sys.path:
    sys.path.insert(0, ".")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=get_settings().DEBUG)
