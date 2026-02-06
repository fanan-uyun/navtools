"""
NavTools - 审计日志路由
"""
from typing import Optional
from datetime import datetime
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc

from app.database import get_db
from app import schemas
from app.models import AuditLog, AdminUser
from app.deps import get_current_admin, get_current_superuser

router = APIRouter(prefix="/admin/audit-logs", tags=["审计日志"])


@router.get("", response_model=schemas.ListResponse)
async def list_audit_logs(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    admin_id: Optional[int] = None,
    action: Optional[str] = None,
    target_type: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: AsyncSession = Depends(get_db),
    current_admin: schemas.AdminUserProfile = Depends(get_current_superuser)
):
    """获取审计日志列表 (仅超级管理员)"""
    query = select(AuditLog, AdminUser.username).join(
        AdminUser, AuditLog.admin_id == AdminUser.id, isouter=True
    )
    
    if admin_id:
        query = query.where(AuditLog.admin_id == admin_id)
    
    if action:
        query = query.where(AuditLog.action == action)
    
    if target_type:
        query = query.where(AuditLog.target_type == target_type)
    
    if start_date:
        query = query.where(AuditLog.created_at >= start_date)
    
    if end_date:
        query = query.where(AuditLog.created_at <= end_date)
    
    # 统计总数
    count_result = await db.execute(select(func.count()).select_from(query.subquery()))
    total = count_result.scalar()
    
    # 分页和排序
    query = query.order_by(desc(AuditLog.created_at))
    query = query.offset((page - 1) * page_size).limit(page_size)
    
    result = await db.execute(query)
    rows = result.all()
    
    items = []
    for log, username in rows:
        log_dict = schemas.AuditLogResponse.model_validate(log).model_dump()
        log_dict['admin_username'] = username
        items.append(log_dict)
    
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


@router.get("/actions")
async def get_action_types(
    db: AsyncSession = Depends(get_db),
    current_admin: schemas.AdminUserProfile = Depends(get_current_superuser)
):
    """获取操作类型列表"""
    result = await db.execute(select(AuditLog.action).distinct())
    actions = [a for a in result.scalars().all() if a]
    return {"code": 200, "message": "success", "data": actions}


@router.get("/target-types")
async def get_target_types(
    db: AsyncSession = Depends(get_db),
    current_admin: schemas.AdminUserProfile = Depends(get_current_superuser)
):
    """获取目标类型列表"""
    result = await db.execute(select(AuditLog.target_type).distinct())
    types = [t for t in result.scalars().all() if t]
    return {"code": 200, "message": "success", "data": types}
