import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 to-orange-100 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Home-Cooked Meals,
              <br />
              <span className="text-primary-600">Delivered Fresh</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Discover talented local chefs and enjoy authentic, home-cooked
              meals delivered right to your door.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/marketplace"
                className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
              >
                Browse Chefs
              </Link>
              <Link
                href="/account"
                className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold border border-primary-600 hover:bg-primary-50 transition-colors"
              >
                Become a Chef
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Browse Chefs</h3>
              <p className="text-gray-600">
                Explore our marketplace of talented local home chefs and their menus.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Place Your Order</h3>
              <p className="text-gray-600">
                Select your meals, customize if needed, and checkout securely.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Enjoy Fresh Food</h3>
              <p className="text-gray-600">
                Track your delivery and enjoy home-cooked meals at your door.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
