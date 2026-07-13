import bcrypt from 'bcryptjs';
import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { RowDataPacket } from 'mysql2';
import pool from '../db/pool';
import { getJwtSecret } from '../middleware/auth.middleware';

interface AdminUserRow extends RowDataPacket {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  isActive: number;
}

export const login: RequestHandler = async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (!email || !password) {
      res.status(400).json({ message: 'Correo y contrasena son obligatorios.' });
      return;
    }

    const [rows] = await pool.execute<AdminUserRow[]>(
      `SELECT
        id,
        name,
        email,
        password_hash AS passwordHash,
        is_active AS isActive
       FROM admin_users
       WHERE email = :email
       LIMIT 1`,
      { email },
    );

    const user = rows[0];

    if (!user || user.isActive !== 1) {
      res.status(401).json({ message: 'Credenciales invalidas.' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      res.status(401).json({ message: 'Credenciales invalidas.' });
      return;
    }

    const publicUser = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    const token = jwt.sign(publicUser, getJwtSecret(), { expiresIn: '8h' });

    res.json({
      token,
      user: publicUser,
    });
  } catch (error) {
    next(error);
  }
};

export const me: RequestHandler = (req, res) => {
  res.json({ user: req.user });
};
