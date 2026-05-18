from rest_framework import serializers
from .models import Video, Comment

class VideoSerializer(serializers.ModelSerializer):
    uploaded_by_username = serializers.ReadOnlyField(source='uploaded_by.username')
    
    class Meta:
        model = Video
        fields = ['id', 'title', 'description', 'video_file', 'thumbnail', 'uploaded_by_username', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']

class CommentSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source='user.username')
    
    class Meta:
        model = Comment
        fields = ['id', 'video', 'user', 'user_name', 'text', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']