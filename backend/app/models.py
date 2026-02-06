"""
NavTools - 数据模型 (SQLAlchemy)
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Index
from sqlalchemy.orm import relationship

from app.database import Base


class AdminUser(Base):
    """管理员用户"""
    __tablename__ = "admin_users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_superuser = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    last_login = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关系
    audit_logs = relationship("AuditLog", back_populates="admin")
    
    def __repr__(self):
        return f"<AdminUser {self.username}>"


class Category(Base):
    """工具分类"""
    __tablename__ = "categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)
    slug = Column(String(50), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    icon = Column(String(100), nullable=True)
    color = Column(String(20), default="#FFD700")
    sort_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关系
    tools = relationship("Tool", back_populates="category")
    
    def __repr__(self):
        return f"<Category {self.name}>"


class Tool(Base):
    """工具"""
    __tablename__ = "tools"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    short_description = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    url = Column(String(500), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    icon = Column(String(100), nullable=True)
    tags = Column(String(500), nullable=True)  # JSON 字符串存储标签
    view_count = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    is_self_developed = Column(Boolean, default=False)  # 是否自研工具
    api_endpoint = Column(String(255), nullable=True)  # 自研工具的API端点
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关系
    category = relationship("Category", back_populates="tools")
    
    # 索引
    __table_args__ = (
        Index('idx_tool_category', 'category_id'),
        Index('idx_tool_featured', 'is_featured'),
        Index('idx_tool_active', 'is_active'),
    )
    
    def __repr__(self):
        return f"<Tool {self.name}>"


class SiteConfig(Base):
    """网站配置"""
    __tablename__ = "site_config"
    
    id = Column(Integer, primary_key=True)
    site_name = Column(String(100), default="NavTools")
    site_description = Column(Text, default="实用工具集合")
    site_keywords = Column(String(500), default="工具,实用工具,在线工具")
    icp_beian = Column(String(100), nullable=True)
    gongan_beian = Column(String(100), nullable=True)
    contact_email = Column(String(100), nullable=True)
    theme_enabled = Column(Boolean, default=True)
    logo_url = Column(String(500), nullable=True)
    favicon_url = Column(String(500), nullable=True)
    footer_text = Column(Text, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<SiteConfig {self.site_name}>"


class IconResource(Base):
    """图标资源"""
    __tablename__ = "icon_resources"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)
    slug = Column(String(50), unique=True, index=True, nullable=False)
    icon_type = Column(String(20), default="lucide")  # lucide, svg, url
    content = Column(Text, nullable=True)  # SVG 内容或 URL
    source = Column(String(50), default="builtin")  # builtin, custom
    category = Column(String(50), nullable=True)  # 图标分类
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f"<IconResource {self.name}>"


class AuditLog(Base):
    """审计日志"""
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(Integer, ForeignKey("admin_users.id"), nullable=True)
    action = Column(String(50), nullable=False)  # create, update, delete, login, logout
    target_type = Column(String(50), nullable=False)  # tool, category, admin, config
    target_id = Column(Integer, nullable=True)
    details = Column(Text, nullable=True)  # JSON 字符串存储详情
    ip_address = Column(String(50), nullable=True)
    user_agent = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # 关系
    admin = relationship("AdminUser", back_populates="audit_logs")
    
    # 索引
    __table_args__ = (
        Index('idx_audit_admin', 'admin_id'),
        Index('idx_audit_action', 'action'),
        Index('idx_audit_created', 'created_at'),
    )
    
    def __repr__(self):
        return f"<AuditLog {self.action} {self.target_type}>"
