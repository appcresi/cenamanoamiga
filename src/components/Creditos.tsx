/** Aclaración de autoría que se muestra en el pie de las páginas. */
export function Creditos({ className = "" }: { className?: string }) {
  return (
    <p className={`text-center text-[11px] ${className || "text-foreground/50"}`}>
      Plataforma desarrollada por alumnos del Colegio Mano Amiga Santa María
    </p>
  );
}
