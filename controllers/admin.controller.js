const Institute = require("../models/institute.model");

/**
 * ✅ Verify / Approve Institute
 * Admin approves an institute
 */
exports.verifyInstitute = async (req, res) => {
  try {
    const { instituteId } = req.params;

    const institute = await Institute.findById(instituteId);
    if (!institute) {
      return res.status(404).json({ message: "Institute not found" });
    }

    if (institute.isApproved) {
      return res.status(400).json({ message: "Institute already approved" });
    }

    institute.isApproved = true;
    institute.approvedBy = req.admin._id; // or req.user._id
    await institute.save();

    res.status(200).json({
      message: "Institute approved successfully",
      institute,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to verify institute",
      error: error.message,
    });
  }
};

/**
 * 📋 Get all institutes (with pagination)
 * Query params: page, limit, approved
 */
exports.getInstitutes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.approved !== undefined) {
      filter.isApproved = req.query.approved === "true";
    }

    const [institutes, total] = await Promise.all([
      Institute.find(filter)
        .select("-password -otp -otpExpires")
        .populate("approvedBy", "name email")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Institute.countDocuments(filter),
    ]);

    res.status(200).json({
      data: institutes,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch institutes",
      error: error.message,
    });
  }
};


/**
 * 🔍 Get institute details by ID
 */
exports.getInstituteById = async (req, res) => {
  try {
    const { instituteId } = req.params;

    const institute = await Institute.findById(instituteId)
      .select("-password -otp -otpExpires")
      .populate("approvedBy", "name email");

    if (!institute) {
      return res.status(404).json({ message: "Institute not found" });
    }

    res.status(200).json(institute);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch institute",
      error: error.message,
    });
  }
};

/**
 * ❌ Remove institute
 * (Admin only)
 */
exports.deleteInstitute = async (req, res) => {
  try {
    const { instituteId } = req.params;

    const institute = await Institute.findById(instituteId);
    if (!institute) {
      return res.status(404).json({ message: "Institute not found" });
    }

    await institute.deleteOne();

    res.status(200).json({
      message: "Institute removed successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete institute",
      error: error.message,
    });
  }
};
