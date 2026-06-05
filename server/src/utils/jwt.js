import JsonWebToken from 'jsonwebtoken';
import 'dotenv/config';

console.log('JWT_SECRET loaded:', !!process.env.JWT_SECRET);

const generateAccessToken = user => {
    return JsonWebToken.sign(user, process.env.JWT_SECRET, {
        expiresIn: '8h'
    });
};

const generateRefreshToken = user => {
    return JsonWebToken.sign(user, process.env.JWT_REFRESH_SCREET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '86400s',
    });
};


const verifyRefreshToken = token => {
    try {
        return JsonWebToken.verify(token, process.env.JWT_REFRESH_SCREET);
    } catch (err) {
        return err;
    }
};

const parseJwt = token => {
    JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
};

const verifyAccessToken = token => {
    try {
        return JsonWebToken.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        console.error('JWT Verification Error:', err.message);
        return err;
    }
};

export {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
    parseJwt,
    verifyAccessToken
};
