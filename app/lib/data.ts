import { formatCurrency } from "./utils";
import prisma from "@/app/lib/prisma";
import { Prisma } from "@prisma/client";
// import { list } from "postcss";
// import { Invoice } from "@/app/lib/definitions";

export async function fetchRevenue() {
  const response = await prisma.revenue.findMany();

  if (!response) throw new Error("Failed to fetch revenue");

  return Array.isArray(response) ? [...response] : [];

  // try {
  //   return await prisma.revenue.findMany();
  // } catch (error) {
  //   console.error("Database Error:", error);
  //   throw new Error("Failed to fetch revenue data.");
  // }
}

// export async function fetchRevenue() {
//   try {
//     // Artificially delay a response for demo purposes.
//     // Don't do this in production :)
//
//     // console.log('Fetching revenue data...');
//     // await new Promise((resolve) => setTimeout(resolve, 3000));
//
//     const data = await sql<Revenue>`SELECT * FROM revenue`;
//
//     // console.log('Data fetch completed after 3 seconds.');
//
//     return data.rows;
//   } catch (error) {
//     console.error('Database Error:', error);
//     throw new Error('Failed to fetch revenue data.');
//   }
// }

export async function fetchLatestInvoices() {
  try {
    const latestInvoices = await prisma.invoice.findMany({
      take: 5,
      orderBy: { date: "desc" },
      include: {
        Customer: {
          select: {
            name: true,
            email: true,
            image_url: true,
          },
        },
      },
    });

    return latestInvoices.map((invoice) => ({
      id: invoice.id,
      amount: formatCurrency(invoice.amount),
      name: invoice.Customer.name,
      email: invoice.Customer.email,
      image_url: invoice.Customer.image_url,
    }));
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch the latest invoices.");
  }
}

// export async function fetchLatestInvoices() {
//   try {
//     const data = await sql<LatestInvoiceRaw>`
//       SELECT invoices.amount, customers.name, customers.image_url, customers.email, invoices.id
//       FROM invoices
//       JOIN customers ON invoices.customer_id = customers.id
//       ORDER BY invoices.date DESC
//       LIMIT 5`;
//
//     const latestInvoices = data.rows.map((invoice) => ({
//       ...invoice,
//       amount: formatCurrency(invoice.amount),
//     }));
//     return latestInvoices;
//   } catch (error) {
//     console.error("Database Error:", error);
//     throw new Error("Failed to fetch the latest invoices.");
//   }
// }

export async function fetchCardData() {
  try {
    const [invoiceCount, customerCount, invoiceStatus] = await Promise.all([
      prisma.invoice.count(),
      prisma.customer.count(),
      prisma.invoice.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          OR: [{ status: "paid" }, { status: "pending" }],
        },
      }),
    ]);

    const totalPaidInvoices = formatCurrency(invoiceStatus._sum.amount ?? 0);
    const totalPendingInvoices = formatCurrency(0); // Add logic if you split statuses.

    return {
      numberOfCustomers: customerCount,
      numberOfInvoices: invoiceCount,
      totalPaidInvoices,
      totalPendingInvoices,
    };
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch card data.");
  }
}

// export async function fetchCardData() {
//   try {
//     // You can probably combine these into a single SQL query
//     // However, we are intentionally splitting them to demonstrate
//     // how to initialize multiple queries in parallel with JS.
//     const invoiceCountPromise = sql`SELECT COUNT(*) FROM invoices`;
//     const customerCountPromise = sql`SELECT COUNT(*) FROM customers`;
//     const invoiceStatusPromise = sql`SELECT
//          SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS "paid",
//          SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS "pending"
//          FROM invoices`;
//
//     const data = await Promise.all([
//       invoiceCountPromise,
//       customerCountPromise,
//       invoiceStatusPromise,
//     ]);
//
//     const numberOfInvoices = Number(data[0].rows[0].count ?? "0");
//     const numberOfCustomers = Number(data[1].rows[0].count ?? "0");
//     const totalPaidInvoices = formatCurrency(data[2].rows[0].paid ?? "0");
//     const totalPendingInvoices = formatCurrency(data[2].rows[0].pending ?? "0");
//
//     return {
//       numberOfCustomers,
//       numberOfInvoices,
//       totalPaidInvoices,
//       totalPendingInvoices,
//     };
//   } catch (error) {
//     console.error("Database Error:", error);
//     throw new Error("Failed to fetch card data.");
//   }
// }

