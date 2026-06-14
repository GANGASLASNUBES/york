import { useState } from 'react';
import { Crop, RotateCw, Scissors, Palette, Layers, Wand2, Download, Film, ChevronDown, ChevronUp } from 'lucide-react';

interface EditingWorkbenchProps {
  selectedAsset?: any;
}

export default function EditingWorkbench({ selectedAsset }: EditingWorkbenchProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const imageTools = [
    { icon: Crop, label: 'Crop', action: 'crop' },
    { icon: RotateCw, label: 'Rotate', action: 'rotate' },
    { icon: Scissors, label: 'Remove BG', action: 'remove-bg' },
    { icon: Palette, label: 'Color Grade', action: 'color-grade' },
    { icon: Layers, label: 'Layers', action: 'layers' },
    { icon: Wand2, label: 'AI Tools', action: 'ai-tools' },
  ];

  const videoTools = [
    { icon: Scissors, label: 'Trim', action: 'trim' },
    { icon: Film, label: 'Loop', action: 'loop' },
    { icon: Palette, label: 'Grade', action: 'grade' },
    { icon: Layers, label: 'Overlay', action: 'overlay' },
  ];

  const exportPresets = [
    { name: 'Printful Ready', specs: '300 DPI PNG' },
    { name: 'Gameware Texture', specs: 'Optimized' },
    { name: 'Sprite Sheet', specs: 'Grid Layout' },
    { name: 'Normal Map', specs: 'High Res' },
  ];

  return (
    <div className="h-full flex flex-col border-t border-gray-800">
      <div className="p-3 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Editing Workbench</h3>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-500 hover:text-amber-500 transition-colors p-0.5"
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          <div>
            <h4 className="text-amber-500 font-medium mb-2 text-xs uppercase tracking-wider">Image Tools</h4>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-1.5">
              {imageTools.map((tool) => (
                <button
                  key={tool.action}
                  className="flex flex-col items-center gap-1 p-2.5 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 hover:border-amber-500/30 rounded-lg transition-all group"
                >
                  <tool.icon className="w-4 h-4 text-gray-400 group-hover:text-amber-500 transition-colors" />
                  <span className="text-[10px] text-gray-500 group-hover:text-white transition-colors">{tool.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-amber-500 font-medium mb-2 text-xs uppercase tracking-wider">Video Tools</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
              {videoTools.map((tool) => (
                <button
                  key={tool.action}
                  className="flex flex-col items-center gap-1 p-2.5 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 hover:border-amber-500/30 rounded-lg transition-all group"
                >
                  <tool.icon className="w-4 h-4 text-gray-400 group-hover:text-amber-500 transition-colors" />
                  <span className="text-[10px] text-gray-500 group-hover:text-white transition-colors">{tool.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-amber-500 font-medium mb-2 text-xs uppercase tracking-wider">Export Presets</h4>
            <div className="grid grid-cols-2 gap-1.5">
              {exportPresets.map((preset) => (
                <button
                  key={preset.name}
                  className="flex items-center justify-between p-2.5 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 hover:border-amber-500/30 rounded-lg transition-all group"
                >
                  <div className="text-left">
                    <div className="text-xs text-white font-medium">{preset.name}</div>
                    <div className="text-[10px] text-gray-500">{preset.specs}</div>
                  </div>
                  <Download className="w-3.5 h-3.5 text-gray-500 group-hover:text-amber-500 transition-colors" />
                </button>
              ))}
            </div>
          </div>

          {selectedAsset && (
            <div className="p-3 bg-gray-800/50 border border-amber-500/20 rounded-lg">
              <h4 className="text-white font-medium text-xs mb-2">Selected Asset</h4>
              <p className="text-xs text-gray-400">{selectedAsset.name}</p>
              <button className="mt-2 w-full px-3 py-2 bg-amber-500 hover:bg-amber-600 text-black text-xs font-medium rounded-lg transition-colors">
                Save Edited Version
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
