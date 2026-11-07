import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { LearningTopic } from '../types';
import {
  GraduationCap,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  Code2,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  Award,
  Sparkles
} from 'lucide-react';

export const Learning: React.FC = () => {
  const [topics, setTopics] = useState<LearningTopic[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<string>('intro-buffer-overflow');
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submittedQuiz, setSubmittedQuiz] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const data = await api.getLearningTopics();
        setTopics(data);
        if (data.length > 0) {
          setSelectedTopicId(data[0].id);
        }
      } catch (err) {
        console.error('Failed to load learning topics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTopics();
  }, []);

  const activeTopic = topics.find((t) => t.id === selectedTopicId);

  const handleSelectOption = (quizId: number, optionIndex: number) => {
    if (submittedQuiz[quizId]) return;
    setSelectedAnswers((prev) => ({ ...prev, [quizId]: optionIndex }));
  };

  const handleCheckQuiz = async (quizId: number, correctIndex: number) => {
    setSubmittedQuiz((prev) => ({ ...prev, [quizId]: true }));
    const isCorrect = selectedAnswers[quizId] === correctIndex;
    if (activeTopic) {
      await api.updateTopicProgress(activeTopic.id, true, isCorrect ? 100 : 50);
      setTopics((prev) =>
        prev.map((t) => (t.id === activeTopic.id ? { ...t, completed: true } : t))
      );
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 text-xs text-cyan-400 font-semibold mb-1 uppercase tracking-wider">
          <GraduationCap className="w-4 h-4" />
          Interactive Cybersecurity Academy
        </div>
        <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">
          BufferGuard Learning Center
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Master C memory management, exploit mechanics, defensive programming, and modern compiler hardening.
        </p>
      </div>

      {/* Main Grid: Sidebar of Topics + Active Lesson Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Topics List */}
        <div className="lg:col-span-4 glass-panel p-4 rounded-2xl border border-slate-800 space-y-2 max-h-[750px] overflow-y-auto">
          <div className="text-xs font-bold text-slate-300 px-2 py-1 mb-1">
            Curriculum Modules ({topics.length}):
          </div>

          {topics.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setSelectedTopicId(t.id);
                setSelectedAnswers({});
                setSubmittedQuiz({});
              }}
              className={`w-full p-3 rounded-xl text-left border text-xs transition-all flex items-center justify-between group ${
                selectedTopicId === t.id
                  ? 'bg-cyan-950/80 border-cyan-500/80 text-cyan-300 shadow-sm shadow-cyan-950'
                  : 'bg-dark-800/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {t.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                ) : (
                  <BookOpen className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 flex-shrink-0" />
                )}
                <div>
                  <div className="font-semibold text-slate-200 line-clamp-1">{t.title}</div>
                  <div className="text-[10px] text-slate-400">{t.category} • {t.difficulty}</div>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400" />
            </button>
          ))}
        </div>

        {/* Right Active Lesson View */}
        <div className="lg:col-span-8 glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
          {activeTopic ? (
            <div className="space-y-6">
              {/* Lesson Header */}
              <div className="border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
                    {activeTopic.category}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                    {activeTopic.difficulty}
                  </span>
                  {activeTopic.completed && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
                      <Award className="w-3 h-3" /> Completed
                    </span>
                  )}
                </div>

                <h2 className="text-2xl font-bold text-slate-100">{activeTopic.title}</h2>
                <p className="text-xs text-slate-400 mt-1">{activeTopic.summary}</p>
              </div>

              {/* Lesson Body Content */}
              <div className="text-xs text-slate-300 leading-relaxed space-y-3 prose-invert whitespace-pre-line bg-dark-900/60 p-5 rounded-2xl border border-slate-800/80 font-sans">
                {activeTopic.content_markdown}
              </div>

              {/* Safe vs Unsafe Comparison Carousel */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Unsafe Example */}
                <div className="rounded-xl border border-rose-900/80 bg-rose-950/20 p-4 font-mono text-xs space-y-2">
                  <div className="font-bold text-rose-400 flex items-center gap-1.5 font-sans">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    Unsafe Pattern (Vulnerable):
                  </div>
                  <pre className="p-3 rounded-lg bg-dark-900 text-rose-300 overflow-x-auto text-[11px]">
                    <code>{activeTopic.c_example_unsafe}</code>
                  </pre>
                </div>

                {/* Safe Example */}
                <div className="rounded-xl border border-emerald-900/80 bg-emerald-950/20 p-4 font-mono text-xs space-y-2">
                  <div className="font-bold text-emerald-400 flex items-center gap-1.5 font-sans">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Hardened Defensive Implementation:
                  </div>
                  <pre className="p-3 rounded-lg bg-dark-900 text-emerald-300 overflow-x-auto text-[11px]">
                    <code>{activeTopic.c_example_safe}</code>
                  </pre>
                </div>
              </div>

              {/* Interactive Knowledge Quiz */}
              {activeTopic.quizzes && activeTopic.quizzes.length > 0 && (
                <div className="p-5 rounded-2xl bg-dark-900/90 border border-slate-800 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                    <HelpCircle className="w-4 h-4 text-cyan-400" />
                    Knowledge Check Quiz:
                  </div>

                  {activeTopic.quizzes.map((q) => {
                    const isSubmitted = submittedQuiz[q.id];
                    const chosenIdx = selectedAnswers[q.id];
                    const isRight = chosenIdx === q.correct_index;

                    return (
                      <div key={q.id} className="space-y-3 text-xs">
                        <p className="font-semibold text-slate-200">{q.question}</p>

                        <div className="space-y-2">
                          {q.options.map((opt, optIdx) => {
                            let btnStyle =
                              'bg-dark-800 border-slate-700 text-slate-300 hover:border-slate-600';

                            if (chosenIdx === optIdx) {
                              btnStyle =
                                'bg-cyan-950 text-cyan-300 border-cyan-500 ring-1 ring-cyan-500';
                            }

                            if (isSubmitted) {
                              if (optIdx === q.correct_index) {
                                btnStyle =
                                  'bg-emerald-950 text-emerald-300 border-emerald-500 font-bold';
                              } else if (chosenIdx === optIdx) {
                                btnStyle = 'bg-rose-950 text-rose-300 border-rose-500';
                              }
                            }

                            return (
                              <button
                                key={optIdx}
                                onClick={() => handleSelectOption(q.id, optIdx)}
                                className={`w-full p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${btnStyle}`}
                              >
                                <span className="w-5 h-5 rounded-full border border-slate-600 flex items-center justify-center text-[10px] font-mono">
                                  {String.fromCharCode(65 + optIdx)}
                                </span>
                                <span>{opt}</span>
                              </button>
                            );
                          })}
                        </div>

                        {!isSubmitted ? (
                          <button
                            onClick={() => handleCheckQuiz(q.id, q.correct_index)}
                            disabled={chosenIdx === undefined}
                            className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-slate-950 transition-all disabled:opacity-50"
                          >
                            Submit Answer
                          </button>
                        ) : (
                          <div
                            className={`p-3 rounded-xl border text-xs space-y-1 ${
                              isRight
                                ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                                : 'bg-rose-950/60 border-rose-800 text-rose-300'
                            }`}
                          >
                            <div className="font-bold flex items-center gap-1.5">
                              {isRight ? (
                                <>
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                  Correct! Well done.
                                </>
                              ) : (
                                <>
                                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                                  Incorrect. Let's review:
                                </>
                              )}
                            </div>
                            <p className="text-slate-300 text-[11px] leading-relaxed">
                              {q.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16 text-slate-400 text-xs">
              Select a lesson from the curriculum on the left to begin learning.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
