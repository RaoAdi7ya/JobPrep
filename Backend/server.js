const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const app = require("./src/app");
const connectToDB = require("./src/config/database");
const invokeGemininAi = require("./src/services/ai.service");

connectToDB()

invokeGemininAi()
  .then((result) => console.log("Gemini test successful"))
  .catch((error) => console.error("Gemini test failed"));
app.listen(3000, () =>{
    console.log("server is running on port 3000")

})