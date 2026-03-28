import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();

  cookieStore.delete("token");
  cookieStore.delete("user");

  return Response.json({ success: true });
}
