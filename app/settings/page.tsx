import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import { LogoutButton } from "@/components/logout-button";
import { ProfileForm } from "@/components/profile-form";
import { createClient } from "@/lib/supabase/server";

export default async function SettingsPage() {
  const supabase = await createClient();
  // 서버에서 검증된 사용자 정보로만 접근을 판단한다.
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;
  if (!user) redirect("/auth/login?next=%2Fsettings");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .single();

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-10">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            aria-label="메인으로"
            className={buttonVariants({ variant: "outline", size: "icon" })}
          >
            <ArrowLeftIcon />
          </Link>
          <h1 className="text-lg font-semibold">설정</h1>
        </div>
        <LogoutButton />
      </div>
      <p className="text-sm text-muted-foreground">{user.email}</p>
      <ProfileForm initialName={profile?.display_name ?? ""} userId={user.id} />
    </main>
  );
}
