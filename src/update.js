import API from "./api.js";
import { getToken, raiseError } from "./helpers.js";

const api = new API("http://localhost:5000");

/**
 * Updates the name that the user has requested - displays a modal for the user
 * to put in their respective information
 */
export function updateNameCall() {
    const token = getToken();
    document.getElementById("updateModal").style.display = "block";
    const container = document.getElementById("updateContent");

    while (container.firstChild) {
        container.removeChild(container.lastChild);
    }

    // Populating the modal
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

    // PUT request
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

/**
 * Updates the email that the user has requested - displays a modal for the user
 * to put in their respective information
 */
export function updateEmailCall() {
    const token = getToken();
    document.getElementById("updateModal").style.display = "block";
    const container = document.getElementById("updateContent");

    while (container.firstChild) {
        container.removeChild(container.lastChild);
    }

    // Populating modal
    const header = document.createElement("h1");
    header.innerText = "Update your email:";
    container.appendChild(header);
    const form = document.createElement("form");
    container.appendChild(form);

    const nameText = document.createElement("label");
    nameText.innerText = "Confirm your name: ";
    form.appendChild(nameText);
    const nameContent = document.createElement("input");
    nameContent.type = "text";
    form.appendChild(nameContent);

    form.appendChild(document.createElement("br"));

    const emailText = document.createElement("label");
    emailText.innerText = "New email: ";
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

    // PUT request
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

/**
 * Updates the password that the user has requested - displays a modal for the user
 * to put in their respective information
 */
export function updatePasswordCall() {
    const token = getToken();
    document.getElementById("updateModal").style.display = "block";
    const container = document.getElementById("updateContent");

    while (container.firstChild) {
        container.removeChild(container.lastChild);
    }

    // Populating modal
    const header = document.createElement("h1");
    header.innerText = "Update your password:";
    container.appendChild(header);
    const form = document.createElement("form");
    container.appendChild(form);

    const nameText = document.createElement("label");
    nameText.innerText = "Confirm your name: ";
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
    passwordText.innerText = "New password: ";
    form.appendChild(passwordText);
    const passwordContent = document.createElement("input");
    passwordContent.type = "password";
    form.appendChild(passwordContent);

    form.appendChild(document.createElement("br"));
    form.appendChild(document.createElement("br"));

    const submit = document.createElement("input");
    submit.type = "submit";
    form.appendChild(submit);

    // PUT request
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
