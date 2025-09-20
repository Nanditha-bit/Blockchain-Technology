import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, Shield, Database } from "lucide-react";
import { useState, useRef } from "react";
import { EncryptedFile } from "@/types/blockchain";
import { blockchainService } from "@/services/mockBlockchain";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  walletAddress: string | null;
  onFileUploaded: (file: EncryptedFile) => void;
}

export const FileUpload = ({ walletAddress, onFileUploaded }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (file: File) => {
    if (!walletAddress) {
      toast({
        title: "Wallet Required",
        description: "Please create a wallet first",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      toast({
        title: "File Too Large",
        description: "Maximum file size is 50MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const next = prev + Math.random() * 20;
          return next > 90 ? 90 : next;
        });
      }, 200);

      const encryptedFile = await blockchainService.storeFile(file, walletAddress);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        onFileUploaded(encryptedFile);
        
        toast({
          title: "File Uploaded Successfully!",
          description: `${file.name} has been encrypted and stored on IPFS`,
        });
      }, 500);

    } catch (error) {
      setIsUploading(false);
      setUploadProgress(0);
      toast({
        title: "Upload Failed",
        description: "Failed to upload and encrypt file",
        variant: "destructive",
      });
    }
  };

  if (!walletAddress) {
    return (
      <Card className="bg-gradient-to-br from-card to-card/50 border-border opacity-50">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mb-4">
            <Upload className="w-8 h-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-xl text-muted-foreground">Upload Files</CardTitle>
          <p className="text-muted-foreground">
            Create a wallet to start uploading encrypted files
          </p>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-card to-card/50 border-border hover-glow">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl flex items-center gap-2">
          <Upload className="w-5 h-5 text-primary" />
          Upload Files
        </CardTitle>
        <p className="text-muted-foreground">
          Securely encrypt and store your files on the decentralized network
        </p>
      </CardHeader>
      <CardContent>
        {isUploading ? (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-lg font-medium">Encrypting & Uploading...</div>
              <div className="text-sm text-muted-foreground">
                Your file is being secured with end-to-end encryption
              </div>
            </div>
            <Progress value={uploadProgress} className="w-full" />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-2">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                  <Shield className="w-4 h-4 text-primary" />
                </div>
                <div className="text-xs text-muted-foreground">Encrypting</div>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                  <Database className="w-4 h-4 text-primary" />
                </div>
                <div className="text-xs text-muted-foreground">Storing on IPFS</div>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                  <FileText className="w-4 h-4 text-primary" />
                </div>
                <div className="text-xs text-muted-foreground">Recording Metadata</div>
              </div>
            </div>
          </div>
        ) : (
          <div
            className={`upload-zone rounded-lg p-8 text-center transition-all cursor-pointer ${
              isDragging ? 'drag-over' : ''
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleFileSelect}
          >
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-2">
              <div className="text-lg font-medium">Drop files here or click to upload</div>
              <div className="text-sm text-muted-foreground">
                Maximum file size: 50MB
              </div>
            </div>
            <Button variant="outline" className="mt-4" size="sm">
              Choose Files
            </Button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileUpload(file);
          }}
        />

        {/* Security Features */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="space-y-2">
            <div className="w-8 h-8 bg-success/20 rounded-full flex items-center justify-center mx-auto">
              <Shield className="w-4 h-4 text-success" />
            </div>
            <div className="text-sm font-medium">End-to-End Encrypted</div>
            <div className="text-xs text-muted-foreground">AES-256 encryption</div>
          </div>
          <div className="space-y-2">
            <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center mx-auto">
              <Database className="w-4 h-4 text-accent" />
            </div>
            <div className="text-sm font-medium">Decentralized Storage</div>
            <div className="text-xs text-muted-foreground">IPFS network</div>
          </div>
          <div className="space-y-2">
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
              <FileText className="w-4 h-4 text-primary" />
            </div>
            <div className="text-sm font-medium">Blockchain Verified</div>
            <div className="text-xs text-muted-foreground">Immutable records</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};