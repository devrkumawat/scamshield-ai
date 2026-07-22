import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState.jsx';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto glass-card">
      <EmptyState
        icon={Compass}
        title="Page not found"
        description="That page doesn't exist. Let's get you back to somewhere useful."
        action={<Link to="/" className="btn-secondary text-sm">Back to dashboard</Link>}
      />
    </div>
  );
}
