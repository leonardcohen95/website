"""题库系统视图：题库答题、管理后台、AI 助理、模拟面试、K8s/LangChain 学习中心。"""
import json
import os
import random
from functools import wraps

from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm
from django.contrib.auth.models import User
from django.db.models import Count
from django.http import HttpResponse, JsonResponse, HttpResponseNotFound
from django.shortcuts import get_object_or_404, redirect, render
from django.views.decorators.csrf import csrf_exempt

from questions.models import (
    AIChat, AIDocument, InterviewAnswer, InterviewSession, K8sProgress,
    LangChainProgress, Question, UserAIUsage, UserAnswer,
)


# ============================================================
#  通用辅助
# ============================================================
def _body(request):
    try:
        return json.loads(request.body or b'{}')
    except (ValueError, TypeError):
        return {}


def _api_login_required(view_func):
    @wraps(view_func)
    def _wrapped(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'login required'}, status=401)
        return view_func(request, *args, **kwargs)
    return _wrapped


# ============================================================
#  首页 / 注册 / 登录 / 登出
# ============================================================
def index(request):
    questions = Question.objects.all()
    total = questions.count()
    first_id = questions.order_by('id').first().id if total else None
    return render(request, 'questions/index.html', {
        'total_questions': total,
        'first_question_id': first_id,
    })


