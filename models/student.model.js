const mongoose=require("mongoose")

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    reg_no:{
      type:String,
      required:true,
      unique:true
    },
    password: {
      type: String,
      required: true,
    },
    instituteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institute",
      required: true,
    },
    walletAddress: {
      type: String,
      default:""
    },
    otp: {
      type: String,
      default:null
    },
    otpExpires: {
      type: Date,
      default:null
    },
    role: {
      type: String,
      default: "student",
    },
    verificationStatus:{
      type:Boolean,
      default:false
    }
  },
  { timestamps: true }
);

module.exports= mongoose.model("Student", studentSchema);
