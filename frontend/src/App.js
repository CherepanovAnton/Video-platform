import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'http://127.0.0.1:8000/api';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [videos, setVideos] = useState([]);
  const [login, setLogin] = useState({ username: '', password: '' });
  const [upload, setUpload] = useState({ title: '', description: '', file: null });
  const [showRegister, setShowRegister] = useState(false);
  const [register, setRegister] = useState({ username: '', password: '', password2: '' });
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState({});
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (token) {
      fetchVideos();
    }
  }, [token]);

  useEffect(() => {
    if (token && videos.length > 0) {
      videos.forEach(video => {
        fetchComments(video.id);
      });
    }
  }, [videos, token]);

  const fetchVideos = async () => {
    const res = await axios.get(`${API_URL}/videos/`);
    setVideos(res.data);
  };

  const fetchComments = async (videoId) => {
    try {
      const res = await axios.get(`${API_URL}/videos/${videoId}/comments/`);
      setComments(prev => ({ ...prev, [videoId]: res.data }));
    } catch (error) {
      console.error('Ошибка загрузки комментариев');
    }
  };

  const handleAddComment = async (videoId) => {
    const commentText = newComment[videoId];
    if (!commentText || !commentText.trim()) return;
    
    try {
      await axios.post(
        `${API_URL}/videos/${videoId}/comments/`,
        { text: commentText },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setNewComment(prev => ({ ...prev, [videoId]: '' }));
      fetchComments(videoId);
    } catch (error) {
      alert('Ошибка добавления комментария');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/token/`, login);
      localStorage.setItem('token', res.data.access);
      setToken(res.data.access);
    } catch (error) {
      alert('Ошибка входа');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (register.password !== register.password2) {
      alert('Пароли не совпадают');
      return;
    }
    try {
      await axios.post(`${API_URL}/register/`, {
        username: register.username,
        password: register.password,
        password2: register.password2
      });
      alert('Регистрация успешна, теперь войдите');
      setShowRegister(false);
      setRegister({ username: '', password: '', password2: '' });
    } catch (error) {
      alert('Ошибка регистрации');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!upload.file) {
      alert('Выберите файл');
      return;
    }
    
    const formData = new FormData();
    formData.append('title', upload.title || 'Без названия');
    formData.append('video_file', upload.file);
    if (upload.description) {
      formData.append('description', upload.description);
    }
    
    try {
      await axios.post(`${API_URL}/videos/upload/`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      fetchVideos();
      setUpload({ title: '', description: '', file: null });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      alert('Видео загружено');
    } catch (error) {
      console.error('Ошибка:', error.response?.data);
      alert('Ошибка загрузки: ' + JSON.stringify(error.response?.data));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить видео?')) return;
    try {
      await axios.delete(`${API_URL}/videos/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchVideos();
    } catch (error) {
      alert('Ошибка удаления');
    }
  };

  if (!token) {
    return (
      <div className="auth-page">
        <div className="auth-logo">
          <img src="/logo.png" alt="Логотип" />
        </div>
        <div className="auth-card">
          {!showRegister ? (
            <>
              <h1>Вход</h1>
              <form onSubmit={handleLogin}>
                <input type="text" placeholder="Логин" onChange={e => setLogin({...login, username: e.target.value})} />
                <input type="password" placeholder="Пароль" onChange={e => setLogin({...login, password: e.target.value})} />
                <button type="submit">Войти</button>
              </form>
              <button className="link-btn" onClick={() => setShowRegister(true)}>Нет аккаунта? Зарегистрироваться</button>
            </>
          ) : (
            <>
              <h1>Регистрация</h1>
              <form onSubmit={handleRegister}>
                <input type="text" placeholder="Логин" onChange={e => setRegister({...register, username: e.target.value})} />
                <input type="password" placeholder="Пароль" onChange={e => setRegister({...register, password: e.target.value})} />
                <input type="password" placeholder="Повторите пароль" onChange={e => setRegister({...register, password2: e.target.value})} />
                <button type="submit">Зарегистрироваться</button>
              </form>
              <button className="link-btn" onClick={() => setShowRegister(false)}>Уже есть аккаунт? Войти</button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="app-logo">
        <img src="/logo.png" alt="Логотип" />
      </div>
      <button className="logout-btn-fixed" onClick={() => { localStorage.removeItem('token'); setToken(null); }}>Выйти</button>

      <div className="upload-section">
        <h2>Загрузить видео</h2>
        <form onSubmit={handleUpload}>
          <input 
            type="text" 
            placeholder="Название" 
            value={upload.title} 
            onChange={e => setUpload({...upload, title: e.target.value})} 
          />
          <input 
            type="text" 
            placeholder="Описание (необязательно)" 
            value={upload.description} 
            onChange={e => setUpload({...upload, description: e.target.value})} 
          />
          <input 
            type="file" 
            accept="video/*" 
            ref={fileInputRef}
            onChange={e => setUpload({...upload, file: e.target.files[0]})} 
          />
          <button type="submit">Загрузить</button>
        </form>
      </div>

      <div className="video-grid">
        {videos.map(video => (
          <div className="video-card" key={video.id}>
            <h3>{video.title}</h3>
            <video controls src={`${API_URL}/videos/stream/${video.id}/`} />
            <p>{video.description}</p>
            <button className="delete-btn" onClick={() => handleDelete(video.id)}>Удалить</button>
            
            <div className="comments-section">
              <h4>Комментарии</h4>
              <div className="comments-list">
                {(comments[video.id] || []).map(comment => (
                  <div key={comment.id} className="comment">
                    <strong>{comment.user_name}</strong>: {comment.text}
                  </div>
                ))}
              </div>
              <div className="add-comment">
                <input 
                  type="text" 
                  placeholder="Написать комментарий..." 
                  value={newComment[video.id] || ''}
                  onChange={e => setNewComment(prev => ({ ...prev, [video.id]: e.target.value }))}
                />
                <button onClick={() => handleAddComment(video.id)}>Отправить</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;