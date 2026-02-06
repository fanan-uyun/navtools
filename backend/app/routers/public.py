"""
NavTools - 公开接口路由 (无需认证)
"""
import json
from typing import Optional
from fastapi import APIRouter, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from fastapi import Depends

from app.database import get_db
from app import schemas
from app.models import Tool, Category, SiteConfig

router = APIRouter(prefix="/api", tags=["公开接口"])


@router.get("/site-config")
async def get_public_site_config(db: AsyncSession = Depends(get_db)):
    """获取网站配置 (公开)"""
    result = await db.execute(select(SiteConfig).limit(1))
    config = result.scalar_one_or_none()
    
    if not config:
        return {
            "code": 200,
            "data": {
                "site_name": "NavTools",
                "site_description": "实用工具集合",
                "site_keywords": "工具,实用工具,在线工具",
                "theme_enabled": True
            }
        }
    
    return {
        "code": 200,
        "data": {
            "site_name": config.site_name,
            "site_description": config.site_description,
            "site_keywords": config.site_keywords,
            "icp_beian": config.icp_beian,
            "gongan_beian": config.gongan_beian,
            "contact_email": config.contact_email,
            "theme_enabled": config.theme_enabled,
            "logo_url": config.logo_url,
            "favicon_url": config.favicon_url,
            "footer_text": config.footer_text
        }
    }


@router.get("/categories")
async def get_public_categories(db: AsyncSession = Depends(get_db)):
    """获取分类列表 (公开)"""
    result = await db.execute(
        select(Category).where(Category.is_active == True)
        .order_by(Category.sort_order.asc())
    )
    categories = result.scalars().all()
    
    # 计算每个分类的工具数量
    items = []
    for cat in categories:
        count_result = await db.execute(
            select(func.count()).where(
                (Tool.category_id == cat.id) & (Tool.is_active == True)
            )
        )
        tool_count = count_result.scalar()
        
        items.append({
            "id": cat.id,
            "name": cat.name,
            "slug": cat.slug,
            "description": cat.description,
            "icon": cat.icon,
            "color": cat.color,
            "tool_count": tool_count
        })
    
    return {"code": 200, "message": "success", "data": items}


