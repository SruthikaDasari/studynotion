// Adds default course categories if they don't exist yet. Safe to run many times.
// Usage: npm run seed:categories
require("dotenv").config();
const mongoose = require("mongoose");
const Category = require("../models/Category");

const CATEGORIES = [
  { name: "Web Development", description: "HTML, CSS, JavaScript, React, Node and more" },
  { name: "Python", description: "Python programming from basics to advanced" },
  { name: "Data Science", description: "Data analysis, ML and AI" },
  { name: "Android Development", description: "Build mobile apps for Android" },
  { name: "DevOps", description: "CI/CD, Docker, cloud and deployment" },
  { name: "Blockchain", description: "Web3, smart contracts and crypto" },
];

(async () => {
  await mongoose.connect(process.env.MONGODB_URL);
  for (const c of CATEGORIES) {
    await Category.updateOne({ name: c.name }, { $setOnInsert: c }, { upsert: true });
  }
  console.log("Categories:", (await Category.find({}, "name")).map((c) => c.name).join(", "));
  await mongoose.disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
