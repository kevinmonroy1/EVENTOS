import { z } from "zod";

export const createEventSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
  coupleNames: z
    .string()
    .min(3, "Los nombres de la pareja deben tener al menos 3 caracteres."),
  slug: z
    .string()
    .min(3, "El slug debe tener al menos 3 caracteres.")
    .regex(
      /^[a-z0-9-]+$/,
      "El slug solo puede contener minúsculas, números y guiones."
    ),
  status: z.enum(["draft", "active", "closed"]),
  templateStyle: z.string().min(3, "La plantilla es obligatoria."),
  maxPhotosPerGuest: z.coerce
    .number()
    .int()
    .min(1, "Debe permitir al menos 1 foto.")
    .max(20, "Máximo 20 fotos por invitado."),
  sharedGalleryEnabled: z.coerce.boolean(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;