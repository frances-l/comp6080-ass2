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
    if (checkElem(requestingUser["following"], user.id)) {
        console.log(user);
        follow.innerText = "unfollow " + user.username;
    } else {
        follow.innerText = "follow " + user.username;
    }

    profileBox.appendChild(follow);

    followHandler(follow, followingNum, user, requestingUser);

    if (requestingUser.username === user.username) {
        const update = document.createElement("button");
        update.innerText = "settings";
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
    username.innerText = "username: " + user.username;
    container.appendChild(username);

    const name = document.createElement("h3");
    name.innerText = "name: " + user.name;
    container.appendChild(name);

    const email = document.createElement("h3");
    email.innerText = "email: " + user.email;
    container.appendChild(email);

    const buttonContainer = document.createElement("div");
    buttonContainer.id = "updateButtonContainer";
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

    mainFeed.appendChild(container);
}

function followHandler(follow, followingNum, user, requestingUser) {
    const token = getToken();
    follow.addEventListener("click", async (e) => {
        if (requestingUser.username === user.username) {
            const message = document.getElementById("errorMessage");
            message.innerText = "You cannot follow yourself!";
            const errorModal = document.getElementById("errorModal");
            errorModal.style.display = "block";
        } else {
            // if the requesting user is following, do unfollow else do follow
            if (checkElem(requestingUser["following"], user.id)) {
                const path = "user/unfollow?username=" + user.username;
                api.put(path, {
                    headers: {
                        Authorization: token,
                    },
                })
                    .then((data) => {
                        follow.innerText = "follow " + user.username;
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
                    })
                    .catch((err) => {
                        raiseError(err);
                    });
            }
        }
    });

    followingNum.addEventListener("click", async (e) => {
        console.log(99999);
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

function updateNameCall() {
    const token = getToken();
    document.getElementById("updateModal").style.display = "block";
    const container = document.getElementById("updateContent");

    while (container.firstChild) {
        container.removeChild(container.lastChild);
    }

    const header = document.createElement("h1");
    header.innerText = "Update your name:";
    container.appendChild(header);
    const form = document.createElement("form");
    container.appendChild(form);

    const nameText = document.createElement("label");
    nameText.innerText = "New name: ";
    form.appendChild(nameText);
    const nameContent = document.createElement("input");
    nameContent.type = "text";
    form.appendChild(nameContent);

    form.appendChild(document.createElement("br"));

    const emailText = document.createElement("label");
    emailText.innerText = "Confirm your email: ";
    form.appendChild(emailText);
    const emailContent = document.createElement("input");
    emailContent.type = "text";
    form.appendChild(emailContent);

    form.appendChild(document.createElement("br"));

    const passwordText = document.createElement("label");
    passwordText.innerText = "Confirm your password: ";
    form.appendChild(passwordText);
    const passwordContent = document.createElement("input");
    passwordContent.type = "password";
    form.appendChild(passwordContent);

    form.appendChild(document.createElement("br"));
    form.appendChild(document.createElement("br"));

    const submit = document.createElement("input");
    submit.type = "submit";
    form.appendChild(submit);

    submit.addEventListener("click", (e) => {
        api.put("user", {
            headers: {
                Authorization: token,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: emailContent.value,
                name: nameContent.value,
                password: passwordContent.value,
            }),
        })
            .then((data) => console.log(data))
            .catch((err) => {
                raiseError(err);
            });
    });
}
