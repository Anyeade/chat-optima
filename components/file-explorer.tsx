'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDownIcon,
  FileIcon,
  PlusIcon,
  TrashIcon,
  PencilEditIcon,
} from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export interface VirtualFile {
  id: string;
  name: string;
  content: string;
  type: 'file';
  extension: 'html' | 'css' | 'js';
  isEntry?: boolean; // Main HTML file
}

export interface VirtualFileSystem {
  files: VirtualFile[];
  activeFileId: string | null;
}

interface FileExplorerProps {
  fileSystem: VirtualFileSystem;
  onFileSelect: (file: VirtualFile) => void;
  onFileCreate: (name: string, type: VirtualFile['extension']) => void;
  onFileDelete: (fileId: string) => void;
  onFileRename: (fileId: string, newName: string) => void;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  className?: string;
}

const FileExtensionIcon = ({ extension }: { extension: VirtualFile['extension'] }) => {
  const iconClass = "w-4 h-4";
  
  switch (extension) {
    case 'html':
      return <div className={cn(iconClass, "bg-orange-500 text-white rounded-sm text-xs font-bold flex items-center justify-center")}>H</div>;
    case 'css':
      return <div className={cn(iconClass, "bg-blue-500 text-white rounded-sm text-xs font-bold flex items-center justify-center")}>C</div>;
    case 'js':
      return <div className={cn(iconClass, "bg-yellow-500 text-black rounded-sm text-xs font-bold flex items-center justify-center")}>J</div>;
    default:
      return <FileIcon size={16} />;
  }
};

const CreateFileDialog = ({ 
  isOpen, 
  onClose, 
  onCreate
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onCreate: (name: string, fileType: VirtualFile['extension']) => void;
}) => {
  const [name, setName] = useState('');
  const [fileType, setFileType] = useState<VirtualFile['extension']>('html');

  const handleCreate = () => {
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    
    onCreate(name.trim(), fileType);
    setName('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background border rounded-lg p-4 w-80">
        <h3 className="font-semibold mb-3">Create New File</h3>
        
        <div className="space-y-3">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="filename"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreate();
              if (e.key === 'Escape') onClose();
            }}
          />
          
          <select 
            value={fileType} 
            onChange={(e) => setFileType(e.target.value as VirtualFile['extension'])}
            className="w-full p-2 border rounded"
          >
            <option value="html">HTML</option>
            <option value="css">CSS (Tailwind)</option>
            <option value="js">JavaScript</option>
          </select>
        </div>
        
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleCreate}>Create</Button>
        </div>
      </div>
    </div>
  );
};

const FileItem = ({ 
  file, 
  isActive,
  onFileSelect,
  onFileDelete,
  onFileRename,
}: {
  file: VirtualFile;
  isActive: boolean;
  onFileSelect: (file: VirtualFile) => void;
  onFileDelete: (fileId: string) => void;
  onFileRename: (fileId: string, newName: string) => void;
}) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(file.name);

  const handleRename = () => {
    if (newName.trim() && newName !== file.name) {
      onFileRename(file.id, newName.trim());
    }
    setIsRenaming(false);
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-2 hover:bg-muted/50 cursor-pointer group text-sm",
        isActive && "bg-accent text-accent-foreground"
      )}
      onClick={() => !isRenaming && onFileSelect(file)}
    >
      <FileExtensionIcon extension={file.extension} />
      
      {isRenaming ? (
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onBlur={handleRename}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleRename();
            if (e.key === 'Escape') setIsRenaming(false);
          }}
          className="h-6 text-sm flex-1"
          autoFocus
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span className="flex-1 truncate">
          {file.name}
          {file.isEntry && (
            <span className="ml-1 text-xs text-muted-foreground">(entry)</span>
          )}
        </span>
      )}
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="p-1 size-6 opacity-0 group-hover:opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            <PencilEditIcon size={12} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>          <DropdownMenuItem onClick={() => setIsRenaming(true)}>
            <div className="mr-2">
              <PencilEditIcon size={16} />
            </div>
            Rename
          </DropdownMenuItem>          <DropdownMenuItem 
            onClick={() => onFileDelete(file.id)}
            className="text-destructive"
          >
            <div className="mr-2">
              <TrashIcon size={16} />
            </div>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export function FileExplorer({
  fileSystem,
  onFileSelect,
  onFileCreate,
  onFileDelete,
  onFileRename,
  isExpanded,
  onToggleExpanded,
  className,
}: FileExplorerProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  return (
    <>
      <div className={cn("flex flex-col h-full border-r bg-muted/20", className)}>
        {/* Header */}
        <div className="flex items-center justify-between p-2 border-b bg-muted/30">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleExpanded}
              className="p-1 size-6"
            >              {isExpanded ? (
                <ChevronDownIcon size={14} />
              ) : (
                <div className="-rotate-90">
                  <ChevronDownIcon size={14} />
                </div>
              )}
            </Button>
            <span className="text-sm font-medium">Files</span>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-1 size-6"
            onClick={() => setShowCreateDialog(true)}
          >
            <PlusIcon size={14} />
          </Button>
        </div>

        {/* File List */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="flex-1 overflow-auto"
            >
              <div className="py-1">
                {fileSystem.files.map((file) => (
                  <FileItem
                    key={file.id}
                    file={file}
                    isActive={file.id === fileSystem.activeFileId}
                    onFileSelect={onFileSelect}
                    onFileDelete={onFileDelete}
                    onFileRename={onFileRename}
                  />
                ))}
                {fileSystem.files.length === 0 && (
                  <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                    No files yet
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <CreateFileDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onCreate={onFileCreate}
      />
    </>
  );
}