import { ConvertError, convertUrl } from "@/lib/convert";
import { validateUrl } from "@/lib/export";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const check = validateUrl(typeof body?.url === "string" ? body.url : "");
  if (!check.ok) return Response.json({ error: check.message }, { status: 400 });

  try {
    return Response.json(await convertUrl(check.url));
  } catch (e) {
    if (e instanceof ConvertError) {
      return Response.json({ error: e.message }, { status: 422 });
    }
    throw e;
  }
}
