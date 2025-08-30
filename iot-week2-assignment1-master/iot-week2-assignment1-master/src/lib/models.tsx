export interface Book {
  id: number;
  title: string;
  author: string;
  publishedAt: string;
  info: string;
  summary: string;
  genres: string;
  genresTitle: string;
}
export interface Owner{
  name: string;
  surname: string;
  userId: number;
}
export interface Genres{
  id: number;
  title: string;
}
