'use client';

import { useState, useMemo } from 'react';
import { Search, Store } from 'lucide-react';
import StoreCard from '@/components/StoreCard';
import { boutiques } from '@/data/boutiques';

export default function BoutiquesPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBoutiques = useMemo(() => {
    return boutiques.filter((b) => {
      const matchesSearch =
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [searchQuery]);

  return (
    <div className="pt-20">
      {/* Header */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-accent-50" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-200/30 rounded-full blur-3xl" />

        <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-primary-100 rounded-full mb-6">
              <Store className="w-4 h-4 text-primary-600" />
              <span className="text-sm font-medium text-primary-700">
                Réseau de partenaires
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-gray-900 mb-6">
              Nos Boutiques{' '}
              <span className="gradient-text">Partenaires</span>
            </h1>
            <p className="text-lg text-gray-600">
              Explorez notre réseau de boutiques partenaires dans toute la Tunisie.
              Utilisez CreditTN pour payer en plusieurs fois chez ces commerçants.
            </p>
          </div>
        </div>
      </section>

      {/* Filters & Content */}
      <section className="section-padding !pt-0 -mt-6">
        <div className="container-custom mx-auto">
          {/* Search Bar */}
          <div className="glass-card p-6 mb-10 glow">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une boutique..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field !pl-12"
              />
            </div>
          </div>

          {/* Results Info */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-600">
              <strong className="text-gray-900">{filteredBoutiques.length}</strong> boutique
              {filteredBoutiques.length !== 1 ? 's' : ''} trouvée
              {filteredBoutiques.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Grid */}
          {filteredBoutiques.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredBoutiques.map((boutique) => (
                <StoreCard key={boutique.id} boutique={boutique} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Search className="w-7 h-7 text-gray-400" />
              </div>
              <h3 className="text-lg font-display font-bold text-gray-900 mb-2">
                Aucune boutique trouvée
              </h3>
              <p className="text-gray-600">
                Essayez de modifier vos critères de recherche.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
