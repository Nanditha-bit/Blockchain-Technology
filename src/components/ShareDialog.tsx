import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Share2, Users, Shield, Clock, AlertCircle } from "lucide-react";
import { useState } from "react";
import { EncryptedFile } from "@/types/blockchain";
import { blockchainService } from "@/services/mockBlockchain";
import { useToast } from "@/hooks/use-toast";

interface ShareDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  file: EncryptedFile | null;
  walletAddress: string;
  onFileShared: (file: EncryptedFile) => void;
}

export const ShareDialog = ({ 
  isOpen, 
  onOpenChange, 
  file, 
  walletAddress,
  onFileShared 
}: ShareDialogProps) => {
  const [recipientAddress, setRecipientAddress] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const { toast } = useToast();

  const handleShare = async () => {
    if (!file || !recipientAddress.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid recipient address",
        variant: "destructive",
      });
      return;
    }

    if (recipientAddress === walletAddress) {
      toast({
        title: "Invalid Recipient",
        description: "You cannot share a file with yourself",
        variant: "destructive",
      });
      return;
    }

    if (!recipientAddress.startsWith('0x') || recipientAddress.length < 20) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid blockchain address",
        variant: "destructive",
      });
      return;
    }

    setIsSharing(true);

    try {
      // Simulate sharing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const success = blockchainService.shareFile(file.id, recipientAddress, walletAddress);
      
      if (success) {
        const updatedFile = blockchainService.getFile(file.id, walletAddress);
        if (updatedFile) {
          onFileShared(updatedFile);
        }
        
        toast({
          title: "File Shared Successfully!",
          description: `${file.originalName} has been shared with ${recipientAddress.substring(0, 10)}...`,
        });
        
        setRecipientAddress("");
        onOpenChange(false);
      } else {
        throw new Error("Sharing failed");
      }
    } catch (error) {
      toast({
        title: "Sharing Failed",
        description: "Failed to share file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  if (!file) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            Share File
          </DialogTitle>
          <DialogDescription>
            Share "{file.originalName}" with another user on the network
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Info */}
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="text-2xl">
                {file.type.startsWith('image/') ? '🖼️' : '📄'}
              </div>
              <div>
                <div className="font-medium">{file.originalName}</div>
                <div className="text-sm text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
            </div>
            
            {file.sharedWith.length > 0 && (
              <div className="border-t border-border pt-2 mt-2">
                <div className="text-sm text-muted-foreground mb-2">
                  Currently shared with:
                </div>
                <div className="flex flex-wrap gap-1">
                  {file.sharedWith.map((address, index) => (
                    <Badge key={index} variant="outline" className="text-xs font-mono">
                      {address.substring(0, 8)}...{address.substring(address.length - 4)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Recipient Input */}
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient Wallet Address</Label>
            <Input
              id="recipient"
              placeholder="0x..."
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              className="font-mono"
            />
            <div className="text-xs text-muted-foreground">
              Enter the blockchain address of the user you want to share with
            </div>
          </div>

          {/* Security Info */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <div className="font-medium text-primary mb-1">Secure Sharing</div>
                <div className="text-muted-foreground">
                  Your file will be re-encrypted with the recipient's public key. 
                  Only they will be able to decrypt and access it.
                </div>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-warning/5 border border-warning/20 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <div className="font-medium text-warning mb-1">Important</div>
                <div className="text-muted-foreground">
                  Once shared, the recipient will have permanent access to this file. 
                  Make sure you trust them with this data.
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isSharing}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleShare}
              disabled={isSharing || !recipientAddress.trim()}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {isSharing ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Sharing...
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share File
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};