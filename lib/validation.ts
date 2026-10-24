import { z } from "zod";
import { PURPOSE_VALUES } from "./constants";

export const checkInSchema = z
  .object({
    student_name: z.string().trim().min(2, "Pakilagay ang buong pangalan").max(120),
    student_number: z
      .string()
      .trim()
      .min(3, "Pakilagay ang student number")
      .max(30)
      .regex(/^[A-Za-z0-9-]+$/, "Letters, numbers at dash (-) lang"),
    grade_level: z.string().trim().min(1, "Pakilagay ang grade/year level").max(40),
    section: z.string().trim().min(1, "Pakilagay ang section/course").max(60),
    purpose: z.enum(PURPOSE_VALUES, { message: "Pumili ng purpose" }),
    purpose_other: z.string().trim().max(120).optional(),
    details: z.string().trim().max(1000).optional(),
  })
  .refine((v) => v.purpose !== "others" || !!v.purpose_other, {
    path: ["purpose_other"],
    message: "Pakilagay kung ano ang purpose",
  });

export type CheckInInput = z.infer<typeof checkInSchema>;
