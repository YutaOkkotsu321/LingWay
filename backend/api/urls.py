from django.urls import path
from .views.auth_views import (
    login_view, register_view, logout_view,
    change_password_view, UserProfileView, TokenRefreshView,
)
from .views.learning_views import (
    GrammarTopicListView, GrammarTopicDetailView,
    VocabularyListView, UserFavoriteListView,
    FlashcardListView,
    toggle_favorite_view,
    flashcard_master_view, flashcard_practice_view, flashcard_reset_view,
)

urlpatterns = [
    # ── Auth ─────────────────────────────────────────────────────────────
    path('auth/login/',           login_view,           name='login'),
    path('auth/register/',        register_view,        name='register'),
    path('auth/logout/',          logout_view,          name='logout'),
    path('auth/me/',              UserProfileView.as_view(), name='profile'),
    path('auth/token/refresh/',   TokenRefreshView.as_view(), name='token-refresh'),
    path('auth/change-password/', change_password_view, name='change-password'),

    # ── Grammar ───────────────────────────────────────────────────────────
    path('grammar/',     GrammarTopicListView.as_view(),  name='grammar-list'),
    path('grammar/<int:pk>/', GrammarTopicDetailView.as_view(), name='grammar-detail'),

    # ── Vocabulary ────────────────────────────────────────────────────────
    path('vocabulary/',                     VocabularyListView.as_view(),    name='vocabulary-list'),
    path('vocabulary/favorites/',           UserFavoriteListView.as_view(),  name='vocabulary-favorites'),
    path('vocabulary/<int:pk>/favorite/',   toggle_favorite_view,            name='vocabulary-favorite-toggle'),

    # ── Flashcards ────────────────────────────────────────────────────────
    path('flashcards/',                   FlashcardListView.as_view(),   name='flashcard-list'),
    path('flashcards/reset/',             flashcard_reset_view,          name='flashcard-reset'),
    path('flashcards/<int:pk>/master/',   flashcard_master_view,         name='flashcard-master'),
    path('flashcards/<int:pk>/practice/', flashcard_practice_view,       name='flashcard-practice'),
]
