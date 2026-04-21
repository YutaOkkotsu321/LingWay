from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    display_name = models.CharField(max_length=50, blank=True)
    bio = models.CharField(max_length=300, blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    joined_at = models.DateTimeField(auto_now_add=True)

class UserFlashcard(models.Model):
    DIFFICULTY_CHOICES = [('easy', 'easy'), ('medium', 'medium'), ('hard', 'hard')]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='flashcards')
    question = models.CharField(max_length=300)
    answer = models.CharField(max_length=300)
    category = models.CharField(max_length=60, default='Custom')
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default='easy')
    is_mastered = models.BooleanField(default=False)
    times_reviewed = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def to_dict(self):
        return {
            'id': self.id,
            'question': self.question,
            'answer': self.answer,
            'category': self.category,
            'difficulty': self.difficulty,
            'isMastered': self.is_mastered,
            'timesReviewed': self.times_reviewed,
            'source': 'user',
        }