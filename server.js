const express = require("express");
const cors = require("cors");
const fs = require("fs");
const XLSX = require("xlsx");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 5000;


// Files
const students = require("./students.json");

const VOTES_FILE = "./votes.json";
const VOTED_FILE = "./voted.json";
const EXCEL_FILE = "./votes.xlsx";


// ===============================
// Helper Function: Read JSON
// ===============================

function readJSON(file) {

    if (!fs.existsSync(file)) {
        return [];
    }

    const data = fs.readFileSync(file, "utf8");

    if (data.trim() === "") {
        return [];
    }

    return JSON.parse(data);
}



// ===============================
// Helper Function: Save Excel
// ===============================

function saveExcel(votes) {

    const excelData = votes.map(v => ({
        Candidate: v.candidate,
        Time: v.votedAt
    }));


    const worksheet = XLSX.utils.json_to_sheet(excelData);

    const workbook = XLSX.utils.book_new();


    XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Votes"
    );


    XLSX.writeFile(
        workbook,
        EXCEL_FILE
    );

}



// ===============================
// Check Student API
// ===============================

app.post("/check-student", (req, res)=>{

    const { reg } = req.body;


    const student = students.find(
        s => String(s.regNo).trim() === String(reg).trim()
    );


    if(!student){

        return res.json({
            success:false,
            message:"Registration Number not found."
        });

    }



    const voted = readJSON(VOTED_FILE);



    const alreadyVoted = voted.find(
        v => String(v.regNo) === String(reg)
    );


    if(alreadyVoted){

        return res.json({
            success:false,
            message:"You have already voted."
        });

    }



    res.json({

        success:true,
        student

    });



});





// ===============================
// Vote API
// ===============================

app.post("/vote",(req,res)=>{


    const {regNo,candidate}=req.body;



    const student = students.find(
        s=>String(s.regNo)===String(regNo)
    );



    if(!student){

        return res.json({

            success:false,
            message:"Student not found."

        });

    }



    // Check duplicate vote

    let voted = readJSON(VOTED_FILE);



    const alreadyVoted = voted.find(
        v=>String(v.regNo)===String(regNo)
    );



    if(alreadyVoted){

        return res.json({

            success:false,
            message:"You have already voted."

        });

    }





    // ===============================
    // Save Anonymous Vote
    // ===============================


    let votes = readJSON(VOTES_FILE);


    const voteData = {

        candidate:candidate,

        votedAt:new Date().toISOString()

    };



    votes.push(voteData);



    fs.writeFileSync(

        VOTES_FILE,

        JSON.stringify(votes,null,2)

    );



    // Save Excel Backup

    saveExcel(votes);






    // ===============================
    // Save Voter List
    // ===============================


    voted.push({

        regNo:student.regNo,

        votedAt:new Date().toISOString()

    });



    fs.writeFileSync(

        VOTED_FILE,

        JSON.stringify(voted,null,2)

    );





    res.json({

        success:true,

        message:"Vote submitted successfully."

    });



});





// ===============================
// Start Server
// ===============================

app.listen(PORT,()=>{

    console.log(
        `Server running on http://localhost:${PORT}`
    );

});