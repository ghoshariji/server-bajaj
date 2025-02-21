const Schedule = require("../modals/scheduleMOdal");
const twilio = require("twilio");


const client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

exports.createSchedule = async (req, res) => {
  try {
    const { userId, time, repeatDaily } = req.body;
    const schedule = new Schedule({
      user: userId,
      time,
      repeat: repeatDaily ? "daily" : null,
    });

    await schedule.save();
    res.status(201).json({ message: "Schedule set successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};


const sendSMS = (userId, message) => {
  client.messages
    .create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: "+1234567890", 
    })
    .then((message) => console.log(`Message sent: ${message.sid}`))
    .catch((error) => console.error("Twilio error:", error));
};


const cron = require("node-cron");

cron.schedule("* * * * *", async () => {
  const now = new Date();
  const currentTime = now.toTimeString().split(" ")[0].slice(0, 5);

  const schedules = await Schedule.find({ repeat: "daily", time: currentTime });

  schedules.forEach((schedule) => {
    sendSMS(schedule.user, `Reminder: It's ${schedule.time}, your scheduled time!`);
  });
});
