import { Application, Router } from "https://deno.land/x/oak/mod.ts";

const messages: {from: string, to: string, text: string}[] = [];
const router = new Router();

// Включение CORS
router.use(async (ctx, next) => {
  ctx.response.headers.set("Access-Control-Allow-Origin", "*");
  await next();
});

// Роут для отправки сообщений
router.post("/messages", async (ctx) => {
  const { from, to, text } = await ctx.request.body().value;
  messages.push({ from, to, text });
  ctx.response.body = { status: "OK" };
});

// Роут для получения сообщений
router.get("/messages", (ctx) => {
  const { from, to } = ctx.request.url.searchParams;
  const filtered = messages.filter(m => 
    (m.from === from && m.to === to) || (m.from === to && m.to === from)
  );
  ctx.response.body = filtered;
});

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8000 });  ctx.response.headers.set("Access-Control-Allow-Origin", "*");
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
