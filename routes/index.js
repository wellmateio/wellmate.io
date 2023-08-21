const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const moment = require("moment");
const fetch = require("isomorphic-fetch");
const mysql = require("mysql");

const router = express.Router();

const defaultOg = {
    url: "https://wellmate.io",
    title: "Wellmate",
    description: "Health Assistant",
    image: "https://wellmate.io/images/hero.jpg"
};

const secret_key = "6LfK95UnAAAAADbun2MXIBDG15IzKMDgEDNaztFA";
const recaptcha_url = "https://www.google.com/recaptcha/api/siteverify";

/* GET home page. */
router.get("/", function (req, res, next) {
    res.render("index", {isRoot: true, title: "Wellmate - Health Assistant", og: defaultOg});
});

router.get("/terms-of-service", function (req, res, next) {
    res.render("terms", {menu_prefix: "/", title: "Terms of Service", og: defaultOg});
});

router.get("/privacy-policy", function (req, res, next) {
    res.render("privacy", {menu_prefix: "/", title: "Privacy Policy", og: defaultOg});
});

router.get("/cookie-policy", function (req, res, next) {
    res.render("privacy", {menu_prefix: "/", title: "Privacy Policy", og: defaultOg});
});

router.get("/mission", function (req, res, next) {
    res.render("mission", {menu_prefix: "/", title: "Our Mission", og: defaultOg});
});

router.get("/about", function (req, res, next) {
    res.render("about", {menu_prefix: "/", title: "About us", og: defaultOg});
});

router.get("/utils/getTime", function (req, res, next) {
    let str = moment().format('YYYY-MM-DD HH:mm:ss');
    res.send(str);
});

router.get("/utils/gettime.php", function (req, res, next) {
    let str = moment().format('YYYY-MM-DD HH:mm:ss');
    res.send(str);
});

router.post("/mail", function (req, res, next) {
    const token = req.body.token;
    const url = `${recaptcha_url}?secret=${secret_key}&response=${token}`;

    let body = req.body;
    let data = {
        name: validateInput(body.name, 3),
        message: validateInput(body.message, 20),
        email: validateEmail(body.email),
        privacy: body.privacy == "on",
    };
    if (
        !data.name ||
        !data.message ||
        !data.email ||
        !data.privacy
    ) {
        res.json({
            ...data,
            success: false,
            message: "Wypełnij wszystkie pola",
        });
        return;
    }

    fetch(url, {
        method: "post",
    })
        .then((response) => response.json())
        .then((google_response) => {
            console.log(google_response);
            if (!google_response.success) {
                res.json({
                    ...data,
                    success: false,
                    message: "Brak walidacji captcha",
                });
            } else {
                SendMessage(res, body);
            }
        })
        .catch((error) => res.json({error}));
});

router.post("/wishlist", function (req, res, next) {
    const token = req.body.token;
    const url = `${recaptcha_url}?secret=${secret_key}&response=${token}`;

    console.log("wishlist", token, url)
    let body = req.body;
    let data = {
        name: validateInput(body.name, 2),
        email: validateEmail(body.email),
        privacy: body.privacy == "on",
    };
    console.log("wishlist", data.name, data.email, data.privacy)
    if (
        !data.name ||
        !data.email ||
        !data.privacy
    ) {
        res.json({
            ...data,
            success: false,
            message: "Wypełnij wszystkie pola",
        });
        return;
    }

    fetch(url, {
        method: "post",
    })
        .then((response) => response.json())
        .then((google_response) => {
            console.log(google_response);
            if (!google_response.success) {
                res.json({
                    ...data,
                    success: false,
                    message: "Brak walidacji captcha",
                });
            } else {
                SaveToWishlist(res, body);
            }
        })
        .catch((error) => res.json({error}));
});

function SendMessage(res, body) {
    const mailerEmail = "mailer@wellmate.io";
    let transporter = nodemailer.createTransport({
        pool: true,
        host: "mail24.mydevil.net",
        port: 465,
        secure: true, // use TLS
        auth: {
            user: "mailer@wellmate.io",
            pass: "Y2iVtxafc8Rcm1z09Fwy",
        },
    });

    // setup e-mail data with unicode symbols
    let mailOptions = {
        from: "Strona wellmate.io" + "<" + mailerEmail + ">",
        to: "info@wellmate.io",
        subject: "Wiadomość ze strony wellmate.io od użytkownika " + body.email,
        text:
            "Wiadomość wysłana za pośrednictwem strony wellmate.io od użytkownika " + body.email +
            body.message,
        html:
            '<div><h4>Wiadomość wysłana za pośrednictwem strony <a href="https://wellmate.io" target="_blank">https://wellmate.io</a>:</h4><br>' +
            body.message +
            "</div>",
    };

    transporter.sendMail(mailOptions, function (err, info) {
        if (err)
            res.json({
                success: false,
                message: err,
            });
        else
            transporter.sendMail(
                {
                    from: "Wellmate" + "<mailer@wellmate.io>",
                    to: body.email,
                    subject: "Potwierdzenie wysłania wiadomości ze strony https://wellmate.io ",
                    text:
                        "Dziękujemy za przesłaną wiadomość za pośrednictwem formularza kontaktowego, zamieszczonego na stronie https://wellmate.io. " +
                        "Po odczytaniu wiadomości, skontaktujemy się z Państwem" +
                        "Wellmate Team",
                    html:
                        "<div>Dziękujemy za przesłaną wiadomość za pośrednictwem formularza kontaktowego, zamieszczonego na stronie " +
                        '<a href="https://wellmate.io" target="_blank">https://wellmate.io</a>.</div>' +
                        "<div>Po odczytaniu wiadomości, skontaktujemy się z Państwem.</div>" +
                        "<div><br>--</div>" +
                        "<div>Wellmate Team<div>",
                },
                function (err, info) {
                    res.json({
                        success: false,
                        message: info,
                    });
                }
            );
        res.json({
            success: true,
            message: info
        });
    });
}


function SaveToWishlist(res, body) {
// Tworzenie połączenia z bazą danych
    const connection = mysql.createConnection({
        host: 'mysql24.mydevil.net',     // Twój host
        user: 'm1237_wellmate',      // Twój użytkownik bazy danych
        password: '5AV(w_N96nA+7Bt4wd?cMn9owIFl@Z',  // Twoje hasło bazy danych
        database: 'm1237_wellmate'   // Nazwa bazy danych
    });

// Dane do wstawienia
    const record = {
        name: body.name,
        email: body.email
    };

// Polecenie SQL do wstawienia rekordu
    const sql = 'INSERT INTO wishlist (name, email) VALUES (?, ?)';

// Wykonanie zapytania
        connection.query(sql, [record.name, record.email], (error, results) => {
        if (error) {
            console.error('Błąd przy dodawaniu rekordu:', error)
            res.json({
                success: true,
                message: error
            });
        } else {
            console.log('Rekord został dodany pomyślnie.');
            res.json({
                success: true,
                message: "Rekord został dodany pomyślnie."
            });
        }

        // Zakończenie połączenia
        connection.end();
    });

}

function validateInput(value, len) {
    return value.length >= len;
}

function validateEmail(value) {
    let re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(value).toLowerCase());
}

module.exports = router;
