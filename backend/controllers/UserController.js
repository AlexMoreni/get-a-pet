const bcrypt = require("bcrypt");
const User = require("../models/Users");

module.exports = class UserController {
  static async register(req, res) {
    const { name, email, phone, password, confirmPassword } = req.body;

    if (!name) {
      return res.status(422).json({ message: "The name is obligatory" });
    }

    if (!email) {
      return res.status(422).json({ message: "The email is obligatory" });
    }

    if (!phone) {
      return res.status(422).json({ message: "The phone is obligatory" });
    }

    if (!password) {
      return res.status(422).json({ message: "The password is obligatory" });
    }

    if (!confirmPassword) {
      return res
        .status(422)
        .json({ message: "The confirm password is obligatory" });
    }

    if (password !== confirmPassword) {
      return res
        .status(422)
        .json({ message: "The password and confirm password not is equals" });
    }

    //check if user exists
    const userExists = await User.findOne({ email: email });

    if (userExists) {
      return res.status(422).json({ message: "This user already exists" });
    }

    //create password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    //create user
    const user = new User({
      name,
      email,
      phone,
      password: passwordHash,
    });

    try {
      const newUser = await user.save();
      return res.status(201).json({ message: "User created", newUser });
    } catch (err) {
      res.status(500).json({ message: error });
    }
  }
};
