// app/api/openapi/route.ts
import { spec } from "@/app/lib/openSpec";

export async function GET() {
  return new Response(spec, {
    status: 200,
    headers: { "Content-Type": "application/yaml" },
  });
}
