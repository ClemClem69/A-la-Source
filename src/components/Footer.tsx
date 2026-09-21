import { Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-primary-900 text-primary-100 mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
                <div className="french-flag flex h-full w-full items-center justify-center rounded-lg">
                  <Leaf className="h-4 w-4 text-primary-900 drop-shadow-sm" />
                </div>
              </div>
              <span className="font-serif text-base font-bold text-white">Mon marché futé</span>
            </div>
            <p className="text-sm text-primary-200 leading-relaxed">
              La plateforme qui connecte directement les producteurs français aux consommateurs pour des produits frais et sans intermédiaires.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Navigation</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors">Accueil</Link></li>
              <li><Link to="/catalogue" className="hover:text-white transition-colors">Catalogue</Link></li>
              <li><Link to="/producteurs" className="hover:text-white transition-colors">Nos producteurs</Link></li>
              <li><Link to="/qui-sommes-nous" className="hover:text-white transition-colors">Qui sommes-nous ?</Link></li>
              <li><Link to="/comment-ca-marche" className="hover:text-white transition-colors">Comment ça marche</Link></li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Informations</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/engagements" className="hover:text-white transition-colors">Nos engagements</Link></li>
              <li><Link to="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contactez-nous</Link></li>
              <li><Link to="/devenir-producteur" className="hover:text-white transition-colors">Vendre sur le site</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-primary-800">
          <p className="text-center text-sm text-primary-300">
            © {new Date().getFullYear()} Mon marché futé. Vente directe, qualité, fraîcheur.
          </p>
        </div>
      </div>
    </footer>
  );
}
