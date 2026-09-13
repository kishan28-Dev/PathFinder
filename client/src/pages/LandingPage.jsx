import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import {
  ClipboardCheck,
  Sparkles,
  Map,
  TrendingUp,
  Target,
  BookOpen,
  MessageCircle,
  RefreshCw,
  ArrowRight,
  Layers,
} from 'lucide-react';
import PublicNavbar from '../components/layout/PublicNavbar';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getCareers } from '../services/careerApi';

const STEPS = [
  { icon: Target, title: 'Choose Your Goal', description: 'Pick the career or skill you want to build toward, or let AI help you decide.' },
  { icon: ClipboardCheck, title: 'Assess Your Skills', description: 'Take an AI-generated assessment that reflects what you actually know today.' },
  { icon: Map, title: 'Get Your Personalized Roadmap', description: 'Receive a phased learning path built around your real skill gaps, not a generic list.' },
  { icon: TrendingUp, title: 'Learn & Track Progress', description: 'Work through free resources and projects while your progress and streak update in real time.' },
];

const FEATURES = [
  { icon: ClipboardCheck, title: 'AI Skill Assessment', description: 'Adaptive, mixed-format questions that measure real understanding, not memorization.' },
  { icon: Map, title: 'Personalized Roadmaps', description: 'A phased learning path generated from your specific starting point and goal.' },
  { icon: Layers, title: 'Skill Gap Analysis', description: 'See exactly which skills are strong, which need work, and which are missing.' },
  { icon: BookOpen, title: 'Free Course Recommendations', description: 'Real, verified free resources ranked for your current skill gap and preferences.' },
  { icon: Sparkles, title: 'Project-Based Learning', description: 'Every phase ends in a hands-on project that proves what you learned.' },
  { icon: MessageCircle, title: 'AI Career Mentor', description: 'Ask questions about your roadmap, get unstuck, and get guidance tailored to your progress.' },
  { icon: TrendingUp, title: 'Progress Tracking', description: 'Track completed topics, projects, and your learning streak over time.' },
  { icon: RefreshCw, title: 'Continuous Reassessment', description: 'Retake assessments as you learn and watch your roadmap adapt to your growth.' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();
  const [careers, setCareers] = useState([]);
  const [careersLoading, setCareersLoading] = useState(true);

  useEffect(() => {
    getCareers()
      .then(setCareers)
      .catch(() => setCareers([]))
      .finally(() => setCareersLoading(false));
  }, []);

  const handlePrimaryCta = () => navigate(isSignedIn ? '/dashboard' : '/sign-up');

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/70 to-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
              <Sparkles className="h-3.5 w-3.5" /> Personalized, not generic
            </span>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Build a Career Path That Starts With You.
            </h1>
            <p className="mt-6 text-lg text-slate-600">
              CareerPath AI assesses what you already know, identifies your skill gaps, and creates a personalized
              learning roadmap with the best free resources.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" onClick={handlePrimaryCta} className="w-full sm:w-auto">
                Build My Roadmap <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="secondary" onClick={() => document.getElementById('careers')?.scrollIntoView({ behavior: 'smooth' })} className="w-full sm:w-auto">
                Explore Careers
              </Button>
            </div>
          </div>

          <div className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { icon: ClipboardCheck, label: 'Skill Assessment' },
              { icon: Sparkles, label: 'AI Analysis' },
              { icon: Map, label: 'Roadmap' },
              { icon: TrendingUp, label: 'Progress' },
            ].map(({ icon: Icon, label }) => (
              <Card key={label} className="flex flex-col items-center gap-2 py-6 text-center">
                <Icon className="h-6 w-6 text-brand-600" />
                <span className="text-sm font-medium text-slate-700">{label}</span>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-slate-900">How It Works</h2>
          <p className="mt-3 text-slate-600">Four steps from "I don't know where to start" to a plan you can actually follow.</p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, idx) => (
            <Card key={step.title} className="relative">
              <span className="text-xs font-bold text-brand-600">STEP {idx + 1}</span>
              <div className="mt-3 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <step.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-1.5 text-sm text-slate-500">{step.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-slate-900">Everything you need to learn with intent</h2>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <Card key={f.title}>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold text-slate-900">{f.title}</h3>
                <p className="mt-1.5 text-sm text-slate-500">{f.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Career Paths */}
      <section id="careers" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-slate-900">Explore Career Paths</h2>
          <p className="mt-3 text-slate-600">A growing catalog of real, in-demand careers — each with its own required skills and roadmap.</p>
        </div>

        {careersLoading ? (
          <LoadingSpinner className="mt-12" label="Loading careers..." />
        ) : (
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {careers.map((career) => (
              <Card key={career._id} className="flex flex-col">
                <h3 className="font-semibold text-slate-900">{career.name}</h3>
                <p className="mt-1.5 flex-1 text-sm text-slate-500">{career.description}</p>
                <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                  <span className="capitalize">{career.difficulty?.replace('-', ' ')}</span>
                  <span>{career.estimatedLearningDuration}</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="bg-brand-600">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white">Stop guessing what to learn. Start learning what you actually need.</h2>
          <div className="mt-8">
            <Button size="lg" variant="secondary" onClick={handlePrimaryCta}>
              Build My Roadmap <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-400">
        © {new Date().getFullYear()} CareerPath AI. Built to help you learn with intent.
      </footer>
    </div>
  );
}
