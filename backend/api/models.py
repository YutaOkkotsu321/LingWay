from django.db import models
from django.contrib.auth.models import User


# ── Custom Manager ──────────────────────────────────────────────────────────

class VocabularyWordManager(models.Manager):
    """Custom manager: filter by category and full-text search."""

    def by_category(self, category):
        return self.filter(category=category)

    def search(self, query, category=None):
        qs = self.filter(
            models.Q(word__icontains=query) | models.Q(definition__icontains=query)
        )
        if category:
            qs = qs.filter(category=category)
        return qs


# ── Model 1: UserProfile ────────────────────────────────────────────────────

class UserProfile(models.Model):
    """Extended profile linked to Django's built-in User (1-to-1)."""

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    display_name = models.CharField(max_length=100, blank=True)
    bio = models.TextField(blank=True)
    avatar = models.URLField(blank=True)
    joined_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Profile({self.user.username})'


# ── Model 2: GrammarTopic ───────────────────────────────────────────────────

class GrammarTopic(models.Model):
    LEVEL_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ]

    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES)
    category = models.CharField(max_length=100)
    examples = models.JSONField(default=list, blank=True)

    class Meta:
        ordering = ['level', 'title']

    def __str__(self):
        return self.title


# ── Model 3: GrammarRule (FK → GrammarTopic) ───────────────────────────────

class GrammarRule(models.Model):
    topic = models.ForeignKey(GrammarTopic, on_delete=models.CASCADE, related_name='rules')
    title = models.CharField(max_length=200)
    explanation = models.TextField()
    formula = models.CharField(max_length=300, blank=True)
    examples = models.JSONField(default=list)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f'{self.topic.title} — {self.title}'


# ── Model 4: Exercise (FK → GrammarTopic) ──────────────────────────────────

class Exercise(models.Model):
    topic = models.ForeignKey(GrammarTopic, on_delete=models.CASCADE, related_name='exercises')
    question = models.TextField()
    options = models.JSONField(null=True, blank=True)
    correct_answer = models.CharField(max_length=500)
    explanation = models.TextField(blank=True)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f'Exercise: {self.question[:60]}'


# ── Model 5: VocabularyWord ─────────────────────────────────────────────────

class VocabularyWord(models.Model):
    CATEGORY_CHOICES = [
        ('business', 'Business'),
        ('academic', 'Academic'),
        ('everyday', 'Everyday'),
    ]

    word = models.CharField(max_length=100)
    part_of_speech = models.CharField(max_length=50)
    definition = models.TextField()
    example = models.TextField()
    synonyms = models.JSONField(default=list)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    audio_url = models.URLField(blank=True)

    objects = VocabularyWordManager()

    class Meta:
        ordering = ['category', 'word']

    def __str__(self):
        return f'{self.word} ({self.category})'


# ── Model 6: UserFavoriteWord (FK → User, FK → VocabularyWord) ─────────────

class UserFavoriteWord(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorite_words')
    word = models.ForeignKey(VocabularyWord, on_delete=models.CASCADE, related_name='favorited_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'word')
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user.username} ♥ {self.word.word}'


# ── Model 7: Flashcard ──────────────────────────────────────────────────────

class Flashcard(models.Model):
    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ]

    question = models.TextField()
    answer = models.TextField()
    category = models.CharField(max_length=100)
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES)

    class Meta:
        ordering = ['category', 'difficulty']

    def __str__(self):
        return f'Card: {self.question[:60]}'


# ── Model 8: UserFlashcardProgress (FK → User, FK → Flashcard) ─────────────

class UserFlashcardProgress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='flashcard_progress')
    flashcard = models.ForeignKey(Flashcard, on_delete=models.CASCADE, related_name='user_progress')
    is_mastered = models.BooleanField(default=False)
    times_reviewed = models.PositiveIntegerField(default=0)
    last_reviewed = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'flashcard')

    def __str__(self):
        return f'{self.user.username} — {self.flashcard.question[:40]}'
