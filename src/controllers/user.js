import { User } from "../models";
import * as Yup from "yup";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

class UserControllers {
  async login(req, res) {
    try {
      const schema = Yup.object().shape({
        email: Yup.string().email("Email is invalid.").required("Email is mandatory."),
        password: Yup.string().required("Password is mandatory."),
      });
      await schema.validate(req.body);

      const user = await User.findOne({ where: { email: req.body.email } });
      if (!user) return res.status(401).json({ error: "User not found." });

      const checkPassword = await bcrypt.compare(req.body.password, user.password_hash);
      if (!checkPassword) return res.status(401).json({ error: "Email or password do not match." });

      console.log({ hash: process.env.JWT_HASH });
      const token = jwt.sign({ id: user.id }, process.env.JWT_HASH, {
        expiresIn: 2592000, //30 dias
      });
      const { id, name, email, avatar_url, createdAt } = user;
      return res.json({
        user: [id, name, email, avatar_url, createdAt, token],
      });
    } catch (error) {
      return res.status(400).json({ error: error?.message });
    }
  }
  async create(req, res) {
    try {
      const schema = Yup.object().shape({
        name: Yup.string()
          .required("Name is mandatory.")
          .min(3, "Name must be at least 3 characters."),
        email: Yup.string().email("Email is invalid.").required("Email is mandatory."),
        password: Yup.string()
          .required("Password is mandatory.")
          .min(6, "Password must be at least 6 characters."),
      });

      await schema.validate(req.body);
      const existedUser = await User.findOne({ where: { email: req.body.email } });
      if (existedUser) return res.status(404).json({ error: "User already exists." });

      const hashPassword = await bcrypt.hash(req.body.password, 8);
      const user = new User({
        ...req.body,
        password: "",
        password_hash: hashPassword,
      });

      await user.save();

      return res.json({ user });
    } catch (error) {
      return res.status(400).json({ error: error?.message });
    }
  }
}

export default new UserControllers();
