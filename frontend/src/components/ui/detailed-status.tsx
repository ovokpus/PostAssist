'use client';

import React from 'react';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Play, 
  Pause,
  Users,
  Brain,
  Search,
  FileText,
  ShieldCheck,
  Eye
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TeamProgress } from '@/types/api';

interface DetailedStatusProps {
  teams: TeamProgress[];
  currentTeam?: string;
  phase?: string;
  detailedStatus?: string;
  overallProgress: number;
}

const getAgentIcon = (agentName: string) => {
  switch (agentName) {
    case 'PaperResearcher':
      return <Search className="w-4 h-4" />;
    case 'LinkedInCreator':
      return <FileText className="w-4 h-4" />;
    case 'TechVerifier':
      return <ShieldCheck className="w-4 h-4" />;
    case 'StyleChecker':
      return <Eye className="w-4 h-4" />;
    default:
      return <Brain className="w-4 h-4" />;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'working':
      return <Play className="w-4 h-4 text-blue-500 animate-pulse" />;
    case 'error':
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    case 'idle':
    default:
      return <Pause className="w-4 h-4 text-gray-400" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'in_progress':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'working':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'failed':
    case 'error':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'pending':
    case 'idle':
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

const formatDuration = (startTime?: string, endTime?: string) => {
  if (!startTime) return 'Not started';
  
  const start = new Date(startTime);
  const end = endTime ? new Date(endTime) : new Date();
  const duration = Math.round((end.getTime() - start.getTime()) / 1000);
  
  if (duration < 60) return `${duration}s`;
  if (duration < 3600) return `${Math.round(duration / 60)}m`;
  return `${Math.round(duration / 3600)}h`;
};

export default function DetailedStatus({ 
  teams, 
  currentTeam, 
  phase, 
  detailedStatus, 
  overallProgress 
}: DetailedStatusProps) {
  return (
    <div className="space-y-6">
      {/* Current Status Overview */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Users className="w-5 h-5" />
            Generation Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-blue-800">Overall Progress</span>
              <span className="text-sm font-bold text-blue-900">{Math.round(overallProgress * 100)}%</span>
            </div>
            <div className="w-full bg-blue-100 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${overallProgress * 100}%` }}
              />
            </div>
            {phase && (
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <Clock className="w-4 h-4" />
                <span className="font-medium">Phase:</span>
                <span className="capitalize">{phase}</span>
              </div>
            )}
            {detailedStatus && (
              <div className="text-sm text-blue-800 font-medium">
                {detailedStatus}
              </div>
            )}
            {currentTeam && (
              <div className="text-xs text-blue-600">
                Active Team: <span className="font-semibold">{currentTeam}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Team Progress Details */}
      {teams.map((team) => (
        <Card 
          key={team.team_name} 
          className={`transition-all duration-300 ${
            team.team_name === currentTeam 
              ? 'ring-2 ring-blue-500 shadow-lg' 
              : 'hover:shadow-md'
          }`}
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span>{team.team_name}</span>
                <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(team.status)}`}>
                  {team.status.replace('_', ' ')}
                </span>
              </div>
              <div className="text-sm font-medium text-gray-600">
                {Math.round(team.progress * 100)}%
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Team Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${team.progress * 100}%` }}
                />
              </div>

              {/* Team Focus */}
              {team.current_focus && (
                <div className="text-sm text-gray-700">
                  <span className="font-medium">Focus:</span> {team.current_focus}
                </div>
              )}

              {/* Team Timing */}
              <div className="flex items-center gap-4 text-xs text-gray-500">
                {team.started_at && (
                  <span>Duration: {formatDuration(team.started_at, team.completed_at)}</span>
                )}
                {team.completed_at && (
                  <span className="text-green-600 font-medium">✓ Completed</span>
                )}
              </div>

              {/* Individual Agents */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-800">Team Members:</h4>
                {team.agents.map((agent) => (
                  <div 
                    key={agent.agent_name}
                    className={`p-3 rounded-lg border transition-all duration-200 ${getStatusColor(agent.status)}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getAgentIcon(agent.agent_name)}
                        <span className="font-medium text-sm">{agent.agent_name}</span>
                        {getStatusIcon(agent.status)}
                      </div>
                      <div className="text-xs font-medium">
                        {Math.round(agent.progress * 100)}%
                      </div>
                    </div>
                    
                    {/* Agent Progress Bar */}
                    <div className="w-full bg-white bg-opacity-50 rounded-full h-1.5 mb-2">
                      <div 
                        className="bg-current h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${agent.progress * 100}%` }}
                      />
                    </div>

                    {/* Agent Activity */}
                    {agent.current_activity && (
                      <div className="text-xs mb-1">
                        <span className="font-medium">Activity:</span> {agent.current_activity}
                      </div>
                    )}

                    {/* Agent Findings */}
                    {agent.findings && (
                      <div className="text-xs">
                        <span className="font-medium">Findings:</span> {agent.findings}
                      </div>
                    )}

                    {/* Agent Error */}
                    {agent.error_message && (
                      <div className="text-xs text-red-600 mt-1">
                        <span className="font-medium">Error:</span> {agent.error_message}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Team Findings */}
              {team.team_findings && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="text-sm">
                    <span className="font-medium text-green-800">Team Results:</span>
                    <p className="text-green-700 mt-1">{team.team_findings}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Empty State */}
      {teams.length === 0 && (
        <Card className="border-dashed border-gray-300">
          <CardContent className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No team activity yet. Generation will start soon...</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 