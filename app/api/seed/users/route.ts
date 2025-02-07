import { NextResponse } from "next/server";
import { faker } from "@faker-js/faker";

export async function POST() {
  const users = Array.from({ length: 4 }, () => faker.person.firstName());

  console.log("users", users);

  return NextResponse.json({
    status: 200,
    message: "Successfully logged in",
    users,
  });
}
