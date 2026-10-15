from rest_framework import generics
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count

from .models import Scan, Finding
from .serializers import ScanSerializer, FindingSerializer
from .services import run_scan


class ScanListCreateView(generics.ListCreateAPIView):
    serializer_class = ScanSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            Scan.objects
            .filter(created_by=self.request.user)
            .select_related("project", "created_by")
            .annotate(finding_count=Count("findings"))
            .order_by("-created_at")
        )

    def perform_create(self, serializer):
        project = serializer.validated_data["project"]

        # Ensure the project belongs to the logged-in user.
        if project.created_by != self.request.user:
            raise PermissionDenied(
                "You do not have permission "
                "to create a scan for this project."
            )

        # Save the scan before starting the scanner.
        scan = serializer.save(
            created_by=self.request.user
        )

        # run_scan saves the failure status and error message
        # before raising an exception.
        try:
            run_scan(scan)
        except Exception:
            scan.refresh_from_db()

        # DRF serializes the updated scan after this method returns.


class ScanDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ScanSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            Scan.objects
            .filter(created_by=self.request.user)
            .select_related("project", "created_by")
        )


class FindingListCreateView(generics.ListCreateAPIView):
    serializer_class = FindingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = (
            Finding.objects
            .filter(scan__created_by=self.request.user)
            .select_related("scan", "scan__project")
            .order_by("-created_at")
        )

        scan_id = self.request.query_params.get("scan")

        if scan_id:
            queryset = queryset.filter(scan_id=scan_id)

        return queryset

    def perform_create(self, serializer):
        scan = serializer.validated_data["scan"]

        if scan.created_by != self.request.user:
            raise PermissionDenied(
                "You do not have permission "
                "to add findings to this scan."
            )

        serializer.save()


class FindingDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = FindingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            Finding.objects
            .filter(scan__created_by=self.request.user)
            .select_related("scan", "scan__project")
        )
