import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
dotenv.config();

const app = express();
const port = process.env.port || 3000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log("MongoDB Connected Successfully!");
})
.catch(err => {
    console.log("Database connection error:",err);
});

const studentSchema = new mongoose.Schema({
    rollNo: String,
    name: String
});

const Student = mongoose.model("Student",studentSchema);

const attendanceSchema = new mongoose.Schema({

    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student"
    },
    date: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["P", "A"],
        required: true
    }
});

const Attendance = mongoose.model(
    "Attendance",
    attendanceSchema
);

const PORT = 3000;

app.get("/",(req,res) => {
})

app.get("/students",async (req,res)=>{
    try{
        const students = await Student.find();
        res. status(200).json(students);
    } catch (err){
        res.status(500).json({ error: err.message});
    }
});


app.post("/students",async (req,res) => {
    try {
        const newStudent = await Student.create({
            rollNo: req.body.rollNo,
            name: req.body.name
        });
        res.json(newStudent);
    } catch (err){
        res.status(500).json({ error: err.message });
    }

});

//this function puts attendance and updates attendance
app.post("/attendance", async(req,res) =>{
    try{
        const{studentId, date, status} = req.body;

        const attendance = await Attendance.findOneAndUpdate(
        {studentId: studentId, date: date},
        {status: status},
        {new: true, upsert: true}
        );
        res.status(200).json(attendance);
    } catch (err) {
        res.status(500).json({ error: err.message});
    }
});

//get all attendance
app.get("/attendance", async (req,res) =>{
    try{
        const attendance = await Attendance.find().populate("studentId");
        res.status(200).json(attendance);
    }
    catch(err){
        res.status(500).json({ error: err.message});
    }
});

app.get("/attendance/today",async(req,res)=>{
    try{
        const today = new Date().toISOString().split("T")[0];

        const attendance =await Attendance.find({
            date: today
        })
        .populate("studentId");

        res.status(200).json(attendance);
    }
    catch (err){

        res.status(500)
        .json({
            error: err.message
        });
    }
});

app.delete("/attendance/today", async(req,res)=>{
    try{
        const today=new Date().toISOString().split("T")[0];
        const result= await Attendance.deleteMany({ date : today});

        res.status(200).json({
            message: "Today's attendance has been completely reset.",
            deletedCount: result.deletedCount
        });
    }catch (err){
        res.status(500).json({ error : err.message});
    }
});


app.get("/sanmathi",(req,res) => {
    res.send("Server says Hi to sanmathi");
})



app.listen(PORT,() =>{
    console.log(`Server is running on port ${PORT}`); 
})