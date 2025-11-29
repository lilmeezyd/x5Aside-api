import asyncHandler from "express-async-handler";
import imageSchema from "../models/imageModel.js";
import eventSchema from "../models/eventModel.js";
import { getModel } from "../config/db.js";
import ImageKit from "imagekit";

const imagekit = new ImageKit({
  publicKey: "public_3mlFIPEJClyIcClD9DpRy722ej8=",
  privateKey: "private_D1PQcI+sV3dUAzhFKm+/VFpH5x4=",
  urlEndpoint: "https://ik.imagekit.io/cap10",
});

// Initialize Images for all events (empty slots)
export const createTOW = asyncHandler(async (req, res) => {
  const dbName = req.query.dbName || req.body?.dbName;
  const ImageModel = await getModel(dbName, "Image", imageSchema);
  const Event = await getModel(dbName, "Event", eventSchema);
const slotsTaken = await ImageModel.find({});
  if(slotsTaken.length > 0) {
    res.status(400);
    throw new Error('Slots already created');
  }
  const events = await Event.find({});
  const eventIds = events.map(event => ({
    eventId: event.eventId,
    url: "",
    fileId: "",
    name: ""
  }));

  await ImageModel.insertMany(eventIds);
  res.json({ message: "Image slots created for all events" });
});

// Upload image
export const uploadImage = asyncHandler(async (req, res) => {
  const dbName = req.query.dbName || req.body?.dbName;
  const { eventId } = req.params;
console.log('body')
  console.log(req.body)
  console.log('file')
  console.log(req.file)
  console.log(req.params)
  if (!req.file) {
    res.status(400);
    throw new Error("No file uploaded");
  }
  if (!eventId) {
    res.status(400);
    throw new Error("EventId required");
  }

  const ImageModel = await getModel(dbName, "Image", imageSchema);

  // Upload to ImageKit
  const uploadResponse = await imagekit.upload({
    file: Buffer.from(req.file.buffer).toString("base64"),
    fileName: req.file.originalname
  });

  // Update DB with uploaded image
  const updatedImage = await ImageModel.findOneAndUpdate(
    { eventId },
    {
      url: uploadResponse.url,
      fileId: uploadResponse.fileId,
      name: req.file.originalname
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  res.status(201).json(updatedImage);
});

// Delete image
export const deleteImage = asyncHandler(async (req, res) => {
  const dbName = req.query.dbName || req.body?.dbName;
  const { fileId, eventId } = req.params;

  if (!fileId) {
    res.status(400);
    throw new Error("fileId is required");
  }
  if (!eventId) {
    res.status(400);
    throw new Error("eventId is required to reset DB entry");
  }

  const ImageModel = await getModel(dbName, "Image", imageSchema);

  // Delete from ImageKit
  await imagekit.deleteFile(fileId);

  // Reset the DB entry for this event
  const updatedImage = await ImageModel.findOneAndUpdate(
    { eventId },
    { url: "", fileId: "", name: "" },
    { new: true }
  );

  res.json({ message: "Image deleted successfully" });
});

// Get all images
export const getTOW = asyncHandler(async (req, res) => {
  const dbName = req.query.dbName || req.body?.dbName;
  const ImageModel = await getModel(dbName, "Image", imageSchema);
  const images = await ImageModel.find({}).sort({ eventId: 1 }); // Sort by eventId ascending
  res.json(images);
});