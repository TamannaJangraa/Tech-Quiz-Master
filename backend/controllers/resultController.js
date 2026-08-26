import Result from "../model/Result.js";
import { getAuth } from "@clerk/express";

export const createMyResult = async (req, res) => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const result = await Result.create({
      ...req.body,
      userId,
    });

    res.json({ success: true, result });
  } catch (err) {
    console.log("CREATE RESULT ERROR:", err);

    res.status(500).json({
      success: false,
      message: "Failed to create result",
    });
  }
};

export const getMyResults = async (req, res) => {
  try {
    const { userId } = getAuth(req);

    const results = await Result.find({
      userId,
    }).sort({
      createdAt: -1,
    });

    res.json({ success: true, results });
  } catch (err) {
    console.log("GET RESULTS ERROR:", err);

    res.status(500).json({
      success: false,
      message: "Failed to load results",
    });
  }
};

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

    res.json({ success: true, results });
  } catch (err) {
    console.log("LEADERBOARD ERROR:", err);

    res.status(500).json({
      success: false,
      message: "Failed to load leaderboard",
    });
  }
};