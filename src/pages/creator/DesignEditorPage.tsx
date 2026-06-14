import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Upload, Image as ImageIcon, Palette, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export function DesignEditorPage() {
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [designUrl, setDesignUrl] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

  const platforms = ['ReadyPlayerMe', 'Unity', 'Unreal', 'MetaMarker'];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `designs/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('gamewear-designs')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('gamewear-designs')
        .getPublicUrl(filePath);

      setDesignUrl(publicUrl);
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleCreateGameWear = async () => {
    if (!designUrl) return;

    setUploading(true);
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gamewear-api/create`;
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          base_art: designUrl,
          platforms: selectedPlatforms,
        }),
      });

      const result = await response.json();
      if (result.success) {
        navigate(`/creator/gamewear/${result.gamewear.id}`);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error creating GameWear:', error);
    } finally {
      setUploading(false);
    }
  };

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-10">
        <div className="p-4 rounded-xl bg-gradient-to-br from-rose-900/40 to-pink-900/40 border border-amber-500/20">
          <Palette size={48} className="text-amber-500" />
        </div>
        <div>
          <h1 className="text-5xl font-bold">Design Editor</h1>
          <p className="text-gray-400 mt-2 text-lg">Upload your artwork and create layered clothing for games and the metaverse</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <div className="border-b border-gray-800 px-6 py-4">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Upload className="text-amber-500" size={28} />
              Upload Design
            </h2>
          </div>
          <CardBody>
            <div className="border-2 border-dashed border-gray-700 rounded-xl p-12 text-center hover:border-amber-500/30 transition-colors">
              {designUrl ? (
                <div className="space-y-4">
                  <img src={designUrl} alt="Uploaded design" className="max-h-64 mx-auto rounded-lg" />
                  <p className="text-green-500 font-medium">Design uploaded successfully</p>
                  <Button variant="ghost" onClick={() => setDesignUrl('')}>Upload Different Design</Button>
                </div>
              ) : (
                <label className="cursor-pointer block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                  <div className="p-4 rounded-xl bg-gray-800 w-fit mx-auto mb-4">
                    <ImageIcon size={48} className="text-gray-500" />
                  </div>
                  <p className="text-lg mb-2 font-medium">{uploading ? 'Uploading...' : 'Click to upload your design'}</p>
                  <p className="text-sm text-gray-500">PNG, JPG, or SVG (max 10MB)</p>
                </label>
              )}
            </div>
          </CardBody>
        </Card>

        <Card>
          <div className="border-b border-gray-800 px-6 py-4">
            <h2 className="text-2xl font-bold">Select Target Platforms</h2>
          </div>
          <CardBody>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {platforms.map(platform => (
                <button
                  key={platform}
                  onClick={() => togglePlatform(platform)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedPlatforms.includes(platform)
                      ? 'border-amber-500 bg-amber-500/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="font-semibold">{platform}</div>
                </button>
              ))}
            </div>
          </CardBody>
        </Card>

        <div className="flex justify-center gap-4 pt-4">
          <Button variant="secondary" onClick={() => navigate('/creator')}>Cancel</Button>
          <Button
            onClick={handleCreateGameWear}
            disabled={!designUrl || selectedPlatforms.length === 0 || uploading}
          >
            {uploading ? 'Creating...' : 'Create GameWear'}
            <ArrowRight className="inline-block ml-2" size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
}
