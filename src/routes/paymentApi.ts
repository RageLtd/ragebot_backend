import { Router } from "express";
import { Get, Database } from "faunadb";
import { faunaClient } from "..";
import { Database as iDatabase } from "../channelEvents";

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const paymentsApiRouter = Router();

paymentsApiRouter.get("/:userName", async (req, res) => {
  const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);
  const { userName } = req.params;

  const {
    data: { isPremium },
  } = (await faunaClient.query(
    Get(Database(userName.toLowerCase()))
  )) as iDatabase;

  if (isPremium) {
    res.send({ isPremium: true });
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: 1500,
    currency: "usd",
    automatic_payment_methods: { enabled: true },
  });

  console.log(paymentIntent);

  res.send({ stripeSecret: paymentIntent.client_secret, isPremium });
});

export default paymentsApiRouter;
