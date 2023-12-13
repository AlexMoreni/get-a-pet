const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/Users");
//Helpers
const getToken = require("../helpers/get-token");
const createUserToken = require("../helpers/create-user-token");

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

      await createUserToken(newUser, req, res);
    } catch (err) {
      res.status(500).json({ message: error });
    }
  }

  static async login(req, res) {
    const { email, password } = req.body;

    if (!email) {
      return res.status(422).json({ message: "The email is obligatory" });
    }

    if (!password) {
      return res.status(422).json({ message: "The password is obligatory" });
    }

    //check if user exists
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(422).json({ message: "This user not already exists" });
    }

    //check if password match with db password
    const checkPassword = await bcrypt.compare(password, user.password);

    if (!checkPassword) {
      return res.status(422).json({ message: "password incorrect" });
    }

    await createUserToken(user, req, res);
  }

  static async checkUser(req, res) {
    let currentUser;

    if (req.headers.authorization) {
      const token = getToken(req);

      const decoded = jwt.verify(token, "secret");

      currentUser = await User.findById(decoded.id);

      currentUser.password = undefined;
    } else {
      currentUser = null;
    }

    res.status(200).send(currentUser);
  }
};
