"use client";

import React, { useEffect, useState } from "react";
import { fabric } from "fabric";

const DrawingCanvas = () => {
  const [isDrawingMode, setIsDrawingMode] = useState(true);
  const [canvas, setCanvas] = useState(null);

  useEffect(() => {
    // Initialize canvas
    const initCanvas = new fabric.Canvas("c", { isDrawingMode });
    setCanvas(initCanvas);
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
          img.set({
            left: 50,
            top: 50,
            angle: 0,
            padding: 10,
            cornersize: 10,
            hasRotatingPoint: true,
          });
          // Add image onto canvas
          canvas.add(img).renderAll();
          // Optional: Set a filter
          // var filter = new fabric.Image.filters.Brightness({
          //   brightness: 0.05,
          // });
          // img.filters.push(filter);
          // // Apply filters and re-render canvas
          // img.applyFilters(canvas.renderAll.bind(canvas));
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadImage = () => {
    if (!canvas) return;

    // Get the data URL of the canvas
    const dataUrl = canvas.toDataURL({
      format: "png",
      quality: 1, // Adjust quality from 0 to 1 for PNGs
    });

    // Create a temporary link element
    const link = document.createElement("a");
    link.download = "canvas-image.png"; // Name of the downloaded file
    link.href = dataUrl;
    document.body.appendChild(link); // Required for Firefox
    link.click(); // Trigger the download
    document.body.removeChild(link); // Clean up
  };

  return (
    <div>
      <button onClick={toggleDrawingMode}>
        {isDrawingMode ? "Cancel drawing mode" : "Enter drawing mode"}
      </button>
      <button onClick={clearCanvas}>Clear</button>
      <input type="file" onChange={handleImageUpload} />
      <canvas id="c" width="600" height="400" />
      <button onClick={downloadImage}>Download Image</button>
    </div>
  );
};

export default DrawingCanvas;
