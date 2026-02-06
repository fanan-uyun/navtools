"""
NavTools - 自研工具 API (公众号文章提取)
"""
import re
import httpx
from bs4 import BeautifulSoup
from markdownify import markdownify as md
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/devtools", tags=["自研工具"])


class WeChatExtractRequest(BaseModel):
    url: str


class WeChatExtractResponse(BaseModel):
    title: str
    author: str
    content: str
    publish_time: str


@router.post("/wechat-extract", response_model=dict)
async def extract_wechat_article(request: WeChatExtractRequest):
    """提取公众号文章内容"""
    try:
        # 验证 URL
        if not request.url.startswith(('https://mp.weixin.qq.com/', 'http://mp.weixin.qq.com/')):
            raise HTTPException(status_code=400, detail="仅支持微信公众号文章链接")
        
        # 获取页面内容
        async with httpx.AsyncClient(follow_redirects=True, timeout=30) as client:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
            response = await client.get(request.url, headers=headers)
            response.raise_for_status()
        
        # 解析 HTML
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # 提取标题
        title_elem = soup.find('h2', class_='rich_media_title') or soup.find('h1', class_='rich_media_title')
        title = title_elem.get_text(strip=True) if title_elem else '无标题'
        
        # 提取作者
        author_elem = soup.find('a', id='js_name') or soup.find('span', class_='profile_nickname')
        author = author_elem.get_text(strip=True) if author_elem else '未知作者'
        
        # 提取发布时间
        time_elem = soup.find('em', id='publish_time') or soup.find('span', class_='publish_time')
        publish_time = time_elem.get_text(strip=True) if time_elem else ''
        
        # 提取正文内容
        content_elem = soup.find('div', id='js_content') or soup.find('div', class_='rich_media_content')
        
        if not content_elem:
            raise HTTPException(status_code=404, detail="无法找到文章内容")
        
        # 处理图片 - 处理防盗链
        for img in content_elem.find_all('img'):
            data_src = img.get('data-src')
            if data_src:
                img['src'] = data_src
            # 移除微信的数据属性
            for attr in list(img.attrs.keys()):
                if attr.startswith('data-'):
                    del img[attr]
        
        # 转换为 Markdown
        html_content = str(content_elem)
        markdown_content = md(html_content, heading_style='ATX')
        
        # 清理 Markdown
        markdown_content = re.sub(r'\n{3,}', '\n\n', markdown_content)
        markdown_content = markdown_content.strip()
        
        # 组合完整 Markdown
        full_content = f"# {title}\n\n"
        full_content += f"> 作者: {author}\n"
        if publish_time:
            full_content += f"> 发布时间: {publish_time}\n"
        full_content += f"> 原文链接: {request.url}\n\n"
        full_content += "---\n\n"
        full_content += markdown_content
        
        return {
            "code": 200,
            "message": "success",
            "data": {
                "title": title,
                "author": author,
                "publish_time": publish_time,
                "content": full_content,
            }
        }
        
    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail=f"请求失败: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"提取失败: {str(e)}")


@router.post("/json-format", response_model=dict)
async def format_json(data: dict):
    """JSON 格式化 / 压缩 / 转义"""
    try:
        mode = data.get('mode', 'format')
        json_data = data.get('json', '')
        
        if not json_data:
            raise HTTPException(status_code=400, detail="JSON 内容不能为空")
        
        import json
        
        # 解析 JSON
        parsed = json.loads(json_data)
        
        if mode == 'format':
            result = json.dumps(parsed, indent=2, ensure_ascii=False)
        elif mode == 'minify':
            result = json.dumps(parsed, separators=(',', ':'), ensure_ascii=False)
        elif mode == 'escape':
            result = json.dumps(json.dumps(parsed, ensure_ascii=False))
        elif mode == 'unescape':
            if isinstance(parsed, str):
                unescaped = json.loads(parsed)
                result = json.dumps(unescaped, indent=2, ensure_ascii=False)
            else:
                result = json.dumps(parsed, indent=2, ensure_ascii=False)
        else:
            result = json.dumps(parsed, indent=2, ensure_ascii=False)
        
        return {
            "code": 200,
            "message": "success",
            "data": {"result": result}
        }
        
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=400, detail=f"JSON 解析错误: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"处理失败: {str(e)}")
