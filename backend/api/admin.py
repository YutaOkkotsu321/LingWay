from django.contrib import admin
from .models import (
    UserProfile, GrammarTopic, GrammarRule, Exercise,
    VocabularyWord, UserFavoriteWord, Flashcard, UserFlashcardProgress,
)


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'display_name', 'joined_at']
    search_fields = ['user__username', 'display_name']


class GrammarRuleInline(admin.TabularInline):
    model = GrammarRule
    extra = 1


class ExerciseInline(admin.TabularInline):
    model = Exercise
    extra = 1


@admin.register(GrammarTopic)
class GrammarTopicAdmin(admin.ModelAdmin):
    list_display = ['title', 'level', 'category', 'slug']
    list_filter = ['level', 'category']
    search_fields = ['title', 'slug']
    prepopulated_fields = {'slug': ('title',)}
    inlines = [GrammarRuleInline, ExerciseInline]


@admin.register(GrammarRule)
class GrammarRuleAdmin(admin.ModelAdmin):
    list_display = ['title', 'topic', 'order']
    list_filter = ['topic']


@admin.register(Exercise)
class ExerciseAdmin(admin.ModelAdmin):
    list_display = ['question', 'topic', 'correct_answer']
    list_filter = ['topic']


@admin.register(VocabularyWord)
class VocabularyWordAdmin(admin.ModelAdmin):
    list_display = ['word', 'part_of_speech', 'category']
    list_filter = ['category', 'part_of_speech']
    search_fields = ['word', 'definition']


@admin.register(UserFavoriteWord)
class UserFavoriteWordAdmin(admin.ModelAdmin):
    list_display = ['user', 'word', 'created_at']
    list_filter = ['user']


@admin.register(Flashcard)
class FlashcardAdmin(admin.ModelAdmin):
    list_display = ['question', 'category', 'difficulty']
    list_filter = ['category', 'difficulty']


@admin.register(UserFlashcardProgress)
class UserFlashcardProgressAdmin(admin.ModelAdmin):
    list_display = ['user', 'flashcard', 'is_mastered', 'times_reviewed', 'last_reviewed']
    list_filter = ['user', 'is_mastered']
