import { useState, useRef } from 'react';
import { Shirt, GripVertical, Maximize2, Minimize2 } from 'lucide-react';
import ArtAssetLibrary from '../../components/clothing/ArtAssetLibrary';
import EditingWorkbench from '../../components/clothing/EditingWorkbench';
import PrintfulGenerator from '../../components/clothing/PrintfulGenerator';
import GamewareDock from '../../components/clothing/GamewareDock';
import CompletedAssetsGallery from '../../components/clothing/CompletedAssetsGallery';
import type { ArtAsset } from '../../types/clothing';

type PanelId = 'assets' | 'design' | 'gallery';

const panelLabels: Record<PanelId, string> = {
  assets: 'Assets & Editing',
  design: 'Design & Export',
  gallery: 'Completed Work',
};

export default function ClothingCreatorPage() {
  const [selectedAsset, setSelectedAsset] = useState<ArtAsset | undefined>();
  const [droppedAsset, setDroppedAsset] = useState<ArtAsset | undefined>();
  const [currentDesignId, setCurrentDesignId] = useState<string | undefined>();
  const [expandedPanel, setExpandedPanel] = useState<PanelId | null>(null);

  const [panelAHeight, setPanelAHeight] = useState(60);
  const [panelBHeight, setPanelBHeight] = useState(60);

  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const dragTypeRef = useRef<'section-a' | 'section-b' | null>(null);

  function handleAssetDragStart(asset: ArtAsset) {
    setSelectedAsset(asset);
  }

  function handleAssetDrop(asset: ArtAsset) {
    setDroppedAsset(asset);
    setTimeout(() => setDroppedAsset(undefined), 100);
  }

  function handleDesignSave(design: any) {
    console.log('Design saved:', design);
    setCurrentDesignId('mock-design-id-' + Date.now());
  }

  function togglePanel(panelId: PanelId) {
    setExpandedPanel((prev) => (prev === panelId ? null : panelId));
  }

  function handleMouseDown(dragType: 'section-a' | 'section-b') {
    if (expandedPanel) return;
    isDraggingRef.current = true;
    dragTypeRef.current = dragType;
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!isDraggingRef.current || !dragTypeRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    const percentY = (mouseY / rect.height) * 100;

    if (dragTypeRef.current === 'section-a') {
      setPanelAHeight(Math.max(30, Math.min(80, percentY)));
    } else if (dragTypeRef.current === 'section-b') {
      setPanelBHeight(Math.max(30, Math.min(80, percentY)));
    }
  }

  function handleMouseUp() {
    isDraggingRef.current = false;
    dragTypeRef.current = null;
  }

  function isPanelVisible(panelId: PanelId) {
    return expandedPanel === null || expandedPanel === panelId;
  }

  function PanelHeader({ panelId }: { panelId: PanelId }) {
    const isExpanded = expandedPanel === panelId;
    return (
      <div className="flex items-center justify-between px-3 py-2 bg-gray-800/60 border-b border-gray-700/50">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
          {panelLabels[panelId]}
        </span>
        <button
          onClick={() => togglePanel(panelId)}
          className="p-1 rounded-md text-gray-500 hover:text-amber-500 hover:bg-gray-700/50 transition-colors"
          title={isExpanded ? 'Restore panels' : 'Expand panel'}
        >
          {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Shirt size={40} className="text-amber-500" />
        <div>
          <h1 className="text-4xl font-bold">Clothing Creator</h1>
          <p className="text-gray-400 mt-1">Design, preview on Printful products, and export to Gameware</p>
        </div>
      </div>

      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="hidden md:flex gap-3 relative"
          style={{ height: 'calc(100vh - 220px)', maxHeight: '900px' }}
        >
          {isPanelVisible('assets') && (
            <div
              className="flex flex-col bg-gray-900 border border-gray-800 rounded-xl overflow-hidden transition-all duration-300"
              style={{ width: expandedPanel === 'assets' ? '100%' : '33.33%' }}
            >
              <PanelHeader panelId="assets" />
              <div className="flex-1 flex flex-col min-h-0">
                <div className="min-h-0" style={{ height: `${panelAHeight}%` }}>
                  <ArtAssetLibrary onDragStart={handleAssetDragStart} />
                </div>
                <div
                  className="h-1.5 bg-gray-800 hover:bg-amber-500/50 cursor-ns-resize flex items-center justify-center transition-colors shrink-0"
                  onMouseDown={() => handleMouseDown('section-a')}
                >
                  <GripVertical className="w-3 h-3 text-gray-600 rotate-90" />
                </div>
                <div className="min-h-0" style={{ height: `${100 - panelAHeight}%` }}>
                  <EditingWorkbench selectedAsset={selectedAsset} />
                </div>
              </div>
            </div>
          )}

          {isPanelVisible('design') && (
            <div
              className="flex flex-col bg-gray-900 border border-gray-800 rounded-xl overflow-hidden transition-all duration-300"
              style={{ width: expandedPanel === 'design' ? '100%' : '33.33%' }}
              onDrop={(e) => {
                e.preventDefault();
                if (selectedAsset) handleAssetDrop(selectedAsset);
              }}
              onDragOver={(e) => e.preventDefault()}
            >
              <PanelHeader panelId="design" />
              <div className="flex-1 flex flex-col min-h-0">
                <div className="min-h-0" style={{ height: `${panelBHeight}%` }}>
                  <PrintfulGenerator
                    droppedAsset={droppedAsset}
                    onDesignSave={handleDesignSave}
                  />
                </div>
                <div
                  className="h-1.5 bg-gray-800 hover:bg-amber-500/50 cursor-ns-resize flex items-center justify-center transition-colors shrink-0"
                  onMouseDown={() => handleMouseDown('section-b')}
                >
                  <GripVertical className="w-3 h-3 text-gray-600 rotate-90" />
                </div>
                <div className="min-h-0" style={{ height: `${100 - panelBHeight}%` }}>
                  <GamewareDock designId={currentDesignId} />
                </div>
              </div>
            </div>
          )}

          {isPanelVisible('gallery') && (
            <div
              className="flex flex-col bg-gray-900 border border-gray-800 rounded-xl overflow-hidden transition-all duration-300"
              style={{ width: expandedPanel === 'gallery' ? '100%' : '33.33%' }}
            >
              <PanelHeader panelId="gallery" />
              <div className="flex-1 min-h-0">
                <CompletedAssetsGallery />
              </div>
            </div>
          )}
        </div>

        <div className="md:hidden space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="h-[500px]">
              <ArtAssetLibrary onDragStart={handleAssetDragStart} />
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="h-[300px]">
              <EditingWorkbench selectedAsset={selectedAsset} />
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="h-[500px]">
              <PrintfulGenerator
                droppedAsset={droppedAsset}
                onDesignSave={handleDesignSave}
              />
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="h-[300px]">
              <GamewareDock designId={currentDesignId} />
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="h-[600px]">
              <CompletedAssetsGallery />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
