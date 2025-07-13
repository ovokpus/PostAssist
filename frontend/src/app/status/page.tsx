'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  RefreshCw, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Eye, 
  Copy,
  Calendar,
  BarChart3,
  TrendingUp,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent
} from '@/components/ui/card';
import { getTaskStatus, getAllTasks } from '@/lib/api-client';
import { PostStatusResponse, LinkedInPost } from '@/types/api';
import DetailedStatus from '@/components/ui/detailed-status';
import toast from 'react-hot-toast';

interface TaskHistoryItem {
  taskId: string;
  paperTitle: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progress: number;
  createdAt: Date;
  updatedAt: Date;
  duration?: number;
  result?: LinkedInPost;
  errorMessage?: string;
}

export default function StatusPage() {
  const [tasks, setTasks] = useState<TaskHistoryItem[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<TaskHistoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTask, setSelectedTask] = useState<PostStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Load tasks from API
  const loadTasks = async () => {
    setIsLoading(true);
    try {
      const allTasks = await getAllTasks();
      
      // Convert API response to TaskHistoryItem format
      const taskHistoryItems: TaskHistoryItem[] = allTasks.map(task => {
        // Extract paper title from request data
        const paperTitle = task.request_data?.paper_title || 'Unknown Paper';
        
        // Calculate duration for completed tasks
        const duration = task.status === 'completed' && task.created_at && task.updated_at
          ? new Date(task.updated_at).getTime() - new Date(task.created_at).getTime()
          : undefined;
        
        return {
          taskId: task.task_id,
          paperTitle,
          status: task.status,
          progress: task.progress,
          createdAt: new Date(task.created_at),
          updatedAt: new Date(task.updated_at),
          duration,
          result: task.result || undefined,
          errorMessage: task.error_message || undefined
        };
      });
      
      setTasks(taskHistoryItems);
      setFilteredTasks(taskHistoryItems);
    } catch (error) {
      console.error('Failed to load tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Load tasks on component mount
    loadTasks();
  }, []);

  useEffect(() => {
    // Filter tasks based on search and status
    let filtered = tasks;
    
    if (searchTerm) {
      filtered = filtered.filter(task => 
        task.paperTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.taskId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter);
    }
    
    setFilteredTasks(filtered);
  }, [tasks, searchTerm, statusFilter]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (autoRefresh) {
      interval = setInterval(() => {
        refreshTasks();
      }, 5000); // Refresh every 5 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const refreshTasks = async () => {
    setIsLoading(true);
    try {
      await loadTasks();
      toast.success('Tasks refreshed');
    } catch (error) {
      console.error('Failed to refresh tasks:', error);
      toast.error('Failed to refresh tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskClick = async (taskId: string) => {
    setIsLoading(true);
    try {
      const taskStatus = await getTaskStatus(taskId);
      setSelectedTask(taskStatus);
    } catch (_) {
      toast.error('Failed to load task details');
    } finally {
      setIsLoading(false);
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

  const formatDuration = (duration: number) => {
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
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

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    failed: tasks.filter(t => t.status === 'failed').length,
    avgDuration: tasks.filter(t => t.duration).reduce((acc, t) => acc + (t.duration || 0), 0) / tasks.filter(t => t.duration).length || 0
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">
            Task Status Dashboard
          </h1>
          <p className="text-muted-foreground">
            Monitor and manage all your LinkedIn post generation tasks
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Tasks</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
                </div>
                <Clock className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Failed</p>
                  <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Duration</p>
                  <p className="text-2xl font-bold">{stats.avgDuration > 0 ? formatDuration(stats.avgDuration) : 'N/A'}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Tasks List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Task History</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAutoRefresh(!autoRefresh)}
                      className={autoRefresh ? 'bg-blue-50' : ''}
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
                      Auto Refresh
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={refreshTasks}
                      disabled={isLoading}
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Search and Filter */}
                <div className="flex gap-4 mb-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search tasks..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="in_progress">In Progress</option>
                    <option value="failed">Failed</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>

                {/* Tasks List */}
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {filteredTasks.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No tasks found matching your criteria
                    </div>
                  ) : (
                    filteredTasks.map((task) => (
                      <Card key={task.taskId} className="p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {getStatusIcon(task.status)}
                              <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(task.status)}`}>
                                {task.status.replace('_', ' ')}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {task.taskId}
                              </span>
                            </div>
                            
                            <h3 className="font-medium mb-2 line-clamp-1">
                              {task.paperTitle}
                            </h3>
                            
                            {task.status === 'in_progress' && (
                              <div className="mb-2">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${task.progress * 100}%` }}
                                  />
                                </div>
                                <div className="text-xs text-blue-600 mt-1">
                                  Progress: {Math.round(task.progress * 100)}%
                                </div>
                              </div>
                            )}
                            
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatTimeAgo(task.createdAt)}
                              </div>
                              {task.duration && (
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatDuration(task.duration)}
                                </div>
                              )}
                            </div>
                            
                            {task.errorMessage && (
                              <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                                {task.errorMessage}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleTaskClick(task.taskId)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {task.result && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopyPost(task.result!.content)}
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Task Details */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Task Details</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedTask ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Task ID</h3>
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {selectedTask.task_id}
                      </code>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Status</h3>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(selectedTask.status)}
                        <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(selectedTask.status)}`}>
                          {selectedTask.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Progress</h3>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${selectedTask.progress * 100}%` }}
                        />
                      </div>
                      <div className="text-xs text-blue-600 mt-1">
                        {Math.round(selectedTask.progress * 100)}%
                      </div>
                    </div>
                    
                    {selectedTask.teams && selectedTask.teams.length > 0 && (
                      <DetailedStatus
                        teams={selectedTask.teams}
                        currentTeam={selectedTask.current_team}
                        phase={selectedTask.phase}
                        detailedStatus={selectedTask.detailed_status}
                        overallProgress={selectedTask.progress}
                      />
                    )}
                    
                    {selectedTask.result && (
                      <div>
                        <h3 className="font-medium mb-2">Generated Post</h3>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-sm mb-2 max-h-32 overflow-y-auto">
                            {selectedTask.result.content.substring(0, 300)}
                            {selectedTask.result.content.length > 300 && '...'}
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Words: {selectedTask.result.word_count}</span>
                            <span>Characters: {selectedTask.result.character_count}</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {selectedTask.error_message && (
                      <div>
                        <h3 className="font-medium mb-2">Error</h3>
                        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                          {selectedTask.error_message}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Click on a task to view details</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 