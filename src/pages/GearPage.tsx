import { Card, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Gamepad2, Info, ExternalLink } from 'lucide-react';
import { GEAR_PRODUCTS } from '../lib/constants';

export function GearPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Gamepad2 size={40} className="text-amber-500" />
          <div>
            <h1 className="text-4xl font-bold">Gaming Gear</h1>
            <p className="text-gray-400 mt-2">Pro-level peripherals and accessories for peak performance</p>
          </div>
        </div>
        <a
          href="https://bipsgear.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="primary">
            Visit Store
            <ExternalLink className="inline-block ml-2" size={16} />
          </Button>
        </a>
      </div>

      <section className="mb-10 bg-gradient-to-r from-orange-900/20 to-red-900/20 border border-amber-500/20 rounded-xl p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white">Shop all gear at bipsgear.com</h2>
            <p className="text-gray-400 mt-1">
              Full catalog of controllers, peripherals, and pro accessories.
            </p>
          </div>
          <a
            href="https://bipsgear.com"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0"
          >
            <Button variant="primary">
              Shop Now
              <ExternalLink className="inline-block ml-2" size={16} />
            </Button>
          </a>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {GEAR_PRODUCTS.map((gear) => (
          <Card key={gear.id} className="hover:border-amber-500/50 transition-all">
            <div className="aspect-square bg-gradient-to-br from-orange-900/30 to-red-900/30 flex items-center justify-center">
              <Gamepad2 size={80} className="text-amber-500/20" />
            </div>
            <CardBody>
              <h3 className="text-xl font-bold">{gear.name}</h3>

              <div className="mt-3 flex items-start gap-2">
                <Info size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-400">{gear.specs}</p>
              </div>

              <p className="text-2xl font-bold text-amber-500 mt-4">${gear.price}</p>

              <a
                href="https://bipsgear.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="primary" className="w-full mt-4">
                  Buy on bipsgear.com
                  <ExternalLink className="inline-block ml-2" size={16} />
                </Button>
              </a>
            </CardBody>
          </Card>
        ))}
      </div>

      <section className="mt-16 bg-gray-900 border border-gray-800 rounded-xl p-8">
        <h2 className="text-2xl font-bold mb-6">Why Choose This Gear?</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-amber-500 font-semibold mb-2">Pro Performance</h3>
            <p className="text-gray-400 text-sm">
              Engineered for competitive gaming with precision controls and minimal latency.
              Used by top esports athletes worldwide.
            </p>
          </div>
          <div>
            <h3 className="text-amber-500 font-semibold mb-2">Premium Build</h3>
            <p className="text-gray-400 text-sm">
              Durable construction using high-quality materials designed to withstand intense
              gaming sessions and last for years.
            </p>
          </div>
          <div>
            <h3 className="text-amber-500 font-semibold mb-2">Universal Compatibility</h3>
            <p className="text-gray-400 text-sm">
              Works seamlessly across PC, console, and mobile platforms. Plug and play
              with automatic configuration.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-8 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl p-6">
        <h3 className="text-xl font-bold mb-2">2-Year Warranty</h3>
        <p className="text-gray-400">
          All gaming gear comes with a comprehensive 2-year warranty covering manufacturing
          defects and hardware failures. Shop with confidence at{' '}
          <a href="https://bipsgear.com" target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:text-amber-400 underline">
            bipsgear.com
          </a>.
        </p>
      </section>
    </div>
  );
}
