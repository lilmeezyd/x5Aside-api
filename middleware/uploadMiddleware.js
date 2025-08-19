import multer from "multer";

const storage = multer.memoryStorage(); // keep in memory
const upload = multer({ storage });

export default upload;