const ITEMS_PER_PAGE = 6;

export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  // Validate and sanitize query inputs
  const parsedAmount = !isNaN(Number(query)) ? Number(query) : undefined;
  const parsedDate = !isNaN(Date.parse(query)) ? new Date(query) : undefined;

  console.log("query", query);

  try {
    return await prisma.invoice.findMany({
      skip: offset,
      take: ITEMS_PER_PAGE,
      where: {
        OR: [
          { Customer: { name: { contains: query, mode: "insensitive" } } },
          { Customer: { email: { contains: query, mode: "insensitive" } } },
          parsedAmount !== undefined
            ? { amount: { equals: parsedAmount } }
            : undefined,
          parsedDate !== undefined ? { date: parsedDate } : undefined,
          { status: { contains: query, mode: "insensitive" } },
        ].filter(Boolean) as Prisma.InvoiceWhereInput[],
      },
      include: {
        Customer: true,
      },
      orderBy: { date: "desc" },
    });
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch invoices.");
  }
}

// const ITEMS_PER_PAGE = 6;
// export async function fetchFilteredInvoices(
//   query: string,
//   currentPage: number,
// ) {
//   const offset = (currentPage - 1) * ITEMS_PER_PAGE;
//
//   try {
//     const invoices = await sql<InvoicesTable>`
//       SELECT
//         invoices.id,
//         invoices.amount,
//         invoices.date,
//         invoices.status,
//         customers.name,
//         customers.email,
//         customers.image_url
//       FROM invoices
//       JOIN customers ON invoices.customer_id = customers.id
//       WHERE
//         customers.name ILIKE ${`%${query}%`} OR
//         customers.email ILIKE ${`%${query}%`} OR
//         invoices.amount::text ILIKE ${`%${query}%`} OR
//         invoices.date::text ILIKE ${`%${query}%`} OR
//         invoices.status ILIKE ${`%${query}%`}
//       ORDER BY invoices.date DESC
//       LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
//     `;
//
//     return invoices.rows;
//   } catch (error) {
//     console.error("Database Error:", error);
//     throw new Error("Failed to fetch invoices.");
//   }
// }

export async function fetchInvoicesPages(query: string) {
  // Validate and sanitize query inputs
  const parsedAmount = !isNaN(Number(query)) ? Number(query) : undefined;
  const parsedDate = !isNaN(Date.parse(query)) ? new Date(query) : undefined;

  try {
    const count = await prisma.invoice.count({
      where: {
        OR: [
          { Customer: { name: { contains: query, mode: "insensitive" } } },
          { Customer: { email: { contains: query, mode: "insensitive" } } },
          parsedAmount !== undefined
            ? { amount: { equals: parsedAmount } }
            : undefined,
          parsedDate !== undefined ? { date: parsedDate } : undefined,
          { status: { contains: query, mode: "insensitive" } },
        ].filter(Boolean) as Prisma.InvoiceWhereInput[],
      },
    });

    return Math.ceil(count / ITEMS_PER_PAGE);
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch total pages.");
  }
}

// export async function fetchInvoicesPages(query: string) {
//   try {
//     const count = await sql`SELECT COUNT(*)
//     FROM invoices
//     JOIN customers ON invoices.customer_id = customers.id
//     WHERE
//       customers.name ILIKE ${`%${query}%`} OR
//       customers.email ILIKE ${`%${query}%`} OR
//       invoices.amount::text ILIKE ${`%${query}%`} OR
//       invoices.date::text ILIKE ${`%${query}%`} OR
//       invoices.status ILIKE ${`%${query}%`}
//   `;
//
//     const totalPages = Math.ceil(Number(count.rows[0].count) / ITEMS_PER_PAGE);
//     return totalPages;
//   } catch (error) {
//     console.error("Database Error:", error);
//     throw new Error("Failed to fetch total number of invoices.");
//   }
// }

