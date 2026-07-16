import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import path from "path";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ---- Multer: file ko memory me rakho (Cloudinary storage package HATA diya) ----
const multerUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB (video ke liye)
});

// ---- Direct Cloudinary upload (image / video / pdf / zip sab) ----
const uploadBuffer = (file) =>
  new Promise((resolve, reject) => {
    const isImage = file.mimetype.startsWith("image/");
    const isVideo = file.mimetype.startsWith("video/");
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, "_");

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "skillsphere",
        resource_type: isImage ? "image" : isVideo ? "video" : "raw",
        // raw files (pdf/doc/zip) me extension zaroori hai warna nahi khulti
        public_id: isImage || isVideo ? `${Date.now()}-${name}` : `${Date.now()}-${name}${ext}`,
      },
      (err, result) => {
        if (err) {
          console.error("❌ Cloudinary upload error:", err.message);
          return reject(err);
        }
        resolve(result);
      }
    );
    stream.end(file.buffer);
  });

// ---- Middleware: multer ke baad Cloudinary pe upload karke path set karta hai ----
const toCloudinary = async (req, res, next) => {
  try {
    const files = req.files || (req.file ? [req.file] : []);
    for (const f of files) {
      const result = await uploadBuffer(f);
      f.path = result.secure_url; // ✅ routes me req.file.path waise hi milega
    }
    next();
  } catch (e) {
    res.status(500).json({ message: "File upload failed: " + e.message });
  }
};

// ---- Same interface — routes me KOI change nahi chahiye! ----
export const upload = {
  single: (field) => [multerUpload.single(field), toCloudinary],
  array: (field, max) => [multerUpload.array(field, max), toCloudinary],
};