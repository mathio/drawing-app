import weaviate, {
  generative,
  vectorizer,
  WeaviateClient,
} from "weaviate-client";
import fs from "fs/promises";
import path from "path";

const weaviateUrl = process.env.WEA_URL as string;
const weaviateApiKey = process.env.WEA_API_KEY as string;

export async function doWeaviate(base64Image: string) {
  const client: WeaviateClient = await weaviate.connectToWeaviateCloud(
    weaviateUrl,
    {
      authCredentials: new weaviate.ApiKey(weaviateApiKey),
      headers: {
        "X-JinaAI-Api-Key": "",
      },
    }
  );

  var clientReadiness = await client.isReady();
  console.log(clientReadiness);

  const collection = client.collections.get("picture3");

  // const imagePath = path.join(path.join(process.cwd(), "uploads"), "goose.png");
  // const imageData = await fs.readFile(imagePath);
  // const base64Image = imageData.toString("base64");

  const result = await collection.query.nearImage(base64Image, {
    limit: 1,
    returnProperties: ["drawing", "text"],
  });

  console.log(result.objects[0].properties.text);

  return result;
}

async function getImageData() {
  const uploadsDir = path.join(process.cwd(), "uploads");
  const files = await fs.readdir(uploadsDir);

  return Promise.all(
    files.map(async (file) => {
      const imagePath = path.join(uploadsDir, file);
      const imageData = await fs.readFile(imagePath);
      return {
        drawing: imageData.toString("base64"),
        text: file,
      };
    })
  );
}

export async function initWeaviate() {
  const client: WeaviateClient = await weaviate.connectToWeaviateCloud(
    weaviateUrl,
    {
      authCredentials: new weaviate.ApiKey(weaviateApiKey),
      headers: {
        "X-JinaAI-Api-Key": "",
      },
    }
  );

  var clientReadiness = await client.isReady();
  console.log(clientReadiness);

  // await client.collections.create({
  //   name: "picture3",
  //   vectorizers: [
  //     vectorizer.multi2VecJinaAI({
  //       name: "title_vector",
  //       imageFields: [
  //         {
  //           name: "drawing",
  //           weight: 0.9,
  //         },
  //         {
  //           name: "title",
  //           weight: 0.1,
  //         },
  //       ],
  //     }),
  //   ],
  //   generative: generative.cohere(),
  // });

  const pictures = client.collections.get("picture3");
  const data = await getImageData();
  console.log(data);
  const result = await pictures.data.insertMany(data);
  console.log("Insertion response: ", result);

  client.close();
}
