import { relations } from "drizzle-orm";
import * as t from "drizzle-orm/pg-core";

export const Users = t.pgTable("Users", {
  id: t.bigserial({ mode: "number" }).primaryKey(),
  name: t
    .varchar({
      length: 255,
    })
    .notNull(),
  surname: t
    .varchar({
      length: 255,
    })
    .notNull(),
  userId: t.bigserial({ mode: "number" }).notNull(),
  birth: t
    .date({ mode: "string"}).notNull(),
  sex: t
    .varchar({
      length: 255,
    })
    .notNull(),
});

export const genres = t.pgTable("genres", {
  id: t.bigserial({ mode: "number" }).primaryKey(),
  title: t
    .varchar({
      length: 255,
    })
    .notNull(),
});

export const books = t.pgTable("books", {
  id: t.bigserial({ mode: "number" }).primaryKey(),
  title: t
    .varchar({
      length: 255,
    })
    .notNull(),
  author: t
    .varchar({
      length: 255,
    })
    .notNull(),
  info: t
    .varchar({
      length: 255,
    }),
  summary: t
    .varchar({
      length: 255,
    }),
  publishedAt: t
    .date({ mode: "string"}).notNull(),
});

// export const bookRelations = relations(books, ({ one }) => ({
//   genre: one(genres, {
//     fields: [books.genreId],
//     references: [genres.id],
//   }),
// }));

export const bookGenres = t.pgTable(
  "bookGenres",
  {
    bookId: t.bigint({ mode: "number" }).references(() => books.id, { onDelete: "cascade" }),
    genreId: t.bigint({ mode: "number" }).references(() => genres.id, { onDelete: "cascade" })
  },
  (ta) => [
		t.primaryKey({ columns: [ta.bookId, ta.genreId] })
	]
);

export const bookRelations = relations(books, ({ many }) => ({
  BooktoGenres: many(bookGenres),
}));

export const genreRelations = relations(genres, ({ many }) => ({
  BooktoGenres: many(bookGenres),
}));

export const bookGenresRelations = relations(bookGenres, ({ one }) => ({
  book: one(books, {
    fields: [bookGenres.bookId],
    references: [books.id],
  }),
  genre: one(genres, {
    fields: [bookGenres.genreId],
    references: [genres.id],
  }),
}));

export const orders = t.pgTable("orders", {
  id: t.bigserial({ mode: "number" }).primaryKey(),
  menuId: t
    .bigserial({ mode: "number" })
    .notNull().references(() => menus.id, {
    onDelete: "set null",
  }),
  count: t
    .bigserial({ mode: "number" }).notNull(),
  annotation: t
    .varchar({
      length: 255,
    })
});

export const menus = t.pgTable("menus", {
  id: t.bigserial({ mode: "number" }).primaryKey(),
  name: t
    .varchar({
      length: 255,
    })
});

export const menuRelations = relations(orders, ({ one }) => ({
  menu: one(menus, {
    fields: [orders.menuId],
    references: [menus.id],
  }),
}));