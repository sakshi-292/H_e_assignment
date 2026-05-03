"use client";

import { deleteInterventionPlan } from "@/app/dashboard/students/[id]/plans/actions";
import { DeleteActionButton } from "@/components/shared/delete-action-button";

type DeleteInterventionPlanButtonProps = {
  studentId: string;
  planId: string;
  planTitle: string;
};

export function DeleteInterventionPlanButton({
  studentId,
  planId,
  planTitle,
}: DeleteInterventionPlanButtonProps) {
  return (
    <DeleteActionButton
      action={deleteInterventionPlan.bind(null, studentId, planId)}
      confirmMessage={`Delete the intervention plan "${planTitle}"? Progress notes attached to this plan will lose their link. This cannot be undone.`}
    />
  );
}
