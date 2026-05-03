import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Server-side guard for dashboard routes.
 * Returns the logged-in teacher's id, or redirects to /auth/login.
 */
export async function requireTeacherId(callbackUrl?: string): Promise<string> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    const target = callbackUrl
      ? `/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
      : "/auth/login";
    redirect(target);
  }
  return session.user.id;
}

/**
 * Guard for any page nested under /dashboard/students/[id].
 * Verifies auth + verifies the student belongs to the logged-in teacher.
 * Renders a 404 if the student does not exist or is owned by someone else.
 */
export async function requireOwnedStudent(
  studentId: string,
  callbackUrl: string
) {
  const teacherId = await requireTeacherId(callbackUrl);
  const student = await prisma.student.findFirst({
    where: { id: studentId, teacherId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      grade: true,
      status: true,
      notes: true,
    },
  });
  if (!student) {
    notFound();
  }
  return { teacherId, student };
}
