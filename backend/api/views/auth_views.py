from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from ..models import UserProfile
from ..serializers import (
    LoginSerializer, RegisterSerializer,
    ChangePasswordSerializer, UpdateProfileSerializer, UserSerializer,
)


# ── helpers ──────────────────────────────────────────────────────────────────

def _get_tokens(user):
    refresh = RefreshToken.for_user(user)
    return {'refresh': str(refresh), 'access': str(refresh.access_token)}


def _ensure_profile(user):
    UserProfile.objects.get_or_create(user=user)


# ════════════════════════════════════════════════════════════════════════════
# FUNCTION-BASED VIEWS  (FBV — requirement: 2, auth module alone has 4)
# ════════════════════════════════════════════════════════════════════════════

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """Authenticate user and return JWT pair."""
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    user = authenticate(
        username=serializer.validated_data['username'],
        password=serializer.validated_data['password'],
    )
    if not user:
        return Response({'detail': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)

    _ensure_profile(user)
    return Response(_get_tokens(user), status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """Create a new user account."""
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    data = serializer.validated_data
    user = User.objects.create_user(
        username=data['username'],
        email=data['email'],
        password=data['password'],
    )
    UserProfile.objects.create(user=user, display_name=data['username'])
    return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """Blacklist the refresh token to log out."""
    refresh_token = request.data.get('refresh')
    if not refresh_token:
        return Response({'detail': 'Refresh token required.'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        token = RefreshToken(refresh_token)
        token.blacklist()
    except TokenError:
        return Response({'detail': 'Token is invalid or already expired.'}, status=status.HTTP_400_BAD_REQUEST)
    return Response({'detail': 'Successfully logged out.'}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password_view(request):
    """Change authenticated user's password."""
    serializer = ChangePasswordSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    user = request.user
    if not user.check_password(serializer.validated_data['old_password']):
        return Response({'detail': 'Current password is incorrect.'}, status=status.HTTP_400_BAD_REQUEST)

    user.set_password(serializer.validated_data['new_password'])
    user.save()
    return Response({'detail': 'Password changed successfully.'}, status=status.HTTP_200_OK)


# ════════════════════════════════════════════════════════════════════════════
# CLASS-BASED VIEWS  (CBV — APIView)
# ════════════════════════════════════════════════════════════════════════════

class UserProfileView(APIView):
    """GET /api/auth/me/ — return profile; PATCH — update it."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        _ensure_profile(request.user)
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        serializer = UpdateProfileSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        data = serializer.validated_data

        if 'email' in data:
            user.email = data['email']
            user.save()

        profile, _ = UserProfile.objects.get_or_create(user=user)
        if 'displayName' in data:
            profile.display_name = data['displayName']
        if 'bio' in data:
            profile.bio = data['bio']
        profile.save()

        return Response(UserSerializer(user).data)


class TokenRefreshView(APIView):
    """POST /api/auth/token/refresh/ — return new access token."""
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({'detail': 'Refresh token required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            token = RefreshToken(refresh_token)
            return Response({'access': str(token.access_token)})
        except TokenError:
            return Response({'detail': 'Invalid or expired refresh token.'}, status=status.HTTP_401_UNAUTHORIZED)
