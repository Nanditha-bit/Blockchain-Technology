import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { WalletCard } from "@/components/WalletCard";
import { FileUpload } from "@/components/FileUpload";
import { FileList } from "@/components/FileList";
import { ShareDialog } from "@/components/ShareDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Database, 
  FileText, 
  Users, 
  TrendingUp,
  Clock,
  HardDrive,
  Lock
} from "lucide-react";
import { WalletInfo, EncryptedFile } from "@/types/blockchain";
import { blockchainService } from "@/services/mockBlockchain";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [files, setFiles] = useState<EncryptedFile[]>([]);
  const [sharedFiles, setSharedFiles] = useState<EncryptedFile[]>([]);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<EncryptedFile | null>(null);
  const { toast } = useToast();

  const createWallet = () => {
    const newWallet = blockchainService.generateWallet();
    setWallet(newWallet);
    localStorage.setItem('wallet', JSON.stringify(newWallet));
    
    toast({
      title: "Wallet Created!",
      description: "Your blockchain wallet has been generated successfully",
    });
  };

  const handleFileUploaded = (file: EncryptedFile) => {
    setFiles(prev => [file, ...prev]);
  };

  const handleShareFile = (file: EncryptedFile) => {
    setSelectedFile(file);
    setShareDialogOpen(true);
  };

  const handleFileShared = (updatedFile: EncryptedFile) => {
    setFiles(prev => prev.map(f => f.id === updatedFile.id ? updatedFile : f));
  };

  const handleDownloadFile = async (file: EncryptedFile) => {
    if (!wallet) return;

    try {
      const decryptedContent = await blockchainService.downloadFile(file.id, wallet.address);
      
      if (decryptedContent) {
        // Create download link
        const link = document.createElement('a');
        link.href = decryptedContent;
        link.download = file.originalName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: "Download Started",
          description: `${file.originalName} has been decrypted and downloaded`,
        });
      } else {
        throw new Error('Access denied');
      }
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to decrypt and download file",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    // Load wallet from localStorage
    const savedWallet = localStorage.getItem('wallet');
    if (savedWallet) {
      setWallet(JSON.parse(savedWallet));
    }
  }, []);

  useEffect(() => {
    // Load files when wallet changes
    if (wallet) {
      const userFiles = blockchainService.getFilesByOwner(wallet.address);
      const userSharedFiles = blockchainService.getSharedFiles(wallet.address);
      setFiles(userFiles);
      setSharedFiles(userSharedFiles);
    }
  }, [wallet]);

  const DashboardStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="bg-gradient-to-br from-card to-card/50 border-border hover-glow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-primary">{files.length}</div>
              <div className="text-sm text-muted-foreground">My Files</div>
            </div>
            <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-card to-card/50 border-border hover-glow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-accent">{sharedFiles.length}</div>
              <div className="text-sm text-muted-foreground">Shared Files</div>
            </div>
            <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-accent" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-card to-card/50 border-border hover-glow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-success">
                {files.reduce((acc, file) => acc + file.size, 0) / 1024 / 1024 < 1 
                  ? (files.reduce((acc, file) => acc + file.size, 0) / 1024).toFixed(0) + 'KB'
                  : (files.reduce((acc, file) => acc + file.size, 0) / 1024 / 1024).toFixed(1) + 'MB'
                }
              </div>
              <div className="text-sm text-muted-foreground">Storage Used</div>
            </div>
            <div className="w-8 h-8 bg-success/20 rounded-lg flex items-center justify-center">
              <HardDrive className="w-4 h-4 text-success" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-card to-card/50 border-border hover-glow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-warning">{wallet?.balance || 0}</div>
              <div className="text-sm text-muted-foreground">ETH Balance</div>
            </div>
            <div className="w-8 h-8 bg-warning/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-warning" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const DashboardContent = () => (
    <div className="space-y-6">
      <DashboardStats />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WalletCard wallet={wallet} onCreateWallet={createWallet} />
        <FileUpload walletAddress={wallet?.address || null} onFileUploaded={handleFileUploaded} />
      </div>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-br from-card to-card/50 border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Security Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <div className="font-medium mb-1">End-to-End Encryption</div>
              <div className="text-sm text-muted-foreground">
                Files are encrypted with AES-256 before upload
              </div>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Database className="w-6 h-6 text-accent" />
              </div>
              <div className="font-medium mb-1">Decentralized Storage</div>
              <div className="text-sm text-muted-foreground">
                Files stored across IPFS network nodes
              </div>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-success" />
              </div>
              <div className="font-medium mb-1">Blockchain Verified</div>
              <div className="text-sm text-muted-foreground">
                All transactions recorded immutably
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardContent />;
      case 'files':
        return (
          <FileList 
            files={files} 
            sharedFiles={[]}
            onShareFile={handleShareFile}
            onDownloadFile={handleDownloadFile}
          />
        );
      case 'shared':
        return (
          <FileList 
            files={[]} 
            sharedFiles={sharedFiles}
            onShareFile={handleShareFile}
            onDownloadFile={handleDownloadFile}
          />
        );
      case 'wallet':
        return (
          <div className="max-w-md mx-auto">
            <WalletCard wallet={wallet} onCreateWallet={createWallet} />
          </div>
        );
      default:
        return <DashboardContent />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <Navigation
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          fileCount={files.length}
          sharedCount={sharedFiles.length}
          isConnected={!!wallet}
        />

        <main>
          {renderContent()}
        </main>

        <ShareDialog
          isOpen={shareDialogOpen}
          onOpenChange={setShareDialogOpen}
          file={selectedFile}
          walletAddress={wallet?.address || ''}
          onFileShared={handleFileShared}
        />
      </div>
    </div>
  );
};

export default Index;