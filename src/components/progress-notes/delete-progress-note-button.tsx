"use client";

import { deleteProgressNote } from "@/app/dashboard/students/[id]/plans/[planId]/notes/actions";
import { DeleteActionButton } from "@/components/shared/delete-action-button";

type DeleteProgressNoteButtonProps = {
  studentId: string;
  planId: string;
  noteId: string;
};

export function DeleteProgressNoteButton({
  studentId,
  planId,
  noteId,
}: DeleteProgressNoteButtonProps) {
  return (
    <DeleteActionButton
      action={deleteProgressNote.bind(null, studentId, planId, noteId)}
      confirmMessage="Delete this progress note? This cannot be undone."
    />
  );
}
