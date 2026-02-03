import * as userService from '../services/userService.js';
import { asyncHandler } from '../utils/helpers.js';

export const listUsers = asyncHandler(async (req, res) => {
    const users = await userService.listOrgUsers(req.organizationId);
    res.json(users);
});
