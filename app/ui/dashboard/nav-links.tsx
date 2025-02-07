"use client";

import {
  UserGroupIcon,
  HomeIcon,
  DocumentDuplicateIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import React from "react";

// Map of links to display in the side navigation.
// Depending on the size of the application, this would be stored in a database.
const links = [
  { name: "Home", href: "/dashboard", icon: HomeIcon },
  {
    name: "Invoices",
    href: "/dashboard/invoices",
    icon: DocumentDuplicateIcon,
  },
  { name: "Customers", href: "/dashboard/customers", icon: UserGroupIcon },
];

// Map to links to display in the side navigation
// Only when developing locally
const developmentLinks = [
  {
    name: "Swagger",
    href: "/dashboard/swagger",
    icon: DocumentTextIcon,
  },
];

export default function NavLinks() {
  const pathname = usePathname();

  // define the type for the display arrow function
  interface NavItems {
    icon: React.ElementType;
    href: string;
    name: string;
  }

  const display = (item: NavItems) => {
    const Icon = item.icon;
    return (
      <Link
        key={item.href}
        href={item.href}
        className={clsx(
          "flex h-[46px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3",
          {
            "bg-sky-100 text-blue-600": pathname === item.href,
          },
        )}
      >
        <Icon className="w-6" />
        <p className="hidden md:block">{item.name}</p>
      </Link>
    );
  };

  return (
    <>
      {/*display all links*/}
      {links.map((link) => display(link))}
      {/*only display links that are for development*/}
      {process.env.NODE_ENV === "development" &&
        developmentLinks.map((link) => display(link))}
    </>
  );
}
