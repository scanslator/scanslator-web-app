"use client";

import React, {useEffect, useState} from "react";
// Uncomment and use if you have styles to import
// import styles from "../page.module.css";
import fabric from "../services/fabric";

const customFabric = fabric.fabric;
// Define a type for the component's props
interface DrawingCanvasProps {
  image: Blob;
  mask: Blob;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ image, mask, canvas, setCanvas}) => {
  const [isEditMode, setIsEditMode] = useState<boolean>(true);
  const [isErasingMode, setIsErasingMode] = useState<boolean>(false);
  const [maskObj, setMaskObj] = useState<fabric.Image | null>(null);


  useEffect( () => {
    let initCanvas;

    const initializeCanvas = (width: number, height: number) => {
      // Set the canvas dimensions to match the image/mask
      initCanvas = new customFabric.Canvas("c", {
        isDrawingMode: isEditMode,
        width: width,
        height: height,
      });
      setCanvas(initCanvas);
      return initCanvas;
    };

    const loadImage = (blob: Blob, isMask: boolean) => {
      return new Promise<void>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function (event: ProgressEvent<FileReader>) {
          if (event.target?.result) {
            customFabric.Image.fromURL(event.target.result as string, (img) => {
              if (!isMask) {
                // Set canvas dimensions to match the image dimensions
                initializeCanvas(img.width * 0.5, img.height * 0.5);
                img.selectable = false;
                img.evented = false;
                img.scale(0.5)
                initCanvas.setBackgroundImage(img, initCanvas.renderAll.bind(initCanvas));
              } else {
                // The mask is loaded second and added on top of the background image
                img.scale(0.5)
                img.set({
                  left: initCanvas.width / 2,
                  top: initCanvas.height / 2,
                  originX: 'center',
                  originY: 'center',
                });
                initCanvas.add(img); // Add the mask to the canvas for editing
                initCanvas.renderAll();
              }
              resolve();
            });
          } else {
            reject(new Error('Failed to load image from Blob'));
          }
        };
        reader.readAsDataURL(blob);
      });
    };

    const setupCanvasAndImages = async () => {
      try {
        // Assuming `image` is the background image Blob
        if (image) {
          await loadImage(image, false); // Load and set the background image
        }
        // Assuming `mask` is the mask Blob
        if (mask) {
          await loadImage(mask, true); // Load and set the mask image
        }
        // Configure brush for drawing (red) or erasing
        initCanvas.freeDrawingBrush = new customFabric.PencilBrush(initCanvas);
        initCanvas.freeDrawingBrush.color = 'red';
        initCanvas.freeDrawingBrush.width = 5;
      } catch (error) {
        console.error(error);
      }
    };

    customFabric.Object.prototype.transparentCorners = false;
    setupCanvasAndImages();

    return () => {
      initCanvas?.dispose();
    };
  }, [image, mask, isEditMode]);

  const toggleErasingMode = () => {
    if (canvas) {
      canvas.forEachObject((obj) => {
        if (obj === maskObj) { // Assuming maskObj is the fabric.Image for the mask
          obj.selectable = true;
          obj.evented = true; // The mask can be edited
        } else {
          obj.selectable = false;
          obj.evented = false; // Other objects cannot be edited
        }
      });
      if (isErasingMode) {
        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush = new customFabric.EraserBrush(canvas);
        canvas.freeDrawingBrush.width = 10;

        // Erasing the mask will reveal transparency, not a black color
        // canvas.freeDrawingBrush.globalCompositeOperation = 'destination-out';
      } else {
        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush = new customFabric.PencilBrush(canvas);
        canvas.freeDrawingBrush.color = 'red';
        canvas.freeDrawingBrush.width = 5;

        // Stop erasing; switch the composite operation back
        // canvas.freeDrawingBrush.globalCompositeOperation = 'source-over';

        // Make the mask object non-selectable again if needed
        // if (maskObj) {
        //   maskObj.selectable = false;
        //   maskObj.evented = false;
        // }
        canvas.renderAll();
      }

      setIsErasingMode(true);
    }
  };

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
    if (canvas) {
      canvas.isDrawingMode = !canvas.isDrawingMode;
    }
    // Switch back to drawing mode
    // if (canvas) {
    //   setIsErasingMode(false);
    //   setIsEditMode(true);
    //
    //   canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
    //   canvas.freeDrawingBrush.color = 'red'; // Set the drawing color to red
    //   canvas.freeDrawingBrush.width = 5;
    //
    //   // Stop erasing; switch the composite operation back
    //   canvas.freeDrawingBrush.globalCompositeOperation = 'source-over';
    //
    //   // Make the mask object non-selectable again if needed
    //   if (maskObj) {
    //     maskObj.selectable = false;
    //     maskObj.evented = false;
    //   }
    //
    //   canvas.renderAll();
    // }
  };

  const clearCanvas = () => {
    if (canvas) {
      canvas.clear();
    }
  };

  const downloadUpdatedMask = () => {
    if (!canvas) {
      console.error("Canvas is not available");
      return;
    }

    // Create an off-screen canvas element
    const offScreenCanvas = document.createElement('canvas');
    offScreenCanvas.width = canvas.width;
    offScreenCanvas.height = canvas.height;
    const offScreenContext = offScreenCanvas.getContext('2d');

    if (!offScreenContext) {
      console.error("Unable to get context for the off-screen canvas");
      return;
    }

    // Find the mask object on the canvas
    const maskObject = canvas.getObjects().find(obj => obj.type === 'image'); // Assuming mask is the only image object

    // Draw the mask object onto the off-screen canvas
    if (maskObject) {
      maskObject.clone((cloned) => {
        offScreenContext.drawImage(cloned.getElement(), 0, 0, offScreenCanvas.width, offScreenCanvas.height);

        // Now draw the additional drawings from the canvas on top of the mask
        canvas.getObjects().forEach(obj => {
          if (obj !== maskObject && obj.type === 'path') {
            obj.clone((clonedPath) => {
              clonedPath.set({ left: obj.left, top: obj.top });
              clonedPath.render(offScreenContext);
            });
          }
        });

        // Trigger the download
        offScreenCanvas.toBlob((blob) => {
          const link = document.createElement('a');
          link.download = 'updated-mask.png';
          link.href = URL.createObjectURL(blob);
          document.body.appendChild(link); // Firefox requires the link to be in the body
          link.click();
          document.body.removeChild(link); // Remove the link when done
        }, 'image/png');
      }, ['left', 'top']); // Clone with specific properties
    } else {
      console.error("Mask object not found on the canvas");
    }
  };

  return (
      <div
          // Uncomment and use your CSS styles if needed
          // className={styles.img}
          style={{
            position: "absolute",
          }}
      >
        <button onClick={toggleEditMode}>
          {isEditMode ? "Cancel edit mode" : "Enter edit mode"}
        </button>
        <button onClick={toggleErasingMode}>Erase</button>
        <button onClick={clearCanvas}>Clear</button>
        <canvas id="c" width="95%" height="95%"/>
        <button onClick={downloadUpdatedMask}>Save</button>
      </div>
);
};

export default DrawingCanvas;
