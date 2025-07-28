# Быстрый старт: Деплой Dashy на Cloudflare Workers

## 🚀 Быстрая настройка (5 минут)

### 1. Установка Wrangler CLI
```bash
npm install -g wrangler
```

### 2. Аутентификация в Cloudflare
```bash
wrangler login
```

### 3. Создание KV Namespace
```bash
wrangler kv:namespace create "DASHY_CONFIG"
```

### 4. Обновление конфигурации
Замените в `wrangler.toml`:
```toml
[[kv_namespaces]]
binding = "DASHY_CONFIG"
id = "ВАШ_PRODUCTION_ID"
preview_id = "ВАШ_PREVIEW_ID"
```

### 5. Деплой
```bash
npm install
npm run build
npm run deploy
```

## ✅ Проверка

После деплоя вы получите URL вида:
`https://dashy.your-subdomain.workers.dev`

Проверьте API:
- `https://your-worker.workers.dev/api/status`
- `https://your-worker.workers.dev/api/config`

## ⚙️ Настройка конфигурации

```bash
curl -X POST https://your-worker.workers.dev/api/config \
  -H "Content-Type: application/json" \
  -d @examples/config-example.json
```

## 📖 Подробная документация

См. [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) для полного руководства.

## 🔧 Автоматический деплой

Используйте скрипт для автоматизации:
```bash
./scripts/deploy.sh production
```

## 🆘 Поддержка

- Проблемы с деплоем: `wrangler tail`
- Логи в реальном времени: `wrangler tail --format pretty`
- Удаление: `wrangler delete dashy`