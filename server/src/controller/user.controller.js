import {userLogin} from '../validation/user.validation.js';
import prisma from '../utils/prisma.js';
import {compare, encrypt} from '../utils/bcrypt.js';
import {generateAccessToken} from '../utils/jwt.js';

export const doLogin = async (req, res) => {
    const {error, value} = userLogin(req.body);
    if (error) {
        return res.status(400).json({
            message: String(error.message)
        });
    }

    try {
        const user = await prisma.users.findUnique({
            where: {
                username: value.username
            },
            include: {
                role: {
                    include: {
                        permissions: {
                            include: {
                                permission: true
                            }
                        }
                    }
                }
            }
        });

        if (user) {
            const isMatch = compare(value.password, user.password);
            
            if (isMatch) {
                const accessToken = generateAccessToken({id: user.id});
                const permissions = user.role.permissions.map((rp) => rp.permission.name);
                return res.status(200).json({
                    message: 'Login Success',
                    user: {
                        id: user.id,
                        username: user.username,
                        role: user.role.name,
                        permissions
                    },
                    accessToken
                });
            }
        }

        return res.status(401).json({
            message: 'Username atau password salah.',
        });
    } catch (err) {
        console.error(`Login error: ${err}`);
        return res.status(500).json({
            message: 'Internal server error.',
            result: null
        });
    }
};

export const getMe = async (req, res) => {
    try {
        res.status(200).json({
            user: req.user
        });
    } catch (err) {
        res.status(500).json({
            message: 'Internal server error'
        });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.users.findMany({
            include: {
                role: true
            }
        });
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const createUser = async (req, res) => {
    const { username, password, roleId } = req.body;
    try {
        const hashedPassword = await encrypt(password);
        const newUser = await prisma.users.create({
            data: {
                username,
                password: hashedPassword,
                roleId
            },
            include: {
                role: true
            }
        });
        res.status(201).json(newUser);
    } catch (err) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.users.delete({ where: { id } });
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getAllRoles = async (req, res) => {
    try {
        const roles = await prisma.role.findMany();
        res.status(200).json(roles);
    } catch (err) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
