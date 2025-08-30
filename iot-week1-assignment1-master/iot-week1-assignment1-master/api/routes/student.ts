import { Hono } from "hono";
import drizzle from "../db/drizzle.js";
import { Users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import dayjs from "dayjs";

const UsersRouter = new Hono();

UsersRouter.get("/", async (c) => {
  const allUsers = await drizzle.select().from(Users);
  return c.json(allUsers);
});

UsersRouter.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const result = await drizzle.query.Users.findFirst({
    where: eq(Users.id, id),
    // with: {
    //   genre: true,
    // },
  });
  if (!result) {
    return c.json({ error: "Book not found" }, 404);
  }
  return c.json(result);
});

UsersRouter.post(
  "/",
  zValidator(
    "json",
    z.object({
      name: z.string().min(1),
      surname: z.string().min(1),
      userId: z.number().int(),
      birth: z.string().min(1),
      sex: z.string().min(1)
    })
  ),
  async (c) => {
    const { name, surname, userId, birth, sex } = c.req.valid("json");
    const result = await drizzle
      .insert(Users)
      .values({
        name: name ?? null,
        surname: surname ?? null,
        userId: userId ?? null,
        birth: birth ?? null,
        sex: sex ?? null,
      })
      .returning();
    return c.json({ success: true, user: result[0] }, 201);
  }
);

UsersRouter.patch(
  "/:id",
  zValidator(
    "json",
    z.object({
      name: z.string().min(1).optional(),
      surname: z.string().min(1).optional(),
      userId: z.number().int().optional(),
      birth: z.string().min(1).optional(),
      sex: z.string().min(1).optional()
      // title: z.string().min(1).optional(),
      // author: z.string().min(1).optional(),
      // publishedAt: z.iso
      //   .datetime({
      //     offset: true,
      //   })
      //   .optional()
      //   .transform((data) => (data ? dayjs(data).toDate() : undefined)),
      // genreId: z.number().int().optional().nullable().optional(),
    })
  ),
  async (c) => {
    const id = Number(c.req.param("id"));
    const data = c.req.valid("json");
    const updated = await drizzle.update(Users).set(data).where(eq(Users.id, id)).returning();
    if (updated.length === 0) {
      return c.json({ error: "Book not found" }, 404);
    }
    return c.json({ success: true, book: updated[0] });
  }
);

UsersRouter.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const deleted = await drizzle.delete(Users).where(eq(Users.id, id)).returning();
  if (deleted.length === 0) {
    return c.json({ error: "Book not found" }, 404);
  }
  return c.json({ success: true, book: deleted[0] });
});

export default UsersRouter;
