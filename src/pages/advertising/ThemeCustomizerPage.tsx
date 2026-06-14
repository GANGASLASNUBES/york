import { useState } from 'react';
import { Layout } from '../../components/Layout';
import { Palette, Droplet, Layers, Save, Eye, RotateCcw } from 'lucide-react';

interface ThemeConfig {
  primary: string;
  secondary: string;
  accent: string;
  overlayMode: 'cybernetic' | 'nature' | 'default';
  texturePack: 'bark' | 'moss' | 'stone' | 'water' | 'none';
  gearStateColors: {
    active: string;
    idle: string;
    charging: string;
    error: string;
  };
}

const defaultTheme: ThemeConfig = {
  primary: '#f59e0b',
  secondary: '#78350f',
  accent: '#fbbf24',
  overlayMode: 'default',
  texturePack: 'none',
  gearStateColors: {
    active: '#10b981',
    idle: '#6b7280',
    charging: '#3b82f6',
    error: '#ef4444'
  }
};

const texturePacks = [
  { id: 'none', name: 'None', description: 'Clean minimal design' },
  { id: 'bark', name: 'Bark', description: 'Natural wood texture' },
  { id: 'moss', name: 'Moss', description: 'Organic moss pattern' },
  { id: 'stone', name: 'Stone', description: 'Rocky stone texture' },
  { id: 'water', name: 'Water', description: 'Flowing water effect' }
];

const overlayModes = [
  { id: 'default', name: 'Default', description: 'Standard overlay' },
  { id: 'cybernetic', name: 'Cybernetic', description: 'Futuristic tech overlay' },
  { id: 'nature', name: 'Nature', description: 'Organic natural overlay' }
];

