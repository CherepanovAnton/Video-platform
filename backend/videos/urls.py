from django.urls import path
from . import views

urlpatterns = [
    path('videos/', views.VideoListView.as_view(), name='video-list'),
    path('videos/upload/', views.VideoUploadView.as_view(), name='video-upload'),
    path('videos/<int:pk>/', views.VideoDetailView.as_view(), name='video-detail'),
    path('videos/stream/<int:pk>/', views.VideoStreamView.as_view(), name='video-stream'),
    path('videos/<int:video_id>/comments/', views.CommentListView.as_view(), name='comments'),
]