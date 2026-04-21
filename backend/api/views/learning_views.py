import random
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import (
    GrammarTopic, VocabularyWord, UserFavoriteWord,
    Flashcard, UserFlashcardProgress,
)
from ..serializers import (
    GrammarTopicSerializer, VocabularyWordSerializer, FlashcardSerializer,
)


# ════════════════════════════════════════════════════════════════════════════
# CLASS-BASED VIEWS (CBV — APIView)
# ════════════════════════════════════════════════════════════════════════════

class GrammarTopicListView(APIView):
    """GET /api/grammar/ — list all grammar topics (with nested rules & exercises)."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        topics = GrammarTopic.objects.prefetch_related('rules', 'exercises').all()
        level = request.query_params.get('level')
        category = request.query_params.get('category')
        if level:
            topics = topics.filter(level=level)
        if category:
            topics = topics.filter(category__iexact=category)
        serializer = GrammarTopicSerializer(topics, many=True)
        return Response(serializer.data)


class GrammarTopicDetailView(APIView):
    """GET/PUT/DELETE /api/grammar/{id}/ — full CRUD for a single topic."""
    permission_classes = [IsAuthenticated]

    def _get_object(self, pk):
        try:
            return GrammarTopic.objects.prefetch_related('rules', 'exercises').get(pk=pk)
        except GrammarTopic.DoesNotExist:
            return None

    def get(self, request, pk):
        topic = self._get_object(pk)
        if not topic:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(GrammarTopicSerializer(topic).data)

    def put(self, request, pk):
        topic = self._get_object(pk)
        if not topic:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = GrammarTopicSerializer(topic, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, pk):
        topic = self._get_object(pk)
        if not topic:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        topic.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class VocabularyListView(APIView):
    """GET /api/vocabulary/ — list words, supports ?category= and ?search=."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        category = request.query_params.get('category', '')
        search = request.query_params.get('search', '')

        if search:
            words = VocabularyWord.objects.search(search, category if category else None)
        elif category:
            words = VocabularyWord.objects.by_category(category)
        else:
            words = VocabularyWord.objects.all()

        serializer = VocabularyWordSerializer(words, many=True, context={'request': request})
        return Response(serializer.data)


class FlashcardListView(APIView):
    """GET /api/flashcards/ — list all flashcards with per-user progress."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cards = list(Flashcard.objects.all())
        if request.query_params.get('shuffle') == 'true':
            random.shuffle(cards)
        serializer = FlashcardSerializer(cards, many=True, context={'request': request})
        return Response(serializer.data)


class UserFavoriteListView(APIView):
    """GET /api/vocabulary/favorites/ — list current user's favorited words."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        words = VocabularyWord.objects.filter(favorited_by__user=request.user)
        serializer = VocabularyWordSerializer(words, many=True, context={'request': request})
        return Response(serializer.data)


# ════════════════════════════════════════════════════════════════════════════
# FUNCTION-BASED VIEWS (FBV — requirement: 2, learning module alone has 4)
# ════════════════════════════════════════════════════════════════════════════

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_favorite_view(request, pk):
    """POST /api/vocabulary/{id}/favorite/ — toggle word as favorite."""
    try:
        word = VocabularyWord.objects.get(pk=pk)
    except VocabularyWord.DoesNotExist:
        return Response({'detail': 'Word not found.'}, status=status.HTTP_404_NOT_FOUND)

    favorite, created = UserFavoriteWord.objects.get_or_create(user=request.user, word=word)
    if not created:
        favorite.delete()

    serializer = VocabularyWordSerializer(word, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def flashcard_master_view(request, pk):
    """POST /api/flashcards/{id}/master/ — mark flashcard as mastered."""
    try:
        card = Flashcard.objects.get(pk=pk)
    except Flashcard.DoesNotExist:
        return Response({'detail': 'Flashcard not found.'}, status=status.HTTP_404_NOT_FOUND)

    progress, _ = UserFlashcardProgress.objects.get_or_create(user=request.user, flashcard=card)
    progress.is_mastered = True
    progress.times_reviewed += 1
    progress.save()

    return Response(FlashcardSerializer(card, context={'request': request}).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def flashcard_practice_view(request, pk):
    """POST /api/flashcards/{id}/practice/ — mark flashcard as needs practice."""
    try:
        card = Flashcard.objects.get(pk=pk)
    except Flashcard.DoesNotExist:
        return Response({'detail': 'Flashcard not found.'}, status=status.HTTP_404_NOT_FOUND)

    progress, _ = UserFlashcardProgress.objects.get_or_create(user=request.user, flashcard=card)
    progress.is_mastered = False
    progress.times_reviewed += 1
    progress.save()

    return Response(FlashcardSerializer(card, context={'request': request}).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def flashcard_reset_view(request):
    """POST /api/flashcards/reset/ — reset all user progress for flashcards."""
    UserFlashcardProgress.objects.filter(user=request.user).update(
        is_mastered=False, times_reviewed=0
    )
    cards = Flashcard.objects.all()
    serializer = FlashcardSerializer(cards, many=True, context={'request': request})
    return Response(serializer.data)
