import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminBackButton() {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate(-1)}
      className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-stone-600 transition-colors hover:text-primary-700"
    >
      <ArrowLeft className="h-4 w-4" />
      Retour
    </button>
  );
}