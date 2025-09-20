export interface WalletInfo {
  address: string;
  publicKey: string;
  privateKey: string;
  balance: number;
}

export interface EncryptedFile {
  id: string;
  originalName: string;
  size: number;
  type: string;
  uploadDate: Date;
  encryptedContent: string;
  encryptionKey: string;
  ipfsHash: string;
  owner: string;
  sharedWith: string[];
  accessLevel: 'private' | 'shared' | 'public';
}

export interface ShareRequest {
  fileId: string;
  recipientAddress: string;
  accessLevel: 'read' | 'write' | 'admin';
  expirationDate?: Date;
}

export interface BlockchainTransaction {
  id: string;
  type: 'upload' | 'share' | 'access' | 'revoke';
  fileId: string;
  from: string;
  to?: string;
  timestamp: Date;
  gasUsed: number;
  status: 'pending' | 'confirmed' | 'failed';
}

export interface IPFSNode {
  hash: string;
  size: number;
  links: string[];
  timestamp: Date;
}