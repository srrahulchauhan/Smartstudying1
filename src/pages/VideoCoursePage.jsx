import React, { useState } from 'react';
import {
  Video,
  Search,
  BookOpen,
  ListTodo,
  ExternalLink,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { StatusBadge } from '../components/common/Badge';

export function VideoCoursePage() {
  const { subjects, topics, preparations } = useStudy();
  const [searchQuery, setSearchQuery] = useState('');

  // Group videos by Subject -> Topics
  // A subject might have its own videos, and its topics might have videos.
  
  // Filter logic based on search
  const matchesSearch = (text) => 
    text && text.toLowerCase().includes(searchQuery.toLowerCase());

  // Build the hierarchical data
  const videoContent = [];

  subjects.forEach(sub => {
    const subTopics = topics.filter(t => t.subjectId === sub.id);
    
    // Check if subject has videos or its topics have videos
    const subjectHasVideos = sub.videoLinks && sub.videoLinks.length > 0;
    const topicsWithVideos = subTopics.filter(t => t.videoLinks && t.videoLinks.length > 0);
    
    if (subjectHasVideos || topicsWithVideos.length > 0) {
      // Check search query
      const subjectMatches = matchesSearch(sub.name);
      
      const filteredTopics = topicsWithVideos.filter(t => 
        subjectMatches || matchesSearch(t.name) || 
        t.videoLinks.some(link => matchesSearch(link))
      );

      // If subject matches, include all topics with videos.
      // If subject doesn't match, only include matched topics.
      // If neither matches and subject has no videos matching, skip.
      
      const matchingTopicVideos = subjectMatches ? topicsWithVideos : filteredTopics;
      const subjectVideoLinksMatch = subjectHasVideos && (subjectMatches || sub.videoLinks.some(link => matchesSearch(link)));

      if (subjectVideoLinksMatch || matchingTopicVideos.length > 0) {
        videoContent.push({
          subject: sub,
          topics: matchingTopicVideos,
          showSubjectVideos: subjectVideoLinksMatch || (subjectMatches && subjectHasVideos),
        });
      }
    }
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6">
        <div>
          <div className="flex items-center gap-2">
            <Video className="text-brand-500" size={24} />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Video Course
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            All your video resources, courses, and tutorials organized in one place.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search videos, subjects, or topics..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-900 text-slate-900 dark:text-white outline-none focus:border-brand-500"
          />
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {videoContent.length === 0 ? (
          <div className="glass-card p-12 text-center text-slate-400 text-sm">
            {searchQuery 
              ? "No videos found matching your search." 
              : "No video links added yet. Add video URLs to your Subjects or Topics to see them here!"}
          </div>
        ) : (
          videoContent.map((item) => (
            <div key={item.subject.id} className="glass-card p-5 border-l-4" style={{ borderLeftColor: item.subject.color || '#6366f1' }}>
              
              {/* Subject Header */}
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <BookOpen size={18} className="text-slate-400" />
                    {item.subject.name}
                  </h2>
                  {item.subject.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {item.subject.description}
                    </p>
                  )}
                </div>
                <StatusBadge status={item.subject.status} size="xs" />
              </div>

              {/* Subject Level Videos */}
              {item.showSubjectVideos && (
                <div className="mb-5 bg-slate-50 dark:bg-dark-950/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wider flex items-center gap-1.5">
                    <Video size={14} className="text-brand-500" />
                    Subject Resources
                  </h3>
                  <div className="space-y-2">
                    {item.subject.videoLinks.map((link, idx) => (
                      <a 
                        key={`sub-${idx}`} 
                        href={link} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-700 hover:border-brand-400 hover:shadow-sm transition group"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/50 flex items-center justify-center shrink-0">
                            <span className="text-brand-600 dark:text-brand-400 text-xs">▶</span>
                          </div>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate group-hover:text-brand-600 dark:group-hover:text-brand-400">
                            {link}
                          </span>
                        </div>
                        <ExternalLink size={14} className="text-slate-400 group-hover:text-brand-500 shrink-0 ml-3" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Topic Level Videos */}
              {item.topics.length > 0 && (
                <div className="space-y-4 pl-2 sm:pl-6 border-l-2 border-slate-100 dark:border-slate-800 ml-2">
                  {item.topics.map((topic) => (
                    <div key={topic.id} className="relative">
                      {/* Line connector */}
                      <div className="absolute -left-6 sm:-left-10 top-4 w-4 sm:w-8 h-px bg-slate-200 dark:bg-slate-700" />
                      
                      <div className="bg-slate-50 dark:bg-dark-950/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800/60">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                            <ListTodo size={14} className="text-slate-400" />
                            {topic.name}
                          </h4>
                          <StatusBadge status={topic.status} size="xs" />
                        </div>
                        
                        <div className="space-y-2 pl-6">
                          {topic.videoLinks.map((link, idx) => (
                            <a 
                              key={`top-${topic.id}-${idx}`} 
                              href={link} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 hover:border-brand-400 transition group"
                            >
                              <div className="flex items-center gap-2.5 overflow-hidden">
                                <span className="text-[10px] text-brand-500 shrink-0">▶</span>
                                <span className="text-xs font-medium text-slate-600 dark:text-slate-400 truncate group-hover:text-brand-600 dark:group-hover:text-brand-400">
                                  {link}
                                </span>
                              </div>
                              <ExternalLink size={12} className="text-slate-400 opacity-0 group-hover:opacity-100 transition" />
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
