"""
NavTools - 认证路由
"""
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.core.security import verify_password, create_access_token, create_refresh_token, decode_token
from app.core.config import get_settings
from app import schemas
from app.models import AdminUser
from app.deps import get_current_admin, get_client_ip
from app.core.exceptions import UnauthorizedException

router = APIRouter(prefix="/auth", tags=["认证"])


@router.post("/login", response_model=schemas.Token)
async def login(
    request: Request,
    login_data: schemas.LoginRequest,
    db: AsyncSession = Depends(get_db)
):
    """管理员登录"""
    # 查询用户
    result = await db.execute(
        select(AdminUser).where(AdminUser.username == login_data.username)
    )
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="账号已被禁用"
        )
    
    # 更新最后登录时间
    user.last_login = datetime.utcnow()
    await db.commit()
    
    # 创建令牌
    access_token_expires = timedelta(minutes=get_settings().ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.id},
        expires_delta=access_token_expires
    )
    refresh_token = create_refresh_token(data={"sub": user.id})
    
    return schemas.Token(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=get_settings().ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )


@router.post("/refresh", response_model=schemas.Token)
async def refresh_token(refresh_data: schemas.RefreshTokenRequest):
    """刷新访问令牌"""
    payload = decode_token(refresh_data.refresh_token)
    if not payload:
        raise UnauthorizedException("无效的刷新令牌")
    
    token_type = payload.get("type")
    if token_type != "refresh":
        raise UnauthorizedException("无效的令牌类型")
    
    user_id = payload.get("sub")
    if not user_id:
        raise UnauthorizedException("无效的令牌载荷")
    
    # 创建新的访问令牌
    access_token_expires = timedelta(minutes=get_settings().ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_id},
        expires_delta=access_token_expires
    )
    refresh_token = create_refresh_token(data={"sub": user_id})
    
    return schemas.Token(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=get_settings().ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )


@router.get("/me", response_model=schemas.AdminUserProfile)
async def get_me(current_admin: schemas.AdminUserProfile = Depends(get_current_admin)):
    """获取当前登录管理员信息"""
    return current_admin


@router.post("/logout")
async def logout():
    """登出 (客户端清除令牌)"""
    return {"code": 200, "message": "登出成功"}


@router.post("/change-password")
async def change_password(
    password_data: schemas.AdminUserPasswordUpdate,
    current_admin: schemas.AdminUserProfile = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """修改密码"""
    result = await db.execute(
        select(AdminUser).where(AdminUser.id == current_admin.id)
    )
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(password_data.old_password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="原密码错误"
        )
    
    from app.core.security import get_password_hash
    user.hashed_password = get_password_hash(password_data.new_password)
    await db.commit()
    
    return {"code": 200, "message": "密码修改成功"}
