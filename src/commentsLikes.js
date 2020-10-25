import API from "./api.js";
import {
    getToken,
    closeModal,
    raiseError,
    getUser,
    getUserUsername,
} from "./helpers.js";
import { displayProfile } from "./profile.js";

const api = new API("http://localhost:5000");

/**
 * Given an array of likes, display the people that have liked the post
 * in a modal
 * @param {Array} likeArray
 */
export async function likeModal(likeArray) {
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

/**
 * Given the data of the post, the array of comments, the number of comments,
 * and the id of the post, display a modal that allows a user to add a comment
 * to a post.
 * @param {JSON} data
 * @param {Array} commentArray
 * @param {Int} commentCount
 * @param {Int} id
 */
export function commentBox(data, commentArray, commentCount, id) {
    const path = "post/comment?id=" + data.id;
    const token = getToken();
    let count = 0;
    const modal = document.getElementById("commentModal");
    modal.style.display = "block";
    document.getElementById("commentSubmit").addEventListener("click", (e) => {
        e.preventDefault();
        const com = document.getElementById("commentString").value;
        if (data.id === id) {
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
                    if (count == 0) {
                        const text = await pushComment(com);
                        console.log(commentArray);
                        commentArray.push(text);
                        console.log(commentArray);
                        commentCount.innerText =
                            parseInt(commentCount.innerText) + 1;
                        count = count + 1;
                    }
                })
                .catch((err) => {
                    raiseError(err);
                });
        }
    });
    closeModal();
    return commentArray;
}

/**
 * Given an array of comments, display the author, comment and the time of
 * each comment in a modal.
 * @param {Array} commentArray
 */
export function commentFeed(commentArray) {
    const comments = document.getElementById("comments");
    while (comments.firstChild) {
        comments.removeChild(comments.lastChild);
    }
    document.getElementById("commentFeedModal").style.display = "block";
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
                ":";
            if (String(time.getMinutes()).length === 1) {
                timestamp.innerText =
                    timestamp.innerText + "0" + time.getMinutes();
            } else {
                timestamp.innerText = timestamp.innerText + time.getMinutes();
            }
            timestamp.className = "postTime";
            mainComment.appendChild(timestamp);
            comments.appendChild(mainComment);
        }
    }
    closeModal();
}

/**
 * Given a comment, form a JSON object which contains information about
 * the comment and return it.
 * @param {String} com
 */
async function pushComment(com) {
    const token = getToken();
    const user = await getUser(token);
    let time = new Date();
    time = time.getTime() / 1000;
    const text = {
        author: user.username,
        published: String(time),
        comment: com,
    };
    return text;
}
