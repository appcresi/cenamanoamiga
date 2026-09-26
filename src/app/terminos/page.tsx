import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Creditos } from "@/components/Creditos";
import { Encabezado } from "@/components/Encabezado";

export const metadata: Metadata = {
  title: "Términos y condiciones · Cena de Beneficio Mano Amiga",
  description:
    "Términos y condiciones de uso y política de privacidad de la plataforma de invitados de la Cena de Beneficio del Colegio Mano Amiga Santa María.",
};

const ULTIMA_ACTUALIZACION = "25 de septiembre de 2026";

function Seccion({ id, titulo, children }: { id: string; titulo: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-4">
      <h2 className="mb-2 text-lg font-semibold text-primario">{titulo}</h2>
      <div className="flex flex-col gap-3 text-foreground/85">{children}</div>
    </section>
  );
}

const SECCIONES = [
  { id: "objeto", titulo: "1. Objeto y aceptación" },
  { id: "usuarios", titulo: "2. Usuarios de la plataforma" },
  { id: "uso", titulo: "3. Uso permitido" },
  { id: "links", titulo: "4. Links, códigos QR y búsqueda" },
  { id: "mesas", titulo: "5. Mesas y ubicación" },
  { id: "organizadores", titulo: "6. Obligaciones de los organizadores" },
  { id: "datos", titulo: "7. Protección de datos personales" },
  { id: "responsabilidad", titulo: "8. Disponibilidad y responsabilidad" },
  { id: "propiedad", titulo: "9. Propiedad intelectual" },
  { id: "cambios", titulo: "10. Modificaciones" },
  { id: "ley", titulo: "11. Ley aplicable" },
  { id: "contacto", titulo: "12. Contacto" },
];

