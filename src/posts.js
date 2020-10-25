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

import { deletePost, editPost } from "./updatePost.js";

import { commentBox, commentFeed, likeModal } from "./commentsLikes.js";

const api = new API("http://localhost:5000");

/**
 * Given a post's JSON object, display all the relevant information about the post,
 * such as the author, image, likes, comments, description and time of publish.
 *
 * If the post belongs to a user, they also have the option to update or delete
 * their post.
 * @param {JSON} data
 */
export async function displayPost(data) {
    const token = getToken();
    const feed = document.getElementById("mainFeed");
    const box = document.createElement("div");
    box.className = "post";
    // Setting author
    const user = await getUserUsername(token, data["meta"].author);
    const author = document.createElement("p");
    author.innerText = data["meta"].author;
    author.className = "postText author";
    author.addEventListener("click", async (e) => {
        displayProfile(user);
    });
    box.appendChild(author);

    // Setting image
    const imgContainer = document.createElement("div");
    imgContainer.className = "postImageContainer";
    const image = document.createElement("img");
    image.src = "data:img/png;base64," + data.src;
    image.className = "postImage";
    image.alt = data["meta"].description_text;
    imgContainer.appendChild(image);
    box.appendChild(imgContainer);

    // Setting likes and comments
    const likeCommentContainer = document.createElement("div");
    likeCommentContainer.className = "likeCommentContainer postText";
    const like = document.createElement("img");

    // Icons from https://www.flaticon.com/authors/freepik
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

    // Setting desc
    const desc = document.createElement("p");
    desc.innerText = data["meta"].description_text;
    desc.className = "postText";
    box.appendChild(desc);

    // Getting update time
    let postTime = data["meta"].published;
    postTime = new Date(parseInt(postTime) * 1000);
    let timeString =
        "posted on " +
        postTime.getDate() +
        "/" +
        postTime.getMonth() +
        "/" +
        postTime.getFullYear() +
        " " +
        postTime.getHours() +
        ":";
    if (String(postTime.getMinutes()).length === 1) {
        timeString = timeString + "0" + postTime.getMinutes();
    } else {
        timeString = timeString + postTime.getMinutes();
    }
    postTime.getMinutes();
    const time = document.createElement("p");
    time.innerText = timeString;
    time.className = "postTime postText";
    box.appendChild(time);

    const tokenUser = await getUser(token);

    // If user is viewing their own posts
    if (tokenUser.username === user.username) {
        const buttonContainer = document.createElement("div");
        buttonContainer.className = "updateButtonContainer";
        const edit = document.createElement("button");
        edit.innerText = "Edit your post";
        const del = document.createElement("button");
        del.innerText = "Delete your post";
        buttonContainer.appendChild(edit);
        buttonContainer.appendChild(del);
        box.appendChild(buttonContainer);
        box.style.paddingBottom = "2%";

        edit.addEventListener("click", (e) => {
            editPost(data);
        });

        del.addEventListener("click", (e) => {
            deletePost(data);
        });
    }

    feed.appendChild(box);
}

/**
 * Handles the api requests regarding likes and comments
 * @param {JSON} data
 * @param {Object} likeButton
 * @param {Object} likeCount
 * @param {Object} commentButton
 * @param {Object} commentCount
 */
async function likesAndCommentsEvents(
    data,
    likeButton,
    likeCount,
    commentButton,
    commentCount
) {
    // User is liking the post
    const tok = getToken();
    const user = await getUser(tok);
    let likeArray = data["meta"].likes;
    let commentArray = data.comments;
    likeButton.addEventListener("click", (e) => {
        if (checkElem(likeArray, user.id) === false) {
            // Liking photo
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
            // Unliking photo
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

    // Show the likers
    likeCount.addEventListener("click", (e) => {
        likeModal(likeArray);
    });

    // Create a comment
    commentButton.addEventListener("click", (e) => {
        commentArray = commentBox(data, commentArray, commentCount, data.id);
    });

    // Show the comments
    commentCount.addEventListener("click", (e) => {
        commentFeed(commentArray);
    });
}

/**
 * Creates a new page where a user can upload their own image.
 */
export function newPost() {
    // Clear the feed
    const mainFeed = document.getElementById("mainFeed");
    while (mainFeed.firstChild) {
        mainFeed.removeChild(mainFeed.lastChild);
    }

    // Setting up page
    document.getElementById("notFollowingAnyone").style.display = "none";
    const container = document.createElement("div");
    container.className = "profileBox";
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

    // Uploading image
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
    desc.innerText = "Description:";
    container.appendChild(desc);
    const textbox = document.createElement("textarea");
    textbox.rows = "3";
    textbox.cols = "40";
    container.appendChild(textbox);

    const submit = document.createElement("button");
    submit.innerText = "Post!";
    container.appendChild(document.createElement("br"));
    container.appendChild(document.createElement("br"));
    container.appendChild(submit);

    // Uploading photo
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
