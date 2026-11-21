import { betterAuth } from "better-auth"
import { MongoClient } from "mongodb"
import { mongodbAdapter } from "@better-auth/mongo-adapter"

const mongoClient = new MongoClient(
  process.env.BETTER_AUTH_DB_URI as string
)
// Kept private to the auth adapter; application data goes through the Express API.
const database = mongoClient.db("mentor_lagbe")

export const auth = betterAuth({
  database: mongodbAdapter(database, {
    client: mongoClient,
  }),

  emailAndPassword: {
    enabled: true,
  },

  // Keeps a short-lived, signed copy of the session in a cookie so a browser
  // refresh does not need a database lookup before the Navbar can render.
  // Endpoints that need authoritative user data already opt out with
  // `disableCookieCache: true`.
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
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
      // Editable contact detail. Declaring it here is required for Better Auth
      // to persist it; MongoDB needs no migration for the new optional key.
      phone: {
        type: "string",
        input: true,
        required: false,
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

  // Public sign-up may only create Student or Tutor accounts. The role sent by
  // the client is sanitised here because `input: true` would otherwise let
  // anyone register as an Admin and reach the /api/admin/* routes. Admin
  // accounts must be promoted by an existing admin (or directly in the DB).
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const requested =
            typeof user.role === "string" ? user.role.trim().toLowerCase() : ""
          const role = requested === "tutor" ? "Tutor" : "Student"

          return { data: { ...user, role } }
        },
      },
      update: {
        // The catch-all /api/auth route exposes Better Auth's updateUser
        // endpoint. `role` has input: true for sign-up, so without this guard
        // any signed-in user could promote themselves to Admin. Subscription
        // fields are server-owned as well and must never be client-writable.
        before: async (user) => {
          const protectedFields = [
            "role",
            "plan",
            "subscriptionStatus",
            "proPlanId",
            "stripeSubscriptionId",
            "stripeCustomerId",
            "proActivatedAt",
            "subscriptionStartDate",
            "subscriptionEndDate",
          ]

          if (protectedFields.some((field) => field in user)) return false
        },
      },
    },
  },

  // Only register Google when both credentials are present. Registering it
  // with undefined values makes Better Auth warn on every build and leaves a
  // sign-in button that can never work.
  ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? {
        socialProviders: {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        },
      }
    : {}),
})
