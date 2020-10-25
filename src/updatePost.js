import API from "./api.js";
import { getToken, raiseError, getUser } from "./helpers.js";
import { displayProfile } from "./profile.js";

const api = new API("http://localhost:5000");

/**
 * Given the JSON, change the description of the provided post
 * @param {JSON} data
 */
export function editPost(data) {
    console.log(data);
    const token = getToken();
    const path = "post?id=" + data.id;
    document.getElementById("updateModal").style.display = "block";
    const container = document.getElementById("updateContent");
    while (container.firstChild) {
        container.removeChild(container.lastChild);
    }

    const header = document.createElement("h1");
    header.innerText = "Update your description: ";
    container.appendChild(header);

    const textbox = document.createElement("textarea");
    textbox.rows = "3";
    textbox.cols = "40";

    container.appendChild(textbox);

    container.appendChild(document.createElement("br"));
    container.appendChild(document.createElement("br"));

    const submit = document.createElement("button");
    submit.innerText = "Update description";

    container.appendChild(submit);

    // Update the post with the new description
    submit.addEventListener("click", (e) => {
        console.log(textbox.value);
        api.put(path, {
            headers: {
                Authorization: token,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                description_text: textbox.value,
                src: data.src,
            }),
        })
            .then(async (data) => {
                document.getElementById("updateModal").style.display = "none";
                const user = await getUser(token);
                displayProfile(user);
            })
            .catch((err) => {
                raiseError(err);
            });
    });
}

/**
 * Given a JSON, delete the post of the provided post
 * @param {JSON} data
 */
export function deletePost(data) {
    const path = "post?id=" + data.id;
    document.getElementById("updateModal").style.display = "block";
    const container = document.getElementById("updateContent");
    while (container.firstChild) {
        container.removeChild(container.lastChild);
    }
    const header = document.createElement("h2");
    header.innerText = "Are you sure you want to delete your post?";
    header.style.textAlign = "center";
    container.appendChild(header);

    const buttonContainer = document.createElement("div");
    buttonContainer.className = "updateButtonContainer";
    container.appendChild(buttonContainer);

    const yes = document.createElement("button");
    yes.innerText = "Yes";
    buttonContainer.appendChild(yes);

    const no = document.createElement("button");
    no.innerText = "No";
    buttonContainer.appendChild(no);

    no.addEventListener("click", (e) => {
        document.getElementById("updateModal").style.display = "none";
    });

    // User confirms they want to delete
    yes.addEventListener("click", (e) => {
        const token = getToken();
        const path = "post?id=" + data.id;
        api.delete(path, {
            headers: {
                Authorization: token,
            },
        })
            .then(async (data) => {
                console.log(data);
                document.getElementById("updateModal").style.display = "none";
                const user = await getUser(token);
                displayProfile(user);
            })
            .catch((err) => {
                raiseError(err);
            });
    });
}
