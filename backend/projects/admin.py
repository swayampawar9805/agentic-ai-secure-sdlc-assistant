from django.contrib import admin

# Register your models here.
from django.contrib import admin

from .models import Project


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):

    list_display = [
        'name',
        'created_by',
        'status',
        'default_branch',
        'created_at',
    ]

    list_filter = [
        'status',
        'created_at',
    ]

    search_fields = [
        'name',
        'description',
        'repository_url',
    ]