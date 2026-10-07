from rest_framework import serializers

from .models import Project


class ProjectSerializer(serializers.ModelSerializer):

    created_by_username = serializers.CharField(
        source='created_by.username',
        read_only=True
    )

    class Meta:

        model = Project

        fields = [
            'id',
            'name',
            'description',
            'language',
            'framework',
            'source_type',
            'repository_url',
            'source_archive',
            'default_branch',
            'status',
            'created_by',
            'created_by_username',
            'created_at',
            'updated_at',
        ]

        read_only_fields = [
            'id',
            'created_by',
            'created_by_username',
            'created_at',
            'updated_at',
        ]


    def validate(self, data):

        source_type = data.get(
            'source_type'
        )

        repository_url = data.get(
            'repository_url',
            ''
        )

        source_archive = data.get(
            'source_archive'
        )


        if (
            source_type == 'github'
            and not repository_url
        ):

            raise serializers.ValidationError({
                'repository_url':
                    'GitHub projects require a repository URL.'
            })


        if (
            source_type == 'zip'
            and repository_url
        ):

            raise serializers.ValidationError({
                'repository_url':
                    'ZIP projects should not have a repository URL.'
            })


        if (
            source_type == 'zip'
            and not source_archive
        ):

            raise serializers.ValidationError({
                'source_archive':
                    'ZIP projects require a ZIP file.'
            })


        if (
            source_type == 'github'
            and source_archive
        ):

            raise serializers.ValidationError({
                'source_archive':
                    'GitHub projects should not have a ZIP file.'
            })


        return data