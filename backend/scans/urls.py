from django.urls import path

from .views import (
    ScanListCreateView,
    ScanDetailView,
    FindingListCreateView,
    FindingDetailView,
)


urlpatterns = [

    path(
        '',
        ScanListCreateView.as_view(),
        name='scan-list-create'
    ),

    path(
        '<int:pk>/',
        ScanDetailView.as_view(),
        name='scan-detail'
    ),

]
