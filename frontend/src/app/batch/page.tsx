'use client';

import React, { useState } from 'react';
import { 
  Zap, 
  Plus, 
  Trash2, 
  Play, 
  Download,
  Copy,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import { batchGenerate, pollTaskStatus } from '@/lib/api-client';
import { BatchPostRequest, PostStatusResponse, LinkedInPost } from '@/types/api';
import toast from 'react-hot-toast';

interface BatchItem {
  id: string;
  paperTitle: string;
  additionalContext: string;
  targetAudience: 'academic' | 'professional' | 'general';
  tone: 'professional' | 'casual' | 'enthusiastic';
  taskId?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progress: number;
  result?: LinkedInPost;
  error?: string;
}

export default function BatchPage() {
  const [batchItems, setBatchItems] = useState<BatchItem[]>([
    {
      id: '1',
      paperTitle: '',
      additionalContext: '',
      targetAudience: 'professional',
      tone: 'professional',
      status: 'pending',
      progress: 0
    }
  ]);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [batchId, setBatchId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const targetAudienceOptions = [
    { value: 'academic', label: 'Academic Researchers' },
    { value: 'professional', label: 'Industry Professionals' },
    { value: 'general', label: 'General Audience' },
  ];

  const toneOptions = [
    { value: 'professional', label: 'Professional' },
    { value: 'casual', label: 'Casual' },
    { value: 'enthusiastic', label: 'Enthusiastic' },
  ];

  const addBatchItem = () => {
    const newItem: BatchItem = {
      id: Date.now().toString(),
      paperTitle: '',
      additionalContext: '',
      targetAudience: 'professional',
      tone: 'professional',
      status: 'pending',
      progress: 0
    };
    setBatchItems([...batchItems, newItem]);
  };

  const removeBatchItem = (id: string) => {
    if (batchItems.length > 1) {
      setBatchItems(batchItems.filter(item => item.id !== id));
    }
  };

  const updateBatchItem = (id: string, field: keyof BatchItem, value: string | number) => {
    setBatchItems(batchItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const validateBatch = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    batchItems.forEach((item) => {
      if (!item.paperTitle.trim()) {
        newErrors[`${item.id}-paperTitle`] = 'Paper title is required';
      } else if (item.paperTitle.length < 10) {
        newErrors[`${item.id}-paperTitle`] = 'Paper title must be at least 10 characters';
      }
      
      if (item.additionalContext.length > 500) {
        newErrors[`${item.id}-additionalContext`] = 'Additional context must be less than 500 characters';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBatchSubmit = async () => {
    if (!validateBatch()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsProcessing(true);
    setBatchItems(items => items.map(item => ({ ...item, status: 'pending' as const, progress: 0 })));

    try {
      const request: BatchPostRequest = {
        papers: batchItems.map(item => ({
          paper_title: item.paperTitle,
          additional_context: item.additionalContext || undefined,
          target_audience: item.targetAudience,
          tone: item.tone,
        }))
      };

      const response = await batchGenerate(request);
      setBatchId(response.batch_id);
      toast.success('Batch generation started!');

      // Start polling for each task
      const taskPollingPromises = response.task_ids.map(async (taskId, index) => {
        // Update the corresponding batch item with task ID
        setBatchItems(items => items.map((item, idx) => 
          idx === index ? { ...item, taskId, status: 'in_progress' as const } : item
        ));

        try {
          await pollTaskStatus(
            taskId,
            (statusResponse: PostStatusResponse) => {
              setBatchItems(items => items.map(item => 
                item.taskId === taskId ? {
                  ...item,
                  status: statusResponse.status,
                  progress: statusResponse.progress,
                  result: statusResponse.result,
                  error: statusResponse.error_message
                } : item
              ));
            }
          );
        } catch (error) {
          setBatchItems(items => items.map(item => 
            item.taskId === taskId ? {
              ...item,
              status: 'failed' as const,
              progress: 0,
              error: error instanceof Error ? error.message : 'Unknown error'
            } : item
          ));
        }
      });

      // Wait for all tasks to complete
      await Promise.all(taskPollingPromises);
      toast.success('Batch generation completed!');
    } catch (error) {
      console.error('Error in batch generation:', error);
      toast.error('Failed to start batch generation. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyPost = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success('Post copied to clipboard!');
    } catch {
      toast.error('Failed to copy post');
    }
  };

  const handleDownloadAll = () => {
    const completedPosts = batchItems.filter(item => item.result);
    if (completedPosts.length === 0) {
      toast.error('No completed posts to download');
      return;
    }

    const data = completedPosts.map((item) => ({
      paper_title: item.paperTitle,
      content: item.result?.content,
      word_count: item.result?.word_count,
      character_count: item.result?.character_count,
      hashtags: item.result?.hashtags?.join(', '),
      engagement_score: item.result?.engagement_score
    }));

    const csv = [
      ['Paper Title', 'Content', 'Word Count', 'Character Count', 'Hashtags', 'Engagement Score'],
      ...data.map(row => [
        row.paper_title,
        row.content?.replace(/\n/g, ' '),
        row.word_count,
        row.character_count,
        row.hashtags,
        row.engagement_score
      ])
    ].map(row => row.map(cell => `"${cell || ''}"`).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `batch_posts_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Posts downloaded successfully!');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-500 animate-pulse" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'in_progress':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const completedCount = batchItems.filter(item => item.status === 'completed').length;
  const failedCount = batchItems.filter(item => item.status === 'failed').length;
  const inProgressCount = batchItems.filter(item => item.status === 'in_progress').length;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">
            Batch Post Generation
          </h1>
          <p className="text-muted-foreground">
            Generate multiple LinkedIn posts simultaneously with real-time progress tracking
          </p>
        </div>

        {/* Batch Summary */}
        {batchId && (
          <Card className="mb-6 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <Play className="w-5 h-5" />
                Batch Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-900">{batchItems.length}</div>
                  <div className="text-sm text-blue-700">Total</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{completedCount}</div>
                  <div className="text-sm text-green-700">Completed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">{inProgressCount}</div>
                  <div className="text-sm text-blue-700">In Progress</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">{failedCount}</div>
                  <div className="text-sm text-red-700">Failed</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Batch Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>Batch Configuration</span>
              </CardTitle>
              <CardDescription>
                Add multiple paper titles to generate LinkedIn posts in bulk
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {batchItems.map((item, index) => (
                <Card key={item.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Post {index + 1}</span>
                      {getStatusIcon(item.status)}
                      <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                    {batchItems.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeBatchItem(item.id)}
                        className="text-red-500 hover:text-red-700"
                        disabled={isProcessing}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {/* Progress Bar */}
                  {item.status === 'in_progress' && (
                    <div className="mb-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${item.progress * 100}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Progress: {Math.round(item.progress * 100)}%
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium">Paper Title *</label>
                      <Input
                        value={item.paperTitle}
                        onChange={(e) => updateBatchItem(item.id, 'paperTitle', e.target.value)}
                        placeholder="e.g., Attention Is All You Need"
                        disabled={isProcessing}
                      />
                      {errors[`${item.id}-paperTitle`] && (
                        <p className="text-red-500 text-xs mt-1">{errors[`${item.id}-paperTitle`]}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium">Additional Context (Optional)</label>
                      <Textarea
                        value={item.additionalContext}
                        onChange={(e) => updateBatchItem(item.id, 'additionalContext', e.target.value)}
                        placeholder="e.g., Focus on practical applications..."
                        rows={2}
                        disabled={isProcessing}
                      />
                      <div className="text-xs text-muted-foreground mt-1">
                        {item.additionalContext.length}/500 characters
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium">Target Audience</label>
                        <select
                          value={item.targetAudience}
                          onChange={(e) => updateBatchItem(item.id, 'targetAudience', e.target.value)}
                          disabled={isProcessing}
                          className="w-full p-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {targetAudienceOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Tone</label>
                        <select
                          value={item.tone}
                          onChange={(e) => updateBatchItem(item.id, 'tone', e.target.value)}
                          disabled={isProcessing}
                          className="w-full p-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {toneOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {item.error && (
                      <div className="text-red-500 text-xs bg-red-50 p-2 rounded">
                        {item.error}
                      </div>
                    )}
                  </div>
                </Card>
              ))}

              <Button
                variant="outline"
                onClick={addBatchItem}
                disabled={isProcessing}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Another Paper
              </Button>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button
                onClick={handleBatchSubmit}
                disabled={isProcessing || batchItems.some(item => !item.paperTitle.trim())}
                className="flex-1"
              >
                {isProcessing ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Generate All Posts
                  </>
                )}
              </Button>
              {completedCount > 0 && (
                <Button
                  variant="outline"
                  onClick={handleDownloadAll}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download All
                </Button>
              )}
            </CardFooter>
          </Card>

          {/* Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Generated Posts</span>
                <span className="text-sm text-muted-foreground">
                  {completedCount} of {batchItems.length} completed
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {batchItems.map((item, index) => (
                  <Card key={item.id} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Post {index + 1}</span>
                        {getStatusIcon(item.status)}
                      </div>
                      {item.result && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyPost(item.result!.content)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="text-sm text-muted-foreground mb-2 truncate">
                      {item.paperTitle}
                    </div>

                    {item.result ? (
                      <div className="space-y-2">
                        <div className="p-2 bg-muted/50 rounded text-xs max-h-32 overflow-y-auto">
                          {item.result.content.substring(0, 200)}
                          {item.result.content.length > 200 && '...'}
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Words: {item.result.word_count}</span>
                          <span>Characters: {item.result.character_count}</span>
                        </div>
                      </div>
                    ) : item.status === 'in_progress' ? (
                      <div className="text-xs text-blue-600">
                        Generating post... {Math.round(item.progress * 100)}%
                      </div>
                    ) : item.status === 'failed' ? (
                      <div className="text-xs text-red-600">
                        Failed: {item.error || 'Unknown error'}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500">
                        Waiting to start...
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 