'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'; // Removed CardDescription as it's not used
import { PlusCircle, Edit3, PlayCircle, Trash2, GripVertical, AlertTriangle, Zap } from 'lucide-react';
import { useUsageLimits } from '@/hooks/useUsageLimits';
import { useAuth } from '@/providers/AuthProvider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
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
import { Progress } from '@/components/ui/progress';
import { CircularScore } from '@/components/ui/circular-score';

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
          <div className="mt-2 text-xs flex items-start gap-4">
            <CircularScore value={Math.round((video.result.sentiment?.score || 0) * 100)} size={56} />
            <div className="space-y-1">
              <div><b>Sentiment:</b> {video.result.sentiment?.sentiment}</div>
              <div><b>Tone:</b> {video.result.tone?.tone}</div>
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
      <div className="min-h-screen bg-background">
        {/* Main Content Container - Properly Centered */}
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-12">
          
          {/* Header Section - Centered */}
          <div className="text-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Accelerate: Optimize your content
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Upload your videos and optimize audio, description, and hashtags for best results.
              </p>
            </div>
            <Button 
              onClick={handleAddVideos} 
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <PlusCircle className="mr-3 h-6 w-6" />
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

          {/* Upload Drop Zone - Centered and Prominent */}
          <div className="flex justify-center">
            <div className="w-full max-w-2xl">
              <Card 
                className="border-2 border-dashed border-primary/30 hover:border-primary/60 transition-all duration-300 cursor-pointer group bg-card/50 backdrop-blur-sm"
                onClick={handleAddVideos}
              >
                <CardContent className="p-16 text-center space-y-6">
                  <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                    <PlusCircle className="h-10 w-10 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-semibold text-foreground">Add videos</h3>
                    <p className="text-muted-foreground">Click or drag files here to upload</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Progress Section - Centered and Enhanced */}
          <div className="flex justify-center">
            <div className="w-full max-w-2xl">
              <Card className="bg-card/80 backdrop-blur-sm border-border/50">
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl font-bold text-foreground flex items-center justify-center gap-3">
                    <Zap className="h-6 w-6 text-primary" />
                    Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8 px-8 pb-8">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-base font-medium text-foreground">Audio</span>
                      <span className="text-sm text-muted-foreground">40%</span>
                    </div>
                    <Progress value={40} className="h-3" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-base font-medium text-foreground">Description</span>
                      <span className="text-sm text-muted-foreground">60%</span>
                    </div>
                    <Progress value={60} className="h-3" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-base font-medium text-foreground">Hashtags</span>
                      <span className="text-sm text-muted-foreground">30%</span>
                    </div>
                    <Progress value={30} className="h-3" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Video Workflow Columns - Full Width with Better Spacing */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center text-foreground">Video Workflow</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
              {columns.map((column) => (
                <Card key={column.id} className="bg-card/80 backdrop-blur-sm border-border/50 shadow-lg">
                  <CardHeader className="border-b border-border/30 p-6">
                    <CardTitle className="text-lg font-semibold text-foreground flex items-center justify-between">
                      {column.title}
                      <span className="text-sm font-normal text-muted-foreground bg-muted px-3 py-1 rounded-full">
                        {getVideosByColumn(column.id).length}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4 min-h-[300px]">
                    <SortableContext items={getVideosByColumn(column.id).map(v => v.id)} strategy={verticalListSortingStrategy}>
                      {getVideosByColumn(column.id).map((video) => (
                        <SortableVideoCard key={video.id} video={video} />
                      ))}
                    </SortableContext>
                    {getVideosByColumn(column.id).length === 0 && (
                      <div className="text-center text-muted-foreground py-16">
                        <div className="space-y-2">
                          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                            <PlayCircle className="h-6 w-6" />
                          </div>
                          <p className="text-sm">No videos in this stage</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <DragOverlay>
          {activeVideo ? <SortableVideoCard video={activeVideo} /> : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}
