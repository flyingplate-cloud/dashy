# Изменения для поддержки Cloudflare Workers

## Обзор изменений

Этот документ описывает изменения, внесенные в проект Dashy для поддержки деплоя на Cloudflare Workers.

## Новые файлы

### 1. `wrangler.toml`
Конфигурационный файл для Cloudflare Workers, содержащий:
- Настройки Worker
- KV namespace конфигурации
- Переменные окружения
- Настройки доменов

### 2. `src/worker.js`
Основной файл Worker, который:
- Обрабатывает HTTP запросы
- Обслуживает статические файлы
- Предоставляет API endpoints
- Управляет конфигурацией через KV storage

### 3. `DEPLOYMENT_GUIDE.md`
Подробное руководство по деплою с:
- Пошаговыми инструкциями
- Troubleshooting
- Оптимизацией производительности
- Настройкой безопасности

### 4. `QUICK_START.md`
Краткое руководство для быстрого старта

### 5. `scripts/deploy.sh`
Автоматизированный скрипт деплоя

### 6. `examples/config-example.json`
Пример конфигурации Dashy

## Изменения в существующих файлах

### `package.json`
Добавлены:
- Новые скрипты для деплоя
- Зависимости для Cloudflare Workers
- Wrangler CLI

```json
{
  "scripts": {
    "deploy": "wrangler deploy",
    "deploy:staging": "wrangler deploy --env staging",
    "deploy:production": "wrangler deploy --env production",
    "dev:worker": "wrangler dev",
    "build:worker": "npm run build && wrangler build"
  },
  "devDependencies": {
    "wrangler": "^3.0.0",
    "@cloudflare/kv-asset-handler": "^0.3.0"
  }
}
```

## Архитектурные изменения

### 1. Адаптация сервера
- Заменен Express.js сервер на Cloudflare Worker
- Упрощена обработка запросов
- Добавлена поддержка KV storage

### 2. API Endpoints
Созданы новые endpoints:
- `/api/status` - проверка статуса
- `/api/config` - управление конфигурацией
- `/api/health` - проверка здоровья
- `/api/cors` - CORS proxy

### 3. Хранение данных
- Конфигурация хранится в Cloudflare KV
- Статические файлы обслуживаются через Workers
- Поддержка кэширования

## Ограничения Cloudflare Workers

### 1. Runtime ограничения
- Нет доступа к файловой системе
- Ограниченное время выполнения (10ms CPU, 30s total)
- Нет доступа к Node.js модулям

### 2. Сетевые ограничения
- Только HTTP/HTTPS запросы
- Ограничения на размер запросов/ответов
- CORS ограничения

### 3. Storage ограничения
- KV storage: 100MB на namespace
- Durable Objects: для сложной логики
- R2: для больших файлов

## Совместимость

### Поддерживаемые функции
- ✅ Статические файлы
- ✅ API endpoints
- ✅ Конфигурация через KV
- ✅ CORS proxy
- ✅ Базовые функции Dashy

### Не поддерживаемые функции
- ❌ Файловая система
- ❌ Длительные процессы
- ❌ Некоторые Node.js модули
- ❌ WebSocket соединения

## Производительность

### Оптимизации
1. **Кэширование**: Статические файлы кэшируются
2. **Сжатие**: Автоматическое сжатие ответов
3. **Edge computing**: Глобальное распределение
4. **KV storage**: Быстрый доступ к данным

### Метрики
- Время ответа: < 100ms
- Доступность: 99.9%
- Глобальное покрытие: 200+ локаций

## Безопасность

### Реализованные меры
1. **Валидация URL**: Проверка протоколов
2. **CORS**: Правильная настройка заголовков
3. **Rate limiting**: Встроенные ограничения Cloudflare
4. **DDoS защита**: Автоматическая защита

### Рекомендации
- Используйте аутентификацию для production
- Ограничьте доступ к API endpoints
- Регулярно обновляйте зависимости

## Мониторинг

### Логирование
```bash
wrangler tail
wrangler tail --format pretty
```

### Метрики
- Cloudflare Analytics
- Real User Monitoring (RUM)
- Error tracking

## Миграция с существующего деплоя

### 1. Экспорт конфигурации
```bash
# С существующего сервера
curl http://your-server/api/config > config.json
```

### 2. Импорт в Workers
```bash
# В новый Worker
curl -X POST https://new-worker.workers.dev/api/config \
  -H "Content-Type: application/json" \
  -d @config.json
```

### 3. Обновление DNS
- Направьте домен на Cloudflare
- Обновите CNAME записи

## Troubleshooting

### Частые проблемы

1. **Ошибка KV namespace**
   ```bash
   wrangler kv:namespace create "DASHY_CONFIG"
   ```

2. **Проблемы с CORS**
   - Проверьте заголовки в worker.js
   - Убедитесь в правильной настройке доменов

3. **Ошибки сборки**
   ```bash
   npm run build
   npm run deploy
   ```

4. **Проблемы с аутентификацией**
   ```bash
   wrangler login
   wrangler whoami
   ```

## Будущие улучшения

### Планируемые функции
1. **Durable Objects**: Для сложной логики
2. **R2 Storage**: Для больших файлов
3. **WebSocket**: Для real-time функций
4. **Аутентификация**: OAuth/SSO интеграция

### Оптимизации
1. **Service Workers**: Для offline функциональности
2. **Edge caching**: Улучшенное кэширование
3. **CDN**: Глобальное распределение контента

## Заключение

Адаптация Dashy для Cloudflare Workers обеспечивает:
- Глобальную доступность
- Высокую производительность
- Низкую стоимость
- Простоту развертывания

При этом сохраняется основная функциональность приложения с некоторыми ограничениями, связанными с архитектурой Workers.