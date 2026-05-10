import Link from 'next/link'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'Aviso de Privacidad — misremates',
  description: 'Aviso de privacidad de misremates.com.mx conforme a la LFPDPPP.',
}

const LAST_UPDATED = '10 de mayo de 2026'

export default async function PrivacidadPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <>
      <Navbar user={user ? { email: user.email! } : null} />
      <main className="py-12">
        <div className="mx-auto max-w-3xl px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900">Aviso de Privacidad</h1>
            <p className="mt-2 text-sm text-slate-500">Última actualización: {LAST_UPDATED}</p>
          </div>

          <div className="prose prose-slate max-w-none space-y-8 text-sm leading-relaxed text-slate-700">

            <section>
              <h2 className="text-lg font-bold text-slate-900">1. Responsable del tratamiento</h2>
              <p>
                <strong>misremates.com.mx</strong>, es responsable del tratamiento de tus datos
                personales, conforme a la{' '}
                <strong>
                  Ley Federal de Protección de Datos Personales en Posesión de Particulares (LFPDPPP)
                </strong>{' '}
                y su Reglamento.
              </p>
              <p>
                Para ejercer tus derechos o resolver dudas, contáctanos en:{' '}
                <a href="mailto:soporte@misremates.com.mx" className="text-orange-600 underline">
                  soporte@misremates.com.mx
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">2. Datos personales que recabamos</h2>
              <p>Son los siguientes:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Datos de identificación:</strong> nombre completo, dirección de correo electrónico.</li>
                <li><strong>Datos de contacto:</strong> número de teléfono / WhatsApp (opcional).</li>
                <li><strong>Datos de perfil de tienda:</strong> nombre de tienda, descripción, ciudad, estado.</li>
                <li><strong>Datos de pago:</strong> procesados directamente por Stripe. Misremates.com.mx, no almacena datos de tarjetas bancarias.</li>
                <li><strong>Datos de uso:</strong> dirección IP, tipo de navegador, páginas visitadas, fecha y hora de acceso (datos de carácter técnico).</li>
              </ul>
              <p>
                No recabamos datos personales sensibles conforme a la LFPDPPP (salud, biometría,
                religión, etc.).
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">3. Finalidades del tratamiento</h2>
              <p><strong>Finalidades primarias (necesarias para la relación comercial):</strong></p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Crear y gestionar tu cuenta de usuario.</li>
                <li>Operar tu tienda en línea dentro de la Plataforma.</li>
                <li>Procesar suscripciones y pagos.</li>
                <li>Enviarte comunicaciones transaccionales (confirmaciones, recibos, alertas de cuenta).</li>
                <li>Atender solicitudes de soporte y resolver disputas.</li>
                <li>Cumplir obligaciones legales y regulatorias.</li>
              </ul>
              <p className="mt-3"><strong>Finalidades secundarias (puedes oponerte):</strong></p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Enviarte comunicaciones de marketing sobre nuevas funcionalidades, ofertas y actualizaciones de la plataforma.</li>
                <li>Elaborar estadísticas y análisis de uso agregados.</li>
              </ul>
              <p>
                Si no deseas que tus datos sean tratados para las finalidades secundarias, envía un correo
                a{' '}
                <a href="mailto:soporte@misremates.com.mx" className="text-orange-600 underline">
                  soporte@misremates.com.mx
                </a>{' '}
                indicando tu solicitud de oposición.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">4. Transferencia de datos</h2>
              <p>Tus datos pueden ser compartidos con:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>Stripe, Inc.</strong> — procesamiento de pagos, con domicilio en EUA. Consulta su{' '}
                  <a href="https://stripe.com/mx/privacy" target="_blank" rel="noopener noreferrer" className="text-orange-600 underline">
                    política de privacidad
                  </a>.
                </li>
                <li><strong>Supabase, Inc.</strong> — base de datos e infraestructura en la nube.</li>
                <li><strong>Vercel, Inc.</strong> — hospedaje de la Plataforma.</li>
                <li><strong>Autoridades competentes</strong> — cuando sea requerido por ley o mandato judicial.</li>
              </ul>
              <p>
                Misremates.com.mx, no vende ni comercializa tus datos personales a terceros con fines
                publicitarios.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">5. Derechos ARCO</h2>
              <p>
                Conforme a la LFPDPPP, tienes derecho a{' '}
                <strong>Acceder, Rectificar, Cancelar u Oponerte</strong> (derechos ARCO) al
                tratamiento de tus datos personales.
              </p>
              <p>Para ejercer tus derechos ARCO:</p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>
                  Envía tu solicitud a{' '}
                  <a href="mailto:soporte@misremates.com.mx" className="text-orange-600 underline">
                    soporte@misremates.com.mx
                  </a>.
                </li>
                <li>Incluye tu nombre completo, correo de registro y descripción del derecho que deseas ejercer.</li>
                <li>Adjunta una copia de tu identificación oficial.</li>
              </ol>
              <p>
                Responderemos en un plazo máximo de 20 días hábiles contados desde la recepción de tu
                solicitud completa.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">6. Cookies y tecnologías de rastreo</h2>
              <p>
                Utilizamos cookies esenciales para el funcionamiento de la Plataforma (sesión de usuario,
                preferencias de idioma). También podemos usar cookies analíticas para medir el uso del
                sitio de forma agregada.
              </p>
              <p>
                Puedes configurar tu navegador para rechazar cookies; sin embargo, algunas funciones de
                la Plataforma pueden verse afectadas.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">7. Seguridad de los datos</h2>
              <p>
                Implementamos medidas técnicas y organizativas para proteger tus datos personales contra
                acceso no autorizado, pérdida o divulgación indebida, incluyendo:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Cifrado en tránsito mediante HTTPS/TLS.</li>
                <li>Controles de acceso basados en roles a la base de datos.</li>
                <li>Autenticación gestionada por Supabase Auth.</li>
                <li>Datos de tarjeta procesados exclusivamente por Stripe (PCI-DSS compliant).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">8. Retención de datos</h2>
              <p>
                Conservamos tus datos mientras tengas una cuenta activa en la Plataforma o mientras sea
                necesario para cumplir obligaciones legales. Al eliminar tu cuenta, tus datos personales
                identificables se eliminan o anonimizan en un plazo de 30 días, salvo los que debamos
                conservar por obligación legal.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">9. Cambios a este Aviso</h2>
              <p>
                Este Aviso de Privacidad puede actualizarse. Los cambios materiales se comunicarán por
                correo electrónico o mediante aviso en la Plataforma. El uso continuado tras la
                publicación de los cambios implica aceptación.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">10. Contacto y INAI</h2>
              <p>
                Para cualquier queja o duda sobre el tratamiento de tus datos, contáctanos en{' '}
                <a href="mailto:soporte@misremates.com.mx" className="text-orange-600 underline">
                  soporte@misremates.com.mx
                </a>
                . Si consideras que tu solicitud no fue atendida correctamente, tienes derecho a acudir
                al Instituto Nacional de Transparencia, Acceso a la Información y Protección de Datos
                Personales (INAI) en{' '}
                <a href="https://www.inai.org.mx" target="_blank" rel="noopener noreferrer" className="text-orange-600 underline">
                  www.inai.org.mx
                </a>.
              </p>
            </section>

          </div>

          <div className="mt-8 text-sm text-slate-500">
            Ver también:{' '}
            <Link href="/terminos" className="text-orange-600 underline">
              Términos y Condiciones
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
