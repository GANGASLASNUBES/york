export const LOGO_TEXT = 'ᗺIPS';

export const TAGLINE = 'Be Iconic. Play Supreme.';

export const SITES = [
  { id: 1, name: 'Midtown Madness', url: 'https://midtownmadness.com', category: 'Gaming' },
  { id: 2, name: 'Street Legal Racing', url: 'https://streetlegalracing.com', category: 'Gaming' },
  { id: 3, name: 'Redline Racing', url: 'https://redlineracing.com', category: 'Gaming' },
  { id: 4, name: 'ᗺIPS Studio', url: 'https://studio.bips.com', category: 'Creative' },
  { id: 5, name: 'ᗺIPS Shop', url: 'https://shop.bips.com', category: 'Commerce' },
];

export const AVATARS = [
  {
    id: 1,
    name: 'Apex Racer',
    image: '/avatars/apex-racer.jpg',
    description: 'Speed demon with unmatched precision',
    stats: { speed: 95, skill: 88, style: 92 },
  },
  {
    id: 2,
    name: 'Street Legend',
    image: '/avatars/street-legend.jpg',
    description: 'Urban warrior with attitude',
    stats: { speed: 87, skill: 93, style: 96 },
  },
  {
    id: 3,
    name: 'Circuit King',
    image: '/avatars/circuit-king.jpg',
    description: 'Track master with tactical genius',
    stats: { speed: 91, skill: 95, style: 85 },
  },
  {
    id: 4,
    name: 'Drift Queen',
    image: '/avatars/drift-queen.jpg',
    description: 'Sideways specialist with flair',
    stats: { speed: 89, skill: 90, style: 98 },
  },
];

export const PRODUCT_CATEGORIES = {
  ART: 'art',
  CLOTHING: 'clothing',
  GEAR: 'gear',
} as const;

export const ART_PRODUCTS = [
  {
    id: 1,
    title: '93999',
    artist: 'Lexi Rose',
    image: 'https://lexiroseca.myshopify.com/cdn/shop/files/framed-canvas-_in_-black-12x12-front-6830feb3ba9ef.jpg?v=1748041401',
    price: 299,
    category: 'Framed Canvas',
  },
  {
    id: 2,
    title: 'sold out clown',
    artist: 'Lexi Rose',
    image: 'https://lexiroseca.myshopify.com/cdn/shop/files/framed-canvas-_in_-black-12x16-front-6830fdf08ba30.jpg?v=1748041209',
    price: 399,
    category: 'Framed Canvas',
  },
  {
    id: 3,
    title: '3/3',
    artist: 'Lexi Rose',
    image: 'https://lexiroseca.myshopify.com/cdn/shop/files/framed-canvas-_in_-black-12x12-front-6830efa968c54.jpg?v=1748037551',
    price: 349,
    category: 'Framed Canvas',
  },
  {
    id: 4,
    title: 'Bain de violet',
    artist: 'Lexi Rose',
    image: 'https://lexiroseca.myshopify.com/cdn/shop/files/framed-canvas-_in_-black-12x12-front-6830f1d7cc0e0.jpg?v=1748038109',
    price: 299,
    category: 'Framed Canvas',
  },
];

export const CLOTHING_PRODUCTS = [
  {
    id: 1,
    name: 'bomber Jacket ~Why Are You Here?~',
    image: 'https://lexiroseca.myshopify.com/cdn/shop/files/all-over-print-unisex-bomber-jacket-white-front-64d6a4f091f01.jpg?v=1740413088',
    price: 189,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    id: 2,
    name: 'bomber jacket ~> bips',
    image: 'https://lexiroseca.myshopify.com/cdn/shop/products/all-over-print-unisex-bomber-jacket-white-front-6430ca448b740.jpg?v=1680919120',
    price: 189,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    id: 3,
    name: 'bucket hat ~Why Are You Here?~',
    image: 'https://lexiroseca.myshopify.com/cdn/shop/files/all-over-print-reversible-bucket-hat-white-product-details-inside-64d29e1489d21.jpg?v=1691524679',
    price: 45,
    sizes: ['S/M', 'L/XL'],
  },
  {
    id: 4,
    name: 'Syndicate backpack',
    image: 'https://lexiroseca.myshopify.com/cdn/shop/files/all-over-print-minimalist-backpack-white-front-67a684fe2919d.jpg?v=1738966283',
    price: 89,
    sizes: ['One Size'],
  },
];

export const GEAR_PRODUCTS = [
  {
    id: 1,
    name: 'Racing Wheel Pro',
    image: '/gear/racing-wheel.jpg',
    price: 499,
    specs: 'Force Feedback, 900° Rotation',
  },
  {
    id: 2,
    name: 'Gaming Headset Elite',
    image: '/gear/gaming-headset.jpg',
    price: 199,
    specs: '7.1 Surround, Noise Canceling',
  },
  {
    id: 3,
    name: 'ᗺIPS Controller',
    image: '/gear/controller.jpg',
    price: 89,
    specs: 'Wireless, 40hr Battery',
  },
];
