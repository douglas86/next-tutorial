"use server";
import { z } from "zod";
import { prisma } from "./prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";

const FormSchema = z.object({
  id: z.number(),
  customer_id: z.coerce.number(),
  amount: z.coerce.number().gt(0, { message: "Please enter a valid amount" }),
  status: z.enum(["pending", "paid"], {
    invalid_type_error: "Please enter a valid status",
  }),
  date: z.string(),
});

export type State = {
  errors?: {
    customer_id?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(prevState: State, formData: FormData) {
  // Validate form fields using Zod
  const validatedFields = CreateInvoice.safeParse({
    customer_id: Number(formData.get("customer_id")),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });

  if (!validatedFields.success) {
    const errors = validatedFields.error.flatten().fieldErrors;

    if (Number(formData.get("customer_id")) === 0) {
      if (!errors.customer_id) {
        errors.customer_id = [];
      }
      errors.customer_id.push("Please enter a valid customer");
    }

    return {
      errors,
      message: "Missing Fields. Failed to create invoice",
    };
  }

  const { customer_id, amount, status } = validatedFields.data;

  const amountInCents = amount * 100;
  const date = new Date().toISOString();

  try {
    await prisma.invoice.create({
      data: {
        customer_id,
        amount: amountInCents,
        status,
        date,
      },
    });
  } catch (error) {
    console.log("error", error);
    return {
      message: "Database Error: Failed to create invoice",
    };
  }

  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

export async function updateInvoice(
  id: string,
  prevState: State,
  formData: FormData,
) {
  const validatedFields = UpdateInvoice.safeParse({
    customer_id: Number(formData.get("customer_id")),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });

  if (!validatedFields.success) {
    const errors = validatedFields.error.flatten().fieldErrors;

    if (Number(formData.get("customer_id")) === 0) {
      if (!errors.customer_id) {
        errors.customer_id = [];
      }
      errors.customer_id.push("Please enter a valid customer");
    }

    return {
      errors,
      message: "Missing Fields. Failed to create invoice",
    };
  }

  const { customer_id, amount, status } = UpdateInvoice.parse({
    customer_id: formData.get("customer_id"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });

  const amountInCents = amount * 100;

  try {
    await prisma.invoice.update({
      where: { id: Number(id) },
      data: {
        customer_id,
        amount: amountInCents,
        status,
      },
    });
  } catch (error) {
    return {
      message: "Database Error: Failed to update invoice",
    };
  }

  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

export async function deleteInvoice(id: string) {
  try {
    await prisma.invoice.delete({
      where: { id: Number(id) },
    });
  } catch (error) {
    return {
      message: "Database Error: Failed to delete invoice",
    };
  }

  // Revalidate the relevant path
  revalidatePath("/dashboard/invoices");
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn("credentials", formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Invalid Credentials";
        default:
          return "Something went wrong";
      }
    }
    throw error;
  }
}
