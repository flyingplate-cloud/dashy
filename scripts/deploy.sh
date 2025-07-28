#!/bin/bash

# Скрипт для деплоя Dashy на Cloudflare Workers
# Использование: ./scripts/deploy.sh [environment]

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функция для вывода сообщений
log() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Проверка аргументов
ENVIRONMENT=${1:-production}

if [[ "$ENVIRONMENT" != "production" && "$ENVIRONMENT" != "staging" ]]; then
    error "Неверное окружение. Используйте 'production' или 'staging'"
    exit 1
fi

log "Начинаем деплой Dashy в окружение: $ENVIRONMENT"

# Проверка наличия wrangler
if ! command -v wrangler &> /dev/null; then
    error "Wrangler CLI не установлен. Установите его: npm install -g wrangler"
    exit 1
fi

# Проверка аутентификации
log "Проверяем аутентификацию в Cloudflare..."
if ! wrangler whoami &> /dev/null; then
    error "Не авторизованы в Cloudflare. Выполните: wrangler login"
    exit 1
fi

success "Аутентификация прошла успешно"

# Установка зависимостей
log "Устанавливаем зависимости..."
npm install

# Сборка приложения
log "Собираем приложение..."
npm run build

if [ $? -ne 0 ]; then
    error "Ошибка при сборке приложения"
    exit 1
fi

success "Приложение собрано успешно"

# Проверка наличия KV namespace
log "Проверяем KV namespace..."
if ! wrangler kv:namespace list | grep -q "DASHY_CONFIG"; then
    warning "KV namespace DASHY_CONFIG не найден. Создаем..."
    wrangler kv:namespace create "DASHY_CONFIG"
    log "Обновите wrangler.toml с полученными ID namespace"
    exit 1
fi

# Деплой
log "Деплоим в Cloudflare Workers..."
if [ "$ENVIRONMENT" = "production" ]; then
    npm run deploy:production
else
    npm run deploy:staging
fi

if [ $? -ne 0 ]; then
    error "Ошибка при деплое"
    exit 1
fi

success "Деплой завершен успешно!"

# Получение URL
log "Получаем информацию о деплое..."
WORKER_URL=$(wrangler info --format json | jq -r '.url' 2>/dev/null || echo "Не удалось получить URL")

if [ "$WORKER_URL" != "null" ] && [ "$WORKER_URL" != "" ]; then
    success "Ваше приложение доступно по адресу: $WORKER_URL"
    
    log "Проверяем API endpoints..."
    echo "  - Статус: $WORKER_URL/api/status"
    echo "  - Конфигурация: $WORKER_URL/api/config"
    echo "  - Здоровье: $WORKER_URL/api/health"
else
    warning "Не удалось получить URL приложения"
fi

# Проверка работоспособности
log "Проверяем работоспособность..."
if curl -s "$WORKER_URL/api/status" > /dev/null 2>&1; then
    success "Приложение работает корректно"
else
    warning "Не удалось проверить работоспособность приложения"
fi

log "Деплой завершен!"
log "Для настройки конфигурации используйте:"
echo "  curl -X POST $WORKER_URL/api/config -H 'Content-Type: application/json' -d @examples/config-example.json"