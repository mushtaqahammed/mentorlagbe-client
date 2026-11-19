import { betterAuth } from "better-auth"
import { MongoClient } from "mongodb"
import { mongodbAdapter } from "@better-auth/mongo-adapter"

export const mongoClient = new MongoClient(
  process.env.BETTER_AUTH_DB_URI as string
)
export const database = mongoClient.db("mentor_lagbe")

export const auth = betterAuth({
  database: mongodbAdapter(database, {
    client: mongoClient,
  }),

  emailAndPassword: {
    enabled: true,
  },

  user: {
    additionalFields: {
      role: {
        // Better Auth field types are primitives: "string" here.
        // The allowed values (Student / Tutor / Admin) are enforced by the
        // sign-up form's select options.
        type: "string",
        // "input: true" allows the sign-up form to send this field.
        input: true,
        defaultValue: "Student",
      },
      // Subscription fields are server-owned. They are written only after
      // Stripe has confirmed a paid, active subscription.
      plan: {
        type: "string",
        input: false,
        defaultValue: "free",
      },
      subscriptionStatus: {
        type: "string",
        input: false,
        defaultValue: "none",
      },
      proPlanId: {
        type: "string",
        input: false,
      },
      stripeSubscriptionId: {
        type: "string",
        input: false,
      },
      stripeCustomerId: {
        type: "string",
        input: false,
      },
      proActivatedAt: {
        type: "string",
        input: false,
      },
      subscriptionStartDate: {
        type: "string",
        input: false,
      },
      subscriptionEndDate: {
        type: "string",
        input: false,
      },
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
})
