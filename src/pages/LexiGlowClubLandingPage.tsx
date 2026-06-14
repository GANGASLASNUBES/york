import { Check, Sparkles, Star, Users, Gift, Calendar } from 'lucide-react';

const benefits = [
  { icon: Sparkles, title: 'Exclusive Routines', text: '50+ premium beauty routines unavailable elsewhere' },
  { icon: Calendar, title: 'Monthly Live Sessions', text: 'Q&A with beauty experts every month' },
  { icon: Gift, title: 'Member Perks', text: '15% off all bundles and early access to new content' },
  { icon: Users, title: 'Private Community', text: 'Connect with 1,000+ engaged beauty enthusiasts' },
];

const plans = [
  { name: 'Monthly', price: 14.99, period: '/month', note: 'Cancel anytime' },
  { name: 'Quarterly', price: 39.99, period: '/3mo', note: 'Save $4.98', featured: true },
  { name: 'Annual', price: 129.99, period: '/year', note: 'Save $49.89' },
];

const testimonials = [
  { name: 'Sophia M.', quote: 'The monthly live sessions are gold. I learned more in 3 months than years on YouTube.', rating: 5 },
  { name: 'Aisha K.', quote: 'The exclusive routines actually work. My skin has never looked better.', rating: 5 },
  { name: 'Mia R.', quote: 'Love the community. Everyone is so supportive and the tips are unreal.', rating: 5 },
];

export function LexiGlowClubLandingPage() {
  return (
    <div className="bg-gradient-to-b from-rose-50 via-white to-pink-50 min-h-screen">
      <section className="max-w-5xl mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-rose-100 rounded-full text-rose-700 text-sm font-medium mb-6">
          <Sparkles size={14} />
          <span>Glow Club Membership</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-serif text-gray-900 mb-6 leading-tight">
          Your Glow Era<br />Starts Here
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          Join thousands of beauty enthusiasts getting exclusive routines, expert live sessions,
          and a thriving community — all for less than one lipstick a month.
        </p>
        <a
          href="#pricing"
          className="inline-block px-10 py-4 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-full transition-colors shadow-lg shadow-rose-500/30"
        >
          Join Glow Club
        </a>
        <p className="text-sm text-gray-500 mt-4">Starting at $14.99/month. Cancel anytime.</p>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-serif text-center text-gray-900 mb-12">What You Get</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((b) => (
            <div key={b.title} className="bg-white p-6 rounded-2xl shadow-sm border border-rose-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center mb-4">
                <b.icon className="text-rose-600" size={22} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{b.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{b.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-serif text-center text-gray-900 mb-12">What's Included</h2>
        <div className="bg-white rounded-3xl p-10 shadow-sm border border-rose-100">
          <ul className="space-y-4 max-w-2xl mx-auto">
            {[
              '50+ exclusive beauty routines with video demonstrations',
              'Monthly live sessions with licensed estheticians',
              'Early access to new content (48 hours before public)',
              '15% off all digital bundles',
              'Private member forum with 1,000+ members',
              'Priority email support (24-hour response)',
              'Birthday month bonus gift',
              'Participation in monthly beauty challenges',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="text-rose-600" size={14} />
                </div>
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-serif text-center text-gray-900 mb-12">Loved by Members</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-white p-6 rounded-2xl shadow-sm border border-rose-100">
              <div className="flex gap-1 mb-3">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="text-rose-500 fill-rose-500" size={16} />
                ))}
              </div>
              <p className="text-gray-700 italic mb-4 leading-relaxed">"{t.quote}"</p>
              <p className="text-sm font-semibold text-gray-900">— {t.name}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-serif text-center text-gray-900 mb-3">Choose Your Plan</h2>
        <p className="text-center text-gray-600 mb-12">Cancel anytime. No hidden fees.</p>
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`bg-white rounded-2xl p-8 border-2 transition-all ${
                p.featured
                  ? 'border-rose-500 shadow-xl scale-105'
                  : 'border-rose-100 hover:border-rose-300'
              }`}
            >
              {p.featured && (
                <div className="inline-block px-3 py-1 bg-rose-600 text-white text-xs font-semibold rounded-full mb-4">
                  MOST POPULAR
                </div>
              )}
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{p.name}</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-900">${p.price}</span>
                <span className="text-gray-500">{p.period}</span>
              </div>
              <p className="text-sm text-rose-600 font-medium mb-6">{p.note}</p>
              <button
                className={`w-full py-3 rounded-full font-semibold transition-colors ${
                  p.featured
                    ? 'bg-rose-600 hover:bg-rose-700 text-white'
                    : 'bg-rose-50 hover:bg-rose-100 text-rose-700'
                }`}
              >
                Subscribe
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
