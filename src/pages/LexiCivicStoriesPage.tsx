import { useState } from 'react';
import {
  Palette, Calendar, Trees, BookOpen, Gift,
  MapPin, Sparkles, Heart, Star, Eye
} from 'lucide-react';
import { CivicStoryCard } from '../components/civic/CivicStoryCard';

type StoryCategory = 'public_art' | 'cultural_events' | 'parks' | 'libraries' | 'gifting';

const CATEGORIES: { key: StoryCategory; label: string; icon: typeof Palette; color: string }[] = [
  { key: 'public_art', label: 'Art Tours', icon: Palette, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-600/30' },
  { key: 'cultural_events', label: 'Events', icon: Calendar, color: 'text-pink-400 bg-pink-500/10 border-pink-600/30' },
  { key: 'parks', label: 'Green Spaces', icon: Trees, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-600/30' },
  { key: 'libraries', label: 'Libraries', icon: BookOpen, color: 'text-amber-400 bg-amber-500/10 border-amber-600/30' },
  { key: 'gifting', label: 'Gift Ideas', icon: Gift, color: 'text-rose-400 bg-rose-500/10 border-rose-600/30' },
];

type StoryItem = {
  title: string;
  description: string;
  location: string;
  highlight: string;
  category: string;
};

const STORIES: Record<StoryCategory, StoryItem[]> = {
  public_art: [
    { title: 'La Joute by Jean-Paul Riopelle', description: 'A kinetic fountain sculpture that comes alive with water and fire at dusk. One of Montreal\'s most iconic public artworks, it represents the creative fire that lives in every artist. The ring of bronze figures surrounds a central fountain that erupts with flame on summer evenings, drawing crowds of silent watchers.', location: 'Place Jean-Paul-Riopelle', highlight: 'Best viewed at 9pm during fire sequence', category: 'Art Tours' },
    { title: 'The Illuminated Crowd', description: 'Raymond Mason\'s powerful bronze sculpture shows how emotion ripples through a crowd. From joy at the front to terror at the back, it maps the full spectrum of human feeling. A silent commentary on collective psychology, standing in the shadow of office towers.', location: 'McGill College Avenue', highlight: 'A meditation on collective emotion', category: 'Art Tours' },
    { title: 'Under Pressure Murals', description: 'Massive street art installations that transform blank walls into narratives of identity, resilience, and belonging. Each mural tells a story of the neighbourhood it inhabits. Artists from around the world leave their mark here, creating one of North America\'s largest open-air galleries.', location: 'Saint-Laurent & Duluth', highlight: 'New murals added annually in June', category: 'Art Tours' },
    { title: 'Ciel de Lumiere', description: 'Suspended light installation that transforms the Quartier des Spectacles into an ethereal canopy of colour. Walk beneath it and feel the city breathing above you. Hundreds of LED elements respond to music and weather, creating a different experience every night.', location: 'Quartier des Spectacles', highlight: 'Interactive at night - responds to music', category: 'Art Tours' },
  ],
  cultural_events: [
    { title: 'Festival International de Jazz', description: 'The world\'s largest jazz festival transforms downtown Montreal into a celebration of improvisation, expression, and creative freedom. Over 3000 artists from 30 countries perform across 10 stages. Free outdoor shows create a city-wide living room where strangers become friends through music.', location: 'Place des Arts', highlight: 'Jun 28 - Jul 7 | 3000+ artists | Free outdoor shows', category: 'Events' },
    { title: 'Mural Festival', description: 'Artists from around the world paint massive murals on Saint-Laurent Boulevard, turning the street into an open-air gallery. Watch creation happen in real time. DJs, food vendors, and art workshops fill the pedestrian zone. The murals become permanent additions to the city\'s visual identity.', location: 'Boulevard Saint-Laurent', highlight: 'Jun 6-16 | Live painting daily | Free walking tours', category: 'Events' },
    { title: 'Nuit Blanche', description: 'One magical night when the entire city stays awake. Museums, galleries, parks, and streets become stages for art, performance, and wonder. From midnight to 5am, Montreal becomes a playground for the curious and the creative. Over 200 events across the city, all free.', location: 'City-wide', highlight: 'February | All night until 5am | 200+ free events', category: 'Events' },
    { title: 'Francofolies', description: 'A celebration of French-language music in all its forms. From chanson to hip-hop, the festival amplifies the voice of Francophone creativity. Emerging artists share stages with legends, and the Quartier des Spectacles pulses with the rhythm of a living language.', location: 'Quartier des Spectacles', highlight: 'Jun 14-22 | 200+ shows | Emerging artist showcase', category: 'Events' },
  ],
  parks: [
    { title: 'Mont-Royal', description: 'Frederick Law Olmsted\'s masterwork. A mountain park in the heart of the city where you can hear silence between the trees. In winter, a snow-covered sanctuary. The Belvedere lookout offers the definitive view of the city at sunrise, when the light makes everything gold.', location: 'Avenue du Parc', highlight: 'Sunrise from the Belvedere lookout is transformative', category: 'Green Spaces' },
    { title: 'Parc La Fontaine', description: 'The neighbourhood\'s living room. Paddle boats in summer, skating in winter. Families, artists, lovers, and solitary readers share the same golden light. Shakespeare-in-the-Park performances in July bring the Bard under the trees.', location: 'Plateau Mont-Royal', highlight: 'Free Shakespeare-in-the-Park in July', category: 'Green Spaces' },
    { title: 'Jardin Botanique', description: 'One of the world\'s great botanical gardens. Each greenhouse is a portal to another climate, another way of growing. The Chinese Garden is a masterpiece of designed tranquility. The Japanese Garden teaches the art of seeing beauty in restraint.', location: 'Pie-IX', highlight: '22,000 plant species | Lantern festival in autumn', category: 'Green Spaces' },
    { title: 'Parc Jean-Drapeau', description: 'Islands in the river. The Biosphere dome, the beach, the gardens of light. A place where the city meets the water and both breathe together. Accessible by metro, by bike, or by ferry. Each mode of arrival creates a different sense of crossing.', location: 'Ile Sainte-Helene', highlight: 'Accessible by metro, bike, or ferry', category: 'Green Spaces' },
  ],
  libraries: [
    { title: 'Grande Bibliotheque', description: 'A cathedral of knowledge with millions of documents freely available. The wood-panelled reading rooms feel like thinking inside a living tree. Natural light filters through the birch-log facade. Quiet floors, maker spaces, and a music collection that spans continents.', location: 'Berri-UQAM', highlight: 'Free membership | Quiet study spaces | Music collection', category: 'Libraries' },
    { title: 'Bibliotheque de Rosemont', description: 'A neighbourhood gem with curated collections and community programming. Book clubs, storytime, and maker spaces create a gathering place for curious minds. The children\'s section is a world unto itself.', location: 'Rosemont-La Petite-Patrie', highlight: 'Children\'s section is exceptional | Maker space', category: 'Libraries' },
    { title: 'Atwater Library', description: 'Montreal\'s oldest lending library. A community hub that hosts lectures, workshops, and one of the city\'s best used book sales. The reading room has that particular quality of light that makes words feel more important.', location: 'Atwater', highlight: 'Historic building | Community events | Used book sales', category: 'Libraries' },
    { title: 'Bibliotheque du Mile End', description: 'Bright, modern, and deeply integrated into Mile End\'s creative culture. Graphic novel collection, zine library, and regular literary events. The rooftop terrace is a secret that the neighbourhood shares willingly.', location: 'Mile End', highlight: 'Zine collection | Rooftop terrace | Literary events', category: 'Libraries' },
  ],
  gifting: [
    { title: 'Book Bundles', description: 'Curated reading packages from Montreal\'s independent bookshops. Three books selected around a theme: resilience, creativity, or self-care. Each bundle comes with a hand-written note from the bookseller explaining why these stories belong together.', location: 'Local bookshops', highlight: 'Support local | Personalized selection | Hand-written notes', category: 'Gift Ideas' },
    { title: 'Festival Passes', description: 'Gift access to Montreal\'s cultural festivals. Jazz, Mural, Francofolies, or a multi-fest pass for the culture-curious. Experiences over objects. Memories that grow richer with time.', location: 'Various venues', highlight: 'Experiences over objects | Multi-fest option available', category: 'Gift Ideas' },
    { title: 'Park Picnic Kits', description: 'Everything needed for a perfect park afternoon. Blanket, locally-sourced snacks, a book, and a hand-drawn map of secret spots. Seasonal variations: summer includes lemonade, autumn includes thermos and cider.', location: 'Delivered anywhere in Montreal', highlight: 'Seasonal | Handmade elements | Local ingredients', category: 'Gift Ideas' },
    { title: 'Art Print Collection', description: 'Prints from Montreal muralists and public artists. Each comes with the story behind the work and the artist\'s journey. Limited editions, numbered and signed. A piece of the city\'s creative soul for your wall.', location: 'Local studios', highlight: 'Limited editions | Artist proceeds | Signed & numbered', category: 'Gift Ideas' },
  ],
};

const TODAYS_PICKS: StoryItem[] = [
  STORIES.public_art[0],
  STORIES.cultural_events[1],
  STORIES.parks[0],
];

export function LexiCivicStoriesPage() {
  const [activeCategory, setActiveCategory] = useState<StoryCategory>('public_art');

  const stories = STORIES[activeCategory];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header with Avatar */}
      <div className="border-b border-gray-800 bg-gradient-to-b from-amber-950/20 to-gray-950">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-900/60 to-amber-900/40 border border-amber-800/30 flex items-center justify-center relative overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-red-600/80 absolute top-1.5" />
              <div className="absolute bottom-2 w-6 h-3">
                <svg viewBox="0 0 24 12" className="w-full h-full">
                  <path d="M 2,8 C 6,2 18,2 22,8" fill="none" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-white">Civic Stories</h1>
              <p className="text-xs text-amber-400/70">Montreal through Lexi's eyes</p>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-amber-900/20 border border-amber-800/30 rounded-full">
              <Eye size={10} className="text-amber-400" />
              <span className="text-[10px] text-amber-300 font-medium">Powered by Montreal Open Data</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6">
        {/* Today's Story Picks */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Star size={14} className="text-amber-400" />
            <h2 className="text-sm font-bold text-white">Today's Story Picks</h2>
            <span className="text-[9px] text-gray-500 ml-2">Curated by Lexi</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {TODAYS_PICKS.map((pick, i) => (
              <div key={i} className="bg-gray-900 border border-amber-800/20 rounded-2xl p-4 hover:border-amber-700/30 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={10} className="text-amber-400" />
                  <span className="text-[9px] text-amber-400 font-medium">{pick.category}</span>
                </div>
                <h3 className="text-xs font-bold text-white mb-1">{pick.title}</h3>
                <div className="flex items-center gap-1 mt-2">
                  <MapPin size={9} className="text-gray-500" />
                  <span className="text-[9px] text-gray-500">{pick.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all ${
                  isActive
                    ? `${cat.color} border`
                    : 'bg-gray-900 border border-gray-800 text-gray-400 hover:text-gray-300 hover:border-gray-700'
                }`}
              >
                <Icon size={13} />
                <span className="text-xs font-medium">{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Stories */}
        <div className="space-y-3">
          {stories.map((story, i) => (
            <CivicStoryCard
              key={i}
              title={story.title}
              description={story.description}
              location={story.location}
              highlight={story.highlight}
              category={story.category}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 py-6 border-t border-gray-800 text-center">
          <div className="flex items-center justify-center gap-2">
            <Heart size={10} className="text-amber-400" />
            <span className="text-[10px] text-gray-500">
              Stories powered by Montreal Open Data | 20 civic sources | Updated in real-time
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
