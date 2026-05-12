import {
  GapSeverity,
  GapStatus,
  PlanStatus,
  Prisma,
  PrismaClient,
  StudentStatus,
  UserRole,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// This seed is safe to run against any environment, including production.
// - The demo teacher is upserted by email, so the password is always refreshed
//   to the documented one even if it was changed manually.
// - Demo students are upserted by email and re-attached to the demo teacher.
// - Dependent rows (gaps, plans, notes) are only created the first time a demo
//   student has none. We never `deleteMany` across whole tables, so real
//   teachers and their data are never touched.

const DEMO_TEACHER_EMAIL = "priya.sharma@interveneai.test";
const DEMO_TEACHER_PASSWORD = "demo1234";
const DEMO_TEACHER_NAME = "Ms. Priya Sharma";

type DemoStudent = {
  email: string;
  data: Omit<Prisma.StudentCreateInput, "teacher" | "email">;
  learningGaps: Prisma.LearningGapCreateWithoutStudentInput[];
  interventionPlan?: Omit<
    Prisma.InterventionPlanCreateWithoutStudentInput,
    "createdBy"
  >;
  progressNotes: Array<{ note: string; attachToPlan: boolean }>;
};

const DEMO_STUDENTS: DemoStudent[] = [
  {
    email: "aanya.verma@school.test",
    data: {
      firstName: "Aanya",
      lastName: "Verma",
      grade: "Grade 5",
      status: StudentStatus.NEEDS_SUPPORT,
      notes:
        "Strong reader, but struggles to translate word problems into equations.",
    },
    learningGaps: [
      {
        title: "Multi-step word problems",
        subject: "Math",
        severity: GapSeverity.HIGH,
        status: GapStatus.IN_PROGRESS,
        description:
          "Has trouble identifying the operation order in two-step word problems involving money and time.",
      },
      {
        title: "Fraction equivalence",
        subject: "Math",
        severity: GapSeverity.MEDIUM,
        status: GapStatus.OPEN,
        description:
          "Confuses equivalent fractions when denominators are not common multiples.",
      },
    ],
    interventionPlan: {
      title: "Word-problem decoding bootcamp",
      strategy:
        "Twice-weekly 20-minute small-group sessions using the CUBES strategy: Circle key numbers, Underline the question, Box action words, Evaluate, Solve. Pair with weekly exit tickets.",
      startDate: new Date("2026-04-13"),
      endDate: new Date("2026-05-25"),
      status: PlanStatus.ACTIVE,
    },
    progressNotes: [
      {
        note: "Session 3 of CUBES: Aanya correctly identified operations in 4/5 problems independently. Still needs prompting on two-step time problems.",
        attachToPlan: true,
      },
    ],
  },
  {
    email: "rohan.iyer@school.test",
    data: {
      firstName: "Rohan",
      lastName: "Iyer",
      grade: "Grade 6",
      status: StudentStatus.IMPROVING,
      notes: "Recently moved schools; gaining confidence in group work.",
    },
    learningGaps: [
      {
        title: "Reading comprehension – inference",
        subject: "English",
        severity: GapSeverity.MEDIUM,
        status: GapStatus.IN_PROGRESS,
        description:
          "Can recall facts from a passage but rarely makes inferences without prompting.",
      },
    ],
    progressNotes: [
      {
        note: "Parent meeting note: Rohan's family confirmed nightly reading routine; no formal plan yet, monitoring for two more weeks.",
        attachToPlan: false,
      },
    ],
  },
  {
    email: "meera.patel@school.test",
    data: {
      firstName: "Meera",
      lastName: "Patel",
      grade: "Grade 4",
      status: StudentStatus.ACTIVE,
      notes: "Enjoys science labs; needs more challenge in writing tasks.",
    },
    learningGaps: [
      {
        title: "Paragraph structure",
        subject: "English",
        severity: GapSeverity.LOW,
        status: GapStatus.OPEN,
        description:
          "Writes strong opening sentences but paragraphs lack clear supporting evidence.",
      },
      {
        title: "Place value to 10,000",
        subject: "Math",
        severity: GapSeverity.LOW,
        status: GapStatus.RESOLVED,
        description:
          "Earlier confusion with hundreds/thousands columns; resolved after manipulatives unit.",
      },
    ],
    progressNotes: [],
  },
  {
    email: "kabir.singh@school.test",
    data: {
      firstName: "Kabir",
      lastName: "Singh",
      grade: "Grade 5",
      status: StudentStatus.NEEDS_SUPPORT,
      notes:
        "Frequent absences last term; rebuilding routines around homework completion.",
    },
    learningGaps: [
      {
        title: "Decoding multi-syllable words",
        subject: "English",
        severity: GapSeverity.HIGH,
        status: GapStatus.OPEN,
        description:
          "Skips or guesses unfamiliar 3+ syllable words during oral reading.",
      },
      {
        title: "Number line subtraction",
        subject: "Math",
        severity: GapSeverity.MEDIUM,
        status: GapStatus.IN_PROGRESS,
        description:
          "Counts forward instead of backward when subtracting across tens.",
      },
    ],
    interventionPlan: {
      title: "Phonics rebuild – multi-syllable words",
      strategy:
        "Daily 10-minute 1:1 phonics warm-up using syllable-division (VC/CV) drills, followed by paired reading of grade-level decodables. Re-assess fluency every two weeks.",
      startDate: new Date("2026-04-20"),
      endDate: null,
      status: PlanStatus.ACTIVE,
    },
    progressNotes: [
      {
        note: "Week 1 phonics check-in: Kabir read 18/25 multi-syllable target words accurately, up from 9/25 baseline. Confidence noticeably improved.",
        attachToPlan: true,
      },
    ],
  },
];

async function main() {
  console.log(`Seeding demo teacher (${DEMO_TEACHER_EMAIL})…`);

  const hashedPassword = await bcrypt.hash(DEMO_TEACHER_PASSWORD, 10);

  const teacher = await prisma.user.upsert({
    where: { email: DEMO_TEACHER_EMAIL },
    update: {
      name: DEMO_TEACHER_NAME,
      password: hashedPassword,
      role: UserRole.TEACHER,
    },
    create: {
      name: DEMO_TEACHER_NAME,
      email: DEMO_TEACHER_EMAIL,
      password: hashedPassword,
      role: UserRole.TEACHER,
    },
  });

  let studentsTouched = 0;
  let gapsCreated = 0;
  let plansCreated = 0;
  let notesCreated = 0;

  for (const demo of DEMO_STUDENTS) {
    const student = await prisma.student.upsert({
      where: { email: demo.email },
      update: {
        ...demo.data,
        teacher: { connect: { id: teacher.id } },
      },
      create: {
        ...demo.data,
        email: demo.email,
        teacher: { connect: { id: teacher.id } },
      },
    });
    studentsTouched += 1;

    // Only seed dependent rows the first time. Subsequent runs leave the
    // demo data alone so reviewers can edit/delete it without it reappearing.
    const existingGapCount = await prisma.learningGap.count({
      where: { studentId: student.id },
    });
    if (existingGapCount === 0 && demo.learningGaps.length > 0) {
      await prisma.learningGap.createMany({
        data: demo.learningGaps.map((gap) => ({
          ...gap,
          studentId: student.id,
        })),
      });
      gapsCreated += demo.learningGaps.length;
    }

    let planId: string | null = null;
    if (demo.interventionPlan) {
      const existingPlan = await prisma.interventionPlan.findFirst({
        where: { studentId: student.id, title: demo.interventionPlan.title },
      });
      if (existingPlan) {
        planId = existingPlan.id;
      } else {
        const created = await prisma.interventionPlan.create({
          data: {
            ...demo.interventionPlan,
            student: { connect: { id: student.id } },
            createdBy: { connect: { id: teacher.id } },
          },
        });
        planId = created.id;
        plansCreated += 1;
      }
    }

    const existingNoteCount = await prisma.progressNote.count({
      where: { studentId: student.id },
    });
    if (existingNoteCount === 0 && demo.progressNotes.length > 0) {
      await prisma.progressNote.createMany({
        data: demo.progressNotes.map((note) => ({
          note: note.note,
          studentId: student.id,
          interventionPlanId: note.attachToPlan ? planId : null,
        })),
      });
      notesCreated += demo.progressNotes.length;
    }
  }

  console.log("Seed complete:");
  console.log(`  Teacher: ${teacher.email} (password: ${DEMO_TEACHER_PASSWORD})`);
  console.log(`  Students upserted: ${studentsTouched}`);
  console.log(`  Learning gaps created: ${gapsCreated}`);
  console.log(`  Intervention plans created: ${plansCreated}`);
  console.log(`  Progress notes created: ${notesCreated}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
