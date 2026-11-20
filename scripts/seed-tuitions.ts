/**
 * Seed realistic, approved tuition posts into the existing MongoDB database.
 *
 * Usage (from the client folder):
 *   npm run seed                # insert any missing posts (safe to re-run)
 *   npm run seed -- --dry-run   # preview without writing
 *
 * The script is idempotent: every post has a deterministic ObjectId derived
 * from its slug, so re-running it upserts nothing new and never overwrites an
 * existing document. Only verified Tutor accounts already present in the
 * `user` collection are used as owners — no fake users or dangling ids.
 */
import { createHash } from "node:crypto"
import { MongoClient, ObjectId, type Db } from "mongodb"

// Node 24 can load .env directly; fall back to a real environment when the
// file is absent (for example in CI or a container).
try {
  process.loadEnvFile(".env")
} catch {
  // Environment variables may already be provided by the runtime.
}

const DB_NAME = "mentor_lagbe"
const TUITION_COLLECTION = "tuition"
const USER_COLLECTION = "user"
const SEED_NAMESPACE = "mentorlagbe:seed-tuition:"

type SeedTuition = {
  slug: string
  title: string
  subject: string
  classLevel: string
  mode: "Online" | "Offline" | "Both"
  location: string
  monthlyFee: number
  daysPerWeek: number
  description: string
}

/**
 * Descriptions spell out the preferred tutor profile and the weekly schedule
 * because the current schema has no dedicated columns for those details.
 */
