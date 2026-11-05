"use server";

import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { requireUserId } from "@/features/auth/session";
import { displayNameSchema, fieldErrorsFrom, keepValues, usernameSchema, type FormState } from "@/features/auth/schemas";
import { AVATARS } from "./avatars";

const schema = z.object({
  displayName: displayNameSchema,
  username: usernameSchema,
  avatar: z.enum(AVATARS),
});

export async function updateProfileAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const userId = await requireUserId();
  const values = keepValues(formData, ["displayName", "username", "avatar"]);
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { values, fieldErrors: fieldErrorsFrom(parsed.error) };

  const taken = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(and(eq(profiles.username, parsed.data.username), ne(profiles.id, userId)))
    .limit(1);
  if (taken[0]) return { values, fieldErrors: { username: "Ce pseudo est déjà utilisé." } };

  await db
    .update(profiles)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(profiles.id, userId));
  revalidatePath("/", "layout");
  return { success: "Profil mis à jour." };
}
