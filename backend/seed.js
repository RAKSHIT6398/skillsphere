import dotenv from "dotenv";
dotenv.config();

import connectDB from "./config/db.js";
import User from "./models/User.js";
import Freelancer from "./models/Freelancer.js";
import Client from "./models/Client.js";

await connectDB();

// ----------------------
// Create Admin
// ----------------------
const adminExists = await User.findOne({
  email: "admin@skillsphere.com",
});

if (!adminExists) {
  await User.create({
    name: "Admin",
    email: "admin@skillsphere.com",
    password: "admin123",
    role: "admin",
    isEmailVerified: true,
  });

  console.log("✅ Admin created: admin@skillsphere.com / admin123");
} else {
  console.log("ℹ️ Admin already exists");
}

// ----------------------
// Create Sample Freelancer & Client
// ----------------------
const freelancerExists = await User.findOne({
  email: "freelancer@test.com",
});

if (!freelancerExists) {
  // Freelancer User
  const freelancerUser = await User.create({
    name: "Test Freelancer",
    email: "freelancer@test.com",
    password: "test123",
    role: "freelancer",
    isEmailVerified: true,
  });

  await Freelancer.create({
    user: freelancerUser._id,
    skills: [
      {
        name: "React",
        proficiency: "expert",
      },
      {
        name: "Node.js",
        proficiency: "intermediate",
      },
    ],
    hourlyRate: 500,
  });

  // Client User
  const clientUser = await User.create({
    name: "Test Client",
    email: "client@test.com",
    password: "test123",
    role: "client",
    isEmailVerified: true,
  });

  await Client.create({
    user: clientUser._id,
  });

  console.log("✅ Sample freelancer & client created");
} else {
  console.log("ℹ️ Sample users already exist");
}

process.exit(0);