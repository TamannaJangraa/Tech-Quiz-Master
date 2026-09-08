import Result from "../model/Result.js";
import { getAuth } from "@clerk/express";

// Create a result
export const createMyResult = async (req, res) => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(400).json({
        message: "User ID is required",
      });
    }

    const result = await Result.create({
      ...req.body,
      userId,
    });

    res.json(result);
  } catch (err) {
    console.log("CREATE RESULT ERROR:", err);

    res.status(500).json({
      error: "FAILED",
    });
  }
};

// Get results for the logged-in user
export const getMyResults = async (req, res) => {
  try {
    const { userId } = getAuth(req);

    const results = await Result.find({
      userId,
    }).sort({
      createdAt: -1,
    });

    res.json(results);
  } catch (err) {
    console.log("GET RESULTS ERROR:", err);

    res.status(500).json({
      error: "FAILED",
    });
  }
};

// Get leaderboard
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

      // Best result of each user for EACH quiz
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

      // Join with users collection
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "clerkID",
          as: "user",
        },
      },

      // Get only one user document
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true,
        },
      },

      // Send user's actual name
      {
        $addFields: {
          userName: {
            $ifNull: [
              "$user.fullName",
              "Unknown Player",
            ],
          },
        },
      },

      // Sort again after grouping
      {
        $sort: {
          technology: 1,
          level: 1,
          percentage: -1,
          correct: -1,
          createdAt: 1,
        },
      },

      // Don't limit the leaderboard
      {
        $project: {
          _id: 0,
          userId: 1,
          userName: 1,
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