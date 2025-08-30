import useSWR from "swr";
import { Book, Genres } from "../lib/models";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../components/layout";
import { Alert, Button, Container, Divider, TextInput, Checkbox } from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import Loading from "../components/loading";
import { IconAlertTriangleFilled, IconTrash } from "@tabler/icons-react";
import { isNotEmpty, useForm } from "@mantine/form";
import { useEffect, useState } from "react";
import axios from "../lib/axios";
import { AxiosError } from "axios";
import { notifications } from "@mantine/notifications";
import { modals } from "@mantine/modals";
import dayjs from "dayjs";

export default function BookEditById() {
  const { bookId } = useParams();
  const navigate = useNavigate();

  const [isProcessing, setIsProcessing] = useState(false);

  const { data: book, isLoading, error } = useSWR<Book>(`books/${bookId}`);
  const { data: genres } = useSWR<Genres[]>(`genres`);
  const [isSetInitialValues, setIsSetInitialValues] = useState(false);
  //console.log("Book data:", book);
  const bookEditForm = useForm({
    initialValues: {
      title: "",
      author: "",
      info: "",
      summary: "",
      publishedAt: new Date(),
      genresId: new Array() as string[], // Initialize as empty array
    },

    validate: {
      title: isNotEmpty("กรุณาระบุชื่อหนังสือ"),
      author: isNotEmpty("กรุณาระบุชื่อผู้แต่ง"),
      info: isNotEmpty("กรุณาระบุรายละเอียดหนังสือ"),
      summary: isNotEmpty("กรุณาระบุเรื่องย่อ"),
      publishedAt: isNotEmpty("กรุณาระบุวันที่พิมพ์หนังสือ"),
    },
  });

  const handleSubmit = async (values: typeof bookEditForm.values) => {
    try {
      setIsProcessing(true);
      const genres = values.genresId.map(Number);
      const { genresId, ...bookData } = { ...values, genresId: genres };
      await axios.patch(`/books/${bookId}`, bookData);
      // Update bookGenres: remove all old, then add current
      if (bookId) {
        // 1. Get current genres from backend (optional, or just delete all)
        await axios.delete(`/bookGenres/${bookId}/all`); // You may need to implement this endpoint, or loop through old genres if needed

        // 2. Add new genres
        if (Array.isArray(genresId) && genresId.length > 0) {
          for (const Id of genresId) {
            await axios.post(`/bookGenres`, {
              bookId: Number(bookId),
              genreId: Number(Id),
            });
          }
        }
      }
      // Show success notification
      notifications.show({
        title: "แก้ไขข้อมูลหนังสือสำเร็จ",
        message: "ข้อมูลหนังสือได้รับการแก้ไขเรียบร้อยแล้ว",
        color: "teal",
      });
      navigate(`/books/${bookId}`);
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 404) {
          notifications.show({
            title: "ไม่พบข้อมูลหนังสือ",
            message: "ไม่พบข้อมูลหนังสือที่ต้องการแก้ไข",
            color: "red",
          });
        } else if (error.response?.status === 400) {
          notifications.show({
            title: "ข้อมูลไม่ถูกต้อง",
            message: "กรุณาตรวจสอบข้อมูลที่กรอกใหม่อีกครั้ง",
            color: "red",
          });
        } else if (error.response?.status || 500 >= 500) {
          notifications.show({
            title: "เกิดข้อผิดพลาดบางอย่าง",
            message: "กรุณาลองใหม่อีกครั้ง",
            color: "red",
          });
        }
      } else {
        notifications.show({
          title: "เกิดข้อผิดพลาดบางอย่าง",
          message: "กรุณาลองใหม่อีกครั้ง หรือดูที่ Console สำหรับข้อมูลเพิ่มเติม",
          color: "red",
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsProcessing(true);
      // Delete all bookGenres for this book
      if (bookId) {
        // You may need to implement this endpoint, or loop through all genres
        await axios.delete(`bookGenres/${bookId}/all`);
      }
      // Delete the book itself
      await axios.delete(`books/${bookId}`);
      notifications.show({
        title: "ลบหนังสือสำเร็จ",
        message: "ลบหนังสือเล่มนี้ออกจากระบบเรียบร้อยแล้ว",
        color: "red",
      });
      navigate("/books");
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 404) {
          notifications.show({
            title: "ไม่พบข้อมูลหนังสือ",
            message: "ไม่พบข้อมูลหนังสือที่ต้องการลบ",
            color: "red",
          });
        } else if (error.response?.status || 500 >= 500) {
          notifications.show({
            title: "เกิดข้อผิดพลาดบางอย่าง",
            message: "กรุณาลองใหม่อีกครั้ง",
            color: "red",
          });
        }
      } else {
        notifications.show({
          title: "เกิดข้อผิดพลาดบางอย่าง",
          message: "กรุณาลองใหม่อีกครั้ง หรือดูที่ Console สำหรับข้อมูลเพิ่มเติม",
          color: "red",
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (!isSetInitialValues && book) {
      const genreString = typeof book.genres === "string" ? book.genres : "";
      const genreArr = genreString ? genreString.split(",").map(g => g.trim()) : [];
      bookEditForm.setInitialValues({
        title: book.title,
        author: book.author,
        info: book.info,
        summary: book.summary,
        publishedAt: dayjs(book.publishedAt as unknown as number).toDate(),
        genresId: genreArr,
      });
      bookEditForm.setValues({
        title: book.title,
        author: book.author,
        info: book.info,
        summary: book.summary,
        publishedAt: dayjs(book.publishedAt as unknown as number).toDate(),
        genresId: genreArr,
      });
      setIsSetInitialValues(true);
    }
  }, [book, bookEditForm, isSetInitialValues]);


  const handleGenreChange = (id: string) => {
    // Always use getInputProps/get for Mantine form state
    const currentGenres = bookEditForm.values.genresId ?? [];
    let newGenres: string[];
    if (currentGenres.includes(id)) {
      // Remove id from genres array
      newGenres = currentGenres.filter(g => g !== id);
    } else {
      // Add id to genres array
      newGenres = [...currentGenres, id];
    }
    bookEditForm.setFieldValue('genresId', newGenres);
  };
  //console.log(bookEditForm.values)
  return (
    <>
      <Layout>
        <Container className="mt-8">
          <h1 className="text-xl">แก้ไขข้อมูลหนังสือ</h1>

          {isLoading && !error && <Loading />}
          {error && (
            <Alert
              color="red"
              title="เกิดข้อผิดพลาดในการอ่านข้อมูล"
              icon={<IconAlertTriangleFilled />}
            >
              {error.message}
            </Alert>
          )}

          {!!book && (
            <>
              <form onSubmit={bookEditForm.onSubmit(handleSubmit)} className="space-y-8">
                <TextInput
                  label="ชื่อหนังสือ"
                  placeholder="ชื่อหนังสือ"
                  {...bookEditForm.getInputProps("title")}
                />

                <TextInput
                  label="ชื่อผู้แต่ง"
                  placeholder="ชื่อผู้แต่ง"
                  {...bookEditForm.getInputProps("author")}
                />

                <DateTimePicker
                  label="วันที่พิมพ์"
                  placeholder="วันที่พิมพ์"
                  {...bookEditForm.getInputProps("publishedAt")}
                />

                <TextInput
                  label="รายละเอียดหนังสือ"
                  placeholder="รายละเอียดหนังสือ"
                  {...bookEditForm.getInputProps("info")}
                />
                <TextInput
                  label="เรื่องย่อ"
                  placeholder="เรื่องย่อ"
                  {...bookEditForm.getInputProps("summary")}
                />
                <TextInput
                  label={`หมวดหมู่`}
                  placeholder={"id ของหมวดหมู่ที่เลือก เช่น 1,2,3"}
                  {...bookEditForm.getInputProps(`genresId`)}
                  disabled
                />
                {genres?.map((genre) => (
                  <Checkbox
                    label={`${genre.title}`}
                    checked={bookEditForm.values.genresId.includes(String(genre.id)) ?? false}
                    onChange={() => handleGenreChange(String(genre.id))}
                  />
                ))}

                {/* TODO: เพิ่มเรื่องย่อ */}
                {/* TODO: เพิ่มหมวดหมู่(s) */}

                <Divider />

                <div className="flex justify-between">
                  <Button
                    color="red"
                    leftSection={<IconTrash />}
                    size="xs"
                    onClick={() => {
                      modals.openConfirmModal({
                        title: "คุณต้องการลบหนังสือเล่มนี้ใช่หรือไม่",
                        children: (
                          <span className="text-xs">
                            เมื่อคุณดำนเนินการลบหนังสือเล่มนี้แล้ว จะไม่สามารถย้อนกลับได้
                          </span>
                        ),
                        labels: { confirm: "ลบ", cancel: "ยกเลิก" },
                        onConfirm: () => {
                          handleDelete();
                        },
                        confirmProps: {
                          color: "red",
                        },
                      });
                    }}
                  >
                    ลบหนังสือนี้
                  </Button>

                  <Button type="submit" loading={isLoading || isProcessing}>
                    บันทึกข้อมูล
                  </Button>
                </div>
              </form>
            </>
          )}
        </Container>
      </Layout>
    </>
  );
}
