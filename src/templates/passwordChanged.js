module.exports = user => ({
  subject: "Speaker @ GDG - Password Changed",
  markdown: `
## Password Changed

Hi ${user.first_name},

Your password has been updated just now.`
});
