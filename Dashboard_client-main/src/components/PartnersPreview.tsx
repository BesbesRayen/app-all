import Link from 'next/link';
import { ArrowRight, MapPin } from 'lucide-react';
import { boutiques } from '@/data/boutiques';

export default function PartnersPreview() {
  const previewBoutiques = boutiques.filter((b) => b.conventionActive).slice(0, 6);

  return (
    <section className="section-padding bg-white" id="partners">
      <div className="container-custom mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 border border-primary-100 rounded-full mb-6">
            <span className="text-sm font-medium text-primary-700">Nos Partenaires</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-gray-900 mb-6">
            Boutiques partenaires{' '}
            <span className="gradient-text">CreditTN</span>
          </h2>
          <p className="text-lg text-gray-600">
            Découvrez où utiliser CreditTN pour vos achats échelonnés. Plus de 100 boutiques vous
            attendent dans toute la Tunisie.
          </p>
        </div>

        {/* Partner Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {previewBoutiques.map((boutique) => (
            <div
              key={boutique.id}
              className="group p-6 rounded-2xl bg-white border border-gray-100 hover:border-primary-200 hover:shadow-xl hover:shadow-primary-500/5 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300">
                  {boutique.logo}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-display font-bold text-gray-900 truncate">
                      {boutique.name}
                    </h3>
                    <span className="w-2 h-2 bg-accent-500 rounded-full shrink-0" title="Convention active" />
                  </div>
                  <span className="inline-block px-2.5 py-0.5 bg-primary-50 text-primary-700 text-xs font-medium rounded-full mb-2">
                    {boutique.category}
                  </span>
                  <div className="flex items-center gap-1 text-gray-400">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="text-sm">{boutique.city}</span>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-600 leading-relaxed line-clamp-2">
                {boutique.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/boutiques"
            className="btn-primary gap-2 text-base !px-8 !py-4"
          >
            Voir toutes les boutiques
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
