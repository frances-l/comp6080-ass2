import API from "./api.js";
import {
    getUserUsername,
    getToken,
    raiseError,
    closeModal,
    getUser,
    checkElem,
} from "./helpers.js";
import { displayPost } from "./posts.js";

const api = new API("http://localhost:5000");

export async function displayProfile(user) {
    const mainFeed = document.getElementById("mainFeed");
    while (mainFeed.firstChild) {
        mainFeed.removeChild(mainFeed.lastChild);
    }
    const token = getToken();
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

    const requestingUser = await getUser(token);

    // follow/unfollow button
    const follow = document.createElement("button");
    if (checkElem(requestingUser["following"], user.id) === true) {
        console.log(11111111);
        follow.innerText = "unfollow " + user.username;
    } else {
        follow.innerText = "follow " + user.username;
    }

    profileBox.appendChild(follow);

    follow.addEventListener("click", async (e) => {
        if (requestingUser.username === user.username) {
            const message = document.getElementById("errorMessage");
            message.innerText = "You cannot follow yourself!";
            const errorModal = document.getElementById("errorModal");
            errorModal.style.display = "block";
        } else {
            const path = "user/follow?username=" + user.username;
            api.put(path, {
                headers: {
                    Authorization: token,
                },
            })
                .then((data) => {
                    console.log(data);
                    follow.innerText = "unfollow " + user.username;
                })
                .catch((err) => {
                    raiseError(err);
                });
        }
    });

    followingNum.addEventListener("click", async (e) => {
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
                let currentUser = await getUser(token, user["following"][i]);
                let currentUsername = document.createElement("p");
                currentUsername.innerText = currentUser.username;
                followingContent.appendChild(currentUsername);
            }
        }
    });

    mainFeed.appendChild(profileBox);

    displayUserPost(user["posts"]);

    closeModal();
}

function displayUserPost(postArray) {
    const token = getToken();
    for (let i = 0; i < postArray.length; i++) {
        const path = "post?id=" + postArray[i];
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
}
