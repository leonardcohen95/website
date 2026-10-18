from django.db import models
from django.contrib.auth.models import User

class Question(models.Model):
    """题库模型"""
    QUESTION_TYPES = [
        ('选择题', '选择题'),
        ('简答题', '简答题'),
    ]
    
    id = models.IntegerField(primary_key=True, verbose_name='题目ID')
    type = models.CharField(max_length=10, choices=QUESTION_TYPES, verbose_name='题目类型')
    question = models.TextField(verbose_name='题目内容')
    options = models.JSONField(default=list, verbose_name='选项列表')
    answer = models.TextField(verbose_name='正确答案')
    analysis = models.TextField(verbose_name='答案解析')
    
    class Meta:
        verbose_name = '题目'
        verbose_name_plural = '题目'
    
    def __str__(self):
        return f'{self.id}. {self.question}'

class UserAnswer(models.Model):
    """用户答案模型"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='关联用户', null=True)
    question = models.ForeignKey(Question, on_delete=models.CASCADE, verbose_name='关联题目')
    user_answer = models.TextField(verbose_name='用户答案')
    saved_at = models.DateTimeField(auto_now_add=True, verbose_name='保存时间')
    
    class Meta:
        verbose_name = '用户答案'
        verbose_name_plural = '用户答案'
        unique_together = ('user', 'question')  # 确保每个用户对每个题目只有一个答案

class AIDocument(models.Model):
    """AI助理文档模型"""
    title = models.CharField(max_length=200, verbose_name='文档标题')
    file = models.FileField(upload_to='documents/', verbose_name='上传文件')
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='上传用户')
    uploaded_at = models.DateTimeField(auto_now_add=True, verbose_name='上传时间')
    file_type = models.CharField(max_length=50, verbose_name='文件类型')
    content = models.TextField(blank=True, verbose_name='提取的文本内容')
    
    class Meta:
        verbose_name = 'AI文档'
        verbose_name_plural = 'AI文档'
    
    def __str__(self):
        return self.title

class AIChat(models.Model):
    """AI助理对话模型"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='对话用户')
    message = models.TextField(verbose_name='用户消息')
    response = models.TextField(verbose_name='AI回复')
    timestamp = models.DateTimeField(auto_now_add=True, verbose_name='对话时间')
    
    class Meta:
        verbose_name = 'AI对话'
        verbose_name_plural = 'AI对话'
        ordering = ['-timestamp']  # 按时间倒序排列


class UserAIUsage(models.Model):
    """用户AI使用限制模型"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, verbose_name='关联用户')
    ai_usage_count = models.IntegerField(default=0, verbose_name='AI使用次数')
    is_ai_unlocked = models.BooleanField(default=False, verbose_name='是否解禁AI')
    max_ai_usage = models.IntegerField(default=3, verbose_name='最大AI使用次数')
    
    class Meta:
        verbose_name = '用户AI使用限制'
        verbose_name_plural = '用户AI使用限制'
    
    def __str__(self):
        return f'{self.user.username} - AI使用限制'


class InterviewSession(models.Model):
    """模拟面试会话（一场面试）"""
    MODE_CHOICES = [
        ('all', '综合面试'),
        ('mc', '选择题专场'),
        ('sa', '简答题专场'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='用户')
    mode = models.CharField(max_length=8, choices=MODE_CHOICES, default='all', verbose_name='面试模式')
    question_ids = models.JSONField(default=list, verbose_name='题目ID顺序')
    total = models.IntegerField(default=0, verbose_name='题目总数')
    correct = models.IntegerField(default=0, verbose_name='答对题数')
    score = models.IntegerField(default=0, verbose_name='得分(0-100)')
    is_finished = models.BooleanField(default=False, verbose_name='是否已完成')
    started_at = models.DateTimeField(auto_now_add=True, verbose_name='开始时间')
    finished_at = models.DateTimeField(null=True, blank=True, verbose_name='结束时间')
    duration_seconds = models.IntegerField(default=0, verbose_name='用时(秒)')

    class Meta:
        verbose_name = '模拟面试'
        verbose_name_plural = '模拟面试'
        ordering = ['-started_at']

    def __str__(self):
        return f'{self.user.username} - {self.get_mode_display()} - {self.started_at:%Y-%m-%d %H:%M}'


class InterviewAnswer(models.Model):
    """模拟面试的单题作答记录"""
    session = models.ForeignKey(InterviewSession, on_delete=models.CASCADE, related_name='answers', verbose_name='所属面试')
    question = models.ForeignKey(Question, on_delete=models.CASCADE, verbose_name='关联题目')
    order = models.IntegerField(default=0, verbose_name='题序')
    user_answer = models.TextField(blank=True, verbose_name='用户答案')
    is_correct = models.BooleanField(default=False, verbose_name='是否正确')
    similarity = models.FloatField(default=0, verbose_name='简答题相似度')

    class Meta:
        verbose_name = '面试作答'
        verbose_name_plural = '面试作答'
        ordering = ['order']

    def __str__(self):
        return f'{self.session_id} #{self.order} Q{self.question_id}'


class K8sProgress(models.Model):
    """K8s 学习中心（k8s-quest 站点）的用户进度，按题库系统用户存储。"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='k8s_progress', verbose_name='关联用户')
    stars = models.IntegerField(default=0, verbose_name='总星星数')
    # {章节ID: {completed: bool, stars: int, questions: {题ID: True}}}
    chapters = models.JSONField(default=dict, verbose_name='章节进度')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')

    class Meta:
        verbose_name = 'K8s学习进度'
        verbose_name_plural = 'K8s学习进度'
        ordering = ['-stars']

    def __str__(self):
        return f'{self.user.username} - ⭐{self.stars}'


