import { register, login, getMe } from '../services/authService.js';

export const registerController = async (req, res, next) => {
  try {
    const { name, email, password, inviteCode, organizationName } = req.body;
    const result = await register({ name, email, password, inviteCode, organizationName });
    return res.status(201).json(result);
  } catch (err) {
    return next(err);
  }
};

export const loginController = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await login({ email, password });
    return res.json(result);
  } catch (err) {
    return next(err);
  }
};

export const meController = async (req, res, next) => {
  try {
    const user = await getMe(req.user.id);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
};


