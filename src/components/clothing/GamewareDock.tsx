import { useState, useEffect } from 'react';
import { Lock, CircleCheck as CheckCircle, Download, Gamepad2, Box, Image, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface GamewareDockProps {
  designId?: string;
}

export default function GamewareDock({ designId }: GamewareDockProps) {
  const [isPurchaseVerified, setIsPurchaseVerified] = useState(false);
  const [checking, setChecking] = useState(false);
  const [gamewareAssets, setGamewareAssets] = useState<any[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (designId) {
      checkPurchaseStatus();
      loadGamewareAssets();
    }
  }, [designId]);

  async function checkPurchaseStatus() {
    if (!designId) return;

    setChecking(true);
    try {
      const response = await supabase
        .from('printful_orders')
        .select('*');

      if (response.error) throw response.error;

      const verified = (response.data || []).some(
        (order: any) => order.design_id === designId && order.status === 'fulfilled'
      );
      setIsPurchaseVerified(verified);
    } catch (error) {
      console.error('Error checking purchase status:', error);
    } finally {
      setChecking(false);
    }
  }

  async function loadGamewareAssets() {
    if (!designId) return;

    try {
      const response = await supabase
        .from('gameware_assets')
        .select('*');

      if (response.error) throw response.error;

      const filtered = (response.data || []).filter((asset: any) => asset.design_id === designId);
      setGamewareAssets(filtered);
    } catch (error) {
      console.error('Error loading gameware assets:', error);
    }
  }

  const exportPresets = [
    {
      name: 'Unity Package',
      icon: Box,
      types: ['Texture Maps', 'Prefabs', 'Materials', 'Scripts'],
      format: '.unitypackage',
    },
    {
      name: 'Unreal Assets',
      icon: Gamepad2,
      types: ['Textures', 'Materials', 'Blueprints', 'Skeletal Mesh'],
      format: '.uasset',
    },
    {
      name: 'Godot Resources',
      icon: Box,
      types: ['Textures', 'Materials', 'Scenes', 'Scripts'],
      format: '.tres',
    },
    {
      name: 'WebGL Bundle',
      icon: Image,
      types: ['Sprite Sheets', 'Textures', 'JSON Metadata'],
      format: '.zip',
    },
  ];

  const conversionFeatures = [
    'Auto-texture mapping (PNG/WebP)',
    'Sprite sheet generation',
    'Normal map creation',
    'Mask layer extraction',
    'Low-poly + high-poly variants',
    'Animation-ready layers',
    'Avatar auto-fit (Lexi model)',
    'Red mask + black smile validation',
  ];

  if (!designId) {
    return (
      <div className="h-full border-t border-gray-800 flex items-center justify-center">
        <div className="text-center text-gray-500 p-6">
          <Gamepad2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Create a design first to access Gameware export</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col border-t border-gray-800 overflow-y-auto">
      <div className="p-3 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">One-Click-to-Gameware</h3>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-500 hover:text-amber-500 transition-colors p-0.5"
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <>
          {!isPurchaseVerified ? (
            <div className="p-4">
              <div className="bg-gray-800/50 border border-amber-500/20 rounded-xl p-5 text-center">
                <Lock className="w-10 h-10 mx-auto mb-3 text-amber-500/50" />
                <h4 className="text-base font-semibold text-white mb-1">Gameware Locked</h4>
                <p className="text-gray-400 text-xs mb-4">
                  Complete your Printful purchase to unlock gameware export
                </p>
                <div className="bg-gray-900/50 rounded-lg p-3 mb-4">
                  <p className="text-[10px] text-gray-500 mb-1.5 uppercase tracking-wider">Requirements</p>
                  <ul className="text-xs text-gray-300 space-y-1 text-left max-w-xs mx-auto">
                    <li className="flex items-center gap-2">
                      <span className="text-green-500 text-[10px]">&#10003;</span>
                      Design saved
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-red-400 text-[10px]">&#10007;</span>
                      Printful order completed
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-gray-600 text-[10px]">&#9675;</span>
                      <span className="text-gray-500">Payment verified</span>
                    </li>
                  </ul>
                </div>
                <button
                  onClick={checkPurchaseStatus}
                  disabled={checking}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black text-xs font-medium rounded-lg transition-colors disabled:bg-gray-700 disabled:text-gray-500"
                >
                  {checking ? 'Checking...' : 'Complete Purchase to Unlock'}
                </button>
              </div>

              <div className="mt-4 p-3 bg-gray-800/30 border border-gray-700/50 rounded-lg">
                <h5 className="text-white font-medium text-xs mb-2">What You'll Get:</h5>
                <ul className="space-y-1.5 text-xs text-gray-400">
                  {conversionFeatures.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-500 text-[10px] mt-0.5">&#9656;</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              <div className="bg-green-950/30 border border-green-600/30 rounded-lg p-3 flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-500 shrink-0" />
                <div>
                  <h4 className="text-white font-medium text-xs">Gameware Unlocked</h4>
                  <p className="text-[10px] text-gray-400">Purchase verified. Export ready.</p>
                </div>
              </div>

              <div>
                <h4 className="text-amber-500 font-medium mb-2 text-xs uppercase tracking-wider">Export Presets</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {exportPresets.map((preset) => (
                    <div
                      key={preset.name}
                      className="bg-gray-800/50 border border-gray-700/50 hover:border-amber-500/30 rounded-lg transition-all p-3"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <preset.icon className="w-3.5 h-3.5 text-amber-500" />
                          <h5 className="text-white font-medium text-xs">{preset.name}</h5>
                        </div>
                        <span className="text-[10px] text-gray-500">{preset.format}</span>
                      </div>
                      <ul className="text-[10px] text-gray-500 space-y-0.5 mb-2">
                        {preset.types.map((type) => (
                          <li key={type}>- {type}</li>
                        ))}
                      </ul>
                      <button className="w-full px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-black text-[10px] font-medium rounded-md flex items-center justify-center gap-1.5 transition-colors">
                        <Download className="w-3 h-3" />
                        Export
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {gamewareAssets.length > 0 && (
                <div>
                  <h4 className="text-amber-500 font-medium mb-2 text-xs uppercase tracking-wider">Generated Assets</h4>
                  <div className="space-y-1.5">
                    {gamewareAssets.map((asset) => (
                      <div
                        key={asset.id}
                        className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-2.5 flex items-center justify-between"
                      >
                        <div>
                          <div className="text-white text-xs font-medium">{asset.name}</div>
                          <div className="text-[10px] text-gray-500">
                            {asset.engine} - {asset.asset_type}
                          </div>
                        </div>
                        <button className="text-amber-500 hover:text-amber-400 transition-colors">
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-gray-800/30 border border-green-600/20 rounded-lg p-3">
                <h5 className="text-white font-medium text-xs mb-2 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                  Avatar Integration
                </h5>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li>Auto-fit to Lexi base model</li>
                  <li>Red mask validated</li>
                  <li>Black marker smile validated</li>
                  <li>Pose & animation preview ready</li>
                </ul>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
