const mongoose=require("mongoose")

const instituteSchema = new mongoose.Schema(
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
    },
     reg_no: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      default:""
    },
    password: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      default:""
    },
    walletAddress: {
      type: String,
      default:""
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
      default:null
    },
    otpExpires: {
      type: Date,
      default:null
    },
    format_reg_no:{
      type:String,
      required:true
    },
    role: {
      type: String,
      default: "institute",
    },
  },
  { timestamps: true }
);

module.exports= mongoose.model("Institute", instituteSchema);
