from rest_framework import serializers

from .models import (
    Scan,
    Finding,
)


class ScanSerializer(
    serializers.ModelSerializer
):

    project_name = serializers.CharField(
        source='project.name',
        read_only=True
    )

    created_by_username = serializers.CharField(
        source='created_by.username',
        read_only=True
    )

    finding_count = serializers.IntegerField(
        read_only=True
    )

    class Meta:
        model = Scan

        fields = [
            'id',
            'project',
            'project_name',
            'created_by',
            'created_by_username',
            'scan_type',
            'status',
            'finding_count',
            'started_at',
            'completed_at',
            'created_at',
            'updated_at',
        ]

        read_only_fields = [
            'id',
            'created_by',
            'created_by_username',
            'project_name',
            'finding_count',
            'status',
            'started_at',
            'completed_at',
            'created_at',
            'updated_at',
        ]


class FindingSerializer(
    serializers.ModelSerializer
):

    scan_id = serializers.IntegerField(
        source='scan.id',
        read_only=True
    )

    class Meta:
        model = Finding

        fields = [
            'id',
            'scan',
            'scan_id',
            'severity',
            'title',
            'description',
            'file_path',
            'line_number',
            'rule_id',
            'tool',
            'remediation',
            'status',
            'created_at',
            'updated_at',
        ]

        read_only_fields = [
            'id',
            'scan_id',
            'created_at',
            'updated_at',
        ]