'use client';

import React, { useState } from 'react';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Eye, 
  FileText, 
  TrendingUp,
  Target,
  Star,
  Copy,
  Download,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import { verifyPost } from '@/lib/api-client';
import { PostVerificationRequest, PostVerificationResponse } from '@/types/api';
import toast from 'react-hot-toast';

export default function VerifyPage() {
  const [postContent, setPostContent] = useState('');
  const [paperTitle, setPaperTitle] = useState('');
  const [verificationType, setVerificationType] = useState<'technical' | 'style' | 'both'>('both');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<PostVerificationResponse | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const verificationTypeOptions = [
    { value: 'both', label: 'Technical & Style', description: 'Complete verification of accuracy and style' },
    { value: 'technical', label: 'Technical Only', description: 'Focus on technical accuracy and facts' },
    { value: 'style', label: 'Style Only', description: 'Focus on LinkedIn style and engagement' }
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!postContent.trim()) {
      newErrors.postContent = 'Post content is required';
    } else if (postContent.length < 50) {
      newErrors.postContent = 'Post content must be at least 50 characters';
    } else if (postContent.length > 3000) {
      newErrors.postContent = 'Post content must be less than 3000 characters';
    }
    
    if (!paperTitle.trim()) {
      newErrors.paperTitle = 'Paper title is required for context';
    } else if (paperTitle.length < 10) {
      newErrors.paperTitle = 'Paper title must be at least 10 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleVerify = async () => {
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const request: PostVerificationRequest = {
        post_content: postContent,
        paper_title: paperTitle,
        verification_type: verificationType
      };

      const response = await verifyPost(request);
      setVerificationResult(response);
      toast.success('Post verification completed!');
    } catch (error) {
      console.error('Error verifying post:', error);
      toast.error('Failed to verify post. Please try again.');
    } finally {
      setIsVerifying(false);
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

  const handleDownloadReport = () => {
    if (!verificationResult) return;

    const reportData = {
      verification_id: verificationResult.verification_id,
      paper_title: paperTitle,
      post_content: postContent,
      overall_rating: verificationResult.overall_rating,
      verification_report: verificationResult.verification_report,
      verified_at: verificationResult.verified_at
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `verification_report_${verificationResult.verification_id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Report downloaded successfully!');
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 0.8) return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (score >= 0.6) return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    return <AlertTriangle className="w-5 h-5 text-red-500" />;
  };

  const getRatingColor = (rating: string | undefined) => {
    if (!rating) return 'text-gray-600 bg-gray-50 border-gray-200';
    switch (rating) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
      case 'good': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'needs_improvement': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'poor': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRatingIcon = (rating: string | undefined) => {
    if (!rating) return <Eye className="w-4 h-4 text-gray-500" />;
    switch (rating) {
      case 'excellent': return <Star className="w-4 h-4 text-green-500" />;
      case 'good': return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'needs_improvement': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'poor': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <Eye className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">
            Post Verification
          </h1>
          <p className="text-muted-foreground">
            Verify the technical accuracy and style compliance of your LinkedIn posts
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Verification Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Post Verification</span>
              </CardTitle>
              <CardDescription>
                Submit your LinkedIn post for comprehensive verification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Paper Title *</label>
                <Input
                  value={paperTitle}
                  onChange={(e) => setPaperTitle(e.target.value)}
                  placeholder="e.g., Attention Is All You Need"
                  disabled={isVerifying}
                />
                {errors.paperTitle && (
                  <p className="text-red-500 text-xs mt-1">{errors.paperTitle}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Post Content *</label>
                <Textarea
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="Paste your LinkedIn post content here..."
                  rows={12}
                  disabled={isVerifying}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{postContent.length}/3000 characters</span>
                  <span>{postContent.split(/\s+/).filter(word => word.length > 0).length} words</span>
                </div>
                {errors.postContent && (
                  <p className="text-red-500 text-xs mt-1">{errors.postContent}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Verification Type</label>
                <div className="grid grid-cols-1 gap-2 mt-2">
                  {verificationTypeOptions.map((option) => (
                    <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="verificationType"
                        value={option.value}
                        checked={verificationType === option.value}
                        onChange={(e) => setVerificationType(e.target.value as 'technical' | 'style' | 'both')}
                        disabled={isVerifying}
                        className="w-4 h-4"
                      />
                      <div>
                        <div className="text-sm font-medium">{option.label}</div>
                        <div className="text-xs text-muted-foreground">{option.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleVerify}
                disabled={isVerifying || !postContent.trim() || !paperTitle.trim()}
                className="w-full"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Verify Post
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          {/* Verification Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Verification Results</span>
                {verificationResult && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadReport}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Report
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {verificationResult ? (
                <div className="space-y-6">
                  {/* Overall Rating */}
                  <Card className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium">Overall Rating</h3>
                      <div className="flex items-center gap-2">
                        {getRatingIcon(verificationResult.overall_rating)}
                        <span className={`text-xs px-2 py-1 rounded-full border ${getRatingColor(verificationResult.overall_rating)}`}>
                          {verificationResult.overall_rating?.replace('_', ' ') || 'Unknown'}
                        </span>
                      </div>
                    </div>
                    
                    {verificationResult.verification_report?.overall_score && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">Overall Score</span>
                          <span className={`text-sm font-medium ${getScoreColor(verificationResult.verification_report?.overall_score || 0)}`}>
                            {Math.round((verificationResult.verification_report?.overall_score || 0) * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-500 ${
                              (verificationResult.verification_report?.overall_score || 0) >= 0.8 ? 'bg-green-500' :
                              (verificationResult.verification_report?.overall_score || 0) >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${(verificationResult.verification_report?.overall_score || 0) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </Card>

                  {/* Technical Accuracy */}
                  {verificationResult.verification_report?.technical_accuracy && (
                    <Card className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          Technical Accuracy
                        </h3>
                        <div className="flex items-center gap-2">
                          {getScoreIcon(verificationResult.verification_report?.technical_accuracy?.score || 0)}
                          <span className={`text-sm font-medium ${getScoreColor(verificationResult.verification_report?.technical_accuracy?.score || 0)}`}>
                            {Math.round((verificationResult.verification_report?.technical_accuracy?.score || 0) * 100)}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            (verificationResult.verification_report?.technical_accuracy?.score || 0) >= 0.8 ? 'bg-green-500' :
                            (verificationResult.verification_report?.technical_accuracy?.score || 0) >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${(verificationResult.verification_report?.technical_accuracy?.score || 0) * 100}%` }}
                        />
                      </div>

                      {(verificationResult.verification_report?.technical_accuracy?.issues?.length || 0) > 0 && (
                        <div className="mb-3">
                          <h4 className="text-sm font-medium mb-2">Issues Found:</h4>
                          <ul className="text-sm space-y-1">
                            {verificationResult.verification_report?.technical_accuracy?.issues?.map((issue, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <AlertTriangle className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
                                <span className="text-red-700">{issue}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {(verificationResult.verification_report?.technical_accuracy?.suggestions?.length || 0) > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Suggestions:</h4>
                          <ul className="text-sm space-y-1">
                            {verificationResult.verification_report?.technical_accuracy?.suggestions?.map((suggestion, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-green-700">{suggestion}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </Card>
                  )}

                  {/* Style Compliance */}
                  {verificationResult.verification_report?.style_compliance && (
                    <Card className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          Style Compliance
                        </h3>
                        <div className="flex items-center gap-2">
                          {getScoreIcon(verificationResult.verification_report?.style_compliance?.score || 0)}
                          <span className={`text-sm font-medium ${getScoreColor(verificationResult.verification_report?.style_compliance?.score || 0)}`}>
                            {Math.round((verificationResult.verification_report?.style_compliance?.score || 0) * 100)}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            (verificationResult.verification_report?.style_compliance?.score || 0) >= 0.8 ? 'bg-green-500' :
                            (verificationResult.verification_report?.style_compliance?.score || 0) >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${(verificationResult.verification_report?.style_compliance?.score || 0) * 100}%` }}
                        />
                      </div>

                      {(verificationResult.verification_report?.style_compliance?.issues?.length || 0) > 0 && (
                        <div className="mb-3">
                          <h4 className="text-sm font-medium mb-2">Issues Found:</h4>
                          <ul className="text-sm space-y-1">
                            {verificationResult.verification_report?.style_compliance?.issues?.map((issue, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <AlertTriangle className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
                                <span className="text-red-700">{issue}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {(verificationResult.verification_report?.style_compliance?.suggestions?.length || 0) > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Suggestions:</h4>
                          <ul className="text-sm space-y-1">
                            {verificationResult.verification_report?.style_compliance?.suggestions?.map((suggestion, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-green-700">{suggestion}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </Card>
                  )}

                  {/* General Recommendations */}
                  {verificationResult.verification_report?.recommendations?.length > 0 && (
                    <Card className="p-4">
                      <h3 className="font-medium mb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        General Recommendations
                      </h3>
                      <ul className="text-sm space-y-2">
                        {verificationResult.verification_report?.recommendations?.map((recommendation, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <Star className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />
                            <span className="text-blue-700">{recommendation}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  )}

                  {/* Verified Post */}
                  <Card className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium">Verified Post</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyPost(verificationResult.post_content)}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                    <div className="p-3 bg-muted rounded-lg border">
                      <pre className="whitespace-pre-wrap text-sm text-foreground">
                        {verificationResult.post_content}
                      </pre>
                    </div>
                  </Card>

                  {/* Verification Details */}
                  <Card className="p-4">
                    <h3 className="font-medium mb-3">Verification Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Verification ID:</span>
                        <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">
                          {verificationResult.verification_id}
                        </code>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Verified At:</span>
                        <span>{new Date(verificationResult.verified_at).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Verification Type:</span>
                        <span className="capitalize">{verificationType?.replace('_', ' ') || 'both'}</span>
                      </div>
                    </div>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Submit your post for verification to see detailed results</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 