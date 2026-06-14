import React, { useState } from 'react';
import { Plus, Trash2, Eye, Upload, DollarSign } from 'lucide-react';

interface BundleItem {
  id: string;
  type: 'routine' | 'video' | 'productList';
  name: string;
}

interface BundleBuilderProps {
  onSave: (bundle: any) => void;
  onCancel: () => void;
}

export function BundleBuilder({ onSave, onCancel }: BundleBuilderProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [items, setItems] = useState<BundleItem[]>([]);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'items' | 'pricing' | 'image' | 'publish'>('info');
  const [newItemType, setNewItemType] = useState<'routine' | 'video' | 'productList'>('routine');
  const [newItemName, setNewItemName] = useState('');

  const addItem = () => {
    if (newItemName.trim()) {
      setItems([
        ...items,
        {
          id: Math.random().toString(),
          type: newItemType,
          name: newItemName,
        },
      ]);
      setNewItemName('');
    }
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert('Bundle title is required');
      return;
    }

    onSave({
      title,
      description,
      price,
      items: items.map(({ id, type, name }) => ({ id, type })),
      coverImage,
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Tabs */}
      <div className="border-b border-gray-200 flex">
        {['info', 'items', 'pricing', 'image', 'publish'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-pink-600 text-pink-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {/* Info Tab */}
        {activeTab === 'info' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bundle Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Summer Beauty Essentials"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your bundle..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Items Tab */}
        {activeTab === 'items' && (
          <div className="space-y-4">
            <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Add Items to Bundle</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Item Type</label>
                  <select
                    value={newItemType}
                    onChange={(e) => setNewItemType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="routine">Routine</option>
                    <option value="video">Video</option>
                    <option value="productList">Product List</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                  <input
                    type="text"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="Select an existing item..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <button
                  onClick={addItem}
                  className="w-full px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  Add Item
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">Bundle Items ({items.length})</h3>
              {items.length === 0 ? (
                <p className="text-sm text-gray-600">No items added yet</p>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-600 uppercase">{item.type}</p>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Pricing Tab */}
        {activeTab === 'pricing' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bundle Price</label>
              <div className="flex items-center gap-2">
                <DollarSign size={20} className="text-gray-400" />
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                  placeholder="99.99"
                  step="0.01"
                  min="0"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-700">
                <strong>Pricing Tip:</strong> Consider the value of items in your bundle. Price it to encourage purchases while maximizing revenue.
              </p>
            </div>
          </div>
        )}

        {/* Image Tab */}
        {activeTab === 'image' && (
          <div className="space-y-4">
            {coverImage ? (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Preview</p>
                <img src={coverImage} alt="Cover" className="w-full h-48 object-cover rounded-lg" />
              </div>
            ) : (
              <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="mx-auto text-gray-400 mb-3" size={32} />
                <p className="text-gray-600 mb-2">Upload a cover image</p>
              </div>
            )}
          </div>
        )}

        {/* Publish Tab */}
        {activeTab === 'publish' && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-2">Ready to Publish?</h3>
              <ul className="text-sm text-green-800 space-y-1">
                <li>{title ? '✓' : '✗'} Title</li>
                <li>{items.length > 0 ? '✓' : '✗'} Items</li>
                <li>{price > 0 ? '✓' : '✗'} Price</li>
              </ul>
            </div>
            <p className="text-sm text-gray-600">
              Once published, your bundle will be visible to all Lexi Rose customers.
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="border-t border-gray-200 bg-gray-50 p-4 flex justify-between">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors flex items-center gap-2"
        >
          <Eye size={18} />
          {activeTab === 'publish' ? 'Publish Bundle' : 'Save & Continue'}
        </button>
      </div>
    </div>
  );
}
