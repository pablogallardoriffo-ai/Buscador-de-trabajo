import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CvUploader } from "@/components/cv-uploader";
import { createClient } from "@/lib/supabase/server";
import type { ParsedCv } from "@/lib/anthropic";

export default async function CvPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("region")
    .eq("id", user!.id)
    .maybeSingle();

  const { data: cv } = await supabase
    .from("cvs")
    .select("id, status, file_name, error_message")
    .eq("user_id", user!.id)
    .eq("is_active", true)
    .maybeSingle();

  const { data: cvData } = cv
    ? await supabase
        .from("cv_data")
        .select("*")
        .eq("cv_id", cv.id)
        .maybeSingle()
    : { data: null };

  const data = cvData as unknown as ParsedCv | null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Mi CV</h1>
        <p className="text-sm text-muted-foreground">
          Sube tu CV en PDF y detectaremos tus competencias y experiencia.
        </p>
      </div>

      {cv?.status === "error" && (
        <Card className="border-danger/40">
          <CardContent className="flex items-start gap-3 py-4 text-sm">
            <AlertCircle className="mt-0.5 shrink-0 text-danger" size={18} />
            <div>
              <p className="font-medium text-danger">No pudimos analizar tu CV</p>
              <p className="text-muted-foreground">{cv.error_message}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {data && cv?.status === "parsed" && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="text-success" size={20} />
              <CardTitle>{data.full_name || "Tu perfil"}</CardTitle>
            </div>
            {data.headline && (
              <p className="text-sm text-muted-foreground">{data.headline}</p>
            )}
          </CardHeader>
          <CardContent className="space-y-5">
            {data.summary && <p className="text-sm">{data.summary}</p>}

            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
              {data.location && <span>📍 {data.location}</span>}
              {data.desired_role && <span>🎯 {data.desired_role}</span>}
              {data.seniority && <span>📈 {data.seniority}</span>}
            </div>

            {data.skills?.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-semibold">Competencias</h3>
                <div className="flex flex-wrap gap-1.5">
                  {data.skills.map((s) => (
                    <Badge key={s}>{s}</Badge>
                  ))}
                </div>
              </div>
            )}

            {data.experience?.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-semibold">Experiencia</h3>
                <ul className="space-y-2">
                  {data.experience.map((e, i) => (
                    <li key={i} className="text-sm">
                      <span className="font-medium">{e.role}</span>
                      {e.company && <span> · {e.company}</span>}
                      {e.period && (
                        <span className="text-muted-foreground"> ({e.period})</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {data.education?.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-semibold">Estudios</h3>
                <ul className="space-y-1">
                  {data.education.map((e, i) => (
                    <li key={i} className="text-sm">
                      <span className="font-medium">{e.degree || e.field}</span>
                      {e.institution && <span> · {e.institution}</span>}
                      {e.year && (
                        <span className="text-muted-foreground"> ({e.year})</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {data.languages?.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-semibold">Idiomas</h3>
                <div className="flex flex-wrap gap-1.5">
                  {data.languages.map((l, i) => (
                    <Badge key={i} variant="neutral">
                      {l.language} · {l.level}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            {data ? "Actualizar mi CV" : "Subir mi CV"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CvUploader defaultRegion={profile?.region} />
        </CardContent>
      </Card>
    </div>
  );
}
