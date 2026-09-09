import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { app } from "../src/app.js";
import { orders, products } from "../src/store.js";

describe("orders", () => {
  beforeEach(() => { orders.length = 0; products[0].stock = 12; });

  it("creates an order", async () => {
    const response = await request(app).post("/orders").send({ customerEmail: "ada@example.com", items: [{ productId: 1, quantity: 2 }] });
    expect(response.status).toBe(201);
    expect(response.body.items).toHaveLength(1);
    expect(products[0].stock).toBe(10);
  });

  it.todo("rejects invalid quantities without changing stock");
  it.todo("does not oversell the last unit under concurrent requests");
  it.todo("does not allow a caller to grant their own admin privileges");
});
