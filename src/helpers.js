// import { yesToken, noToken } from "./main";

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

export function getToken() {
    return "Token " + localStorage.getItem("token");
}

export function displayPost(data) {
    const feed = document.getElementById("mainFeed");
    const box = document.createElement("div");
    box.className = "post";
    // setting author
    const author = document.createElement("p");
    author.innerText = data["meta"].author;
    author.className = "postText";
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
    like.className = "likeCommentContainerElem";
    likeCommentContainer.appendChild(like);
    const likeCount = document.createElement("p");
    likeCount.innerText = data["meta"].likes.length;
    likeCount.className = "likeCommentContainerElem";
    likeCommentContainer.appendChild(likeCount);

    const comment = document.createElement("img");
    comment.src = "styles/comment.svg";
    comment.className = "likeCommentContainerElem";
    likeCommentContainer.appendChild(comment);
    const commentCount = document.createElement("p");
    commentCount.innerText = data.comments.length;
    commentCount.className = "likeCommentContainerElem";
    likeCommentContainer.appendChild(commentCount);

    box.appendChild(likeCommentContainer);

    // setting desc
    const desc = document.createElement("p");
    desc.innerText = data["meta"].description_text;
    desc.className = "postText";
    box.appendChild(desc);

    // getting update time
    let postTime = data["meta"].published;
    postTime = new moment(parseInt(postTime) * 1000);
    const timeString = "posted on " + postTime.format("DD/MM/YYYY h:mm:ss a");
    const time = document.createElement("p");
    time.innerText = timeString;
    time.className = "postTime postText";
    box.appendChild(time);

    feed.appendChild(box);
}

export function likesAndComments(data) {
    const like = document.createElement("img");
    like.src = "https://img.icons8.com/fluent-systems-filled/2x/like.png";
}
