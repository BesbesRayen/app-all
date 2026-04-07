import {
  Shield,
  Clock,
  Wallet,
  Smartphone,
  Users,
  TrendingDown,
} from 'lucide-react';

const features = [
  {
    icon: Wallet,
    title: 'Paiement Échelonné',
    description:
      'Divisez vos achats en 3, 6 ou 12 mensualités confortables. Gérez votre budget sans stress.',
    color: 'bg-primary-100 text-primary-600',
  },
  {
    icon: Shield,
    title: 'Sécurité Maximale',
    description:
      'Chiffrement SSL de bout en bout et conformité PCI DSS. Vos données sont protégées à 100%.',
    color: 'bg-accent-100 text-accent-600',
  },
  {
    icon: Clock,
    title: 'Approbation Instantanée',
    description:
      'Obtenez une réponse en quelques secondes. Pas de paperasse ni de délais d\'attente.',
    color: 'bg-amber-100 text-amber-600',
  },
  {
    icon: TrendingDown,
    title: '0% Intérêt sur 3 mois',
    description:
      'Profitez du paiement en 3 fois sans aucun frais supplémentaire. Transparent et honnête.',
    color: 'bg-rose-100 text-rose-600',
  },
  {
    icon: Smartphone,
    title: 'Application Mobile',
    description:
      'Gérez vos paiements, consultez votre historique et trouvez des boutiques depuis votre téléphone.',
    color: 'bg-violet-100 text-violet-600',
  },
  {
    icon: Users,
    title: '+100 Boutiques Partenaires',
    description:
      'Un réseau grandissant de boutiques dans toute la Tunisie : électronique, mode, sport et plus.',
    color: 'bg-cyan-100 text-cyan-600',
  },
];

export default function Features() {
  return (
    <section className="section-padding bg-white relative" id="features">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `radial-gradient(circle, #000 1px, transparent 1px)`,
        backgroundSize: '30px 30px',
      }} />

      <div className="container-custom mx-auto relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 border border-primary-100 rounded-full mb-6">
            <span className="text-sm font-medium text-primary-700">Pourquoi CreditTN</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-gray-900 mb-6">
            Tout ce dont vous avez besoin pour{' '}
            <span className="gradient-text">acheter en toute liberté</span>
          </h2>
          <p className="text-lg text-gray-600">
            CreditTN combine technologie de pointe et simplicité pour vous offrir la meilleure
            expérience de paiement échelonné en Tunisie.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-8 rounded-2xl bg-white border border-gray-100 hover:border-primary-200 hover:shadow-xl hover:shadow-primary-500/5 transition-all duration-300 hover:-translate-y-1"
            >
              <div
                className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
              >
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-display font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
