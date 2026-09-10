import Result from "../model/Result.js";
import { getAuth } from "@clerk/express";

// ========================================
// START QUIZ ATTEMPT
// ========================================

export const startQuizAttempt = async (req, res) => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const {
      playerName,
      technology,
      level,
      totalQuestions,
    } = req.body;

    const result = await Result.create({
      userId,
      playerName,
      technology,
      level,
      totalQuestions,
      correct: 0,
      wrong: 0,
      timeTaken: 0,
      startDate: new Date(),
      answerReview: [],
      status: "pending",
    });

    res.status(201).json({
      success: true,
      result,
    });
  } catch (err) {
    console.error("START ATTEMPT ERROR:", err);

    res.status(500).json({
      success: false,
      message: "Failed to start quiz attempt",
    });
  }
};

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

    const {
      attemptId,
      playerName,
      technology,
      level,
      totalQuestions,
      correct,
      wrong,
      timeTaken,
      startDate,
      answerReview,
    } = req.body;

    // ========================================
    // UPDATE EXISTING PENDING ATTEMPT
    // ========================================

    if (attemptId) {
      const pendingResult = await Result.findOne({
        _id: attemptId,
        userId,
        status: "pending",
      });

      if (!pendingResult) {
        return res.status(404).json({
          success: false,
          message: "Pending quiz attempt not found",
        });
      }

      pendingResult.playerName = playerName;
      pendingResult.technology = technology;
      pendingResult.level = level;
      pendingResult.totalQuestions = totalQuestions;
      pendingResult.correct = correct;
      pendingResult.wrong = wrong;
      pendingResult.timeTaken = timeTaken || 0;
      pendingResult.startDate =
        startDate || pendingResult.startDate;
      pendingResult.answerReview =
        answerReview || [];
      pendingResult.status = "submitted";

      await pendingResult.save();

      return res.status(200).json({
        success: true,
        result: pendingResult,
      });
    }

    // ========================================
    // FALLBACK: CREATE NEW SUBMITTED RESULT
    // ========================================

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
    console.error("CREATE RESULT ERROR:", err);

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
    console.error("GET RESULTS ERROR:", err);

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
      // ========================================
      // ONLY SUBMITTED RESULTS
      // OLD RESULTS WITHOUT STATUS ALSO ALLOWED
      // ========================================

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

      // ========================================
      // CALCULATE PERCENTAGE
      // ========================================

      {
        $addFields: {
          percentage: {
            $cond: [
              {
                $gt: ["$totalQuestions", 0],
              },
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

      // ========================================
      // HIGHEST SCORE FIRST
      // ========================================

      {
        $sort: {
          percentage: -1,
          correct: -1,
          createdAt: 1,
        },
      },

      // ========================================
      // BEST RESULT PER USER + QUIZ
      // ========================================

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

      // ========================================
      // GET USER DETAILS
      // ========================================

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

      // ========================================
      // USER NAME
      // ========================================

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

      // ========================================
      // FINAL SORT
      // ========================================

      {
        $sort: {
          technology: 1,
          level: 1,
          percentage: -1,
          correct: -1,
          createdAt: 1,
        },
      },

      // ========================================
      // FINAL FIELDS
      // ========================================

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