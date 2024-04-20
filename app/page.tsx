"use client";

import React, { useState } from "react";
import styles from "./page.module.css";
import { getMask } from "@/app/services/masks";
import DrawingCanvas from "./components/DrawingCanvas";
import { Canvas } from "fabric/fabric-impl";
import { getInfill } from "@/app/services/infill";
import { withAuthenticator } from "@aws-amplify/ui-react";
import { signOut } from "aws-amplify/auth";
import "@aws-amplify/ui-react/styles.css";

const App = () => {
  const [uploadedImage, setUploadedImage] = useState<File>();
  const [imageMask, setImageMask] = useState<File | null>(null);
  const [canvas, setCanvas] = useState<Canvas | null>(null);

  // Function to handle image upload.
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Remove the mask
    setImageMask(null);

    // Upload the image
    const file = event.target.files?.[0];
    if (file) {
      setUploadedImage(file);
    }
    console.log(file);
  };

  // Function to handle image download.
  // const handleImageDownload = () => {
  //   // Do nothing if there is no image uploaded
  //   if (!uploadedImage) return;
  //
  //   // Create a link to the image that was uploaded
  //   const link = document.createElement("a");
  //   link.href = URL.createObjectURL(uploadedImage);
  //   link.download = uploadedImage.name; // Set the filename for download
  //   document.body.appendChild(link);
  //
  //   // Download the image
  //   link.click();
  //   document.body.removeChild(link);
  // };

  const handleImageDownload = () => {
    if (!canvas) return;

    const dataUrl = canvas.toDataURL({
      format: "png",
      quality: 1,
    });

    const link = document.createElement("a");
    link.download = "canvas-image.png";
    link.href = dataUrl;
    document.body.appendChild(link);
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

  const getBackgroundImage = async () => {
    return new Promise(async (resolve, reject) => {
      if (!canvas) {
        console.error("Canvas is not available");
        reject(new Error("Canvas is not available"));
        return;
      }

      // Create an off-screen canvas element
      const offScreenCanvas = document.createElement("canvas");
      offScreenCanvas.width = canvas.width as number;
      offScreenCanvas.height = canvas.height as number;
      const offScreenContext = offScreenCanvas.getContext("2d");

      if (!offScreenContext) {
        console.error("Unable to get context for the off-screen canvas");
        reject(new Error("Unable to get context for the off-screen canvas"));
        return;
      }

      // Check if the background image exists
      if (canvas.backgroundImage) {
        // Draw the background image onto the off-screen canvas
        // Clone the background image to manipulate and draw it
        canvas.backgroundImage.clone(
          (clonedBg) => {
            clonedBg.scaleToWidth(offScreenCanvas.width);
            clonedBg.scaleToHeight(offScreenCanvas.height);
            clonedBg.set({ left: 0, top: 0, originX: "left", originY: "top" });
            clonedBg.render(offScreenContext);

            offScreenCanvas.toBlob((blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error("Failed to create blob from canvas"));
              }
            }, "image/png");
          },
          ["left", "top", "scaleX", "scaleY", "originX", "originY"]
        );
      } else {
        console.error("Background image not found on the canvas");
        reject(new Error("Background image not found on the canvas"));
      }
    });
  };

  const getUpdatedMask = async () => {
    return new Promise(async (resolve, reject) => {
      if (!canvas) {
        console.error("Canvas is not available");
        reject(new Error("Canvas is not available"));
        return;
      }

      console.log(canvas.width);
      console.log(canvas.height);

      // Create an off-screen canvas element
      const offScreenCanvas = document.createElement("canvas");
      offScreenCanvas.width = canvas.width as number;
      offScreenCanvas.height = canvas.height as number;
      const offScreenContext = offScreenCanvas.getContext("2d");

      if (!offScreenContext) {
        console.error("Unable to get context for the off-screen canvas");
        reject(new Error("Unable to get context for the off-screen canvas"));
        return;
      }

      // Ensure all objects are rendered on the off-screen canvas
      canvas.renderAll();

      // Find the mask object on the canvas
      const maskObject = canvas
        .getObjects()
        .find((obj) => obj.type === "image"); // Assuming mask is the only image object

      if (!maskObject) {
        console.error("Mask object not found on the canvas");
        reject(new Error("Mask object not found on the canvas"));
        return;
      }

      // Draw the mask object onto the off-screen canvas
      maskObject.clone(
        (cloned) => {
          cloned.scaleToWidth(offScreenCanvas.width);
          cloned.scaleToHeight(offScreenCanvas.height);
          cloned.set({ left: 0, top: 0, originX: "left", originY: "top" });
          cloned.render(offScreenContext);

          // Now draw the additional drawings from the canvas on top of the mask
          canvas.getObjects().forEach((obj) => {
            if (obj !== maskObject && obj.type === "path") {
              obj.clone((clonedPath) => {
                clonedPath.set({
                  left: obj.left - canvas.width / 2 + clonedPath.width / 2,
                  top: obj.top - canvas.height / 2 + clonedPath.height / 2,
                });
                clonedPath.render(offScreenContext);
              });
            }
          });

          offScreenCanvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Failed to create blob from canvas"));
            }
          }, "image/png");
        },
        ["left", "top", "scaleX", "scaleY", "originX", "originY"]
      ); // Clone with specific properties
    });
  };

  const fetchInfill = async () => {
    console.log("infill");
    const updatedMask = (await getUpdatedMask()) as File;
    const updatedImage = (await getBackgroundImage()) as File;
    // downloadFile(updatedMask);
    // downloadFile(updatedImage)
    // console.log((await getImageDimensions(updatedImage)))
    // console.log((await getImageDimensions(updatedMask)))
    if (uploadedImage && imageMask) {
      console.log("test");
      const newImage = await getInfill(uploadedImage, imageMask);
      downloadFile(newImage);
      // newImage.scale(2)
      console.log(newImage);
      setUploadedImage(newImage);
      setImageMask(null);
      setCanvas(null);
    }
  };

  function downloadFile(imageFile) {
    // Check the file's MIME type
    const mimeType = imageFile.type || "image/png"; // Fallback to a binary stream type

    console.log(mimeType);
    // Create an object URL for the file
    const blob = new Blob([imageFile], { type: mimeType }); // This step might be redundant if imageFile is already of correct MIME type
    const url = URL.createObjectURL(blob);

    // Create a temporary anchor element and set the necessary attributes for downloading
    const a = document.createElement("a");
    a.href = url;
    a.download = imageFile.name; // Use the original file name for the download
    // a.type = mimeType; // This line is not necessary for downloading but shown for completeness

    // Append the anchor to the body, click it to trigger the download, and then remove it
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Clean up the object URL
    URL.revokeObjectURL(url);
  }

  function getImageDimensions(file) {
    return new Promise((resolve, reject) => {
      // Create a temporary URL for the file
      const src = URL.createObjectURL(file);

      // Load the image
      const img = new Image();
      img.onload = () => {
        // Clean up by revoking the temporary URL
        URL.revokeObjectURL(src);

        // Resolve the promise with the dimensions
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = reject;

      img.src = src;
    });
  }

  async function handleSignOut() {
    try {
      await signOut();
      // Optionally, redirect the user to the login page or home page
      // e.g., using Next.js Router or window.location
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  }

  // HTML
  return (
    <div className={styles.App}>
      {/* Top Bar */}
      <div className={styles["top-sidebar"]}>
        <button onClick={handleSignOut}>Sign out</button>
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
        <button type="button" onClick={fetchInfill}>
          Infill
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
        {/*{uploadedImage && <DrawingCanvas file={uploadedImage} canvas={canvas} setCanvas={setCanvas} />}*/}
        {uploadedImage && !imageMask && (
          <img
            className={styles.img}
            src={URL.createObjectURL(uploadedImage)}
            alt="Uploaded"
            style={{
              position: "absolute",
            }}
          />
        )}
        {/*{imageMask && (*/}
        {/*  <img*/}
        {/*    className={styles.img}*/}
        {/*    src={URL.createObjectURL(imageMask)}*/}
        {/*    alt="Mask"*/}
        {/*    style={{*/}
        {/*      position: "absolute",*/}
        {/*    }}*/}
        {/*  />*/}
        {/*)}*/}
        {uploadedImage && imageMask && (
          <DrawingCanvas
            image={uploadedImage}
            mask={imageMask}
            canvas={canvas}
            setCanvas={setCanvas}
          />
        )}
      </div>

      {/* Library Bar */}
      <div className={styles["library-bar"]}>
        <h1>Library</h1>
        <div className={styles["library-contents"]}></div>
      </div>
    </div>
  );
};

// export default App;
export default withAuthenticator(App);
