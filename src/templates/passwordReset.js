module.exports = user => ({
  subject: "Speaker @ GDG - Password Reset",
  markdown: `
## Password Reset

Hi ${user.first_name},

Someone (hopefully you) has requested a reset of your password.

If you have forgotten your password, you can set a new one here:
[<button>Reset Password</button>](https://speaker.at/passwordreset/${
    user.reset_key
  })

You can also go to the following URL:
https://speaker.at/passwordreset/${user.reset_key}

This link expires in the next 24 hours.

_If it was not you who has sent the password reset reqtest then you don't have
to do anything and it will be automatically deleted._

--
Speaker @ GDG`
});
