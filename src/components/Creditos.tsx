/** Aclaración de autoría que se muestra en el pie de las páginas. */
export function Creditos({ className = "" }: { className?: string }) {
  return (
    <p className={`text-center text-[11px] text-foreground/50 ${className}`}>
      Plataforma desarrollada por alumnos del Colegio Mano Amiga Santa María
    </p>
  );
}
