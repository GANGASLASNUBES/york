import { useParams, Link } from 'react-router-dom';
import { Card, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Crown, ArrowLeft, Zap, Target, Sparkles } from 'lucide-react';
import { AVATARS } from '../lib/constants';

export function AvatarDetailPage() {
  const { id } = useParams();
  const avatar = AVATARS.find((a) => a.id === Number(id));

  if (!avatar) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Avatar Not Found</h1>
        <Link to="/">
          <Button variant="ghost">Return Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Back Button */}
      <Link to="/" className="inline-flex items-center gap-2 text-amber-500 hover:text-amber-400 mb-8">
        <ArrowLeft size={20} />
        Back to Home
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Avatar Image */}
        <Card>
          <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
            <Crown size={200} className="text-amber-500/20" />
          </div>
        </Card>

        {/* Avatar Details */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Crown size={40} className="text-amber-500" />
            <h1 className="text-4xl font-bold">{avatar.name}</h1>
          </div>
          <p className="text-xl text-gray-400 mb-8">{avatar.description}</p>

          {/* Stats */}
          <Card className="mb-6">
            <CardBody>
              <h2 className="text-2xl font-bold mb-4">Performance Stats</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Zap size={18} className="text-amber-500" />
                      <span className="font-semibold">Speed</span>
                    </div>
                    <span className="text-amber-500 font-bold">{avatar.stats.speed}</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div
                      className="bg-amber-500 h-2 rounded-full transition-all"
                      style={{ width: `${avatar.stats.speed}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Target size={18} className="text-amber-500" />
                      <span className="font-semibold">Skill</span>
                    </div>
                    <span className="text-amber-500 font-bold">{avatar.stats.skill}</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div
                      className="bg-amber-500 h-2 rounded-full transition-all"
                      style={{ width: `${avatar.stats.skill}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Sparkles size={18} className="text-amber-500" />
                      <span className="font-semibold">Style</span>
                    </div>
                    <span className="text-amber-500 font-bold">{avatar.stats.style}</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div
                      className="bg-amber-500 h-2 rounded-full transition-all"
                      style={{ width: `${avatar.stats.style}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button variant="primary" className="flex-1">Select Avatar</Button>
            <Button variant="ghost" className="flex-1">View Gallery</Button>
          </div>

          {/* Additional Info */}
          <Card className="mt-6">
            <CardBody>
              <h3 className="text-xl font-bold mb-3">About This Avatar</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                This avatar represents a unique playstyle and personality within the BIPS ecosystem.
                Each avatar comes with customizable appearance options, special abilities, and exclusive
                gear. Build your reputation and unlock new features as you progress.
              </p>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Related Avatars */}
      <section className="mt-16">
        <h2 className="text-3xl font-bold mb-6">More Avatars</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {AVATARS.filter((a) => a.id !== avatar.id)
            .slice(0, 3)
            .map((relatedAvatar) => (
              <Link key={relatedAvatar.id} to={`/avatar/${relatedAvatar.id}`}>
                <Card className="hover:border-amber-500/50 transition-all cursor-pointer group">
                  <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                    <Crown size={64} className="text-amber-500/20 group-hover:text-amber-500/40 transition-colors" />
                  </div>
                  <CardBody>
                    <h3 className="text-xl font-bold text-amber-500">{relatedAvatar.name}</h3>
                    <p className="text-gray-400 text-sm mt-2">{relatedAvatar.description}</p>
                  </CardBody>
                </Card>
              </Link>
            ))}
        </div>
      </section>
    </div>
  );
}
