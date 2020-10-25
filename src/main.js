import API from "./api.js";
// A helper you may want to use when uploading new images to the server.
import {
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
const api = new API("http://localhost:5000");

// Example usage of makeAPIRequest method.

// Variables to keep track of infinite scroll
let p = 0;
let n = 3;
let count = 0;
let flag = false;

/**
 * If the user hasn't signed in yet
 */
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

    // Login modal
    document.getElementById("loginSubmit").addEventListener("click", (e) => {
        e.preventDefault();
        const loginUsername = document.getElementById("loginUsername").value;
        const loginPassword = document.getElementById("loginPassword").value;
        login(loginUsername, loginPassword);
        loginModal.style.display = "none";
    });

    // Can use enter to submit form
    window.addEventListener("keydown", (e) => {
        if (e.code === "Enter" && loginModal.style.display === "block") {
            const loginPassword = document.getElementById("loginPassword")
                .value;
            const loginUsername = document.getElementById("loginUsername")
                .value;
            login(loginUsername, loginPassword);
            loginModal.style.display = "none";
        }
    });

    registerButton.addEventListener("click", (e) => {
        registerModal.style.display = "block";
    });

    // Register modal
    document.getElementById("registerSubmit").addEventListener("click", (e) => {
        e.preventDefault();
        const registerUsername = document.getElementById("registerUsername")
            .value;
        const registerPassword = document.getElementById("registerPassword")
            .value;
        const registerEmail = document.getElementById("registerEmail").value;
        const registerName = document.getElementById("registerName").value;

        register(
            registerUsername,
            registerPassword,
            registerEmail,
            registerName
        );
        registerModal.style.display = "none";
    });

    // Can use enter to submit
    window.addEventListener("keydown", (e) => {
        if (e.code === "Enter" && registerModal.style.display === "block") {
            const registerUsername = document.getElementById("registerUsername")
                .value;
            const registerPassword = document.getElementById("registerPassword")
                .value;
            const registerEmail = document.getElementById("registerEmail")
                .value;
            const registerName = document.getElementById("registerName").value;

            register(
                registerUsername,
                registerPassword,
                registerEmail,
                registerName
            );
            registerModal.style.display = "none";
        }
    });

    closeModal();
}

/**
 * If the user has logged in (there is a token)
 */
function yesToken() {
    document.getElementById("navNotLogged").style.display = "none";
    document.getElementById("notLoggedIn").style.display = "none";
    document.getElementById("navLogged").style.display = "block";
    document.getElementById("loggedIn").style.display = "block";
    const tok = getToken();
    console.log(tok);

    const banner = document.getElementsByClassName("banner")[0];
    banner.style.position = "fixed";
    banner.style.width = "100%";

    // Getting the feed
    const path = "user/feed?p=" + p + "&n=" + n;
    api.get(path, {
        headers: {
            Authorization: tok,
        },
    })
        .then((data) => {
            // If the currently signed in user doesn't follow anyone
            if (data["posts"].length === 0) {
                document.getElementById("notFollowingAnyone").style.display =
                    "block";
                // Give them the option to follow a specific user
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
                for (let i = 0; i < data["posts"].length; i++) {
                    displayPost(data["posts"][i]);
                }
            }
            p = p + n;
            count = count + 1;
        })
        .catch((err) => {
            raiseError(err);
        });

    // Return back to feed if "Quickpic" is clicked on
    const home = document.getElementById("home");
    home.addEventListener("click", (e) => {
        api.get("user/feed", {
            headers: {
                Authorization: tok,
            },
        })
            .then((data) => {
                let feed = document.getElementById("mainFeed");
                while (feed.firstChild) {
                    feed.removeChild(feed.lastChild);
                }
                if (data["posts"].length === 0) {
                    document.getElementById(
                        "notFollowingAnyone"
                    ).style.display = "block";
                } else {
                    for (let i = 0; i < data["posts"].length; i++) {
                        displayPost(data["posts"][i]);
                    }
                }
            })
            .catch((err) => {
                raiseError(err);
            });
    });

    // Infinite scroll
    flag = false;
    window.addEventListener("scroll", (e) => {
        let num = count * 300;

        if (num < window.scrollY && flag === false) {
            flag = true;
            setTimeout(() => {
                callback();
            }, 1000);
        }
    });

    // Logging out
    document.getElementById("navLogout").addEventListener("click", (e) => {
        localStorage.removeItem("token");
        document.getElementById("navLogged").style.display = "none";
        document.getElementById("loggedIn").style.display = "none";
        document.getElementById("navNotLogged").style.display = "block";
        document.getElementById("notLoggedIn").style.display = "block";
        let feed = document.getElementById("mainFeed");
        while (feed.firstChild) {
            feed.removeChild(feed.lastChild);
        }
        reload();
    });

    // View your own profile
    document
        .getElementById("navProfile")
        .addEventListener("click", async (e) => {
            const user = await getUser(tok);
            displayProfile(user);
        });

    // Making a new post
    document.getElementById("navUpload").addEventListener("click", (e) => {
        newPost();
    });
}

/**
 * Checkong that a user has logged in
 */
function checkLocalStorage() {
    if (localStorage.key("token") === null) {
        noToken();
    } else {
        yesToken();
    }
}

/**
 * Get the next feed for the infinite scroll implementation
 */
function callback() {
    const path = "user/feed?p=" + p + "&n=" + n;
    const tok = getToken();
    api.get(path, {
        headers: {
            Authorization: tok,
        },
    })
        .then((data) => {
            for (let i = 0; i < data["posts"].length; i++) {
                displayPost(data["posts"][i]);
            }
            p = p + n;
            flag = false;
        })
        .catch((err) => raiseError(err));
}

/**
 *  Calls the post request to login a user with the provided username and password
 * @param {String} username
 * @param {String} password
 */
function login(username, password) {
    api.post("auth/login", {
        body: JSON.stringify({
            username: username,
            password: password,
        }),
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then((data) => {
            localStorage.setItem("token", data["token"]);
            reload();
        })
        .catch((err) => {
            raiseError(err);
        });
}

/**
 * Reloads a page
 */
function reload() {
    location.reload();
}

/**
 * Given a username, password, email and name, sign up a new user with the provided
 * information. Calls post request
 * @param {String} username
 * @param {String} password
 * @param {String} email
 * @param {String} name
 */
function register(username, password, email, name) {
    api.post("auth/signup", {
        body: JSON.stringify({
            username: username,
            password: password,
            email: email,
            name: name,
        }),
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then((data) => {
            localStorage.setItem("token", data["token"]);
            reload();
        })
        .catch((err) => {
            raiseError(err);
        });
}

checkLocalStorage();
