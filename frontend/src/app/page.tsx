'use client';

import React, { useState } from 'react';
import { 
  Zap, 
  FileText, 
  Target, 
  MessageSquare, 
  CheckCircle, 
  Clock,
  Share2,
  Copy,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import { generatePost, pollTaskStatus } from '@/lib/api-client';
import { PostForm, PostStatusResponse, LinkedInPost } from '@/types/api';
import toast from 'react-hot-toast';

export default function HomePage() {
  const [form, setForm] = useState<PostForm>({
    paperTitle: '',
    additionalContext: '',
    targetAudience: 'professional',
    tone: 'professional',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState('');
  const [progress, setProgress] = useState(0);
  const [generatedPost, setGeneratedPost] = useState<LinkedInPost | null>(null);
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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!form.paperTitle.trim()) {
      newErrors.paperTitle = 'Paper title is required';
    } else if (form.paperTitle.length < 10) {
      newErrors.paperTitle = 'Paper title must be at least 10 characters';
    }
    
    if (form.additionalContext.length > 500) {
      newErrors.additionalContext = 'Additional context must be less than 500 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    setIsGenerating(true);
    setGeneratedPost(null);
    setCurrentStep('Initializing generation...');
    setProgress(0);
    
    try {
      const response = await generatePost({
        paper_title: form.paperTitle,
        additional_context: form.additionalContext || undefined,
        target_audience: form.targetAudience,
        tone: form.tone,
      });
      
      toast.success('Post generation started!');
      
      // Start polling for status
      await pollTaskStatus(
        response.task_id,
        (statusResponse: PostStatusResponse) => {
          setCurrentStep(statusResponse.status.current_step);
          setProgress(statusResponse.status.progress);
          
          if (statusResponse.status.status === 'completed' && statusResponse.result) {
            setGeneratedPost(statusResponse.result);
            toast.success('Post generated successfully!');
          } else if (statusResponse.status.status === 'failed') {
            toast.error(statusResponse.status.error_message || 'Generation failed');
          }
        }
      );
    } catch (error) {
      console.error('Error generating post:', error);
      toast.error('Failed to generate post. Please try again.');
    } finally {
      setIsGenerating(false);
      setCurrentStep('');
      setProgress(0);
    }
  };

  const handleCopyPost = async () => {
    if (!generatedPost) return;
    
    try {
      await navigator.clipboard.writeText(generatedPost.content);
      toast.success('Post copied to clipboard!');
    } catch {
      toast.error('Failed to copy post');
    }
  };

  const handleShareLinkedIn = () => {
    if (!generatedPost) return;
    
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`;
    window.open(linkedInUrl, '_blank');
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="flex justify-center items-center space-x-2">
            <Zap className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold gradient-text">PostAssist</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Generate engaging LinkedIn posts about machine learning papers with AI-powered multi-agent verification
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Generation Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Generate LinkedIn Post</span>
              </CardTitle>
              <CardDescription>
                Enter details about your machine learning paper to generate an engaging LinkedIn post
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  label="Paper Title"
                  placeholder="e.g., Attention Is All You Need"
                  value={form.paperTitle}
                  onChange={(e) => setForm({ ...form, paperTitle: e.target.value })}
                  error={errors.paperTitle}
                  required
                  disabled={isGenerating}
                />

                <Textarea
                  label="Additional Context (Optional)"
                  placeholder="e.g., Focus on practical applications, mention specific use cases..."
                  value={form.additionalContext}
                  onChange={(e) => setForm({ ...form, additionalContext: e.target.value })}
                  error={errors.additionalContext}
                  helperText={`${form.additionalContext.length}/500 characters`}
                  maxLength={500}
                  disabled={isGenerating}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Target Audience"
                    value={form.targetAudience}
                    onChange={(e) => setForm({ ...form, targetAudience: e.target.value as PostForm['targetAudience'] })}
                    options={targetAudienceOptions}
                    disabled={isGenerating}
                  />

                  <Select
                    label="Tone"
                    value={form.tone}
                    onChange={(e) => setForm({ ...form, tone: e.target.value as PostForm['tone'] })}
                    options={toneOptions}
                    disabled={isGenerating}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  loading={isGenerating}
                  leftIcon={!isGenerating ? <Zap className="h-4 w-4" /> : undefined}
                >
                  {isGenerating ? 'Generating Post...' : 'Generate LinkedIn Post'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Status & Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Generated Post</span>
              </CardTitle>
              <CardDescription>
                {isGenerating ? 'Generating your LinkedIn post...' : 'Your AI-generated LinkedIn post will appear here'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isGenerating && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-primary animate-spin" />
                    <span className="text-sm text-muted-foreground">{currentStep}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">{progress}% complete</p>
                </div>
              )}

              {generatedPost && (
                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <pre className="whitespace-pre-wrap text-sm text-foreground font-medium">
                      {generatedPost.content}
                    </pre>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Hashtags:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {generatedPost.hashtags.map((hashtag, index) => (
                        <span key={index} className="px-2 py-1 bg-primary/10 text-primary rounded text-sm">
                          {hashtag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Characters: {generatedPost.character_count}</span>
                    <span>Est. Reach: {generatedPost.estimated_reach.toLocaleString()}</span>
                  </div>
                </div>
              )}

              {!isGenerating && !generatedPost && (
                                 <div className="text-center py-8">
                   <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                   <p className="text-muted-foreground">
                     Fill out the form and click &quot;Generate&quot; to create your LinkedIn post
                   </p>
                 </div>
              )}
            </CardContent>
            
            {generatedPost && (
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={handleCopyPost}
                  leftIcon={<Copy className="h-4 w-4" />}
                >
                  Copy Post
                </Button>
                <Button
                  onClick={handleShareLinkedIn}
                  leftIcon={<Share2 className="h-4 w-4" />}
                  rightIcon={<ExternalLink className="h-4 w-4" />}
                >
                  Share on LinkedIn
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card padding="sm">
            <CardContent className="text-center space-y-2">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto" />
              <h3 className="font-semibold">Multi-Agent Verification</h3>
              <p className="text-sm text-muted-foreground">
                Technical accuracy and style verification by specialized AI agents
              </p>
            </CardContent>
          </Card>
          
          <Card padding="sm">
            <CardContent className="text-center space-y-2">
              <Target className="h-8 w-8 text-blue-500 mx-auto" />
              <h3 className="font-semibold">LinkedIn Optimized</h3>
              <p className="text-sm text-muted-foreground">
                Optimized for LinkedIn engagement with proper hashtags and formatting
              </p>
            </CardContent>
          </Card>
          
          <Card padding="sm">
            <CardContent className="text-center space-y-2">
              <Zap className="h-8 w-8 text-yellow-500 mx-auto" />
              <h3 className="font-semibold">Real-time Generation</h3>
              <p className="text-sm text-muted-foreground">
                Watch your post being generated in real-time with progress updates
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
