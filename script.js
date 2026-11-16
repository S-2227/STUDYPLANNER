// Get HTML elements
const studyForm = document.getElementById("studyForm");
const schedule = document.getElementById("schedule");
const progressBar = document.getElementById("progress");
const progressText = document.getElementById("progressText");
const questionsBox = document.getElementById("questionsBox");


// Generate Study Plan
studyForm.addEventListener("submit", function (e) {

    e.preventDefault();

    // Get user input
    const subject = document.getElementById("subject").value.trim();
    const examDate = document.getElementById("examDate").value;
    const hours = Number(document.getElementById("hours").value);
    const level = document.getElementById("level").value;

    const topicsInput = document.getElementById("topics").value;

    // Validate input
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

    // Calculate remaining days
    const daysLeft = Math.ceil(
        (exam - today) / (1000 * 60 * 60 * 24)
    );

    // Get topics
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

    // Generate Schedule
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

    // Update progress
    updateProgress();

    // Generate Important Questions
    generateQuestions(subject, topics);

    // Generate Resource Links
    document.getElementById("youtubeLink").href =
        "https://www.youtube.com/results?search_query=" +
        encodeURIComponent(subject + " lectures");

    document.getElementById("pyqLink").href =
        "https://www.google.com/search?q=" +
        encodeURIComponent(subject + " previous year question papers");

});


// Update Study Progress
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


// Listen for checkbox changes
schedule.addEventListener("change", function (e) {

    if (e.target.classList.contains("task-check")) {
        updateProgress();
    }

});


// Generate Important Questions
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