# 🎬 Video Platform — Видеоплатформа

Веб-приложение для загрузки, просмотра и комментирования видео.  
**Стек:** Django + React + JWT + SQLite

---

## 📦 Требования

| Компонент | Версия |
|-----------|--------|
| Python | 3.10+ |
| Node.js | 18+ |
| npm | 9+ |
| Git | любая |

---

## 🚀 Быстрый старт

### 1. Клонирование репозитория

```bash
git clone https://github.com/CherepanovAnton/Video-platform.git
cd Video-platform
```
### 2. Запуск бэкенда (Django)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate      # Linux/MacOS
# venv\Scripts\activate       # Windows

pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### 3. Запуск фронтенда (React)
В новом терминале:

```bash
cd frontend
npm install
npm start
```

### 4. Открыть сайт
Перейдите в браузере: http://localhost:8000