const SEED_TUITIONS: SeedTuition[] = [
  {
    slug: "class-9-algebra-geometry",
    title: "Class 9 Mathematics — Algebra & Geometry specialist",
    subject: "Mathematics",
    classLevel: "Class 1–10",
    mode: "Online",
    location: "Dhanmondi, Dhaka",
    monthlyFee: 5000,
    daysPerWeek: 3,
    description:
      "Looking for a patient Mathematics tutor for a Class 9 student following the NCTB curriculum. We need help with algebra, geometry and trigonometry, plus guided practice for term exams. Preferred tutor: BSc/MSc in Mathematics or a final-year engineering student with at least 2 years of tutoring experience. Online classes on Sunday, Tuesday and Thursday evenings, 6:00–7:30 PM.",
  },
  {
    slug: "hsc-physics-mechanics",
    title: "HSC Physics — Mechanics and Electricity",
    subject: "Physics",
    classLevel: "HSC",
    mode: "Both",
    location: "Uttara, Dhaka",
    monthlyFee: 6500,
    daysPerWeek: 4,
    description:
      "HSC science student needs structured Physics support, especially mechanics, waves and electricity. The tutor should explain concepts with real-life examples and set weekly practice problems from past-year question papers. Preferred tutor: BSc in Physics/EEE with HSC-level teaching experience. Four 90-minute sessions a week, online with occasional home visits in Uttara Sector 7.",
  },
  {
    slug: "hsc-chemistry-organic",
    title: "HSC Chemistry — Organic chemistry made simple",
    subject: "Chemistry",
    classLevel: "HSC",
    mode: "Online",
    location: "Mirpur, Dhaka",
    monthlyFee: 5500,
    daysPerWeek: 3,
    description:
      "Seeking an experienced Chemistry tutor for an HSC student who finds organic reactions confusing. The focus will be reaction mechanisms, hydrocarbons and practical-oriented MCQ practice. Preferred tutor: MSc in Chemistry or a medical graduate who has taught HSC batches before. Online sessions on Monday, Wednesday and Friday, 5:00–6:30 PM.",
  },
  {
    slug: "ielts-academic-english",
    title: "Academic English & IELTS speaking preparation",
    subject: "English",
    classLevel: "Admission",
    mode: "Online",
    location: "Banani, Dhaka",
    monthlyFee: 6000,
    daysPerWeek: 2,
    description:
      "University applicant preparing for IELTS needs help with academic writing, vocabulary and confident speaking. Classes should include timed essay practice and mock speaking interviews with useful feedback. Preferred tutor: IELTS 7.5+ or an English literature graduate with teaching experience. Two online sessions per week, 7:00–8:30 PM.",
  },
  {
    slug: "class-10-biology",
    title: "Class 10 Biology — Digestive, circulatory & plant systems",
    subject: "Biology",
    classLevel: "Class 1–10",
    mode: "Offline",
    location: "Mohammadpur, Dhaka",
    monthlyFee: 4500,
    daysPerWeek: 3,
    description:
      "A Class 10 student needs clear, diagram-based Biology lessons covering human physiology and plant life. The tutor should use model diagrams and short quizzes to prepare for the SSC exam. Preferred tutor: BSc in Zoology/Botany or a biology teacher with SSC experience. Home classes in Mohammadpur on Saturday, Monday and Wednesday afternoons.",
  },
  {
    slug: "ict-practical-coding",
    title: "ICT for SSC — Practicals and Python basics",
    subject: "ICT",
    classLevel: "SSC",
    mode: "Both",
    location: "Bashundhara, Dhaka",
    monthlyFee: 5000,
    daysPerWeek: 2,
    description:
      "SSC student looking for an ICT tutor who can make practical problems easy — HTML, basic programming and spreadsheet work — along with a gentle introduction to Python. Preferred tutor: CSE student or graduate who enjoys teaching beginners and can share a laptop-friendly practice setup. Two sessions a week, Tuesday and Friday, 4:30–6:00 PM.",
  },
  {
    slug: "bcom-accounting-fundamentals",
    title: "Accounting fundamentals for BCom first year",
    subject: "Accounting",
    classLevel: "University",
    mode: "Online",
    location: "Farmgate, Dhaka",
    monthlyFee: 5500,
    daysPerWeek: 2,
    description:
      "First-year BCom student needs help with journal entries, ledgers, trial balance and basic financial statements. The tutor should walk through solved examples and explain double-entry rules step by step. Preferred tutor: CA student, CPA or an accounting lecturer with university-level experience. Online classes on Sunday and Thursday, 7:00–8:30 PM.",
  },
  {
    slug: "hsc-higher-mathematics",
    title: "HSC Higher Mathematics — Calculus & coordinate geometry",
    subject: "Higher Mathematics",
    classLevel: "HSC",
    mode: "Online",
    location: "Gulshan, Dhaka",
    monthlyFee: 7000,
    daysPerWeek: 4,
    description:
      "A mathematics-loving HSC student wants advanced coaching in differentiation, integration, vectors and coordinate geometry for board and admission exams. Preferred tutor: MSc in Mathematics or a university lecturer with a strong track record in higher mathematics. Four online sessions weekly, 6:00–7:30 PM, with problem sets after every class.",
  },
  {
    slug: "class-3-bangla-language",
    title: "Class 3 Bangla — Reading, writing and grammar",
    subject: "Bangla",
    classLevel: "Class 1–10",
    mode: "Offline",
    location: "Kalihati, Tangail",
    monthlyFee: 3000,
    daysPerWeek: 3,
    description:
      "A young learner needs friendly Bangla lessons to improve reading fluency, handwriting and grammar. The tutor should use stories and simple writing tasks to build confidence. Preferred tutor: a patient primary-school teacher or a university student with child-friendly teaching experience. Home classes on Tuesday, Thursday and Saturday mornings.",
  },
  {
    slug: "hsc-economics-micro-macro",
    title: "HSC Economics — Micro, macro and diagrams",
    subject: "Economics",
    classLevel: "HSC",
    mode: "Online",
    location: "Chandpur",
    monthlyFee: 4000,
    daysPerWeek: 3,
    description:
      "HSC commerce student seeking clear explanations of demand-supply, market structures, national income and monetary policy with neatly drawn diagrams. Preferred tutor: Economics graduate or a college teacher familiar with the NCTB HSC syllabus. Online sessions on Monday, Wednesday and Friday, 5:00–6:30 PM.",
  },
  {
    slug: "class-8-general-science",
    title: "Class 8 General Science — Concepts made fun",
    subject: "General Science",
    classLevel: "Class 1–10",
    mode: "Both",
    location: "Rangpur City",
    monthlyFee: 3500,
    daysPerWeek: 2,
    description:
      "A curious Class 8 student needs help connecting physics, chemistry and biology concepts to everyday life, with simple experiments and weekly recap quizzes. Preferred tutor: science graduate or a secondary-school teacher who can keep lessons interactive. Two sessions a week, Wednesday and Saturday, 4:00–5:30 PM (online or at home in Rangpur).",
  },
  {
    slug: "university-statistics-support",
    title: "University Statistics — Probability and inference",
    subject: "Statistics",
    classLevel: "University",
    mode: "Online",
    location: "Sylhet City",
    monthlyFee: 6000,
    daysPerWeek: 2,
    description:
      "Undergraduate student needs guided practice in probability distributions, hypothesis testing and regression, including step-by-step solutions and software-based examples. Preferred tutor: MSc in Statistics or a university instructor comfortable with R/Excel. Two online sessions per week on Sunday and Friday, 7:00–8:30 PM.",
  },
]

