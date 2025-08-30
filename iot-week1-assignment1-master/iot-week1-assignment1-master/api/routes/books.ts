import { Hono } from "hono";
import drizzle from "../db/drizzle.js";
import { books, bookGenres, genres } from "../db/schema.js";
import { eq, sql } from "drizzle-orm";
import { number, z } from "zod";
import { zValidator } from "@hono/zod-validator";
import dayjs from "dayjs";

const booksRouter = new Hono();

booksRouter.get("/", async (c) => {
  try {
    const allBooks = await drizzle.select({
      id: books.id,
      title: books.title,
      author: books.author,
      publishedAt: books.publishedAt,
      info: books.info,
      summary: books.summary,
      genres: sql<Text>`STRING_AGG(CAST(${bookGenres.genreId} AS TEXT), ', ') as genre_id`
    })
    .from(books)
    .leftJoin(bookGenres, eq(
        bookGenres.bookId,
        books.id
    ))
    .groupBy(books.id);

    return c.json(allBooks);
  } catch (error) {
    console.error("Error fetching books:", error);
    return c.json({ error: "Failed to fetch books" }, 500);
  }
});

booksRouter.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  try {
    const allBooks = await drizzle.select({
      id: books.id,
      title: books.title,
      author: books.author,
      publishedAt: books.publishedAt,
      info: books.info,
      summary: books.summary,
      genres: sql<Text>`STRING_AGG(CAST(${bookGenres.genreId} AS TEXT), ', ') as genre_id`,
      genresTitle: sql<Text>`STRING_AGG(CAST(${genres.title} AS TEXT), ', ') as genre_title`
    })
    .from(books)
    .leftJoin(bookGenres, eq(
        bookGenres.bookId,
        books.id
    ))
    .leftJoin(genres, eq(
        bookGenres.genreId,
        genres.id
    ))
    .where(eq(books.id, id))
    .groupBy(books.id);

    return c.json(allBooks[0]);
  } catch (error) {
    console.error("Error fetching books:", error);
    return c.json({ error: "Failed to fetch books" }, 500);
  }
});

booksRouter.post(
  "/",
  zValidator(
    "json",
    z.object({
      title: z.string().min(1),
      author: z.string().min(1),
      publishedAt: z.string().min(1),
      info: z.string().min(1).nullable(),
      summary: z.string().min(1).nullable(),
      genresId: z.array(z.number()).nullable(),
    })
  ), async (c) => {
    const bookData = c.req.valid("json");
    let newbookid;
    try {
      await drizzle.transaction(async (tx) => {
        //Insert into books table
        const newBook = await tx.insert(books).values({
          title: bookData.title,
          author: bookData.author,
          info: bookData.info,
          summary: bookData.summary,
          publishedAt: bookData.publishedAt,
        }).returning();

        //If genre IDs are provided, insert into junction table
        if (bookData.genresId && Array.isArray(bookData.genresId)) {
          bookData.genresId.forEach(async genreId => {
            await tx.insert(bookGenres).values({
              bookId: newBook[0].id,
              genreId: genreId,
            });
          });
        }
        newbookid = newBook[0].id
      });
      //console.log(typeof(bookData.genresId))
      return c.json({ success: true, book: bookData, bookid: newbookid}, 201);
    } catch (error) {
      console.error("Error adding book:", error);
      return c.json({ error: "Failed to add book" }, 500);
    }
  });

booksRouter.patch(
  "/:id",
  zValidator(
    "json",
    z.object({
      title: z.string().min(1).optional(),
      author: z.string().min(1).optional(),
      publishedAt: z.string().min(1).optional(),
      info: z.string().min(1).optional(),
      summary: z.string().min(1).optional(),
      //genresId: z.array(z.number()).optional().nullable(),
    })
  ),
  async (c) => {
    const id = Number(c.req.param("id"));
    const data = c.req.valid("json");
    const updated = await drizzle.update(books).set(data).where(eq(books.id, id)).returning();
    if (updated.length === 0) {
      return c.json({ error: "Book not found" }, 404);
    }
    return c.json({ success: true, book: updated[0] });
  }
);

booksRouter.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const deleted = await drizzle.delete(books).where(eq(books.id, id)).returning();
  if (deleted.length === 0) {
    return c.json({ error: "Book not found" }, 404);
  }
  return c.json({ success: true, book: deleted[0] });
});

export default booksRouter;
