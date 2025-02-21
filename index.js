// backend/server.js
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoute');
const workoutRoutes = require('./routes/workoutRoute');
const airoute = require('./routes/airoute');
const cors = require('cors');
const bodyParser = require("body-parser")

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(bodyParser.json())
app.use(cors());


app.use('/api/users', userRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/chat', airoute);

app.get("/",(req,res)=>{
    return res.send("hello")
})

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
