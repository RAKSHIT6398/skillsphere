// import mongoose from "mongoose";

// const messageSchema = new mongoose.Schema(
//   {
//     conversation: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true },
//     sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//     text: String,
//     file: { url: String, name: String, fileType: String },
//     readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
//    // ✨ NEW FIELDS
//     edited: { type: Boolean, default: false },
//     deletedForEveryone: { type: Boolean, default: false },
//     deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // delete for me
//     reactions: [
//       {
//         user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//         emoji: String,
//       },
//     ],
//   },
  
//   { timestamps: true }
// );
// export default mongoose.model("Message", messageSchema);

import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  conversation: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: String,
  file: { url: String, name: String, fileType: String },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  deletedForEveryone: { type: Boolean, default: false },
  edited: { type: Boolean, default: false },
  starredBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // ✅ NEW
  reactions: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    emoji: String,
  }],
}, { timestamps: true });

export default mongoose.model("Message", messageSchema);
