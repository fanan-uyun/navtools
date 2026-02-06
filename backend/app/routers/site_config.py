"""
NavTools - 网站配置路由
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app import schemas
from app.models import SiteConfig
from app.deps import get_current_admin
from app.core.exceptions import NotFoundException

router = APIRouter(prefix="/admin/site-config", tags=["网站配置"])


@router.get("", response_model=schemas.SiteConfigResponse)
async def get_site_config(
    db: AsyncSession = Depends(get_db),
    current_admin: schemas.AdminUserProfile = Depends(get_current_admin)
):
    """获取网站配置"""
    result = await db.execute(select(SiteConfig).limit(1))
    config = result.scalar_one_or_none()
    
    if not config:
        raise NotFoundException("网站配置不存在")
    
    return config


@router.put("", response_model=schemas.SiteConfigResponse)
async def update_site_config(
    config_data: schemas.SiteConfigUpdate,
    db: AsyncSession = Depends(get_db),
    current_admin: schemas.AdminUserProfile = Depends(get_current_admin)
):
    """更新网站配置"""
    result = await db.execute(select(SiteConfig).limit(1))
    config = result.scalar_one_or_none()
    
    if not config:
        raise NotFoundException("网站配置不存在")
    
    # 更新字段
    for field, value in config_data.model_dump(exclude_unset=True).items():
        setattr(config, field, value)
    
    await db.commit()
    await db.refresh(config)
    
    return config
