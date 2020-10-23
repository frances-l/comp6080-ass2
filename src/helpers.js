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
    const decode = JSON.parse(err);
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

export function displayPost(data) {
    console.log(data);
    const feed = document.getElementById("mainFeed");
    const box = document.createElement("div");
    box.className = "post";
    // setting author
    const author = document.createElement("p");
    author.innerText = data["meta"].author;
    author.className = "postText author";
    box.appendChild(author);

    // setting image
    const imgContainer = document.createElement("div");
    imgContainer.className = "postImageContainer";
    const image = document.createElement("img");
    image.src = "data:img/png;base64," + data.src;
    image.className = "postImage";
    imgContainer.appendChild(image);
    box.appendChild(imgContainer);

    // setting likes and comments
    const likeCommentContainer = document.createElement("div");
    likeCommentContainer.className = "likeCommentContainer postText";
    const like = document.createElement("img");
    // icons from https://www.flaticon.com/authors/freepik
    like.src = "styles/like.svg";
    like.className = "likeCommentContainerElem icon";
    likeCommentContainer.appendChild(like);
    const likeCount = document.createElement("p");
    likeCount.innerText = data["meta"].likes.length;
    likeCount.className = "likeCommentContainerElem count";
    likeCommentContainer.appendChild(likeCount);

    const comment = document.createElement("img");
    comment.src = "styles/comment.svg";
    comment.className = "likeCommentContainerElem icon";
    likeCommentContainer.appendChild(comment);
    const commentCount = document.createElement("p");
    commentCount.innerText = data.comments.length;
    commentCount.className = "likeCommentContainerElem count";
    likeCommentContainer.appendChild(commentCount);

    likesAndCommentsEvents(data, like, likeCount, comment, commentCount);

    box.appendChild(likeCommentContainer);

    // setting desc
    const desc = document.createElement("p");
    desc.innerText = data["meta"].description_text;
    desc.className = "postText";
    box.appendChild(desc);

    // getting update time
    let postTime = data["meta"].published;
    postTime = new Date(parseInt(postTime) * 1000);
    const timeString =
        "posted on " +
        postTime.getDate() +
        "/" +
        postTime.getMonth() +
        "/" +
        postTime.getFullYear() +
        " " +
        postTime.getHours() +
        ":" +
        postTime.getMinutes();
    const time = document.createElement("p");
    time.innerText = timeString;
    time.className = "postTime postText";
    box.appendChild(time);

    feed.appendChild(box);
}

export async function likesAndCommentsEvents(
    data,
    likeButton,
    likeCount,
    commentButton,
    commentCount
) {
    // user is liking the post
    const tok = getToken();
    const user = await getUser(tok);
    console.log(user);
    console.log(data["meta"].likes);
    let likeArray = data["meta"].likes;
    let commentArray = data.comments;
    likeButton.addEventListener("click", (e) => {
        if (checkElem(likeArray, user.id) === false) {
            // liking photo
            console.log("llll", likeArray);
            const path = "post/like?id=" + data.id;
            api.put(path, {
                headers: {
                    Authorization: tok,
                },
            })
                .then((data) => {
                    likeCount.innerText = parseInt(likeCount.innerText) + 1;
                    likeArray.push(user.id);
                })
                .catch((err) => {
                    raiseError(err);
                });
        } else {
            // unliking photo
            const path = "post/unlike?id=" + data.id;
            api.put(path, {
                headers: {
                    Authorization: tok,
                },
            })
                .then((data) => {
                    likeCount.innerText = parseInt(likeCount.innerText) - 1;
                    console.log("aaaa", likeArray);
                    for (let i = 0; i < likeArray.length; i++) {
                        if (likeArray[i] === user.id) {
                            likeArray.splice(i, 1);
                        }
                    }
                })
                .catch((err) => {
                    console.log(err);
                });

            console.log("here");
        }
    });

    likeCount.addEventListener("click", (e) => {
        likeModal(likeArray);
    });

    commentButton.addEventListener("click", (e) => {
        commentArray = commentBox(data, commentArray, commentCount);
    });

    commentCount.addEventListener("click", (e) => {
        console.log(commentArray);
        commentFeed(commentArray);
    });
}

