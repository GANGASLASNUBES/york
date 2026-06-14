export interface ArtAsset {
  id: string;
  name: string;
  file_url: string;
  file_type: 'image' | 'video' | 'texture' | 'pattern';
  asset_type: 'avatar' | 'brand' | 'pattern' | 'texture' | 'mask' | 'video_loop' | 'civic_data';
  tags: string[];
  creator_id?: string;
  is_lexi_compliant: boolean;
  metadata: {
    width?: number;
    height?: number;
    has_transparency?: boolean;
    color_palette?: string[];
    fps?: number;
    duration?: number;
  };
  version: number;
  parent_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ClothingDesign {
  id: string;
  name: string;
  creator_id?: string;
  product_type: 'hoodie' | 'tee' | 'joggers' | 'hat' | 'bag';
  design_json: {
    layers: DesignLayer[];
    product_config: {
      color?: string;
      size?: string;
      variant_id?: string;
    };
  };
  printful_product_id?: string;
  print_file_url?: string;
  mockup_urls: string[];
  status: 'draft' | 'ready' | 'published';
  created_at: string;
  updated_at: string;
}

export interface DesignLayer {
  id: string;
  asset_id: string;
  asset_url: string;
  position: { x: number; y: number };
  scale: number;
  rotation: number;
  z_index: number;
  opacity: number;
}

export interface PrintfulOrder {
  id: string;
  design_id: string;
  printful_order_id?: string;
  shopify_order_id?: string;
  status: 'pending' | 'fulfilled' | 'cancelled';
  order_data: any;
  created_at: string;
  updated_at: string;
}

export interface GamewareAsset {
  id: string;
  design_id: string;
  name: string;
  asset_type: 'texture' | 'sprite_sheet' | 'normal_map' | 'mask' | 'model';
  engine: 'unity' | 'unreal' | 'godot' | 'webgl';
  file_url: string;
  metadata: {
    creator_id?: string;
    version?: number;
    licensing?: string;
    avatar_fit_data?: any;
  };
  is_unlocked: boolean;
  created_at: string;
}

export interface CompletedAsset {
  id: string;
  name: string;
  product_type: string;
  creator_id?: string;
  version: number;
  channels: ('printful' | 'gameware' | 'ar')[];
  status: 'draft' | 'ready' | 'published';
  mockup_url?: string;
  created_at: string;
}
