"""
NavTools - 工具管理路由
"""
import json
from typing import Optional, List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc

from app.database import get_db
from app import schemas
from app.models import Tool, Category
from app.deps import get_current_admin
from app.core.exceptions import NotFoundException, BusinessException

router = APIRouter(prefix="/admin/tools", tags=["工具管理"])


@router.get("", response_model=schemas.ListResponse)
async def list_tools(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    category_id: Optional[int] = None,
    is_active: Optional[bool] = None,
    is_featured: Optional[bool] = None,
    db: AsyncSession = Depends(get_db),
    current_admin: schemas.AdminUserProfile = Depends(get_current_admin)
):
    """获取工具列表"""
    query = select(Tool).join(Category)
    
    if search:
        query = query.where(
            (Tool.name.contains(search)) | 
            (Tool.short_description.contains(search))
        )
    
    if category_id:
        query = query.where(Tool.category_id == category_id)
    
    if is_active is not None:
        query = query.where(Tool.is_active == is_active)
    
    if is_featured is not None:
        query = query.where(Tool.is_featured == is_featured)
    
    # 统计总数
    count_result = await db.execute(select(func.count()).select_from(query.subquery()))
    total = count_result.scalar()
    
    # 分页和排序
    query = query.order_by(Tool.sort_order.asc(), Tool.created_at.desc())
    query = query.offset((page - 1) * page_size).limit(page_size)
    
    result = await db.execute(query)
    tools = result.scalars().all()
    
    return {
        "code": 200,
        "message": "success",
        "data": {
            "items": [schemas.ToolResponse.model_validate(t) for t in tools],
            "total": total,
            "page": page,
            "page_size": page_size
        }
    }


@router.post("", response_model=schemas.ToolResponse)
async def create_tool(
    tool_data: schemas.ToolCreate,
    db: AsyncSession = Depends(get_db),
    current_admin: schemas.AdminUserProfile = Depends(get_current_admin)
):
    """创建工具"""
    # 检查 slug 是否已存在
    result = await db.execute(select(Tool).where(Tool.slug == tool_data.slug))
    if result.scalar_one_or_none():
        raise BusinessException("工具标识已存在")
    
    # 检查分类是否存在
    result = await db.execute(select(Category).where(Category.id == tool_data.category_id))
    if not result.scalar_one_or_none():
        raise NotFoundException("分类不存在")
    
    # 转换 tags 为 JSON 字符串
    tool_dict = tool_data.model_dump()
    if tool_dict.get('tags'):
        tool_dict['tags'] = json.dumps(tool_dict['tags'], ensure_ascii=False)
    
    tool = Tool(**tool_dict)
    db.add(tool)
    await db.commit()
    await db.refresh(tool)
    
    # 解析 tags 回列表
    if tool.tags:
        tool.tags = json.loads(tool.tags)
    
    return tool


@router.get("/{tool_id}", response_model=schemas.ToolResponse)
async def get_tool(
    tool_id: int,
    db: AsyncSession = Depends(get_db),
    current_admin: schemas.AdminUserProfile = Depends(get_current_admin)
):
    """获取工具详情"""
    result = await db.execute(
        select(Tool).where(Tool.id == tool_id)
    )
    tool = result.scalar_one_or_none()
    
    if not tool:
        raise NotFoundException("工具不存在")
    
    # 解析 tags
    if tool.tags:
        tool.tags = json.loads(tool.tags)
    
    return tool


