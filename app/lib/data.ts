// import { formatCurrency } from "./utils";
// import { prisma } from "./prisma";
// import { Prisma } from "@prisma/client";

// export async function fetchRevenue() {
//   const response = await prisma.revenue.findMany();
//
//   if (!response) throw new Error("Failed to fetch revenue");
//
//   return Array.isArray(response) ?
//   [...response] : [];
// }

// export async function fetchLatestInvoices() {
//   try {
//     const latestInvoices = await prisma.invoice.findMany({
//       take: 5,
//       orderBy: { date: "desc" },
//       include: {
//         Customer: {
//           select: {
//             name: true,
//             email: true,
//             image_url: true,
//           },
//         },
//       },
//     });
//
//     return latestInvoices.map((invoice) => ({
//       id: invoice.id,
//       amount: formatCurrency(invoice.amount),
//       name: invoice.Customer.name,
//       email: invoice.Customer.email,
//       image_url: invoice.Customer.image_url,
//     }));
//   } catch (error) {
//     console.error("Database Error:", error);
//     throw new Error("Failed to fetch the latest invoices.");
//   }
// }

// export async function fetchCardData() {
//   try {
//     const [invoiceCount, customerCount, invoiceStatus] = await Promise.all([
//       prisma.invoice.count(),
//       prisma.customer.count(),
//       prisma.invoice.aggregate({
//         _sum: {
//           amount: true,
//         },
//         where: {
//           OR: [{ status: "paid" }, { status: "pending" }],
//         },
//       }),
//     ]);
//
//     const totalPaidInvoices = formatCurrency(invoiceStatus._sum.amount ?? 0);
//     const totalPendingInvoices = formatCurrency(0); // Add logic if you split statuses.
//
//     return {
//       numberOfCustomers: customerCount,
//       numberOfInvoices: invoiceCount,
//       totalPaidInvoices,
//       totalPendingInvoices,
//     };
//   } catch (error) {
//     console.error("Database Error:", error);
//     throw new Error ("Failed to fetch card data.");
//   }
// }

// const ITEMS_PER_PAGE = 6;

// export async function fetchFilteredInvoices(
//   query: string,
//   currentPage: number,
// ) {
//   const offset = (currentPage - 1) * ITEMS_PER_PAGE;
//
//   // Validate and sanitize query inputs
//   const parsedAmount = !isNaN(Number(query)) ?
//   Number(query) : undefined;
//   const parsedDate = !isNaN(Date.parse(query)) ?
//   new Date(query) : undefined;
//
//
//   try {
//     return await prisma.invoice.findMany({
//       skip: offset,
//       take: ITEMS_PER_PAGE,
//       where: {
//         OR: [
//           { Customer: { name: { contains: query, mode: "insensitive" } } },
//           { Customer: { email: { contains: query, mode: "insensitive" } } },
//           parsedAmount !== undefined
//             ? { amount: { equals: parsedAmount } }
//             : undefined,
//           parsedDate !== undefined ? { date: parsedDate } : undefined,
//           { status: { contains: query, mode: "insensitive" } },
//         ].filter(Boolean) as prisma.InvoiceWhereInput[],
//       },
//       include: {
//         Customer: true,
//       },
//       orderBy: { date: "desc" },
//     });
//   } catch (error) {
//     console.error("Database Error:", error);
//     throw new Error("Failed to fetch invoices.");
//   }
// }

// export async function fetchInvoicesPages(query: string) {
//   // Validate and sanitize query inputs
//   const parsedAmount = !isNaN(Number(query)) ? Number(query) : undefined;
//   const parsedDate = !isNaN(Date.parse(query)) ? new Date(query) : undefined;
//
//   try {
//     const count = await prisma.invoice.count({
//       where: {
//         OR: [
//           { Customer: { name: { contains: query, mode: "insensitive" } } },
//           { Customer: { email: { contains: query, mode: "insensitive" } } },
//           parsedAmount !== undefined
//             ? { amount: { equals: parsedAmount } }
//             : undefined,
//           parsedDate !== undefined ? { date: parsedDate } : undefined,
//           { status: { contains: query, mode: "insensitive" } },
//         ].filter(Boolean) as Prisma.InvoiceWhereInput[],
//       },
//     });
//
//     return Math.ceil(count / ITEMS_PER_PAGE);
//   } catch (error) {
//     console.error("Database Error:", error);
//     throw new Error("Failed to fetch total pages.");
//   }
// } from "@/app/lib/prisma";

// export async function fetchInvoiceById(id: string) {
//   const invoice = await prisma.invoice.findUnique({
//     where: { id: Number(id) },
//   });
//
//   if (!invoice) throw new Error("Invoice not found.");
//
//   return {
//     ...invoice,
//     amount: invoice.amount / 100, // Convert amount if needed
//   };
// }
//
// export async function fetchCustomers() {
//   try {
//     return await prisma.customer.findMany({
//       select: { id: true, name: true },
//       orderBy: { name: "asc" },
//     });
//   } catch (error) {
//     console.error("Database Error:", error);
//     throw new Error("Failed to fetch all customers.");
//   }
// }
//
// export async function fetchFilteredCustomers(query: string) {
//   try {
//     const customers = await prisma.customer.findMany({
//       where: {
//         OR: [
//           { name: { contains: query, mode: "insensitive" } },
//           { email: { contains: query, mode: "insensitive" } },
//         ],
//       },
//       include: {
//         Invoices: {
//           select: {
//             amount: true,
//             status: true,
//           },
//         },
//       },
//       orderBy: { name: "asc" },
//     });
//
//     type Invoice = {
//       amount: number;
//       status: string;
//     };
//
//     type CustomerWithInvoices = {
//       id: number;
//       name: string;
//       email: string;
//       Invoices: Invoice[];
//     };
//
//     return customers.map((Customer: CustomerWithInvoices) => {
//       const total_pending = Customer.Invoices.filter(
//         (inv) => inv.status === "pending",
//       ).reduce((sum, inv) => sum + inv.amount, 0);
//
//       const total_paid = Customer.Invoices.filter(
//         (inv) => inv.status === "paid",
//       ).reduce((sum, inv) => sum + inv.amount, 0);
//
//       return {
//         id: Customer.id,
//         name: Customer.name,
//         email: Customer.email,
//         total_pending: formatCurrency(total_pending),
//         total_paid: formatCurrency(total_paid),
//       };
//     });
//   } catch (error) {
//     console.error("Database Error:", error);
//     throw new Error("Failed to fetch customer table.");
//   }
// }
