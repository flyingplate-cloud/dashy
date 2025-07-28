# Dashy для Cloudflare Workers

[![Deploy to Cloudflare Workers](https://img.shields.io/badge/Deploy%20to-Cloudflare%20Workers-orange?style=for-the-badge&logo=cloudflare)](https://dashy.to/docs/deployment/cloudflare-workers)

Адаптированная версия Dashy для развертывания на Cloudflare Workers с поддержкой глобального CDN, высокой производительности и низкой стоимости.

## 🌟 Особенности

- ⚡ **Мгновенная загрузка** - глобальное распределение через Cloudflare CDN
- 💰 **Низкая стоимость** - бесплатный тариф включает 100,000 запросов/день
- 🔒 **Безопасность** - встроенная DDoS защита и SSL
- 📊 **Мониторинг** - встроенная аналитика и логирование
- 🛠️ **Простота деплоя** - одна команда для развертывания
- 🔧 **Гибкая конфигурация** - через API или KV storage

## 🚀 Быстрый старт

### 1. Клонирование репозитория
```bash
git clone https://github.com/your-username/dashy-cloudflare.git
cd dashy-cloudflare
```

### 2. Установка зависимостей
```bash
npm install
```

### 3. Настройка Cloudflare
```bash
npm install -g wrangler
wrangler login
```

### 4. Создание KV namespace
```bash
wrangler kv:namespace create "DASHY_CONFIG"
```

### 5. Обновление конфигурации
Отредактируйте `wrangler.toml` и замените placeholder ID:
```toml
[[kv_namespaces]]
binding = "DASHY_CONFIG"
id = "your-production-id"
preview_id = "your-preview-id"
```

### 6. Деплой
```bash
npm run build
npm run deploy
```

## 📖 Документация

- [📋 Подробный гайд деплоя](./DEPLOYMENT_GUIDE.md)
- [⚡ Быстрый старт](./QUICK_START.md)
- [🔧 Изменения для Cloudflare](./CLOUDFLARE_CHANGES.md)
- [📝 Примеры конфигурации](./examples/)

## 🛠️ Доступные команды

```bash
# Разработка
npm run dev          # Локальная разработка
npm run dev:worker   # Разработка с Wrangler

# Сборка
npm run build        # Сборка приложения
npm run build:worker # Сборка для Workers

# Деплой
npm run deploy       # Деплой в production
npm run deploy:staging    # Деплой в staging
npm run deploy:production # Деплой в production

# Автоматизированный деплой
./scripts/deploy.sh production
./scripts/deploy.sh staging

# Мониторинг
wrangler tail        # Просмотр логов
wrangler tail --format pretty  # Красивые логи
```

## 🌐 API Endpoints

После деплоя доступны следующие API endpoints:

| Endpoint | Метод | Описание |
|----------|-------|----------|
| `/api/status` | GET | Статус приложения |
| `/api/config` | GET/POST | Управление конфигурацией |
| `/api/health` | GET | Проверка здоровья |
| `/api/cors` | GET/POST | CORS proxy |

## ⚙️ Конфигурация

### Через API
```bash
curl -X POST https://your-worker.workers.dev/api/config \
  -H "Content-Type: application/json" \
  -d @examples/config-example.json
```

### Через KV Storage
```bash
# Сохранение
wrangler kv:key put --binding=DASHY_CONFIG "config" "$(cat examples/config-example.json)"

# Просмотр
wrangler kv:key get --binding=DASHY_CONFIG "config"
```

## 🔧 Настройка домена

### 1. Добавьте домен в Cloudflare
### 2. Обновите `wrangler.toml`:
```toml
routes = [
  { pattern = "your-domain.com/*", zone_name = "your-domain.com" }
]

custom_domains = [
  { domain = "dashy.your-domain.com", zone_name = "your-domain.com" }
]
```

## 📊 Мониторинг и аналитика

### Логи в реальном времени
```bash
wrangler tail --format pretty
```

### Метрики Cloudflare
- Analytics в Cloudflare Dashboard
- Real User Monitoring (RUM)
- Error tracking

## 🔒 Безопасность

### Встроенные меры защиты
- ✅ DDoS защита
- ✅ SSL/TLS шифрование
- ✅ Rate limiting
- ✅ CORS настройки
- ✅ Валидация URL

### Рекомендации
- Используйте аутентификацию для production
- Ограничьте доступ к API endpoints
- Регулярно обновляйте зависимости

## 🆘 Troubleshooting

### Частые проблемы

**Ошибка KV namespace**
```bash
wrangler kv:namespace create "DASHY_CONFIG"
```

**Проблемы с CORS**
Проверьте заголовки в `src/worker.js`

**Ошибки деплоя**
```bash
wrangler tail
npm run build
npm run deploy
```

## 📈 Производительность

### Метрики
- ⚡ Время ответа: < 100ms
- 🌍 Доступность: 99.9%
- 📍 Глобальное покрытие: 200+ локаций
- 💾 Кэширование: Автоматическое

### Оптимизации
- Edge computing
- Автоматическое сжатие
- CDN кэширование
- KV storage для быстрого доступа

## 🔄 Обновления

### Обновление приложения
```bash
git pull
npm install
npm run build
npm run deploy
```

### Обновление конфигурации
```bash
curl -X POST https://your-worker.workers.dev/api/config \
  -H "Content-Type: application/json" \
  -d @new-config.json
```

## 🗑️ Удаление

```bash
wrangler delete dashy
```

## 🤝 Поддержка

- 📧 Email: support@dashy.to
- 💬 Discord: [Dashy Community](https://discord.gg/dashy)
- 🐛 Issues: [GitHub Issues](https://github.com/Lissy93/dashy/issues)
- 📖 Документация: [dashy.to/docs](https://dashy.to/docs)

## 📄 Лицензия

MIT License - см. [LICENSE](./LICENSE) для деталей.

## 🙏 Благодарности

- [Cloudflare Workers](https://workers.cloudflare.com/) за отличную платформу
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) за инструменты разработки
- Сообщество Dashy за поддержку и вклад в проект

---

**Примечание**: Это адаптированная версия Dashy для Cloudflare Workers. Для полной функциональности рассмотрите использование оригинальной версии с Docker или bare metal развертыванием.