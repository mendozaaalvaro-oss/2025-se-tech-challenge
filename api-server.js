const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const { auth, requiredScopes } = require("express-oauth2-jwt-bearer");
const authConfig = require("./src/auth_config.json");

const {
  sendVerificationEmail: sendVerificationEmailAPI,
  createPasswordResetTicket,
  getUserData,
  updateUserMetadata
} = require("./server-services/auth0API");

const {
  validateUserId,
  validateEmailVerified
} = require("./server-services/userValidation");

const app = express();
app.use(express.json());

const port = new URL(authConfig.serverAPI).port || 3001;
const appOrigin = authConfig.appOrigin;

app.use(morgan("dev"));
app.use(helmet());
app.use(cors({
  origin: appOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

const checkJwt = auth({
  audience: authConfig.audience,
  issuerBaseURL: `https://${authConfig.domain}/`,
  algorithms: ["RS256"],
});

async function getOrders(userId) {
  const userData = await getUserData(userId);
  return userData.app_metadata?.orders || [];
}

async function createOrder(userId, items, total) {
  const existingOrders = await getOrders(userId);

  const filteredItems = items.map(item => ({
    id: item.id,
    title: item.title,
    price: item.price,
    quantity: item.quantity
  }));

  const newOrder = {
    orderNumber: existingOrders.length + 1,
    items: filteredItems,
    total: total,
    status: "pending",
    createdAt: new Date().toISOString()
  };

  const updatedOrders = [...existingOrders, newOrder];
  await updateUserMetadata(userId, { orders: updatedOrders });

  return newOrder;
}

app.get("/api/orders", checkJwt, validateUserId, async (req, res) => {
  const orders = await getOrders(req.userId);
  res.json({ orders });
});

app.post("/api/orders", checkJwt, requiredScopes("create:orders"), validateUserId, validateEmailVerified, async (req, res) => {
  const { items, total } = req.body;
  const newOrder = await createOrder(req.userId, items, total);
  res.status(201).json({ message: "Order created", order: newOrder });
});

app.post("/api/send-verification-email", checkJwt, validateUserId, async (req, res) => {
  const { client_id } = req.body;
  await sendVerificationEmailAPI(req.userId, client_id);
  res.json({ message: "Email sent" });
});

app.post("/api/reset-password", checkJwt, validateUserId, async (req, res) => {
  const result = await createPasswordResetTicket(req.userId, authConfig.clientId);
  res.json({ message: result.message, email: result.email });
});

app.listen(port, () => {});
