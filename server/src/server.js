import "dotenv/config";
import express from "express";
import loginRoutes from "./routes/loginRoutes.js";
import HomePageRoutes from "./routes/HomePageRoutes.js";

const PORT = 9933;
const app = express();

app.use("/home", HomePageRoutes);
app.use("/auth", loginRoutes);

app.listen(PORT, () => {
  console.log(`Server started in the port http://localhost:${PORT}`);
});
