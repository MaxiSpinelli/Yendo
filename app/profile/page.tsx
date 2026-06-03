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

  return (
    <div className="min-h-screen bg-cream">
      <Navbar email={user.email} />

      <main className="max-w-lg mx-auto px-4 py-10">
        <div className="card p-7">
          <h1 className="text-xl font-semibold text-navy-900 mb-7">Mi perfil</h1>
          <ProfileForm profile={profile} />
        </div>
      </main>
    </div>
  );
}
