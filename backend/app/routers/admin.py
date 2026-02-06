"""
NavTools - 管理员管理路由
"""
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.database import get_db
from app import schemas
from app.models import AdminUser
from app.core.security import get_password_hash
from app.deps import get_current_admin, get_current_superuser
from app.core.exceptions import NotFoundException, BusinessException

router = APIRouter(prefix="/admin/users", tags=["管理员管理"])


@router.get("", response_model=schemas.ListResponse)
async def list_admins(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_admin: schemas.AdminUserProfile = Depends(get_current_superuser)
):
    """获取管理员列表 (仅超级管理员)"""
    query = select(AdminUser)
    
    if search:
        query = query.where(
            (AdminUser.username.contains(search)) | 
            (AdminUser.email.contains(search))
        )
    
    # 统计总数
    count_result = await db.execute(select(func.count()).select_from(query.subquery()))
    total = count_result.scalar()
    
    # 分页
    query = query.offset((page - 1) * page_size).limit(page_size)
    query = query.order_by(AdminUser.created_at.desc())
    
    result = await db.execute(query)
    admins = result.scalars().all()
    
    return {
        "code": 200,
        "message": "success",
        "data": {
            "items": [schemas.AdminUserResponse.model_validate(a) for a in admins],
            "total": total,
            "page": page,
            "page_size": page_size
        }
    }


@router.post("", response_model=schemas.AdminUserResponse)
async def create_admin(
    admin_data: schemas.AdminUserCreate,
    db: AsyncSession = Depends(get_db),
    current_admin: schemas.AdminUserProfile = Depends(get_current_superuser)
):
    """创建管理员 (仅超级管理员)"""
    # 检查用户名是否已存在
    result = await db.execute(
        select(AdminUser).where(AdminUser.username == admin_data.username)
    )
    if result.scalar_one_or_none():
        raise BusinessException("用户名已存在")
    
    # 检查邮箱是否已存在
    result = await db.execute(
        select(AdminUser).where(AdminUser.email == admin_data.email)
    )
    if result.scalar_one_or_none():
        raise BusinessException("邮箱已存在")
    
    # 创建管理员
    admin = AdminUser(
        username=admin_data.username,
        email=admin_data.email,
        hashed_password=get_password_hash(admin_data.password),
        is_superuser=admin_data.is_superuser,
        is_active=admin_data.is_active
    )
    db.add(admin)
    await db.commit()
    await db.refresh(admin)
    
    return admin


@router.get("/{admin_id}", response_model=schemas.AdminUserResponse)
async def get_admin(
    admin_id: int,
    db: AsyncSession = Depends(get_db),
    current_admin: schemas.AdminUserProfile = Depends(get_current_superuser)
):
    """获取管理员详情 (仅超级管理员)"""
    result = await db.execute(select(AdminUser).where(AdminUser.id == admin_id))
    admin = result.scalar_one_or_none()
    
    if not admin:
        raise NotFoundException("管理员不存在")
    
    return admin


@router.put("/{admin_id}", response_model=schemas.AdminUserResponse)
async def update_admin(
    admin_id: int,
    admin_data: schemas.AdminUserUpdate,
    db: AsyncSession = Depends(get_db),
    current_admin: schemas.AdminUserProfile = Depends(get_current_superuser)
):
    """更新管理员信息 (仅超级管理员)"""
    result = await db.execute(select(AdminUser).where(AdminUser.id == admin_id))
    admin = result.scalar_one_or_none()
    
    if not admin:
        raise NotFoundException("管理员不存在")
    
    # 更新字段
    if admin_data.username:
        # 检查用户名是否已存在
        result = await db.execute(
            select(AdminUser).where(
                (AdminUser.username == admin_data.username) & 
                (AdminUser.id != admin_id)
            )
        )
        if result.scalar_one_or_none():
            raise BusinessException("用户名已存在")
        admin.username = admin_data.username
    
    if admin_data.email:
        # 检查邮箱是否已存在
        result = await db.execute(
            select(AdminUser).where(
                (AdminUser.email == admin_data.email) & 
                (AdminUser.id != admin_id)
            )
        )
        if result.scalar_one_or_none():
            raise BusinessException("邮箱已存在")
        admin.email = admin_data.email
    
    if admin_data.is_active is not None:
        # 不能禁用自己
        if admin_id == current_admin.id and not admin_data.is_active:
            raise BusinessException("不能禁用当前登录账号")
        admin.is_active = admin_data.is_active
    
    await db.commit()
    await db.refresh(admin)
    
    return admin


@router.delete("/{admin_id}")
async def delete_admin(
    admin_id: int,
    db: AsyncSession = Depends(get_db),
    current_admin: schemas.AdminUserProfile = Depends(get_current_superuser)
):
    """删除管理员 (仅超级管理员)"""
    if admin_id == current_admin.id:
        raise BusinessException("不能删除当前登录账号")
    
    result = await db.execute(select(AdminUser).where(AdminUser.id == admin_id))
    admin = result.scalar_one_or_none()
    
    if not admin:
        raise NotFoundException("管理员不存在")
    
    await db.delete(admin)
    await db.commit()
    
    return {"code": 200, "message": "删除成功"}


@router.post("/{admin_id}/reset-password")
async def reset_admin_password(
    admin_id: int,
    password_data: schemas.AdminUserResetPassword,
    db: AsyncSession = Depends(get_db),
    current_admin: schemas.AdminUserProfile = Depends(get_current_superuser)
):
    """重置管理员密码 (仅超级管理员)"""
    result = await db.execute(select(AdminUser).where(AdminUser.id == admin_id))
    admin = result.scalar_one_or_none()
    
    if not admin:
        raise NotFoundException("管理员不存在")
    
    admin.hashed_password = get_password_hash(password_data.new_password)
    await db.commit()
    
    return {"code": 200, "message": "密码重置成功"}
