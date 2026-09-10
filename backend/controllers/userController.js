import User from "../model/user.js";
import Quiz from "../model/Quiz.js";
import Result from "../model/Result.js";
import { getAuth } from "@clerk/express";

// ========================================
// ADMIN DASHBOARD STATS
// ========================================

export const getStats = async (req, res) => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // =========================
    // USERS
    // =========================

    const totalUsers = await User.countDocuments();

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const activeUsers = await User.countDocuments({
      lastActiveDate: { $gte: fiveMinutesAgo },
    });

    const inactiveUsers = totalUsers - activeUsers;

    const pendingUsers = await User.countDocuments({
      eligibilityStatus: "pending",
    });

    // =========================
    // TOTAL QUESTIONS
    // =========================

    const questionStats = await Quiz.aggregate([
      {
        $project: {
          questionCount: {
            $size: {
              $ifNull: ["$questions", []],
            },
          },
        },
      },
      {
        $group: {
          _id: null,
          totalQuestions: {
            $sum: "$questionCount",
          },
        },
      },
    ]);

    const totalQuestions =
      questionStats.length > 0
        ? questionStats[0].totalQuestions
        : 0;

    // =========================
    // QUIZ STATISTICS
    // =========================

    // Old results without status are also treated as submitted
    const submittedQuizzes = await Result.countDocuments({
      $or: [
        { status: "submitted" },
        { status: { $exists: false } },
      ],
    });

    // Only explicitly pending attempts
    const pendingQuizzes = await Result.countDocuments({
      status: "pending",
    });

    // =========================
    // ACTIVITY
    // =========================

    const activityPercentage =
      totalUsers > 0
        ? ((activeUsers / totalUsers) * 100).toFixed(1)
        : "0.0";

    // =========================
    // RESPONSE
    // =========================

    return res.json({
      success: true,

      totalUsers,
      activeUsers,
      inactiveUsers,
      pendingUsers,

      totalQuestions,

      submittedQuizzes,
      pendingQuizzes,

      activityPercentage,
    });

  } catch (err) {
    console.error("Admin stats error:", err);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


// ========================================
// DASHBOARD DETAILS
// ========================================

export const getDashboardDetails = async (req, res) => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { type } = req.query;

    // =====================================================
    // TOTAL USERS
    // =====================================================

    if (type === "totalUsers") {
      const users = await User.find({})
        .sort({ createdAt: -1 })
        .lean();

      const data = users.map((user) => ({
        _id: user._id,

        fullName: user.fullName || "N/A",

        email: user.email || "N/A",

        role: user.role || "student",

        eligibilityStatus:
          user.eligibilityStatus || "pending",

        isLoggedIn:
          user.isLoggedIn === true,

        lastActiveDate:
          user.lastActiveDate || null,
      }));

      return res.json({
        success: true,
        title: "All Users",
        data,
      });
    }


    // =====================================================
    // ACTIVE / LOGGED-IN USERS
    // =====================================================

    if (type === "activeUsers") {
      const fiveMinutesAgo =
        new Date(Date.now() - 5 * 60 * 1000);

      const users = await User.find({
        lastActiveDate: {
          $gte: fiveMinutesAgo,
        },
      })
        .sort({ lastActiveDate: -1 })
        .lean();

      const data = users.map((user) => ({
        _id: user._id,

        fullName: user.fullName || "N/A",

        email: user.email || "N/A",

        role: user.role || "student",

        eligibilityStatus:
          user.eligibilityStatus || "pending",

        isLoggedIn:
          user.isLoggedIn === true,

        lastActiveDate:
          user.lastActiveDate || null,
      }));

      return res.json({
        success: true,
        title: "Logged In Users",
        data,
      });
    }


    // =====================================================
    // INACTIVE USERS
    // =====================================================

    if (type === "inactiveUsers") {
      const fiveMinutesAgo =
        new Date(Date.now() - 5 * 60 * 1000);

      const users = await User.find({
        $or: [
          {
            lastActiveDate: {
              $lt: fiveMinutesAgo,
            },
          },
          {
            lastActiveDate: null,
          },
          {
            lastActiveDate: {
              $exists: false,
            },
          },
        ],
      })
        .sort({ lastActiveDate: -1 })
        .lean();

      const data = users.map((user) => ({
        _id: user._id,

        fullName: user.fullName || "N/A",

        email: user.email || "N/A",

        role: user.role || "student",

        eligibilityStatus:
          user.eligibilityStatus || "pending",

        isLoggedIn:
          user.isLoggedIn === true,

        lastActiveDate:
          user.lastActiveDate || null,
      }));

      return res.json({
        success: true,
        title: "Inactive Students",
        data,
      });
    }


    // =====================================================
    // TOTAL QUESTIONS
    // =====================================================

    if (type === "totalQuestions") {
      const quizzes = await Quiz.find({})
        .sort({ createdAt: -1 })
        .lean();

      const data = quizzes.map((quiz) => ({
        _id: quiz._id,

        technology:
          quiz.technology || "N/A",

        level:
          quiz.level || "N/A",

        questionCount:
          Array.isArray(quiz.questions)
            ? quiz.questions.length
            : 0,

        createdAt:
          quiz.createdAt || null,
      }));

      return res.json({
        success: true,
        title: "Quiz Question Details",
        data,
      });
    }


    // =====================================================
    // SUBMITTED QUIZZES
    // =====================================================

    if (type === "submittedQuizzes") {
      const results = await Result.aggregate([
        {
          $match: {
            $or: [
              {
                status: "submitted",
              },
              {
                status: {
                  $exists: false,
                },
              },
            ],
          },
        },

        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "clerkID",
            as: "student",
          },
        },

        {
          $unwind: {
            path: "$student",
            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $sort: {
            createdAt: -1,
          },
        },
      ]);

      const data = results.map((result) => ({
        _id: result._id,

        fullName:
          result.student?.fullName ||
          "Unknown Student",

        email:
          result.student?.email ||
          "N/A",

        technology:
          result.technology ||
          "N/A",

        level:
          result.level ||
          "N/A",

        correct:
          result.correct ?? 0,

        wrong:
          result.wrong ?? 0,

        totalQuestions:
          result.totalQuestions ?? 0,

        timeTaken:
          result.timeTaken ?? 0,

        createdAt:
          result.createdAt || null,

        status: "submitted",
      }));

      return res.json({
        success: true,
        title: "Submitted Quizzes",
        data,
      });
    }


    // =====================================================
    // PENDING QUIZZES
    // =====================================================

    if (type === "pendingQuizzes") {
      const results = await Result.aggregate([
        {
          $match: {
            status: "pending",
          },
        },

        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "clerkID",
            as: "student",
          },
        },

        {
          $unwind: {
            path: "$student",
            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $sort: {
            createdAt: -1,
          },
        },
      ]);

      const data = results.map((result) => ({
        _id: result._id,

        fullName:
          result.student?.fullName ||
          "Unknown Student",

        email:
          result.student?.email ||
          "N/A",

        technology:
          result.technology ||
          "N/A",

        level:
          result.level ||
          "N/A",

        totalQuestions:
          result.totalQuestions ?? 0,

        createdAt:
          result.createdAt || null,

        status: "pending",
      }));

      return res.json({
        success: true,
        title: "Pending Quizzes",
        data,
      });
    }


    // =====================================================
    // INVALID TYPE
    // =====================================================

    return res.status(400).json({
      success: false,
      message: "Invalid details type",
    });

  } catch (err) {
    console.error(
      "Dashboard details error:",
      err
    );

    return res.status(500).json({
      success: false,
      message:
        err.message ||
        "Failed to load dashboard details",
    });
  }
};


