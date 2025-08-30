// Fun Assignment, Implement this.
import { Hono } from "hono";
import drizzle from "../db/drizzle.js";
import { menus } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import dayjs from "dayjs";

const MenusRouter = new Hono();

MenusRouter.get("/", async (c) => {
  const allUsers = await drizzle.select().from(menus);
  return c.json(allUsers);
});

MenusRouter.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const result = await drizzle.query.menus.findFirst({
    where: eq(menus.id, id),
    // with: {
    //   genre: true,
    // },
  });
  if (!result) {
    return c.json({ error: "Book not found" }, 404);
  }
  return c.json(result);
});

MenusRouter.post(
  "/",
  zValidator(
    "json",
    z.object({
      name: z.string().min(1),
    })
  ),
  async (c) => {
    const { name } = c.req.valid("json");
    const result = await drizzle
      .insert(menus)
      .values({
        name: name,
      })
      .returning();
    return c.json({ success: true, menu: result[0] }, 201);
  }
);

MenusRouter.patch(
  "/:id",
  zValidator(
    "json",
    z.object({
      name: z.string().min(1)
    })
  ),
  async (c) => {
    const id = Number(c.req.param("id"));
    const data = c.req.valid("json");
    const updated = await drizzle.update(menus).set(data).where(eq(menus.id, id)).returning();
    if (updated.length === 0) {
      return c.json({ error: "Menu not found" }, 404);
    }
    return c.json({ success: true, menu: updated[0] });
  }
);

MenusRouter.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const deleted = await drizzle.delete(menus).where(eq(menus.id, id)).returning();
  if (deleted.length === 0) {
    return c.json({ error: "Menu not found" }, 404);
  }
  return c.json({ success: true, menu: deleted[0] });
});

export default MenusRouter;