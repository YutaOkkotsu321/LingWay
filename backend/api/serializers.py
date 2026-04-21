from django.contrib.auth.models import User
from rest_framework import serializers
from .models import (
    UserProfile, GrammarTopic, GrammarRule, Exercise,
    VocabularyWord, UserFavoriteWord, Flashcard, UserFlashcardProgress,
)


# ════════════════════════════════════════════════════════════════════════════
# PLAIN SERIALIZERS  (serializers.Serializer — requirement: 2, we have 4)
# ════════════════════════════════════════════════════════════════════════════

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True)


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    confirmPassword = serializers.CharField(write_only=True)

    def validate(self, data):
        if data['password'] != data['confirmPassword']:
            raise serializers.ValidationError({'confirmPassword': 'Passwords do not match.'})
        if User.objects.filter(username=data['username']).exists():
            raise serializers.ValidationError({'username': 'This username is already taken.'})
        if User.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError({'email': 'This email is already registered.'})
        return data


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)

    def validate_new_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError('Password must be at least 8 characters.')
        return value


class UpdateProfileSerializer(serializers.Serializer):
    displayName = serializers.CharField(max_length=100, required=False, allow_blank=True)
    bio = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField(required=False)


# ════════════════════════════════════════════════════════════════════════════
# MODEL SERIALIZERS  (serializers.ModelSerializer — requirement: 2, we have 6)
# ════════════════════════════════════════════════════════════════════════════

class UserSerializer(serializers.ModelSerializer):
    displayName = serializers.CharField(source='profile.display_name', default='')
    bio = serializers.CharField(source='profile.bio', default='')
    avatar = serializers.CharField(source='profile.avatar', default='')
    joinedAt = serializers.DateTimeField(source='profile.joined_at', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'displayName', 'bio', 'avatar', 'joinedAt']
        read_only_fields = ['id', 'username', 'joinedAt']


class GrammarRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = GrammarRule
        fields = ['id', 'title', 'explanation', 'formula', 'examples']


class ExerciseSerializer(serializers.ModelSerializer):
    correctAnswer = serializers.CharField(source='correct_answer')

    class Meta:
        model = Exercise
        fields = ['id', 'question', 'options', 'correctAnswer', 'explanation']


class GrammarTopicSerializer(serializers.ModelSerializer):
    rules = GrammarRuleSerializer(many=True, read_only=True)
    exercises = ExerciseSerializer(many=True, read_only=True)

    class Meta:
        model = GrammarTopic
        fields = ['id', 'title', 'slug', 'description', 'level', 'category', 'examples', 'rules', 'exercises']


class VocabularyWordSerializer(serializers.ModelSerializer):
    partOfSpeech = serializers.CharField(source='part_of_speech')
    audioUrl = serializers.CharField(source='audio_url', default='')
    isFavorited = serializers.SerializerMethodField()

    class Meta:
        model = VocabularyWord
        fields = ['id', 'word', 'partOfSpeech', 'definition', 'example', 'synonyms', 'category', 'isFavorited', 'audioUrl']

    def get_isFavorited(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return UserFavoriteWord.objects.filter(user=request.user, word=obj).exists()
        return False


class FlashcardSerializer(serializers.ModelSerializer):
    isMastered = serializers.SerializerMethodField()
    timesReviewed = serializers.SerializerMethodField()

    class Meta:
        model = Flashcard
        fields = ['id', 'question', 'answer', 'category', 'difficulty', 'isMastered', 'timesReviewed']

    def get_isMastered(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            progress = UserFlashcardProgress.objects.filter(
                user=request.user, flashcard=obj
            ).first()
            return progress.is_mastered if progress else False
        return False

    def get_timesReviewed(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            progress = UserFlashcardProgress.objects.filter(
                user=request.user, flashcard=obj
            ).first()
            return progress.times_reviewed if progress else 0
        return 0
