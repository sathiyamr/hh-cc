const pinataSDK = require("@pinata/sdk");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const pinata = new pinataSDK(
  process.env.PINATA_API_KEY,
  process.env.PINATA_API_SECRET
);

async function storeImages(imagesFilePath) {
  // const { File } = await import("fetch-blob");
  // const fullImagesPath = path.resolve(imagesFilePath);
  const fullImagesPath = path.join(__dirname, imagesFilePath);
  const files = fs.readdirSync(fullImagesPath);
  let responses = [];
  for (const fileName of files) {
    try {
      const fileStream = fs.createReadStream(
        path.join(fullImagesPath, fileName)
      );
      const result = await pinata.pinFileToIPFS(fileStream, {
        pinataMetadata: { name: fileName },
      });
      console.log(`Uploaded ${fileName}:`, result.IpfsHash);
      responses.push(result);
    } catch (err) {
      console.error(`Error uploading ${fileName}:`, err);
    }
  }

  return { responses, files };
}

async function storeTokenUriMetada(metadata) {
  try {
    const response = await pinata.pinJSONToIPFS(metadata);
    return response;
  } catch (error) {
    console.log(error);
  }
  return null;
}

module.exports = { storeImages, storeTokenUriMetada };
