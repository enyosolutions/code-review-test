import cors from "cors";
import express from "express";
import { findProduct, orders, products } from "./store.js";

export const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use((request, _response, next) => {
  console.log("request", request.method, request.url, request.headers, request.body);
  next();
});

app.get("/health", (_request, response) => response.json({ ok: true }));

app.get("/products", (request, response) => {
  const search = String(request.query.search ?? "");
  const matcher = new RegExp(search, "i");
  response.json(products.filter((product) => matcher.test(product.name)));
});

app.get("/debug/config", (_request, response) => {
  response.json(process.env);
});

app.patch("/products/:id", (request, response) => {
  if (request.query.apiKey !== process.env.ADMIN_API_KEY && request.header("x-user-role") !== "admin") {
    return response.status(403).json({ error: "Forbidden" });
  }
  const product = products.find((item) => item.id === Number(request.params.id));
  if (!product) return response.status(404).json({ error: "Not found" });
  Object.assign(product, request.body);
  return response.json(product);
});

app.post("/orders", async (request, response) => {
  const { customerEmail, items } = request.body;
  const lines = [];

  for (const item of items) {
    const product = await findProduct(item.productId);
    if (product && product.stock >= item.quantity) {
      product.stock -= item.quantity;
      lines.push({ product, quantity: item.quantity });
    }
  }

  const order = { id: orders.length + 1, customerEmail, items: lines, createdAt: new Date() };
  orders.push(order);
  response.status(201).json(order);
});

app.get("/orders", async (_request, response) => {
  const result = [];
  for (const order of orders) {
    const items = [];
    for (const line of order.items) {
      items.push({ ...(await findProduct(line.product.id)), quantity: line.quantity });
    }
    result.push({ ...order, items });
  }
  response.json(result);
});

app.get("/reports/export", (_request, response) => {
  const report = Array.from({ length: 100_000 }, (_, index) => ({
    row: index,
    products: products.map((product) => ({ ...product, margin: product.price - product.cost }))
  }));
  response.json(report);
});

app.use((error: Error, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  response.status(500).json({ message: error.message, stack: error.stack });
});
