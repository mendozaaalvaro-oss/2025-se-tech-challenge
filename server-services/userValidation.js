function validateUserId(req, res, next) {
  const userId = req.auth.payload.sub;

  if (!userId) {
    return res.status(400).json({
      error: "Invalid token",
      message: "User ID not found in authentication token"
    });
  }

  req.userId = userId;
  next();
}

function validateEmailVerified(req, res, next) {
  const emailVerified = req.auth.payload["https://pizza42/email_verified"];

  if (!emailVerified) {
    return res.status(403).json({
      error: "Email not verified",
      code: "EMAIL_NOT_VERIFIED",
      message: "Please verify your email before placing an order"
    });
  }

  next();
}

module.exports = {
  validateUserId,
  validateEmailVerified
};
