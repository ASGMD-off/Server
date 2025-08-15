import { Application, Router } from "https://deno.land/x/oak/mod.ts";

// Хранилище сообщений (в памяти)
const chats: Record<string, Array<{
  from: string;
  text: string;
  timestamp: Date;
}>> = {};

// Создаём начальную переписку при первом запуске
function initDefaultChat(user1: string, user2: string) {
  const chatId = [user1, user2].sort().join("-");
  
  if (!chats[chatId]) {
    chats[chatId] = [
      {
        from: "System",
        text: `Чат создан между ${user1} и ${user2}`,
        timestamp: new Date()
      },
      {
        from: "System",
        text: "Начните общение!",
        timestamp: new Date()
      }
    ];
  }
}

const router = new Router();

// Middleware для CORS
router.use(async (ctx, next) => {
  ctx.response.headers.set("Access-Control-Allow-Origin", "*");
  await next();
});

// Получение сообщений
router.get("/messages", (ctx) => {
  const { from, to } = ctx.request.url.searchParams;
  
  if (!from || !to) {
    ctx.response.status = 400;
    ctx.response.body = { error: "Укажите from и to" };
    return;
  }

  const chatId = [from, to].sort().join("-");
  initDefaultChat(from, to); // Создаём чат, если его нет
  
  ctx.response.body = {
    participants: [from, to],
    messages: chats[chatId]
  };
});

// Отправка сообщения
router.post("/messages", async (ctx) => {
  const { from, to, text } = await ctx.request.body().value;
  
  if (!from || !to || !text) {
    ctx.response.status = 400;
    ctx.response.body = { error: "Нужны from, to и text" };
    return;
  }

  const chatId = [from, to].sort().join("-");
  initDefaultChat(from, to); // Создаём чат, если его нет
  
  chats[chatId].push({
    from,
    text,
    timestamp: new Date()
  });

  ctx.response.body = { status: "Сообщение доставлено" };
});

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

console.log("Сервер запущен на http://localhost:8000");
await app.listen({ port: 8000 });
