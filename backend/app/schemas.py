"""
NavTools - Pydantic 数据模型 (请求/响应验证)
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field, ConfigDict


# ==================== 通用响应 ====================

class ResponseModel(BaseModel):
    """通用响应模型"""
    code: int = 200
    message: str = "success"
    data: Optional[dict] = None


class ListResponse(BaseModel):
    """列表响应模型"""
    code: int = 200
    message: str = "success"
    data: dict


class PaginationParams(BaseModel):
    """分页参数"""
    page: int = Field(1, ge=1)
    page_size: int = Field(20, ge=1, le=100)


# ==================== 认证相关 ====================

class Token(BaseModel):
    """令牌响应"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class TokenPayload(BaseModel):
    """令牌载荷"""
    sub: Optional[int] = None
    type: Optional[str] = None


class LoginRequest(BaseModel):
    """登录请求"""
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6, max_length=100)


class RefreshTokenRequest(BaseModel):
    """刷新令牌请求"""
    refresh_token: str


# ==================== 管理员相关 ====================

class AdminUserBase(BaseModel):
    """管理员基础信息"""
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    is_superuser: bool = False
    is_active: bool = True


class AdminUserCreate(AdminUserBase):
    """创建管理员请求"""
    password: str = Field(..., min_length=6, max_length=100)


class AdminUserUpdate(BaseModel):
    """更新管理员请求"""
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = None


class AdminUserPasswordUpdate(BaseModel):
    """修改密码请求"""
    old_password: str
    new_password: str = Field(..., min_length=6, max_length=100)


class AdminUserResetPassword(BaseModel):
    """重置密码请求"""
    new_password: str = Field(..., min_length=6, max_length=100)


class AdminUserResponse(AdminUserBase):
    """管理员响应"""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    last_login: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class AdminUserProfile(BaseModel):
    """管理员个人信息"""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    username: str
    email: str
    is_superuser: bool
    last_login: Optional[datetime] = None


# ==================== 分类相关 ====================

class CategoryBase(BaseModel):
    """分类基础信息"""
    name: str = Field(..., min_length=1, max_length=50)
    slug: str = Field(..., min_length=1, max_length=50, pattern=r"^[a-z0-9-]+$")
    description: Optional[str] = Field(None, max_length=500)
    icon: Optional[str] = Field(None, max_length=100)
    color: str = Field(default="#FFD700", pattern=r"^#[0-9A-Fa-f]{6}$")
    sort_order: int = Field(default=0)
    is_active: bool = True


class CategoryCreate(CategoryBase):
    """创建分类请求"""
    pass


class CategoryUpdate(BaseModel):
    """更新分类请求"""
    name: Optional[str] = Field(None, min_length=1, max_length=50)
    slug: Optional[str] = Field(None, min_length=1, max_length=50, pattern=r"^[a-z0-9-]+$")
    description: Optional[str] = Field(None, max_length=500)
    icon: Optional[str] = Field(None, max_length=100)
    color: Optional[str] = Field(None, pattern=r"^#[0-9A-Fa-f]{6}$")
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None


class CategoryResponse(CategoryBase):
    """分类响应"""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    tool_count: int = 0
    created_at: datetime
    updated_at: datetime


class CategorySimple(BaseModel):
    """简化分类信息"""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    name: str
    slug: str
    icon: Optional[str] = None
    color: str


# ==================== 工具相关 ====================

class ToolBase(BaseModel):
    """工具基础信息"""
    name: str = Field(..., min_length=1, max_length=100)
    slug: str = Field(..., min_length=1, max_length=100, pattern=r"^[a-z0-9-]+$")
    short_description: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    url: str = Field(..., max_length=500)
    category_id: int
    icon: Optional[str] = Field(None, max_length=100)
    tags: Optional[List[str]] = None
    is_active: bool = True
    is_featured: bool = False
    is_self_developed: bool = False
    api_endpoint: Optional[str] = Field(None, max_length=255)
    sort_order: int = Field(default=0)


class ToolCreate(ToolBase):
    """创建工具请求"""
    pass


