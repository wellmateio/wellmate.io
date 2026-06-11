const express = require("express");

const router = express.Router();

const defaultOg = {
    url: "https://wellmate.io",
    title: "WellMate",
    description: "Health Assistant",
    image: "https://wellmate.io/images/hero.jpg"
};

/* Static marketing pages. The contact-form (/mail), weekly-waitlist cron, and
 * MySQL/mailer plumbing were removed (P26/F23): they were non-functional (empty
 * reCAPTCHA + mailer config) and carried a committed DB credential. */

router.get("/", function (req, res) {
    res.render("index", {isRoot: true, title: "WellMate - Health Assistant", og: defaultOg});
});

router.get("/terms-of-service", function (req, res) {
    res.render("terms", {menu_prefix: "/", title: "Terms of Service", og: defaultOg});
});

router.get("/privacy-policy", function (req, res) {
    res.render("privacy", {menu_prefix: "/", title: "Privacy Policy", og: defaultOg});
});

router.get("/cookie-policy", function (req, res) {
    res.render("privacy", {menu_prefix: "/", title: "Privacy Policy", og: defaultOg});
});

router.get("/mission", function (req, res) {
    res.render("mission", {menu_prefix: "/", title: "Our Mission", og: defaultOg});
});

router.get("/about", function (req, res) {
    res.render("about", {menu_prefix: "/", title: "About us", og: defaultOg});
});

module.exports = router;