function deterministicId(slug: string): ObjectId {
  const hash = createHash("sha256")
    .update(SEED_NAMESPACE + slug)
    .digest("hex")
  return new ObjectId(hash.slice(0, 24))
}

function parseArgs() {
  return {
    dryRun: process.argv.includes("--dry-run"),
    quiet: process.argv.includes("--quiet"),
  }
}

async function main() {
  const uri = process.env.BETTER_AUTH_DB_URI
  if (!uri) {
    throw new Error(
      "BETTER_AUTH_DB_URI is not set. Add it to .env (or export it) before running the seed script."
    )
  }

  const { dryRun, quiet } = parseArgs()
  const client = new MongoClient(uri)

  try {
    await client.connect()
    const db: Db = client.db(DB_NAME)

    // Only real, verified tutor accounts from the auth database may own posts.
    const tutors = await db
      .collection(USER_COLLECTION)
      .find({ role: /^tutor$/i })
      .project({ name: 1, email: 1 })
      .toArray()

    if (tutors.length === 0) {
      throw new Error(
        "No Tutor accounts found in the user collection. Sign up a tutor first so seeded posts have a valid owner."
      )
    }

    const log = (message: string) => {
      if (!quiet) console.log(message)
    }

    log(
      `Found ${tutors.length} tutor account(s) in "${DB_NAME}".${USER_COLLECTION}.`
    )
    log(
      dryRun ? "Dry run — no documents will be written." : "Seeding tuitions..."
    )

    let inserted = 0
    let skipped = 0

    for (const [index, item] of SEED_TUITIONS.entries()) {
      const tutor = tutors[index % tutors.length]!
      const _id = deterministicId(item.slug)
      const now = new Date()
      // Stagger creation dates so "newest first" listings look natural.
      now.setDate(now.getDate() - (SEED_TUITIONS.length - index))

      const document = {
        _id,
        tutorId: String(tutor._id),
        tutorName: String(tutor.name ?? "Tutor"),
        tutorEmail: String(tutor.email ?? ""),
        title: item.title,
        subject: item.subject,
        classLevel: item.classLevel,
        mode: item.mode,
        location: item.location,
        monthlyFee: item.monthlyFee,
        daysPerWeek: item.daysPerWeek,
        description: item.description,
        bannerImage: "",
        // Title case is required by the backend's exact approval-status checks.
        approvalStatus: "Approved",
        status: "Active",
        createdAt: now,
        updatedAt: now,
      }

      if (dryRun) {
        log(`  [dry-run] ${item.title} → tutor ${document.tutorName}`)
        continue
      }

      const result = await db
        .collection(TUITION_COLLECTION)
        .updateOne({ _id }, { $setOnInsert: document }, { upsert: true })

      if (result.upsertedCount > 0) inserted += 1
      else skipped += 1
    }

    const approved = await db
      .collection(TUITION_COLLECTION)
      .countDocuments({ approvalStatus: /^approved$/i, status: "Active" })

    log(
      dryRun
        ? `Dry run complete: ${SEED_TUITIONS.length} post(s) previewed.`
        : `Done. Inserted ${inserted}, already present ${skipped}. ${approved} approved & active tuition(s) now in the database.`
    )
  } finally {
    await client.close()
  }
}

main().catch((error: unknown) => {
  console.error(
    "Seeding failed:",
    error instanceof Error ? error.message : "Unknown error"
  )
  process.exitCode = 1
})
