import Link from 'next/link'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'Términos y Condiciones — misremates',
  description: 'Términos y condiciones de uso de la plataforma misremates.com.mx',
}

const LAST_UPDATED = '10 de mayo de 2026'

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
                Al acceder, navegar, registrarte, publicar productos, comprar, vender, contratar una suscripción
                o utilizar cualquier función de <strong>Misremates.com.mx</strong>, aceptas quedar vinculado por
                estos Términos y Condiciones.
              </p>
              <p>
                Estos Términos aplican a todos los usuarios de la Plataforma, incluyendo visitantes, compradores,
                vendedores, negocios, comercios o cualquier persona que utilice los servicios de Misremates.com.mx.
              </p>
              <p>
                Si no estás de acuerdo con estos Términos, deberás abstenerte de utilizar la Plataforma.
              </p>
              <p>
                El uso continuado de la Plataforma después de cualquier modificación constituye aceptación de
                los Términos actualizados.
              </p>
              <p>
                Al crear una cuenta, contratar un plan, publicar un producto o realizar cualquier operación dentro
                de la Plataforma, declaras que has leído, entendido y aceptado estos Términos y nuestro Aviso de
                Privacidad.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">2. Naturaleza de la plataforma — intermediario</h2>
              <p>
                <strong>Misremates.com.mx es exclusivamente un intermediario tecnológico.</strong> No somos
                vendedor, comprador, subastador, aseguradora, almacenista ni parte de ninguna transacción entre
                usuarios. Los tratos de compraventa se realizan directamente entre el vendedor y el comprador.
              </p>
              <p>
                Misremates.com.mx no tiene posesión, control ni responsabilidad sobre los productos listados.
                No garantizamos la calidad, seguridad, legalidad, autenticidad, veracidad de las descripciones
                ni la capacidad de los vendedores para completar una venta.
              </p>
              <p>
                Misremates.com.mx no participa en la negociación, entrega, almacenamiento, garantía, devolución
                o cumplimiento de las operaciones realizadas entre usuarios.
              </p>
              <p>
                Toda relación comercial o de garantía será exclusivamente entre comprador y vendedor.
              </p>
              <p>
                La Plataforma se proporciona "tal cual" y "según disponibilidad", sin garantías expresas o
                implícitas sobre disponibilidad continua, ausencia de errores o funcionamiento ininterrumpido.
              </p>
              <p>
                Misremates.com.mx no garantiza ventas, tráfico, exposición, contactos comerciales ni resultados
                económicos derivados del uso de la Plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">3. Elegibilidad y registro</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Debes tener al menos 18 años y contar con capacidad legal para crear una cuenta y utilizar la Plataforma.</li>
                <li>Debes proporcionar información veraz, completa y actualizada al registrarte.</li>
                <li>Eres responsable de mantener la confidencialidad de tus credenciales de acceso.</li>
                <li>Una cuenta por persona o entidad legal. Misremates.com.mx se reserva el derecho de eliminar cuentas duplicadas o sospechosas.</li>
                <li>Misremates.com.mx podrá solicitar información o documentación adicional para validar identidad, propiedad de productos o prevenir actividades fraudulentas.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">4. Obligaciones del vendedor</h2>
              <p>Al publicar productos en la Plataforma, el vendedor garantiza y acepta que:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Es el legítimo propietario y/o tiene autorización para vender el producto.</li>
                <li>Las descripciones, fotografías, precios y condiciones son verídicos y no inducen a error.</li>
                <li>El producto no está robado, es legal conforme a la legislación mexicana y cumple con las regulaciones aplicables.</li>
                <li>Es responsable del envío, entrega y cualquier acuerdo post-venta con el comprador.</li>
                <li>Pagará las tarifas de suscripción, comisiones y cargos conforme al plan elegido.</li>
                <li>Indemnizará a Misremates.com.mx frente a cualquier reclamación derivada de sus publicaciones, productos o ventas.</li>
                <li>Misremates.com.mx podrá solicitar pruebas de propiedad, facturas, identificaciones o documentación adicional cuando existan sospechas de fraude, robo o actividad ilícita.</li>
                <li>Publicar información falsa, engañosa o manipulada podrá derivar en suspensión temporal o permanente de la cuenta.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">5. Obligaciones del comprador</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Es responsable de revisar la descripción, condición y precio del producto antes de adquirirlo.</li>
                <li>Acepta comunicarse directamente con el vendedor para acordar entrega, devoluciones y garantías.</li>
                <li>No realizará pagos fuera de los mecanismos habilitados por la Plataforma salvo acuerdo directo con el vendedor.</li>
                <li>El comprador reconoce que las operaciones se realizan bajo su propia responsabilidad y que Misremates.com.mx no garantiza el cumplimiento de las obligaciones del vendedor.</li>
                <li>Misremates.com.mx no actúa como aseguradora, mediador obligatorio ni garante de las transacciones entre usuarios.</li>
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
                <li>Cuentas bancarias, documentos oficiales, identificaciones falsas, métodos de pago no autorizados o mecanismos ilícitos.</li>
                <li>Esquemas piramidales, fraudes financieros o actividades engañosas.</li>
                <li>Cualquier producto o servicio que promueva actividades ilegales o discriminatorias.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">7. Pagos, suscripciones y comisiones</h2>
              <p>
                Los pagos en la Plataforma son procesados por <strong>Stripe</strong>, un proveedor tercero
                de servicios de pago. Misremates.com.mx no almacena datos de tarjetas bancarias. Al usar los
                servicios de pago, aceptas también los{' '}
                <a href="https://stripe.com/mx/legal" target="_blank" rel="noopener noreferrer" className="text-orange-600 underline">
                  Términos y Condiciones de Stripe
                </a>.
              </p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Las suscripciones se cobran de forma mensual y se renuevan automáticamente.</li>
                <li>Puedes cancelar tu suscripción en cualquier momento desde tu panel de control; el acceso al plan se mantiene hasta el fin del período pagado.</li>
                <li>No se realizan reembolsos por períodos parciales, salvo que Misremates.com.mx haya incumplido materialmente sus obligaciones.</li>
                <li>Algunos pagos podrán ser retenidos, revisados o rechazados por Stripe conforme a sus políticas internas de riesgo y cumplimiento.</li>
                <li>Misremates.com.mx podrá suspender cuentas, publicaciones o accesos cuando detecte actividad sospechosa, fraude potencial, uso indebido de tarjetas, contracargos excesivos o intentos de evasión de pagos.</li>
                <li>El usuario será responsable de cualquier contracargo, reclamación bancaria o disputa derivada de operaciones realizadas desde su cuenta.</li>
                <li>Los precios publicados podrán incluir o no impuestos aplicables, los cuales serán informados antes de finalizar el pago.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">8. Propiedad intelectual y contenido del usuario</h2>
              <p>
                Misremates.com.mx, sus logos, diseño, interfaz, código fuente y elementos visuales son
                propiedad de sus titulares y están protegidos por las leyes de propiedad intelectual
                mexicanas e internacionales.
              </p>
              <p>
                Al subir fotografías, descripciones u otro contenido a la Plataforma, el usuario otorga a
                Misremates.com.mx una licencia no exclusiva, gratuita y mundial para mostrar, reproducir y
                distribuir dicho contenido en el contexto de la operación de la Plataforma. El usuario
                garantiza que tiene los derechos necesarios sobre el contenido que sube.
              </p>
              <p>
                Está prohibido copiar, reproducir, extraer, automatizar, realizar scraping o reutilizar
                contenido de la Plataforma sin autorización previa por escrito.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">9. Limitación de responsabilidad</h2>
              <p>
                En la máxima medida permitida por la legislación aplicable, Misremates.com.mx no será
                responsable de:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Daños directos, indirectos, incidentales, especiales o consecuentes derivados del uso o imposibilidad de uso de la Plataforma.</li>
                <li>Disputas, fraudes o incumplimientos entre vendedores y compradores.</li>
                <li>Pérdida de ganancias, datos, reputación o negocios.</li>
                <li>Interrupciones del servicio por mantenimiento, fallas técnicas, errores humanos o causas de fuerza mayor.</li>
                <li>Fallas derivadas de servicios externos como proveedores de hosting, bases de datos, internet, procesadores de pago o plataformas de terceros.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">10. Suspensión y terminación de cuentas</h2>
              <p>
                Misremates.com.mx se reserva el derecho de suspender, limitar o eliminar cualquier cuenta,
                con o sin previo aviso, por:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Violación de estos Términos.</li>
                <li>Actividad fraudulenta, engañosa o ilegal.</li>
                <li>Reclamaciones de terceros o autoridades.</li>
                <li>Falta de pago de la suscripción.</li>
                <li>Intentos de fraude, evasión de pagos o manipulación de la Plataforma.</li>
              </ul>
              <p>
                Misremates.com.mx podrá conservar registros y colaborar con autoridades cuando existan
                sospechas de fraude, robo, lavado de dinero o actividades ilícitas.
              </p>
              <p>
                La terminación de una cuenta no genera derecho a reembolso de suscripciones pagadas,
                salvo por causa imputable a Misremates.com.mx.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">11. Uso indebido de la plataforma</h2>
              <p>
                Queda prohibido utilizar bots, automatizaciones, scraping, ingeniería inversa, spam,
                ataques informáticos o cualquier mecanismo que afecte el funcionamiento, seguridad o
                integridad de la Plataforma.
              </p>
              <p>
                También queda prohibido utilizar la Plataforma para contactar usuarios con el objetivo
                de concretar operaciones fuera de ella para evitar pagos, comisiones o mecanismos de seguridad.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">12. Privacidad y datos personales</h2>
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
              <h2 className="text-lg font-bold text-slate-900">13. Modificaciones</h2>
              <p>
                Misremates.com.mx podrá modificar estos Términos en cualquier momento. Los cambios
                materiales se notificarán por correo electrónico o mediante aviso en la Plataforma con
                al menos 15 días de anticipación.
              </p>
              <p>
                El uso continuado de la Plataforma tras la entrada en vigor de los cambios constituye
                aceptación de los nuevos términos.
              </p>
              <p>
                Si el usuario no está de acuerdo con las modificaciones, deberá dejar de utilizar la
                Plataforma y cancelar su cuenta antes de la entrada en vigor de los cambios.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">14. Legislación aplicable y jurisdicción</h2>
              <p>
                Estos términos se rigen por las leyes de los Estados Unidos Mexicanos.
              </p>
              <p>
                Para cualquier controversia, las partes se someten a la jurisdicción de los tribunales
                competentes de México, renunciando a cualquier otro fuero que pudiera corresponderles
                por razón de su domicilio presente o futuro.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">15. Contacto</h2>
              <p>
                Para dudas legales o relacionadas con estos Términos, escríbenos a{' '}
                <a href="mailto:legal@misremates.com.mx" className="text-orange-600 underline">
                  legal@misremates.com.mx
                </a>.
              </p>
            </section>

          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
