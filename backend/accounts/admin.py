from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ("Profile", {"fields": ("display_name", "bio", "avatar")}),
    )
    list_display = ("username", "email", "display_name", "is_staff", "joined_at")
