import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api";
import Card from "../components/ui/Card";

export default function PublicProfile() {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await api.get(`/api/book/users/${userId}/event-types`);
        setProfile(res.data);
      } catch (err) {
        setError("User not found or has no events");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-xl mx-auto mt-16 p-6 pb-8">
        <Card className="p-8 text-center bg-white shadow-xl shadow-gray-200/50">
          <h2 className="text-xl font-semibold text-text-primary mb-2">User Not Found</h2>
          <p className="text-sm text-text-secondary">
            The profile link you followed is invalid or has been removed.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 flex flex-col items-center">
      <div className="w-full max-w-3xl mt-12 mb-8 text-center shrink-0">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-white text-2xl font-semibold mb-4 shadow-sm">
          {profile.user.name.charAt(0).toUpperCase()}
        </div>
        <h1 className="text-2xl font-semibold text-text-primary mb-2">{profile.user.name}</h1>
        <p className="text-text-secondary">Welcome to my scheduling page. Please follow the instructions to add an event to my calendar.</p>
      </div>

      <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-4">
        {profile.eventTypes.length === 0 ? (
          <div className="col-span-full p-8 text-center text-text-secondary">
            No events available.
          </div>
        ) : (
          profile.eventTypes.map(et => (
            <Link key={et.id} to={`/book/${et.slug}`} className="block">
              <Card className="hover:border-primary transition-colors cursor-pointer p-6 flex flex-col h-full bg-white shadow-sm hover:shadow-md">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-4 h-4 rounded-full bg-primary" />
                  <h3 className="font-semibold text-text-primary text-lg">{et.name}</h3>
                </div>
                <div className="text-text-secondary text-sm flex items-center gap-1.5 mt-auto">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v6l4 2"/>
                  </svg>
                  {et.duration} mins
                </div>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}