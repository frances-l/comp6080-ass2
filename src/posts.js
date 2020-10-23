import API from "./api.js";

import { getToken, getUser, raiseError, closeModal } from "./helpers.js";

import { displayProfile } from "./profile.js";

const api = new API("http://localhost:5000");

export function displayPost(data) {
    console.log("we are here", data);
    const feed = document.getElementById("mainFeed");
    const box = document.createElement("div");
    box.className = "post";
    // setting author
    const author = document.createElement("p");
    author.innerText = data["meta"].author;
    author.className = "postText author";
    author.addEventListener("click", (e) => {
        displayProfile(data);
    });
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
