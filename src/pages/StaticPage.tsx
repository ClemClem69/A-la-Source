import { Leaf, Shield, Heart, MapPin, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import NewsletterSignup from '../components/NewsletterSignup';
import SeoMetadata from '../components/SeoMetadata';

interface StaticPageProps {
  page: 'about' | 'how-it-works' | 'engagements' | 'faq' | 'cgv' | 'legal' | 'privacy' | 'producer';
}

const pageMetadata: Record<StaticPageProps['page'], {
  title: string;
  description: string;
  canonicalPath: string;
  indexable: boolean;
}> = {
  about: {
    title: 'Qui sommes-nous ? | Mon marché futé',
    description: 'Découvrez la mission de Mon marché futé et son approche pour organiser les commandes et le retrait des fruits et légumes.',
    canonicalPath: '/qui-sommes-nous/',
    indexable: true,
  },
  'how-it-works': {
    title: 'Comment fonctionne Mon marché futé à Lyon ?',
    description: 'Découvrez Mon marché futé à Lyon : commande de fruits et légumes à l’unité, retrait hebdomadaire dans le centre-ville et informations pratiques sur le retrait.',
    canonicalPath: '/comment-ca-marche/',
    indexable: true,
  },
  engagements: {
    title: 'Engagements | Mon marché futé',
    description: 'Les principes et engagements présentés par Mon marché futé.',
    canonicalPath: '/engagements/',
    indexable: false,
  },
  faq: {
    title: 'Questions fréquentes | Mon marché futé',
    description: 'Réponses aux questions courantes sur le fonctionnement du service Mon marché futé.',
    canonicalPath: '/faq/',
    indexable: false,
  },
  cgv: {
    title: 'Conditions générales de vente | Mon marché futé',
    description: 'Conditions générales de vente de Mon marché futé.',
    canonicalPath: '/cgv/',
    indexable: false,
  },
  legal: {
    title: 'Mentions légales | Mon marché futé',
    description: 'Mentions légales de Mon marché futé.',
    canonicalPath: '/mentions-legales/',
    indexable: false,
  },
  privacy: {
    title: 'Politique de confidentialité | Mon marché futé',
    description: 'Informations sur la collecte et l’utilisation des données par Mon marché futé.',
    canonicalPath: '/confidentialite/',
    indexable: false,
  },
  producer: {
    title: 'Proposer ses produits | Mon marché futé',
    description: 'Informations destinées aux producteurs qui souhaitent proposer leurs produits sur Mon marché futé.',
    canonicalPath: '/devenir-producteur/',
    indexable: true,
  },
};

export default function StaticPage({ page }: StaticPageProps) {
  const content = getContent(page);
  const aboutStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    '@id': 'https://monmarchefute.com/qui-sommes-nous/#webpage',
    url: 'https://monmarchefute.com/qui-sommes-nous/',
    name: pageMetadata.about.title,
    description: pageMetadata.about.description,
    inLanguage: 'fr-FR',
    isPartOf: { '@id': 'https://monmarchefute.com/#website' },
    about: { '@id': 'https://monmarchefute.com/#organization' },
    mainEntity: { '@id': 'https://monmarchefute.com/#organization' },
  };
  const howItWorksStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': 'https://monmarchefute.com/comment-ca-marche/#webpage',
    url: 'https://monmarchefute.com/comment-ca-marche/',
    name: pageMetadata['how-it-works'].title,
    description: pageMetadata['how-it-works'].description,
    inLanguage: 'fr-FR',
    isPartOf: { '@id': 'https://monmarchefute.com/#website' },
    about: { '@id': 'https://monmarchefute.com/#organization' },
  };

  return (
    <>
      <SeoMetadata {...pageMetadata[page]} />
      {page === 'about' && (
        <Helmet>
          <script type="application/ld+json">{JSON.stringify(aboutStructuredData).replace(/</g, '\\u003c')}</script>
        </Helmet>
      )}
      {page === 'how-it-works' && (
        <Helmet>
          <script type="application/ld+json">{JSON.stringify(howItWorksStructuredData).replace(/</g, '\\u003c')}</script>
        </Helmet>
      )}
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-serif text-3xl font-bold text-stone-800 mb-6">{content.title}</h1>
        <div className="prose prose-stone max-w-none">{content.body}</div>
        {(page === 'about' || page === 'how-it-works') && (
          <div id={page === 'how-it-works' ? 'preinscription' : undefined} className="mt-10">
            <NewsletterSignup />
          </div>
        )}
      </div>
    </>
  );
}

