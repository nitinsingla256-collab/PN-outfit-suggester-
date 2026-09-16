// src/schemas/garmentSchema.ts
import { z } from 'zod';

export const ExtractedGarmentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().default('Top'),
  subcategory: z.string().default('General'),
  color: z.string().default('Unspecified'),
  secondaryColor: z.string().optional().default('None'),
  pattern: z.enum(['Solid', 'Striped', 'Plaid', 'Floral', 'Graphic', 'Patterned']).catch('Solid'),
  material: z.string().default('Cotton'),
  fit: z.enum(['Tailored', 'Relaxed', 'Slim', 'Oversized', 'Regular']).catch('Regular'),
  formality: z.enum(['Casual', 'Smart Casual', 'Formal', 'Business', 'Athletic']).catch('Casual'),
  season: z.array(z.string()).default(['Spring', 'Summer', 'Fall', 'Winter']),
  styleTags: z.array(z.string()).default([]),
});

export type ExtractedGarment = z.infer<typeof ExtractedGarmentSchema>;
