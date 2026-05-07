import Link from 'next/link'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'Términos y Condiciones — misremates',
  description: 'Términos y condiciones de uso de la plataforma misremates.com.mx',
}

const LAST_UPDATED = '7 de mayo de 2026'

export default async function TerminosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <>
      <Navbar user={user ? { email: user.email! } : null} />
      <main className="py-12">
        <div className="mx-auto max-w-3xl px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900">Términos y Condiciones</h1>
            <p className="mt-2 text-sm text-slate-500">Última actualización: {LAST_UPDATED}</p>
          </div>

          <div className="prose prose-slate max-w-none space-y-8 text-sm leading-relaxed text-slate-700">

            <section>
              <h2 className="text-lg font-bold text-slate-900">1. Aceptación de los términos</h2>
              <p>
                Al acceder o usar la plataforma <strong>misremates.com.mx</strong> ("la Plataforma", "misremates"),
                operada desde México, aceptas quedar vinculado por estos Términos y Condiciones ("Términos").
                Si no estás de acuerdo, no debes usar la Plataforma.
              </p>
              <p>
                Estos Términos aplican a todos los usuarios: visitantes, compradores y vendedores.
                El uso continuado de la Plataforma tras cualquier modificación constituye aceptación de los
                Términos actualizados.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">2. Naturaleza de la plataforma — intermediario</h2>
              <p>
                <strong>misremates es exclusivamente un intermediario tecnológico.</strong> No somos vendedor,
                comprador, subastador, ni parte de ninguna transacción entre usuarios. Los contratos de
                compraventa se celebran directamente entre el vendedor y el comprador.
              </p>
              <p>
                misremates no tiene posesión, control ni responsabilidad sobre los productos listados.
                No garantizamos la calidad, seguridad, legalidad, veracidad de las descripciones ni la
                capacidad de los vendedores para completar una venta.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">3. Elegibilidad y registro</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Debes tener al menos 18 años para crear una cuenta de vendedor.</li>
                <li>Debes proporcionar información veraz, completa y actualizada al registrarte.</li>
                <li>Eres responsable de mantener la confidencialidad de tus credenciales de acceso.</li>
                <li>Una cuenta por persona o entidad legal. misremates se reserva el derecho de eliminar cuentas duplicadas.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">4. Obligaciones del vendedor</h2>
              <p>Al publicar productos en la Plataforma, el vendedor garantiza y acepta que:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Es el legítimo propietario o tiene autorización para vender el producto.</li>
                <li>Las descripciones, fotografías, precios y condiciones son verídicos y no inducen a error.</li>
                <li>El producto no está robado, es legal conforme a la legislación mexicana y cumple con las regulaciones aplicables.</li>
                <li>Es responsable del envío, entrega y cualquier acuerdo post-venta con el comprador.</li>
                <li>Pagará las tarifas de suscripción conforme al plan elegido.</li>
                <li>Indemnizará a misremates frente a cualquier reclamación derivada de sus listados o ventas.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">5. Obligaciones del comprador</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Es responsable de revisar la descripción, condición y precio del producto antes de adquirirlo.</li>
                <li>Acepta comunicarse directamente con el vendedor para acordar entrega, devoluciones y garantías.</li>
                <li>No realizará pagos fuera de los mecanismos habilitados por la Plataforma salvo acuerdo directo con el vendedor.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">6. Productos y contenidos prohibidos</h2>
              <p>Está estrictamente prohibido publicar o comercializar:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Artículos ilegales o cuya venta esté restringida por ley mexicana.</li>
                <li>Armas, municiones, explosivos o cualquier artículo peligroso no autorizado.</li>
                <li>Sustancias controladas, medicamentos sin prescripción o productos farmacéuticos no regulados.</li>
                <li>Artículos falsificados, de imitación o que infrinjan derechos de propiedad intelectual.</li>
                <li>Material pornográfico, obsceno o que explote a menores.</li>
                <li>Animales vivos o partes de especies protegidas.</li>
                <li>Cualquier producto o servicio que promueva actividades ilegales o discriminatorias.</li>
              </ul>
              <p>
                misremates puede retirar cualquier listado que considere, a su exclusiva discreción, que viola
                estos Términos o la legislación vigente, sin previo aviso ni responsabilidad.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">7. Pagos, suscripciones y comisiones</h2>
              <p>
                Los pagos en la Plataforma son procesados por <strong>Stripe</strong>, un proveedor tercero
                de servicios de pago. misremates no almacena datos de tarjetas bancarias. Al usar los servicios
                de pago, aceptas también los{' '}
                <a href="https://stripe.com/mx/legal" target="_blank" rel="noopener noreferrer" className="text-orange-600 underline">
                  Términos de Servicio de Stripe
                </a>.
              </p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Las suscripciones se cobran de forma mensual y se renuevan automáticamente.</li>
                <li>Puedes cancelar tu suscripción en cualquier momento desde tu panel de control; el acceso al plan se mantiene hasta el fin del período pagado.</li>
                <li>No se realizan reembolsos por períodos parciales, salvo que misremates haya incumplido materialmente sus obligaciones.</li>
                <li>misremates se reserva el derecho de modificar los precios de los planes con 30 días de aviso previo.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">8. Propiedad intelectual y contenido del usuario</h2>
              <p>
                misremates y sus logos, diseño y código fuente son propiedad de sus titulares y están
                protegidos por las leyes de propiedad intelectual mexicanas e internacionales.
              </p>
              <p>
                Al subir fotografías, descripciones u otro contenido a la Plataforma, el usuario otorga a
                misremates una licencia no exclusiva, gratuita y mundial para mostrar, reproducir y distribuir
                dicho contenido en el contexto de la operación de la Plataforma. El usuario garantiza que
                tiene los derechos necesarios sobre el contenido que sube.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">9. Limitación de responsabilidad</h2>
              <p>
                En la máxima medida permitida por la legislación aplicable, misremates no será responsable de:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Daños directos, indirectos, incidentales, especiales o consecuentes derivados del uso o imposibilidad de uso de la Plataforma.</li>
                <li>Disputas, fraudes o incumplimientos entre vendedores y compradores.</li>
                <li>Pérdida de ganancias, datos o negocios.</li>
                <li>Interrupciones del servicio por mantenimiento, fallas técnicas o causas de fuerza mayor.</li>
              </ul>
              <p>
                En ningún caso la responsabilidad total de misremates frente a un usuario excederá el monto
                total pagado por dicho usuario en concepto de suscripción durante los 3 meses anteriores al
                evento que origina la reclamación.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">10. Suspensión y terminación de cuentas</h2>
              <p>
                misremates se reserva el derecho de suspender, limitar o eliminar cualquier cuenta, con o
                sin previo aviso, por:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Violación de estos Términos.</li>
                <li>Actividad fraudulenta, engañosa o ilegal.</li>
                <li>Reclamaciones de terceros o autoridades.</li>
                <li>Falta de pago de la suscripción.</li>
              </ul>
              <p>
                La terminación de una cuenta no genera derecho a reembolso de suscripciones pagadas,
                salvo por causa imputable a misremates.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">11. Privacidad y datos personales</h2>
              <p>
                El tratamiento de tus datos personales se rige por nuestro{' '}
                <Link href="/privacidad" className="text-orange-600 underline">
                  Aviso de Privacidad
                </Link>
                , elaborado conforme a la Ley Federal de Protección de Datos Personales en Posesión de
                Particulares (LFPDPPP) y su Reglamento.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">12. Modificaciones</h2>
              <p>
                misremates puede modificar estos Términos en cualquier momento. Los cambios materiales se
                notificarán por correo electrónico o mediante aviso en la Plataforma con al menos 15 días
                de anticipación. El uso continuado tras la vigencia de los cambios implica aceptación.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">13. Legislación aplicable y jurisdicción</h2>
              <p>
                Estos Términos se rigen por las leyes de los Estados Unidos Mexicanos. Para cualquier
                controversia, las partes se someten a la jurisdicción de los tribunales competentes de la
                Ciudad de México, renunciando a cualquier otro fuero que pudiera corresponderles por razón
                de su domicilio presente o futuro.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">14. Contacto</h2>
              <p>
                Para dudas sobre estos Términos, escríbenos a{' '}
                <a href="mailto:soporte@misremates.com.mx" className="text-orange-600 underline">
                  soporte@misremates.com.mx
                </a>.
              </p>
            </section>

          </div>

          <div className="mt-10 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-700">
            Este documento es una base de referencia. Para uso comercial, se recomienda revisión por un
            abogado especializado en comercio electrónico y derecho mexicano.
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
