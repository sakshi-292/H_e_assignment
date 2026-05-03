import {
  GapSeverity,
  GapStatus,
  PlanStatus,
  PrismaClient,
  StudentStatus,
  UserRole,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEMO_TEACHER_PASSWORD = "demo1234";

async function main() {
  console.log("Seeding database…");

  // Reset in dependency-safe order so the script is re-runnable locally.
  await prisma.progressNote.deleteMany();
  await prisma.interventionPlan.deleteMany();
  await prisma.learningGap.deleteMany();
  await prisma.student.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash(DEMO_TEACHER_PASSWORD, 10);

  const teacher = await prisma.user.create({
    data: {
      name: "Ms. Priya Sharma",
      email: "priya.sharma@interveneai.test",
      password: hashedPassword,
      role: UserRole.TEACHER,
    },
  });

  const aanya = await prisma.student.create({
    data: {
      firstName: "Aanya",
      lastName: "Verma",
      email: "aanya.verma@school.test",
      grade: "Grade 5",
      status: StudentStatus.NEEDS_SUPPORT,
      notes:
        "Strong reader, but struggles to translate word problems into equations.",
      teacherId: teacher.id,
      learningGaps: {
        create: [
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
      },
    },
  });

  const rohan = await prisma.student.create({
    data: {
      firstName: "Rohan",
      lastName: "Iyer",
      email: "rohan.iyer@school.test",
      grade: "Grade 6",
      status: StudentStatus.IMPROVING,
      notes: "Recently moved schools; gaining confidence in group work.",
      teacherId: teacher.id,
      learningGaps: {
        create: [
          {
            title: "Reading comprehension – inference",
            subject: "English",
            severity: GapSeverity.MEDIUM,
            status: GapStatus.IN_PROGRESS,
            description:
              "Can recall facts from a passage but rarely makes inferences without prompting.",
          },
        ],
      },
    },
  });

  const meera = await prisma.student.create({
    data: {
      firstName: "Meera",
      lastName: "Patel",
      email: "meera.patel@school.test",
      grade: "Grade 4",
      status: StudentStatus.ACTIVE,
      notes: "Enjoys science labs; needs more challenge in writing tasks.",
      teacherId: teacher.id,
      learningGaps: {
        create: [
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
      },
    },
  });

  const kabir = await prisma.student.create({
    data: {
      firstName: "Kabir",
      lastName: "Singh",
      email: "kabir.singh@school.test",
      grade: "Grade 5",
      status: StudentStatus.NEEDS_SUPPORT,
      notes:
        "Frequent absences last term; rebuilding routines around homework completion.",
      teacherId: teacher.id,
      learningGaps: {
        create: [
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
      },
    },
  });

  const aanyaPlan = await prisma.interventionPlan.create({
    data: {
      title: "Word-problem decoding bootcamp",
      strategy:
        "Twice-weekly 20-minute small-group sessions using the CUBES strategy: Circle key numbers, Underline the question, Box action words, Evaluate, Solve. Pair with weekly exit tickets.",
      startDate: new Date("2026-04-13"),
      endDate: new Date("2026-05-25"),
      status: PlanStatus.ACTIVE,
      studentId: aanya.id,
      createdById: teacher.id,
    },
  });

  const kabirPlan = await prisma.interventionPlan.create({
    data: {
      title: "Phonics rebuild – multi-syllable words",
      strategy:
        "Daily 10-minute 1:1 phonics warm-up using syllable-division (VC/CV) drills, followed by paired reading of grade-level decodables. Re-assess fluency every two weeks.",
      startDate: new Date("2026-04-20"),
      endDate: null,
      status: PlanStatus.ACTIVE,
      studentId: kabir.id,
      createdById: teacher.id,
    },
  });

  await prisma.progressNote.createMany({
    data: [
      {
        note: "Session 3 of CUBES: Aanya correctly identified operations in 4/5 problems independently. Still needs prompting on two-step time problems.",
        studentId: aanya.id,
        interventionPlanId: aanyaPlan.id,
      },
      {
        note: "Week 1 phonics check-in: Kabir read 18/25 multi-syllable target words accurately, up from 9/25 baseline. Confidence noticeably improved.",
        studentId: kabir.id,
        interventionPlanId: kabirPlan.id,
      },
      {
        note: "Parent meeting note: Rohan's family confirmed nightly reading routine; no formal plan yet, monitoring for two more weeks.",
        studentId: rohan.id,
      },
    ],
  });

  console.log("Seed complete:");
  console.log(`  Teacher: ${teacher.email} (password: ${DEMO_TEACHER_PASSWORD})`);
  console.log(`  Students: ${[aanya, rohan, meera, kabir].length}`);
  console.log(`  Intervention plans: 2`);
  console.log(`  Progress notes: 3`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
