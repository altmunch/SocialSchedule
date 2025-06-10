'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'; // Removed CardDescription as it's not used
import { PlusCircle, Edit3, PlayCircle, Trash2, GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Video {
  id: string;
  title: string;
  thumbnailUrl?: string;
  status: string;
  columnId: string; // Keep track of which column the video belongs to
  result?: any;
  error?: string;
  loading?: boolean;
}

interface Column {
  id: string;
  title: string;
}

const initialColumns: Column[] = [
  { id: 'todo', title: 'To Do / Uploaded' },
  { id: 'processing', title: 'Processing' },
  { id: 'review', title: 'Review & Edit' },
  { id: 'ready', title: 'Ready to Post' },
];

const initialVideos: Video[] = [
  { id: 'vid1', title: 'Amazing Product Demo.mp4', status: 'To Do', columnId: 'todo' },
  { id: 'vid2', title: 'How To Use Our New Feature.mov', status: 'To Do', columnId: 'todo' },
  { id: 'vid3', title: 'Client Testimonial Short.mp4', status: 'Processing', columnId: 'processing' },
  { id: 'vid4', title: 'Weekly Update - Ep 5.avi', status: 'Review', columnId: 'review' },
  { id: 'vid5', title: 'Grand Launch Announcement.mp4', status: 'Ready', columnId: 'ready' },
];

interface SortableVideoCardProps {
  video: Video;
}

function SortableVideoCard({ video }: SortableVideoCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: video.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : 'auto',
  };

  return (
    <Card ref={setNodeRef} style={style} className="bg-muted/50 border-border hover:shadow-lg transition-shadow duration-200 touch-manipulation">
      <CardHeader className="p-3 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-medium text-foreground truncate flex-grow" title={video.title}>
          {video.title}
        </CardTitle>
        <button {...attributes} {...listeners} className="p-1 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing">
          <GripVertical className="h-5 w-5" />
        </button>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className="w-full h-32 bg-muted rounded-md flex items-center justify-center mb-2">
          <PlayCircle className="w-12 h-12 text-muted-foreground/50" />
        </div>
        <p className="text-xs text-muted-foreground mb-2">Status: {video.status}{video.loading && ' (processing...)'}</p>
        {video.error && <p className="text-xs text-red-500">Error: {video.error}</p>}
        {video.result && (
          <div className="mt-2 text-xs">
            <div><b>Sentiment:</b> {video.result.sentiment?.sentiment} ({video.result.sentiment?.score})</div>
            <div><b>Tone:</b> {video.result.tone?.tone}</div>
            <div><b>Suggestions:</b>
              <ul className="list-disc ml-4">
                {video.result.suggestions?.captions?.map((c: string, i: number) => <li key={i}>{c}</li>)}
              </ul>
              <div className="mt-1">Hashtags: {video.result.suggestions?.hashtags?.join(' ')}</div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-3 border-t border-border/50 flex justify-end space-x-2">
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
          <Edit3 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="text-destructive/80 hover:text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function AccelerateComponent() {
  const [videos, setVideos] = useState<Video[]>(initialVideos);
  const [columns] = useState<Column[]>(initialColumns); // Columns are static for now
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddVideos = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newVideos: Video[] = Array.from(files).map((file, index) => ({
        id: `new-vid-${Date.now()}-${index}`,
        title: file.name,
        status: 'Processing',
        columnId: 'processing',
        thumbnailUrl: '',
        loading: true,
      }));
      setVideos(prevVideos => [...newVideos, ...prevVideos]);
      // For each video, trigger optimization
      Array.from(files).forEach(async (file, idx) => {
        const videoId = newVideos[idx].id;
        try {
          // Simulate extracting caption from filename for demo
          const caption = file.name.replace(/\.[^/.]+$/, '');
          const res = await fetch('/api/ai/optimize/content', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ caption }),
          });
          const data = await res.json();
          setVideos(prev => prev.map(v =>
            v.id === videoId
              ? {
                  ...v,
                  status: 'Ready',
                  columnId: 'ready',
                  result: data,
                  loading: false,
                  error: data.error ? data.error : undefined,
                }
              : v
          ));
        } catch (err: any) {
          setVideos(prev => prev.map(v =>
            v.id === videoId
              ? {
                  ...v,
                  status: 'Error',
                  columnId: 'todo',
                  loading: false,
                  error: err.message || 'Failed to optimize',
                }
              : v
          ));
        }
      });
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getVideosByColumn = (columnId: string) => videos.filter(v => v.columnId === columnId);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveVideo(videos.find(v => v.id === active.id) || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveVideo(null);
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const activeVideo = videos.find(v => v.id === active.id);
      
      // Check if 'over' is a column or a video within a column
      const overIsColumn = columns.some(c => c.id === over.id);
      const overIsVideo = videos.some(v => v.id === over.id);

      if (activeVideo) {
        let newColumnId = activeVideo.columnId;
        let newVideos = [...videos];

        if (overIsColumn) {
          newColumnId = over.id as string;
        } else if (overIsVideo) {
          const overVideo = videos.find(v => v.id === over.id);
          if (overVideo) {
            newColumnId = overVideo.columnId;
          }
        }
        
        // If moved to a new column or within the same (reordering logic would go here)
        if (newColumnId !== activeVideo.columnId || overIsVideo) {
            const oldColumnId = activeVideo.columnId;
            const targetColumnId = newColumnId;

            // Update video's columnId
            newVideos = newVideos.map(v => 
                v.id === active.id ? { ...v, columnId: targetColumnId } : v
            );

            // Reordering logic if dropped on another video (simplified: just move to column)
            if (overIsVideo && targetColumnId === oldColumnId) {
                const oldIndex = videos.findIndex(v => v.id === active.id && v.columnId === oldColumnId);
                const newIndex = videos.findIndex(v => v.id === over.id && v.columnId === oldColumnId);
                const columnVideos = videos.filter(v => v.columnId === oldColumnId);
                const reorderedColumnVideos = arrayMove(columnVideos, 
                    columnVideos.findIndex(v => v.id === active.id), 
                    columnVideos.findIndex(v => v.id === over.id)
                );
                
                // Update the main videos array, preserving order for other columns
                let updatedVideos: Video[] = [];
                columns.forEach(col => {
                    if (col.id === oldColumnId) {
                        updatedVideos.push(...reorderedColumnVideos);
                    } else {
                        updatedVideos.push(...videos.filter(v => v.columnId === col.id));
                    }
                });
                newVideos = updatedVideos;
            }
            setVideos(newVideos);
        }
      }
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="p-4 md:p-6 space-y-8 bg-background text-text min-h-screen">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-creative">Accelerate: Optimize your content</h1>
            <p className="text-secondaryText mt-1">
              Upload your videos and optimize audio, description, and hashtags for best results.
            </p>
          </div>
          <Button onClick={handleAddVideos} className="bg-primary text-black hover:bg-creative hover:text-white">
            <PlusCircle className="mr-2 h-5 w-5" />
            Add Videos
          </Button>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept="video/*"
          style={{ display: 'none' }}
          onChange={handleFileSelected}
        />
        {/* Add Videos Drop Area */}
        <div className="w-full flex justify-center">
          <div className="bg-panel border-2 border-dashed border-highlight rounded-lg p-12 flex flex-col items-center justify-center w-full max-w-xl shadow-md cursor-pointer hover:border-creative transition-all" onClick={handleAddVideos}>
            <PlusCircle className="h-10 w-10 text-primary mb-2" />
            <span className="text-lg font-semibold">Add videos</span>
            <span className="text-secondaryText text-sm mt-2">Click or drag files here to upload</span>
          </div>
        </div>
        {/* Progress Section */}
        <div className="w-full max-w-xl mx-auto mt-8">
          <h2 className="text-lg font-bold mb-4 text-creative">Progress</h2>
          <div className="space-y-4">
            <div>
              <span className="text-secondaryText">Audio</span>
              <div className="w-full h-3 bg-hover rounded-full mt-1">
                <div className="h-3 bg-primary rounded-full" style={{ width: '40%' }}></div>
              </div>
            </div>
            <div>
              <span className="text-secondaryText">Description</span>
              <div className="w-full h-3 bg-hover rounded-full mt-1">
                <div className="h-3 bg-primary rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
            <div>
              <span className="text-secondaryText">Hashtags</span>
              <div className="w-full h-3 bg-hover rounded-full mt-1">
                <div className="h-3 bg-primary rounded-full" style={{ width: '30%' }}></div>
              </div>
            </div>
          </div>
        </div>
        {/* Video Kanban Columns (optional, keep for advanced view) */}
        <div className="flex flex-col md:flex-row gap-4 overflow-x-auto pb-4">
          {columns.map((column) => (
            <Card key={column.id} className="w-full md:w-80 lg:w-96 flex-shrink-0 bg-panel border-border shadow-md">
              <CardHeader className="border-b border-border p-4">
                <CardTitle className="text-lg font-semibold text-creative flex items-center justify-between">
                  {column.title}
                  <span className="text-sm font-normal text-secondaryText bg-hover px-2 py-1 rounded-md">
                    {getVideosByColumn(column.id).length}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3 min-h-[200px]">
                <SortableContext items={getVideosByColumn(column.id).map(v => v.id)} strategy={verticalListSortingStrategy}>
                  {getVideosByColumn(column.id).map((video) => (
                    <SortableVideoCard key={video.id} video={video} />
                  ))}
                </SortableContext>
                {getVideosByColumn(column.id).length === 0 && (
                  <div className="text-center text-secondaryText py-10">
                    <p>No videos in this stage.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        <DragOverlay>
          {activeVideo ? <SortableVideoCard video={activeVideo} /> : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}
