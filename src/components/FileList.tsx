import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Share2, 
  Download, 
  Lock, 
  Users, 
  Calendar,
  HardDrive,
  ExternalLink
} from "lucide-react";
import { EncryptedFile } from "@/types/blockchain";
import { formatDistanceToNow } from "date-fns";

interface FileListProps {
  files: EncryptedFile[];
  sharedFiles: EncryptedFile[];
  onShareFile: (file: EncryptedFile) => void;
  onDownloadFile: (file: EncryptedFile) => void;
}

export const FileList = ({ files, sharedFiles, onShareFile, onDownloadFile }: FileListProps) => {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return '🖼️';
    if (type.startsWith('video/')) return '🎥';
    if (type.startsWith('audio/')) return '🎵';
    if (type.includes('pdf')) return '📄';
    if (type.includes('document') || type.includes('word')) return '📝';
    if (type.includes('spreadsheet') || type.includes('excel')) return '📊';
    return '📄';
  };

  const FileCard = ({ file, isShared = false }: { file: EncryptedFile; isShared?: boolean }) => (
    <Card className="bg-gradient-to-br from-card to-card/50 border-border hover-glow transition-all">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1">
            <div className="text-2xl">{getFileIcon(file.type)}</div>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{file.originalName}</div>
              <div className="text-sm text-muted-foreground">
                {formatFileSize(file.size)} • {formatDistanceToNow(file.uploadDate, { addSuffix: true })}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {file.accessLevel === 'shared' && (
              <Badge variant="secondary" className="bg-accent/20 text-accent border-accent/30">
                <Users className="w-3 h-3 mr-1" />
                Shared
              </Badge>
            )}
            {file.accessLevel === 'private' && (
              <Badge variant="secondary" className="bg-muted/20 text-muted-foreground border-muted/30">
                <Lock className="w-3 h-3 mr-1" />
                Private
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
          <HardDrive className="w-3 h-3" />
          <span className="font-mono">{file.ipfsHash.substring(0, 20)}...</span>
          <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
            <ExternalLink className="w-3 h-3" />
          </Button>
        </div>

        {file.sharedWith.length > 0 && (
          <div className="mb-3">
            <div className="text-xs text-muted-foreground mb-1">
              Shared with {file.sharedWith.length} address{file.sharedWith.length > 1 ? 'es' : ''}
            </div>
            <div className="flex flex-wrap gap-1">
              {file.sharedWith.slice(0, 2).map((address, index) => (
                <Badge key={index} variant="outline" className="text-xs font-mono">
                  {address.substring(0, 8)}...
                </Badge>
              ))}
              {file.sharedWith.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{file.sharedWith.length - 2} more
                </Badge>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => onDownloadFile(file)}
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          {!isShared && (
            <Button 
              size="sm"
              onClick={() => onShareFile(file)}
              className="bg-primary hover:bg-primary/90"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* My Files */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold">My Files</h2>
          <Badge variant="secondary">{files.length}</Badge>
        </div>
        
        {files.length === 0 ? (
          <Card className="bg-gradient-to-br from-card to-card/50 border-border">
            <CardContent className="p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <div className="text-lg font-medium mb-2">No files uploaded yet</div>
              <div className="text-muted-foreground">
                Upload your first file to get started with decentralized storage
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map((file) => (
              <FileCard key={file.id} file={file} />
            ))}
          </div>
        )}
      </div>

      {/* Shared With Me */}
      {sharedFiles.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-accent" />
            <h2 className="text-xl font-semibold">Shared With Me</h2>
            <Badge variant="secondary">{sharedFiles.length}</Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sharedFiles.map((file) => (
              <FileCard key={file.id} file={file} isShared />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};