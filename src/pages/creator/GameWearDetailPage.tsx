import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { supabase } from '../../lib/supabase';
import { CheckCircle, Loader, Package, Gamepad2 } from 'lucide-react';

interface GameWear {
  id: string;
  base_art: string;
  platforms: string[];
  rpm_asset_id?: string;
  rpm_glb_url?: string;
  metaMarker_id?: string;
  printful_id?: string;
  shopify_id?: string;
  gamewear_assets?: any[];
}

export function GameWearDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [gamewear, setGamewear] = useState<GameWear | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    loadGameWear();
  }, [id]);

  const loadGameWear = async () => {
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gamewear-api/${id}`;
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
        },
      });

      const result = await response.json();
      setGamewear(result.gamewear);
    } catch (error) {
      console.error('Error loading GameWear:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadToRPM = async () => {
    setProcessing('rpm');
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gamewear-api/upload-to-rpm`;
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gamewearId: id,
          designUrl: gamewear?.base_art,
          clothingType: 'shirt',
        }),
      });

      const result = await response.json();
      if (result.success) {
        await loadGameWear();
        alert('Successfully uploaded to Ready Player Me!');
      }
    } catch (error) {
      console.error('Error uploading to RPM:', error);
      alert('Error uploading to Ready Player Me');
    } finally {
      setProcessing(null);
    }
  };

  const handleUploadToMetaMarker = async () => {
    setProcessing('metamarker');
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gamewear-api/upload-to-metamarker`;
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gamewearId: id,
          designUrl: gamewear?.base_art,
          layerConfig: {
            baseTexture: 'standard',
            uvAligned: true,
            overlays: [],
          },
        }),
      });

      const result = await response.json();
      if (result.success) {
        await loadGameWear();
        alert('Successfully processed with MetaMarker!');
      }
    } catch (error) {
      console.error('Error with MetaMarker:', error);
      alert('Error processing with MetaMarker');
    } finally {
      setProcessing(null);
    }
  };

  const handleGenerateAssets = async () => {
    setProcessing('assets');
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gamewear-api/generate-assets`;
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gamewearId: id,
          platforms: gamewear?.platforms || [],
        }),
      });

      const result = await response.json();
      if (result.success) {
        await loadGameWear();
        alert('Assets generated successfully!');
      }
    } catch (error) {
      console.error('Error generating assets:', error);
      alert('Error generating assets');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Loader className="animate-spin mx-auto mb-4 text-amber-500" size={48} />
        <p>Loading GameWear...</p>
      </div>
    );
  }

  if (!gamewear) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl font-black mb-4">GameWear Not Found</h1>
        <Button onClick={() => navigate('/creator')}>Back to Creator Studio</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-5xl font-black mb-6 text-center">GameWear <span className="text-amber-500">Pipeline</span></h1>

      <div className="max-w-6xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-bold">Design Preview</h2>
          </CardHeader>
          <CardBody>
            <img src={gamewear.base_art} alt="Design" className="max-h-96 mx-auto rounded-lg" />
          </CardBody>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <h3 className="text-xl font-bold flex items-center gap-2">
                {gamewear.rpm_asset_id ? <CheckCircle className="text-green-500" /> : <Package className="text-gray-500" />}
                Ready Player Me
              </h3>
            </CardHeader>
            <CardBody>
              {gamewear.rpm_asset_id ? (
                <div className="space-y-2">
                  <p className="text-green-500">Asset uploaded</p>
                  <p className="text-sm text-gray-400">Asset ID: {gamewear.rpm_asset_id}</p>
                  {gamewear.rpm_glb_url && (
                    <a href={gamewear.rpm_glb_url} target="_blank" rel="noopener noreferrer" className="text-amber-500 text-sm">
                      Download GLB
                    </a>
                  )}
                </div>
              ) : (
                <Button
                  onClick={handleUploadToRPM}
                  disabled={processing !== null}
                  className="w-full"
                >
                  {processing === 'rpm' ? 'Uploading...' : 'Upload to Ready Player Me'}
                </Button>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-xl font-bold flex items-center gap-2">
                {gamewear.metaMarker_id ? <CheckCircle className="text-green-500" /> : <Package className="text-gray-500" />}
                MetaMarker Auto-Fit
              </h3>
            </CardHeader>
            <CardBody>
              {gamewear.metaMarker_id ? (
                <div className="space-y-2">
                  <p className="text-green-500">Auto-fitted</p>
                  <p className="text-sm text-gray-400">Marker ID: {gamewear.metaMarker_id}</p>
                </div>
              ) : (
                <Button
                  onClick={handleUploadToMetaMarker}
                  disabled={processing !== null}
                  className="w-full"
                >
                  {processing === 'metamarker' ? 'Processing...' : 'Process with MetaMarker'}
                </Button>
              )}
            </CardBody>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Gamepad2 className="text-amber-500" />
              Game Platform Assets
            </h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Target Platforms</p>
                  <p className="text-sm text-gray-400">{gamewear.platforms.join(', ')}</p>
                </div>
                <Button
                  onClick={handleGenerateAssets}
                  disabled={processing !== null}
                >
                  {processing === 'assets' ? 'Generating...' : 'Generate Platform Assets'}
                </Button>
              </div>

              {gamewear.gamewear_assets && gamewear.gamewear_assets.length > 0 && (
                <div className="mt-6 space-y-2">
                  <p className="font-semibold">Generated Assets:</p>
                  {gamewear.gamewear_assets.map((asset: any) => (
                    <div key={asset.id} className="p-3 bg-gray-800 rounded-lg">
                      <p className="font-medium">{asset.platform}</p>
                      {asset.upm_install_url && (
                        <a href={asset.upm_install_url} className="text-amber-500 text-sm">Unity Package</a>
                      )}
                      {asset.ufn_package_url && (
                        <a href={asset.ufn_package_url} className="text-amber-500 text-sm">Unreal Package</a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        <div className="flex justify-center">
          <Button variant="secondary" onClick={() => navigate('/creator')}>Back to Creator Studio</Button>
        </div>
      </div>
    </div>
  );
}
