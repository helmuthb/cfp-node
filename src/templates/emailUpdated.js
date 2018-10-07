module.exports = user => ({
  subject: "Updated E-Mail Address",
  markdown: `Hi ${user.first_name}!

### Activate Account

Someone _(hopefully you!)_ has added your email address to an account
at our Speaker @ GDG platform.

To activate your account, please click here within the next 24 hours:
[<button>Activate Account</button>](https://speaker.at/activate/${
    user.activation_key
  })

You can also go to the following URL:
https://speaker.at/activate/${user.activation_key}

_If it was not you who has updated the account then you don't have
to do anything and it will be automatically deleted._

--
Speaker @ GDG`
});
