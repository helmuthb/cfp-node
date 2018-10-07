const nodemailer = require("nodemailer");
const marked = require("marked");
const config = require("./config");

const transporter = nodemailer.createTransport(config.mail);
if (config.isProduction) {
  transporter.verify(function(error, success) {
    if (error) {
      return console.error("SMTP ERROR", error);
    }
    console.log("SMTP OK");
  });
}

module.exports = (recipient, template, options) => {
  const fullName = `${recipient.first_name} ${recipient.last_name}`;
  const to = `"${fullName}" <${recipient.email}>`;
  const { subject, markdown } = template(recipient, options);

  if (config.isProduction) {
    const html = marked(markdown);
    const text = markdown;
    const mail = {
      to,
      from: `"${config.supportEmailName}" <${config.supportEmailAddress}>`,
      subject,
      text,
      html
    };
    transporter.sendMail(mail, (error, info) => {
      if (error) {
        return console.log("SMTP ERROR", error);
      }
      console.log("SMTP SENT", to, subject);
    });
  } else {
    console.log("MAIL TO:", to);
    console.log("SUBJECT:", subject);
    console.log(markdown);
  }
};
