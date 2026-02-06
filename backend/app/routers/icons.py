"""
NavTools - 图标管理路由
"""
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.database import get_db
from app import schemas
from app.models import IconResource
from app.deps import get_current_admin
from app.core.exceptions import NotFoundException, BusinessException

router = APIRouter(prefix="/admin/icons", tags=["图标管理"])

# 内置图标数据
BUILTIN_ICONS = [
    {"name": "首页", "slug": "home", "icon_type": "lucide", "content": "Home", "category": "基础"},
    {"name": "设置", "slug": "settings", "icon_type": "lucide", "content": "Settings", "category": "基础"},
    {"name": "用户", "slug": "user", "icon_type": "lucide", "content": "User", "category": "基础"},
    {"name": "工具", "slug": "wrench", "icon_type": "lucide", "content": "Wrench", "category": "基础"},
    {"name": "分类", "slug": "folder", "icon_type": "lucide", "content": "Folder", "category": "基础"},
    {"name": "链接", "slug": "link", "icon_type": "lucide", "content": "Link", "category": "基础"},
    {"name": "代码", "slug": "code", "icon_type": "lucide", "content": "Code", "category": "开发"},
    {"name": "终端", "slug": "terminal", "icon_type": "lucide", "content": "Terminal", "category": "开发"},
    {"name": "文件", "slug": "file", "icon_type": "lucide", "content": "File", "category": "文件"},
    {"name": "图片", "slug": "image", "icon_type": "lucide", "content": "Image", "category": "媒体"},
    {"name": "搜索", "slug": "search", "icon_type": "lucide", "content": "Search", "category": "基础"},
    {"name": "删除", "slug": "trash", "icon_type": "lucide", "content": "Trash", "category": "操作"},
    {"name": "编辑", "slug": "edit", "icon_type": "lucide", "content": "Edit", "category": "操作"},
    {"name": "保存", "slug": "save", "icon_type": "lucide", "content": "Save", "category": "操作"},
    {"name": "添加", "slug": "plus", "icon_type": "lucide", "content": "Plus", "category": "操作"},
    {"name": "关闭", "slug": "x", "icon_type": "lucide", "content": "X", "category": "操作"},
    {"name": "对勾", "slug": "check", "icon_type": "lucide", "content": "Check", "category": "操作"},
    {"name": "眼睛", "slug": "eye", "icon_type": "lucide", "content": "Eye", "category": "操作"},
    {"name": "星标", "slug": "star", "icon_type": "lucide", "content": "Star", "category": "操作"},
    {"name": "心形", "slug": "heart", "icon_type": "lucide", "content": "Heart", "category": "社交"},
    {"name": "分享", "slug": "share", "icon_type": "lucide", "content": "Share", "category": "社交"},
    {"name": "下载", "slug": "download", "icon_type": "lucide", "content": "Download", "category": "操作"},
    {"name": "上传", "slug": "upload", "icon_type": "lucide", "content": "Upload", "category": "操作"},
    {"name": "复制", "slug": "copy", "icon_type": "lucide", "content": "Copy", "category": "操作"},
    {"name": "刷新", "slug": "refresh-cw", "icon_type": "lucide", "content": "RefreshCw", "category": "操作"},
    {"name": "JSON", "slug": "file-json", "icon_type": "lucide", "content": "FileJson", "category": "开发"},
    {"name": "Markdown", "slug": "file-markdown", "icon_type": "lucide", "content": "FileMarkdown", "category": "开发"},
    {"name": "锁", "slug": "lock", "icon_type": "lucide", "content": "Lock", "category": "安全"},
    {"name": "解锁", "slug": "unlock", "icon_type": "lucide", "content": "Unlock", "category": "安全"},
    {"name": "盾牌", "slug": "shield", "icon_type": "lucide", "content": "Shield", "category": "安全"},
    {"name": "图表", "slug": "bar-chart", "icon_type": "lucide", "content": "BarChart", "category": "数据"},
    {"name": "日历", "slug": "calendar", "icon_type": "lucide", "content": "Calendar", "category": "时间"},
    {"name": "时钟", "slug": "clock", "icon_type": "lucide", "content": "Clock", "category": "时间"},
    {"name": "邮件", "slug": "mail", "icon_type": "lucide", "content": "Mail", "category": "通讯"},
    {"name": "消息", "slug": "message-circle", "icon_type": "lucide", "content": "MessageCircle", "category": "通讯"},
    {"name": "电话", "slug": "phone", "icon_type": "lucide", "content": "Phone", "category": "通讯"},
    {"name": "数据库", "slug": "database", "icon_type": "lucide", "content": "Database", "category": "开发"},
    {"name": "云", "slug": "cloud", "icon_type": "lucide", "content": "Cloud", "category": "云服务"},
    {"name": "调色板", "slug": "palette", "icon_type": "lucide", "content": "Palette", "category": "设计"},
    {"name": "画笔", "slug": "brush", "icon_type": "lucide", "content": "Brush", "category": "设计"},
    {"name": "剪刀", "slug": "scissors", "icon_type": "lucide", "content": "Scissors", "category": "工具"},
    {"name": "尺子", "slug": "ruler", "icon_type": "lucide", "content": "Ruler", "category": "工具"},
    {"name": "计算器", "slug": "calculator", "icon_type": "lucide", "content": "Calculator", "category": "数学"},
    {"name": "哈希", "slug": "hash", "icon_type": "lucide", "content": "Hash", "category": "开发"},
    {"name": "命令", "slug": "command", "icon_type": "lucide", "content": "Command", "category": "开发"},
    {"name": "二维码", "slug": "qr-code", "icon_type": "lucide", "content": "QrCode", "category": "工具"},
    {"name": "压缩", "slug": "archive", "icon_type": "lucide", "content": "Archive", "category": "文件"},
    {"name": "视频", "slug": "video", "icon_type": "lucide", "content": "Video", "category": "媒体"},
    {"name": "音乐", "slug": "music", "icon_type": "lucide", "content": "Music", "category": "媒体"},
]


