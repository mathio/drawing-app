import { useRef, useState, useEffect } from "react";

interface Point {
  x: number;
  y: number;
}

export const DrawingCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState<Point | null>(null);
  const [drawingColor, setDrawingColor] = useState("#000000");
  const [lineWidth, setLineWidth] = useState(2);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth * 0.8;
      canvas.height = window.innerHeight * 0.8;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setLastPoint({ x, y });
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx || !lastPoint) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.lineTo(x, y);
    ctx.strokeStyle = drawingColor;
    ctx.lineWidth = lineWidth;
    ctx.stroke();

    setLastPoint({ x, y });
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    setLastPoint(null);
  };

  const doSubmitDrawing = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Save current drawing
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Fill with white background
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Restore drawing on top of white background
    ctx.putImageData(imageData, 0, 0);

    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
      }, "image/png");
    });

    const formData = new FormData();
    formData.append("drawing", blob, "drawing.png");

    try {
      const response = await fetch("/drawing", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload drawing");
      }
    } catch (error) {
      console.error("Error uploading drawing:", error);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "10px" }}>
        <label htmlFor="colorPicker" style={{ marginRight: "10px" }}>
          Drawing Color:{" "}
        </label>
        <input
          type="color"
          id="colorPicker"
          value={drawingColor}
          onChange={(e) => setDrawingColor(e.target.value)}
          style={{ cursor: "pointer" }}
        />
        <div style={{ marginTop: "10px" }}>
          <label htmlFor="lineWidth" style={{ marginRight: "10px" }}>
            Line Thickness: {lineWidth}px
          </label>
          <input
            type="range"
            id="lineWidth"
            min="1"
            max="20"
            value={lineWidth}
            onChange={(e) => setLineWidth(Number(e.target.value))}
            style={{ cursor: "pointer" }}
          />
        </div>
      </div>
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        style={{
          border: "1px solid #000",
          cursor: "crosshair",
        }}
      />
      <div>
        <button
          onClick={doSubmitDrawing}
          style={{
            marginTop: "10px",
            padding: "8px 16px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Submit your drawing
        </button>
      </div>
    </div>
  );
};
