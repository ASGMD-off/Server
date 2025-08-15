import { Application, Router } from "https://deno.land/x/oak/mod.ts";

// Хранилище сообщений (в памяти)
const messages: Array<{
  from: string;
  to: string;
  text: string;
  timestamp: Date;
}> = [];

const router = new Router();

// Включение CORS
router.options("/messages", (ctx) => {
  ctx.response.headers.set("Access-Control-Allow-Origin", "*");
  ctx.response.headers.set("Access-Control-Allow-Methods", "GET, POST");
  ctx.response.headers.set("Access-Control-Allow-Headers", "Content-Type");
});

// Отправить сообщение (POST)
router.post("/messages", async (ctx) => {
  const { from, to, text } = await ctx.request.body().value;

  if (!from || !to || !text) {
    ctx.response.status = 400;
    ctx.response.body = { error: "Нужны from, to и text!" };
    return;
  }

  messages.push({
    from,
    to,
    text,
    timestamp: new Date(),
  });

  ctx.response.headers.set("Access-Control-Allow-Origin", "*");
  ctx.response.body = { status: "Сообщение отправлено!" };
});

// Получить сообщения (GET)
router.get("/messages", (ctx) => {
  const { from, to } = ctx.request.url.searchParams;

  if (!from || !to) {
    ctx.response.status = 400;
    ctx.response.body = { error: "Нужны from и to!" };
    return;
  }

  const userMessages = messages.filter(
    (msg) =>
      (msg.from === from && msg.to === to) || (msg.from === to && msg.to === from)
  );

  ctx.response.headers.set("Access-Control-Allow-Origin", "*");
  ctx.response.body = userMessages;
});

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

console.log("Сервер запущен на http://localhost:8000");
await app.listen({ port: 8000 });
