import { useState } from 'react';
import { Cpu, HardDrive, Monitor, Headphones, Gamepad2, ShoppingCart } from 'lucide-react';

type Component = { id: string; name: string; price: number };
type Category = { key: string; label: string; icon: typeof Cpu; options: Component[] };

const CATEGORIES: Category[] = [
  {
    key: 'wheel',
    label: 'Racing Wheel',
    icon: Gamepad2,
    options: [
      { id: 'w1', name: 'Logitech G29', price: 299 },
      { id: 'w2', name: 'Fanatec CSL', price: 499 },
      { id: 'w3', name: 'Thrustmaster T300', price: 399 },
    ],
  },
  {
    key: 'headset',
    label: 'AR Headset',
    icon: Headphones,
    options: [
      { id: 'h1', name: 'Meta Quest 3', price: 499 },
      { id: 'h2', name: 'Varjo Aero', price: 1999 },
      { id: 'h3', name: 'HTC Vive XR', price: 1099 },
    ],
  },
  {
    key: 'monitor',
    label: 'Display',
    icon: Monitor,
    options: [
      { id: 'm1', name: '27" 144Hz', price: 349 },
      { id: 'm2', name: '32" 4K OLED', price: 899 },
      { id: 'm3', name: 'Triple 24"', price: 1049 },
    ],
  },
  {
    key: 'cpu',
    label: 'Compute Core',
    icon: Cpu,
    options: [
      { id: 'c1', name: 'BIPS Node v1', price: 599 },
      { id: 'c2', name: 'BIPS Node Pro', price: 1299 },
      { id: 'c3', name: 'BIPS Node Max', price: 2499 },
    ],
  },
  {
    key: 'storage',
    label: 'Field Storage',
    icon: HardDrive,
    options: [
      { id: 's1', name: '512GB NVMe', price: 89 },
      { id: 's2', name: '2TB NVMe', price: 229 },
      { id: 's3', name: '4TB NVMe', price: 449 },
    ],
  },
];

export function GearConfiguratorPage() {
  const [selected, setSelected] = useState<Record<string, Component | null>>({});

  const selectedComponents = CATEGORIES.map((cat) => selected[cat.key]).filter(Boolean) as Component[];
  const total = selectedComponents.reduce((sum, c) => sum + c.price, 0);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Gear Configurator</h1>
        <p className="text-gray-400">Build your custom field-ops rig. Preview in real-time.</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_400px] gap-6">
        <div className="space-y-5">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <div key={cat.key} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
                    <Icon className="text-emerald-400" size={20} />
                  </div>
                  <h3 className="text-lg font-semibold text-white">{cat.label}</h3>
                </div>
                <div className="grid md:grid-cols-3 gap-3">
                  {cat.options.map((opt) => {
                    const isSelected = selected[cat.key]?.id === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() =>
                          setSelected({
                            ...selected,
                            [cat.key]: isSelected ? null : opt,
                          })
                        }
                        className={`text-left p-4 rounded-lg border-2 transition-all ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-500/10'
                            : 'border-gray-800 bg-gray-950 hover:border-gray-700'
                        }`}
                      >
                        <div className="text-sm font-medium text-white mb-1">{opt.name}</div>
                        <div className="text-emerald-400 font-semibold">${opt.price}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="lg:sticky lg:top-6 h-fit bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-5">Your Build</h3>
          {selectedComponents.length === 0 ? (
            <p className="text-gray-500 text-sm">Select components to begin.</p>
          ) : (
            <div className="space-y-3 mb-6">
              {selectedComponents.map((c) => (
                <div key={c.id} className="flex justify-between text-sm">
                  <span className="text-gray-300">{c.name}</span>
                  <span className="text-white font-medium">${c.price}</span>
                </div>
              ))}
            </div>
          )}
          <div className="border-t border-gray-800 pt-4 mb-5">
            <div className="flex justify-between items-baseline">
              <span className="text-gray-400">Total</span>
              <span className="text-3xl font-bold text-emerald-400">${total.toLocaleString()}</span>
            </div>
          </div>
          <button
            disabled={selectedComponents.length === 0}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-800 disabled:text-gray-500 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingCart size={18} />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
