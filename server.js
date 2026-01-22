const express=require("express")
const  connect_db = require("./utils/connect_db")
const authRouter=require("./routes/auth.routes")
const cors=require("cors")
const app=express()
app.use(express.json())
app.use("/api/auth",authRouter)
app.use(cors())

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