// import { yesToken, noToken } from "./main";

import API from "./api.js";

const api = new API("http://localhost:5000");
/**
 * Given a js file object representing a jpg or png image, such as one taken
 * from a html file input element, return a promise which resolves to the file
 * data as a data url.
 * More info:
 *   https://developer.mozilla.org/en-US/docs/Web/API/File
 *   https://developer.mozilla.org/en-US/docs/Web/API/FileReader
 *   https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs
 *
 * Example Usage:
 *   const file = document.querySelector('input[type="file"]').files[0];
 *   console.log(fileToDataUrl(file));
 * @param {File} file The file to be read.
 * @return {Promise<string>} Promise which resolves to the file as a data url.
 */
export function fileToDataUrl(file) {
    const validFileTypes = ["image/jpeg", "image/png", "image/jpg"];
    const valid = validFileTypes.find((type) => type === file.type);
    // Bad data, let's walk away.
    if (!valid) {
        throw Error("provided file is not a png, jpg or jpeg image.");
    }

    const reader = new FileReader();
    const dataUrlPromise = new Promise((resolve, reject) => {
        reader.onerror = reject;
        reader.onload = () => resolve(reader.result);
    });
    reader.readAsDataURL(file);
    return dataUrlPromise;
}

/**
 * Given an error from the backend, bring up the error modal
 * @param {JSON} err
 */
export function raiseError(err) {
    console.log(999);
    const decode = JSON.parse(err);
    console.log(8888);
    const message = document.getElementById("errorMessage");
    message.innerText = decode.message;
    const errorModal = document.getElementById("errorModal");
    errorModal.style.display = "block";
}
/**
 * Gets the authorization token of the currently logged in user
 */
export function getToken() {
    return "Token " + localStorage.getItem("token");
}

export function getUser(token, id = -1) {
    if (id === -1) {
        return api
            .get("user", {
                headers: {
                    Authorization: token,
                },
            })
            .then((data) => {
                return data;
            })
            .catch((err) => {
                console.log(err);
                raiseError(err);
            });
    } else {
        const path = "user?id=" + id;
        return api
            .get(path, {
                headers: {
                    Authorization: token,
                },
            })
            .then((data) => {
                return data;
            })
            .catch((err) => {
                raiseError(err);
            });
    }
}

export function getUserUsername(token, username) {
    const path = "user?username=" + username;
    return api
        .get(path, {
            headers: {
                Authorization: token,
            },
        })
        .then((data) => {
            return data;
        })
        .catch((err) => {
            raiseError(data);
        });
}

export function closeModal() {
    const likeModalContent = document.getElementById("likers");
    const loginModal = document.getElementById("loginModal");
    const registerModal = document.getElementById("registerModal");
    const errorModal = document.getElementById("errorModal");
    const likeModal = document.getElementById("likeModal");
    const commentFeedModal = document.getElementById("commentFeedModal");
    const commentModal = document.getElementById("commentModal");
    const commentModalContent = document.getElementById("comments");
    const followingModal = document.getElementById("followingModal");
    const followingContent = document.getElementById("following");
    const updateModal = document.getElementById("updateModal");

    window.addEventListener("click", (e) => {
        switch (e.target) {
            case loginModal:
                loginModal.style.display = "none";
                break;
            case registerModal:
                registerModal.style.display = "none";
                break;
            case errorModal:
                errorModal.style.display = "none";
                break;
            case likeModal:
                likeModal.style.display = "none";
                while (likeModalContent.firstChild) {
                    likeModalContent.removeChild(likeModalContent.lastChild);
                }
                break;
            case commentModal:
                commentModal.style.display = "none";
                break;
            case commentFeedModal:
                commentFeedModal.style.display = "none";
                break;
            case followingModal:
                followingModal.style.display = "none";
                break;
            case updateModal:
                updateModal.style.display = "none";
        }
    });

    const errorClose = document.getElementsByClassName("close")[0];
    const loginClose = document.getElementsByClassName("close")[1];
    const registerClose = document.getElementsByClassName("close")[2];
    const likeClose = document.getElementsByClassName("close")[3];
    const commentFeedClose = document.getElementsByClassName("close")[4];
    const commentClose = document.getElementsByClassName("close")[5];
    const followingClose = document.getElementsByClassName("close")[6];
    const updateClose = document.getElementsByClassName("close")[7];

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

    likeClose.addEventListener("click", (e) => {
        console.log("hello");
        likeModal.style.display = "none";
        while (likeModalContent.firstChild) {
            likeModalContent.removeChild(likeModalContent.lastChild);
        }
    });

    commentClose.addEventListener("click", (e) => {
        commentModal.style.display = "none";
    });

    commentFeedClose.addEventListener("click", (e) => {
        commentFeedModal.style.display = "none";
        while (commentModalContent.firstChild) {
            commentModalContent.removeChild(commentModalContent.lastChild);
        }
    });

    followingClose.addEventListener("click", (e) => {
        followingModal.style.display = "none";
        while (followingContent.firstChild) {
            followingContent.removeChild(followingContent.lastChild);
        }
    });

    updateClose.addEventListener("click", (e) => {
        updateClose.style.display = "none";
    });

    window.addEventListener("keydown", (e) => {
        if (e.code === "Escape") {
            followingModal.style.display = "none";

            commentFeedModal.style.display = "none";
            while (commentModalContent.firstChild) {
                commentModalContent.removeChild(commentModalContent.lastChild);
            }

            commentModal.style.display = "none";

            likeModal.style.display = "none";
            while (likeModalContent.firstChild) {
                likeModalContent.removeChild(likeModalContent.lastChild);
            }

            errorModal.style.display = "none";

            registerModal.style.display = "none";

            loginModal.style.display = "none";

            updateModal.style.display = "none";
        }
    });
}

export function checkElem(array, element) {
    for (let i = 0; i < array.length; i++) {
        if (array[i] === element) {
            return true;
        }
    }
    return false;
}
