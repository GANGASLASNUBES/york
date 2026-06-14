// Legacy identity graph module - not currently in use
// Preserved for potential future integration with identity management

export interface Identity {
  id: string;
  userId: string;
  platform: string;
  platformUserId: string;
  username: string;
  verified: boolean;
  createdAt: string;
}

export interface Connection {
  id: string;
  fromIdentityId: string;
  toIdentityId: string;
  connectionType: 'friend' | 'teammate' | 'rival' | 'following';
  strength: number;
  createdAt: string;
}
