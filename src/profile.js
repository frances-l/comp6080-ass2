import API from "./api.js";
import {
    getUserUsername,
    getToken,
    raiseError,
    closeModal,
} from "./helpers.js";
import { displayPost } from "./posts.js";

const api = new API("http://localhost:5000");

export async function displayProfile(data) {
    const mainFeed = document.getElementById("mainFeed");
    while (mainFeed.firstChild) {
        mainFeed.removeChild(mainFeed.lastChild);
    }
    const token = getToken();
    const user = await getUserUsername(token, data["meta"].author);
    console.log(user);
    const profileBox = document.createElement("div");
    profileBox.className = "profileBox";

    const username = document.createElement("h1");
    username.innerText = user.username;
    profileBox.appendChild(username);

    const name = document.createElement("h3");
    name.innerText = user.name;
    profileBox.appendChild(name);

    const followed = document.createElement("h3");
    followed.innerText = "followers: " + user.followed_num;
    profileBox.appendChild(followed);

    const following = document.createElement("h3");
    const followingNum = document.createElement("span");
    followingNum.innerText = user.following.length;
    followingNum.className = "count";
    following.innerText = "following: ";
    following.appendChild(followingNum);
    profileBox.appendChild(following);

    const follow = document.createElement("button");
    follow.innerText = "follow " + user.username;
    profileBox.appendChild(follow);

    follow.addEventListener("click", (e) => {
        console.log("ppp");
    });

    followingNum.addEventListener("click", (e) => {
        console.log(99999);
        const followingModal = document.getElementById("followingModal");
        followingModal.style.display = "block";
        const followingContent = document.getElementById("following");
        if (user["following"].length == 0) {
            const nobody = document.createElement("h2");
            nobody.innerText = user.username + " isn't following anyone :(";
            followingContent.appendChild(nobody);
        } else {
            const currentlyFollowing = document.createElement("h2");
            currentlyFollowing.innerText = "Currently following:";
            followingContent.appendChild(currentlyFollowing);

            for (let i = 0; i < user["following"].length; i++) {
                console.log("llll");
            }
        }
    });

    mainFeed.appendChild(profileBox);

    for (let i = 0; i < user["posts"].length; i++) {
        const path = "post?id=" + user["posts"][i];
        api.get(path, {
            headers: {
                Authorization: token,
            },
        })
            .then((data) => {
                displayPost(data);
            })
            .catch((err) => {
                raiseError(err);
            });
    }

    closeModal();
}
