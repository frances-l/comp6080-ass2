import API from "./api.js";

import {
    getToken,
    getUser,
    raiseError,
    closeModal,
    getUserUsername,
    checkElem,
    fileToDataUrl,
} from "./helpers.js";

import { displayProfile } from "./profile.js";

const api = new API("http://localhost:5000");

export function displayPost(data) {
    const token = getToken();
    const feed = document.getElementById("mainFeed");

    const box = document.createElement("div");
    box.className = "post";
    // setting author
    const author = document.createElement("p");
    author.innerText = data["meta"].author;
    author.className = "postText author";
    author.addEventListener("click", async (e) => {
        const user = await getUserUsername(token, data["meta"].author);
        displayProfile(user);
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
    let likeArray = data["meta"].likes;
    let commentArray = data.comments;
    console.log(61161616, data.id);
    likeButton.addEventListener("click", (e) => {
        if (checkElem(likeArray, user.id) === false) {
            // liking photo
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
                    for (let i = 0; i < likeArray.length; i++) {
                        if (likeArray[i] === user.id) {
                            likeArray.splice(i, 1);
                        }
                    }
                })
                .catch((err) => {
                    raiseError(err);
                });
        }
    });

    likeCount.addEventListener("click", (e) => {
        likeModal(likeArray);
    });

    commentButton.addEventListener("click", (e) => {
        commentArray = commentBox(data, commentArray, commentCount, data.id);
    });

    commentCount.addEventListener("click", (e) => {
        commentFeed(commentArray);
    });
}

// receives likeArray to display the different users
async function likeModal(likeArray) {
    const likeModal = document.getElementById("likeModal");
    likeModal.style.display = "block";
    const likeModalContent = document.getElementById("likers");
    while (likeModalContent.firstChild) {
        likeModalContent.removeChild(likeModalContent.lastChild);
    }
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
            name.className = "author";
            name.addEventListener("click", (e) => {
                likeModal.style.display = "none";
                displayProfile(currUser);
            });
            likeModalContent.appendChild(name);
        }
    }
    closeModal();
}

function commentBox(data, commentArray, commentCount, id) {
    console.log(8181811, data);
    console.log("yyyyyy");
    const path = "post/comment?id=" + data.id;
    console.log(path);
    const token = getToken();
    let count = 0;
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
                console.log(54545454, data);
                if (data.id === id) {
                    modal.style.display = "none";
                    console.log(1111111);
                    if (count == 0) {
                        const text = await pushComment(com);
                        console.log("wwwwww", text);
                        console.log("aaaaaa", commentArray);
                        commentArray.push(text);
                        commentCount.innerText =
                            parseInt(commentCount.innerText) + 1;
                        console.log("pppppp", commentArray);
                        count = count + 1;
                    }
                }
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
    while (comments.firstChild) {
        comments.removeChild(comments.lastChild);
    }
    const commentFeedModal = document.getElementById("commentFeedModal");
    commentFeedModal.style.display = "block";
    if (commentArray.length === 0) {
        const noComments = document.createElement("p");
        noComments.innerText =
            "There are currently no comments! Be the first one!";
        comments.appendChild(noComments);
    } else {
        const header = document.createElement("h2");
        header.innerText = "Comments";
        comments.appendChild(header);

        for (let i = 0; i < commentArray.length; i++) {
            const mainComment = document.createElement("div");
            const author = document.createElement("p");
            author.innerText = commentArray[i].author;
            author.className = "author";
            author.addEventListener("click", async (e) => {
                const token = getToken();
                const user = await getUserUsername(
                    token,
                    commentArray[i].author
                );
                displayProfile(user);
                commentFeedModal.style.display = "none";
            });
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
            mainComment.appendChild(timestamp);
            comments.appendChild(mainComment);
        }
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

export function newPost() {
    // clear the feed
    const mainFeed = document.getElementById("mainFeed");
    while (mainFeed.firstChild) {
        mainFeed.removeChild(mainFeed.lastChild);
    }
    document.getElementById("notFollowingAnyone").style.display = "none";
    const container = document.createElement("div");
    container.className = "uploadContainer";
    mainFeed.appendChild(container);
    const title = document.createElement("h1");
    title.innerText = "New Post";
    container.appendChild(title);
    const upload = document.createElement("h3");
    upload.innerText = "Upload your photo here:";
    container.appendChild(upload);
    const form = document.createElement("form");
    const input = document.createElement("input");
    input.type = "file";
    form.appendChild(input);
    container.appendChild(form);

    let file;
    input.addEventListener("change", (e) => {
        const xd = fileToDataUrl(e.target.files[0]);
        xd.then((data) => {
            file = data;
        }).catch((err) => {
            raiseError(err);
        });
    });

    const desc = document.createElement("h3");
    desc.innerText = "description:";
    container.appendChild(desc);
    const textbox = document.createElement("textarea");
    textbox.rows = "3";
    textbox.cols = "40";
    container.appendChild(textbox);

    const submit = document.createElement("button");
    submit.innerText = "post!";
    container.appendChild(document.createElement("br"));
    container.appendChild(document.createElement("br"));
    container.appendChild(submit);

    submit.addEventListener("click", (e) => {
        const photo = file.slice(23);
        const token = getToken();
        api.post("post", {
            headers: {
                Authorization: token,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                description_text: textbox.value,
                src: photo,
            }),
        })
            .then(async (data) => {
                console.log(data);
                const user = await getUser(token);
                displayProfile(user);
            })
            .catch((err) => {
                raiseError(err);
            });
    });
}
