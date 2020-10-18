import API from "./api.js";
// A helper you may want to use when uploading new images to the server.
import { fileToDataUrl, raiseError } from "./helpers.js";

// This url may need to change depending on what port your backend is running
// on.
const api = new API("http://localhost:5000"); // will need to change

// Example usage of makeAPIRequest method.

// if the user hasn't signed in yet
function noToken() {
    document.getElementById("navNotLogged").style.display = "block";
    document.getElementById("notLoggedIn").style.display = "block";
    const loginModal = document.getElementById("loginModal");
    const loginButton = document.getElementById("navLogin");
    const registerModal = document.getElementById("registerModal");
    const registerButton = document.getElementById("navRegister");
    loginButton.addEventListener("click", (e) => {
        loginModal.style.display = "block";
    });
    document.getElementById("loginSubmit").addEventListener("click", (e) => {
        console.log("hello");
        e.preventDefault();
        const loginUsername = document.getElementById("loginUsername").value;
        const loginPassword = document.getElementById("loginPassword").value;
        api.post("auth/login", {
            body: JSON.stringify({
                username: loginUsername,
                password: loginPassword,
            }),
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((data) => {
                localStorage.setItem("token", data["token"]);
                yesToken();
            })
            .catch((err) => {
                raiseError(err);
            });
        loginModal.style.display = "none";
        console.log("woop woop");
    });

    registerButton.addEventListener("click", (e) => {
        registerModal.style.display = "block";
    });
    document.getElementById("registerSubmit").addEventListener("click", (e) => {
        e.preventDefault();
        const registerUsername = document.getElementById("registerUsername")
            .value;
        const registerPassword = document.getElementById("registerPassword")
            .value;
        const registerEmail = document.getElementById("registerEmail").value;
        const registerName = document.getElementById("registerName").value;

        api.post("auth/signup", {
            body: JSON.stringify({
                username: registerUsername,
                password: registerPassword,
                email: registerEmail,
                name: registerName,
            }),
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((data) => {
                localStorage.setItem("token", data["token"]);
                yesToken();
            })
            .catch((err) => {
                raiseError(err);
            });
        registerModal.style.display = "none";
    });

    closeModal();
}

// function to close the modals
function closeModal() {
    window.addEventListener("click", (e) => {
        const loginModal = document.getElementById("loginModal");
        const registerModal = document.getElementById("registerModal");
        const errorModal = document.getElementById("errorModal");

        switch (e.target) {
            case loginModal:
                loginModal.style.display = "none";
                break;
            case registerModal:
                registerModal.style.display = "none";
                break;
            case errorModal:
                errorModal.style.display = "none";
        }
    });

    const errorClose = document.getElementsByClassName("close")[0];
    const loginClose = document.getElementsByClassName("close")[1];
    const registerClose = document.getElementsByClassName("close")[2];

    loginClose.addEventListener("click", (e) => {
        loginModal.style.display = "none";
        console.log("does this work");
    });

    registerClose.addEventListener("click", (e) => {
        registerModal.style.display = "none";
        console.log("does this work 2");
    });

    errorClose.addEventListener("click", (e) => {
        errorModal.style.display = "none";
    });
}

// if the user has logged in
function yesToken() {
    document.getElementById("navNotLogged").style.display = "none";
    document.getElementById("notLoggedIn").style.display = "none";
    document.getElementById("navLogged").style.display = "block";
    document.getElementById("loggedIn").style.display = "block";

    // logging out
    document.getElementById("navLogout").addEventListener("click", (e) => {
        document.getElementById("navLogged").style.display = "none";
        document.getElementById("loggedIn").style.display = "none";
        document.getElementById("navNotLogged").style.display = "block";
        document.getElementById("notLoggedIn").style.display = "block";
        localStorage.removeItem("token");
        checkLocalStorage();
    });
}

// checking that user has logged in
function checkLocalStorage() {
    if (localStorage.key("token") === null) {
        console.log("here");
        noToken();
    } else {
        console.log("hello");
        yesToken();
    }
}

checkLocalStorage();
