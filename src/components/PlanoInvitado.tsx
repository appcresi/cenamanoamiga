import { CLASE_PLANO, FondoPlano, MesaDibujo, type Silla } from "@/components/MesaDibujo";
import { posicionDe, posicionesEnGrilla } from "@/lib/plano";
import type { VistaInvitacion } from "@/lib/tipos";

/**
 * Plano de solo lectura para el invitado: resalta su mesa (o las de su organización)
 * y, si corresponde, su lugar. No muestra qué lugares ocupan los demás.
 */
export function PlanoInvitado({ plano }: { plano: VistaInvitacion["plano"] }) {
  const grilla = posicionesEnGrilla(plano.mesas);
  const destacadas = new Set(plano.destacadas);

  return (
    <section
      aria-label={destacadas.size > 1 ? "Ubicación de tus mesas en el salón" : "Ubicación de tu mesa en el salón"}
      className="w-full rounded-2xl border border-borde bg-superficie p-2 sm:p-4"
    >
      <div className={`${CLASE_PLANO} overflow-hidden rounded-xl`}>
        <FondoPlano />
        {plano.mesas.map((m, n) => {
          const p = posicionDe(m, grilla);
          const esSuya = destacadas.has(m.id);
          const sillas: Silla[] = Array.from({ length: m.capacidad }, (_, i) => ({
            estado: plano.silla?.mesaId === m.id && plano.silla.indice === i ? "destacada" : "neutra",
          }));
          return (
            <div
              key={m.id}
              role="img"
              aria-label={esSuya ? `Mesa ${m.numero} (tu mesa)` : `Mesa ${m.numero}`}
              // Las mesas aparecen de a una; la del invitado, al final y con rebote.
              style={{ left: `${p.x}%`, top: `${p.y}%`, animationDelay: `${esSuya ? 700 : 250 + n * 40}ms` }}
              className={`absolute aspect-square w-[14%] -translate-x-1/2 -translate-y-1/2 animate-pop ${esSuya ? "z-10" : ""}`}
            >
              <MesaDibujo numero={m.numero} nombre={m.nombre} sillas={sillas} estado={esSuya ? "destacada" : "apagada"} />
            </div>
          );
        })}
      </div>
      <ul className="mt-1 flex justify-center gap-4 text-[11px] leading-4 text-foreground/70 sm:mt-2 sm:text-xs">
        <li className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-acento" /> {destacadas.size > 1 ? "Tus mesas" : "Tu mesa"}
        </li>
        {plano.silla && (
          <li className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-acento ring-2 ring-acento/35" /> Tu lugar
          </li>
        )}
      </ul>
    </section>
  );
}
