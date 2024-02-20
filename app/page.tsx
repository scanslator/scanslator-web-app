"use client";

import React, { useState } from "react";
import styles from "./page.module.css";
import { getMask } from "@/app/services/masks";
import DrawingCanvas from "./components/DrawingCanvas";

const App = () => {
  const [uploadedImage, setUploadedImage] = useState<File>();
  const [imageMask, setImageMask] = useState<File | null>(null);

  // Function to handle image upload.
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

  // Function to handle image download.
  const handleImageDownload = () => {
    // Do nothing if there is no image uploaded
    if (!uploadedImage) return;

    // Create a link to the image that was uploaded
    const link = document.createElement("a");
    link.href = URL.createObjectURL(uploadedImage);
    link.download = uploadedImage.name; // Set the filename for download
    document.body.appendChild(link);

    // Download the image
    link.click();
    document.body.removeChild(link);
  };

  // Function to fetch the image mask.
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

  // Function to add a current project to the Library
  const addToLibrary = () => {
    if (!uploadedImage) return;

    // Extract the file name from the uploadedImage object
    const imageName = uploadedImage.name;

    // Get the library bar element
    const libraryBar = document.querySelector(`.${styles["library-bar"]}`);
    const libraryContents = document.querySelector(
      `.${styles["library-contents"]}`
    );

    // Check if libraryBar exists
    if (libraryBar && libraryContents) {
      // Check if an image with the same file name is already present in the library bar
      // If a duplicate image is found, do not add it again
      const existingImages = libraryBar.querySelectorAll(
        `.${styles["library-item"]} p`
      );
      const duplicateImage = Array.from(existingImages).find(
        (title) => title.textContent === imageName
      );
      if (duplicateImage) {
        console.log(`Image '${imageName}' is already in the library.`);
        return;
      }

      // Create a new library item div
      const libraryItem = document.createElement("button");
      libraryItem.className = styles["library-item"];

      // Create an new library item image div
      const copiedImage = document.createElement("img");
      copiedImage.src = URL.createObjectURL(uploadedImage);
      copiedImage.alt = "Copied Image";
      copiedImage.className = styles["library-image"];

      // Create a new library item title div
      const title = document.createElement("p");
      title.textContent = imageName;
      title.className = styles["library-title"];

      // Add the two new divs to the library item
      libraryItem.appendChild(copiedImage);
      libraryItem.appendChild(title);

      // If the item is clicked, the image will change to that respective image
      libraryItem.addEventListener("click", () => {
        setUploadedImage(uploadedImage);
      });

      // Add the library item to the top of the library bar
      libraryContents.insertAdjacentElement("afterbegin", libraryItem);
    } else {
      console.error("Library bar not found");
    }
  };

  // HTML
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
        <button
          className={styles["tool-button"]}
          style={{ marginTop: "auto" }}
          onClick={addToLibrary}
        >
          Save to Library
        </button>
        <button className={styles["tool-button"]} onClick={handleImageDownload}>
          Download Image
        </button>
      </div>

      {/* Central Area (where image is placed) */}
      <div className={styles["main-content"]} style={{ position: "relative" }}>
        <DrawingCanvas />
        {/* {uploadedImage && (
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
        )} */}
      </div>

      {/* Library Bar */}
      <div className={styles["library-bar"]}>
        <h1>Library</h1>
        <div className={styles["library-contents"]}></div>
      </div>
    </div>
  );
};

export default App;
