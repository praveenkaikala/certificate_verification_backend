const mongoose=require("mongoose")

const certificateSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    instituteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institute",
      required: true,
    },
    courseName: {
      type: String,
    },
    ipfsHash: {
      type: String,
      required:true,
      unique:true,
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    valid: {
      type: Boolean,
      default: false,
    },
    transactionHash: {
      type: String,
      default:""
    },
    // issuerAddress: {
    //   type: String,
    // },
    signature:{
      type:String,
      required:true
    }
  },
  { timestamps: true }
);



module.exports=mongoose.model("Certificate", certificateSchema);
