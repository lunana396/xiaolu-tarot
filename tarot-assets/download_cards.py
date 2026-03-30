#!/usr/bin/env python3
"""
小鹿塔罗 - 牌图后台下载器
使用方法: python3 download_cards.py
功能:
  - 自动检测已下载的卡片
  - 逐张下载缺失的 Wikipedia 图片
  - 跳过 404/429 错误的卡片，下次再试
  - 成功下载后自动更新本地文件
建议:
  - 每次运行间隔 30 秒以上，避免 Wikipedia 限速
  - 可配合 cron 定时执行: */5 * * * * cd /path/to/tarot-assets && python3 download_cards.py
"""
import urllib.request
import urllib.error
import os
import sys
import json
import time
import socket

CARDS_DIR = os.path.dirname(os.path.abspath(__file__)) + "/cards"
API_URL = "http://localhost:3005/api/cards"
REQUEST_DELAY = 30  # 每次请求间隔秒数（避免限速）

os.makedirs(CARDS_DIR, exist_ok=True)

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Referer': 'https://upload.wikimedia.org/',
    'Accept': 'image/jpeg,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
}


def get_card_urls():
    """从本地 API 获取卡片 URL"""
    try:
        req = urllib.request.Request(API_URL, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as r:
            data = json.loads(r.read())
            return {c['id']: c.get('img', '') for c in data['data']}
    except Exception as e:
        print(f"获取卡片列表失败: {e}")
        return {}


def download_card(card_id, url):
    """下载单张卡片"""
    if not url:
        return None, "无URL"

    fpath = os.path.join(CARDS_DIR, f"card_{card_id:02d}.jpg")

    # 跳过本地已有的（且文件大于5KB）
    if os.path.exists(fpath) and os.path.getsize(fpath) > 5000:
        return None, "已存在"

    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=20) as resp:
            content = resp.read()
            if len(content) < 5000:
                return None, f"文件过小({len(content)}B)"
            with open(fpath, 'wb') as f:
                f.write(content)
            size_kb = len(content) // 1024
            return fpath, f"OK ({size_kb}KB)"
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return None, f"404 Not Found"
        elif e.code == 429:
            return None, "429 限速"
        else:
            return None, f"HTTP {e.code}"
    except (urllib.error.URLError, socket.timeout, Exception) as e:
        return None, f"网络错误: {str(e)[:30]}"


def main():
    existing = [f for f in os.listdir(CARDS_DIR) if f.endswith('.jpg')]
    print(f"📁 卡片目录: {CARDS_DIR}")
    print(f"✅ 已下载: {len(existing)} 张")

    urls = get_card_urls()
    if not urls:
        print("无法获取卡片URL，退出。")
        return

    remaining = [(cid, url) for cid, url in urls.items()
                 if not os.path.exists(os.path.join(CARDS_DIR, f"card_{cid:02d}.jpg"))
                 or os.path.getsize(os.path.join(CARDS_DIR, f"card_{cid:02d}.jpg")) < 5000]

    print(f"📥 还需下载: {len(remaining)} 张")

    if not remaining:
        print("🎉 全部下载完成！")
        return

    # 只下载第一张（避免触发严格限速）
    cid, url = remaining[0]
    name = urls.get(cid, {}).get('name_cn', f'Card {cid}')
    short_url = f"...{url[-50:]}" if len(url) > 50 else url
    print(f"⬇️  下载 {cid}: {name} ({short_url})")

    result_path, status = download_card(cid, url)
    if result_path:
        print(f"  ✅ {status}")
    else:
        print(f"  ❌ {status}")

    if status != "429 限速":
        print(f"⏳ {REQUEST_DELAY}秒后可再次运行")
    else:
        print(f"⚠️  遇到限速，建议等待5分钟后再试")


if __name__ == "__main__":
    main()
