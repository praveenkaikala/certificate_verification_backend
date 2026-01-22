require("dotenv").config()
const mongoose=require("mongoose")


const connect_db=async()=>{
   mongoose.connect(process.env.MONGO_URI,{
           dbName:"blockchain"
       }).then(()=>{
           console.log("db connected")
       }).catch((err)=>{
           console.log(err)
       })
}

module.exports=connect_db