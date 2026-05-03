"use client";

import { deleteLearningGap } from "@/app/dashboard/students/[id]/gaps/actions";
import { DeleteActionButton } from "@/components/shared/delete-action-button";

type DeleteLearningGapButtonProps = {
  studentId: string;
  gapId: string;
  gapTitle: string;
};

export function DeleteLearningGapButton({
  studentId,
  gapId,
  gapTitle,
}: DeleteLearningGapButtonProps) {
  return (
    <DeleteActionButton
      action={deleteLearningGap.bind(null, studentId, gapId)}
      confirmMessage={`Delete the learning gap "${gapTitle}"? This cannot be undone.`}
    />
  );
}
