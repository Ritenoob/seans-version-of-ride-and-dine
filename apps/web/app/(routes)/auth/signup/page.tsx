'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

type Role = 'customer' | 'chef' | 'driver' | 'admin';

interface RoleOption {
  value: Role;
  label: string;
  description: string;
}

const roleOptions: RoleOption[] = [
  { value: 'customer', label: 'Customer', description: 'Order delicious home-cooked meals' },
  { value: 'chef', label: 'Chef', description: 'Share your culinary creations and earn' },
  { value: 'driver', label: 'Driver', description: 'Deliver meals and earn on your schedule' },
  { value: 'admin', label: 'Admin', description: 'Manage the Ride & Dine platform' },
];

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<Role>('customer');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Create profile entry
    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        email: data.user.email,
        full_name: fullName,
        phone: phone || null,
        role: role,
      });

      if (profileError) {
        setError('Failed to create profile. Please try again.');
        setLoading(false);
        return;
      }

      // Create role-specific records
      if (role === 'chef') {
        const slug = fullName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        await supabase.from('chefs').insert({
          user_id: data.user.id,
          display_name: fullName,
          slug: `${slug}-${Date.now()}`,
          is_active: false, // Requires admin approval
        });
      } else if (role === 'driver') {
        await supabase.from('drivers').insert({
          user_id: data.user.id,
          display_name: fullName,
          phone: phone || '',
          is_online: false,
          is_available: true,
        });
      }
    }

    // Redirect based on role
    if (role === 'admin') {
      router.push('/auth/login?message=Account created. Please login to access admin dashboard.');
    } else if (role === 'driver') {
      router.push('/auth/login?message=Account created. Please login to the driver app.');
    } else if (role === 'chef') {
      router.push('/auth/login?message=Chef account created. Pending admin approval.');
    } else {
      router.push('/');
      router.refresh();
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Create an account</h1>
          <p className="text-gray-600 mt-2">Join the Ride & Dine community</p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">
              I want to join as
            </label>
            <div className="grid grid-cols-2 gap-2">
              {roleOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setRole(option.value)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    role === option.value
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="block font-medium text-sm">{option.label}</span>
                  <span className="block text-xs text-gray-500 mt-1">{option.description}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="fullName" className="block text-sm font-medium mb-1">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="you@example.com"
              required
            />
          </div>

          {(role === 'driver' || role === 'chef') && (
            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-1">
                Phone Number {role === 'driver' && <span className="text-red-500">*</span>}
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="555-123-4567"
                required={role === 'driver'}
              />
            </div>
          )}

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="At least 6 characters"
              minLength={6}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Sign in
          </Link>
        </p>

        {/* Info about different apps */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
          <p className="font-medium mb-2">After signup:</p>
          <ul className="space-y-1 text-xs">
            <li><strong>Customers:</strong> Order meals from this website</li>
            <li><strong>Chefs:</strong> Manage meals after admin approval</li>
            <li><strong>Drivers:</strong> Use the Driver app at /driver</li>
            <li><strong>Admins:</strong> Access admin dashboard at /admin</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
