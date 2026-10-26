"use client";

import { useEffect, useState, useTransition } from "react";
import {
  submitExpressCheckIn,
  submitManualCheckIn,
  type CheckInState,
} from "@/app/actions";
import { PURPOSES } from "@/lib/constants";
import { inputClassLg } from "@/lib/ui";
import { formatStudentNumber, STUDENT_NUMBER_REGEX } from "@/lib/validation";

const RESET_AFTER_MS = 6000;

function Field({
  label,
  error,
  required = true,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center justify-between text-sm font-medium text-text">
        <span>
          {label}
          {required && <span className="ml-1 text-accent">*</span>}
        </span>
      </span>
      {children}
      {error && <span className="mt-1.5 block text-xs font-medium text-error">{error}</span>}
    </label>
  );
}

export default function CheckInForm() {
  const [step, setStep] = useState<"express" | "manual">("express");
  const [isPending, startTransition] = useTransition();

  // State values across steps
  const [studentNumber, setStudentNumber] = useState("");
  const [studentName, setStudentName] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [section, setSection] = useState("");
  const [purpose, setPurpose] = useState("");
  const [purposeOther, setPurposeOther] = useState("");
  const [details, setDetails] = useState("");

  // Result state
  const [state, setState] = useState<CheckInState>({ ok: false });
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);

  const handleReset = () => {
    setState({ ok: false });
    setStep("express");
    setStudentNumber("");
    setStudentName("");
    setGradeLevel("");
    setSection("");
    setPurpose("");
    setPurposeOther("");
    setDetails("");
    setBannerNotice(null);
  };

  // Auto-reset when check-in succeeds
  useEffect(() => {
    if (!state.ok) return;
    const timer = setTimeout(handleReset, RESET_AFTER_MS);
    return () => clearTimeout(timer);
  }, [state.ok]);

  // Student number input masking: strictly appends dashes YYYY-MM-XXXXX
  const handleStudentNumberChange = (val: string) => {
    const formatted = formatStudentNumber(val);
    setStudentNumber(formatted);
  };

  // Step 1: Express Check-In submission
  const handleExpressSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBannerNotice(null);

    // Client-side strict validation check
    if (!studentNumber.trim()) {
      setState({
        ok: false,
        errors: { student_number: "Pakilagay ang iyong Student Number." },
      });
      return;
    }

    if (!STUDENT_NUMBER_REGEX.test(studentNumber.trim())) {
      setState({
        ok: false,
        errors: {
          student_number: "Dapat nasa tamang format: YYYY-MM-XXXXX (hal. 2023-07-00675)",
        },
      });
      return;
    }

    if (!purpose) {
      setState({
        ok: false,
        errors: { purpose: "Pumili ng Purpose ng pagbisita." },
      });
      return;
    }

    if (purpose === "others" && !purposeOther.trim()) {
      setState({
        ok: false,
        errors: { purpose_other: "Pakilagay ang dahilan ng pagbisita." },
      });
      return;
    }

    const formData = new FormData();
    formData.set("student_number", studentNumber.trim());
    formData.set("purpose", purpose);
    if (purpose === "others") formData.set("purpose_other", purposeOther.trim());
    if (details.trim()) formData.set("details", details.trim());

    startTransition(async () => {
      const res = await submitExpressCheckIn({ ok: false }, formData);
      setState(res);

      if (!res.ok && res.notFound) {
        // Automatically redirect to Step 2 with notification
        setBannerNotice(
          `⚠️ Hindi nahanap ang student record para sa "${studentNumber.trim()}". Mangyaring magparehistro sa ibaba.`,
        );
        setStep("manual");
      }
    });
  };

  // Step 2: Manual Registration submission
  const handleManualSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBannerNotice(null);

    // Client-side strict validation
    const errors: Record<string, string> = {};
    if (!studentNumber.trim()) {
      errors.student_number = "Pakilagay ang iyong Student Number.";
    } else if (!STUDENT_NUMBER_REGEX.test(studentNumber.trim())) {
      errors.student_number =
        "Dapat nasa tamang format: YYYY-MM-XXXXX (hal. 2023-07-00675)";
    }

    if (!studentName.trim()) {
      errors.student_name = "Pakilagay ang buong pangalan.";
    }
    if (!gradeLevel.trim()) {
      errors.grade_level = "Pakilagay o pumili ng Year Level.";
    }
    if (!section.trim()) {
      errors.section = "Pakilagay ang iyong Section / Course.";
    }
    if (!purpose) {
      errors.purpose = "Pumili ng Purpose ng pagbisita.";
    }
    if (purpose === "others" && !purposeOther.trim()) {
      errors.purpose_other = "Pakilagay ang dahilan ng pagbisita.";
    }

    if (Object.keys(errors).length > 0) {
      setState({ ok: false, errors });
      return;
    }

    const formData = new FormData();
    formData.set("student_number", studentNumber.trim());
    formData.set("student_name", studentName.trim());
    formData.set("grade_level", gradeLevel.trim());
    formData.set("section", section.trim());
    formData.set("purpose", purpose);
    if (purpose === "others") formData.set("purpose_other", purposeOther.trim());
    if (details.trim()) formData.set("details", details.trim());

    startTransition(async () => {
      const res = await submitManualCheckIn({ ok: false }, formData);
      setState(res);
    });
  };

  // SUCCESS CONFIRMATION SCREEN
  if (state.ok) {
    return (
      <div className="rounded-2xl bg-success-light p-8 text-center sm:p-12">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-success/15 animate-scale-in">
          <svg
            className="h-10 w-10 text-success"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <span className="inline-block rounded-full bg-success/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-success">
          Check-In Successful
        </span>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-text">
          Salamat, {state.student_name}!
        </h2>
        <p className="mt-2 text-text-muted">
          Matagumpay na naitala ang iyong pagbisita sa Guidance Office.
        </p>

        {/* Visit Summary Card */}
        <div className="mx-auto mt-6 max-w-md divide-y divide-border rounded-xl border border-border bg-card p-4 text-left shadow-xs">
          <div className="flex justify-between py-2 text-sm">
            <span className="text-text-muted">Student Number:</span>
            <span className="font-semibold text-text">{state.student_number}</span>
          </div>
          {state.grade_level && (
            <div className="flex justify-between py-2 text-sm">
              <span className="text-text-muted">Year & Section:</span>
              <span className="font-semibold text-text">
                {state.grade_level} · {state.section}
              </span>
            </div>
          )}
          <div className="flex justify-between py-2 text-sm">
            <span className="text-text-muted">Status sa Pila:</span>
            <span className="inline-flex items-center rounded-full bg-warning-light px-2.5 py-0.5 text-xs font-semibold text-warning">
              Waiting in Queue
            </span>
          </div>
        </div>

        <p className="mt-5 text-xs text-text-muted">
          Awtomatikong magre-reset ang screen para sa susunod na estudyante.
        </p>

        <button
          type="button"
          onClick={handleReset}
          className="mt-4 rounded-xl bg-primary px-8 py-3 font-semibold text-white transition-colors hover:bg-primary-dark"
        >
          Bagong Entry
        </button>
      </div>
    );
  }

  const e = state.errors ?? {};

  return (
    <div className="space-y-6">
      {/* 2-Step Tab Header */}
      <div className="flex rounded-xl bg-surface p-1 border border-border">
        <button
          type="button"
          onClick={() => {
            setStep("express");
            setBannerNotice(null);
          }}
          className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
            step === "express"
              ? "bg-card text-primary shadow-xs"
              : "text-text-muted hover:text-text"
          }`}
        >
          ⚡ Step 1: Express Check-In
        </button>
        <button
          type="button"
          onClick={() => {
            setStep("manual");
            setBannerNotice(null);
          }}
          className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
            step === "manual"
              ? "bg-card text-primary shadow-xs"
              : "text-text-muted hover:text-text"
          }`}
        >
          📝 Step 2: Manual Registration
        </button>
      </div>

      {/* Alert Banner / Notification */}
      {bannerNotice && (
        <div className="rounded-xl border border-warning/40 bg-warning-light p-4 text-sm text-text">
          <p className="font-medium text-warning-dark">{bannerNotice}</p>
        </div>
      )}

      {state.message && !state.notFound && (
        <div className="rounded-xl border border-error/40 bg-error-light p-4 text-sm text-error">
          <p className="font-medium">{state.message}</p>
        </div>
      )}

      {/* ============================================================ */}
      {/* STEP 1: EXPRESS CHECK-IN FORM                                */}
      {/* ============================================================ */}
      {step === "express" && (
        <form onSubmit={handleExpressSubmit} className="space-y-5" noValidate>
          <div className="border-b border-border pb-3">
            <h2 className="text-xl font-bold text-text">Express Check-In</h2>
            <p className="mt-1 text-sm text-text-muted">
              Para sa mga dating naka-record na estudyante. Ilagay lamang ang iyong Student Number
              at Purpose.
            </p>
          </div>

          <Field label="Student Number" error={e.student_number}>
            <input
              name="student_number"
              type="text"
              autoComplete="off"
              required
              maxLength={13}
              value={studentNumber}
              onChange={(ev) => handleStudentNumberChange(ev.target.value)}
              placeholder="YYYY-MM-XXXXX (hal. 2023-07-00675)"
              className={`${inputClassLg} font-mono tracking-wider`}
            />
          </Field>

          <Field label="Purpose of Visit" error={e.purpose}>
            <select
              name="purpose"
              required
              value={purpose}
              onChange={(ev) => setPurpose(ev.target.value)}
              className={inputClassLg}
            >
              <option value="" disabled>
                Pumili ng purpose ng pagbisita…
              </option>
              {PURPOSES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </Field>

          {purpose === "others" && (
            <Field label="Ano ang purpose?" error={e.purpose_other}>
              <input
                name="purpose_other"
                type="text"
                autoComplete="off"
                required
                value={purposeOther}
                onChange={(ev) => setPurposeOther(ev.target.value)}
                placeholder="Tukuyin ang dahilan ng pagbisita"
                className={inputClassLg}
              />
            </Field>
          )}

          {/* Honeypot for bots */}
          <div aria-hidden="true" className="absolute -left-[9999px]">
            <label>
              Website
              <input name="website" tabIndex={-1} autoComplete="off" />
            </label>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-xl bg-primary px-6 py-4 text-lg font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-60 shadow-xs"
          >
            {isPending ? "Hinahanap ang record…" : "Mabilisang Check-In"}
          </button>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => {
                setStep("manual");
                setBannerNotice(null);
              }}
              className="text-sm font-medium text-primary hover:underline"
            >
              Unang beses mag-check in? Magparehistro nang manu-mano dito →
            </button>
          </div>
        </form>
      )}

      {/* ============================================================ */}
      {/* STEP 2: MANUAL REGISTRATION KIOSK FORM                       */}
      {/* ============================================================ */}
      {step === "manual" && (
        <form onSubmit={handleManualSubmit} className="space-y-5" noValidate>
          <div className="flex items-start justify-between border-b border-border pb-3">
            <div>
              <h2 className="text-xl font-bold text-text">Manual Registration & Check-In</h2>
              <p className="mt-1 text-sm text-text-muted">
                Paki-fill up ang lahat ng mandatory fields para mairehistro ang iyong profile.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setStep("express");
                setBannerNotice(null);
              }}
              className="text-xs font-semibold text-primary hover:underline shrink-0 ml-2"
            >
              ← Express
            </button>
          </div>

          <Field label="Student Number" error={e.student_number}>
            <input
              name="student_number"
              type="text"
              autoComplete="off"
              required
              maxLength={13}
              value={studentNumber}
              onChange={(ev) => handleStudentNumberChange(ev.target.value)}
              placeholder="YYYY-MM-XXXXX (hal. 2023-07-00675)"
              className={`${inputClassLg} font-mono tracking-wider`}
            />
          </Field>

          <Field label="Full Name" error={e.student_name}>
            <input
              name="student_name"
              type="text"
              autoComplete="off"
              required
              value={studentName}
              onChange={(ev) => setStudentName(ev.target.value)}
              placeholder="Apelyido, Pangalan (hal. Dela Cruz, Juan)"
              className={inputClassLg}
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Year Level" error={e.grade_level}>
              <select
                name="grade_level"
                required
                value={gradeLevel}
                onChange={(ev) => setGradeLevel(ev.target.value)}
                className={inputClassLg}
              >
                <option value="" disabled>
                  Pumili ng Year Level…
                </option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
                <option value="Grade 11">Grade 11</option>
                <option value="Grade 12">Grade 12</option>
              </select>
            </Field>

            <Field label="Section / Course" error={e.section}>
              <input
                name="section"
                type="text"
                autoComplete="off"
                required
                value={section}
                onChange={(ev) => setSection(ev.target.value)}
                placeholder="hal. BSIT 3A / STEM-A"
                className={inputClassLg}
              />
            </Field>
          </div>

          <Field label="Purpose of Visit" error={e.purpose}>
            <select
              name="purpose"
              required
              value={purpose}
              onChange={(ev) => setPurpose(ev.target.value)}
              className={inputClassLg}
            >
              <option value="" disabled>
                Pumili ng purpose…
              </option>
              {PURPOSES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </Field>

          {purpose === "others" && (
            <Field label="Ano ang purpose?" error={e.purpose_other}>
              <input
                name="purpose_other"
                type="text"
                autoComplete="off"
                required
                value={purposeOther}
                onChange={(ev) => setPurposeOther(ev.target.value)}
                placeholder="Tukuyin ang dahilan ng pagbisita"
                className={inputClassLg}
              />
            </Field>
          )}

          {/* Honeypot for bots */}
          <div aria-hidden="true" className="absolute -left-[9999px]">
            <label>
              Website
              <input name="website" tabIndex={-1} autoComplete="off" />
            </label>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-xl bg-primary px-6 py-4 text-lg font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-60 shadow-xs"
          >
            {isPending ? "Sine-save ang registration…" : "I-rehistro at Mag-check in"}
          </button>
        </form>
      )}
    </div>
  );
}
