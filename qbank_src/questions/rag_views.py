"""RAG 知识库视图：文档管理 + 问答 + 用量统计。"""
import json

from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt

from questions.models import AIDocument, UserAIUsage


def _is_admin(user):
    return user.is_authenticated and (user.is_staff or user.is_superuser)


@login_required
def knowledge_base(request):
    is_admin = _is_admin(request.user)
    usage, _ = UserAIUsage.objects.get_or_create(user=request.user)
    docs = AIDocument.objects.all()
    return render(request, 'questions/knowledge_base.html', {
        'chunk_total': 0,
        'docs_saved_count': docs.count(),
        'current_user': request.user.username,
        'tokens_used': 0,
        'quota_total': None,
        'current_model': 'gpt-4o-mini',
        'is_admin': is_admin,
        'supported_exts': '.pdf,.txt,.md,.docx',
        'top_k': 5,
        'score_threshold': 0.7,
        'documents': docs,
    })


@csrf_exempt
@login_required
def kb_ask_api(request):
    return JsonResponse({'answer': '知识库问答占位回复', 'sources': []})


@csrf_exempt
@login_required
def kb_stats_api(request):
    return JsonResponse({'chunk_total': 0, 'docs_count': AIDocument.objects.count()})


@csrf_exempt
@login_required
def kb_progress_api(request, task_id):
    return JsonResponse({'status': 'done', 'progress': 100})


@csrf_exempt
@login_required
def kb_upload_api(request):
    if not _is_admin(request.user):
        return JsonResponse({'error': '仅管理员可上传'}, status=403)
    return JsonResponse({'success': True, 'task_id': '1'})


@csrf_exempt
@login_required
def kb_reindex_api(request):
    if not _is_admin(request.user):
        return JsonResponse({'error': '仅管理员可重建索引'}, status=403)
    return JsonResponse({'success': True})


@csrf_exempt
@login_required
def kb_reset_quota_api(request):
    if not _is_admin(request.user):
        return JsonResponse({'error': '仅管理员可操作'}, status=403)
    return JsonResponse({'success': True})


@csrf_exempt
@login_required
def kb_delete_doc_api(request, doc_path):
    if not _is_admin(request.user):
        return JsonResponse({'error': '仅管理员可删除'}, status=403)
    return JsonResponse({'success': True})
