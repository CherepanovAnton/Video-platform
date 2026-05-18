from django.http import FileResponse, Http404
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Video, Comment
from .serializers import VideoSerializer, CommentSerializer
from django.contrib.auth.models import User
import os

class VideoListView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        videos = Video.objects.all().order_by('-uploaded_at')
        serializer = VideoSerializer(videos, many=True)
        return Response(serializer.data)

class VideoUploadView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def post(self, request):
        serializer = VideoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(uploaded_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VideoDetailView(APIView):
    def get(self, request, pk):
        video = get_object_or_404(Video, pk=pk)
        serializer = VideoSerializer(video)
        return Response(serializer.data)
    
    def delete(self, request, pk):
        video = get_object_or_404(Video, pk=pk)
        video.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class VideoStreamView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request, pk):
        video = get_object_or_404(Video, pk=pk)
        video_path = video.video_file.path
        
        if not os.path.exists(video_path):
            raise Http404()
        
        response = FileResponse(open(video_path, 'rb'), content_type='video/mp4')
        response['Content-Length'] = os.path.getsize(video_path)
        response['Content-Disposition'] = 'inline'
        return response

class CommentListView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request, video_id):
        comments = Comment.objects.filter(video_id=video_id).order_by('-created_at')
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data)
    
    def post(self, request, video_id):
        if not request.user.is_authenticated:
            return Response({'error': 'Unauthorized'}, status=401)
        
        # Проверка: есть ли поле text в запросе
        text = request.data.get('text')
        if not text:
            return Response({'error': 'text field is required'}, status=400)
        
        comment = Comment.objects.create(
            video_id=video_id,
            user=request.user,
            text=text
        )
        serializer = CommentSerializer(comment)
        return Response(serializer.data, status=201)

class RegisterView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        password2 = request.data.get('password2')
        
        if not username or not password:
            return Response({'error': 'Username and password required'}, status=400)
        
        if password != password2:
            return Response({'error': 'Passwords do not match'}, status=400)
        
        if User.objects.filter(username=username).exists():
            return Response({'error': 'User already exists'}, status=400)
        
        # Создаём пользователя в обход валидации пароля
        user = User(username=username)
        user.set_password(password)
        user.save()
        
        return Response({'message': 'User created successfully'}, status=201)