export function ThemeCustomizerPage() {
  const [theme, setTheme] = useState<ThemeConfig>(defaultTheme);
  const [isSaved, setIsSaved] = useState(false);

  const updateTheme = (field: keyof ThemeConfig, value: any) => {
    setTheme(prev => ({ ...prev, [field]: value }));
    setIsSaved(false);
  };

  const updateGearColor = (state: keyof ThemeConfig['gearStateColors'], color: string) => {
    setTheme(prev => ({
      ...prev,
      gearStateColors: {
        ...prev.gearStateColors,
        [state]: color
      }
    }));
    setIsSaved(false);
  };

  const handleSave = () => {
    console.log('Saving theme:', theme);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleReset = () => {
    setTheme(defaultTheme);
    setIsSaved(false);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-black text-white">
        {/* Header */}
        <div className="border-b border-amber-900/30 bg-black/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-amber-500">Theme Customizer</h1>
                <p className="text-gray-400 mt-1">Customize your ᗺIPSGear experience</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  <RotateCcw className="w-5 h-5" />
                  Reset
                </button>
                <button
                  onClick={handleSave}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                    isSaved
                      ? 'bg-green-600 text-white'
                      : 'bg-amber-600 hover:bg-amber-700 text-black'
                  }`}
                >
                  <Save className="w-5 h-5" />
                  {isSaved ? 'Saved!' : 'Save & Activate'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Customization Options */}
            <div className="space-y-6">
              {/* Color Pickers */}
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Palette className="w-6 h-6 text-amber-500" />
                  <h2 className="text-xl font-bold text-white">Brand Colors</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Primary Color
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="color"
                        value={theme.primary}
                        onChange={(e) => updateTheme('primary', e.target.value)}
                        className="w-16 h-12 rounded-lg cursor-pointer bg-gray-800 border border-gray-700"
                      />
                      <input
                        type="text"
                        value={theme.primary}
                        onChange={(e) => updateTheme('primary', e.target.value)}
                        className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Secondary Color
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="color"
                        value={theme.secondary}
                        onChange={(e) => updateTheme('secondary', e.target.value)}
                        className="w-16 h-12 rounded-lg cursor-pointer bg-gray-800 border border-gray-700"
                      />
                      <input
                        type="text"
                        value={theme.secondary}
                        onChange={(e) => updateTheme('secondary', e.target.value)}
                        className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Accent Color
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="color"
                        value={theme.accent}
                        onChange={(e) => updateTheme('accent', e.target.value)}
                        className="w-16 h-12 rounded-lg cursor-pointer bg-gray-800 border border-gray-700"
                      />
                      <input
                        type="text"
                        value={theme.accent}
                        onChange={(e) => updateTheme('accent', e.target.value)}
                        className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Overlay Mode */}
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Layers className="w-6 h-6 text-amber-500" />
                  <h2 className="text-xl font-bold text-white">Overlay Mode</h2>
                </div>

                <div className="space-y-3">
                  {overlayModes.map(mode => (
                    <button
                      key={mode.id}
                      onClick={() => updateTheme('overlayMode', mode.id)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        theme.overlayMode === mode.id
                          ? 'border-amber-600 bg-amber-900/20'
                          : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                      }`}
                    >
                      <div className="font-semibold text-white mb-1">{mode.name}</div>
                      <div className="text-sm text-gray-400">{mode.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Texture Pack */}
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Droplet className="w-6 h-6 text-amber-500" />
                  <h2 className="text-xl font-bold text-white">Texture Pack</h2>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {texturePacks.map(pack => (
                    <button
                      key={pack.id}
                      onClick={() => updateTheme('texturePack', pack.id)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        theme.texturePack === pack.id
                          ? 'border-amber-600 bg-amber-900/20'
                          : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                      }`}
                    >
                      <div className="aspect-square bg-gray-700 rounded mb-2 flex items-center justify-center">
                        <Droplet className="w-8 h-8 text-gray-500" />
                      </div>
                      <div className="font-semibold text-white text-sm mb-1">{pack.name}</div>
                      <div className="text-xs text-gray-400">{pack.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Gear State Colors */}
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-bold text-white mb-6">Gear State Colors</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Active State
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="color"
                        value={theme.gearStateColors.active}
                        onChange={(e) => updateGearColor('active', e.target.value)}
                        className="w-16 h-12 rounded-lg cursor-pointer bg-gray-800 border border-gray-700"
                      />
                      <input
                        type="text"
                        value={theme.gearStateColors.active}
                        onChange={(e) => updateGearColor('active', e.target.value)}
                        className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Idle State
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="color"
                        value={theme.gearStateColors.idle}
                        onChange={(e) => updateGearColor('idle', e.target.value)}
                        className="w-16 h-12 rounded-lg cursor-pointer bg-gray-800 border border-gray-700"
                      />
                      <input
                        type="text"
                        value={theme.gearStateColors.idle}
                        onChange={(e) => updateGearColor('idle', e.target.value)}
                        className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Charging State
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="color"
                        value={theme.gearStateColors.charging}
                        onChange={(e) => updateGearColor('charging', e.target.value)}
                        className="w-16 h-12 rounded-lg cursor-pointer bg-gray-800 border border-gray-700"
                      />
                      <input
                        type="text"
                        value={theme.gearStateColors.charging}
                        onChange={(e) => updateGearColor('charging', e.target.value)}
                        className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Error State
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="color"
                        value={theme.gearStateColors.error}
                        onChange={(e) => updateGearColor('error', e.target.value)}
                        className="w-16 h-12 rounded-lg cursor-pointer bg-gray-800 border border-gray-700"
                      />
                      <input
                        type="text"
                        value={theme.gearStateColors.error}
                        onChange={(e) => updateGearColor('error', e.target.value)}
                        className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Preview */}
            <div className="lg:sticky lg:top-24 h-fit">
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Eye className="w-6 h-6 text-amber-500" />
                  <h2 className="text-xl font-bold text-white">Live Preview</h2>
                </div>

                <div className="space-y-4">
                  {/* Color Preview */}
                  <div
                    className="rounded-lg p-6 border-2 transition-all"
                    style={{
                      backgroundColor: theme.secondary,
                      borderColor: theme.primary
                    }}
                  >
                    <h3
                      className="text-2xl font-bold mb-2"
                      style={{ color: theme.primary }}
                    >
                      Sample Heading
                    </h3>
                    <p className="text-white mb-4">
                      This is how your theme will look across the platform.
                    </p>
                    <button
                      className="px-6 py-3 rounded-lg font-semibold text-black transition-colors"
                      style={{ backgroundColor: theme.accent }}
                    >
                      Sample Button
                    </button>
                  </div>

                  {/* Overlay Preview */}
                  <div className="rounded-lg p-6 bg-gray-800 border border-gray-700">
                    <div className="text-sm text-gray-400 mb-2">Overlay Mode:</div>
                    <div className="text-lg font-semibold text-white capitalize">
                      {theme.overlayMode}
                    </div>
                  </div>

                  {/* Texture Preview */}
                  <div className="rounded-lg p-6 bg-gray-800 border border-gray-700">
                    <div className="text-sm text-gray-400 mb-2">Texture Pack:</div>
                    <div className="text-lg font-semibold text-white capitalize">
                      {theme.texturePack}
                    </div>
                  </div>

                  {/* Gear States Preview */}
                  <div className="rounded-lg p-6 bg-gray-800 border border-gray-700">
                    <div className="text-sm text-gray-400 mb-3">Gear State Colors:</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: theme.gearStateColors.active }}
                        />
                        <span className="text-sm text-white">Active</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: theme.gearStateColors.idle }}
                        />
                        <span className="text-sm text-white">Idle</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: theme.gearStateColors.charging }}
                        />
                        <span className="text-sm text-white">Charging</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: theme.gearStateColors.error }}
                        />
                        <span className="text-sm text-white">Error</span>
                      </div>
                    </div>
                  </div>

                  {/* Sample UI Elements */}
                  <div className="rounded-lg p-6 bg-gray-800 border border-gray-700">
                    <div className="text-sm text-gray-400 mb-3">Sample UI Elements:</div>
                    <div className="space-y-3">
                      <div
                        className="h-2 rounded-full"
                        style={{ backgroundColor: theme.primary }}
                      />
                      <div
                        className="h-2 rounded-full"
                        style={{ backgroundColor: theme.accent }}
                      />
                      <div className="flex gap-2">
                        {Object.values(theme.gearStateColors).map((color, index) => (
                          <div
                            key={index}
                            className="flex-1 h-12 rounded"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
