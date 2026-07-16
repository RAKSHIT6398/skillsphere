import cloudinary from "./cloudinary.js";
import streamifier from "streamifier";

export const uploadToCloudinary = (file, folder = "skillsphere") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
      },
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );

    streamifier.createReadStream(file.buffer).pipe(stream);
  });
};