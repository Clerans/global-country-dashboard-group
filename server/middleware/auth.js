// Validates API key and Google ID token (id_token) verification
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function verifyGoogleToken(idToken) {
  if (!idToken) return null;
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    return ticket.getPayload(); // contains sub (user id), email, name, etc.
  } catch (err) {
    return null;
  }
}

async function authMiddleware(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(403).json({ message: 'Invalid or missing API key' });
  }

  // Expect an "Authorization: Bearer <id_token>" header from client
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.split(' ')[1];
  const payload = await verifyGoogleToken(token);
  if (!payload) return res.status(401).json({ message: 'Invalid OAuth token' });

  // attach user info to request
  req.user = {
    id: payload.sub,
    email: payload.email,
    name: payload.name,
    picture: payload.picture
  };

  next();
}

module.exports = { authMiddleware, verifyGoogleToken };
