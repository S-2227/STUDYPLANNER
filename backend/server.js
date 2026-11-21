const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());


const questionsPath = path.join(__dirname, "questions.json");

function getQuestions() {
    return JSON.parse(
        fs.readFileSync(questionsPath, "utf8")
    );
}


function normalizeSubject(subject) {
    const value = subject.toLowerCase().trim();

    if (
        value === "data structure" ||
        value === "data structures" ||
        value === "dsa"
    ) {
        return "data structures";
    }

    if (
        value === "digital logic" ||
        value === "dld"
    ) {
        return "digital logic";
    }

    if (
        value === "computer organization" ||
        value === "coa" ||
        value === "computer organization and architecture"
    ) {
        return "computer organization";
    }

    return value;
}

// GATE PYQ API
app.get("/api/questions", (req, res) => {

    try {

        const level = req.query.level;
        const subject = req.query.subject;

        const questions = getQuestions();

        let filteredQuestions = questions;

        
        if (subject) {

            filteredQuestions = filteredQuestions.filter(
                question =>
                    normalizeSubject(question.subject) ===
                    normalizeSubject(subject)
            );

        }

      
        if (level) {

            filteredQuestions = filteredQuestions.filter(
                question => question.level === level
            );

        }

        res.json(filteredQuestions);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Unable to load questions"
        });

    }

});


app.get("/", (req, res) => {
    res.send("GATE PYQ Backend is running!");
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
});
