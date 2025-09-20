import { WalletInfo, EncryptedFile, BlockchainTransaction } from '@/types/blockchain';

// Mock blockchain service for demonstration
class MockBlockchainService {
  private wallets: Map<string, WalletInfo> = new Map();
  private files: Map<string, EncryptedFile> = new Map();
  private transactions: BlockchainTransaction[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private saveToStorage(): void {
    const data = {
      files: Array.from(this.files.entries()),
      transactions: this.transactions,
      wallets: Array.from(this.wallets.entries())
    };
    localStorage.setItem('blockchain_data', JSON.stringify(data));
  }

  private loadFromStorage(): void {
    try {
      const saved = localStorage.getItem('blockchain_data');
      if (saved) {
        const data = JSON.parse(saved);
        this.files = new Map(data.files?.map(([k, v]: [string, any]) => [
          k, 
          { ...v, uploadDate: new Date(v.uploadDate) }
        ]) || []);
        this.transactions = data.transactions?.map((tx: any) => ({
          ...tx,
          timestamp: new Date(tx.timestamp)
        })) || [];
        this.wallets = new Map(data.wallets || []);
      }
    } catch (error) {
      console.warn('Failed to load from localStorage:', error);
    }
  }

  // Generate a mock wallet with public/private key pair
  generateWallet(): WalletInfo {
    const randomBytes = () => Math.random().toString(36).substring(2, 15);
    const address = '0x' + randomBytes() + randomBytes();
    const publicKey = 'pub_' + randomBytes() + randomBytes();
    const privateKey = 'priv_' + randomBytes() + randomBytes();
    
    const wallet: WalletInfo = {
      address,
      publicKey,
      privateKey,
      balance: Math.floor(Math.random() * 100) + 10
    };
    
    this.wallets.set(address, wallet);
    return wallet;
  }

  // Mock encryption using simple base64 (in reality, use AES-256)
  encryptFile(content: string, key: string): string {
    return btoa(content + '::' + key);
  }

  // Mock decryption
  decryptFile(encryptedContent: string, key: string): string {
    try {
      const decoded = atob(encryptedContent);
      const [content, originalKey] = decoded.split('::');
      if (originalKey === key) {
        return content;
      }
      throw new Error('Invalid decryption key');
    } catch {
      throw new Error('Failed to decrypt file');
    }
  }

  // Simulate IPFS hash generation
  generateIPFSHash(): string {
    return 'Qm' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  // Store file on "blockchain" (mock)
  async storeFile(file: File, ownerAddress: string): Promise<EncryptedFile> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const fileId = 'file_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
        const encryptionKey = 'key_' + Math.random().toString(36).substring(2, 15);
        
        // Read file content (mock)
        const reader = new FileReader();
        reader.onload = () => {
          const content = reader.result as string;
          const encryptedContent = this.encryptFile(content, encryptionKey);
          
          const encryptedFile: EncryptedFile = {
            id: fileId,
            originalName: file.name,
            size: file.size,
            type: file.type,
            uploadDate: new Date(),
            encryptedContent,
            encryptionKey,
            ipfsHash: this.generateIPFSHash(),
            owner: ownerAddress,
            sharedWith: [],
            accessLevel: 'private'
          };
          
          this.files.set(fileId, encryptedFile);
          this.saveToStorage();
          
          // Create transaction record
          this.createTransaction({
            id: 'tx_' + Date.now(),
            type: 'upload',
            fileId,
            from: ownerAddress,
            timestamp: new Date(),
            gasUsed: Math.floor(Math.random() * 100000) + 21000,
        status: 'confirmed'
      });
      this.saveToStorage();
      
      resolve(encryptedFile);
        };
        reader.readAsDataURL(file);
      }, 1000); // Simulate network delay
    });
  }

  // Share file with another address
  shareFile(fileId: string, recipientAddress: string, ownerAddress: string): boolean {
    const file = this.files.get(fileId);
    if (!file || file.owner !== ownerAddress) {
      return false;
    }

    if (!file.sharedWith.includes(recipientAddress)) {
      file.sharedWith.push(recipientAddress);
      file.accessLevel = 'shared';
      
      this.createTransaction({
        id: 'tx_' + Date.now(),
        type: 'share',
        fileId,
        from: ownerAddress,
        to: recipientAddress,
        timestamp: new Date(),
        gasUsed: Math.floor(Math.random() * 50000) + 10000,
        status: 'confirmed'
      });
      this.saveToStorage();
    }
    
    return true;
  }

  // Get files owned by address
  getFilesByOwner(ownerAddress: string): EncryptedFile[] {
    return Array.from(this.files.values()).filter(file => file.owner === ownerAddress);
  }

  // Get files shared with address
  getSharedFiles(address: string): EncryptedFile[] {
    return Array.from(this.files.values()).filter(file => 
      file.sharedWith.includes(address)
    );
  }

  // Get file by ID (with access check)
  getFile(fileId: string, requesterAddress: string): EncryptedFile | null {
    const file = this.files.get(fileId);
    if (!file) return null;
    
    if (file.owner === requesterAddress || file.sharedWith.includes(requesterAddress)) {
      return file;
    }
    
    return null;
  }

  // Download and decrypt file
  async downloadFile(fileId: string, requesterAddress: string): Promise<string | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const file = this.getFile(fileId, requesterAddress);
        if (!file) {
          resolve(null);
          return;
        }

        try {
          const decryptedContent = this.decryptFile(file.encryptedContent, file.encryptionKey);
          
          this.createTransaction({
            id: 'tx_' + Date.now(),
            type: 'access',
            fileId,
            from: requesterAddress,
            timestamp: new Date(),
            gasUsed: Math.floor(Math.random() * 30000) + 5000,
            status: 'confirmed'
          });
          
          resolve(decryptedContent);
        } catch {
          resolve(null);
        }
      }, 500);
    });
  }

  private createTransaction(transaction: BlockchainTransaction): void {
    this.transactions.push(transaction);
    this.saveToStorage();
  }

  getTransactions(address: string): BlockchainTransaction[] {
    return this.transactions.filter(tx => 
      tx.from === address || tx.to === address
    ).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  getWallet(address: string): WalletInfo | undefined {
    return this.wallets.get(address);
  }
}

export const blockchainService = new MockBlockchainService();