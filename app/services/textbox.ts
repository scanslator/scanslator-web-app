import axios from "axios";

export async function getTextbox(image: File): Promise<unknown> {
  const url = "http://127.0.0.1:5000/textbox";
  const formData = new FormData();
  formData.append("image", image);

  try {
    const response = await axios.post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      responseType: "json",
    });
    return response;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
}