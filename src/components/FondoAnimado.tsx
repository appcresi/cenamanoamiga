/** Manchas de color de la marca que se mueven lentamente detrás del contenido. */
export function FondoAnimado() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden print:hidden">
      <div className="absolute -left-24 -top-24 size-80 animate-deriva rounded-full bg-secundario/25 blur-3xl dark:bg-secundario/15" />
      <div
        className="absolute -right-32 top-1/3 size-96 animate-deriva rounded-full bg-acento/15 blur-3xl dark:bg-acento/10"
        style={{ animationDelay: "-7s", animationDirection: "alternate-reverse" }}
      />
      <div
        className="absolute -bottom-32 left-1/4 size-80 animate-deriva rounded-full bg-primario/10 blur-3xl"
        style={{ animationDelay: "-13s" }}
      />
    </div>
  );
}
