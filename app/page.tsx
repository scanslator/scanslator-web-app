"use client";

import React, { useState } from "react";
import styles from "./page.module.css";
import { getMask } from "@/app/services/masks";

const App = () => {
  // Function to handle image upload.
  const [uploadedImage, setUploadedImage] = useState<File>();
  const [imageMask, setImageMask] = useState<File | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Remove the mask
    setImageMask(null);
    // Upload the image
    const file = event.target.files?.[0];
    if (file) {
      setUploadedImage(file);
    }
    console.log(imageMask);
  };

  async function fetchMask() {
    if (!uploadedImage) return;

    try {
      const mask = await getMask(uploadedImage);
      setImageMask(mask);
    } catch (error) {
      console.error("failed to fetch mask");
      throw error;
    }
  }

  return (
    <div className={styles.App}>
      {/* Top Bar */}
      <div className={styles["top-sidebar"]}>
        <input
          id="upload"
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
        />
        <button type="button" onClick={fetchMask}>
          Mask On
        </button>
        <button type="button" onClick={() => setImageMask(null)}>
          Reset Mask
        </button>
      </div>

      {/* Tool Bar */}
      <div className={styles["tool-bar"]}>
        <button className={styles["tool-button"]}></button>
        <button className={styles["tool-button"]}></button>
        <button className={styles["tool-button"]}></button>
        <button className={styles["tool-button"]}></button>
      </div>

      {/* Central Area (where image is placed) */}
      <div className={styles["main-content"]} style={{ position: "relative" }}>
        {uploadedImage && (
          <img
            className={styles.img}
            src={URL.createObjectURL(uploadedImage)}
            alt="Uploaded"
            style={{
              position: "absolute",
            }}
          />
        )}
        {imageMask && (
          <img
            className={styles.img}
            src={URL.createObjectURL(imageMask)}
            alt="Mask"
            style={{
              position: "absolute",
            }}
          />
        )}
      </div>

      {/* Library Bar */}
      <div className={styles["library-bar"]}>{/* Library goes here */}</div>
    </div>
  );
};

export default App;
