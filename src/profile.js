import API from "./api.js";
import {
    getToken,
    raiseError,
    closeModal,
    getUser,
    checkElem,
} from "./helpers.js";
import { displayPost } from "./posts.js";
import {
    updateNameCall,
    updatePasswordCall,
    updateEmailCall,
} from "./update.js";

const api = new API("http://localhost:5000");

/**
 * Given a user, display their profile, with information about their name,
 * username, followers and following
 * @param {JSON} user
 */
export async function displayProfile(user) {
    document.getElementById("notFollowingAnyone").style.display = "none";
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
    followed.innerText = "Followers: " + user.followed_num;
    profileBox.appendChild(followed);

    const following = document.createElement("h3");
    const followingNum = document.createElement("span");
    followingNum.innerText = user.following.length;
    followingNum.className = "count";
    following.innerText = "Following: ";
    following.appendChild(followingNum);
    profileBox.appendChild(following);

    const requestingUser = await getUser(token);

    // Follow/unfollow button
    const follow = document.createElement("button");
    if (checkElem(requestingUser["following"], user.id)) {
        console.log(user);
        follow.innerText = "Unfollow " + user.username;
    } else {
        follow.innerText = "Follow " + user.username;
    }

    profileBox.appendChild(follow);

    followHandler(follow, followingNum, user, requestingUser);

    // Display ability to go to settings if the users are the same
    if (requestingUser.username === user.username) {
        follow.style.display = "none";
        const update = document.createElement("button");
        update.innerText = "Settings";
        profileBox.appendChild(document.createElement("br"));
        profileBox.appendChild(document.createElement("br"));
        profileBox.appendChild(update);
        update.addEventListener("click", (e) => {
            displayUpdate();
        });
    }

    mainFeed.appendChild(profileBox);

    displayUserPost(user["posts"]);

    closeModal();
}

/**
 * Given an array of posts, display the posts
 * @param {Array} postArray
 */
function displayUserPost(postArray) {
    const token = getToken();
    for (let i = postArray.length - 1; i >= 0; i--) {
        console.log(postArray[i]);
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

/**
 * Creates the Settings page, and calls the respective functions if a user
 * wants to update their name, email or password
 */
async function displayUpdate() {
    const mainFeed = document.getElementById("mainFeed");
    while (mainFeed.firstChild) {
        mainFeed.removeChild(mainFeed.lastChild);
    }
    const token = getToken();
    const user = await getUser(token);
    console.log(user);

    const container = document.createElement("div");
    container.className = "profileBox";
    const settings = document.createElement("h1");
    settings.innerText = "Settings";
    container.appendChild(settings);

    const username = document.createElement("h3");
    username.innerText = "Username: " + user.username;
    container.appendChild(username);

    const name = document.createElement("h3");
    name.innerText = "Name: " + user.name;
    container.appendChild(name);

    const email = document.createElement("h3");
    email.innerText = "Email: " + user.email;
    container.appendChild(email);

    const buttonContainer = document.createElement("div");
    buttonContainer.className = "updateButtonContainer";
    container.appendChild(buttonContainer);

    const updateName = document.createElement("button");
    updateName.innerText = "Update name";
    container.appendChild(updateName);

    const updateEmail = document.createElement("button");
    updateEmail.innerText = "Update email";
    container.appendChild(updateEmail);

    const updatePassword = document.createElement("button");
    updatePassword.innerText = "Update password";
    container.appendChild(updatePassword);

    updateName.addEventListener("click", (e) => {
        updateNameCall();
    });

    updateEmail.addEventListener("click", (e) => {
        updateEmailCall();
    });

    updatePassword.addEventListener("click", (e) => {
        updatePasswordCall();
    });

    mainFeed.appendChild(container);
}

/**
 * Manages the follow and unfollow of a user, and allows you to see what
 * the user follows
 * @param {Object} follow
 * @param {Object} followingNum
 * @param {JSON} user
 * @param {JSON} requestingUser
 */
function followHandler(follow, followingNum, user, requestingUser) {
    const token = getToken();
    follow.addEventListener("click", async (e) => {
        // Follow and unfollow user
        if (checkElem(requestingUser["following"], user.id)) {
            const path = "user/unfollow?username=" + user.username;
            api.put(path, {
                headers: {
                    Authorization: token,
                },
            })
                .then((data) => {
                    follow.innerText = "follow " + user.username;
                    displayProfile(user);
                })
                .catch((err) => {
                    raiseError(err);
                });
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
                    displayProfile(user);
                })
                .catch((err) => {
                    raiseError(err);
                });
        }
    });

    // See who the user that you're on the profile of is following
    followingNum.addEventListener("click", async (e) => {
        const followingModal = document.getElementById("followingModal");
        followingModal.style.display = "block";
        const followingContent = document.getElementById("following");
        while (followingContent.firstChild) {
            followingContent.removeChild(followingContent.lastChild);
        }
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
                currentUsername.className = "author";
                currentUsername.addEventListener("click", (e) => {
                    displayProfile(currentUser);
                    followingModal.style.display = "none";
                });
                followingContent.appendChild(currentUsername);
            }
        }
    });
}
