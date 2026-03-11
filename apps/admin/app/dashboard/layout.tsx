import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navItems = [
    { href: '/dashboard', label: 'Overview', icon: '📊' },
    { href: '/dashboard/chefs', label: 'Chefs', icon: '👨‍🍳' },
    { href: '/dashboard/meals', label: 'Meals', icon: '🍽️' },
    { href: '/dashboard/orders', label: 'Orders', icon: '📦' },
    { href: '/dashboard/drivers', label: 'Drivers', icon: '🚗' },
    { href: '/dashboard/promos', label: 'Promos', icon: '🎁' },
    { href: '/dashboard/analytics', label: 'Analytics', icon: '📈' },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-primary-600">Ride & Dine</h1>
          <p className="text-sm text-gray-500">Admin Dashboard</p>
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t">
          <button className="w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white border-b px-8 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Dashboard</h2>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">Admin User</span>
            </div>
          </div>
        </header>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
