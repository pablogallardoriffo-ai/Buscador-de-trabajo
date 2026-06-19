import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function PerfilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, region")
    .eq("id", user!.id)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-1 text-2xl font-semibold tracking-tight">Mi perfil</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Tus datos de cuenta y la zona donde buscas trabajo.
      </p>
      <Card>
        <CardContent className="space-y-3 py-6 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Correo</span>
            <span>{profile?.email ?? user!.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Nombre</span>
            <span>{profile?.full_name ?? "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Zona de búsqueda</span>
            <span>{profile?.region ?? "Por definir"}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
