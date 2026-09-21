import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Profile, UserRole } from '../../lib/types';
import { formatDate } from '../../lib/utils';
import AdminBackButton from '../../components/AdminBackButton';

export default function AdminUsers() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<UserRole | 'all'>('all');

  useEffect(() => {
    async function loadUsers() {
      const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      setUsers((data as Profile[]) || []);
      setLoading(false);
    }
    loadUsers();
  }, []);

  const filtered = filter === 'all' ? users : users.filter((u) => u.role === filter);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <AdminBackButton />
      <h1 className="font-serif text-3xl font-bold text-stone-800 mb-6">Utilisateurs</h1>

      <div className="flex gap-2 mb-6">
        {(['all', 'consumer', 'producer', 'admin'] as const).map((r) => (
          <button
            key={r}
            onClick={() => setFilter(r)}
            className={`badge cursor-pointer px-3 py-1.5 ${filter === r ? 'bg-primary-600 text-white' : 'bg-stone-100 text-stone-600'}`}
          >
            {r === 'all' ? 'Tous' : r === 'consumer' ? 'Consommateurs' : r === 'producer' ? 'Producteurs' : 'Admins'}
            ({r === 'all' ? users.length : users.filter((u) => u.role === r).length})
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-semibold text-stone-700">Nom</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-stone-700 hidden md:table-cell">Email</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-stone-700">Rôle</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-stone-700 hidden md:table-cell">Ville</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-stone-700 hidden md:table-cell">Inscrit le</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {filtered.map((user) => (
              <tr key={user.id} className="hover:bg-stone-50">
                <td className="px-4 py-3 text-sm font-medium text-stone-800">{user.full_name || '—'}</td>
                <td className="px-4 py-3 text-sm text-stone-600 hidden md:table-cell">{user.email}</td>
                <td className="px-4 py-3">
                  <span className={`badge ${
                    user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                    user.role === 'producer' ? 'bg-primary-100 text-primary-800' :
                    'bg-stone-100 text-stone-700'
                  }`}>
                    {user.role === 'admin' ? 'Admin' : user.role === 'producer' ? 'Producteur' : 'Consommateur'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-stone-600 hidden md:table-cell">{user.city || '—'}</td>
                <td className="px-4 py-3 text-sm text-stone-500 hidden md:table-cell">{formatDate(user.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
