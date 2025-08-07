import helpHeadingSchema from "../models/helpHeadingModel.js";
import helpBodySchema from "../models/helpBodyModel.js";
import asyncHandler from "express-async-handler";
import { getModel } from "../config/db.js";
import mongoose from 'mongoose';


const createHeading = asyncHandler(async (req, res) => {
  const { title } = req.body;
  const HelpHeading = await getModel("Authentication", "HelpHeading", helpHeadingSchema);

  if(!title) {
    res.status(400)
    throw new Error('Title is required')
  }

  const heading = new HelpHeading({
    title
  });
  
  await heading.save();
  res.status(201).json({ heading , message: "Heading saved successfully"});
});

const createBody = asyncHandler(async (req, res) => {
  const { heading, subheading, details } = req.body;
  const HelpBody = await getModel("Authentication", "HelpBody", helpBodySchema);

  // Validate input
  if (!heading || !subheading || !details) {
    res.status(400);
    throw new Error("Missing required fields: heading, subheading, or details");
  }

  
  if (!mongoose.Types.ObjectId.isValid(heading)) {
    res.status(400);
    throw new Error("Invalid heading ID format");
  }


  const HelpHeading = await getModel("Authentication", "HelpHeading", helpHeadingSchema);
  const headingExists = await HelpHeading.exists({ _id: heading });

  if (!headingExists) {
    res.status(404);
    throw new Error("Referenced heading does not exist");
  }

  const body = await HelpBody.create({
    heading,
    subheading,
    details,
  });

  res.status(201).json({
    message: "Body created successfully",
    body,
  });
});

const getHelp = asyncHandler(async (req, res) => {
  const HelpHeading = await getModel("Authentication", "HelpHeading", helpHeadingSchema);
  const HelpBody = await getModel("Authentication", "HelpBody", helpBodySchema);

  // Fetch all headings and bodies
  const [headings, bodies] = await Promise.all([
    HelpHeading.find({}).sort({ createdAt: 1 }).lean(),
    HelpBody.find({}).sort({ createdAt: 1 }).lean(),
  ]);

  // Group bodies by heading._id
  const bodyMap = {};
  for (const body of bodies) {
    const headingId = body.heading.toString();
    if (!bodyMap[headingId]) bodyMap[headingId] = [];
    bodyMap[headingId].push(body);
  }

  // Assemble final help array
  const help = headings.map((heading) => ({
    id: heading._id,
    title: heading.title,
    createdAt: heading.createdAt,
    bodies: bodyMap[heading._id.toString()] || [],
  }));

  res.status(200).json(help);
});

const editHeading = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;
  const HelpHeading = await getModel("Authentication", "HelpHeading", helpHeadingSchema);

  if (!title) {
    res.status(400);
    throw new Error("Title is required");
  }

  const heading = await HelpHeading.findByIdAndUpdate(
    id,
    { title },
    { new: true }
  );

  if (!heading) {
    res.status(404);
    throw new Error("Heading not found");
  }

  res.status(200).json({ heading, message: "Heading updated successfully" });
});

const editBody = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { heading, subheading, details } = req.body;
  const HelpBody = await getModel("Authentication", "HelpBody", helpBodySchema);

  if (!heading || !subheading || !details) {
    res.status(400);
    throw new Error("Missing required fields: heading, subheading, or details");
  }

  if (!mongoose.Types.ObjectId.isValid(heading)) {
    res.status(400);
    throw new Error("Invalid heading ID format");
  }

  const HelpHeading = await getModel("Authentication", "HelpHeading", helpHeadingSchema);
  const headingExists = await HelpHeading.exists({ _id: heading });

  if (!headingExists) {
    res.status(404);
    throw new Error("Referenced heading does not exist");
  }

  const body = await HelpBody.findByIdAndUpdate(
    id,
    { heading, subheading, details },
    { new: true }
  );

  if (!body) {
    res.status(404);
    throw new Error("Body not found");
  }

  res.status(200).json({ message: "Body updated successfully", body });
});

const deleteHeading = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const HelpHeading = await getModel("Authentication", "HelpHeading", helpHeadingSchema);
  const heading = await HelpHeading.findByIdAndDelete(id);

  if (!heading) {
    res.status(404);
    throw new Error("Heading not found");
  }

  // Also delete associated bodies
  const HelpBody = await getModel("Authentication", "HelpBody", helpBodySchema);
  await HelpBody.deleteMany({ heading: id });

  res.status(200).json({ message: "Heading deleted successfully" });
});

const deleteBody = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const HelpBody = await getModel("Authentication", "HelpBody", helpBodySchema);
  const body = await HelpBody.findByIdAndDelete(id);

  if (!body) {
    res.status(404);
    throw new Error("Body not found");
  }

  res.status(200).json({ message: "Body deleted successfully" });
});

export {
  createHeading,
  createBody, getHelp,
  editHeading, editBody, deleteHeading, deleteBody
}
 