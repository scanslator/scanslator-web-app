import axios from "axios";

export async function removeMask(original: File, mask:File): Promise<File> {
  const url = "http://127.0.0.1:5000/infill";

  const formData = new FormData();
  formData.append("image", original);
  formData.append("mask", mask);

  try {
    const response = await axios.post<string>(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      responseType: "blob",
    });
    return new File([response.data], `${original.name}-mask`);
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
}