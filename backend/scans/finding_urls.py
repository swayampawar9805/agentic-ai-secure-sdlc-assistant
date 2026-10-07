from django.urls import path

from .views import (
    FindingListCreateView,
    FindingDetailView,
)


urlpatterns = [

    path(
        '',
        FindingListCreateView.as_view(),
        name='finding-list-create'
    ),

    path(
        '<int:pk>/',
        FindingDetailView.as_view(),
        name='finding-detail'
    ),

]
