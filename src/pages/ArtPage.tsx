import { Card, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Palette, ExternalLink, Sparkles, Image, Award } from 'lucide-react';
import { ART_PRODUCTS } from '../lib/constants';

export function ArtPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-rose-900/40 to-amber-900/40 border border-amber-500/20">
            <Palette size={48} className="text-amber-500" />
          </div>
          <div>
            <h1 className="text-5xl font-bold">Art Gallery</h1>
            <p className="text-gray-400 mt-2 text-lg">Exclusive digital art and limited edition collectibles</p>
          </div>
        </div>
        <a
          href="https://lexiroseca.myshopify.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="primary" className="whitespace-nowrap">
            Visit Full Catalog
            <ExternalLink className="inline-block ml-2" size={16} />
          </Button>
        </a>
      </div>

      <section className="mb-12 bg-gradient-to-r from-rose-900/20 via-amber-900/20 to-rose-900/20 border border-amber-500/30 rounded-xl overflow-hidden">
        <div className="p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={24} className="text-amber-500" />
                <h2 className="text-2xl font-bold text-white">Shop the full collection</h2>
              </div>
              <p className="text-gray-300 leading-relaxed">
                Browse and purchase original art, prints, and digital collectibles from our Shopify store
              </p>
            </div>
            <a
              href="https://lexiroseca.myshopify.com"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0"
            >
              <Button variant="primary" className="min-w-[180px]">
                Shop on Shopify
                <ExternalLink className="inline-block ml-2" size={16} />
              </Button>
            </a>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {ART_PRODUCTS.map((art) => (
          <Card key={art.id} className="hover:border-amber-500/50 transition-all group">
            <div className="aspect-square bg-gray-900 flex items-center justify-center relative overflow-hidden">
              <img
                src={art.image}
                alt={art.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <CardBody>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-xl font-bold">{art.title}</h3>
                  <p className="text-gray-500 text-sm mt-1">{art.artist}</p>
                </div>
                <span className="text-xs bg-amber-500/20 text-amber-500 px-3 py-1 rounded-full border border-amber-500/30">
                  {art.category}
                </span>
              </div>
              <p className="text-3xl font-bold text-amber-500 mb-4">${art.price}</p>
              <a
                href="https://lexiroseca.myshopify.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="primary" className="w-full group-hover:bg-amber-600 transition-colors">
                  View on Shopify
                  <ExternalLink className="inline-block ml-2" size={16} />
                </Button>
              </a>
            </CardBody>
          </Card>
        ))}
      </div>

      <section className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="border-b border-gray-800 px-8 py-4">
          <h2 className="text-3xl font-bold">About the Art</h2>
        </div>
        <div className="p-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex flex-col">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-4 w-fit">
                <Image size={24} className="text-amber-500" />
              </div>
              <h3 className="text-lg font-bold mb-2">Original Creations</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Each piece is carefully crafted by the artists behind the ecosystem, bringing together the worlds
                of gaming, street culture, and digital art. All artworks are available as high-resolution digital
                downloads with exclusive usage rights.
              </p>
            </div>
            <div className="flex flex-col">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-4 w-fit">
                <Award size={24} className="text-amber-500" />
              </div>
              <h3 className="text-lg font-bold mb-2">Limited Editions</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Visit{' '}
                <a href="https://lexiroseca.myshopify.com" target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:text-amber-400 font-semibold">
                  lexiroseca.myshopify.com
                </a>{' '}
                to browse the full Shopify catalog. Limited edition collectibles sell out fast.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
