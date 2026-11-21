

const studyForm = document.getElementById("studyForm");
const schedule = document.getElementById("schedule");
const progressBar = document.getElementById("progress");
const progressText = document.getElementById("progressText");
const questionsBox = document.getElementById("questionsBox");



studyForm.addEventListener("submit", function (e) {

    e.preventDefault();

    const subject = document.getElementById("subject").value.trim();
    const examDate = document.getElementById("examDate").value;
    const hours = Number(document.getElementById("hours").value);
    const level = document.getElementById("level").value;
    const topicsInput = document.getElementById("topics").value;

    
    if (!subject || !examDate || hours < 1) {
        alert("Please enter valid details!");
        return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const exam = new Date(examDate + "T00:00:00");

    if (exam <= today) {
        alert("Please select a future exam date!");
        return;
    }

   
    const daysLeft = Math.ceil(
        (exam - today) / (1000 * 60 * 60 * 24)
    );

    let topics = topicsInput
        .split(",")
        .map(topic => topic.trim())
        .filter(topic => topic.length > 0);

    if (topics.length === 0) {
        topics = [
            "Basic Concepts",
            "Important Topics",
            "Problem Solving",
            "Revision",
            "Practice Questions"
        ];
    }

   
    let html = "";

    html += `<h3>${subject} Study Plan</h3>`;
    html += `<p>Days remaining: ${daysLeft}</p>`;
    html += `<p>Daily study hours: ${hours}</p>`;
    html += `<p>Preparation level: ${level}</p>`;
    html += "<hr>";

    for (let i = 0; i < daysLeft; i++) {

        const topic = topics[i % topics.length];

        const date = new Date(today);
        date.setDate(today.getDate() + i);

        const formattedDate = date.toLocaleDateString();

        html += `
            <div class="study-task">

                <h4>Day ${i + 1} - ${formattedDate}</h4>

                <p><strong>Topic:</strong> ${topic}</p>

                <p><strong>Study Time:</strong> ${hours} hours</p>

                <p>Concept Learning + Practice + Revision</p>

                <label>
                    <input type="checkbox" class="task-check">
                    Mark as Completed
                </label>

            </div>
        `;
    }

    schedule.innerHTML = html;

    updateProgress();

    generateQuestions(subject, topics);

    
    document.getElementById("youtubeLink").href =
        "https://www.youtube.com/results?search_query=" +
        encodeURIComponent(subject + " lectures");

    document.getElementById("pyqLink").href =
        "https://www.google.com/search?q=" +
        encodeURIComponent(subject + " previous year question papers");

});



function updateProgress() {

    const checkboxes = document.querySelectorAll(".task-check");

    const total = checkboxes.length;

    const completed = document.querySelectorAll(
        ".task-check:checked"
    ).length;

    const percentage = total === 0
        ? 0
        : Math.round((completed / total) * 100);

    progressBar.style.width = percentage + "%";

    progressText.textContent = percentage + "% Completed";
}



schedule.addEventListener("change", function (e) {

    if (e.target.classList.contains("task-check")) {
        updateProgress();
    }

});




function generateQuestions(subject, topics) {

    let html = `<h3>Important Questions: ${subject}</h3>`;

    html += "<ol>";

    topics.forEach(topic => {

        html += `
            <li>
                Explain the basic concepts of ${topic}.
            </li>

            <li>
                Discuss the important applications of ${topic}.
            </li>

            <li>
                Explain different types of ${topic} with examples.
            </li>

            <li>
                Solve a practical problem related to ${topic}.
            </li>
        `;

    });

    html += "</ol>";

    questionsBox.innerHTML = html;

}





const API_URL = "https://study-planner-backend-4ezh.onrender.com/api/questions";


let seenQuestionIds = JSON.parse(
    localStorage.getItem("attemptedGateQuestions") || "[]"
);

let availableQuestions = [];
let currentQuestion = null;

let selectedAnswer = null;
let correctAnswers = 0;
let wrongAnswers = 0;
let totalQuestions = 0;
let currentQuestionNumber = 0;
let activeLevel = "";





async function startGateQuiz(level) {

    activeLevel = level;

    correctAnswers = 0;
    wrongAnswers = 0;
    currentQuestionNumber = 0;

    const questionArea = document.getElementById("questionArea");
    const quizResult = document.getElementById("gateQuizResult");

    questionArea.style.display = "block";
    questionArea.innerHTML = "Loading GATE Questions...";

    quizResult.style.display = "none";

    document.getElementById("gateQuizPanel").style.display = "block";

    document.getElementById("quizLevelTitle").textContent =
        level.toUpperCase() + " GATE QUIZ";

    document.getElementById("answerFeedback").textContent = "";

    document.getElementById("submitAnswer").style.display = "inline-block";
    document.getElementById("nextGateQuestion").style.display = "none";

    try {

     
        const subject = document.getElementById("subject").value.trim();

       
        const response = await fetch(
            `${API_URL}?subject=${encodeURIComponent(subject)}&level=${encodeURIComponent(level)}`
        );

        if (!response.ok) {
            throw new Error("Unable to fetch questions");
        }

        const questions = await response.json();

       
        availableQuestions = questions.filter(
            question => !seenQuestionIds.includes(question.id)
        );

       
        if (availableQuestions.length === 0) {

            questionArea.innerHTML = `
                <h3>No New Questions Available!</h3>
                <p>You have already attempted all questions at this level.</p>
            `;

            document.getElementById("questionCounter").textContent =
                "Completed";

            totalQuestions = 0;
            return;
        }

       
        availableQuestions.sort(() => Math.random() - 0.5);

        
        availableQuestions = availableQuestions.slice(0, 15);

        totalQuestions = availableQuestions.length;

        loadRandomQuestion();

    } catch (error) {

        questionArea.innerHTML = `
            <h3>Unable to load questions!</h3>
            <p>Please check your backend server and try again.</p>
        `;

        console.error(error);
    }
}




function loadRandomQuestion() {

    if (availableQuestions.length === 0) {
        finishGateQuiz();
        return;
    }

    const randomIndex = Math.floor(
        Math.random() * availableQuestions.length
    );

    currentQuestion = availableQuestions.splice(randomIndex, 1)[0];

    currentQuestionNumber++;

    if (!seenQuestionIds.includes(currentQuestion.id)) {

        seenQuestionIds.push(currentQuestion.id);

        localStorage.setItem(
            "attemptedGateQuestions",
            JSON.stringify(seenQuestionIds)
        );

    }

    selectedAnswer = null;

    displayQuestion(currentQuestion);

}


function displayQuestion(question) {

    const questionArea = document.getElementById("questionArea");

    document.getElementById("quizSubject").textContent =
        question.subject;

    document.getElementById("questionCounter").textContent =
        `Question ${currentQuestionNumber}`;

    document.getElementById("quizProgressBar").style.width =
        (currentQuestionNumber / totalQuestions * 100) + "%";

    let html = `<h3>${question.question}</h3>`;

    if (question.type === "nat") {

        html += `
            <input
                type="number"
                id="natAnswer"
                placeholder="Enter your answer"
            >
        `;

    } else {

        question.options.forEach((option, index) => {

            html += `
                <button
                    class="gate-option"
                    data-index="${index}"
                    onclick="selectOption(${index})"
                >
                    ${option}
                </button>
            `;

        });

    }

    questionArea.innerHTML = html;

    document.getElementById("answerFeedback").textContent = "";

    document.getElementById("submitAnswer").style.display = "inline-block";
    document.getElementById("nextGateQuestion").style.display = "none";

}




function selectOption(index) {

    selectedAnswer = index;

    document.querySelectorAll(".gate-option").forEach(button => {

        button.classList.remove("selected");

    });

    document.querySelector(
        `.gate-option[data-index="${index}"]`
    ).classList.add("selected");

}



document.getElementById("submitAnswer").addEventListener("click", function () {

    if (!currentQuestion) return;

    let userAnswer;

    if (currentQuestion.type === "nat") {

        const input = document.getElementById("natAnswer");

        if (!input || input.value.trim() === "") {
            alert("Please enter your answer!");
            return;
        }

        userAnswer = Number(input.value);

    } else {

        if (selectedAnswer === null) {
            alert("Please select an answer!");
            return;
        }

        userAnswer = selectedAnswer;

    }

    let isCorrect = false;

    const correctAnswer = currentQuestion.answer;

    if (currentQuestion.type === "nat") {

        const tolerance = currentQuestion.tolerance || 0;

        isCorrect =
            Math.abs(userAnswer - correctAnswer) <= tolerance;

    } else if (currentQuestion.type === "msq") {

        isCorrect =
            JSON.stringify([...userAnswer].sort()) ===
            JSON.stringify([...correctAnswer].sort());

    } else {

        isCorrect = userAnswer === correctAnswer;

    }

    if (isCorrect) {

        correctAnswers++;

        document.getElementById("answerFeedback").textContent =
            "Correct Answer!";

        document.getElementById("answerFeedback").style.color = "green";

    } else {

        wrongAnswers++;

        document.getElementById("answerFeedback").textContent =
            "Incorrect Answer!";

        document.getElementById("answerFeedback").style.color = "red";

    }

    document.querySelectorAll(".gate-option").forEach(button => {

        button.disabled = true;

    });

    document.getElementById("submitAnswer").style.display = "none";

    document.getElementById("nextGateQuestion").style.display = "inline-block";

});




document.getElementById("nextGateQuestion").addEventListener("click", function () {

    loadRandomQuestion();

});


function finishGateQuiz() {

    const score = totalQuestions === 0
        ? 0
        : Math.round((correctAnswers / totalQuestions) * 100);

    document.getElementById("questionArea").style.display = "none";

    document.getElementById("gateQuizResult").style.display = "block";

    document.getElementById("gateFinalScore").textContent =
        score + "%";

    document.getElementById("correctCount").textContent =
        correctAnswers;

    document.getElementById("wrongCount").textContent =
        wrongAnswers;

    let status = "";
    let message = "";

    if (score < 60) {

        status = "Weak Topic";
        message = "You need more practice. Revise your concepts.";

    } else if (score < 80) {

        status = "Good Score";
        message = "Good work! Keep practising.";

    } else {

        status = "Exceptional";
        message = "Excellent performance! Keep it up.";

    }

    document.getElementById("performanceStatus").textContent = status;

    document.getElementById("performanceMessage").textContent = message;

    document.getElementById("questionCounter").textContent =
        "Quiz Completed";

    document.getElementById("quizProgressBar").style.width = "100%";

}



document.getElementById("retryGateQuiz").addEventListener("click", function () {

    document.getElementById("questionArea").style.display = "block";

    startGateQuiz(activeLevel);

});
