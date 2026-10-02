#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""将 K8s 命令手册 Markdown 转换为 EPUB"""

import re
import markdown
from ebooklib import epub

MD_FILE = "/workspace/k8s_command_manual.md"
EPUB_FILE = "/workspace/K8s命令实战手册.epub"

def split_chapters(md_text):
    """按一级标题拆分章节（跳过代码块内的 #）"""
    lines = md_text.split('\n')
    chapters = []
    current_title = "前言"
    current_lines = []
    in_code_block = False

    for line in lines:
        # 检测代码块
        if line.strip().startswith('```'):
            in_code_block = not in_code_block
            current_lines.append(line)
            continue
        # 非代码块内的一级标题
        if not in_code_block and re.match(r'^# ', line):
            if current_lines:
                chapters.append((current_title, '\n'.join(current_lines)))
                current_lines = []
            current_title = line[2:].strip()
        else:
            current_lines.append(line)

    if current_lines:
        chapters.append((current_title, '\n'.join(current_lines)))
    return chapters

def md_to_html(md_text):
    """Markdown 转 HTML"""
    return markdown.markdown(
        md_text,
        extensions=['fenced_code', 'tables', 'codehilite', 'toc'],
        extension_configs={
            'codehilite': {'guess_lang': False, 'css_class': 'codehilite'}
        }
    )

def main():
    with open(MD_FILE, 'r', encoding='utf-8') as f:
        md_text = f.read()

    chapters = split_chapters(md_text)
    print(f"共 {len(chapters)} 个章节")

    book = epub.EpubBook()
    book.set_identifier("k8s-command-manual-2024")
    book.set_title("Kubernetes 命令实战手册")
    book.set_language("zh-CN")
    book.add_author("运维手册")

    # 样式
    style = '''
    body { font-family: "Helvetica Neue", "Microsoft YaHei", sans-serif; line-height: 1.8; }
    h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 8px; }
    h2 { color: #2980b9; margin-top: 24px; }
    h3 { color: #16a085; }
    code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; font-family: monospace; color: #c7254e; }
    pre { background: #282c34; color: #abb2bf; padding: 16px; border-radius: 6px; overflow-x: auto; font-size: 14px; line-height: 1.5; }
    pre code { background: none; color: inherit; padding: 0; }
    table { border-collapse: collapse; width: 100%; margin: 16px 0; }
    th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
    th { background: #3498db; color: white; }
    tr:nth-child(even) { background: #f9f9f9; }
    blockquote { border-left: 4px solid #3498db; margin: 12px 0; padding: 8px 16px; background: #f0f8ff; color: #555; }
    '''
    nav_css = epub.EpubItem(uid="style_nav", file_name="style/nav.css", media_type="text/css", content=style)
    book.add_item(nav_css)

    epub_chapters = []
    toc_items = []

    for i, (title, content) in enumerate(chapters):
        html_content = md_to_html(content)
        # 去掉第一个 h1（因为已经作为章节标题）
        html_content = re.sub(r'<h1>.*?</h1>', '', html_content, count=1, flags=re.DOTALL)

        chapter = epub.EpubHtml(
            title=title,
            file_name=f"chap_{i+1:02d}.xhtml",
            lang="zh-CN"
        )
        chapter.content = f"<html><head><link rel='stylesheet' href='style/nav.css' type='text/css'/></head><body><h1>{title}</h1>{html_content}</body></html>"
        chapter.add_item(nav_css)
        book.add_item(chapter)
        epub_chapters.append(chapter)
        toc_items.append(epub.Link(chapter.file_name, title, f"ch{i+1}"))

    # 目录
    book.toc = tuple(toc_items)
    book.add_item(epub.EpubNcx())
    book.add_item(epub.EpubNav())

    # 书脊
    book.spine = ["nav"] + epub_chapters

    epub.write_epub(EPUB_FILE, book, {})
    print(f"EPUB 已生成: {EPUB_FILE}")

if __name__ == "__main__":
    main()
