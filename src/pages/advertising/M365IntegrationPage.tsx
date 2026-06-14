import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  Cloud, Video, Palette, Film, BarChart2,
  CheckCircle, XCircle, ExternalLink, Folder, FileText,
  Link as LinkIcon, ArrowRight, LogIn, User, Mail, Shield
} from 'lucide-react';
import { useAuth } from '../../lib/auth';

interface ServiceDef {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  description: string;
  profileKey: 'ms_onedrive_enabled' | 'ms_stream_enabled' | 'ms_designer_enabled';
  features: string[];
}

const serviceDefs: ServiceDef[] = [
  {
    id: 'onedrive',
    name: 'OneDrive',
    icon: Cloud,
    description: 'Store and sync your advertising assets',
    profileKey: 'ms_onedrive_enabled',
    features: ['Asset storage', 'Auto-sync', 'Version control', 'Team sharing'],
  },
  {
    id: 'stream',
    name: 'Microsoft Stream',
    icon: Video,
    description: 'Host and manage video content',
    profileKey: 'ms_stream_enabled',
    features: ['Video hosting', 'Transcription', 'Analytics', 'Embedding'],
  },
  {
    id: 'designer',
    name: 'Designer',
    icon: Palette,
    description: 'Create stunning graphics and designs',
    profileKey: 'ms_designer_enabled',
    features: ['AI design tools', 'Templates', 'Brand kit', 'Export to formats'],
  },
];

const standaloneDefs = [
  {
    id: 'clipchamp',
    name: 'Clipchamp',
    icon: Film,
    description: 'Edit videos with professional tools',
    features: ['Video editing', 'Effects & filters', 'Audio library', 'Export in 4K'],
  },
  {
    id: 'powerbi',
    name: 'Power BI',
    icon: BarChart2,
    description: 'Visualize campaign analytics',
    features: ['Real-time dashboards', 'Custom reports', 'Data insights', 'Share reports'],
  },
];

const mockOneDriveFiles = [
  { name: 'Campaign Assets', type: 'folder', items: 24, modified: '2024-01-08' },
  { name: 'Winter Launch 2024', type: 'folder', items: 12, modified: '2024-01-07' },
  { name: 'Product Videos', type: 'folder', items: 8, modified: '2024-01-06' },
  { name: 'Brand Guidelines.pdf', type: 'file', size: '2.4 MB', modified: '2024-01-05' },
];

const mockStreamVideos = [
  { title: 'Product Launch Video', duration: '2:30', views: 1250, uploaded: '2024-01-08' },
  { title: 'AR Demo Reel', duration: '1:45', views: 890, uploaded: '2024-01-07' },
  { title: 'Customer Testimonials', duration: '3:15', views: 2100, uploaded: '2024-01-06' },
];

