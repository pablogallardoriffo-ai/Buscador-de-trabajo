import { Card, CardContent } from "@/components/ui/card";

export default function CvPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-1 text-2xl font-semibold tracking-tight">Mi CV</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Sube tu CV en PDF y la IA detectará tus competencias y experiencia.
      </p>
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          La carga de CV y el análisis con IA se activan en la Fase 1.
        </CardContent>
      </Card>
    </div>
  );
}
