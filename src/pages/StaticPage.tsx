import { Leaf, Truck, Shield, Heart, MapPin, CreditCard, Package } from 'lucide-react';
import { Link } from 'react-router-dom';

interface StaticPageProps {
  page: 'about' | 'how-it-works' | 'engagements' | 'faq' | 'cgv' | 'legal' | 'privacy' | 'producer';
}

export default function StaticPage({ page }: StaticPageProps) {
  const content = getContent(page);

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-serif text-3xl font-bold text-stone-800 mb-6">{content.title}</h1>
      <div className="prose prose-stone max-w-none">{content.body}</div>
    </div>
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
        title: 'Comment ça marche ?',
        body: (
          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
                <Leaf className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-semibold text-lg text-stone-800 mb-1">1. Choisissez vos produits</h2>
                <p className="text-stone-600">Parcourez le catalogue de fruits et légumes proposés par nos producteurs français. Filtrez par catégorie, par producteur, par saison ou par certification bio.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-semibold text-lg text-stone-800 mb-1">2. Commandez en ligne</h2>
                <p className="text-stone-600">Ajoutez vos produits au panier, choisissez votre point de retrait et sélectionnez un créneau qui vous convient.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
                <CreditCard className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-semibold text-lg text-stone-800 mb-1">3. Payez en toute sécurité</h2>
                <p className="text-stone-600">Le paiement est sécurisé par Stripe. Vos données bancaires ne sont jamais stockées sur nos serveurs.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
                <Heart className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-semibold text-lg text-stone-800 mb-1">4. Dégustez !</h2>
                <p className="text-stone-600">Recevez vos produits frais directement du producteur et suivez le statut de votre commande en temps réel.</p>
              </div>
            </div>
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
            <p><strong>Collecte de données :</strong> Nous collectons les informations nécessaires au traitement de vos commandes : nom, email, adresse, téléphone.</p>
            <p><strong>Utilisation :</strong> Vos données sont utilisées pour traiter vos commandes, vous informer du statut et améliorer notre service.</p>
            <p><strong>Partage :</strong> Vos informations de retrait sont partagées avec le producteur concerné. Nous ne vendons jamais vos données.</p>
            <p><strong>Droit RGPD :</strong> Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Utilisez le formulaire Contactez-nous pour toute demande.</p>
            <p><strong>Cookies :</strong> Nous utilisons des cookies essentiels au fonctionnement de la plateforme (session d'authentification, panier).</p>
            <p><strong>Sécurité :</strong> Vos données sont stockées de manière sécurisée. Les mots de passe sont hashés et jamais stockés en clair.</p>
            <p className="text-sm text-stone-400 mt-6">Document à valeur indicative pour cette démonstration.</p>
          </div>
        ),
      };
    default:
      return { title: 'Page introuvable', body: <p>La page demandée n'existe pas.</p> };
  }
}
