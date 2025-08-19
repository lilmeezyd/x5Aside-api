import asyncHandler from "express-async-handler";
import imageSchema from "../models/imageModel.js";
import ImageKit from "imagekit";
import eventSchema from "../models/eventModel.js";

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT, // e.g. https://ik.imagekit.io/yourid/
});

// Upload image
export const uploadImage = asyncHandler(async (req, res) => {
  const dbName = req.query.dbName || req.body?.dbName
  if (!req.file) {
    res.status(400);
    throw new Error("No file uploaded");
  }
const Event = getModel(dbName, "Event", eventSchema);
  const event = await Event.findOne({current: true});
if(!event) {
  res.status(404);
  throw new Error("No current event running");
}
const { eventId } = event
  const file = req.file;
const Image = getModel(dbName, "Image", imageSchema);
  const uploadResponse = await imagekit.upload({
    file: file.buffer.toString("base64"),
    fileName: file.originalname
  });

  // Save image metadata to DB
  const image = await Image.create({
    url: uploadResponse.url,
    fileId: uploadResponse.fileId,
    name: file.originalname,
    eventId
  });

  res.status(201).json(image);
});
