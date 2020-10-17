import API from './api.js';
// A helper you may want to use when uploading new images to the server.
import { fileToDataUrl } from './helpers.js';

// This url may need to change depending on what port your backend is running
// on.
const api = new API('http://localhost:5000'); // will need to change

// Example usage of makeAPIRequest method.

const loginModal = document.getElementById("loginModal");
const loginButton = document.getElementById("navLogin");
const registerModal = document.getElementById("registerModal");
const registerButton = document.getElementById("navRegister");
const loginClose = document.getElementsByClassName("close")[0];
const registerClose = document.getElementsByClassName("close")[1];

loginButton.addEventListener("click", e => {
    loginModal.style.display = "block";
})
document.getElementById("loginSubmit").addEventListener("click", e => {
    console.log("hello");
    e.preventDefault();
    const loginUsername = document.getElementById("loginUsername").value;
    const loginPassword = document.getElementById("loginPassword").value;
    api.post("auth/login", {
        body: JSON.stringify({
            "username": loginUsername,
            "password": loginPassword,
        }),
        headers: {
            'Content-Type': 'application/json'
        },
    })
        .then (data => {
            console.log(data);
            document.getElementById("navNotLogged").style.display = "none";
            document.getElementById("navLogged").style.display = "block";
            document.getElementById("notLoggedIn").style.display = "none";
            document.getElementById("loggedIn").style.display = "block";
        })
        .catch(err => {
            alert(err);
        })
    console.log("woop woop")
})

registerButton.addEventListener("click", e => {
    registerModal.style.display = "block";
})
document.getElementById("registerSubmit").addEventListener("click", e => {
    e.preventDefault();
    const registerUsername = document.getElementById("registerUsername").value;
    const registerPassword = document.getElementById("registerPassword").value;
    const registerEmail = document.getElementById("registerEmail").value;
    const registerName = document.getElementById("registerName").value;
    api.post("auth/signup", {
        body: JSON.stringify({
            "username": registerUsername,
            "password": registerPassword,
            "email": registerEmail,
            "name": registerName,
        }),
        headers: {
            'Content-Type': 'application/json'
        },
    })
        .then( () => {
            document.getElementById("navNotLogged").style.display = "none";
            document.getElementById("navLogged").style.display = "block";
            document.getElementById("notLoggedIn").style.display = "none";
            document.getElementById("loggedIn").style.display = "block";
        })
        .catch(err => {
            alert(err);
        })
})


loginClose.addEventListener("click", e => {
    loginModal.style.display = "none";
})

registerClose.addEventListener("click", e => {
    registerModal.style.display = "none";
}
)

window.addEventListener("click", e => {
    if (e.target == loginModal) {
        loginModal.style.display = "none";
    } else if (e.target == registerModal) {
        registerModal.style.display = "none";
    }
})


