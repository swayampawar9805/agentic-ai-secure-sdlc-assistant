from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import Project
from .serializers import ProjectSerializer


class ProjectListCreateView(generics.ListCreateAPIView):

    serializer_class = ProjectSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        return (
            Project.objects
            .filter(
                created_by=self.request.user
            )
            .select_related('created_by')
            .order_by('-created_at')
        )

    def perform_create(self, serializer):

        serializer.save(
            created_by=self.request.user
        )


class ProjectDetailView(
    generics.RetrieveUpdateDestroyAPIView
):

    serializer_class = ProjectSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        return (
            Project.objects
            .filter(
                created_by=self.request.user
            )
            .select_related('created_by')
        )