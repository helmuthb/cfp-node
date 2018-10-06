module.exports = user => ({
  subject: "Welcome at Speaker @ GDG",
  markdown: `Hi ${user.first_name}!

### Activate Account

Someone _(hopefully you!)_ has added an account with your email address
at our Speaker @ GDG platform.

To activate your account, please click here within the next 24 hours:
[<button>Activate Account</button>](https://speaker.at/activate/${
    user.activationKey
  })

You can also go to the following URL:
https://speaker.at/activate/${user.activationKey}

_If it was not you who has created the account then you don't have
to do anything and it will be automatically deleted._

--
Speaker @ GDG`
});