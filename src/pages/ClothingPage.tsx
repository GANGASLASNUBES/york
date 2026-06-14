import { Card, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Shirt, ExternalLink, Sparkles, Ruler, Scissors } from 'lucide-react';
import { CLOTHING_PRODUCTS } from '../lib/constants';
import { useState } from 'react';

export function ClothingPage() {
  const [selectedSizes, setSelectedSizes] = useState<Record<number, string>>({});

  const handleSizeSelect = (productId: number, size: string) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: size }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-900/40 to-cyan-900/40 border border-amber-500/20">
            <Shirt size={48} className="text-amber-500" />
          </div>
          <div>
            <h1 className="text-5xl font-bold">Clothing Collection</h1>
            <p className="text-gray-400 mt-2 text-lg">Premium streetwear and racing apparel</p>
          </div>
        </div>
        <a
          href="https://lexiroseca.myshopify.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="primary" className="whitespace-nowrap">
            Visit Store
            <ExternalLink className="inline-block ml-2" size={16} />
          </Button>
        </a>
      </div>

      <section className="mb-12 bg-gradient-to-r from-blue-900/20 via-cyan-900/20 to-blue-900/20 border border-amber-500/30 rounded-xl overflow-hidden">
        <div className="p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={24} className="text-amber-500" />
                <h2 className="text-2xl font-bold text-white">Shop the full collection</h2>
              </div>
              <p className="text-gray-300 leading-relaxed">
                Browse all styles, sizes, and seasonal drops at lexiroseca.myshopify.com
              </p>
            </div>
            <a
              href="https://lexiroseca.myshopify.com"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0"
            >
              <Button variant="primary" className="min-w-[180px]">
                Shop Now
                <ExternalLink className="inline-block ml-2" size={16} />
              </Button>
            </a>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {CLOTHING_PRODUCTS.map((item) => (
          <Card key={item.id} className="hover:border-amber-500/50 transition-all group">
            <div className="aspect-square bg-gray-900 flex items-center justify-center relative overflow-hidden">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <CardBody>
              <h3 className="text-xl font-bold mb-3">{item.name}</h3>
              <p className="text-3xl font-bold text-amber-500 mb-4">${item.price}</p>

              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2 font-medium">Select Size:</p>
                <div className="flex gap-2">
                  {item.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => handleSizeSelect(item.id, size)}
                      className={`px-3 py-1.5 rounded-lg border transition-all text-sm font-medium ${
                        selectedSizes[item.id] === size
                          ? 'border-amber-500 bg-amber-500/20 text-amber-500'
                          : 'border-gray-700 text-gray-400 hover:border-gray-600'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <a
                href="https://lexiroseca.myshopify.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="primary" className="w-full group-hover:bg-amber-600 transition-colors">
                  Buy on lexiroseca.myshopify.com
                  <ExternalLink className="inline-block ml-2" size={16} />
                </Button>
              </a>
            </CardBody>
          </Card>
        ))}
      </div>

      <section className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="border-b border-gray-800 px-8 py-4">
          <h2 className="text-3xl font-bold">Quality & Fit</h2>
        </div>
        <div className="p-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex flex-col">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-4 w-fit">
                <Scissors size={24} className="text-amber-500" />
              </div>
              <h3 className="text-lg font-bold mb-2">Materials</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                All clothing is made from premium materials designed for comfort and durability.
                Racing jackets feature weather-resistant fabric, while hoodies and tees use
                premium cotton blends.
              </p>
            </div>
            <div className="flex flex-col">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-4 w-fit">
                <Ruler size={24} className="text-amber-500" />
              </div>
              <h3 className="text-lg font-bold mb-2">Sizing</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Runs true to size. Check the detailed size guide on{' '}
                <a href="https://lexiroseca.myshopify.com" target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:text-amber-400 font-semibold">
                  lexiroseca.myshopify.com
                </a>.
                All items are unisex unless otherwise specified. Free returns within 30 days.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
