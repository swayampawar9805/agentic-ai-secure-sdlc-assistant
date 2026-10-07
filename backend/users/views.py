from django.contrib.auth.models import User

from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import (
    RegisterSerializer,
    UserSerializer,
)


class RegisterView(generics.CreateAPIView):

    queryset = User.objects.all()

    serializer_class = RegisterSerializer

    permission_classes = [
        AllowAny
    ]


class CurrentUserView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request):

        serializer = UserSerializer(
            request.user
        )

        return Response(
            serializer.data
        )


class ProfileView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request):

        serializer = UserSerializer(
            request.user
        )

        return Response(
            serializer.data
        )

    def patch(self, request):

        serializer = UserSerializer(
            request.user,
            data=request.data,
            partial=True
        )

        serializer.is_valid(
            raise_exception=True
        )

        serializer.save()

        return Response(
            serializer.data
        )

class LogoutView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def post(self, request):

        refresh_token = request.data.get(
            'refresh'
        )

        if not refresh_token:
            return Response(
                {
                    'detail': 'Refresh token is required.'
                },
                status=400
            )

        try:

            token = RefreshToken(
                refresh_token
            )

            token.blacklist()

            return Response(
                {
                    'detail': 'Successfully logged out.'
                }
            )

        except Exception:

            return Response(
                {
                    'detail': 'Invalid refresh token.'
                },
                status=400
            )