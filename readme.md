import { User } from "../models";
import \* as Yup from "yup";
import bcrypt from "bcrypt";

class UserControllers {
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
password_hash: "",
reset_password_token_sent_at: new Date(),
avatar_url: "teste_url",
});

      await schema.validate(req.body);

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