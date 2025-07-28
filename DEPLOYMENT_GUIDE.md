# Гайд по деплою Dashy на Cloudflare Workers

Этот гайд поможет вам развернуть приложение Dashy на Cloudflare Workers.

## Предварительные требования

1. **Аккаунт Cloudflare** с включенными Workers
2. **Node.js** версии 16 или выше
3. **Wrangler CLI** - инструмент для работы с Cloudflare Workers

## Установка Wrangler CLI

```bash
npm install -g wrangler
```

## Аутентификация в Cloudflare

```bash
wrangler login
```

Это откроет браузер для входа в ваш аккаунт Cloudflare.

## Настройка проекта

### 1. Установка зависимостей

```bash
npm install
```

### 2. Сборка приложения

```bash
npm run build
```

### 3. Создание KV Namespace

Создайте KV namespace для хранения конфигурации:

```bash
wrangler kv:namespace create "DASHY_CONFIG"
```

Это создаст два namespace:
- Production namespace (ID: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
- Preview namespace (ID: `yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy`)

### 4. Обновление wrangler.toml

Замените placeholder значения в `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "DASHY_CONFIG"
id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"  # Production namespace ID
preview_id = "yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy"  # Preview namespace ID
```

### 5. Настройка домена (опционально)

Если у вас есть собственный домен:

1. Добавьте домен в Cloudflare
2. Обновите `wrangler.toml`:

```toml
routes = [
  { pattern = "your-domain.com/*", zone_name = "your-domain.com" }
]

custom_domains = [
  { domain = "dashy.your-domain.com", zone_name = "your-domain.com" }
]
```

## Деплой

### Тестовый деплой

```bash
npm run deploy
```

### Деплой в staging

```bash
npm run deploy:staging
```

### Деплой в production

```bash
npm run deploy:production
```

## Проверка деплоя

После успешного деплоя вы получите URL вида:
`https://dashy.your-subdomain.workers.dev`

### Проверка API endpoints

- **Статус**: `https://your-worker.workers.dev/api/status`
- **Конфигурация**: `https://your-worker.workers.dev/api/config`
- **Здоровье**: `https://your-worker.workers.dev/api/health`

## Настройка конфигурации

### Через API

Отправьте POST запрос на `/api/config` с вашей конфигурацией:

```bash
curl -X POST https://your-worker.workers.dev/api/config \
  -H "Content-Type: application/json" \
  -d '{
    "pageInfo": {
      "title": "Мой Dashboard",
      "description": "Персональная панель управления"
    },
    "sections": [
      {
        "name": "Сервисы",
        "icon": "fas fa-server",
        "items": [
          {
            "title": "GitHub",
            "description": "Код проектов",
            "icon": "fab fa-github",
            "url": "https://github.com"
          }
        ]
      }
    ]
  }'
```

### Через KV Storage

```bash
# Сохранение конфигурации
wrangler kv:key put --binding=DASHY_CONFIG "config" "{\"pageInfo\":{\"title\":\"Мой Dashboard\"}}"

# Просмотр конфигурации
wrangler kv:key get --binding=DASHY_CONFIG "config"
```

## Переменные окружения

Вы можете настроить переменные окружения в Cloudflare Dashboard или через wrangler:

```bash
wrangler secret put ENVIRONMENT
```

## Мониторинг и логи

### Просмотр логов

```bash
wrangler tail
```

### Мониторинг в реальном времени

```bash
wrangler tail --format pretty
```

## Troubleshooting

### Проблемы с CORS

Если возникают проблемы с CORS, убедитесь что в Worker правильно настроены заголовки:

```javascript
response.headers.set('Access-Control-Allow-Origin', '*')
response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
response.headers.set('Access-Control-Allow-Headers', '*')
```

### Проблемы с KV Storage

Проверьте что KV namespace правильно настроен:

```bash
wrangler kv:namespace list
```

### Проблемы с деплоем

1. Проверьте логи: `wrangler tail`
2. Убедитесь что все зависимости установлены
3. Проверьте что сборка прошла успешно: `npm run build`

## Оптимизация производительности

### Кэширование

Настройте кэширование для статических ресурсов:

```javascript
response.headers.set('Cache-Control', 'public, max-age=31536000')
```

### Сжатие

Включите сжатие в wrangler.toml:

```toml
[build.upload]
format = "service-worker"
```

## Безопасность

### Ограничение доступа

Добавьте аутентификацию если необходимо:

```javascript
// В worker.js
if (request.headers.get('Authorization') !== 'Bearer your-token') {
  return new Response('Unauthorized', { status: 401 })
}
```

### Валидация входных данных

Всегда валидируйте входные данные в API endpoints.

## Обновление приложения

1. Внесите изменения в код
2. Соберите приложение: `npm run build`
3. Деплойте: `npm run deploy`

## Удаление

```bash
wrangler delete dashy
```

## Полезные команды

```bash
# Просмотр информации о Worker
wrangler whoami

# Просмотр списка Workers
wrangler list

# Просмотр деталей Worker
wrangler info

# Локальная разработка
wrangler dev

# Публикация в production
wrangler publish
```

## Поддержка

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)
- [Dashy Documentation](https://dashy.to/docs)