"""
NavTools - 异常处理
"""
from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError


class BusinessException(HTTPException):
    """业务异常"""
    def __init__(self, detail: str, status_code: int = 400):
        super().__init__(status_code=status_code, detail=detail)


class NotFoundException(HTTPException):
    """资源不存在异常"""
    def __init__(self, detail: str = "资源不存在"):
        super().__init__(status_code=404, detail=detail)


class UnauthorizedException(HTTPException):
    """未授权异常"""
    def __init__(self, detail: str = "未授权访问"):
        super().__init__(status_code=401, detail=detail)


class ForbiddenException(HTTPException):
    """禁止访问异常"""
    def __init__(self, detail: str = "禁止访问"):
        super().__init__(status_code=403, detail=detail)


async def business_exception_handler(request: Request, exc: BusinessException):
    """业务异常处理器"""
    return JSONResponse(
        status_code=exc.status_code,
        content={"code": exc.status_code, "message": exc.detail, "data": None}
    )


async def integrity_error_handler(request: Request, exc: IntegrityError):
    """数据库完整性错误处理器"""
    return JSONResponse(
        status_code=400,
        content={"code": 400, "message": "数据已存在或违反约束", "data": None}
    )
