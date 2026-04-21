import json

from .models import UserFlashcard
from django.contrib import messages
from django.contrib.auth import login, logout, update_session_auth_hash
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse, HttpResponseBadRequest
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse
from django.views.decorators.http import require_http_methods, require_POST
from .forms import ChangePasswordForm, LoginForm, ProfileForm, RegisterForm
from django.views.decorators.csrf import csrf_exempt

VALID_DIFFICULTIES = {'easy', 'medium', 'hard'}


# ── USER FLASHCARDS (custom cards created by the user) ─────────────────────

@csrf_exempt
@login_required
@require_http_methods(["GET", "POST"])
def user_flashcards(request):
    if request.method == "GET":
        cards = [c.to_dict() for c in request.user.flashcards.all()]
        return JsonResponse({'flashcards': cards})

    try:
        data = json.loads(request.body or b"{}")
    except json.JSONDecodeError:
        return HttpResponseBadRequest("Invalid JSON")

    question = (data.get('question') or '').strip()
    answer = (data.get('answer') or '').strip()
    if not question or not answer:
        return JsonResponse({'error': 'question and answer are required'}, status=400)

    difficulty = data.get('difficulty', 'easy')
    if difficulty not in VALID_DIFFICULTIES:
        difficulty = 'easy'

    card = UserFlashcard.objects.create(
        user=request.user,
        question=question[:300],
        answer=answer[:300],
        category=(data.get('category') or 'Custom').strip()[:60] or 'Custom',
        difficulty=difficulty,
    )
    return JsonResponse(card.to_dict(), status=201)


@csrf_exempt
@login_required
@require_POST
def user_flashcards_clear(request):
    deleted, _ = request.user.flashcards.all().delete()
    return JsonResponse({'deleted': deleted})


@csrf_exempt
@login_required
@require_POST
def user_flashcards_reset(request):
    request.user.flashcards.all().update(is_mastered=False, times_reviewed=0)
    return JsonResponse({'status': 'ok'})


@csrf_exempt
@login_required
@require_POST
def user_flashcard_master(request, card_id):
    card = get_object_or_404(UserFlashcard, pk=card_id, user=request.user)
    card.is_mastered = True
    card.times_reviewed += 1
    card.save()
    return JsonResponse(card.to_dict())


@csrf_exempt
@login_required
@require_POST
def user_flashcard_practice(request, card_id):
    card = get_object_or_404(UserFlashcard, pk=card_id, user=request.user)
    card.is_mastered = False
    card.times_reviewed += 1
    card.save()
    return JsonResponse(card.to_dict())
def register_view(request):
    if request.user.is_authenticated:
        return redirect("profile")

    if request.method == "POST":
        form = RegisterForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, "Account created! Welcome aboard.")
            return redirect("profile")
    else:
        form = RegisterForm()

    return render(request, "accounts/register.html", {"form": form})


def login_view(request):
    if request.user.is_authenticated:
        return redirect("profile")

    if request.method == "POST":
        form = LoginForm(request, data=request.POST)
        if form.is_valid():
            login(request, form.get_user())
            next_url = request.GET.get("next") or request.POST.get("next")
            return redirect(next_url or "profile")
    else:
        form = LoginForm(request)

    return render(request, "accounts/login.html", {"form": form})


@require_http_methods(["POST"])
def logout_view(request):
    logout(request)
    messages.success(request, "You have been logged out.")
    return redirect("login")


@login_required
def profile_view(request):
  
    profile_form = ProfileForm(instance=request.user)
    password_form = ChangePasswordForm(request.user)

    if request.method == "POST":
        action = request.POST.get("action")

        if action == "update_profile":
            profile_form = ProfileForm(request.POST, instance=request.user)
            if profile_form.is_valid():
                profile_form.save()
                messages.success(request, "Profile updated successfully!")
                return redirect("profile")

        elif action == "change_password":
            password_form = ChangePasswordForm(request.user, request.POST)
            if password_form.is_valid():
                user = password_form.save()
                update_session_auth_hash(request, user)
                messages.success(request, "Password changed successfully!")
                return redirect("profile")

        elif action == "delete_account":
            confirm = request.POST.get("confirm_username", "")
            if confirm == request.user.username:
                request.user.delete()
                logout(request)
                messages.success(request, "Your account has been deleted.")
                return redirect("login")
            messages.error(request, "Username confirmation did not match.")
            return redirect("profile")

    return render(
        request,
        "accounts/profile.html",
        {"profile_form": profile_form, "password_form": password_form},
    )


def me_api(request):
    if not request.user.is_authenticated:
        return JsonResponse({"authenticated": False}, status=401)
    user = request.user
    return JsonResponse(
        {
            "authenticated": True,
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "display_name": user.display_name,
            "profile_url": reverse("profile"),
            "logout_url": reverse("logout"),
        }
    )
