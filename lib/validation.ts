import { z } from "zod";
import { PURPOSE_VALUES } from "./constants";

/**
 * Strict regex pattern for Student Number: YYYY-MM-XXXXX (e.g., 2023-07-00675)
 * Exactly 4 digits - 2 digits - 5 digits
 */
export const STUDENT_NUMBER_REGEX = /^\d{4}-\d{2}-\d{5}$/;

/**
 * Automatically masks/formats raw text into YYYY-MM-XXXXX as the student types.
 * Example:
 *  "2023"        -> "2023"
 *  "20230"       -> "2023-0"
 *  "202307"      -> "2023-07"
 *  "20230700675" -> "2023-07-00675"
 */
export function formatStudentNumber(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 4) {
    return digits;
  }
  if (digits.length <= 6) {
    return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  }
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 11)}`;
}

/** Step 1: Express Check-In Schema (Student Number + Purpose) */
export const expressCheckInSchema = z
  .object({
    student_number: z
      .string()
      .trim()
      .min(1, "Pakilagay ang student number")
      .regex(
        STUDENT_NUMBER_REGEX,
        "Dapat sumunod sa format na YYYY-MM-XXXXX (hal. 2023-07-00675)",
      ),
    purpose: z.enum(PURPOSE_VALUES, { message: "Pumili ng purpose ng pagbisita" }),
    purpose_other: z.string().trim().max(120).optional(),
    details: z.string().trim().max(1000).optional(),
  })
  .refine(
    (v) => v.purpose !== "others" || (!!v.purpose_other && v.purpose_other.trim().length > 0),
    {
      path: ["purpose_other"],
      message: "Pakilagay kung ano ang purpose (Required kapag Others)",
    },
  );

export type ExpressCheckInInput = z.infer<typeof expressCheckInSchema>;

/** Step 2: Manual Registration & Check-In Schema */
export const manualCheckInSchema = z
  .object({
    student_number: z
      .string()
      .trim()
      .min(1, "Pakilagay ang student number")
      .regex(
        STUDENT_NUMBER_REGEX,
        "Dapat sumunod sa format na YYYY-MM-XXXXX (hal. 2023-07-00675)",
      ),
    student_name: z
      .string()
      .trim()
      .min(2, "Pakilagay ang buong pangalan")
      .max(120, "Masyadong mahaba ang pangalan (max 120 characters)"),
    grade_level: z
      .string()
      .trim()
      .min(1, "Pakilagay ang Year Level (hal. 1st Year, 2nd Year, 3rd Year, 4th Year)")
      .max(40),
    section: z
      .string()
      .trim()
      .min(1, "Pakilagay ang Section (hal. BSIT 3A)")
      .max(60),
    purpose: z.enum(PURPOSE_VALUES, { message: "Pumili ng purpose ng pagbisita" }),
    purpose_other: z.string().trim().max(120).optional(),
    details: z.string().trim().max(1000).optional(),
  })
  .refine(
    (v) => v.purpose !== "others" || (!!v.purpose_other && v.purpose_other.trim().length > 0),
    {
      path: ["purpose_other"],
      message: "Pakilagay kung ano ang purpose (Required kapag Others)",
    },
  );

export type ManualCheckInInput = z.infer<typeof manualCheckInSchema>;

/** Legacy alias */
export const checkInSchema = manualCheckInSchema;
export type CheckInInput = ManualCheckInInput;
