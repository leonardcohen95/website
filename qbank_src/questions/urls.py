from django.urls import path

from questions import views
from questions import rag_views
from questions import pet_views

urlpatterns = [
    path('', views.index, name='index'),
    path('register/', views.user_register, name='register'),
    path('login/', views.user_login, name='login'),
    path('logout/', views.user_logout, name='logout'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('bookshelf/', views.bookshelf, name='bookshelf'),
    path('start-quiz/', views.start_quiz, name='start_quiz'),
    path('question/<int:question_id>/', views.answer_question, name='answer_question'),
    path('question/<int:question_id>/save/', views.save_answer, name='save_answer'),
    path('question/<int:question_id>/show/', views.show_answer, name='show_answer'),
    path('backend/add/', views.add_question, name='add_question'),
    path('backend/edit/<int:question_id>/', views.edit_question, name='edit_question'),
    path('backend/delete/<int:question_id>/', views.delete_question, name='delete_question'),
    path('admin/dashboard/', views.admin_dashboard, name='admin_dashboard'),
    path('admin/questions/', views.view_all_questions, name='view_all_questions'),
    path('admin/users/<int:user_id>/stats/', views.view_user_stats, name='view_user_stats'),
    path('admin/users/<int:user_id>/delete/', views.delete_user, name='delete_user'),
    path('admin/users/<int:user_id>/unlock-ai/', views.unlock_ai, name='unlock_ai'),
    path('admin/ai-documents/', views.ai_document_management, name='ai_document_management'),
    path('admin/ai-documents/<int:document_id>/delete/', views.delete_ai_document, name='delete_ai_document'),
    path('ai/chat/', views.ai_chat, name='ai_chat'),
    path('ai/chat/history/', views.get_chat_history, name='get_chat_history'),
    path('reset_ai_chat/', views.reset_ai_chat, name='reset_ai_chat'),

    # ================ 模拟面试路由（AI 助教改造：模拟面试官） ================
    path('interview/', views.interview_home, name='interview_home'),
    path('interview/<int:session_id>/', views.interview_run, name='interview_run'),
    path('interview/<int:session_id>/answer/', views.interview_answer, name='interview_answer'),
    path('interview/<int:session_id>/submit/', views.interview_submit, name='interview_submit'),
    path('interview/<int:session_id>/report/', views.interview_report, name='interview_report'),
    path('interview/history/', views.interview_history, name='interview_history'),

    # ================ K8s 学习中心（搬运自静态站点 k8s-quest） ================
    path('k8s-learning/', views.k8s_learning, name='k8s_learning'),
    path('k8s-learning/<path:asset_path>', views.k8s_learning, name='k8s_learning_asset'),

    # K8s 学习中心服务端接口（进度持久化 + 全站共享排行榜）
    path('api/progress', views.k8s_api_progress, name='k8s_api_progress'),
    path('api/leaderboard', views.k8s_api_leaderboard, name='k8s_api_leaderboard'),
    path('api/submit', views.k8s_api_submit, name='k8s_api_submit'),
    path('api/spend', views.k8s_api_spend, name='k8s_api_spend'),

    # ================ LangChain 学习中心（搬运自静态站点 langchain-quest） ================
    path('langchain-learning/', views.langchain_learning, name='langchain_learning'),
    path('langchain-learning/<path:asset_path>', views.langchain_learning, name='langchain_learning_asset'),

    # LangChain 学习中心服务端接口（进度持久化 + 全站共享排行榜）
    path('langchain-api/login', views.langchain_api_login, name='langchain_api_login'),
    path('langchain-api/register', views.langchain_api_register, name='langchain_api_register'),
    path('langchain-api/progress', views.langchain_api_progress, name='langchain_api_progress'),
    path('langchain-api/leaderboard', views.langchain_api_leaderboard, name='langchain_api_leaderboard'),
    path('langchain-api/submit', views.langchain_api_submit, name='langchain_api_submit'),
    path('langchain-api/spend', views.langchain_api_spend, name='langchain_api_spend'),


    # ================ 宠物养成 + 星星商店（星星来自 K8s 学习中心答题） ================
    path('pet/', pet_views.pet_page, name='pet_page'),
    path('shop/', pet_views.shop_page, name='shop_page'),
    path('api/pet/status', pet_views.api_pet_status, name='api_pet_status'),
    path('api/pet/adopt', pet_views.api_pet_adopt, name='api_pet_adopt'),
    path('api/pet/feed', pet_views.api_pet_feed, name='api_pet_feed'),
    path('api/pet/play', pet_views.api_pet_play, name='api_pet_play'),
    path('api/pet/ball-kick', pet_views.api_pet_ball_kick, name='api_pet_ball_kick'),
    path('api/pet/equip', pet_views.api_pet_equip, name='api_pet_equip'),
    path('api/pet/alloc', pet_views.api_pet_alloc, name='api_pet_alloc'),
    path('api/pet/tick', pet_views.api_pet_tick, name='api_pet_tick'),
    path('api/shop/items', pet_views.api_shop_items, name='api_shop_items'),
    path('api/shop/buy', pet_views.api_shop_buy, name='api_shop_buy'),
    path('api/shop/sell', pet_views.api_shop_sell, name='api_shop_sell'),

    # 对战：对手列表 + 发起挑战（服务端结算）
    path('api/pet/pk-opponents', pet_views.api_pet_pk_opponents, name='api_pet_pk_opponents'),
    path('api/pet/pk', pet_views.api_pet_pk, name='api_pet_pk'),

    # 宠物龟排行榜：武力值 / 等级 / 龟龄 / 对战胜场
    path('api/pet/leaderboard', pet_views.api_pet_leaderboard, name='api_pet_leaderboard'),


    # ================ RAG 知识库路由（统一前缀 knowledge-base/） ================
    # 页面
    path('knowledge-base/', rag_views.knowledge_base, name='knowledge_base'),
    # AJAX - 所有登录用户
    path('knowledge-base/ask/',        rag_views.kb_ask_api,         name='kb_ask'),
    path('knowledge-base/stats/',      rag_views.kb_stats_api,       name='kb_stats'),
    path('knowledge-base/progress/<str:task_id>/', rag_views.kb_progress_api, name='kb_progress'),
    # AJAX - 仅管理员
    path('knowledge-base/upload/',     rag_views.kb_upload_api,      name='kb_upload'),
    path('knowledge-base/reindex/',    rag_views.kb_reindex_api,     name='kb_reindex'),
    path('knowledge-base/reset-quota/',rag_views.kb_reset_quota_api, name='kb_reset_quota'),
    path('knowledge-base/doc/<path:doc_path>/delete/', rag_views.kb_delete_doc_api, name='kb_delete_doc'),
]
