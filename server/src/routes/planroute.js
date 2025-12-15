const express = require("express");
const router = express.Router();
const Plan = require("../models/planSchema");
const User = require("../models/userSchema");
const auth = require("../middleware/auth"); // Middleware to verify Token

// ---------------------------------------------------------
// 1. VIEW ALL PLANS (Landing Page / Dashboard)
// ---------------------------------------------------------
router.get("/all", async (req, res) => {
  try {
    // Return all plans, but only select preview fields to keep payload light
    // Populating trainer name so users know who created it
    const plans = await Plan.find()
      .select("title price duration trainer")
      .populate("trainer", "name");

    res.status(200).json(plans);
  } catch (error) {
    res.status(500).json({ message: "Error fetching plans", error });
  }
});
router.get("/feed", auth, async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Get the current user's data
    // We need their 'following' list and 'purchasedPlans' list
    const user = await User.findById(userId);

    if (!user) return res.status(404).send("User not found");

    // 2. Find Plans created by trainers in the 'following' list
    // The $in operator checks if the plan's trainer ID is IN the user's following array
    const plans = await Plan.find({
      trainer: { $in: user.following },
    })
      .populate("trainer", "name email") // Include basic trainer info
      .sort({ createdAt: -1 }); // Show newest plans first

    // 3. Add 'isPurchased' flag to each plan
    // We map over the plans to check if the user owns them
    const feedData = plans.map((plan) => {
      // Convert mongoose document to a plain JS object to modify it
      const planObj = plan.toObject();

      // Check if this plan ID exists in the user's purchasedPlans array
      // We use .some() or .includes() depending on if purchasedPlans are ObjectIds or Strings
      const isPurchased = user.purchasedPlans.some(
        (purchasedId) => purchasedId.toString() === plan._id.toString()
      );

      return {
        ...planObj,
        isPurchased: isPurchased, // Boolean flag for the frontend
      };
    });

    res.json(feedData);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching feed");
  }
});
// ---------------------------------------------------------
// 2. PURCHASE / SUBSCRIBE (Simulate Payment)
// ---------------------------------------------------------
router.post("/subscribe/:id", auth, async (req, res) => {
  try {
    const planId = req.params.id;
    const userId = req.user._id; // Extracted from the JWT token by auth middleware

    // Check if the plan actually exists
    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    // SIMULATE PAYMENT LOGIC:
    // In a real app, you would verify Stripe/PayPal payment here.
    // For this task, we simply add the plan ID to the user's purchased list immediately.

    // Use $addToSet to prevent duplicate subscriptions to the same plan
    await User.findByIdAndUpdate(userId, {
      $addToSet: { purchasedPlans: planId },
    });

    res.status(200).json({
      success: true,
      message: `Successfully subscribed to ${plan.title}!`,
    });
  } catch (error) {
    res.status(500).json({ message: "Subscription failed", error });
  }
});

