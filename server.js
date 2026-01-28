const express=require("express")
const  connect_db = require("./utils/connect_db")
const authRouter=require("./routes/auth.routes")
const instituteRouter=require("./routes/institute.routes")
const adminRouter=require("./routes/admin.routes")
const studentRouter=require("./routes/student.routes")
const cors=require("cors")
const app=express()
app.use(express.json())
app.use("/api/v1/auth",authRouter)
app.use("/api/v1/admin",adminRouter)
app.use("/api/v1/institutes",instituteRouter)
app.use("/api/v1/students",studentRouter)
const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://certificate-verification-using-bloc.vercel.app",
];
app.use(cors({
    origin:allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials:true
}))
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/templates/index.html");
});

app.listen(5000,()=>{
    console.log("Server is running on 5000 port")
})


connect_db()

// adminModel.create({
//      name: "Praveen Kumar",
//     email: "praveenkaikala25@gmail.com",
//     phone: "1234567890",
//     password:"123458",
//     walletAddress: "0xA495A536df91A00AA3a79cEb9501e2f585EbcFbf"
   
// }).then((data)=>{
//     console.log(data)
// }).catch((error)=>{
//     console.log(error)
// })