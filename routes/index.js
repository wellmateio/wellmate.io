const express = require("express");
const nodemailer = require("nodemailer");
const cron = require("node-cron");
const bodyParser = require("body-parser");
const moment = require("moment");
const fetch = require("isomorphic-fetch");
const mysql = require("mysql");
const fs = require('fs');

const router = express.Router();

const defaultOg = {
    url: "https://wellmate.io",
    title: "WellMate",
    description: "Health Assistant",
    image: "https://wellmate.io/images/hero.jpg"
};

const mailerEmail = "";
const secret_key = "";
const recaptcha_url = "";

/* GET home page. */
router.get("/", function (req, res, next) {
    res.render("index", {isRoot: true, title: "WellMate - Health Assistant", og: defaultOg});
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

router.post("/mail", function (req, res, next) {
    const token = req.body.token;
    const url = `${recaptcha_url}?secret=${secret_key}&response=${token}`;

    let body = req.body;
    let data = {
        name: body["message-name"],
        message: body["message-message"],
        email: body["message-email"],
        privacy: body["message-privacy"]
    };
    if (
        !validateInput(body["message-name"], 3, 255) ||
        !validateInput(body["message-message"], 2000) ||
        !validateEmail(body["message-email"]) ||
        body["message-privacy"] !== "on"
    ) {
        res.json({
            ...data,
            success: false,
            message: "Please fill in all the fields.",
        });
        return;
    }

    fetch(url, {
        method: "post",
    })
        .then((response) => response.json())
        .then((google_response) => {
            if (!google_response.success) {
                res.json({
                    ...data,
                    success: false,
                    message: "Incorrect CAPTCHA validation.",
                });
            } else {
                SendMessage(res, data);
            }
        })
        .catch((error) => {
            console.log("mail error", error);
            res.json({error})
        });
});


cron.schedule('0 10 * * 0', () => {
    console.log('Sending weekly email...');
    saveDataToCSV((err, attachmentPath) => {
      if (err) {
        console.error('Error saving data to CSV:', err);
        return;
      }
      sendEmailWithAttachment(attachmentPath);
    });
  });

 
function connectToDatabase(){ 
    return mysql.createConnection({
        host: 'mysql24.mydevil.net',
        user: 'm1237_wellmate',
        password: '5AV(w_N96nA+7Bt4wd?cMn9owIFl@Z',
        database: 'm1237_wellmate'
    });
}

function getMailerTransport(){
    return nodemailer.createTransport({
        pool: true,
        host: "mail24.mydevil.net",
        port: 465,
        secure: true, // use TLS
        auth: {
        },
    });
  }

function saveDataToCSV(callback) {
    const connection = mysql.createConnection({
    });

    const query = 'SELECT * FROM waitlist';
    connection.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching data from database:', err);
        callback(err);
        return;
      }
      // Tworzenie zawartości pliku CSV
      const csvData = results.map(entry => Object.values(entry).join(',')).join('\n');
      fs.writeFile('waitlist.csv', csvData, err => {
        if (err) {
          console.error('Error writing to CSV file:', err);
          callback(err);
          return;
        }
        console.log('Data saved to waitlist.csv');
        callback(null, 'waitlist.csv');
      });

      connection.end();
    });
  }

  function sendEmailWithAttachment(attachmentPath) {
    let transporter = getMailerTransport();
    const mailOptions = {
        from: "Strona wellmate.io" + "<" + mailerEmail + ">",
        to: "info@wellmate.io",
      subject: 'Weekly Waitlist Update',
      text: 'Please find attached the weekly waitlist update.',
      attachments: [{ path: attachmentPath }]
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });
  }



  
function SendMessage(res, body) {
    
    let transporter = getMailerTransport();

    // setup e-mail data with unicode symbols
    let mailOptions = {
        from: "Strona wellmate.io" + "<" + mailerEmail + ">",
        to: "info@wellmate.io",
        subject: "Wiadomość ze strony wellmate.io od użytkownika " + body.name + "<"+body.email+">",
        text:
            "Wiadomość wysłana za pośrednictwem strony wellmate.io od użytkownika " + body.email +
            body.message,
        html:
            '<div><h4>Message sent through the website <a href="https://wellmate.io" target="_blank">https://wellmate.io</a>:</h4><br>' +
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
                    from: "WellMate" + "<mailer@wellmate.io>",
                    to: body.email,
                    subject: "Confirmation of message sent from https://wellmate.io",
                    text:
                        "Thank you for your message sent through the contact form on https://wellmate.io. After reading the message, we will get in touch with you. WellMate Team",
                    html:
                        "<div>Thank you for your message sent through the contact form on our website. " +
                        '<a href="https://wellmate.io" target="_blank">https://wellmate.io</a>.</div>' +
                        "<div>After reading the message, we will get in touch with you.</div>" +
                        "<div><br>--</div>" +
                        "<div>WellMate Team<div>",
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


function SaveToWaitlist(res, body) {
    const connection = connectToDatabase();

    const record = {
        name: body.name,
        email: body.email,
        info: body.info
    };

    const sql = 'INSERT INTO waitlist (name, email, info) VALUES (?, ?, ?)';

    connection.query(sql, [record.name, record.email, record.info], (error, results) => {
        if (error) {
            res.json({
                success: false,
                message: error
            });
        } else {
            res.json({
                success: true,
                message: "The waitlist entry has been successfully added."
            });
        }

       connection.end();
    });

}

function validateInput(value, min, max) {
    return value.length >= min && value.length <= max;
}

function validateEmail(value) {
    let re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(value).toLowerCase());
}

module.exports = router;
