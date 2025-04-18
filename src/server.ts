import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { writeFile } from "fs/promises";
import { join } from "path";

const app = new Hono();

app.post("/drawing", async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get("drawing") as File;

    if (!file) {
      return c.json({ error: "No file uploaded" }, 400);
    }

    const buffer = await file.arrayBuffer();
    const fileName = `drawing-${Date.now()}.png`;
    const filePath = join(process.cwd(), "uploads", fileName);

    await writeFile(filePath, Buffer.from(buffer));

    return c.json({ success: true, fileName });
  } catch (error) {
    console.error("Error handling drawing upload:", error);
    return c.json({ error: "Failed to process drawing" }, 500);
  }
});

// Proxy requests to Vite dev server
app.all("/*", async (c) => {
  const viteDevServer = "http://localhost:5173";
  const path = c.req.path;
  const response = await fetch(viteDevServer + path);
  return response;
});

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
