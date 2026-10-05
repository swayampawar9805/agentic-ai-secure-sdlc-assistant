from django.db import models
from django.contrib.auth.models import User


class Project(models.Model):

    STATUS_CHOICES = [
        ('active', 'Active'),
        ('archived', 'Archived'),
    ]

    name = models.CharField(max_length=200)

    description = models.TextField(
        blank=True
    )

    repository_url = models.URLField(
        blank=True
    )

    default_branch = models.CharField(
        max_length=100,
        default='main'
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='active'
    )

    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='projects'
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return self.name