"""
NavTools - 分类管理路由
"""
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.database import get_db
from app import schemas
from app.models import Category
from app.deps import get_current_admin
from app.core.exceptions import NotFoundException, BusinessException

router = APIRouter(prefix="/admin/categories", tags=["分类管理"])


@router.get("", response_model=schemas.ListResponse)
async def list_categories(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    is_active: Optional[bool] = None,
    db: AsyncSession = Depends(get_db),
    current_admin: schemas.AdminUserProfile = Depends(get_current_admin)
):
    """获取分类列表"""
    query = select(Category)
    
    if search:
        query = query.where(Category.name.contains(search))
    
    if is_active is not None:
        query = query.where(Category.is_active == is_active)
    
    # 统计总数
    count_result = await db.execute(select(func.count()).select_from(query.subquery()))
    total = count_result.scalar()
    
    # 分页和排序
    query = query.order_by(Category.sort_order.asc(), Category.created_at.desc())
    query = query.offset((page - 1) * page_size).limit(page_size)
    
    result = await db.execute(query)
    categories = result.scalars().all()
    
    # 计算每个分类的工具数量
    from app.models import Tool
    items = []
    for cat in categories:
        count_result = await db.execute(
            select(func.count()).where(Tool.category_id == cat.id)
        )
        tool_count = count_result.scalar()
        cat_data = schemas.CategoryResponse.model_validate(cat)
        cat_data.tool_count = tool_count
        items.append(cat_data)
    
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


@router.post("", response_model=schemas.CategoryResponse)
async def create_category(
    category_data: schemas.CategoryCreate,
    db: AsyncSession = Depends(get_db),
    current_admin: schemas.AdminUserProfile = Depends(get_current_admin)
):
    """创建分类"""
    # 检查 slug 是否已存在
    result = await db.execute(
        select(Category).where(Category.slug == category_data.slug)
    )
    if result.scalar_one_or_none():
        raise BusinessException("分类标识已存在")
    
    category = Category(**category_data.model_dump())
    db.add(category)
    await db.commit()
    await db.refresh(category)
    
    return category


@router.get("/{category_id}", response_model=schemas.CategoryResponse)
async def get_category(
    category_id: int,
    db: AsyncSession = Depends(get_db),
    current_admin: schemas.AdminUserProfile = Depends(get_current_admin)
):
    """获取分类详情"""
    result = await db.execute(select(Category).where(Category.id == category_id))
    category = result.scalar_one_or_none()
    
    if not category:
        raise NotFoundException("分类不存在")
    
    return category


@router.put("/{category_id}", response_model=schemas.CategoryResponse)
async def update_category(
    category_id: int,
    category_data: schemas.CategoryUpdate,
    db: AsyncSession = Depends(get_db),
    current_admin: schemas.AdminUserProfile = Depends(get_current_admin)
):
    """更新分类"""
    result = await db.execute(select(Category).where(Category.id == category_id))
    category = result.scalar_one_or_none()
    
    if not category:
        raise NotFoundException("分类不存在")
    
    # 检查 slug 是否已存在
    if category_data.slug:
        result = await db.execute(
            select(Category).where(
                (Category.slug == category_data.slug) & 
                (Category.id != category_id)
            )
        )
        if result.scalar_one_or_none():
            raise BusinessException("分类标识已存在")
    
    # 更新字段
    for field, value in category_data.model_dump(exclude_unset=True).items():
        setattr(category, field, value)
    
    await db.commit()
    await db.refresh(category)
    
    return category


@router.delete("/{category_id}")
async def delete_category(
    category_id: int,
    db: AsyncSession = Depends(get_db),
    current_admin: schemas.AdminUserProfile = Depends(get_current_admin)
):
    """删除分类"""
    result = await db.execute(select(Category).where(Category.id == category_id))
    category = result.scalar_one_or_none()
    
    if not category:
        raise NotFoundException("分类不存在")
    
    # 检查是否有工具使用此分类
    from app.models import Tool
    result = await db.execute(
        select(func.count()).where(Tool.category_id == category_id)
    )
    tool_count = result.scalar()
    
    if tool_count > 0:
        raise BusinessException(f"该分类下还有 {tool_count} 个工具，无法删除")
    
    await db.delete(category)
    await db.commit()
    
    return {"code": 200, "message": "删除成功"}
