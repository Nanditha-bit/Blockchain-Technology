import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Wallet, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { WalletInfo } from "@/types/blockchain";
import { useToast } from "@/hooks/use-toast";

interface WalletCardProps {
  wallet: WalletInfo | null;
  onCreateWallet: () => void;
}

export const WalletCard = ({ wallet, onCreateWallet }: WalletCardProps) => {
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const truncateKey = (key: string, length: number = 20) => {
    return key.length > length ? `${key.substring(0, length)}...` : key;
  };

  if (!wallet) {
    return (
      <Card className="bg-gradient-to-br from-card to-card/50 border-border hover-glow">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Wallet className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-xl">Create Your Wallet</CardTitle>
          <p className="text-muted-foreground">
            Generate a secure blockchain wallet to start sharing files
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          <Button 
            onClick={onCreateWallet}
            className="w-full bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-opacity"
            size="lg"
          >
            Generate Wallet
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-card to-card/50 border-border hover-glow">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            Your Wallet
          </CardTitle>
          <Badge variant="secondary" className="bg-success/20 text-success border-success/30">
            Connected
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Balance */}
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Balance</div>
          <div className="text-2xl font-bold text-primary">{wallet.balance} ETH</div>
        </div>

        {/* Address */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Wallet Address</div>
          <div className="flex items-center gap-2 bg-muted/30 rounded-lg p-3">
            <code className="flex-1 text-sm font-mono">
              {truncateKey(wallet.address, 25)}
            </code>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => copyToClipboard(wallet.address, "Address")}
              className="hover:bg-primary/20"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Public Key */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Public Key</div>
          <div className="flex items-center gap-2 bg-muted/30 rounded-lg p-3">
            <code className="flex-1 text-sm font-mono">
              {truncateKey(wallet.publicKey, 25)}
            </code>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => copyToClipboard(wallet.publicKey, "Public Key")}
              className="hover:bg-primary/20"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Private Key */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-warning">Private Key</div>
          <div className="flex items-center gap-2 bg-warning/10 rounded-lg p-3 border border-warning/30">
            <code className="flex-1 text-sm font-mono">
              {showPrivateKey ? truncateKey(wallet.privateKey, 25) : "•".repeat(30)}
            </code>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowPrivateKey(!showPrivateKey)}
              className="hover:bg-warning/20"
            >
              {showPrivateKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
            {showPrivateKey && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(wallet.privateKey, "Private Key")}
                className="hover:bg-warning/20"
              >
                <Copy className="w-4 h-4" />
              </Button>
            )}
          </div>
          <p className="text-xs text-warning">Never share your private key with anyone!</p>
        </div>
      </CardContent>
    </Card>
  );
};