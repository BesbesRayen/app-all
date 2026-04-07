import Link from 'next/link';
import { Globe } from 'lucide-react';
import { Boutique } from '@/data/boutiques';

interface StoreCardProps {
  boutique: Boutique;
}

export default function StoreCard({ boutique }: StoreCardProps) {
  return (
    <Link href={`/boutiques/${boutique.id}`}>
      <div className="group p-6 rounded-2xl bg-white border border-gray-100 hover:border-primary-200 hover:shadow-xl hover:shadow-primary-500/5 transition-all duration-300 hover:-translate-y-1 cursor-pointer text-center">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-gray-50 flex items-center justify-center text-5xl shrink-0 group-hover:scale-110 transition-transform duration-300 mb-4">
          {boutique.logo}
        </div>
        <h3 className="text-lg font-display font-bold text-gray-900 mb-2">
          {boutique.name}
        </h3>
        {boutique.website && (
          <div className="inline-flex items-center gap-1.5 text-sm text-primary-600 font-medium">
            <Globe className="w-3.5 h-3.5" />
            {boutique.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
          </div>
        )}
      </div>
    </Link>
  );
}
