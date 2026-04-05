# Образовательный симулятор кибербезопасности

> Интерактивная платформа для обучения основам кибербезопасности через геймифицированные сценарии и систему достижений.

## Реализованная функциональность

- Интерактивные сценарии кибератак с ветвящимися сюжетами(почтовый клиент, мессенджер, настройки телефона, браузер);
- Обучающие модули по 4 темам: фишинг, скимминг, подбор паролей, социальная инженерия (16 модулей с трёхэтапным прохождением: теория → сценарий → разбор ошибок);
- Система геймификации: опыт (XP), уровень безопасности (0–100), лиги (новичок / защитник / эксперт / мастер), достижения и таблица лидеров;
- Дашборд прогресса с визуализацией статистики, activity-heatmap и историей прохождения;
- JWT-аутентификация с access/refresh токенами, регистрация, вход, управление профилем;
- Интерактивные мини-игры: калькулятор надёжности пароля, детектив фишинга, диалог социальной инженерии, калькулятор платежных рисков;
- Теоретические справочники по кибербезопасности на основе материалов Минцифры, Касперского, Банка России, НКЦКИ, МВД.

## Особенности проекта

- Полноценные симуляторы реальных интерфейсов (почта, мессенджер, телефон, браузер, Wi-Fi) для погружения в сценарии атак;
- Система HP и таймер обратного отсчёта в миссиях, создающие эффект соревновательности и срочности;
- Автоматическая выдача сертификата при прохождении всех 16 обучающих модулей.

## Основной стек технологий

- FastAPI (Python 3.11+), SQLAlchemy 2.0, Alembic, Pydantic, Redis, WebSockets, JWT;
- Next.js 14 (App Router), TypeScript, TailwindCSS, Zustand, Framer Motion, Recharts;
- PostgreSQL 16, Redis 7;
- Docker Compose, Nginx.

## Демо

Демо сервиса доступно по адресу: http://cyber.devcore.com.ru

## СРЕДА ЗАПУСКА

- развёртывание сервиса производится на debian-like linux (debian 9+);
- требуется установленный Docker и Docker Compose;
- требуется установленный web-сервер Nginx (для production);
- требуется Python 3.11+ (для локальной разработки backend);
- требуется Node.js 18+ (для локальной разработки frontend);
- требуется СУБД PostgreSQL 16;
- требуется Redis 7 для кэширования и хранения refresh-токенов.

## УСТАНОВКА

### Установка зависимостей системы

```bash
sudo apt-get update
sudo apt-get upgrade
sudo apt-get install docker.io docker-compose-plugin
sudo apt-get install nginx
sudo apt-get install postgresql-16
sudo apt-get install redis-server
```

### Клонирование и запуск проекта

```bash
git clone <repository-url> cybershield
cd cybershield
```

### База данных

Необходимо создать пустую базу данных, а подключение к базе прописать в конфигурационный файл сервиса по адресу: `backend/.env`

```bash
sudo systemctl restart postgresql
sudo -u postgres psql
CREATE DATABASE cybershield;
CREATE USER cybershield_user WITH PASSWORD 'mypassword';
GRANT ALL PRIVILEGES ON DATABASE cybershield TO cybershield_user;
\q
```

Прописать подключение в `backend/.env`:

```
DATABASE_URL=postgresql+asyncpg://cybershield_user:mypassword@localhost:5432/cybershield
REDIS_URL=redis://localhost:6379/0
```

### Выполнение миграций

Для заполнения базы данных системной информацией выполните в директории `backend/`:

```bash
cd backend
alembic upgrade head
python -m app.seed.seed_scenarios
```

### Установка зависимостей проекта

**Backend:**

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

**Frontend:**

```bash
cd frontend
npm install
```

### Запуск

```bash
# Через Docker Compose (рекомендуется)
docker compose up --build

# Локальная разработка
# Backend:
cd backend && uvicorn app.main:app --reload --port 8000
# Frontend:
cd frontend && npm run dev
```

Приложение доступно:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Swagger UI: http://localhost:8000/docs

## РАЗРАБОТЧИКИ

- Крутых Николай Сергеевич — Backend разработчик — https://t.me/Tachg
- Чекулаев Артем Дмитриевич — Backend разработчик — https://t.me/X790YH161
- Оганесьянц Роман Павлович — Product Manager — https://t.me/r0man0g
- Панов Даниил Игорьевич — Frontend разработчик — https://t.me/dAndANnnnnnnnnnnmn
- Потапов Ярослав Михайлович — Frontend разработчик — https://t.me/yarkex

## Демонстрация




https://github.com/user-attachments/assets/23f63cfc-0835-44d3-8573-b31926ec1687


https://github.com/user-attachments/assets/3e238758-43d8-4d3d-881c-da6d62e676da



