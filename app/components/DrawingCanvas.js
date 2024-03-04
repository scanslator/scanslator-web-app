"use client";

import React, { useEffect, useState } from "react";
// import styles from "../page.module.css";
import { fabric } from "../services/fabric";

const DrawingCanvas = (image) => {
  const [isDrawingMode, setIsDrawingMode] = useState(true);
  const [isErasingMode, setIsErasingMode] = useState(false);
  const [canvas, setCanvas] = useState(null);

  useEffect(() => {
    // Initialize canvas
    const initCanvas = new fabric.Canvas("c", { isDrawingMode });

    console.log(image.image);

    setCanvas(initCanvas);
    const reader = new FileReader();
    reader.onload = function (f) {
      const data = f.target.result;
      fabric.Image.fromURL(data, (img) => {
        // Set image options here (e.g., scale, position)
        img.set({
          left: 50,
          top: 50,
          angle: 0,
          padding: 10,
          cornersize: 10,
          hasRotatingPoint: true,
        });
        // Add image onto canvas
        initCanvas.add(img).renderAll();
      });
    };
    reader.readAsDataURL(image.image);
    // }
    fabric.Object.prototype.transparentCorners = false;
    return () => {
      initCanvas.dispose();
    };
  }, []);

  const toggleDrawingMode = () => {
    setIsDrawingMode(!isDrawingMode);
    if (canvas) {
      canvas.isDrawingMode = !canvas.isDrawingMode;
    }
    console.log(canvas.freeDrawingBrush);
  };

  const toggleErasingMode = () => {
    canvas.freeDrawingBrush = new fabric.EraserBrush(canvas);
    setIsErasingMode(!isErasingMode);
    setIsDrawingMode(true);
    canvas.isDrawingMode = true;
    canvas.freeDrawingBrush.width = 10;
  };

  const clearCanvas = () => {
    if (canvas) {
      canvas.clear();
    }
  };

  const handleImageUpload = (event) => {
    canvas.freeDrawingBrush.width = 10;
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (f) {
        const data = f.target.result;
        fabric.Image.fromURL(data, (img) => {
          // Set image options here (e.g., scale, position)
          // img.set({
          //   left: 50,
          //   top: 50,
          //   angle: 0,
          //   padding: 10,
          //   cornersize: 10,
          //   hasRotatingPoint: true,
          // });
          // Add image onto canvas
          canvas.add(img).renderAll();
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // const downloadImage = () => {
  //   if (!canvas) return;

  //   // Get the data URL of the canvas
  //   const dataUrl = canvas.toDataURL({
  //     format: "png",
  //     quality: 1, // Adjust quality from 0 to 1 for PNGs
  //   });

  //   // Create a temporary link element
  //   const link = document.createElement("a");
  //   link.download = "canvas-image.png"; // Name of the downloaded file
  //   link.href = dataUrl;
  //   document.body.appendChild(link); // Required for Firefox
  //   link.click(); // Trigger the download
  //   document.body.removeChild(link); // Clean up
  // };

  return (
    <div
      // className={styles.img}
      style={{
        // maxWidth: "95%",
        // maxHeight: "95%",
        position: "absolute",
      }}
    >
      <button onClick={toggleDrawingMode}>
        {isDrawingMode ? "Cancel drawing mode" : "Enter drawing mode"}
      </button>
      <button onClick={toggleErasingMode}>Erase</button>
      <button onClick={clearCanvas}>Clear</button>
      {/* <input type="file" onChange={handleImageUpload} /> */}
      <canvas id="c" width="95%" height="95%" />
      {/* <button onClick={downloadImage}>Download Image</button> */}
    </div>
  );
};

export default DrawingCanvas;
