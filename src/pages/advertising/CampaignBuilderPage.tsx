import { useState } from 'react';
import { Layout } from '../../components/Layout';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Calendar,
  DollarSign,
  Image,
  Activity,
  Send
} from 'lucide-react';

type Step = 1 | 2 | 3 | 4;

interface CampaignData {
  title: string;
  description: string;
  type: string;
  startDate: string;
  endDate: string;
  budget: number;
  platforms: string[];
  assets: string[];
  telemetryEnabled: boolean;
  telemetryDataPoints: string[];
}

const initialData: CampaignData = {
  title: '',
  description: '',
  type: 'brand-awareness',
  startDate: '',
  endDate: '',
  budget: 0,
  platforms: [],
  assets: [],
  telemetryEnabled: false,
  telemetryDataPoints: []
};

const mockAssets = [
  { id: '1', title: 'ᗺIPS Gear AR Demo', type: 'ar', thumbnail: '/placeholder-ar.jpg' },
  { id: '2', title: 'Product Launch Video', type: 'video', thumbnail: '/placeholder-video.jpg' },
  { id: '3', title: 'Battery Telemetry Data', type: 'telemetry', thumbnail: '/placeholder-data.jpg' },
  { id: '4', title: 'Product Hero Image', type: 'image', thumbnail: '/placeholder-image.jpg' },
  { id: '5', title: 'Background Music', type: 'audio', thumbnail: '/placeholder-audio.jpg' }
];

