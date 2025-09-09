const tpj = jQuery;
tpj.noConflict();
let revapi6;

const form = document.querySelector("#contact-form");
const sendBtn = document.querySelector("#send_button");
const progressBtn = document.querySelector("#sending_button");

const waitlistForm = document.querySelector("#waitlist-contact-form");
const waitlistBtn = document.querySelector("#waitlist_send_button");

const siteKey = "6LfK95UnAAAAAPu54dyy0FvRGcayQ33e5MFq-_bN";

changeButtonVisibility(true);

function ShowNotify(success, description) {
    tpj.notify({
        title: success ? "Success" : "Error",
        message: description,
    }, {
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
    if (data.success) {
        form.reset();
        ShowNotify(true, "Message sent successfully.");
    } else {
        ShowNotify(false, "The message was not sent - " + data.message);
    }
}

function sendMail(token) {
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

function saveToWaitlist(token) {
    changeButtonVisibility(false);
    const data = Object.fromEntries(new FormData(waitlistForm).entries());
    delete data["waitlist-privacy"]

    fetch("https://wellmate-395510.lm.r.appspot.com/api/user/potential", {
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        method: "post",
        body: JSON.stringify(data),
    })
        .then((response) => response.json())
        .then((text) => showWaitlistResult(text))
        .catch((error) => showWaitlistResult(error));

}

function showWaitlistResult(data) {
    changeButtonVisibility(true);
    if (data["added"]) {
        waitlistForm.reset();
        ShowNotify(true, "Message sent successfully.");
    } else {
        ShowNotify(false, "The message was not sent - " + data["detail"]);
    }
}

function executeRecaptcha(action, callback) {
    grecaptcha.execute(siteKey, {action: action})
        .then(function (token) {
            callback(token);
        });
}

function handleClick(e, form, action, callback) {
    if (form.checkValidity()) {
        e.preventDefault();
    } else {
        return;
    }
    executeRecaptcha(action, callback);
}

grecaptcha.ready(function () {
    sendBtn.addEventListener("click", function (e) {
        handleClick(e, form, "mail", function (token) {
            sendMail(token);
        });
    });

    if (waitlistBtn) {
        waitlistBtn.addEventListener("click", function (e) {
            handleClick(e, waitlistForm, "waitlist", function (token) {
                saveToWaitlist(token);
            });
        });
    }
});

tpj(document).ready(function () {
    if (tpj("#rev_slider_6_1").revolution == undefined) {
        revslider_showDoubleJqueryError("#rev_slider_6_1");
    } else {
        revapi6 = tpj("#rev_slider_6_1").show().revolution({
            sliderType: "standard",
            jsFileLocation: "plugins/slider-revolution/js/",
            sliderLayout: "fullwidth",
            dottedOverlay: "none",
            delay: 9000,
            navigation: {
                keyboardNavigation: "off",
                keyboard_direction: "horizontal",
                mouseScrollNavigation: "off",
                onHoverStop: "on",
                arrows: {
                    style: "hades",
                    enable: true,
                    hide_onmobile: true,
                    hide_under: 0,
                    hide_onleave: true,
                    hide_delay: 200,
                    hide_delay_mobile: 1200,
                    tmp: '<div class="tp-arr-allwrapper">	<div class="tp-arr-imgholder"></div></div>',
                    left: {
                        h_align: "left",
                        v_align: "center",
                        h_offset: 40,
                        v_offset: 0
                    },
                    right: {
                        h_align: "right",
                        v_align: "center",
                        h_offset: 40,
                        v_offset: 0
                    }
                }
            },
            responsiveLevels: [1240, 1024, 778, 480],
            visibilityLevels: [1240, 1024, 778, 480],
            gridwidth: [1170, 1024, 778, 480],
            gridheight: [700, 768, 960, 720],
            lazyType: "none",
            shadow: 0,
            spinner: "spinner2",
            stopLoop: "off",
            stopAfterLoops: -1,
            stopAtSlide: -1,
            shuffle: "off",
            autoHeight: "off",
            disableProgressBar: "on",
            hideThumbsOnMobile: "on",
            hideSliderAtLimit: 0,
            hideCaptionAtLimit: 481,
            hideAllCaptionAtLilmit: 0,
            debugMode: false,
            fallbacks: {
                simplifyAll: "off",
                nextSlideOnWindowFocus: "off",
                disableFocusListener: false,
            }
        });
    }
}); /*ready*/

