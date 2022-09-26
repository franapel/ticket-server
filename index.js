const express = require('express');
const cors = require('cors');
const {
  WebpayPlus,
  Options,
  IntegrationCommerceCodes,
  IntegrationApiKeys,
  Environment,
} = require('transbank-sdk');

const transaction = new WebpayPlus.Transaction(
  new Options(
    IntegrationCommerceCodes.WEBPAY_PLUS,
    IntegrationApiKeys.WEBPAY,
    Environment.Integration
  )
);

const app = express();

var corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:5173',
  ],
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders:
    'Range, Content-Type, Authorization, Content-Length, X-Requested-With',
};

app.use(cors(corsOptions));
app.use(express.json());

app.use(function (_, res, next) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Security-Policy', "frame-ancestors 'none'");
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  next();
});

app.get('/', (_, res) => {
  res.json({ message: 'Welcome to ticket application.' });
});

app.post('/transaction', async (req, res) => {
  const { buyOrder, sessionId, amount, returnUrl } = req.body;

  const createdTransaction = await transaction.create(
    buyOrder,
    sessionId,
    amount,
    returnUrl
  );

  res.status(200).json(createdTransaction);
});

app.get('/transaction', async (req, res) => {
  const { token_ws } = req.query;
  const response = await transaction.commit(token_ws);
  res
    .status(200)
    .redirect(
      `http://127.0.0.1:5173/transaction?status=${response.status}&amount=${response.amount}`
    );
});

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