export function CampaignBuilderPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [campaignData, setCampaignData] = useState<CampaignData>(initialData);

  const updateData = (field: keyof CampaignData, value: any) => {
    setCampaignData(prev => ({ ...prev, [field]: value }));
  };

  const togglePlatform = (platform: string) => {
    setCampaignData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }));
  };

  const toggleAsset = (assetId: string) => {
    setCampaignData(prev => ({
      ...prev,
      assets: prev.assets.includes(assetId)
        ? prev.assets.filter(a => a !== assetId)
        : [...prev.assets, assetId]
    }));
  };

  const toggleTelemetryPoint = (point: string) => {
    setCampaignData(prev => ({
      ...prev,
      telemetryDataPoints: prev.telemetryDataPoints.includes(point)
        ? prev.telemetryDataPoints.filter(p => p !== point)
        : [...prev.telemetryDataPoints, point]
    }));
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((currentStep + 1) as Step);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    }
  };

  const handlePublish = () => {
    console.log('Publishing campaign:', campaignData);
    alert('Campaign created successfully!');
    navigate('/advertising/campaigns');
  };

  const isStepComplete = (step: Step): boolean => {
    switch (step) {
      case 1:
        return !!(campaignData.title && campaignData.description && campaignData.startDate && campaignData.endDate && campaignData.budget);
      case 2:
        return campaignData.platforms.length > 0;
      case 3:
        return campaignData.assets.length > 0;
      case 4:
        return !campaignData.telemetryEnabled || campaignData.telemetryDataPoints.length > 0;
      default:
        return false;
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-black text-white">
        {/* Header */}
        <div className="border-b border-amber-900/30 bg-black/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-3xl font-bold text-amber-500">Campaign Builder</h1>
            <p className="text-gray-400 mt-1">Create a new advertising campaign</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4].map((step, index) => (
                <div key={step} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                        currentStep === step
                          ? 'bg-amber-600 border-amber-600 text-black'
                          : currentStep > step
                          ? 'bg-green-600 border-green-600 text-white'
                          : 'bg-gray-900 border-gray-700 text-gray-400'
                      }`}
                    >
                      {currentStep > step ? <Check className="w-5 h-5" /> : step}
                    </div>
                    <div className={`mt-2 text-sm ${currentStep >= step ? 'text-white' : 'text-gray-500'}`}>
                      {['Details', 'Platforms', 'Assets', 'Telemetry'][index]}
                    </div>
                  </div>
                  {index < 3 && (
                    <div
                      className={`h-0.5 flex-1 mx-2 transition-colors ${
                        currentStep > step ? 'bg-green-600' : 'bg-gray-800'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
            {/* Step 1: Campaign Details */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-amber-500 mb-6">Campaign Details</h2>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Campaign Title *
                  </label>
                  <input
                    type="text"
                    value={campaignData.title}
                    onChange={(e) => updateData('title', e.target.value)}
                    placeholder="Enter campaign title"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={campaignData.description}
                    onChange={(e) => updateData('description', e.target.value)}
                    placeholder="Describe your campaign"
                    rows={4}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Campaign Type *
                  </label>
                  <select
                    value={campaignData.type}
                    onChange={(e) => updateData('type', e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="brand-awareness">Brand Awareness</option>
                    <option value="product-launch">Product Launch</option>
                    <option value="engagement">Engagement</option>
                    <option value="conversion">Conversion</option>
                    <option value="seasonal">Seasonal</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Calendar className="inline w-4 h-4 mr-2" />
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={campaignData.startDate}
                      onChange={(e) => updateData('startDate', e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Calendar className="inline w-4 h-4 mr-2" />
                      End Date *
                    </label>
                    <input
                      type="date"
                      value={campaignData.endDate}
                      onChange={(e) => updateData('endDate', e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <DollarSign className="inline w-4 h-4 mr-2" />
                    Budget *
                  </label>
                  <input
                    type="number"
                    value={campaignData.budget}
                    onChange={(e) => updateData('budget', parseFloat(e.target.value))}
                    placeholder="0.00"
                    min="0"
                    step="100"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Platform Selection */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-amber-500 mb-6">Select Platforms</h2>
                <p className="text-gray-400 mb-6">Choose where your campaign will run</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <button
                    onClick={() => togglePlatform('tiktok')}
                    className={`p-6 rounded-lg border-2 transition-all ${
                      campaignData.platforms.includes('tiktok')
                        ? 'border-pink-600 bg-pink-900/20'
                        : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                    }`}
                  >
                    <div className="text-4xl mb-3">📱</div>
                    <h3 className="text-xl font-semibold text-white mb-2">TikTok</h3>
                    <p className="text-sm text-gray-400">
                      Short-form video content for maximum engagement
                    </p>
                    {campaignData.platforms.includes('tiktok') && (
                      <div className="mt-3">
                        <Check className="w-6 h-6 text-pink-500 mx-auto" />
                      </div>
                    )}
                  </button>

                  <button
                    onClick={() => togglePlatform('instagram')}
                    className={`p-6 rounded-lg border-2 transition-all ${
                      campaignData.platforms.includes('instagram')
                        ? 'border-purple-600 bg-purple-900/20'
                        : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                    }`}
                  >
                    <div className="text-4xl mb-3">📷</div>
                    <h3 className="text-xl font-semibold text-white mb-2">Instagram</h3>
                    <p className="text-sm text-gray-400">
                      Visual storytelling with photos and reels
                    </p>
                    {campaignData.platforms.includes('instagram') && (
                      <div className="mt-3">
                        <Check className="w-6 h-6 text-purple-500 mx-auto" />
                      </div>
                    )}
                  </button>

                  <button
                    onClick={() => togglePlatform('bipsgear')}
                    className={`p-6 rounded-lg border-2 transition-all ${
                      campaignData.platforms.includes('bipsgear')
                        ? 'border-amber-600 bg-amber-900/20'
                        : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                    }`}
                  >
                    <div className="text-4xl mb-3">⚙️</div>
                    <h3 className="text-xl font-semibold text-white mb-2">ᗺIPSGear</h3>
                    <p className="text-sm text-gray-400">
                      AR experiences and product integrations
                    </p>
                    {campaignData.platforms.includes('bipsgear') && (
                      <div className="mt-3">
                        <Check className="w-6 h-6 text-amber-500 mx-auto" />
                      </div>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Asset Selection */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-amber-500 mb-6">Select Assets</h2>
                <p className="text-gray-400 mb-6">Choose assets from your library</p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mockAssets.map(asset => (
                    <button
                      key={asset.id}
                      onClick={() => toggleAsset(asset.id)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        campaignData.assets.includes(asset.id)
                          ? 'border-amber-600 bg-amber-900/20'
                          : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                      }`}
                    >
                      <div className="aspect-video bg-gray-700 rounded mb-3 flex items-center justify-center">
                        <Image className="w-8 h-8 text-gray-500" />
                      </div>
                      <h3 className="font-semibold text-white mb-1">{asset.title}</h3>
                      <div className="text-sm text-gray-400 mb-2">
                        {asset.type.toUpperCase()}
                      </div>
                      {campaignData.assets.includes(asset.id) && (
                        <div className="flex items-center gap-2 text-amber-500 text-sm">
                          <Check className="w-4 h-4" />
                          Selected
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Telemetry Configuration */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-amber-500 mb-6">Telemetry Configuration</h2>
                <p className="text-gray-400 mb-6">
                  Configure telemetry data to enhance your campaign with real-world usage insights
                </p>

                <div className="mb-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={campaignData.telemetryEnabled}
                      onChange={(e) => updateData('telemetryEnabled', e.target.checked)}
                      className="w-5 h-5 rounded bg-gray-800 border-gray-700 text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-white font-medium">Enable Telemetry Data</span>
                  </label>
                </div>

                {campaignData.telemetryEnabled && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Select Data Points to Include:
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { id: 'battery', label: 'Battery Runtime', icon: Activity },
                        { id: 'heat', label: 'Heat Zones', icon: Activity },
                        { id: 'usage', label: 'Usage Patterns', icon: Activity },
                        { id: 'performance', label: 'Performance Metrics', icon: Activity }
                      ].map(point => {
                        const Icon = point.icon;
                        return (
                          <label
                            key={point.id}
                            className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                              campaignData.telemetryDataPoints.includes(point.id)
                                ? 'border-amber-600 bg-amber-900/20'
                                : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={campaignData.telemetryDataPoints.includes(point.id)}
                              onChange={() => toggleTelemetryPoint(point.id)}
                              className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-amber-600 focus:ring-amber-500"
                            />
                            <Icon className="w-5 h-5 text-amber-500" />
                            <span className="text-white font-medium">{point.label}</span>
                          </label>
                        );
                      })}
                    </div>

                    <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4 mt-6">
                      <p className="text-sm text-blue-300">
                        All telemetry data is anonymized and aggregated to protect user privacy.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>

            <div className="text-sm text-gray-400">
              Step {currentStep} of 4
            </div>

            {currentStep < 4 ? (
              <button
                onClick={handleNext}
                disabled={!isStepComplete(currentStep)}
                className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-black px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handlePublish}
                disabled={!isStepComplete(4)}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
                Publish Campaign
              </button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
