import axios from "axios";

export async function getMask(image: File): Promise<File> {
  const url = "http://127.0.0.1:5000/mask";

  const formData = new FormData();
  formData.append("file", image);

  try {
    const response = await axios.post<string>(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      responseType: "blob",
    });
    return new File([response.data], `${image.name}-mask`);
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
}
