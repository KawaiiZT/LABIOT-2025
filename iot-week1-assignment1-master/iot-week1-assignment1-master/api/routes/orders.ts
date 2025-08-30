import { Hono } from "hono";
import drizzle from "../db/drizzle.js";
import { orders, menus } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import dayjs from "dayjs";

const OrdersRouter = new Hono();

OrdersRouter.get("/", async (c) => {
  const allUsers = await drizzle.select().from(orders);
  return c.json(allUsers);
});

OrdersRouter.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const result = await drizzle.query.orders.findFirst({
    where: eq(orders.id, id),
    with: {
      menu: true,
    },
  });
  if (!result) {
    return c.json({ error: "Order not found" }, 404);
  }
  return c.json(result);
});

OrdersRouter.post(
  "/",
  zValidator(
    "json",
    z.object({
      menuId: z.number().int().min(1),
      count: z.number().int().min(1),
      annotation: z.string(),
    })
  ),
  async (c) => {
    const { menuId, count, annotation } = c.req.valid("json");
    const result = await drizzle
      .insert(orders)
      .values({
        menuId: menuId,
        count: count,
        annotation: annotation ?? null,
      })
      .returning();
    return c.json({ success: true, order: result[0] }, 201);
  }
);

OrdersRouter.patch(
  "/:id",
  zValidator(
    "json",
    z.object({
      menuId: z.number().int().min(1).optional(),
      count: z.number().int().min(1).optional(),
      annotation: z.string().optional(),
    })
  ),
  async (c) => {
    const id = Number(c.req.param("id"));
    const data = c.req.valid("json");
    const updated = await drizzle.update(orders).set(data).where(eq(orders.id, id)).returning();
    if (updated.length === 0) {
      return c.json({ error: "Book not found" }, 404);
    }
    return c.json({ success: true, order: updated[0] });
  }
);

OrdersRouter.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const deleted = await drizzle.delete(orders).where(eq(orders.id, id)).returning();
  if (deleted.length === 0) {
    return c.json({ error: "Book not found" }, 404);
  }
  return c.json({ success: true, order: deleted[0] });
});

export default OrdersRouter;
