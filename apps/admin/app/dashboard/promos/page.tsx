'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface PromoCode {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed' | 'free_delivery';
  discount_value: number;
  min_order_cents: number | null;
  max_uses: number | null;
  current_uses: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

export default function PromosPage() {
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage' as PromoCode['discount_type'],
    discount_value: 10,
    max_uses: 100,
    expires_at: ''
  });

  useEffect(() => {
    fetchPromos();
  }, []);

  const fetchPromos = async () => {
    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      const normalized = (data as Array<Record<string, unknown>>).map((promo) => ({
        id: String(promo.id ?? ''),
        code: String(promo.code ?? ''),
        discount_type: (promo.discount_type as PromoCode['discount_type']) ?? 'percentage',
        discount_value: Number(promo.discount_value ?? 0),
        min_order_cents: promo.min_order_cents === null || promo.min_order_cents === undefined ? null : Number(promo.min_order_cents),
        max_uses: promo.max_uses === null || promo.max_uses === undefined ? null : Number(promo.max_uses),
        current_uses: Number(promo.current_uses ?? promo.uses ?? 0),
        expires_at: promo.expires_at ? String(promo.expires_at) : null,
        is_active: Boolean(promo.is_active ?? true),
        created_at: promo.created_at ? String(promo.created_at) : new Date().toISOString(),
      }));
      setPromos(normalized);
    }
    setLoading(false);
  };

  const togglePromoStatus = async (promoId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('promo_codes')
      .update({ is_active: !currentStatus })
      .eq('id', promoId);

    if (!error) {
      setPromos(promos.map(p => 
        p.id === promoId ? { ...p, is_active: !currentStatus } : p
      ));
    }
  };

  const deletePromo = async (promoId: string) => {
    if (!confirm('Are you sure you want to delete this promo code?')) return;

    const { error } = await supabase
      .from('promo_codes')
      .delete()
      .eq('id', promoId);

    if (!error) {
      setPromos(promos.filter(p => p.id !== promoId));
    }
  };

  const createPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { error } = await supabase
      .from('promo_codes')
      .insert({
        code: formData.code.toUpperCase(),
        discount_type: formData.discount_type,
        discount_value: formData.discount_type === 'percentage' ? formData.discount_value : formData.discount_value * 100,
        max_uses: formData.max_uses || null,
        expires_at: formData.expires_at || null,
        is_active: true,
        current_uses: 0
      });

    if (!error) {
      setShowForm(false);
      setFormData({ code: '', discount_type: 'percentage', discount_value: 10, max_uses: 100, expires_at: '' });
      fetchPromos();
    }
  };

  const formatDiscount = (promo: PromoCode) => {
    if (promo.discount_type === 'percentage') {
      return `${promo.discount_value}% off`;
    } else if (promo.discount_type === 'fixed') {
      return `$${(promo.discount_value / 100).toFixed(2)} off`;
    } else {
      return 'Free Delivery';
    }
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading promotions...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Promotions</h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700"
        >
          {showForm ? 'Cancel' : 'Create Promo'}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-white rounded-lg border p-6 mb-6">
          <h3 className="font-semibold mb-4">New Promo Code</h3>
          <form onSubmit={createPromo} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="SUMMER20"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
              <select
                value={formData.discount_type}
                onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as PromoCode['discount_type'] })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
                <option value="free_delivery">Free Delivery</option>
              </select>
            </div>
            {formData.discount_type !== 'free_delivery' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {formData.discount_type === 'percentage' ? 'Percentage (%)' : 'Amount ($)'}
                </label>
                <input
                  type="number"
                  value={formData.discount_value}
                  onChange={(e) => setFormData({ ...formData, discount_value: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg"
                  min="1"
                  max={formData.discount_type === 'percentage' ? 100 : 1000}
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Uses</label>
              <input
                type="number"
                value={formData.max_uses}
                onChange={(e) => setFormData({ ...formData, max_uses: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Leave empty for unlimited"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expires At</label>
              <input
                type="date"
                value={formData.expires_at}
                onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                className="bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700"
              >
                Create Promo Code
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Promos Table */}
      {promos.length === 0 ? (
        <div className="bg-white rounded-lg border p-8 text-center">
          <p className="text-gray-500">No promo codes yet</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 text-primary-600 hover:text-primary-700"
          >
            Create your first promo code
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg border">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Discount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Uses</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expires</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {promos.map((promo) => (
                <tr key={promo.id} className={`hover:bg-gray-50 ${isExpired(promo.expires_at) ? 'opacity-50' : ''}`}>
                  <td className="px-6 py-4">
                    <span className="font-mono font-medium text-primary-600">{promo.code}</span>
                  </td>
                  <td className="px-6 py-4 text-sm">{formatDiscount(promo)}</td>
                  <td className="px-6 py-4 text-sm">
                    {promo.current_uses}/{promo.max_uses || '∞'}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {promo.expires_at 
                      ? new Date(promo.expires_at).toLocaleDateString()
                      : 'Never'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      !promo.is_active || isExpired(promo.expires_at)
                        ? 'bg-gray-100 text-gray-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {isExpired(promo.expires_at) ? 'Expired' : promo.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => togglePromoStatus(promo.id, promo.is_active)}
                      className="text-primary-600 hover:text-primary-700 text-sm mr-3"
                    >
                      {promo.is_active ? 'Disable' : 'Enable'}
                    </button>
                    <button 
                      onClick={() => deletePromo(promo.id)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
