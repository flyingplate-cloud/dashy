# Настройка Dashy на Cloudflare Pages

## 🚀 Быстрая настройка

### 1. Build Command
```
yarn install --frozen-lockfile=false && NODE_OPTIONS=--openssl-legacy-provider yarn build
```

### 2. Deploy Command
```
npx wrangler deploy
```

### 3. Build Output Directory
```
dist
```

### 4. Node.js Version
```
18
```

## 📋 Подробные настройки

### Environment Variables
Добавьте следующие переменные окружения в настройках Cloudflare Pages:

```
NODE_OPTIONS=--openssl-legacy-provider
NODE_VERSION=18
```

### Build Settings
- **Framework preset**: None (Custom)
- **Build command**: `yarn install --frozen-lockfile=false && NODE_OPTIONS=--openssl-legacy-provider yarn build`
- **Build output directory**: `dist`
- **Root directory**: `/` (оставьте пустым)

### Deploy Settings
- **Deploy command**: `npx wrangler deploy`
- **Builds for non-production branches**: ✅ Включено

## 🔧 Альтернативные варианты

### Вариант 1: Использование скрипта
**Build command:**
```bash
chmod +x build.sh && ./build.sh
```

### Вариант 2: Простой билд
**Build command:**
```bash
yarn install --frozen-lockfile=false && yarn build
```

### Вариант 3: NPM вместо Yarn
**Build command:**
```bash
npm ci && NODE_OPTIONS=--openssl-legacy-provider npm run build
```

## 🛠️ Troubleshooting

### Проблема: Peer dependencies
Если возникают ошибки с peer dependencies, используйте:
```bash
yarn install --frozen-lockfile=false --ignore-engines
```

### Проблема: Node.js версия
Убедитесь, что используется Node.js 18:
```bash
NODE_VERSION=18 yarn install && yarn build
```

### Проблема: Lockfile conflicts
Если возникают конфликты с lockfile:
1. Удалите `yarn.lock` в репозитории
2. Используйте команду: `yarn install --frozen-lockfile=false`

## ✅ Проверка

После успешного деплоя:
1. Откройте ваш домен
2. Проверьте, что приложение загружается
3. Проверьте консоль на ошибки
4. Убедитесь, что все функции работают

## 📞 Поддержка

При проблемах:
1. Проверьте логи билда в Cloudflare Dashboard
2. Убедитесь, что все зависимости установлены
3. Проверьте версию Node.js
4. Обратитесь к документации проекта