class ToolUpdate(BaseModel):
    """更新工具请求"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    slug: Optional[str] = Field(None, min_length=1, max_length=100, pattern=r"^[a-z0-9-]+$")
    short_description: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    url: Optional[str] = Field(None, max_length=500)
    category_id: Optional[int] = None
    icon: Optional[str] = Field(None, max_length=100)
    tags: Optional[List[str]] = None
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None
    is_self_developed: Optional[bool] = None
    api_endpoint: Optional[str] = Field(None, max_length=255)
    sort_order: Optional[int] = None


class ToolResponse(ToolBase):
    """工具响应"""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    view_count: int
    category: CategorySimple
    created_at: datetime
    updated_at: datetime


class ToolSimple(BaseModel):
    """简化工具信息"""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    name: str
    slug: str
    short_description: Optional[str] = None
    icon: Optional[str] = None
    is_featured: bool
    category: CategorySimple


class ToolFeaturedReorder(BaseModel):
    """精选工具排序请求"""
    tool_ids: List[int]


# ==================== 网站配置相关 ====================

class SiteConfigBase(BaseModel):
    """网站配置基础信息"""
    site_name: str = Field(default="NavTools", max_length=100)
    site_description: str = Field(default="实用工具集合", max_length=500)
    site_keywords: str = Field(default="工具,实用工具,在线工具", max_length=500)
    icp_beian: Optional[str] = Field(None, max_length=100)
    gongan_beian: Optional[str] = Field(None, max_length=100)
    contact_email: Optional[EmailStr] = None
    theme_enabled: bool = True
    logo_url: Optional[str] = Field(None, max_length=500)
    favicon_url: Optional[str] = Field(None, max_length=500)
    footer_text: Optional[str] = None


class SiteConfigUpdate(SiteConfigBase):
    """更新网站配置请求"""
    pass


class SiteConfigResponse(SiteConfigBase):
    """网站配置响应"""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    updated_at: datetime


# ==================== 图标相关 ====================

class IconResourceBase(BaseModel):
    """图标资源基础信息"""
    name: str = Field(..., min_length=1, max_length=50)
    slug: str = Field(..., min_length=1, max_length=50, pattern=r"^[a-z0-9-]+$")
    icon_type: str = Field(default="lucide", pattern=r"^(lucide|svg|url)$")
    content: Optional[str] = None
    source: str = Field(default="builtin")
    category: Optional[str] = Field(None, max_length=50)
    is_active: bool = True


class IconResourceCreate(IconResourceBase):
    """创建图标资源请求"""
    pass


class IconResourceUpdate(BaseModel):
    """更新图标资源请求"""
    name: Optional[str] = Field(None, min_length=1, max_length=50)
    slug: Optional[str] = Field(None, min_length=1, max_length=50, pattern=r"^[a-z0-9-]+$")
    icon_type: Optional[str] = Field(None, pattern=r"^(lucide|svg|url)$")
    content: Optional[str] = None
    category: Optional[str] = Field(None, max_length=50)
    is_active: Optional[bool] = None


class IconResourceResponse(IconResourceBase):
    """图标资源响应"""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    created_at: datetime


# ==================== 审计日志相关 ====================

class AuditLogBase(BaseModel):
    """审计日志基础信息"""
    action: str = Field(..., max_length=50)
    target_type: str = Field(..., max_length=50)
    target_id: Optional[int] = None
    details: Optional[str] = None
    ip_address: Optional[str] = Field(None, max_length=50)
    user_agent: Optional[str] = Field(None, max_length=500)


class AuditLogResponse(AuditLogBase):
    """审计日志响应"""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    admin_id: Optional[int]
    admin_username: Optional[str]
    created_at: datetime


# ==================== 公开接口相关 ====================

class PublicToolFilter(BaseModel):
    """公开工具筛选"""
    category: Optional[str] = None
    search: Optional[str] = None
    featured: Optional[bool] = None


class HomePageData(BaseModel):
    """首页数据"""
    site_config: SiteConfigResponse
    categories: List[CategorySimple]
    featured_tools: List[ToolSimple]
    recent_tools: List[ToolSimple]
