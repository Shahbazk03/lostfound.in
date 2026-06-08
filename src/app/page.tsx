import Link from "next/link";
import {
  Search,
  MapPin,
  Shield,
  Globe,
  ArrowRight,
  CheckCircle,
  Lock,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-50 via-white to-teal-50 py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <Globe className="w-4 h-4" />
              Trusted Worldwide
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
              Reunite What Matters{" "}
              <span className="text-emerald-600">Most</span>
            </h1>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              The global lost and found platform connecting people with their
              belongings. Report lost items, share found treasures, and bring
              things back together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/report"
                className="inline-flex items-center justify-center gap-2 bg-emerald-600 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
              >
                <PlusCircle className="w-5 h-5" />
                Report an Item
              </Link>
              <Link
                href="/browse"
                className="inline-flex items-center justify-center gap-2 bg-white text-slate-700 border border-slate-300 px-8 py-3.5 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
              >
                <Search className="w-5 h-5" />
                Browse Listings
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-emerald-600">50K+</div>
              <div className="text-sm text-slate-500 mt-1">Items Reunited</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-emerald-600">120+</div>
              <div className="text-sm text-slate-500 mt-1">Countries</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-emerald-600">100K+</div>
              <div className="text-sm text-slate-500 mt-1">Active Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-emerald-600">98%</div>
              <div className="text-sm text-slate-500 mt-1">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              How It Works
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Our platform makes it easy to report and find lost items with a
              simple, secure process.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-200">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-5">
                <Search className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Report or Search
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Report a lost or found item with photos and location details, or
                search our global database for your missing belongings.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-slate-200">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-5">
                <MapPin className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Location Matching
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Our smart location-based search narrows down possibilities by
                area, date, and timeframe to find the best matches.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-slate-200">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-5">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Get Reunited
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Connect securely with the finder or owner, unlock precise
                locations, and arrange to get your item back safely.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Feature */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 lg:p-16 text-white">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
                  <Lock className="w-4 h-4" />
                  Premium Feature
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                  Unlock Precise Locations
                </h2>
                <p className="text-slate-300 mb-6 leading-relaxed">
                  For just $1, unlock the exact location where your item was
                  found. Our secure payment system ensures your transaction is
                  safe and instant.
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    "Exact GPS coordinates and address",
                    "Direct contact with the finder",
                    "Secure encrypted payment",
                    "Instant unlock after payment",
                  ].map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-3 text-slate-300"
                    >
                      <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/browse"
                  className="inline-flex items-center gap-2 bg-emerald-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-600 transition-colors"
                >
                  Start Searching
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="hidden lg:flex justify-center">
                <div className="relative">
                  <div className="w-72 h-72 bg-emerald-500/10 rounded-full absolute -top-8 -left-8" />
                  <div className="w-64 h-64 bg-emerald-500/20 rounded-full absolute -bottom-4 -right-4" />
                  <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold">Location Unlocked</div>
                        <div className="text-sm text-slate-400">
                          123 Main Street, New York
                        </div>
                      </div>
                    </div>
                    <div className="h-32 bg-slate-700/50 rounded-xl flex items-center justify-center">
                      <MapPin className="w-8 h-8 text-emerald-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Built for Security & Trust
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Your safety and privacy are our top priorities. We verify every
              user and secure every transaction.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Verified Users",
                desc: "Every user goes through our verification process to ensure a trusted community.",
              },
              {
                icon: Lock,
                title: "Secure Payments",
                desc: "Powered by Stripe with bank-level encryption for all transactions.",
              },
              {
                icon: Globe,
                title: "Global Reach",
                desc: "Connect with finders and owners across 120+ countries worldwide.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-white p-8 rounded-2xl border border-slate-200 text-center"
              >
                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <Icon className="w-7 h-7 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-emerald-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Find What You Lost?
          </h2>
          <p className="text-emerald-100 mb-8 text-lg">
            Join thousands of people who have been reunited with their belongings
            through Reunite.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 bg-white text-emerald-700 px-8 py-3.5 rounded-xl font-semibold hover:bg-emerald-50 transition-colors"
            >
              Create Free Account
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/browse"
              className="inline-flex items-center justify-center gap-2 bg-emerald-700 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-emerald-800 transition-colors"
            >
              Browse Listings
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <Search className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Reunite</span>
              </div>
              <p className="text-sm">
                The world&apos;s most trusted lost and found platform.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/browse" className="hover:text-white transition-colors">
                    Browse Items
                  </Link>
                </li>
                <li>
                  <Link href="/report" className="hover:text-white transition-colors">
                    Report Item
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-white transition-colors">
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Account</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/login" className="hover:text-white transition-colors">
                    Log In
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="hover:text-white transition-colors">
                    Sign Up
                  </Link>
                </li>
                <li>
                  <Link href="/messages" className="hover:text-white transition-colors">
                    Messages
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Support</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <span className="hover:text-white transition-colors cursor-pointer">
                    Help Center
                  </span>
                </li>
                <li>
                  <span className="hover:text-white transition-colors cursor-pointer">
                    Safety Tips
                  </span>
                </li>
                <li>
                  <span className="hover:text-white transition-colors cursor-pointer">
                    Contact Us
                  </span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-sm text-center">
            &copy; 2026 Reunite. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function PlusCircle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12h8" />
      <path d="M12 8v8" />
    </svg>
  );
}
