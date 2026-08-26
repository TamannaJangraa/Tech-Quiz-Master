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

      // Har user ka best attempt rakhenge
      {
        $sort: {
          percentage: -1,
          correct: -1,
          createdAt: 1,
        },
      },

      {
        $group: {
          _id: "$userId",
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

      // Final ranking
      {
        $sort: {
          percentage: -1,
          correct: -1,
          createdAt: 1,
        },
      },

      {
        $limit: 50,
      },
    ]);

    res.json(results);
  } catch (err) {
    console.log("LEADERBOARD ERROR:", err);

    res.status(500).json({
      message: "Failed to load leaderboard",
    });
  }
};