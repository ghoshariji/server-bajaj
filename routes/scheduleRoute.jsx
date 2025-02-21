const express = require("express");
const { createSchedule } = require("../controller/scheduleContrller");

const router = express.Router();

router.post("/schedule", createSchedule);

module.exports = router;
