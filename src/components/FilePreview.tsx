import { useState } from 'react'
import { Download } from 'lucide-react'
import type { FileItem } from '../types'
import { fileTypeMeta, formatBytes, previewKind } from '../lib/format'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

// File preview modal. Picks the right element from previewKind() — <img> for
// images, <video> for video, <iframe> for PDFs. Only previewable files ever
// reach it (callers toast for the rest), so an unknown kind renders nothing.

// Shared cap so no preview — image, video or PDF — outgrows the viewport.
const MEDIA = 'max-h-[70vh] max-w-full rounded-lg shadow-sm'

interface Props {
  /** The file to preview; `null` keeps the dialog closed. */
  file: FileItem | null
  onOpenChange: (open: boolean) => void
}

export function FilePreview({ file, onOpenChange }: Props) {
  const kind = file ? previewKind(file) : null

  return (
    <Dialog open={file !== null} onOpenChange={onOpenChange}>
      {file && (
        <DialogContent
          // Wider + taller than the default dialog so media has room to breathe.
          className="flex max-h-[90vh] w-[min(96vw,900px)] max-w-none flex-col gap-0 overflow-hidden p-0"
        >
          <DialogHeader className="border-b px-5 py-4 pr-14 text-left">
            <DialogTitle className="truncate text-base">{file.name}</DialogTitle>
            <DialogDescription>
              {fileTypeMeta(file.type).label} · {formatBytes(file.sizeBytes)}
            </DialogDescription>
          </DialogHeader>

          <div className="bg-muted/40 flex min-h-0 flex-1 items-center justify-center overflow-auto p-4">
            <PreviewBody file={file} kind={kind} />
          </div>

          <div className="flex items-center justify-end border-t px-5 py-3">
            {file.url && (
              <Button asChild variant="outline" size="sm">
                <a href={file.url} download={file.name}>
                  <Download className="size-4" />
                  Download
                </a>
              </Button>
            )}
          </div>
        </DialogContent>
      )}
    </Dialog>
  )
}

function PreviewBody({
  file,
  kind,
}: {
  file: FileItem
  kind: ReturnType<typeof previewKind>
}) {
  const [loaded, setLoaded] = useState(false)

  if (kind === 'image') {
    return (
      <div className="relative flex min-h-[40vh] w-full items-center justify-center">
        {!loaded && <Skeleton className="absolute inset-0 rounded-lg" />}
        <img
          src={file.url}
          alt={file.name}
          onLoad={() => setLoaded(true)}
          className={cn(
            MEDIA,
            'mx-auto w-auto object-contain transition-opacity duration-300',
            loaded ? 'opacity-100' : 'opacity-0',
          )}
        />
      </div>
    )
  }

  if (kind === 'video') {
    return <video src={file.url} controls autoPlay className={cn(MEDIA, 'mx-auto w-full bg-black')} />
  }

  if (kind === 'pdf') {
    return (
      <iframe
        src={file.url}
        title={file.name}
        className={cn(MEDIA, 'h-[70vh] w-full border bg-white')}
      />
    )
  }

  return null
}
