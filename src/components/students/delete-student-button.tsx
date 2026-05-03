"use client";

import { deleteStudent } from "@/app/dashboard/students/actions";
import { DeleteActionButton } from "@/components/shared/delete-action-button";

type DeleteStudentButtonProps = {
  id: string;
  studentName: string;
};

export function DeleteStudentButton({
  id,
  studentName,
}: DeleteStudentButtonProps) {
  return (
    <DeleteActionButton
      action={deleteStudent.bind(null, id)}
      confirmMessage={`Delete ${studentName}? This will also remove their learning gaps and intervention plans. This cannot be undone.`}
    />
  );
}