export function M365IntegrationPage() {
  const { user, profile, connectMicrosoft, disconnectMicrosoft, updateMicrosoftServices } = useAuth();
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [msEmail, setMsEmail] = useState('');
  const [msName, setMsName] = useState('');
  const [linking, setLinking] = useState(false);
  const [linkError, setLinkError] = useState('');

  const handleLinkMicrosoft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msEmail.trim() || !msName.trim()) return;
    setLinking(true);
    setLinkError('');
    const result = await connectMicrosoft(msEmail.trim(), msName.trim());
    if (result.error) setLinkError(result.error);
    setLinking(false);
    setMsEmail('');
    setMsName('');
  };

  const handleDisconnect = async () => {
    setLinking(true);
    await disconnectMicrosoft();
    setLinking(false);
    setSelectedService(null);
  };

  const handleToggleService = async (key: 'ms_onedrive_enabled' | 'ms_stream_enabled' | 'ms_designer_enabled') => {
    if (!profile) return;
    await updateMicrosoftServices({ [key]: !profile[key] });
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-lg mx-auto text-center py-20">
          <div className="p-4 rounded-xl bg-gray-800 w-fit mx-auto mb-6">
            <LogIn size={48} className="text-gray-500" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Sign In Required</h1>
          <p className="text-gray-400 mb-8 text-lg leading-relaxed">
            You need to sign in to connect your Microsoft 365 account and access integrated services.
          </p>
          <Link to="/auth">
            <Button variant="primary" className="min-w-[200px]">
              Sign In
              <ArrowRight className="inline-block ml-2" size={18} />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-900/40 to-blue-900/40 border border-amber-500/20">
            <Cloud size={48} className="text-amber-500" />
          </div>
          <div>
            <h1 className="text-5xl font-bold">Microsoft 365</h1>
            <p className="text-gray-400 mt-2 text-lg">Connect and manage your Microsoft 365 services</p>
          </div>
        </div>
      </div>

      {!profile?.ms_connected ? (
        <Card className="mb-8 border-amber-500/30">
          <div className="border-b border-gray-800 px-6 py-4 flex items-center gap-3">
            <Shield size={24} className="text-amber-500" />
            <h2 className="text-2xl font-bold">Connect Your Microsoft Account</h2>
          </div>
          <CardBody>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Link your Microsoft 365 account to unlock OneDrive asset syncing, Stream video hosting,
              Designer templates, and more. Your credentials are stored securely.
            </p>
            {linkError && (
              <div className="bg-red-900/30 border border-red-800/50 rounded-lg p-4 mb-6">
                <p className="text-red-400 text-sm">{linkError}</p>
              </div>
            )}
            <form onSubmit={handleLinkMicrosoft} className="space-y-4 max-w-lg">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Mail size={14} className="inline mr-2" />
                  Microsoft Account Email
                </label>
                <input
                  type="email"
                  value={msEmail}
                  onChange={(e) => setMsEmail(e.target.value)}
                  placeholder="you@outlook.com"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <User size={14} className="inline mr-2" />
                  Microsoft Display Name
                </label>
                <input
                  type="text"
                  value={msName}
                  onChange={(e) => setMsName(e.target.value)}
                  placeholder="Your Microsoft display name"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                  required
                />
              </div>
              <Button type="submit" variant="primary" disabled={linking} className="min-w-[200px]">
                {linking ? 'Connecting...' : 'Connect Microsoft Account'}
              </Button>
            </form>
          </CardBody>
        </Card>
      ) : (
        <Card className="mb-8 border-green-800/50">
          <CardBody>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-green-900/30 border border-green-700/30">
                  <CheckCircle size={28} className="text-green-500" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Microsoft Account Connected</h3>
                  <p className="text-gray-400 text-sm">
                    {profile.ms_display_name} ({profile.ms_account_email})
                  </p>
                  {profile.ms_connected_at && (
                    <p className="text-gray-500 text-xs mt-1">
                      Connected {new Date(profile.ms_connected_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              <Button
                variant="secondary"
                onClick={handleDisconnect}
                disabled={linking}
              >
                Disconnect
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {profile?.ms_connected && (
        <>
          <h2 className="text-3xl font-bold mb-6">Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {serviceDefs.map(service => {
              const Icon = service.icon;
              const enabled = profile[service.profileKey];
              return (
                <Card
                  key={service.id}
                  className={`hover:border-amber-500/50 transition-all ${enabled ? 'border-green-800/50' : ''}`}
                >
                  <CardBody className="flex flex-col min-h-[260px]">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-xl ${
                          enabled
                            ? 'bg-green-900/30 border border-green-700/30'
                            : 'bg-gray-800 border border-gray-700'
                        }`}>
                          <Icon size={24} className={enabled ? 'text-green-500' : 'text-gray-400'} />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{service.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            {enabled ? (
                              <><CheckCircle size={14} className="text-green-500" /><span className="text-xs text-green-400">Enabled</span></>
                            ) : (
                              <><XCircle size={14} className="text-gray-500" /><span className="text-xs text-gray-500">Disabled</span></>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400 mb-4 leading-relaxed">{service.description}</p>
                    <div className="mb-6 flex-grow">
                      <div className="flex flex-wrap gap-1.5">
                        {service.features.map(f => (
                          <span key={f} className="text-xs bg-gray-800 text-gray-300 px-2.5 py-1 rounded-full border border-gray-700">{f}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-auto">
                      <Button
                        variant={enabled ? 'primary' : 'secondary'}
                        className="flex-1"
                        onClick={() => {
                          if (enabled) {
                            setSelectedService(selectedService === service.id ? null : service.id);
                          } else {
                            handleToggleService(service.profileKey);
                          }
                        }}
                      >
                        {enabled
                          ? (selectedService === service.id ? 'Close' : 'Manage')
                          : 'Enable'
                        }
                      </Button>
                      {enabled && (
                        <Button variant="secondary" onClick={() => handleToggleService(service.profileKey)}>
                          Disable
                        </Button>
                      )}
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {standaloneDefs.map(service => {
              const Icon = service.icon;
              return (
                <Card key={service.id} className="hover:border-amber-500/50 transition-all">
                  <CardBody>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 rounded-xl bg-gray-800 border border-gray-700">
                        <Icon size={24} className="text-gray-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{service.name}</h3>
                        <p className="text-sm text-gray-400">{service.description}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {service.features.map(f => (
                        <span key={f} className="text-xs bg-gray-800 text-gray-300 px-2.5 py-1 rounded-full border border-gray-700">{f}</span>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {selectedService === 'onedrive' && profile?.ms_onedrive_enabled && (
        <Card className="mb-8">
          <div className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Cloud size={24} className="text-amber-500" />
              <h2 className="text-xl font-bold">OneDrive Files</h2>
            </div>
            <button className="flex items-center gap-2 text-amber-500 hover:text-amber-400 transition-colors text-sm font-semibold">
              <ExternalLink size={16} />
              Open in OneDrive
            </button>
          </div>
          <CardBody>
            <div className="space-y-2">
              {mockOneDriveFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-800/50 hover:bg-gray-800 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    {file.type === 'folder' ? <Folder size={20} className="text-amber-500" /> : <FileText size={20} className="text-gray-400" />}
                    <div>
                      <div className="font-medium">{file.name}</div>
                      <div className="text-sm text-gray-500">
                        {file.type === 'folder' ? `${file.items} items` : file.size} -- Modified {file.modified}
                      </div>
                    </div>
                  </div>
                  <button className="text-amber-500 hover:text-amber-400 p-2 rounded-lg hover:bg-gray-700 transition-colors">
                    <LinkIcon size={16} />
                  </button>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {selectedService === 'stream' && profile?.ms_stream_enabled && (
        <Card className="mb-8">
          <div className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Video size={24} className="text-amber-500" />
              <h2 className="text-xl font-bold">Microsoft Stream Videos</h2>
            </div>
            <button className="flex items-center gap-2 text-amber-500 hover:text-amber-400 transition-colors text-sm font-semibold">
              <ExternalLink size={16} />
              Open in Stream
            </button>
          </div>
          <CardBody>
            <div className="space-y-3">
              {mockStreamVideos.map((video, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-gray-800/50 hover:bg-gray-800 rounded-xl transition-colors">
                  <div className="w-32 h-20 bg-gray-700 rounded-lg flex items-center justify-center shrink-0">
                    <Video size={24} className="text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium mb-1">{video.title}</div>
                    <div className="text-sm text-gray-500">
                      {video.duration} -- {video.views.toLocaleString()} views -- Uploaded {video.uploaded}
                    </div>
                  </div>
                  <Button variant="primary" className="shrink-0">Import</Button>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {selectedService === 'designer' && profile?.ms_designer_enabled && (
        <Card className="mb-8">
          <div className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Palette size={24} className="text-amber-500" />
              <h2 className="text-xl font-bold">Microsoft Designer Templates</h2>
            </div>
            <button className="flex items-center gap-2 text-amber-500 hover:text-amber-400 transition-colors text-sm font-semibold">
              <ExternalLink size={16} />
              Open Designer
            </button>
          </div>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {['Social Media Post', 'Instagram Story', 'TikTok Video', 'Banner Ad', 'Flyer', 'Logo'].map((template, index) => (
                <div key={index} className="bg-gray-800/50 rounded-xl p-4 hover:bg-gray-800 transition-colors cursor-pointer group">
                  <div className="aspect-video bg-gray-700 rounded-lg mb-3 flex items-center justify-center">
                    <Palette size={24} className="text-gray-500 group-hover:text-amber-500/50 transition-colors" />
                  </div>
                  <div className="font-medium">{template}</div>
                  <div className="text-sm text-gray-500 mt-1">Professional template</div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      <section className="bg-gradient-to-br from-amber-900/20 via-orange-900/20 to-amber-900/20 border border-amber-500/30 rounded-xl overflow-hidden">
        <div className="border-b border-amber-500/20 px-8 py-4">
          <h3 className="text-2xl font-bold">Integration Benefits</h3>
        </div>
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Seamless Workflow', desc: 'Work across all tools without leaving the platform' },
              { title: 'Auto-Sync', desc: 'Changes sync automatically across services' },
              { title: 'Enterprise Security', desc: 'Microsoft 365 enterprise-grade security' },
              { title: 'Team Collaboration', desc: 'Share and collaborate with your team' },
            ].map((benefit, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle size={20} className="text-green-500 mt-0.5 shrink-0" />
                <div>
                  <div className="font-bold mb-1">{benefit.title}</div>
                  <div className="text-sm text-gray-400">{benefit.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
