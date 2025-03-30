document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("signup-btn").addEventListener("click", loadSignup);
    document.getElementById("Take_assessment").addEventListener("click", loadAssessmentDetails);
    document.getElementById("Give_assessment").addEventListener("click", loadLogin);
});

function loadIndex() {
    window.location.href = "/";
    let signupbtn = document.getElementById("signup-btn");
    if(signupbtn) signupbtn.style.display = 'block'
    
    document.getElementById("Take-assessment").addEventListener("click", loadAssessmentDetails);
    document.getElementById("Give_assessment").addEventListener("click", loadLogin);
}

//load signup page
function loadSignup() {
    document.getElementById("signup-btn").style.display = 'none';
    fetch("/signup")
        .then(response => response.text())
        .then(data => {
            document.getElementById("content").innerHTML = data;
            attachSignupEvent();  // Attach event listeners after loading signup page
        })
        .catch(error => console.error("Error loading signup page:", error));
}

function attachSignupEvent() {
    const signupForm = document.getElementById("signup-form");
    
    if (!signupForm) {
        console.error("Error: Signup form not found!");
        return;
    }

    signupForm.addEventListener("submit", function (event) {
        event.preventDefault();  // Prevent default form submission

        let formData = new FormData(this);

        fetch("/signup", {
            method: "POST",
            body: formData
        })
        .then(response => response.json())
        .then(data => {  
            if(data.status === true) {  // Ensure exact match
                alert(data.message);
                loadIndex();  // Redirect to home page
            } else {
                alert("Error: " + data.message);
            }
        })
        .catch(error => console.error("Error:", error));
    });
}

//Load login page
function loadLogin(){
    document.getElementById("signup-btn").style.display = 'none';

    fetch("/login")
        .then(response => response.text())
        .then(data => {
            document.getElementById("content").innerHTML = data;
            setTimeout(attachLoginEvent, 100);  // Attach event listeners after loading login page
        })
        .catch(error => console.error("Error loading login page:", error));
}

function attachLoginEvent() {
    const loginForm = document.getElementById("login-form");
    
    if (!loginForm) {
        console.error("Error: Login form not found!");
        return;
    }

    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();  // Prevent default form submission

        let formData = new FormData(this);

        fetch("/login", {
            method: "POST",
            body: formData
        })
        .then(response => response.json())
        .then(data => {  
            if(data.status) {  // Ensure exact match
                alert(data.message);
                window.location.href = "/dashboard";   // Redirect to home page
            } else {
                alert("Error: " + data.message);
            }
        })
        .catch(error => console.error("Error:", error));
    });
}


// Load Assessment Page
function loadAssessmentDetails() {
    document.getElementById("signup-btn").style.display = 'none';
    fetch("/assessment_details")
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to load assessment details");
            }
            return response.text();
        })
        .then(html => {
            document.getElementById("content").innerHTML = html;
            setTimeout(verifyAssessment, 100);
        })
        .catch(error => console.error("Error loading assessment page:", error));
}

function verifyAssessment(){
    const assessmentForm = document.getElementById("assessment-form");

    if (!assessmentForm) {
        console.error("Error: Assessment form not found!");
        return;
    }

    document.getElementById("assessment-form").addEventListener("submit", function (event) {
        event.preventDefault(); // Prevent default form submission
    
        const assessment_Id = document.getElementById("Assessment_Id").value.trim();
        
        if (!assessment_Id) {
            alert("Please enter an Assessment ID!");
            return;
        }
    
        let formData = new FormData();
        formData.append("assessmentId", assessment_Id);
    
        fetch("/verify_assessment", {
            method: "POST",
            body: formData
        })
        .then(response => response.json())
        .then(data => {  
            if (data.status === "valid") {  
                alert(data.message);
            } else if (data.status === "expired") {
                alert("Error: " + data.message);
            } else if (data.status === "cancelled") {
                alert("Error: " + data.message);
            } else if (data.status === "in_progress") {
                alert(data.message);
                loadFaceVerification(assessment_Id); // Proceed if valid
            } else {
                alert("Error: Unknown response from server.");
            }
        })
        .catch(error => console.error("Error:", error));
    });
}    

function loadFaceVerification(assessment_Id) {
    fetch("/face_verification")
        .then(response => response.text())
        .then(html => {
            document.getElementById("content").innerHTML = html;

            document.getElementById('load').style.display = 'none';

            // Wait for video feed to be available before starting timer
            const webcam = document.getElementById("webcam_feed");
            webcam.onload = function () {
                console.log("Webcam is ready, starting timer...");
                startTimer(5, assessment_Id);
            };
            
            // Set the webcam feed source
            webcam.src = "/video_feed";
        })
        .catch(error => console.error("Error loading face verification page:", error));
}

function startTimer(duration, assessment_Id) {
    let timer = duration;
    const display = document.getElementById('timer');

    const interval = setInterval(() => {
        display.textContent = "00:" + (timer < 5 ? "0" : "") + timer;
        timer--;

        if (timer < 0) {
            document.getElementById('time').style.display = 'none';
            document.getElementById('load').style.display = 'block';
            clearInterval(interval);
            verifyFaceAutomatically(assessment_Id);
        }
    }, 1000);
}

function verifyFaceAutomatically(assessment_Id) {        
    if (!assessment_Id) {
        alert("Please enter an Assessment ID!");
        return;
    }
    let formData = new FormData();
    formData.append("assessment_id", assessment_Id);

    fetch('/verify_face', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            sessionStorage.setItem("assessment_verified", "true"); 
            window.location.href = "/instructions";
        } else {
            alert(data.error || "Face verification failed.Please try again..");
            window.location.href = "/";
        }
    })
    .catch(error => console.error("Error:", error));  
}