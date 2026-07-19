import { z } from "zod";

export const vehicleProfileSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(["box_truck", "semi", "cargo_van", "dump_truck", "tractor_trailer"]),
  heightFt: z.number().int().nonnegative().max(20),
  heightIn: z.number().int().nonnegative().max(11),
  weightLbs: z.number().int().positive().max(200000),
  lengthFt: z.number().positive().max(100),
  widthFt: z.number().positive().max(20),
  axles: z.number().int().positive().max(12),
  hasHazmat: z.boolean()
});

export const routeRequestSchema = z.object({
  origin: z.string().min(2),
  destination: z.string().min(2),
  originCoordinate: z.object({ latitude: z.number().min(-90).max(90), longitude: z.number().min(-180).max(180) }).optional(),
  destinationCoordinate: z.object({ latitude: z.number().min(-90).max(90), longitude: z.number().min(-180).max(180) }).optional(),
  vehicle: vehicleProfileSchema
}).refine((value) => Boolean(value.originCoordinate) === Boolean(value.destinationCoordinate), {
  message: "Origin and destination coordinates must be provided together"
});

export const createReportSchema = z.object({
  type: z.string().min(2),
  location: z.string().min(2),
  note: z.string().min(1),
  latitude: z.number().optional(),
  longitude: z.number().optional()
});
