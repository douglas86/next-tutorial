// seed.ts for Prisma Database
import { PrismaClient } from "@prisma/client";
import {
  customers,
  invoices,
  revenue,
  users,
} from "@/app/lib/placeholder-data";
import cuid from "cuid";

const prisma = new PrismaClient();

async function seedUsers() {
  for (const user of users) {
    await prisma.user.upsert({
      where: {
        id: user.id,
      },
      update: {},
      create: {
        id: cuid(),
        name: user.name,
        email: user.email,
      },
    });
  }
}

async function seedInvoices() {
  for (const invoice of invoices) {
    if (invoice.amount === 666) {
      await prisma.invoice.upsert({
        where: { id: invoice.id },
        update: {},
        create: {
          id: invoice.id,
          customer_id: invoice.customer_id,
          amount: invoice.amount,
          status: invoice.status,
          date: new Date(invoice.date),
        },
      });
      console.log(
        `Invoice ${invoice.id} with amount ${invoice.amount} seeded.`,
      );
    }
  }
}

async function seedCustomers() {
  for (const customer of customers) {
    await prisma.customer.upsert({
      where: { id: customer.id },
      update: {},
      create: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        image_url: customer.image_url,
      },
    });
  }
}

async function seedRevenue() {
  for (const rev of revenue) {
    await prisma.revenue.upsert({
      where: { month: rev.month },
      update: {},
      create: {
        month: rev.month,
        revenue: rev.revenue,
      },
    });
  }
}

async function main() {
  try {
    console.log("Starting database seeding...");
    await seedUsers();
    await seedCustomers();
    await seedInvoices();
    await seedRevenue();
    console.log("Database seeded successfully.");
  } catch (error) {
    console.error("Seeding error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
