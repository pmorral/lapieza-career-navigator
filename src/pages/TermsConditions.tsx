export function TermsConditions() {
  return (
    <div className="min-h-screen bg-background py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Términos y Condiciones
          </h1>
          <p className="text-lg text-muted-foreground">
            Academy by LaPieza - Programa de Empleabilidad 360°
          </p>
          <div className="mt-6">
            <a
              href="/"
              className="text-primary hover:underline font-medium"
            >
              ← Regresa al inicio
            </a>
          </div>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Objeto</h2>
            <p className="text-muted-foreground leading-relaxed">
              Academy by LaPieza ofrece un programa de empleabilidad 100% digital, diseñado para proporcionar herramientas, recursos y acompañamiento en la búsqueda de empleo. El programa busca mejorar la empleabilidad del usuario, pero no garantiza la colocación laboral.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Duración y acceso</h2>
            <ul className="text-muted-foreground leading-relaxed space-y-2 list-disc list-inside">
              <li>El programa tiene dos modalidades: 6 meses y 12 meses, contados a partir de la activación de la cuenta.</li>
              <li>El acceso es personal e intransferible.</li>
              <li>El usuario se compromete a no compartir credenciales ni materiales con terceros.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Servicios incluidos</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Según el plan contratado, el programa puede incluir:
            </p>
            <ul className="text-muted-foreground leading-relaxed space-y-2 list-disc list-inside">
              <li>Plataforma e-learning con contenidos especializados.</li>
              <li>Sesiones grupales quincenales de empleabilidad.</li>
              <li>Tablero digital para la gestión de vacantes.</li>
              <li>Simulaciones de entrevistas en inglés y español con IA.</li>
              <li>Herramientas para optimización de CV y LinkedIn.</li>
              <li>Acompañamiento vía WhatsApp con un Career Coach.</li>
              <li>Adicionalmente, el usuario puede contratar servicios on demand con costo preferente (ej. vacantes personalizadas, asesorías individuales).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Pagos y precios</h2>
            <ul className="text-muted-foreground leading-relaxed space-y-2 list-disc list-inside">
              <li>El pago debe realizarse al momento de la inscripción, en una sola exhibición.</li>
              <li>Los precios de introducción son exclusivos para early adopters y tienen vigencia limitada.</li>
              <li>No se ofrecen mensualidades ni parcialidades.</li>
              <li>No se realizan reembolsos una vez iniciado el programa.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Responsabilidades del usuario</h2>
            <ul className="text-muted-foreground leading-relaxed space-y-2 list-disc list-inside">
              <li>Proporcionar información veraz y actualizada al registrarse.</li>
              <li>Participar activamente en las actividades sugeridas (sesiones, ejercicios, uso de herramientas).</li>
              <li>Usar los recursos del programa únicamente para fines personales y profesionales.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Limitación de responsabilidad</h2>
            <ul className="text-muted-foreground leading-relaxed space-y-2 list-disc list-inside">
              <li>Academy by LaPieza no se responsabiliza por decisiones de contratación de terceros, ni por factores externos al programa (ej. condiciones del mercado laboral).</li>
              <li>El compromiso de Academy es ofrecer herramientas, contenidos y acompañamiento para que el usuario maximice sus oportunidades.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Soporte técnico</h2>
            <p className="text-muted-foreground leading-relaxed">
              El soporte de la plataforma se brinda vía WhatsApp, en horario laboral, para resolver dudas técnicas o de uso.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Privacidad y datos personales</h2>
            <p className="text-muted-foreground leading-relaxed">
              El tratamiento de los datos personales se rige por el Aviso de Privacidad disponible en: lapieza.io/es/legal/aviso-de-privacidad.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. Modificaciones del programa</h2>
            <p className="text-muted-foreground leading-relaxed">
              Academy by LaPieza se reserva el derecho de modificar o actualizar los contenidos y servicios de la plataforma, siempre con el fin de mejorar la experiencia del usuario. Cualquier cambio sustancial será comunicado por los canales oficiales.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">10. Aceptación</h2>
            <p className="text-muted-foreground leading-relaxed">
              El registro y acceso al programa implican la aceptación plena de estos Términos y Condiciones.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}