def user_register(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        username = request.POST.get('username', '').strip()
        password = request.POST.get('password1', '')
        if not username or not password:
            messages.error(request, '用户名和密码不能为空')
            return render(request, 'questions/register.html', {'form': form})
        if User.objects.filter(username=username).exists():
            messages.error(request, '用户名已存在')
            return render(request, 'questions/register.html', {'form': form})
        user = User.objects.create_user(username=username, password=password)
        UserAIUsage.objects.get_or_create(user=user)
        messages.success(request, '注册成功，请登录')
        return redirect('login')
    form = UserCreationForm()
    return render(request, 'questions/register.html', {'form': form})


def user_login(request):
    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        username = request.POST.get('username', '').strip()
        password = request.POST.get('password', '')
        user = authenticate(request, username=username, password=password)
        if user:
            login(request, user)
            messages.success(request, f'欢迎回来，{username}')
            return redirect('index')
        messages.error(request, '用户名或密码错误')
    else:
        form = AuthenticationForm()
    return render(request, 'questions/login.html', {'form': form})


def user_logout(request):
    logout(request)
    messages.info(request, '已退出登录')
    return redirect('index')


# ============================================================
#  个人中心 / 书架
# ============================================================
@login_required
def dashboard(request):
    mc_total = Question.objects.filter(type='选择题').count()
    answered = UserAnswer.objects.filter(user=request.user).count()
    return render(request, 'questions/dashboard.html', {
        'total_mc_questions': mc_total,
        'answered_mc_count': answered,
        'unanswered_mc_count': max(0, mc_total - answered),
    })


@login_required
def bookshelf(request):
    docs = AIDocument.objects.all().order_by('-uploaded_at')
    return render(request, 'questions/bookshelf.html', {'documents': docs})


# ============================================================
#  题库答题
# ============================================================
@login_required
def start_quiz(request):
    mc_ids = list(Question.objects.filter(type='选择题').values_list('id', flat=True))
    random.shuffle(mc_ids)
    quiz_ids = mc_ids[:10]
    request.session['quiz_questions'] = quiz_ids
    request.session['correct_mc_indices'] = []
    request.session['wrong_mc_indices'] = []
    if quiz_ids:
        return redirect('answer_question', question_id=quiz_ids[0])
    return redirect('index')


def answer_question(request, question_id):
    question = get_object_or_404(Question, id=question_id)
    quiz_ids = request.session.get('quiz_questions')
    is_quiz = bool(quiz_ids) and question_id in quiz_ids
    total = len(quiz_ids) if is_quiz else Question.objects.count()
    current = (quiz_ids.index(question_id) + 1) if is_quiz else question_id
    return render(request, 'questions/answer_question.html', {
        'question': question,
        'total_questions': total,
        'current_number': current,
        'is_quiz_mode': is_quiz,
        'quiz_questions': quiz_ids or [],
    })


@login_required
def save_answer(request, question_id):
    question = get_object_or_404(Question, id=question_id)
    user_ans = request.POST.get('answer', '').strip()
    UserAnswer.objects.update_or_create(
        user=request.user, question=question,
        defaults={'user_answer': user_ans},
    )
    messages.success(request, '答案已保存')
    return redirect('answer_question', question_id=question_id)


def show_answer(request, question_id):
    question = get_object_or_404(Question, id=question_id)
    return render(request, 'questions/show_answer.html', {'question': question})


# ============================================================
#  管理后台
# ============================================================
def _is_staff(user):
    return user.is_authenticated and (user.is_staff or user.is_superuser)


@user_passes_test(_is_staff)
def add_question(request):
    if request.method == 'POST':
        q_type = request.POST.get('type')
        q_text = request.POST.get('question', '').strip()
        options = json.loads(request.POST.get('options', '[]'))
        answer = request.POST.get('answer', '').strip()
        analysis = request.POST.get('analysis', '').strip()
        Question.objects.create(type=q_type, question=q_text, options=options, answer=answer, analysis=analysis)
        messages.success(request, '题目已添加')
        return redirect('view_all_questions')
    return render(request, 'questions/add_question.html')


@user_passes_test(_is_staff)
def edit_question(request, question_id):
    question = get_object_or_404(Question, id=question_id)
    if request.method == 'POST':
        question.type = request.POST.get('type', question.type)
        question.question = request.POST.get('question', question.question)
        question.options = json.loads(request.POST.get('options', '[]'))
        question.answer = request.POST.get('answer', question.answer)
        question.analysis = request.POST.get('analysis', question.analysis)
        question.save()
        messages.success(request, '题目已更新')
        return redirect('view_all_questions')
    return render(request, 'questions/edit_question.html', {'question': question})


@user_passes_test(_is_staff)
def delete_question(request, question_id):
    get_object_or_404(Question, id=question_id).delete()
    messages.success(request, '题目已删除')
    return redirect('view_all_questions')


@user_passes_test(_is_staff)
def admin_dashboard(request):
    return render(request, 'questions/admin_dashboard.html', {
        'total_questions': Question.objects.count(),
        'total_users': User.objects.count(),
    })


@user_passes_test(_is_staff)
def view_all_questions(request):
    return render(request, 'questions/all_questions.html', {
        'questions': Question.objects.all().order_by('id'),
    })


@user_passes_test(_is_staff)
def view_user_stats(request, user_id):
    user = get_object_or_404(User, id=user_id)
    return render(request, 'questions/user_stats.html', {'target_user': user})


@user_passes_test(_is_staff)
def delete_user(request, user_id):
    user = get_object_or_404(User, id=user_id)
    if not user.is_superuser:
        user.delete()
        messages.success(request, '用户已删除')
    return redirect('view_all_questions')


@user_passes_test(_is_staff)
def unlock_ai(request, user_id):
    usage, _ = UserAIUsage.objects.get_or_create(user_id=user_id)
    usage.is_ai_unlocked = True
    usage.save(update_fields=['is_ai_unlocked'])
    return JsonResponse({'success': True})


@user_passes_test(_is_staff)
def ai_document_management(request):
    docs = AIDocument.objects.all().order_by('-uploaded_at')
    return render(request, 'questions/ai_document_management.html', {'documents': docs})


@user_passes_test(_is_staff)
def delete_ai_document(request, document_id):
    get_object_or_404(AIDocument, id=document_id).delete()
    return JsonResponse({'success': True})


# ============================================================
#  AI 助理
# ============================================================
@login_required
def ai_chat(request):
    if request.method == 'POST':
        usage, _ = UserAIUsage.objects.get_or_create(user=request.user)
        if usage.ai_usage_count >= usage.max_ai_usage and not usage.is_ai_unlocked:
            return JsonResponse({'error': 'AI 使用次数已达上限，请联系管理员解锁'}, status=403)
        msg = _body(request).get('message', '').strip()
        response = f"收到你的消息：{msg}（AI 助理占位回复）"
        AIChat.objects.create(user=request.user, message=msg, response=response)
        usage.ai_usage_count += 1
        usage.save(update_fields=['ai_usage_count'])
        return JsonResponse({'response': response})
    return JsonResponse({'error': 'method not allowed'}, status=405)


@login_required
def get_chat_history(request):
    chats = AIChat.objects.filter(user=request.user).order_by('-timestamp')[:50]
    return JsonResponse({'history': [{'m': c.message, 'r': c.response, 't': c.timestamp.isoformat()} for c in chats]})


@login_required
def reset_ai_chat(request):
    AIChat.objects.filter(user=request.user).delete()
    return JsonResponse({'success': True})


# ============================================================
#  模拟面试
# ============================================================
@login_required
def interview_home(request):
    sessions = InterviewSession.objects.filter(user=request.user)[:10]
    counts = {
        'all': Question.objects.count(),
        'mc': Question.objects.filter(type='选择题').count(),
        'sa': Question.objects.filter(type='简答题').count(),
    }
    return render(request, 'questions/interview_home.html', {'sessions': sessions, 'counts': counts})


@login_required
def interview_run(request, session_id):
    session = get_object_or_404(InterviewSession, id=session_id, user=request.user)
    answer = InterviewAnswer.objects.filter(session=session).order_by('order').first()
    q_json = json.dumps({'id': answer.question.id, 'q': answer.question.question, 'options': answer.question.options}) if answer else '{}'
    return render(request, 'questions/interview_run.html', {
        'session': session,
        'question_json': q_json,
        'index': 1,
        'total': session.total,
        'limit': 0,
    })


@login_required
def interview_answer(request, session_id):
    return JsonResponse({'success': True})


@login_required
def interview_submit(request, session_id):
    return JsonResponse({'success': True})


@login_required
def interview_report(request, session_id):
    session = get_object_or_404(InterviewSession, id=session_id, user=request.user)
    return render(request, 'questions/interview_report.html', {'session': session})


@login_required
def interview_history(request):
    sessions = InterviewSession.objects.filter(user=request.user)
    return render(request, 'questions/interview_history.html', {'sessions': sessions})


# ============================================================
#  学习中心通用：静态文件服务 + 进度 API
# ============================================================
QUEST_DIRS = {
    'k8s': '/workspace/k8s-quest',
    'langchain': '/workspace/langchain-quest',
}

# 每个学习中心的章节题目数（每章 10 题）
K8S_QUESTION_COUNTS = {
    '01-intro': 10, '02-arch': 10, '03-core': 10, '04-kubectl': 10, '05-setup': 10,
    '06-pod': 10, '07-deployment': 10, '08-workload': 10, '09-service': 10, '10-ingress': 10,
    '11-volume': 10, '12-pv-pvc': 10, '13-configmap': 10, '14-secret': 10, '15-rbac': 10,
    '16-scheduling': 10, '17-hpa': 10, '18-helm': 10, '19-monitor': 10, '20-troubleshoot': 10,
}
LANGCHAIN_QUESTION_COUNTS = {
    '01-intro': 10, '02-setup': 10, '03-llm-basics': 10, '04-prompt': 10, '05-chain': 10,
    '06-memory': 10, '07-data': 10, '08-embeddings': 10, '09-rag': 10, '10-retriever': 10,
    '11-agent': 10, '12-tools': 10, '13-lcel': 10, '14-multimodal': 10, '15-chatbot': 10,
    '16-eval': 10, '17-production': 10, '18-project-cs': 10, '19-project-kb': 10, '20-interview': 10,
}

MIME = {
    '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
    '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif',
    '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.webp': 'image/webp',
    '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf',
}


def _serve_quest_static(request, quest_key, asset_path=''):
    """服务学习中心的静态文件。"""
    root = QUEST_DIRS[quest_key]
    rel = asset_path or 'index.html'
    if rel == '' or rel == '/':
        rel = 'index.html'
    rel = rel.lstrip('/')
    # 防止路径穿越
    safe_rel = os.path.normpath(rel).replace('../', '')
    filepath = os.path.join(root, safe_rel)
    if not os.path.isfile(filepath) or not filepath.startswith(root):
        return HttpResponseNotFound('404 Not Found')
    ext = os.path.splitext(filepath)[1].lower()
    with open(filepath, 'rb') as f:
        content = f.read()
    return HttpResponse(content, content_type=MIME.get(ext, 'application/octet-stream'))


def _quest_progress(quest_key, user):
    """获取用户在某学习中心的进度模型。"""
    if quest_key == 'k8s':
        return K8sProgress.objects.get_or_create(user=user)[0]
    return LangChainProgress.objects.get_or_create(user=user)[0]


def _quest_question_counts(quest_key):
    return K8S_QUESTION_COUNTS if quest_key == 'k8s' else LANGCHAIN_QUESTION_COUNTS


# ============================================================
#  K8s 学习中心
# ============================================================
@login_required
def k8s_learning(request, asset_path=''):
    return _serve_quest_static(request, 'k8s', asset_path)


@csrf_exempt
@_api_login_required
def k8s_api_progress(request):
    prog = _quest_progress('k8s', request.user)
    return JsonResponse({
        'nickname': request.user.username,
        'stars': prog.stars,
        'chapters': prog.chapters,
    })


@csrf_exempt
def k8s_api_leaderboard(request):
    rows = K8sProgress.objects.select_related('user').order_by('-stars')[:50]
    return JsonResponse([
        {'user_id': r.user_id, 'nickname': r.user.username, 'stars': r.stars}
        for r in rows if r.stars > 0
    ], safe=False)


@csrf_exempt
@_api_login_required
def k8s_api_submit(request):
    body = _body(request)
    chapter_id = body.get('chapterId')
    question_id = body.get('questionId')
    star_count = int(body.get('starCount') or 0)
    if not chapter_id or not question_id or not star_count:
        return JsonResponse({'error': '参数不完整'}, status=400)
    prog = _quest_progress('k8s', request.user)
    chapters = prog.chapters
    ch = chapters.get(chapter_id, {'stars': 0, 'completed': False, 'questions': {}})
    if ch['questions'].get(question_id):
        return JsonResponse({'alreadyDone': True, 'stars': prog.stars})
    ch['questions'][question_id] = True
    ch['stars'] += star_count
    counts = _quest_question_counts('k8s')
    total_q = counts.get(chapter_id, 1)
    done_q = len(ch['questions'])
    bonus = 0
    if not ch['completed'] and done_q / total_q >= 0.8:
        ch['completed'] = True
        bonus = 5
        ch['stars'] += bonus
    chapters[chapter_id] = ch
    # 重新计算总星星 = 所有章节星星之和
    prog.stars = sum(c.get('stars', 0) for c in chapters.values())
    prog.chapters = chapters
    prog.save(update_fields=['stars', 'chapters'])
    return JsonResponse({
        'alreadyDone': False,
        'newStars': star_count + bonus,
        'stars': prog.stars,
        'chapterCompleted': ch['completed'],
    })


@csrf_exempt
@_api_login_required
def k8s_api_spend(request):
    body = _body(request)
    count = int(body.get('count') or 1)
    prog = _quest_progress('k8s', request.user)
    if prog.stars < count:
        return JsonResponse({'success': False, 'reason': 'stars', 'stars': prog.stars})
    prog.stars -= count
    prog.save(update_fields=['stars'])
    return JsonResponse({'success': True, 'stars': prog.stars})


# ============================================================
#  LangChain 学习中心
# ============================================================
@login_required
def langchain_learning(request, asset_path=''):
    return _serve_quest_static(request, 'langchain', asset_path)


@csrf_exempt
def langchain_api_login(request):
    """LangChain 学习中心登录：复用题库系统的 Django 用户认证。"""
    body = _body(request)
    username = body.get('username', '').strip()
    password = body.get('password', '')
    if not username or not password:
        return JsonResponse({'success': False, 'error': '请输入用户名和密码'}, status=400)
    user = authenticate(request, username=username, password=password)
    if user:
        login(request, user)
        return JsonResponse({
            'success': True,
            'userId': user.id,
            'nickname': user.username,
            'token': f'{user.id}:django',
        })
    return JsonResponse({'success': False, 'error': '用户名或密码错误'}, status=401)


@csrf_exempt
def langchain_api_register(request):
    """LangChain 学习中心注册：创建题库系统的 Django 用户。"""
    body = _body(request)
    username = body.get('username', '').strip()
    password = body.get('password', '')
    nickname = body.get('nickname', '').strip()
    if not username or not password:
        return JsonResponse({'success': False, 'error': '请输入用户名和密码'}, status=400)
    if len(username) < 2:
        return JsonResponse({'success': False, 'error': '用户名至少 2 个字符'}, status=400)
    if len(password) < 4:
        return JsonResponse({'success': False, 'error': '密码至少 4 个字符'}, status=400)
    if User.objects.filter(username=username).exists():
        return JsonResponse({'success': False, 'error': '用户名已存在'}, status=400)
    user = User.objects.create_user(username=username, password=password)
    UserAIUsage.objects.get_or_create(user=user)
    login(request, user)
    return JsonResponse({
        'success': True,
        'userId': user.id,
        'nickname': nickname or username,
        'token': f'{user.id}:django',
    })


@csrf_exempt
@_api_login_required
def langchain_api_progress(request):
    prog = _quest_progress('langchain', request.user)
    return JsonResponse({
        'nickname': request.user.username,
        'stars': prog.stars,
        'chapters': prog.chapters,
    })


@csrf_exempt
def langchain_api_leaderboard(request):
    rows = LangChainProgress.objects.select_related('user').order_by('-stars')[:50]
    return JsonResponse([
        {'user_id': r.user_id, 'nickname': r.user.username, 'stars': r.stars}
        for r in rows if r.stars > 0
    ], safe=False)


@csrf_exempt
@_api_login_required
def langchain_api_submit(request):
    body = _body(request)
    chapter_id = body.get('chapterId')
    question_id = body.get('questionId')
    star_count = int(body.get('starCount') or 0)
    if not chapter_id or not question_id or not star_count:
        return JsonResponse({'error': '参数不完整'}, status=400)
    prog = _quest_progress('langchain', request.user)
    chapters = prog.chapters
    ch = chapters.get(chapter_id, {'stars': 0, 'completed': False, 'questions': {}})
    if ch['questions'].get(question_id):
        return JsonResponse({'alreadyDone': True, 'stars': prog.stars})
    ch['questions'][question_id] = True
    ch['stars'] += star_count
    counts = _quest_question_counts('langchain')
    total_q = counts.get(chapter_id, 1)
    done_q = len(ch['questions'])
    bonus = 0
    if not ch['completed'] and done_q / total_q >= 0.8:
        ch['completed'] = True
        bonus = 5
        ch['stars'] += bonus
    chapters[chapter_id] = ch
    prog.stars = sum(c.get('stars', 0) for c in chapters.values())
    prog.chapters = chapters
    prog.save(update_fields=['stars', 'chapters'])
    return JsonResponse({
        'alreadyDone': False,
        'newStars': star_count + bonus,
        'stars': prog.stars,
        'chapterCompleted': ch['completed'],
    })


@csrf_exempt
@_api_login_required
def langchain_api_spend(request):
    body = _body(request)
    count = int(body.get('count') or 1)
    prog = _quest_progress('langchain', request.user)
    if prog.stars < count:
        return JsonResponse({'success': False, 'reason': 'stars', 'stars': prog.stars})
    prog.stars -= count
    prog.save(update_fields=['stars'])
    return JsonResponse({'success': True, 'stars': prog.stars})
