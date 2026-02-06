NavTools/
├── backend/                 # FastAPI 后端
│   ├── app/
│   │   ├── core/           # 核心模块
│   │   │   ├── __init__.py
│   │   │   ├── config.py   # 配置管理
│   │   │   ├── security.py # 安全相关 (JWT, 密码)
│   │   │   ├── logging.py  # 日志配置
│   │   │   └── exceptions.py # 异常处理
│   │   ├── routers/        # API 路由
│   │   │   ├── __init__.py
│   │   │   ├── auth.py     # 认证相关
│   │   │   ├── admin.py    # 管理员管理
│   │   │   ├── tools.py    # 工具管理
│   │   │   ├── categories.py # 分类管理
│   │   │   ├── site_config.py # 网站配置
│   │   │   ├── icons.py    # 图标管理
│   │   │   ├── audit_log.py # 审计日志
│   │   │   └── public.py   # 公开接口
│   │   ├── models.py       # SQLAlchemy 模型
│   │   ├── schemas.py      # Pydantic 模型
│   │   ├── database.py     # 数据库配置
│   │   └── deps.py         # 依赖注入
│   ├── devtools/           # 自研工具后端
│   │   ├── __init__.py
│   │   ├── wechat_article.py
│   │   └── json_formatter.py
│   ├── alembic/            # 数据库迁移
│   ├── tests/
│   ├── requirements.txt
│   ├── .env.example
│   └── main.py             # 应用入口
├── frontend/               # React 前端
│   ├── src/
│   │   ├── components/     # 通用组件
│   │   ├── pages/          # 页面
│   │   │   ├── admin/      # 后台管理
│   │   │   └── public/     # 前台展示
│   │   ├── contexts/       # React Context
│   │   ├── hooks/          # 自定义 Hooks
│   │   ├── lib/            # 工具函数
│   │   ├── devtools/       # 自研工具前端
│   │   └── styles/         # 样式文件
│   ├── public/
│   ├── package.json
│   └── vite.config.js
├── docs/                   # 文档
└── docker-compose.yml
