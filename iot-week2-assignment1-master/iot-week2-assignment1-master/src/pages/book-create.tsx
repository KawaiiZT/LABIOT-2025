import { useNavigate } from "react-router-dom";
import Layout from "../components/layout";
import { Button, Container, Divider, TextInput, Checkbox } from "@mantine/core";
import { isNotEmpty, useForm } from "@mantine/form";
import { useState } from "react";
import axios from "../lib/axios";
import { AxiosError } from "axios";
import { notifications } from "@mantine/notifications";
import { Genres } from "../lib/models";
import { DateTimePicker } from "@mantine/dates";
import useSWR from "swr";

export default function BookCreatePage() {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: genres } = useSWR<Genres[]>(`genres`);
  let dateNow = new Date();
  dateNow.setHours(0, 0, 0, 0); // Set time to midnight for consistency
  const bookCreateForm = useForm({
    initialValues: {
      title: "",
      author: "",
      info: "",
      summary: "",
      publishedAt: dateNow,
      genresId: [] as string[],
    },

    validate: {
      title: isNotEmpty("กรุณาระบุชื่อหนังสือ"),
      author: isNotEmpty("กรุณาระบุชื่อผู้แต่ง"),
      info: isNotEmpty("กรุณาระบุรายละเอียดหนังสือ"),
      summary: isNotEmpty("กรุณาระบุเรื่องย่อ"),
      publishedAt: isNotEmpty("กรุณาระบุวันที่พิมพ์หนังสือ"),
    },
  });

  const handleGenreChange = (id: string) => {
    const currentGenres = bookCreateForm.values.genresId ?? [];
    let newGenres: string[];
    if (currentGenres.includes(id)) {
      newGenres = currentGenres.filter(g => g !== id);
    } else {
      newGenres = [...currentGenres, id];
    }
    bookCreateForm.setFieldValue('genresId', newGenres);
  };

  const handleSubmit = async (values: typeof bookCreateForm.values) => {
    try {
      setIsProcessing(true);
      // Create book without genres first
      const genres = values.genresId.map(Number);
      const bookData = { ...values, genresId: genres };
      console.log("New book created:", typeof(bookData.genresId[0]));
      const response = await axios.post(`books`, bookData);
      const bookId = response.data.bookid;
      console.log("New book created with ID:", response.data);

      notifications.show({
        title: "เพิ่มข้อมูลหนังสือสำเร็จ",
        message: "ข้อมูลหนังสือได้รับการเพิ่มเรียบร้อยแล้ว",
        color: "teal",
      });
      navigate(`/books/${bookId}`);
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 400) {
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

  return (
    <>
      <Layout>
        <Container className="mt-8">
          <h1 className="text-xl">เพิ่มหนังสือในระบบ</h1>

          <form onSubmit={bookCreateForm.onSubmit(handleSubmit)} className="space-y-8">
            <TextInput
              label="ชื่อหนังสือ"
              placeholder="ชื่อหนังสือ"
              {...bookCreateForm.getInputProps("title")}
            />

            <TextInput
              label="ชื่อผู้แต่ง"
              placeholder="ชื่อผู้แต่ง"
              {...bookCreateForm.getInputProps("author")}
            />

            <DateTimePicker
              label="วันที่พิมพ์"
              placeholder="วันที่พิมพ์"
              {...bookCreateForm.getInputProps("publishedAt")}
            />

            <TextInput
              label="รายละเอียดหนังสือ"
              placeholder="รายละเอียดหนังสือ"
              {...bookCreateForm.getInputProps("info")}
            />
            <TextInput
              label="เรื่องย่อ"
              placeholder="เรื่องย่อ"
              {...bookCreateForm.getInputProps("summary")}
            />
            <TextInput
              label={`หมวดหมู่`}
              placeholder={"id ของหมวดหมู่ที่เลือก เช่น 1,2,3"}
              {...bookCreateForm.getInputProps(`genresId`)}
              disabled
            />
            {genres?.map((genre) => (
              <Checkbox
                key={genre.id}
                label={`${genre.title}`}
                checked={bookCreateForm.values.genresId.includes(String(genre.id)) ?? false}
                onChange={() => handleGenreChange(String(genre.id))}
              />
            ))}

            <Divider />

            <Button type="submit" loading={isProcessing}>
              บันทึกข้อมูล
            </Button>
          </form>
        </Container>
      </Layout>
    </>
  );
}