// ---------------------------------------------------------
// 3. VIEW SINGLE PLAN (Access Control Logic)
// ---------------------------------------------------------
router.get("/:id", auth, async (req, res) => {
  try {
    const planId = req.params.id;
    const userId = req.user._id;

    // Fetch the plan
    const plan = await Plan.findById(planId).populate("trainer", "name");
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    // Fetch the user to check their subscriptions
    const user = await User.findById(userId);

    // LOGIC: Access granted if User bought it OR User is the Trainer who made it
    const hasPurchased = user.purchasedPlans.includes(planId);
    const isOwner = plan.trainer._id.toString() === userId.toString();

    if (hasPurchased || isOwner) {
      // ACCESS GRANTED: Send full details (including description/videos etc.)
      return res.status(200).json({
        access: true,
        plan: plan,
      });
    } else {
      // ACCESS DENIED: Send only preview details
      return res.status(200).json({
        access: false,
        plan: {
          _id: plan._id,
          title: plan.title,
          price: plan.price,
          duration: plan.duration,
          trainer: plan.trainer,
          description: "LOCKED: Please subscribe to view the full plan.", // Masked content
        },
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching plan details", error });
  }
});

router.get("/feed", auth, async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Get the current user's data
    // We need their 'following' list and 'purchasedPlans' list
    const user = await User.findById(userId);

    if (!user) return res.status(404).send("User not found");

    // 2. Find Plans created by trainers in the 'following' list
    // The $in operator checks if the plan's trainer ID is IN the user's following array
    const plans = await Plan.find({
      trainer: { $in: user.following },
    })
      .populate("trainer", "name email") // Include basic trainer info
      .sort({ createdAt: -1 }); // Show newest plans first

    // 3. Add 'isPurchased' flag to each plan
    // We map over the plans to check if the user owns them
    const feedData = plans.map((plan) => {
      // Convert mongoose document to a plain JS object to modify it
      const planObj = plan.toObject();

      // Check if this plan ID exists in the user's purchasedPlans array
      // We use .some() or .includes() depending on if purchasedPlans are ObjectIds or Strings
      const isPurchased = user.purchasedPlans.some(
        (purchasedId) => purchasedId.toString() === plan._id.toString()
      );

      return {
        ...planObj,
        isPurchased: isPurchased, // Boolean flag for the frontend
      };
    });

    res.json(feedData);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching feed");
  }
});

// ---------------------------------------------------------
// 0. CREATE A NEW PLAN (Trainer Only)
// ---------------------------------------------------------
router.post("/createplan", auth, async (req, res) => {
  try {
    // 1. Role Check: Only 'trainer' can create plans
    if (req.user.role !== "trainer") {
      return res.status(403).json({ message: "Access denied. Trainers only." });
    }

    // 2. Create the Plan Object
    const newPlan = new Plan({
      title: req.body.title,
      description: req.body.description,
      price: req.body.price,
      duration: req.body.duration,
      trainer: req.user._id, // Link the plan to the currently logged-in trainer
    });

    // 3. Save to Database
    const savedPlan = await newPlan.save();

    res.status(201).json({
      message: "Plan created successfully!",
      plan: savedPlan,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating plan", error: error.message });
  }
});

// ---------------------------------------------------------
// EDIT PLAN (Trainer Only & Must be Owner)
// ---------------------------------------------------------
router.put("/editpan/:id", auth, async (req, res) => {
  try {
    const planId = req.params.id;
    const userId = req.user._id;

    // 1. Find the plan
    const plan = await Plan.findById(planId);
    if (!plan) return res.status(404).send("Plan not found");

    // 2. Check Ownership: Is the logged-in user the creator?
    if (plan.trainer.toString() !== userId.toString()) {
      return res.status(403).send("You can only edit your own plans");
    }

    // 3. Update fields (Title, Description, Price, Duration)
    // We use { new: true } to return the updated document
    const updatedPlan = await Plan.findByIdAndUpdate(
      planId,
      {
        title: req.body.title,
        description: req.body.description,
        price: req.body.price,
        duration: req.body.duration,
      },
      { new: true }
    );

    res.json(updatedPlan);
  } catch (error) {
    res.status(500).send("Error updating plan: " + error.message);
  }
});

// ---------------------------------------------------------
// DELETE PLAN (Trainer Only & Must be Owner)
// ---------------------------------------------------------
router.delete("/deleteplan/:id", auth, async (req, res) => {
  try {
    const planId = req.params.id;
    const userId = req.user._id;

    // 1. Find the plan
    const plan = await Plan.findById(planId);
    if (!plan) return res.status(404).send("Plan not found");

    // 2. Check Ownership
    if (plan.trainer.toString() !== userId.toString()) {
      return res.status(403).send("You can only delete your own plans");
    }

    // 3. Delete the plan
    await Plan.findByIdAndDelete(planId);

    res.json({ message: "Plan deleted successfully" });
  } catch (error) {
    res.status(500).send("Error deleting plan: " + error.message);
  }
});

module.exports = router;
