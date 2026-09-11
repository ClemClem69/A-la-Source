import { Link } from 'react-router-dom';
import { MapPin, BadgeCheck } from 'lucide-react';
import type { Producer } from '../lib/types';

export default function ProducerCard({ producer }: { producer: Producer }) {
  return (
    <Link
      to={`/producteur/${producer.id}`}
      className="card overflow-hidden group flex flex-col"
    >
      <div className="relative h-32 overflow-hidden bg-primary-100">
        {producer.cover_url ? (
          <img
            src={producer.cover_url}
            alt={producer.company_name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-primary-100" />
        )}
        <div className="absolute -bottom-6 left-4">
          <div className="h-14 w-14 rounded-full border-4 border-white bg-primary-200 overflow-hidden shadow-md">
            {producer.logo_url ? (
              <img src={producer.logo_url} alt={producer.company_name} className="h-full w-full object-cover" />
            ) : null}
          </div>
        </div>
      </div>

      <div className="p-4 pt-8 flex flex-col flex-1">
        <h3 className="font-semibold text-stone-800 group-hover:text-primary-700 transition-colors">
          {producer.company_name}
        </h3>
        {producer.city && (
          <p className="flex items-center gap-1 text-sm text-stone-500 mt-1">
            <MapPin className="h-3.5 w-3.5" /> {producer.city}, {producer.region}
          </p>
        )}
        <p className="text-sm text-stone-600 mt-2 line-clamp-2 flex-1">
          {producer.description}
        </p>
        {producer.certifications.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {producer.certifications.map((cert) => (
              <span key={cert} className="badge bg-primary-100 text-primary-700">
                <BadgeCheck className="h-3 w-3" /> {cert}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
