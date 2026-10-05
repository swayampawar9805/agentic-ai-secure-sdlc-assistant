from django.db import models
from projects.models import Project
from django.contrib.auth.models import User


class Scan(models.Model):

    SCAN_TYPES = [
        ('full', 'Full Scan'),
        ('code', 'Code Scan'),
        ('dependency', 'Dependency Scan'),
        ('threat', 'Threat Scan'),
    ]

    STATUS_CHOICES = [
        ('queued', 'Queued'),
        ('running', 'Running'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name='scans'
    )

    scan_type = models.CharField(
        max_length=30,
        choices=SCAN_TYPES
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='queued'
    )

    triggered_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    started_at = models.DateTimeField(
        null=True,
        blank=True
    )

    completed_at = models.DateTimeField(
        null=True,
        blank=True
    )

    summary = models.JSONField(
        default=dict,
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.project.name} - {self.scan_type}"