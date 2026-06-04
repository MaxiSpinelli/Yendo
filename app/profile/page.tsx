import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/layout/Navbar";
import ProfileForm from "@/components/forms/ProfileForm";

export default async function ProfilePage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const displayName = profile?.nickname ?? profile?.first_name ?? user.email?.split("@")[0] ?? "Usuario";

  return (
    <div style={{ minHeight: "100vh", background: "#faf7f2", fontFamily: "var(--font-sans)" }}>
      <Navbar email={user.email} userName={displayName} />

      <main style={{ maxWidth: "520px", margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ background: "#f0ebe3", border: "1px solid #e8e0d8", borderRadius: "20px", padding: "28px" }}>
          <h1 style={{ fontSize: "18px", fontWeight: 500, color: "#1a1714", margin: "0 0 24px" }}>
            Mi perfil
          </h1>
          <ProfileForm profile={profile} />
        </div>
      </main>
    </div>
  );
}