class LangChainProgress(models.Model):
    """LangChain 学习中心（langchain-quest 站点）的用户进度，按题库系统用户存储。"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='langchain_progress', verbose_name='关联用户')
    stars = models.IntegerField(default=0, verbose_name='总星星数')
    # {章节ID: {completed: bool, stars: int, questions: {题ID: True}}}
    chapters = models.JSONField(default=dict, verbose_name='章节进度')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')

    class Meta:
        verbose_name = 'LangChain学习进度'
        verbose_name_plural = 'LangChain学习进度'
        ordering = ['-stars']

    def __str__(self):
        return f'{self.user.username} - ⭐{self.stars}'


class Pet(models.Model):
    """用户养的电子乌龟，每个用户一只。"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='pet', verbose_name='主人')
    species = models.CharField(max_length=32, verbose_name='品种ID')
    name = models.CharField(max_length=32, verbose_name='昵称')
    exp = models.IntegerField(default=0, verbose_name='经验值')
    age_seconds = models.IntegerField(default=0, verbose_name='龟龄(累计访问秒数)')
    hp_add = models.IntegerField(default=0, verbose_name='血量加点(已分配)')
    pow_add = models.IntegerField(default=0, verbose_name='武力加点(已分配)')
    decor = models.CharField(max_length=32, blank=True, default='', verbose_name='已装备装饰ID')
    accessory = models.CharField(max_length=64, blank=True, default='', verbose_name='已佩戴外饰ID')
    ball_kick_at = models.DateTimeField(null=True, blank=True, verbose_name='上次踢球加经验时间')
    ball_out = models.BooleanField(default=False, verbose_name='逗龟小球是否已放出')
    weapon = models.CharField(max_length=32, blank=True, default='', verbose_name='已装备武器ID')
    armor = models.CharField(max_length=32, blank=True, default='', verbose_name='已装备防具ID')
    pk_date = models.DateField(null=True, blank=True, verbose_name='上次对战日期')
    pk_count = models.IntegerField(default=0, verbose_name='当日已对战次数')
    pk_refresh_date = models.DateField(null=True, blank=True, verbose_name='上次刷新对手日期')
    pk_refresh_count = models.IntegerField(default=0, verbose_name='当日已刷新对手次数')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='领养时间')

    class Meta:
        verbose_name = '宠物'
        verbose_name_plural = '宠物'

    def __str__(self):
        return f'{self.user.username} 的 {self.name}'


class InventoryItem(models.Model):
    """用户背包中的商品（食物/玩具/装饰）。"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='items', verbose_name='所属用户')
    item_id = models.CharField(max_length=32, verbose_name='商品ID')
    quantity = models.IntegerField(default=1, verbose_name='数量')
    acquired_at = models.DateTimeField(auto_now_add=True, verbose_name='获得时间')

    class Meta:
        verbose_name = '背包道具'
        verbose_name_plural = '背包道具'
        unique_together = ('user', 'item_id')

    def __str__(self):
        return f'{self.user.username} - {self.item_id} x{self.quantity}'


class StarLedger(models.Model):
    """星星流水（审计）：正数为获得，负数为消费。"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='star_ledger', verbose_name='用户')
    delta = models.IntegerField(verbose_name='变动值')
    balance = models.IntegerField(default=0, verbose_name='变动后余额')
    reason = models.CharField(max_length=32, verbose_name='原因')
    ref = models.CharField(max_length=64, blank=True, default='', verbose_name='关联对象')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='时间')

    class Meta:
        verbose_name = '星星流水'
        verbose_name_plural = '星星流水'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user.username} {self.delta:+d} ({self.reason})'