function getContent(page: string) {
  switch (page) {
    case 'producer':
      return {
        title: 'Vendre sur Mon marché futé',
        body: (
          <div className="space-y-6">
            <p className="text-stone-600 text-lg leading-relaxed">
              Vous souhaitez proposer vos produits sur Mon marché futé ? Pour demander à vendre sur le site, contactez-nous via le formulaire dédié.
            </p>
            <p className="text-stone-600 text-lg leading-relaxed">
              Notre équipe reprendra contact avec vous afin d'échanger sur votre exploitation, vos produits et l'ensemble des modalités de référencement et de vente sur la plateforme.
            </p>
            <Link to="/contact" className="btn-primary inline-flex">Accéder au formulaire de contact</Link>
          </div>
        ),
      };
    case 'about':
      return {
        title: 'Qui sommes-nous ?',
        body: (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold text-stone-800 mb-4">Notre mission</h2>
              <p className="text-stone-600 text-lg leading-relaxed">
                Mon marché futé est une plateforme de vente directe qui connecte les producteurs français aux consommateurs. Notre objectif : simplifier l'accès aux produits frais, de qualité, issus d'une agriculture rémunérée plus équitablement.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-stone-800 mb-4">Le principe fondamental</h2>
              <p className="text-stone-600 text-lg leading-relaxed mb-4">
                Nous croyons qu'il existe une meilleure façon de consommer. En supprimant les intermédiaires entre producteurs et consommateurs, nous créons un écosystème plus juste et plus transparent.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-primary-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-primary-700 mb-2">Pour les producteurs</h3>
                  <p className="text-sm text-stone-600">Une meilleure rémunération et un accès direct à leur clientèle sans intermédiaires excessifs.</p>
                </div>
                <div className="bg-primary-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-primary-700 mb-2">Pour les consommateurs</h3>
                  <p className="text-sm text-stone-600">Des produits plus frais, plus transparents et à des prix justes, directement du producteur.</p>
                </div>
                <div className="bg-primary-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-primary-700 mb-2">Pour la planète</h3>
                  <p className="text-sm text-stone-600">Moins d'intermédiaires signifie moins de transport, d'emballages et de gaspillage alimentaire.</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-stone-800 mb-4">Nos valeurs</h2>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="text-primary-700 font-bold min-w-fit">✓</div>
                  <div>
                    <p className="font-semibold text-stone-800">Transparence</p>
                    <p className="text-stone-600 text-sm">Vous savez exactement d'où vient votre nourriture et qui l'a produite.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="text-primary-700 font-bold min-w-fit">✓</div>
                  <div>
                    <p className="font-semibold text-stone-800">Équité</p>
                    <p className="text-stone-600 text-sm">Les producteurs reçoivent une part juste du prix de vente, sans marges excessives.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="text-primary-700 font-bold min-w-fit">✓</div>
                  <div>
                    <p className="font-semibold text-stone-800">Qualité</p>
                    <p className="text-stone-600 text-sm">Des produits récoltés à maturité et livrés rapidement pour garantir la fraîcheur.</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-stone-800 mb-4">Pourquoi Mon marché futé ?</h2>
              <p className="text-stone-600 text-lg leading-relaxed">
                Parce que Mon marché futé vous permet de choisir des produits frais directement auprès de producteurs français, tout en garantissant une rémunération plus juste. Vous consommez mieux, en toute transparence, et soutenez une agriculture locale et durable.
              </p>
            </div>
          </div>
        ),
      };
    case 'how-it-works':
      return {
        title: 'Comment fonctionne Mon marché futé à Lyon ?',
        body: (
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-stone-800 mb-3">Mon marché fûté à Lyon</h2>
              <p className="text-stone-600 leading-relaxed">
                Mon marché futé vise à rendre les fruits et légumes plus accessibles grâce à une organisation simple des commandes et du retrait. Le service s’organise autour d’un point de retrait dans le centre-ville de Lyon.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-stone-800 mb-3">La commande de fruits et légumes à l’unité</h2>
              <p className="text-stone-600 leading-relaxed">
                Les fruits et légumes se commandent à l’unité, en ligne.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-stone-800 mb-3">Un retrait une fois par semaine dans le centre-ville</h2>
              <p className="text-stone-600 leading-relaxed">
                Le retrait a lieu une fois par semaine dans le centre-ville de Lyon. Les informations pratiques sur le retrait, notamment l’adresse, le jour et les horaires, sont communiquées avant chaque retrait.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-stone-800 mb-3">À qui s’adresse le service</h2>
              <p className="text-stone-600 leading-relaxed">
                Le service s’adresse aux particuliers, aux familles comme aux personnes seules, qui peuvent se déplacer dans le centre-ville de Lyon pour retirer leur commande.
              </p>
            </section>

            <section aria-labelledby="how-it-works-faq">
              <h2 id="how-it-works-faq" className="text-2xl font-semibold text-stone-800 mb-4">FAQ pratique</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-stone-800">Comment commander les fruits et légumes ?</h3>
                  <p className="mt-1 text-stone-600">Les fruits et légumes se commandent à l’unité, en ligne.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-stone-800">Où et quand retirer une commande ?</h3>
                  <p className="mt-1 text-stone-600">Le retrait a lieu une fois par semaine dans le centre-ville de Lyon. L’adresse, le jour et les horaires sont communiqués avant chaque retrait.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-stone-800">À qui s’adresse le service ?</h3>
                  <p className="mt-1 text-stone-600">Aux particuliers, aux familles et aux personnes seules qui peuvent se déplacer dans le centre-ville de Lyon.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-stone-800 mb-3">Une question sur le fonctionnement ?</h2>
              <Link to="/contact" className="font-medium text-primary-700 underline hover:text-primary-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700">
                Contactez Mon marché futé
              </Link>
            </section>
          </div>
        ),
      };
    case 'engagements':
      return {
        title: 'Nos engagements',
        body: (
          <div className="space-y-6">
            {[
              { icon: Leaf, title: 'Sans intermédiaires et transparent', desc: 'Nous connectons directement les producteurs aux consommateurs, sans intermédiaire. Vous savez exactement qui produit ce que vous mangez.' },
              { icon: Shield, title: 'Qualité et fraîcheur', desc: 'Les produits sont récoltés à maturité et livrés rapidement.' },
              { icon: Heart, title: 'Rémunération juste', desc: 'Nos producteurs perçoivent une part équitable du prix de vente. Pas de marges intermédiaires excessives.' },
              { icon: MapPin, title: 'Agriculture française et durable', desc: 'Nous privilégions les producteurs français pour soutenir l\'agriculture française et réduire l\'empreinte carbone.' },
              { icon: Package, title: 'Zéro gaspillage', desc: 'En achetant directement, vous réduisez les emballages et le gaspillage alimentaire. Les produits ne traversent pas de longues chaînes logistiques.' },
            ].map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
                  <item.icon className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="font-semibold text-lg text-stone-800 mb-1">{item.title}</h2>
                  <p className="text-stone-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        ),
      };
    case 'faq':
      return {
        title: 'Questions fréquentes',
        body: (
          <div className="space-y-6">
            {[
              { q: 'Quels sont les créneaux de retrait ?', a: 'Les commandes sont disponibles selon le créneau que vous choisissez lors de la commande. Les créneaux proposés dépendent des points de retrait disponibles.' },
              { q: 'Puis-je modifier ou annuler ma commande ?', a: 'Vous pouvez annuler votre commande tant qu\'elle n\'a pas le statut "en préparation". Contactez le producteur via la messagerie pour toute modification.' },
              { q: 'Les produits sont-ils bio ?', a: 'Chaque producteur indique ses certifications (Bio, HVE, etc.) sur sa fiche. Vous pouvez filtrer le catalogue pour n\'afficher que les produits bio.' },
              { q: 'Quels sont les modes de paiement acceptés ?', a: 'Nous acceptons les paiements par carte bancaire via Stripe, en toute sécurité. Vos données bancaires ne sont jamais stockées.' },
            ].map((item, i) => (
              <div key={i} className="card p-4">
                <h2 className="font-semibold text-stone-800 mb-2">{item.q}</h2>
                <p className="text-stone-600 text-sm">{item.a}</p>
              </div>
            ))}
          </div>
        ),
      };
    case 'cgv':
      return {
        title: 'Conditions générales de vente',
        body: (
          <div className="space-y-4 text-stone-600">
            <p><strong>Article 1 - Objet :</strong> Les présentes CGV régissent les ventes de produits effectuées sur la plateforme "Mon marché futé".</p>
            <p><strong>Article 2 - Commandes :</strong> Toute commande implique l'acceptation des présentes CGV. La plateforme fait office d'intermédiaire entre le consommateur et le producteur.</p>
            <p><strong>Article 3 - Prix :</strong> Les prix sont indiqués en euros, toutes taxes comprises. Une commission de 10% est prélevée par la plateforme sur chaque vente.</p>
            <p><strong>Article 4 - Paiement :</strong> Le paiement s'effectue par carte bancaire via Stripe, prestataire de paiement sécurisé. Le paiement est requis à la commande.</p>
            <p><strong>Article 5 - Retrait :</strong> Les produits sont disponibles au point de retrait choisi, selon le créneau sélectionné lors de la commande.</p>
            <p><strong>Article 6 - Droit de rétractation :</strong> Conformément à la loi, vous disposez d'un délai de rétractation. Toutefois, les produits périssables (fruits et légumes frais) ne sont pas reprenables pour des raisons d'hygiène, sauf défaut qualité.</p>
            <p><strong>Article 7 - Responsabilité :</strong> La plateforme agit comme intermédiaire. La responsabilité du producteur est engagée pour la qualité des produits.</p>
            <p className="text-sm text-stone-400 mt-6">Document à valeur indicative pour cette démonstration.</p>
          </div>
        ),
      };
    case 'legal':
      return {
        title: 'Mentions légales',
        body: (
          <div className="space-y-4 text-stone-600">
            <p><strong>Éditeur :</strong> Mon marché futé</p>
            <p><strong>Directeur de publication :</strong> L'équipe de Mon marché futé</p>
            <p><strong>Hébergement :</strong> Bolt - Plateforme de déploiement</p>
            <p><strong>SIRET :</strong> En cours d'immatriculation</p>
            <p className="text-sm text-stone-400 mt-6">Document à valeur indicative pour cette démonstration.</p>
          </div>
        ),
      };
    case 'privacy':
      return {
        title: 'Politique de confidentialité',
        body: (
          <div className="space-y-4 text-stone-600">
            <h2 className="text-xl font-semibold text-stone-800">Préinscription</h2>
            <p>
              Lorsque vous demandez à être informé du lancement, votre adresse e-mail est enregistrée dans Supabase afin de vous envoyer une information liée à cette demande. Elle n’est pas transmise à Google Analytics.
            </p>
            <h2 className="text-xl font-semibold text-stone-800">Mesure d’audience et consentement</h2>
            <p>
              Avec votre accord, Google Analytics 4 (Google) mesure la fréquentation du site et les clics sur les appels à la préinscription. Les événements analytiques concernés sont les pages consultées, les clics sur ces appels et les inscriptions effectivement enregistrées. Aucun e-mail, hash d’e-mail, token, identifiant utilisateur ou contenu de formulaire n’est envoyé dans ces événements.
            </p>
            <p>
              Google Analytics n’est chargé qu’après acceptation de la mesure d’audience. Vous pouvez accepter ou refuser dans la bannière, puis modifier votre choix à tout moment avec le bouton « Gérer le consentement analytique » en pied de page. Votre choix est mémorisé dans le stockage local de votre navigateur. Le refus n’empêche pas l’utilisation du formulaire de préinscription.
            </p>
            <p>
              Les signaux de stockage analytique et publicitaire de Google Consent Mode v2 sont configurés selon votre choix. Le stockage publicitaire, l’utilisation des données à des fins publicitaires et la personnalisation des annonces restent refusés.
            </p>
            <p>
              La durée de conservation applicable aux données Google Analytics doit être confirmée à partir du paramétrage du compte GA4 avant publication de cette information.
            </p>
            <h2 className="text-xl font-semibold text-stone-800">Vos droits</h2>
            <p>
              Conformément au RGPD, vous pouvez demander l’accès à vos données, leur rectification ou leur effacement, vous opposer à certains traitements et retirer votre consentement à la mesure d’audience. Pour exercer vos droits concernant les données de préinscription, utilisez le formulaire de contact du site. Vous pouvez aussi modifier le consentement analytique depuis le pied de page.
            </p>
            <p>
              Vous pouvez introduire une réclamation auprès de la CNIL. Les informations de contact du responsable de traitement et la durée de conservation définitive doivent être confirmées avant la mise en production de cette politique.
            </p>
            <p className="text-sm text-stone-400 mt-6">Document à valeur indicative pour cette démonstration.</p>
          </div>
        ),
      };
    default:
      return { title: 'Page introuvable', body: <p>La page demandée n'existe pas.</p> };
  }
}
