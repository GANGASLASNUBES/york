import { useState, useEffect } from 'react';
import { Trash2, Eye, ChevronDown, ChevronUp, Store, Package } from 'lucide-react';
import { PrintfulAPI } from '../../lib/printful';
import type { ArtAsset, DesignLayer } from '../../types/clothing';

interface PrintfulGeneratorProps {
  droppedAsset?: ArtAsset;
  onDesignSave: (design: any) => void;
}

export default function PrintfulGenerator({ droppedAsset, onDesignSave }: PrintfulGeneratorProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [productDetails, setProductDetails] = useState<any>(null);
  const [layers, setLayers] = useState<DesignLayer[]>([]);
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState<'store' | 'catalog'>('catalog');

  useEffect(() => {
    loadProducts();
  }, [viewMode]);

  useEffect(() => {
    if (droppedAsset) {
      addLayer(droppedAsset);
    }
  }, [droppedAsset]);

  useEffect(() => {
    if (selectedProduct?.id) {
      loadProductDetails(selectedProduct.id);
    }
  }, [selectedProduct]);

  async function loadProducts() {
    setLoading(true);
    const data = viewMode === 'catalog'
      ? await PrintfulAPI.getCatalogProducts()
      : await PrintfulAPI.getProducts();
    setProducts(data);
    if (data.length > 0) {
      setSelectedProduct(data[0]);
    }
    setLoading(false);
  }

  async function loadProductDetails(productId: string) {
    const details = await PrintfulAPI.getProductDetails(productId);
    setProductDetails(details);
  }

  function addLayer(asset: ArtAsset) {
    const newLayer: DesignLayer = {
      id: `layer-${Date.now()}`,
      asset_id: asset.id,
      asset_url: asset.file_url,
      position: { x: 50, y: 50 },
      scale: 1,
      rotation: 0,
      z_index: layers.length,
      opacity: 1,
    };
    setLayers([...layers, newLayer]);
    setSelectedLayer(newLayer.id);
  }

  function updateLayer(layerId: string, updates: Partial<DesignLayer>) {
    setLayers(layers.map((l) => (l.id === layerId ? { ...l, ...updates } : l)));
  }

  function deleteLayer(layerId: string) {
    setLayers(layers.filter((l) => l.id !== layerId));
    if (selectedLayer === layerId) setSelectedLayer(null);
  }

  async function generateMockup() {
    if (!selectedProduct || layers.length === 0) return;
    setLoading(true);
    try {
      const mockups = await PrintfulAPI.generateMockup({
        product_id: selectedProduct.id,
        variant_id: '1',
        files: layers.map((layer) => ({
          url: layer.asset_url,
          position: 'front',
        })),
      });
      console.log('Generated mockups:', mockups);
    } catch (error) {
      console.error('Error generating mockup:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-white">Printful Generator</h2>
          <div className="flex items-center gap-2">
            <div className="flex bg-gray-800 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('catalog')}
                className={`px-2 py-1 text-xs rounded flex items-center gap-1 transition-colors ${
                  viewMode === 'catalog'
                    ? 'bg-amber-500/20 text-amber-500'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Package className="w-3 h-3" />
                Catalog
              </button>
              <button
                onClick={() => setViewMode('store')}
                className={`px-2 py-1 text-xs rounded flex items-center gap-1 transition-colors ${
                  viewMode === 'store'
                    ? 'bg-amber-500/20 text-amber-500'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Store className="w-3 h-3" />
                My Store
              </button>
            </div>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-gray-500 hover:text-amber-500 transition-colors p-0.5"
            >
              {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-0.5">
          {loading ? (
            <div className="text-gray-500 text-xs py-1">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="text-gray-500 text-xs py-1">
              {viewMode === 'store' ? 'No products in your store yet' : 'No products available'}
            </div>
          ) : (
            products.map((product) => (
              <button
                key={product.id}
                onClick={() => setSelectedProduct(product)}
                className={`px-2.5 py-1 text-xs rounded-md whitespace-nowrap transition-colors ${
                  selectedProduct?.id === product.id
                    ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                    : 'bg-gray-800 text-gray-400 border border-transparent hover:text-white'
                }`}
              >
                {product.name}
              </button>
            ))
          )}
        </div>
      </div>

      {!isCollapsed && (
        <div className="flex-1 flex min-h-0">
          <div className="flex-1 p-3 relative">
            <div className="w-full h-full bg-gray-800/50 border border-gray-700/50 rounded-lg flex items-center justify-center relative overflow-hidden">
              {selectedProduct ? (
                <>
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900"></div>
                  {selectedProduct.image && (
                    <img
                      src={selectedProduct.image}
                      alt={selectedProduct.name}
                      className="absolute inset-0 w-full h-full object-contain opacity-30"
                    />
                  )}
                  <div className="relative w-3/4 h-3/4 bg-gray-700/50 border border-amber-500/20 rounded-lg">
                    {layers
                      .sort((a, b) => a.z_index - b.z_index)
                      .map((layer) => (
                        <div
                          key={layer.id}
                          className={`absolute cursor-move ${
                            selectedLayer === layer.id ? 'ring-2 ring-amber-500 rounded' : ''
                          }`}
                          style={{
                            left: `${layer.position.x}%`,
                            top: `${layer.position.y}%`,
                            transform: `translate(-50%, -50%) scale(${layer.scale}) rotate(${layer.rotation}deg)`,
                            opacity: layer.opacity,
                          }}
                          onClick={() => setSelectedLayer(layer.id)}
                        >
                          <img src={layer.asset_url} alt="" className="max-w-[200px] max-h-[200px]" />
                        </div>
                      ))}
                  </div>
                  <div className="absolute top-3 left-3 space-y-1">
                    <div className="bg-gray-900/90 text-white text-xs px-2 py-1 rounded">
                      {selectedProduct.name}
                    </div>
                    {productDetails && (
                      <div className="bg-gray-900/90 text-gray-400 text-[10px] px-2 py-1 rounded">
                        {productDetails.variants?.length || 0} variants available
                      </div>
                    )}
                  </div>
                  <div className="absolute top-3 right-3 bg-amber-500/20 text-amber-500 text-[10px] font-medium px-2 py-0.5 rounded">
                    SAFE PRINT AREA
                  </div>
                </>
              ) : (
                <div className="text-center text-gray-500">
                  <p className="text-sm">Select a product to start designing</p>
                </div>
              )}
            </div>
          </div>

          <div className="w-56 border-l border-gray-800 p-3 overflow-y-auto">
            <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Layers</h3>
            <div className="space-y-1.5 mb-3">
              {layers.length === 0 ? (
                <p className="text-gray-600 text-xs text-center py-4">
                  Drag assets here to add layers
                </p>
              ) : (
                layers.map((layer, index) => (
                  <div
                    key={layer.id}
                    className={`p-2.5 bg-gray-800/50 border rounded-lg cursor-pointer transition-all ${
                      selectedLayer === layer.id
                        ? 'border-amber-500/40 bg-amber-500/5'
                        : 'border-gray-700/50 hover:border-gray-600'
                    }`}
                    onClick={() => setSelectedLayer(layer.id)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white text-xs">Layer {index + 1}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteLayer(layer.id);
                        }}
                        className="text-gray-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    {selectedLayer === layer.id && (
                      <div className="space-y-2 mt-2">
                        <div>
                          <label className="text-[10px] text-gray-500">Scale</label>
                          <input
                            type="range"
                            min="0.1"
                            max="3"
                            step="0.1"
                            value={layer.scale}
                            onChange={(e) =>
                              updateLayer(layer.id, { scale: parseFloat(e.target.value) })
                            }
                            className="w-full h-1 accent-amber-500"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-500">Rotation</label>
                          <input
                            type="range"
                            min="0"
                            max="360"
                            value={layer.rotation}
                            onChange={(e) =>
                              updateLayer(layer.id, { rotation: parseInt(e.target.value) })
                            }
                            className="w-full h-1 accent-amber-500"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-500">Opacity</label>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={layer.opacity}
                            onChange={(e) =>
                              updateLayer(layer.id, { opacity: parseFloat(e.target.value) })
                            }
                            className="w-full h-1 accent-amber-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="space-y-1.5">
              <button
                onClick={generateMockup}
                disabled={loading || layers.length === 0}
                className="w-full px-3 py-2 bg-amber-500 hover:bg-amber-600 text-black text-xs font-medium rounded-lg disabled:bg-gray-700 disabled:text-gray-500 transition-colors flex items-center justify-center gap-1.5"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-black"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    Generate Mockup
                  </>
                )}
              </button>

              <button
                onClick={() => onDesignSave({ product: selectedProduct, layers })}
                disabled={layers.length === 0}
                className="w-full px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs border border-gray-700 hover:border-amber-500/30 rounded-lg disabled:bg-gray-900 disabled:text-gray-600 disabled:border-gray-800 transition-colors"
              >
                Save Design
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