@router.get("/tools")
async def get_public_tools(
    category: Optional[str] = None,
    search: Optional[str] = None,
    featured: Optional[bool] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """获取工具列表 (公开)"""
    query = select(Tool, Category).join(Category).where(Tool.is_active == True)
    
    if category:
        query = query.where(Category.slug == category)
    
    if featured is not None:
        query = query.where(Tool.is_featured == featured)
    
    if search:
        query = query.where(
            (Tool.name.contains(search)) | 
            (Tool.short_description.contains(search)) |
            (Tool.tags.contains(search))
        )
    
    # 统计总数
    count_result = await db.execute(select(func.count()).select_from(query.subquery()))
    total = count_result.scalar()
    
    # 分页和排序
    query = query.order_by(Tool.sort_order.asc(), desc(Tool.created_at))
    query = query.offset((page - 1) * page_size).limit(page_size)
    
    result = await db.execute(query)
    rows = result.all()
    
    items = []
    for tool, category in rows:
        item = {
            "id": tool.id,
            "name": tool.name,
            "slug": tool.slug,
            "short_description": tool.short_description,
            "icon": tool.icon,
            "url": tool.url,
            "is_featured": tool.is_featured,
            "is_self_developed": tool.is_self_developed,
            "api_endpoint": tool.api_endpoint,
            "view_count": tool.view_count,
            "tags": json.loads(tool.tags) if tool.tags else [],
            "category": {
                "id": category.id,
                "name": category.name,
                "slug": category.slug,
                "icon": category.icon,
                "color": category.color
            }
        }
        items.append(item)
    
    return {
        "code": 200,
        "message": "success",
        "data": {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size
        }
    }


@router.get("/tools/{tool_slug}")
async def get_public_tool(tool_slug: str, db: AsyncSession = Depends(get_db)):
    """获取工具详情 (公开)"""
    result = await db.execute(
        select(Tool, Category).join(Category).where(
            (Tool.slug == tool_slug) & (Tool.is_active == True)
        )
    )
    row = result.first()
    
    if not row:
        return {"code": 404, "message": "工具不存在", "data": None}
    
    tool, category = row
    
    # 增加浏览次数
    tool.view_count += 1
    await db.commit()
    
    return {
        "code": 200,
        "message": "success",
        "data": {
            "id": tool.id,
            "name": tool.name,
            "slug": tool.slug,
            "short_description": tool.short_description,
            "description": tool.description,
            "icon": tool.icon,
            "url": tool.url,
            "is_featured": tool.is_featured,
            "is_self_developed": tool.is_self_developed,
            "api_endpoint": tool.api_endpoint,
            "view_count": tool.view_count,
            "tags": json.loads(tool.tags) if tool.tags else [],
            "category": {
                "id": category.id,
                "name": category.name,
                "slug": category.slug,
                "icon": category.icon,
                "color": category.color
            }
        }
    }


@router.get("/home")
async def get_home_page_data(db: AsyncSession = Depends(get_db)):
    """获取首页数据 (公开)"""
    # 网站配置
    result = await db.execute(select(SiteConfig).limit(1))
    config = result.scalar_one_or_none()
    
    site_config = {
        "site_name": config.site_name if config else "NavTools",
        "site_description": config.site_description if config else "实用工具集合",
        "theme_enabled": config.theme_enabled if config else True
    }
    
    # 分类
    result = await db.execute(
        select(Category).where(Category.is_active == True)
        .order_by(Category.sort_order.asc())
    )
    categories = result.scalars().all()
    
    categories_data = []
    for cat in categories:
        count_result = await db.execute(
            select(func.count()).where(
                (Tool.category_id == cat.id) & (Tool.is_active == True)
            )
        )
        categories_data.append({
            "id": cat.id,
            "name": cat.name,
            "slug": cat.slug,
            "icon": cat.icon,
            "color": cat.color,
            "tool_count": count_result.scalar()
        })
    
    # 精选工具
    result = await db.execute(
        select(Tool, Category).join(Category).where(
            (Tool.is_featured == True) & (Tool.is_active == True)
        ).order_by(Tool.sort_order.asc()).limit(10)
    )
    featured_tools = []
    for tool, cat in result.all():
        featured_tools.append({
            "id": tool.id,
            "name": tool.name,
            "slug": tool.slug,
            "short_description": tool.short_description,
            "icon": tool.icon,
            "is_self_developed": tool.is_self_developed,
            "api_endpoint": tool.api_endpoint,
            "category": {
                "name": cat.name,
                "slug": cat.slug,
                "color": cat.color
            }
        })
    
    # 最近添加的工具
    result = await db.execute(
        select(Tool, Category).join(Category).where(
            Tool.is_active == True
        ).order_by(desc(Tool.created_at)).limit(12)
    )
    recent_tools = []
    for tool, cat in result.all():
        recent_tools.append({
            "id": tool.id,
            "name": tool.name,
            "slug": tool.slug,
            "short_description": tool.short_description,
            "icon": tool.icon,
            "is_self_developed": tool.is_self_developed,
            "category": {
                "name": cat.name,
                "slug": cat.slug,
                "color": cat.color
            }
        })
    
    return {
        "code": 200,
        "message": "success",
        "data": {
            "site_config": site_config,
            "categories": categories_data,
            "featured_tools": featured_tools,
            "recent_tools": recent_tools
        }
    }


@router.post("/tools/{tool_id}/view")
async def record_tool_view(tool_id: int, db: AsyncSession = Depends(get_db)):
    """记录工具访问 (公开)"""
    result = await db.execute(select(Tool).where(Tool.id == tool_id))
    tool = result.scalar_one_or_none()
    
    if tool:
        tool.view_count += 1
        await db.commit()
    
    return {"code": 200, "message": "success"}
