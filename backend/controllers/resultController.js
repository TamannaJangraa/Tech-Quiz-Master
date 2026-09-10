import Result from "../model/Result.js";
import { getAuth } from "@clerk/express";

// ========================================
// CREATE / SUBMIT RESULT
// ========================================

export const createMyResult = async (req, res) => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const result = await Result.create({
      ...req.body,
      userId,
      status: "submitted",
    });

    res.status(201).json({
      success: true,
      result,
    });

  } catch (err) {
    console.log("CREATE RESULT ERROR:", err);

    res.status(500).json({
      success: false,
      message: "Failed to save result",
    });
  }
};


// ========================================
// GET MY RESULTS
// ========================================

export const getMyResults = async (req, res) => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const results = await Result.find({
      userId,
    }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      results,
    });

  } catch (err) {
    console.log("GET RESULTS ERROR:", err);

    res.status(500).json({
      success: false,
      message: "Failed to load results",
    });
  }
};


// ========================================
// GET LEADERBOARD
// ========================================

export const getLeaderboard = async (req, res) => {
  try {
    const results = await Result.aggregate([

      // Calculate percentage
      {
        $addFields: {
          percentage: {
            $cond: [
              { $gt: ["$totalQuestions", 0] },
              {
                $multiply: [
                  {
                    $divide: [
                      "$correct",
                      "$totalQuestions",
                    ],
                  },
                  100,
                ],
              },
              0,
            ],
          },
        },
      },

      // Highest score first
      {
        $sort: {
          percentage: -1,
          correct: -1,
          createdAt: 1,
        },
      },

      // Keep best result for each user + quiz
      {
        $group: {
          _id: {
            userId: "$userId",
            technology: "$technology",
            level: "$level",
          },

          userId: {
            $first: "$userId",
          },

          playerName: {
            $first: "$playerName",
          },

          technology: {
            $first: "$technology",
          },

          level: {
            $first: "$level",
          },

          correct: {
            $first: "$correct",
          },

          wrong: {
            $first: "$wrong",
          },

          totalQuestions: {
            $first: "$totalQuestions",
          },

          percentage: {
            $first: "$percentage",
          },

          createdAt: {
            $first: "$createdAt",
          },
        },
      },

      // Get user details
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "clerkID",
          as: "user",
        },
      },

      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true,
        },
      },

      // Get actual user name
      {
        $addFields: {
          userName: {
            $ifNull: [
              "$user.fullName",
              {
                $ifNull: [
                  "$playerName",
                  "Unknown Player",
                ],
              },
            ],
          },
        },
      },

      // Final sorting
      {
        $sort: {
          technology: 1,
          level: 1,
          percentage: -1,
          correct: -1,
          createdAt: 1,
        },
      },

      // Return required fields
      {
        $project: {
          _id: 0,
          userId: 1,
          userName: 1,
          playerName: 1,
          technology: 1,
          level: 1,
          correct: 1,
          wrong: 1,
          totalQuestions: 1,
          percentage: 1,
          createdAt: 1,
        },
      },
    ]);

    res.json({
      success: true,
      results,
    });

  } catch (err) {
    console.error("LEADERBOARD ERROR:", err);

    res.status(500).json({
      success: false,
      message: "Failed to load leaderboard",
    });
  }
};