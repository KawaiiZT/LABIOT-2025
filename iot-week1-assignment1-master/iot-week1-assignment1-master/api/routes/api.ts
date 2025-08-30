import { Hono } from "hono";
import studentsRouter from "./student.js";
import booksRouter from "./books.js";
import bookGenresRouter from "./bookGenres.js";
import genresRouter from "./genres.js";
import ordersRouter from "./orders.js";
import menusRouter from "./menus.js";
import { bearerAuth } from "hono/bearer-auth";
import { env } from "hono/adapter";

const apiRouter = new Hono();

apiRouter.get("/", (c) => {
  return c.json({ message: "Book Store API" });
});

apiRouter.use(
  "*",
  bearerAuth({
    verifyToken: async (token, c) => {
      const { API_SECRET } = env<{ API_SECRET: string }>(c);
      return token === API_SECRET;
    },
  })
);

apiRouter.route("/students", studentsRouter);
apiRouter.route("/books", booksRouter);
apiRouter.route("/genres", genresRouter);
apiRouter.route("/orders", ordersRouter);
apiRouter.route("/menus", menusRouter);
apiRouter.route("/bookGenres", bookGenresRouter);

export default apiRouter;
