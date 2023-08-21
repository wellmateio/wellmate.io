const form = document.querySelector("#contact-form");
const sendBtn = document.querySelector("#send_button");
const progressBtn = document.querySelector("#sending_button");

const wishlistForm = document.querySelector("#wishlist-contact-form");
const wishlistBtn = document.querySelector("#wishlist_send_button");

changeButtonVisibility(true);

function ShowNotify(success, description) {
    var content = {
        title: "Wysyłanie wiadomości",
        message: description,
    };

    var notify = $.notify(content, {
        type: success ? "success" : "danger",
        timer: 2000,
        offset: {
            x: 20,
            y: 20,
        },
    });
}

function changeButtonVisibility(canSendMessage) {
    sendBtn.hidden = !canSendMessage;
    progressBtn.hidden = canSendMessage;
}

function showResult(data) {
    changeButtonVisibility(true);
    console.log(data);
    console.log(data.success);
    if (data.success) {
        form.reset();
        ShowNotify(true, "Wiadomość wysłana pomyślnie");
    } else {
        ShowNotify(false, "Wiadomość nie została wysłana - " + data.message);
    }
}

function handleClick(token) {

    changeButtonVisibility(false);
    const data = Object.fromEntries(new FormData(form).entries());
    data.token = token;

    fetch("/mail", {
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        method: "post",
        body: JSON.stringify(data),
    })
        .then((response) => response.json())
        .then((text) => showResult(text))
        .catch((error) => showResult(error));

}

function handleWishlistClick(token) {


    changeButtonVisibility(false);
    const data = Object.fromEntries(new FormData(wishlistForm).entries());
    data.token = token;

    fetch("/wishlist", {
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        method: "post",
        body: JSON.stringify(data),
    })
        .then((response) => response.json())
        .then((text) => showWishlistResult(text))
        .catch((error) => showWishlistResult(error));

}

function showWishlistResult(data) {
    console.log("showWishlistResult", data);
    changeButtonVisibility(true);

    if (data.success) {
        wishlistForm.reset();
        ShowNotify(true, "Wiadomość wysłana pomyślnie");
    } else {
        ShowNotify(false, "Wiadomość nie została wysłana - " + data.message);
    }
}

const siteKey = "6LfK95UnAAAAAPu54dyy0FvRGcayQ33e5MFq-_bN"

grecaptcha.ready(function () {

    sendBtn.addEventListener("click", function (e) {
        if (form.checkValidity()) {
            e.preventDefault();
        } else {
            return;
        }
        grecaptcha
            .execute(siteKey, {action: "homepage"})
            .then(function (token) {
                handleClick(token);
            });
    });
    if (wishlistBtn) wishlistBtn.addEventListener("click", function (e) {
        if (wishlistForm.checkValidity()) {
            e.preventDefault();
        } else {
            return;
        }
        grecaptcha
            .execute(siteKey, {action: "homepage"})
            .then(function (token) {
                handleWishlistClick(token);
            });
    });
});
