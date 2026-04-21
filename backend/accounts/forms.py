from django import forms
from django.contrib.auth import get_user_model
from django.contrib.auth.forms import (
    UserCreationForm,
    AuthenticationForm,
    PasswordChangeForm,
)

User = get_user_model()


class RegisterForm(UserCreationForm):
    email = forms.EmailField(required=True)

    class Meta:
        model = User
        fields = ("username", "email", "password1", "password2")

    def clean_email(self):
        email = self.cleaned_data.get("email", "").strip()
        if email and User.objects.filter(email__iexact=email).exists():
            raise forms.ValidationError("A user with this email already exists.")
        return email


class LoginForm(AuthenticationForm):
    username = forms.CharField(
        widget=forms.TextInput(attrs={"placeholder": "Enter your username", "autocomplete": "username"})
    )
    password = forms.CharField(
        widget=forms.PasswordInput(attrs={"placeholder": "Enter your password", "autocomplete": "current-password"})
    )


class ProfileForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ("display_name", "bio", "email")
        widgets = {
            "display_name": forms.TextInput(attrs={"placeholder": "Your display name"}),
            "bio": forms.Textarea(attrs={"placeholder": "Tell us about yourself...", "rows": 3}),
            "email": forms.EmailInput(attrs={"placeholder": "you@example.com"}),
        }


class ChangePasswordForm(PasswordChangeForm):
    old_password = forms.CharField(
        widget=forms.PasswordInput(attrs={"placeholder": "Enter current password", "autocomplete": "current-password"})
    )
    new_password1 = forms.CharField(
        widget=forms.PasswordInput(attrs={"placeholder": "At least 8 characters", "autocomplete": "new-password"})
    )
    new_password2 = forms.CharField(
        widget=forms.PasswordInput(attrs={"placeholder": "Repeat new password", "autocomplete": "new-password"})
    )
