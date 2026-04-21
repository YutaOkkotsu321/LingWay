from django.contrib import admin
from django.urls import include, path
from accounts import views as account_views

urlpatterns = [
    path("admin/", admin.site.urls),
    path("accounts/", include("accounts.urls")),
    path("api/auth/me/", account_views.me_api, name="me_api"),
    path("", account_views.login_view, name="root"),
    path("api/flashcards/my/", account_views.user_flashcards, name="user_flashcards"),
    path("api/flashcards/my/clear/", account_views.user_flashcards_clear, name="user_flashcards_clear"),
    path("api/flashcards/my/reset/", account_views.user_flashcards_reset, name="user_flashcards_reset"),
    path("api/flashcards/my/<int:card_id>/master/", account_views.user_flashcard_master, name="user_flashcard_master"),
    path("api/flashcards/my/<int:card_id>/practice/", account_views.user_flashcard_practice, name="user_flashcard_practice"),
]
