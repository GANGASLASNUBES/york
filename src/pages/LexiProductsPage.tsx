import React from 'react';
import { ShoppingBag } from 'lucide-react';

const SAMPLE_PRODUCTS = [
  {
    id: '1',
    label: 'Skincare Preset Pack',
    price: 29.99,
    description: 'Professional skincare routine presets for all skin types',
  },
  {
    id: '2',
    label: 'Makeup Masterclass',
    price: 49.99,
    description: 'Complete guide to natural makeup application',
  },
  {
    id: '3',
    label: 'Wellness Bundle',
    price: 39.99,
    description: 'Meditation, skincare & wellness guides',
  },
];

export function LexiProductsPage() {
  const products = SAMPLE_PRODUCTS;

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-4xl font-bold mb-2 text-gray-900">Shop</h1>
        <p className="text-lg text-gray-600">Digital downloads, courses, presets & more</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow border border-gray-200"
          >
            <div className="bg-gradient-to-br from-pink-100 to-pink-50 h-48 flex items-center justify-center">
              <ShoppingBag className="text-pink-300" size={64} />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg text-gray-900 mb-2">{product.label}</h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-pink-600">
                  ${product.price.toFixed(2)}
                </span>
                <button className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors">
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
