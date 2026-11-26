const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const app = require("./src/app");
const connectToDB = require("./src/config/database");
const { resume, selfDescription, jobDescription } = require("./src/services/temp")
const  generateInterviewReport  = require("./src/services/ai.service")
connectToDB()

generateInterviewReport({ resume, selfDescription, jobDescription })
  .then((report) => {
    console.log("AI Report:", JSON.stringify(report, null, 2));
  })
  .catch((err) => {
    console.error("Failed to generate report:", err.message);
  });

app.listen(3000, () =>{
    console.log("server is running on port 3000")

})