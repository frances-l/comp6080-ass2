import API from "./api.js";
// A helper you may want to use when uploading new images to the server.
import {
    fileToDataUrl,
    raiseError,
    getToken,
    closeModal,
    getUser,
    getUserUsername,
} from "./helpers.js";

import { displayPost, newPost } from "./posts.js";
import { displayProfile } from "./profile.js";

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

// function to close the modal

// if the user has logged in
function yesToken() {
    document.getElementById("navNotLogged").style.display = "none";
    document.getElementById("notLoggedIn").style.display = "none";
    document.getElementById("navLogged").style.display = "block";
    document.getElementById("loggedIn").style.display = "block";
    const tok = getToken();
    console.log(tok);

    api.get("user/feed", {
        headers: {
            Authorization: tok,
        },
    })
        .then((data) => {
            if (data["posts"].length === 0) {
                document.getElementById("notFollowingAnyone").style.display =
                    "block";
                document
                    .getElementById("followSubmit")
                    .addEventListener("click", async (e) => {
                        e.preventDefault();
                        const username = document.getElementById("toFollow")
                            .value;
                        const followUser = await getUserUsername(tok, username);
                        const path =
                            "user/follow?username=" + followUser.username;
                        api.put(path, {
                            headers: {
                                Authorization: tok,
                            },
                        })
                            .then((data) => {
                                location.reload();
                            })
                            .catch((err) => raiseError(err));
                    });
            } else {
                console.log(data["posts"].length);
                for (let i = 0; i < data["posts"].length; i++) {
                    displayPost(data["posts"][i]);
                }
            }
        })
        .catch((err) => {
            raiseError(err);
        });

    const home = document.getElementById("home");
    home.addEventListener("click", (e) => {
        api.get("user/feed", {
            headers: {
                Authorization: tok,
            },
        })
            .then((data) => {
                //   console.log(data["posts"]);
                //   displayPost(data["posts"][0]);
                let feed = document.getElementById("mainFeed");
                while (feed.firstChild) {
                    feed.removeChild(feed.lastChild);
                }
                if (data["posts"].length === 0) {
                    document.getElementById(
                        "notFollowingAnyone"
                    ).style.display = "block";
                } else {
                    console.log(data);
                    console.log(data["posts"].length);
                    for (let i = 0; i < data["posts"].length; i++) {
                        displayPost(data["posts"][i]);
                    }
                }
            })
            .catch((err) => {
                console.log(err);
                raiseError(err);
            });
    });

    console.log(777, window.innerHeight);
    // logging out
    document.getElementById("navLogout").addEventListener("click", (e) => {
        document.getElementById("navLogged").style.display = "none";
        document.getElementById("loggedIn").style.display = "none";
        document.getElementById("navNotLogged").style.display = "block";
        document.getElementById("notLoggedIn").style.display = "block";
        let feed = document.getElementById("mainFeed");
        while (feed.firstChild) {
            feed.removeChild(feed.lastChild);
        }
        // may need to include the modals here
        localStorage.removeItem("token");
        location.reload();
    });

    // view your own profile
    document
        .getElementById("navProfile")
        .addEventListener("click", async (e) => {
            const user = await getUser(tok);
            displayProfile(user);
        });

    document.getElementById("navUpload").addEventListener("click", (e) => {
        newPost();
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