export async function fetchInvoiceById(id: string) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: Number(id) },
  });

  if (!invoice) throw new Error("Invoice not found.");

  return {
    ...invoice,
    amount: invoice.amount / 100, // Convert amount if needed
  };
}

// export async function fetchInvoiceById(id: string) {
//   try {
//     const data = await sql<InvoiceForm>`
//       SELECT
//         invoices.id,
//         invoices.customer_id,
//         invoices.amount,
//         invoices.status
//       FROM invoices
//       WHERE invoices.id = ${id};
//     `;
//
//     const invoice = data.rows.map((invoice) => ({
//       ...invoice,
//       // Convert amount from cents to dollars
//       amount: invoice.amount / 100,
//     }));
//
//     return invoice[0];
//   } catch (error) {
//     console.error("Database Error:", error);
//     throw new Error("Failed to fetch invoice.");
//   }
// }

export async function fetchCustomers() {
  try {
    return await prisma.customer.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch all customers.");
  }
}

// export async function fetchCustomers() {
//   try {
//     const data = await sql<CustomerField>`
//       SELECT
//         id,
//         name
//       FROM customers
//       ORDER BY name ASC
//     `;
//
//     const customers = data.rows;
//     return customers;
//   } catch (err) {
//     console.error("Database Error:", err);
//     throw new Error("Failed to fetch all customers.");
//   }
// }

export async function fetchFilteredCustomers(query: string) {
  try {
    const customers = await prisma.customer.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
        ],
      },
      include: {
        Invoices: {
          select: {
            amount: true,
            status: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    type Invoice = {
      amount: number;
      status: string;
    };

    type CustomerWithInvoices = {
      id: number;
      name: string;
      email: string;
      Invoices: Invoice[];
    };

    return customers.map((Customer: CustomerWithInvoices) => {
      const total_pending = Customer.Invoices.filter(
        (inv) => inv.status === "pending",
      ).reduce((sum, inv) => sum + inv.amount, 0);

      const total_paid = Customer.Invoices.filter(
        (inv) => inv.status === "paid",
      ).reduce((sum, inv) => sum + inv.amount, 0);

      return {
        id: Customer.id,
        name: Customer.name,
        email: Customer.email,
        total_pending: formatCurrency(total_pending),
        total_paid: formatCurrency(total_paid),
      };
    });
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch customer table.");
  }
}

// export async function fetchFilteredCustomers(query: string) {
//   try {
//     const data = await sql<CustomersTableType>`
// 		SELECT
// 		  customers.id,
// 		  customers.name,
// 		  customers.email,
// 		  customers.image_url,
// 		  COUNT(invoices.id) AS total_invoices,
// 		  SUM(CASE WHEN invoices.status = 'pending' THEN invoices.amount ELSE 0 END) AS total_pending,
// 		  SUM(CASE WHEN invoices.status = 'paid' THEN invoices.amount ELSE 0 END) AS total_paid
// 		FROM customers
// 		LEFT JOIN invoices ON customers.id = invoices.customer_id
// 		WHERE
// 		  customers.name ILIKE ${`%${query}%`} OR
//         customers.email ILIKE ${`%${query}%`}
// 		GROUP BY customers.id, customers.name, customers.email, customers.image_url
// 		ORDER BY customers.name ASC
// 	  `;
//
//     const customers = data.rows.map((customer) => ({
//       ...customer,
//       total_pending: formatCurrency(customer.total_pending),
//       total_paid: formatCurrency(customer.total_paid),
//     }));
//
//     return customers;
//   } catch (err) {
//     console.error("Database Error:", err);
//     throw new Error("Failed to fetch customer table.");
//   }
// }
