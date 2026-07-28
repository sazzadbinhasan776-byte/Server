const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Load student list
const students = require("./students.json");

const VOTES_FILE = "./votes.json";
const VOTED_FILE = "./voted.json";


// ===============================
// Check Student API
// ===============================
app.post("/check-student", (req, res) => {

    const { reg } = req.body;

    const student = students.find(
        s => String(s.regNo).trim() === String(reg).trim()
    );

    if (!student) {
        return res.json({
            success: false,
            message: "Registration Number not found."
        });
    }


    let voted = [];

    if (fs.existsSync(VOTED_FILE)) {

        const data = fs.readFileSync(VOTED_FILE, "utf8");

        if (data.trim() !== "") {
            voted = JSON.parse(data);
        }
    }


    const alreadyVoted = voted.find(
        v => String(v.regNo) === String(reg)
    );


    if (alreadyVoted) {
        return res.json({
            success: false,
            message: "You have already voted."
        });
    }


    res.json({
        success: true,
        student
    });

});



// ===============================
// Vote API
// ===============================
app.post("/vote", (req, res) => {

    const { regNo, candidate } = req.body;


    const student = students.find(
        s => String(s.regNo) === String(regNo)
    );


    if (!student) {
        return res.json({
            success: false,
            message: "Student not found."
        });
    }



    let voted = [];

    if (fs.existsSync(VOTED_FILE)) {

        const data = fs.readFileSync(VOTED_FILE, "utf8");

        if (data.trim() !== "") {
            voted = JSON.parse(data);
        }
    }



    const alreadyVoted = voted.find(
        v => String(v.regNo) === String(regNo)
    );


    if (alreadyVoted) {
        return res.json({
            success: false,
            message: "You have already voted."
        });
    }



    let votes = [];

    if (fs.existsSync(VOTES_FILE)) {

        const data = fs.readFileSync(VOTES_FILE, "utf8");

        if (data.trim() !== "") {
            votes = JSON.parse(data);
        }
    }



    // Anonymous vote storage
    votes.push({
        candidate: candidate,
        votedAt: new Date().toISOString()
    });



    fs.writeFileSync(
        VOTES_FILE,
        JSON.stringify(votes, null, 2)
    );



    // Store only voter identity
    voted.push({
        regNo: student.regNo,
        votedAt: new Date().toISOString()
    });



    fs.writeFileSync(
        VOTED_FILE,
        JSON.stringify(voted, null, 2)
    );



    res.json({
        success: true,
        message: "Vote submitted successfully."
    });


});



// ===============================
// Result API
// ===============================
app.get("/result", (req, res) => {

    let votes = [];


    if (fs.existsSync(VOTES_FILE)) {

        const data = fs.readFileSync(VOTES_FILE, "utf8");

        if (data.trim() !== "") {
            votes = JSON.parse(data);
        }

    }



    const result = {};


    votes.forEach((vote) => {

        if (result[vote.candidate]) {
            result[vote.candidate]++;
        }
        else {
            result[vote.candidate] = 1;
        }

    });



    res.json(result);

});



// ===============================
// Health Check API
// ===============================
app.get("/", (req, res) => {

    res.send("CR Election Server is running");

});



// ===============================
// Start Server
// ===============================
app.listen(PORT, "0.0.0.0", () => {

    console.log(`Server running on port ${PORT}`);

});