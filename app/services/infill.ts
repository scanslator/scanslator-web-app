import axios from "axios";

export async function getInfill(image: File, mask: File): Promise<File> {
    const url = "http://127.0.0.1:5000/infill";

    const formData = new FormData();
    formData.append("image", image);
    formData.append("mask", mask);

    try {
        const response = await axios.post<string>(url, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            responseType: "blob",
        });
        // console.log(image.name)
        // console.log('data')
        // console.log(response.data)
        return new File([response.data], `image-infill`);
    } catch (error) {
        console.error("Error retrieving infill image:", error);
        throw error;
    }
}