function getUser(token, id = -1) {
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

function checkElem(array, element) {
    for (let i = 0; i < array.length; i++) {
        if (array[i] === element) {
            return true;
        }
    }
    return false;
}

// receives likeArray to display the different users
async function likeModal(likeArray) {
    const likeModal = document.getElementById("likeModal");
    likeModal.style.display = "block";
    const likeModalContent = document.getElementById("likers");
    const tok = getToken();
    if (likeArray.length === 0) {
        const noLike = document.createElement("p");
        noLike.innerText = "Nobody has liked this yet :( Be the first one!";
        likeModalContent.appendChild(noLike);
    } else {
        const likedBy = document.createElement("h3");
        likedBy.innerText = "This post has been liked by:";
        likeModalContent.append(likedBy);
        for (let i = 0; i < likeArray.length; i++) {
            let currUser = await getUser(tok, likeArray[i]);
            let name = document.createElement("p");
            name.innerText = currUser.username;
            likeModalContent.appendChild(name);
        }
    }
    closeModal();
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
                console.log("hereeee");
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
                while (commentModalContent.firstChild) {
                    commentModalContent.removeChild(
                        commentModalContent.lastChild
                    );
                }
                break;
        }
    });

    const errorClose = document.getElementsByClassName("close")[0];
    const loginClose = document.getElementsByClassName("close")[1];
    const registerClose = document.getElementsByClassName("close")[2];
    const likeClose = document.getElementsByClassName("close")[3];
    const commentFeedClose = document.getElementsByClassName("close")[4];
    const commentClose = document.getElementsByClassName("close")[5];

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
}

function commentBox(data, commentArray, commentCount) {
    console.log("yyyyyy");
    const path = "post/comment?id=" + data.id;
    const token = getToken();
    const modal = document.getElementById("commentModal");
    modal.style.display = "block";
    document.getElementById("commentSubmit").addEventListener("click", (e) => {
        e.preventDefault();
        const com = document.getElementById("commentString").value;
        api.put(path, {
            headers: {
                "Content-Type": "application/json",
                Authorization: token,
            },
            body: JSON.stringify({
                comment: com,
            }),
        })
            .then(async () => {
                modal.style.display = "none";
                const text = await pushComment(com);
                console.log("wwwwww", text);
                console.log("aaaaaa", commentArray);
                commentArray.push(text);
                commentCount.innerText = parseInt(commentCount.innerText) + 1;
                console.log("pppppp", commentArray);
            })
            .catch((err) => {
                raiseError(err);
            });
    });
    closeModal();
    console.log("xxxxxx", commentArray);
    return commentArray;
}

function commentFeed(commentArray) {
    const comments = document.getElementById("comments");
    const header = document.createElement("h2");
    header.innerText = "Comments";
    comments.appendChild(header);
    document.getElementById("commentFeedModal").style.display = "block";
    for (let i = 0; i < commentArray.length; i++) {
        const mainComment = document.createElement("div");
        const author = document.createElement("p");
        author.innerText = commentArray[i].author;
        author.className = "author";
        mainComment.appendChild(author);
        const comment = document.createElement("p");
        comment.innerText = commentArray[i].comment;
        mainComment.appendChild(comment);
        const time = new Date(parseInt(commentArray[i].published) * 1000);
        const timestamp = document.createElement("p");
        timestamp.innerText =
            "commented on " +
            time.getDate() +
            "/" +
            time.getMonth() +
            "/" +
            time.getFullYear() +
            " " +
            time.getHours() +
            ":" +
            time.getMinutes();
        timestamp.className = "postTime";
        const test = new Date();
        console.log(test.getTime() / 1000);
        console.log(test.getTime());
        mainComment.appendChild(timestamp);
        comments.appendChild(mainComment);
    }
    closeModal();
}

async function pushComment(com) {
    const token = getToken();
    const user = await getUser(token);
    let time = new Date();
    time = time.getTime() / 1000;
    const text = {
        author: user.username,
        published: time,
        comment: com,
    };
    console.log("pushComment", text);
    return text;
}
