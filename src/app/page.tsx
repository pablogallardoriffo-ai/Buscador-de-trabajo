import Link from "next/link";
import { FileText, Target, MessageSquareText } from "lucide-react";
import { Logo } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";

const features = [
  {
    icon: FileText,
    title: "Sube tu CV y listo",
    desc: "Leemos tu PDF y detectamos tus competencias, estudios y experiencia. Sin formularios eternos.",
  },
  {
    icon: Target,
    title: "Solo lo que te encaja",
    desc: "Nada de cientos de ofertas inútiles. Te mostramos únicamente aquellas donde de verdad tienes opciones.",
  },
  {
    icon: MessageSquareText,
    title: "Te ayudamos a destacar",
    desc: "Consejos para cada oferta y un borrador de carta de presentación pensado para esa empresa.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
        <Logo />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Entrar
            </Button>
          </Link>
          <Link href="/login">
            <Button size="sm">Empezar gratis</Button>
          </Link>
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        <section className="mx-auto w-full max-w-3xl px-6 pt-16 pb-12 text-center">
          <span className="inline-block rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary">
            Calidad sobre cantidad
          </span>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Encontrar trabajo, <span className="text-primary">sencillo</span>.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
            Sube tu CV una vez. Te mostramos solo las ofertas donde sabemos que
            tienes las competencias, con consejos para conseguirlas.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link href="/login">
              <Button size="lg">Subir mi CV</Button>
            </Link>
            <Link href="#como-funciona">
              <Button size="lg" variant="outline">
                Cómo funciona
              </Button>
            </Link>
          </div>
        </section>

        <section
          id="como-funciona"
          className="mx-auto grid w-full max-w-5xl gap-5 px-6 pb-20 sm:grid-cols-3"
        >
          {features.map((f) => (
            <Card key={f.title}>
              <CardContent className="pt-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-soft text-primary">
                  <f.icon size={20} />
                </span>
                <h3 className="mt-4 font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5 text-sm text-muted-foreground">
          <Logo showText={false} />
          <span>Es Sencillo · Hecho para Chile</span>
        </div>
      </footer>
    </div>
  );
}