@router.put("/{tool_id}", response_model=schemas.ToolResponse)
async def update_tool(
    tool_id: int,
    tool_data: schemas.ToolUpdate,
    db: AsyncSession = Depends(get_db),
    current_admin: schemas.AdminUserProfile = Depends(get_current_admin)
):
    """更新工具"""
    result = await db.execute(select(Tool).where(Tool.id == tool_id))
    tool = result.scalar_one_or_none()
    
    if not tool:
        raise NotFoundException("工具不存在")
    
    # 检查 slug 是否已存在
    if tool_data.slug:
        result = await db.execute(
            select(Tool).where((Tool.slug == tool_data.slug) & (Tool.id != tool_id))
        )
        if result.scalar_one_or_none():
            raise BusinessException("工具标识已存在")
    
    # 检查分类是否存在
    if tool_data.category_id:
        result = await db.execute(select(Category).where(Category.id == tool_data.category_id))
        if not result.scalar_one_or_none():
            raise NotFoundException("分类不存在")
    
    # 更新字段
    update_dict = tool_data.model_dump(exclude_unset=True)
    if 'tags' in update_dict and update_dict['tags']:
        update_dict['tags'] = json.dumps(update_dict['tags'], ensure_ascii=False)
    
    for field, value in update_dict.items():
        setattr(tool, field, value)
    
    await db.commit()
    await db.refresh(tool)
    
    # 解析 tags
    if tool.tags:
        tool.tags = json.loads(tool.tags)
    
    return tool


@router.delete("/{tool_id}")
async def delete_tool(
    tool_id: int,
    db: AsyncSession = Depends(get_db),
    current_admin: schemas.AdminUserProfile = Depends(get_current_admin)
):
    """删除工具"""
    result = await db.execute(select(Tool).where(Tool.id == tool_id))
    tool = result.scalar_one_or_none()
    
    if not tool:
        raise NotFoundException("工具不存在")
    
    await db.delete(tool)
    await db.commit()
    
    return {"code": 200, "message": "删除成功"}


@router.post("/{tool_id}/toggle-featured")
async def toggle_featured(
    tool_id: int,
    db: AsyncSession = Depends(get_db),
    current_admin: schemas.AdminUserProfile = Depends(get_current_admin)
):
    """切换精选状态"""
    result = await db.execute(select(Tool).where(Tool.id == tool_id))
    tool = result.scalar_one_or_none()
    
    if not tool:
        raise NotFoundException("工具不存在")
    
    tool.is_featured = not tool.is_featured
    await db.commit()
    
    return {
        "code": 200, 
        "message": "success",
        "data": {"is_featured": tool.is_featured}
    }


@router.post("/reorder-featured")
async def reorder_featured(
    reorder_data: schemas.ToolFeaturedReorder,
    db: AsyncSession = Depends(get_db),
    current_admin: schemas.AdminUserProfile = Depends(get_current_admin)
):
    """重新排序精选工具"""
    for index, tool_id in enumerate(reorder_data.tool_ids):
        result = await db.execute(select(Tool).where(Tool.id == tool_id))
        tool = result.scalar_one_or_none()
        if tool:
            tool.sort_order = index
    
    await db.commit()
    return {"code": 200, "message": "排序已更新"}


@router.post("/batch-delete")
async def batch_delete_tools(
    tool_ids: List[int],
    db: AsyncSession = Depends(get_db),
    current_admin: schemas.AdminUserProfile = Depends(get_current_admin)
):
    """批量删除工具"""
    for tool_id in tool_ids:
        result = await db.execute(select(Tool).where(Tool.id == tool_id))
        tool = result.scalar_one_or_none()
        if tool:
            await db.delete(tool)
    
    await db.commit()
    return {"code": 200, "message": f"已删除 {len(tool_ids)} 个工具"}


@router.post("/batch-toggle")
async def batch_toggle_tools(
    tool_ids: List[int],
    is_active: bool,
    db: AsyncSession = Depends(get_db),
    current_admin: schemas.AdminUserProfile = Depends(get_current_admin)
):
    """批量启用/禁用工具"""
    for tool_id in tool_ids:
        result = await db.execute(select(Tool).where(Tool.id == tool_id))
        tool = result.scalar_one_or_none()
        if tool:
            tool.is_active = is_active
    
    await db.commit()
    status_text = "启用" if is_active else "禁用"
    return {"code": 200, "message": f"已{status_text} {len(tool_ids)} 个工具"}
