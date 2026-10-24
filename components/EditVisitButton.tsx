"use client";

import { useState } from "react";
import Modal from "@/components/Modal";
import UpdateForm from "@/app/admin/visits/[id]/UpdateForm";
import type { Visit } from "@/lib/constants";

export default function EditVisitButton({
  visit,
  className = "rounded-xl border border-primary px-3 py-1 text-sm font-medium text-primary transition-colors hover:bg-primary-light",
}: {
  visit: Visit;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        I-edit
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title={`I-edit: ${visit.student_name}`}>
        <UpdateForm
          id={visit.id}
          status={visit.status}
          outcome={visit.outcome}
          followUpDate={visit.follow_up_date}
          notes={visit.counselor_notes}
          onSaved={() => setOpen(false)}
        />
      </Modal>
    </>
  );
}