async def init_builtin_icons(db: AsyncSession):
    """初始化内置图标"""
    for icon_data in BUILTIN_ICONS:
        result = await db.execute(
            select(IconResource).where(IconResource.slug == icon_data["slug"])
        )
        if not result.scalar_one_or_none():
            icon = IconResource(**icon_data, source="builtin")
            db.add(icon)
    await db.commit()


@router.get("", response_model=schemas.ListResponse)
async def list_icons(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    category: Optional[str] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_admin: schemas.AdminUserProfile = Depends(get_current_admin)
):
    """获取图标列表"""
    query = select(IconResource)
    
    if category:
        query = query.where(IconResource.category == category)
    
    if search:
        query = query.where(IconResource.name.contains(search))
    
    # 统计总数
    count_result = await db.execute(select(func.count()).select_from(query.subquery()))
    total = count_result.scalar()
    
    # 分页
    query = query.order_by(IconResource.category, IconResource.name)
    query = query.offset((page - 1) * page_size).limit(page_size)
    
    result = await db.execute(query)
    icons = result.scalars().all()
    
    return {
        "code": 200,
        "message": "success",
        "data": {
            "items": [schemas.IconResourceResponse.model_validate(i) for i in icons],
            "total": total,
            "page": page,
            "page_size": page_size
        }
    }


@router.get("/categories")
async def get_icon_categories(
    db: AsyncSession = Depends(get_db),
    current_admin: schemas.AdminUserProfile = Depends(get_current_admin)
):
    """获取图标分类列表"""
    result = await db.execute(
        select(IconResource.category).distinct().where(IconResource.category.isnot(None))
    )
    categories = [c for c in result.scalars().all() if c]
    return {"code": 200, "message": "success", "data": categories}


@router.post("", response_model=schemas.IconResourceResponse)
async def create_icon(
    icon_data: schemas.IconResourceCreate,
    db: AsyncSession = Depends(get_db),
    current_admin: schemas.AdminUserProfile = Depends(get_current_admin)
):
    """创建图标"""
    # 检查 slug 是否已存在
    result = await db.execute(
        select(IconResource).where(IconResource.slug == icon_data.slug)
    )
    if result.scalar_one_or_none():
        raise BusinessException("图标标识已存在")
    
    icon = IconResource(**icon_data.model_dump(), source="custom")
    db.add(icon)
    await db.commit()
    await db.refresh(icon)
    
    return icon


@router.put("/{icon_id}", response_model=schemas.IconResourceResponse)
async def update_icon(
    icon_id: int,
    icon_data: schemas.IconResourceUpdate,
    db: AsyncSession = Depends(get_db),
    current_admin: schemas.AdminUserProfile = Depends(get_current_admin)
):
    """更新图标"""
    result = await db.execute(select(IconResource).where(IconResource.id == icon_id))
    icon = result.scalar_one_or_none()
    
    if not icon:
        raise NotFoundException("图标不存在")
    
    # 检查 slug 是否已存在
    if icon_data.slug:
        result = await db.execute(
            select(IconResource).where(
                (IconResource.slug == icon_data.slug) & 
                (IconResource.id != icon_id)
            )
        )
        if result.scalar_one_or_none():
            raise BusinessException("图标标识已存在")
    
    # 更新字段
    for field, value in icon_data.model_dump(exclude_unset=True).items():
        setattr(icon, field, value)
    
    await db.commit()
    await db.refresh(icon)
    
    return icon


@router.delete("/{icon_id}")
async def delete_icon(
    icon_id: int,
    db: AsyncSession = Depends(get_db),
    current_admin: schemas.AdminUserProfile = Depends(get_current_admin)
):
    """删除图标"""
    result = await db.execute(select(IconResource).where(IconResource.id == icon_id))
    icon = result.scalar_one_or_none()
    
    if not icon:
        raise NotFoundException("图标不存在")
    
    await db.delete(icon)
    await db.commit()
    
    return {"code": 200, "message": "删除成功"}
