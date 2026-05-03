"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

type DeleteActionResult = { ok: true } | { ok: false; error: string };

type DeleteActionButtonProps = {
  /** Server action that performs the delete. Should be pre-bound with ids. */
  action: () => Promise<DeleteActionResult>;
  /** Message shown in the browser confirm() dialog. */
  confirmMessage: string;
  /** Idle button label. Defaults to "Delete". */
  label?: string;
  /** Pending button label. Defaults to "Deleting…". */
  pendingLabel?: string;
  /** Optional className override (defaults to a danger-style outline button). */
  className?: string;
};

const DEFAULT_CLASS =
  "inline-flex h-8 items-center justify-center rounded-md border border-transparent px-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:cursor-not-allowed disabled:opacity-60 dark:text-red-400 dark:hover:bg-red-950/40";

export function DeleteActionButton({
  action,
  confirmMessage,
  label = "Delete",
  pendingLabel = "Deleting…",
  className = DEFAULT_CLASS,
}: DeleteActionButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!window.confirm(confirmMessage)) return;

    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        window.alert(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={className}
    >
      {isPending ? pendingLabel : label}
    </button>
  );
}