export default function Terminos() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-6 text-[15px] leading-relaxed sm:py-10">
      <Encabezado titulo="Términos y condiciones" compacto />
      <p className="text-sm text-foreground/60">Última actualización: {ULTIMA_ACTUALIZACION}</p>

      <nav aria-label="Índice" className="rounded-2xl border border-borde bg-superficie p-4 text-sm">
        <ol className="grid gap-1 sm:grid-cols-2">
          {SECCIONES.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="text-primario hover:underline">
                {s.titulo}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <Seccion id="objeto" titulo={SECCIONES[0].titulo}>
        <p>
          Estos términos regulan el uso de la plataforma de gestión de invitados de la Cena de
          Beneficio del Colegio Mano Amiga Santa María (la &quot;Plataforma&quot;), organizada por la
          Fundación Mano Amiga (la &quot;Fundación&quot;).
        </p>
        <p>
          La Plataforma fue desarrollada por alumnos del Colegio Mano Amiga Santa María. La
          Fundación es la responsable de su uso y de los datos que se cargan en ella.
        </p>
        <p>
          La Plataforma permite a los invitados consultar su mesa, su ubicación en el salón y los
          datos del evento, y a los organizadores administrar invitados, organizaciones y mesas.
        </p>
        <p>
          Al usar la Plataforma aceptás estos términos. Si no estás de acuerdo, no la utilices y
          comunicate con la Fundación para recibir la información del evento por otro medio.
        </p>
      </Seccion>

      <Seccion id="usuarios" titulo={SECCIONES[1].titulo}>
        <p>
          <strong>Invitados:</strong> acceden sin registrarse, mediante un link o código QR personal,
          su DNI o el nombre de la organización por la que asisten.
        </p>
        <p>
          <strong>Organizadores:</strong> personas autorizadas por la Fundación que ingresan con su
          cuenta de Google para cargar y administrar la información del evento. El acceso es
          personal e intransferible y la Fundación puede revocarlo en cualquier momento.
        </p>
      </Seccion>

      <Seccion id="uso" titulo={SECCIONES[2].titulo}>
        <p>La Plataforma debe usarse solo para fines relacionados con el evento. No está permitido:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>consultar la información de otras personas sin su autorización, por ejemplo, buscando DNI ajenos;</li>
          <li>intentar acceder a secciones o datos para los que no se tiene permiso;</li>
          <li>realizar consultas masivas o automatizadas, o afectar el funcionamiento de la Plataforma;</li>
          <li>usar la información obtenida para fines comerciales, publicitarios o ajenos al evento.</li>
        </ul>
        <p>La Fundación puede bloquear el acceso a quien no respete estas reglas.</p>
      </Seccion>

      <Seccion id="links" titulo={SECCIONES[3].titulo}>
        <p>
          Cada invitado y cada organización recibe un link y un código QR propios. Te pedimos que no
          los compartas con personas ajenas a tu invitación: quien tenga el link puede ver la
          información asociada.
        </p>
        <p>
          La búsqueda por nombre de organización (empresas, fundaciones, asociaciones, bancos u
          otras instituciones) muestra públicamente las mesas asignadas a esa organización, sin
          nombres de invitados. Los grupos particulares o familiares no aparecen en esta búsqueda.
          Si tu organización prefiere no figurar, pedíselo a la Fundación.
        </p>
      </Seccion>

      <Seccion id="mesas" titulo={SECCIONES[4].titulo}>
        <p>
          La mesa, el lugar y el plano del salón que muestra la Plataforma son orientativos y pueden
          cambiar hasta el día del evento por razones de organización. Te recomendamos volver a
          consultarlos cerca de la fecha. Ante cualquier diferencia, prevalecen las indicaciones del
          personal de la Fundación en el lugar.
        </p>
      </Seccion>

      <Seccion id="organizadores" titulo={SECCIONES[5].titulo}>
        <p>Quienes administran la Plataforma se comprometen a:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>usar los datos de los invitados solo para organizar el evento;</li>
          <li>mantener la confidencialidad de esa información y no descargarla, copiarla ni compartirla fuera de la Fundación sin autorización;</li>
          <li>cargar información veraz y corregir los errores que detecten;</li>
          <li>no compartir su cuenta y avisar de inmediato a la Fundación si sospechan un acceso indebido.</li>
        </ul>
      </Seccion>

      <Seccion id="datos" titulo={SECCIONES[6].titulo}>
        <p>
          <strong>Responsable:</strong> la Fundación Mano Amiga es responsable de la base de datos de
          invitados del evento.
        </p>
        <p>
          <strong>Datos que tratamos:</strong> nombre y apellido, DNI, email, teléfono, organización
          por la que asistís, mesa asignada, confirmación de asistencia, hora de ingreso el día del evento y notas
          internas de organización. Los organizadores además ingresan con su email de Google.
        </p>
        <p>
          <strong>Para qué los usamos:</strong> identificar a los invitados, asignar y comunicar
          mesas y lugares, organizar el ingreso y enviar información sobre el evento. No los usamos
          para publicidad ni los vendemos o cedemos a terceros.
        </p>
        <p>
          <strong>Proveedores:</strong> la información se almacena en servicios de Google (Firebase),
          que actúa como proveedor tecnológico y puede alojar los datos fuera de la Argentina, con
          medidas de seguridad adecuadas. El acceso está restringido a los organizadores autorizados.
        </p>
        <p>
          <strong>Conservación:</strong> conservamos los datos por el tiempo necesario para organizar
          el evento y cumplir las obligaciones que correspondan. Luego los eliminamos o anonimizamos.
        </p>
        <p>
          <strong>Tus derechos:</strong> podés pedir el acceso, la rectificación, la actualización o
          la supresión de tus datos contactando a la Fundación (ver punto 12). La información que
          nos brindás es voluntaria, pero sin ella no podremos asignarte una mesa ni identificarte en
          la Plataforma.
        </p>
        <p className="rounded-xl border border-borde bg-superficie p-4 text-sm">
          El titular de los datos personales tiene la facultad de ejercer el derecho de acceso a los
          mismos en forma gratuita a intervalos no inferiores a seis meses, salvo que se acredite un
          interés legítimo al efecto conforme lo establecido en el artículo 14, inciso 3 de la Ley
          N° 25.326. La AGENCIA DE ACCESO A LA INFORMACIÓN PÚBLICA, en su carácter de Órgano de
          Control de la Ley N° 25.326, tiene la atribución de atender las denuncias y reclamos que
          interpongan quienes resulten afectados en sus derechos por incumplimiento de las normas
          vigentes en materia de protección de datos personales.
        </p>
        <p>
          <strong>Cookies:</strong> la Plataforma no usa cookies publicitarias ni de seguimiento. Solo
          se guarda en el navegador de los organizadores la información necesaria para mantener su
          sesión iniciada.
        </p>
      </Seccion>

      <Seccion id="responsabilidad" titulo={SECCIONES[7].titulo}>
        <p>
          La Fundación procura que la Plataforma funcione de forma continua y que la información sea
          correcta, pero no garantiza que esté libre de interrupciones o errores. Es una herramienta
          complementaria: ante cualquier inconveniente, la Fundación informará las mesas por otros
          medios. La Fundación no es responsable por el uso indebido de links o códigos QR que el
          invitado haya compartido con terceros.
        </p>
      </Seccion>

      <Seccion id="propiedad" titulo={SECCIONES[8].titulo}>
        <p>
          El nombre y el logo de Mano Amiga, y los contenidos de la Plataforma, pertenecen a la
          Fundación o a sus titulares y no pueden usarse sin autorización.
        </p>
      </Seccion>

      <Seccion id="cambios" titulo={SECCIONES[9].titulo}>
        <p>
          La Fundación puede actualizar estos términos. La versión vigente es siempre la publicada en
          esta página, con su fecha de última actualización.
        </p>
      </Seccion>

      <Seccion id="ley" titulo={SECCIONES[10].titulo}>
        <p>
          Estos términos se rigen por las leyes de la República Argentina, en particular la Ley
          N° 25.326 de Protección de los Datos Personales.
        </p>
      </Seccion>

      <Seccion id="contacto" titulo={SECCIONES[11].titulo}>
        <p>
          Para consultas sobre estos términos o para ejercer tus derechos sobre tus datos, comunicate
          con la Fundación Mano Amiga por sus canales oficiales o respondiendo al mensaje con el que
          recibiste tu invitación.
        </p>
      </Seccion>

      <footer className="flex flex-col items-center gap-1 py-2">
        <Link href="/" className="text-sm text-foreground/50 hover:text-primario">
          Volver al inicio
        </Link>
        <Creditos />
      </footer>
    </main>
  );
}
