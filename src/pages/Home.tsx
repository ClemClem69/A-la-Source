import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import SeoMetadata from '../components/SeoMetadata';
import NewsletterSignup from '../components/NewsletterSignup';
import { trackAnalyticsEvent } from '../lib/analytics';

const pageTitle = 'Fruits et légumes à prix accessibles à Lyon | Mon marché futé';
const pageDescription = 'Découvrez Mon marché futé : un projet de fruits et légumes à l’unité, avec retrait hebdomadaire prévu dans Lyon centre. Soyez informé du lancement.';

export default function Home() {
  const homeStructuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': 'https://monmarchefute.com/#website',
        url: 'https://monmarchefute.com/',
        name: 'Mon Marché Futé',
        inLanguage: 'fr-FR',
        publisher: { '@id': 'https://monmarchefute.com/#organization' },
      },
      {
        '@type': 'WebPage',
        '@id': 'https://monmarchefute.com/#webpage',
        url: 'https://monmarchefute.com/',
        name: pageTitle,
        description: pageDescription,
        isPartOf: { '@id': 'https://monmarchefute.com/#website' },
        about: { '@id': 'https://monmarchefute.com/#organization' },
        inLanguage: 'fr-FR',
      },
    ],
  };

  return (
    <>
      <SeoMetadata title={pageTitle} description={pageDescription} canonicalPath="/" />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(homeStructuredData).replace(/</g, '\\u003c')}</script>
      </Helmet>

      <div>
        <section className="bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
            <div className="max-w-3xl">
              <p className="mb-5 inline-flex rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white">
                Inscrivez-vous pour recevoir les informations sur le lancement.
              </p>
              <h1 className="font-serif text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
                Des fruits et légumes à prix accessibles à Lyon
              </h1>
              <p className="mt-5 text-lg leading-relaxed text-primary-100 md:text-xl">
                Des fruits et légumes commandés à l’unité auprès de producteurs, avec un retrait hebdomadaire dans le centre-ville de Lyon.
              </p>
              <a
                href="#preinscription"
                onClick={() => trackAnalyticsEvent('preregistration_cta_click', { placement: 'home_hero' })}
                className="btn-secondary mt-8 bg-white text-primary-700 hover:bg-primary-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Être informé du lancement
              </a>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="mb-10 text-center font-serif text-3xl font-bold text-stone-800">
            Le principe
          </h2>
          <ol className="grid gap-8 md:grid-cols-3">
            {[
              'Choix de fruits et légumes à l’unité.',
              'Commande en ligne.',
              'Retrait de la commande au point de retrait lyonnais, une fois par semaine.',
            ].map((step, index) => (
              <li key={step} className="rounded-2xl border border-stone-200 bg-white p-6 text-center shadow-sm">
                <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 font-serif text-xl font-bold text-primary-700">
                  {index + 1}
                </span>
                <p className="font-medium leading-relaxed text-stone-700">{step}</p>
              </li>
            ))}
          </ol>
          <div className="mt-8 text-center">
            <Link
              to="/comment-ca-marche"
              className="font-medium text-primary-700 underline hover:text-primary-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700"
            >
              Découvrir le fonctionnement du service
            </Link>
          </div>
        </section>

        <section className="bg-primary-50 py-16">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 md:grid-cols-2 lg:px-8">
            <div>
              <h2 className="mb-4 font-serif text-3xl font-bold text-stone-800">Notre intention</h2>
              <p className="leading-relaxed text-stone-700">
                Mon marché futé vise à rendre les fruits et légumes plus accessibles grâce à une organisation simple des commandes et du retrait.
              </p>
            </div>
            <div>
              <h2 className="mb-4 font-serif text-3xl font-bold text-stone-800">Les principes du service</h2>
              <ul className="list-disc space-y-3 pl-5 leading-relaxed text-stone-700 marker:text-primary-700">
                <li>Des fruits et légumes commandés à l’unité.</li>
                <li>Un premier point de retrait dans le centre-ville de Lyon.</li>
                <li>Un retrait une fois par semaine.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-center font-serif text-3xl font-bold text-stone-800">
            Questions fréquentes
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-stone-800">Comment recevoir les informations sur le lancement ?</h3>
              <p className="mt-2 leading-relaxed text-stone-600">
                Inscrivez-vous par e-mail via le formulaire en bas de page.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-stone-800">Où se situe le point de retrait ?</h3>
              <p className="mt-2 leading-relaxed text-stone-600">
                Le modèle repose sur un premier point de retrait dans le centre-ville de Lyon.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-stone-800">Quel est le rythme de retrait indiqué ?</h3>
              <p className="mt-2 leading-relaxed text-stone-600">
                Le retrait est hebdomadaire. Les jours et horaires sont communiqués à l’avance.
              </p>
            </div>
          </div>
          <div className="mt-10 text-center">
            <a
              href="#preinscription"
              onClick={() => trackAnalyticsEvent('preregistration_cta_click', { placement: 'home_faq' })}
              className="btn-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700"
            >
              Être informé du lancement
            </a>
          </div>
        </section>

        <section id="preinscription" className="scroll-mt-24 px-4 pb-16 sm:px-6">
          <div className="mx-auto max-w-3xl">
            <NewsletterSignup />
          </div>
        </section>
      </div>
    </>
  );
}
