'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ExternalLink,
  MapPin,
  Globe,
  Store,
  Calendar,
  Building2,
  ShoppingBag,
  CheckCircle2,
  CreditCard,
  Shield,
  Clock,
} from 'lucide-react';
import { boutiques } from '@/data/boutiques';

export default function BoutiqueDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const boutique = boutiques.find((b) => b.id === id);

  if (!boutique) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <Store className="w-10 h-10 text-gray-400" />
          </div>
          <h1 className="text-2xl font-display font-bold text-gray-900 mb-3">
            Boutique introuvable
          </h1>
          <p className="text-gray-600 mb-6">
            Cette boutique n&apos;existe pas ou a été supprimée.
          </p>
          <Link
            href="/boutiques"
            className="btn-primary gap-2 inline-flex items-center"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux boutiques
          </Link>
        </div>
      </div>
    );
  }

  const domain = boutique.website.replace(/^https?:\/\//, '').replace(/\/$/, '');

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      {/* Banner */}
      <div className={`relative h-48 sm:h-56 md:h-64 bg-gradient-to-r ${boutique.bannerGradient}`}>
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-10 -right-10 w-72 h-72 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-20 -left-10 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        </div>
        {/* Back button on banner */}
        <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-6">
          <Link
            href="/boutiques"
            className="inline-flex items-center gap-2 text-sm font-medium text-white/90 hover:text-white transition-colors bg-white/15 backdrop-blur-sm px-4 py-2 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux boutiques
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10 pb-20">
        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden mb-8">
          <div className="p-6 sm:p-8 md:p-10">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              {/* Logo */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gray-50 border-2 border-white shadow-lg flex items-center justify-center text-6xl sm:text-7xl shrink-0">
                {boutique.logo}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-gray-900">
                    {boutique.name}
                  </h1>
                  {boutique.conventionActive && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-accent-50 border border-accent-200 text-accent-700 text-xs font-semibold rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Partenaire vérifié
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {boutique.city}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Building2 className="w-4 h-4" />
                    {boutique.locations} point{boutique.locations > 1 ? 's' : ''} de vente
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    Depuis {boutique.founded}
                  </span>
                </div>

                <span className="inline-block px-3 py-1 bg-primary-50 text-primary-700 text-xs font-semibold rounded-full">
                  {boutique.category}
                </span>
              </div>

              {/* CTA */}
              <div className="flex flex-col gap-3 sm:shrink-0 w-full sm:w-auto">
                <a
                  href={boutique.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary gap-2 inline-flex items-center justify-center !px-6 !py-3 text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  Visiter le site
                </a>
                <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400">
                  <Globe className="w-3.5 h-3.5" />
                  {domain}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
              <h2 className="text-lg font-display font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Store className="w-5 h-5 text-primary-600" />
                À propos
              </h2>
              <p className="text-gray-600 leading-relaxed text-[15px]">
                {boutique.longDescription}
              </p>
            </div>

            {/* Products Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
              <h2 className="text-lg font-display font-bold text-gray-900 mb-6 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary-600" />
                Produits populaires
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {boutique.products.map((product, idx) => (
                  <div
                    key={idx}
                    className="group relative p-5 rounded-xl bg-gray-50 border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-3xl shrink-0 group-hover:scale-105 transition-transform">
                        {product.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 mb-1 leading-tight">
                          {product.name}
                        </h3>
                        <p className="text-lg font-bold text-primary-600">
                          {product.price}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Payable en 3x avec CreditTN
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* CreditTN Payment Card */}
            <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm">Payer avec CreditTN</h3>
                  <p className="text-primary-100 text-xs">Paiement en plusieurs fois</p>
                </div>
              </div>
              <div className="space-y-3 mb-5">
                <div className="flex items-center gap-2 text-sm text-primary-50">
                  <CheckCircle2 className="w-4 h-4 text-accent-300 shrink-0" />
                  Paiement en 3x, 6x ou 12x
                </div>
                <div className="flex items-center gap-2 text-sm text-primary-50">
                  <CheckCircle2 className="w-4 h-4 text-accent-300 shrink-0" />
                  0% d&apos;intérêts sur 3 mois
                </div>
                <div className="flex items-center gap-2 text-sm text-primary-50">
                  <CheckCircle2 className="w-4 h-4 text-accent-300 shrink-0" />
                  Validation instantanée
                </div>
              </div>
              <a
                href={boutique.website}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center bg-white text-primary-700 font-semibold text-sm py-3 rounded-xl hover:bg-primary-50 transition-colors"
              >
                Acheter maintenant
              </a>
            </div>

            {/* Store Info Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-display font-bold text-gray-900 mb-4">
                Informations
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Globe className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Site web</p>
                    <a
                      href={boutique.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary-600 hover:underline font-medium"
                    >
                      {domain}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Siège</p>
                    <p className="text-sm text-gray-900 font-medium">{boutique.city}, Tunisie</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Building2 className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Points de vente</p>
                    <p className="text-sm text-gray-900 font-medium">{boutique.locations} magasins</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Fondée</p>
                    <p className="text-sm text-gray-900 font-medium">{boutique.founded}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-display font-bold text-gray-900 mb-4">
                Garanties CreditTN
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-8 h-8 bg-accent-50 rounded-lg flex items-center justify-center shrink-0">
                    <Shield className="w-4 h-4 text-accent-600" />
                  </div>
                  Paiement 100% sécurisé
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-primary-600" />
                  </div>
                  Approbation en quelques minutes
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  </div>
                  Partenaire officiel vérifié
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
