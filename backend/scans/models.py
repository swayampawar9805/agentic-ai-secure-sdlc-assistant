from django.db import models
from django.contrib.auth.models import User
from projects.models import Project


class Scan(models.Model):

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('running', 'Running'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]

    SCAN_TYPE_CHOICES = [
        ('full', 'Full Security Scan'),
        ('sast', 'Static Analysis'),
        ('dependency', 'Dependency Scan'),
        ('secrets', 'Secret Scan'),
    ]

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name='scans'
    )

    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='scans'
    )

    scan_type = models.CharField(
        max_length=50,
        choices=SCAN_TYPE_CHOICES,
        default='full'
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )

    error_message = models.TextField(
        blank=True,
        default=""
    )

    started_at = models.DateTimeField(
        null=True,
        blank=True
    )

    completed_at = models.DateTimeField(
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return (
            f"{self.project.name} - "
            f"{self.scan_type} - "
            f"{self.status}"
        )


class Finding(models.Model):

    SEVERITY_CHOICES = [
        ('critical', 'Critical'),
        ('high', 'High'),
        ('medium', 'Medium'),
        ('low', 'Low'),
        ('info', 'Informational'),
    ]

    STATUS_CHOICES = [
        ('open', 'Open'),
        ('resolved', 'Resolved'),
        ('ignored', 'Ignored'),
    ]

    scan = models.ForeignKey(
        Scan,
        on_delete=models.CASCADE,
        related_name='findings'
    )

    severity = models.CharField(
        max_length=20,
        choices=SEVERITY_CHOICES
    )

    title = models.CharField(
        max_length=255
    )

    description = models.TextField(
        blank=True
    )

    file_path = models.CharField(
        max_length=500,
        blank=True
    )

    line_number = models.PositiveIntegerField(
        null=True,
        blank=True
    )

    rule_id = models.CharField(
        max_length=255,
        blank=True
    )

    tool = models.CharField(
        max_length=100,
        blank=True
    )

    remediation = models.TextField(
        blank=True
    )

    
    VALIDATION_STATUS_CHOICES = [
        ('not_applicable', 'Not applicable'),
        ('needs_review', 'Needs advisory review'),
        ('advisory_verified', 'Advisory verified'),
        ('severity_discrepancy', 'Severity discrepancy'),
    ]

    validation_status = models.CharField(
        max_length=30,
        choices=VALIDATION_STATUS_CHOICES,
        default='not_applicable',
    )

    scanner_severity = models.CharField(
        max_length=20,
        blank=True,
        default='',
    )

    cvss_score = models.DecimalField(
        max_digits=4,
        decimal_places=1,
        null=True,
        blank=True,
    )

    cvss_version = models.CharField(
        max_length=10,
        blank=True,
        default='',
    )

    cvss_vector = models.CharField(
        max_length=255,
        blank=True,
        default='',
    )

    installed_version = models.CharField(
        max_length=100,
        blank=True,
        default='',
    )

    advisory_severity = models.CharField(
        max_length=20,
        blank=True,
        default='',
    )

    fixed_version = models.CharField(
        max_length=100,
        blank=True,
        default='',
    )

    advisory_url = models.URLField(
        max_length=1000,
        blank=True,
        default='',
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='open'
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return (
            f"{self.severity.upper()} - "
            f"{self.title}"
        )