// ========================================
// UPDATE USER ACTIVITY
// ========================================

export const updateActivity = async (req, res) => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    await User.findOneAndUpdate(
      { clerkID: userId },
      {
        isLoggedIn: true,
        lastActiveDate: new Date(),
      }
    );

    return res.json({
      success: true,
      message: "Activity updated",
    });

  } catch (err) {
    console.error(
      "Activity update error:",
      err
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update activity",
    });
  }
};


// ========================================
// REGISTER STUDENT
// ========================================

export const registerStudent = async (req, res) => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const {
      fullName,
      email,
      mobileNumber,
    } = req.body;

    if (
      !fullName ||
      !email ||
      !mobileNumber
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Full Name, Email, and Mobile Number are required",
      });
    }

    if (
      mobileNumber.replace(/\D/g, "").length < 10
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter a valid 10-digit mobile number",
      });
    }

    const result =
      await User.findOneAndUpdate(
        { clerkID: userId },
        {
          clerkID: userId,
          fullName,
          email,
          mobileNumber,
          role: "student",
          eligibilityStatus: "pending",
        },
        {
          upsert: true,
          new: true,
          runValidators: true,
        }
      );

    return res.json({
      success: true,
      message:
        "Registration completed successfully",
      result,
    });

  } catch (err) {
    console.error(
      "Registration error:",
      err
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to complete registration",
    });
  }
};


// ========================================
// CLERK WEBHOOK
// ========================================

export const clerkWebhook = async (req, res) => {
  try {
    const event = req.body;

    if (event.type === "user.created") {
      const {
        id,
        email_addresses,
        first_name,
        last_name,
      } = event.data;

      const primaryEmail =
        email_addresses &&
        email_addresses.length > 0
          ? email_addresses[0].email_address
          : "";

      await User.findOneAndUpdate(
        { clerkID: id },
        {
          clerkID: id,
          email: primaryEmail,
          fullName:
            `${first_name || ""} ${
              last_name || ""
            }`.trim(),

          role: "student",

          isLoggedIn: false,

          lastActiveDate: new Date(),

          eligibilityStatus: "pending",
        },
        {
          upsert: true,
          new: true,
        }
      );

      console.log(
        `[Webhook] User created: ${primaryEmail}`
      );
    }

    return res.status(200).json({
      success: true,
      message: "Webhook processed",
    });

  } catch (err) {
    console.error(
      "Webhook Error:",
      err
    );

    return res.status(500).json({
      success: false,
      message: "Webhook failed",
    });
  }
};