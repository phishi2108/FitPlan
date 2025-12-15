import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

const Feed = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        // This hits the route we created: router.get("/feed", ...)
        const res = await api.get("http://localhost:3000/plan/feed");
        console.log("res");
        setPlans(res.data);
      } catch (err) {
        console.error("Error loading feed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, []);

  if (loading) return <div className="p-8">Loading your feed...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-2 text-gray-800">
        Your Personalized Feed
      </h1>
      <p className="text-gray-500 mb-8">Plans from trainers you follow.</p>

      {plans.length === 0 ? (
        <div className="text-center p-10 bg-gray-50 rounded-lg border border-dashed">
          <p className="text-xl text-gray-500 mb-4">Your feed is empty!</p>
          <Link to="/" className="text-blue-600 font-bold hover:underline">
            Browse all plans to follow trainers.
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan._id}
              className="border rounded-lg shadow-sm hover:shadow-md transition bg-white p-5 relative overflow-hidden"
            >
              {/* Badge for Followed Content */}
              <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-2 py-1 rounded-bl">
                Followed Trainer
              </div>

              <h2 className="text-xl font-bold mb-2 mt-2">{plan.title}</h2>
              <p className="text-gray-500 text-sm mb-4">
                By {plan.trainer.name}
              </p>

              <div className="flex justify-between items-center mt-4">
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                  {plan.duration}
                </span>

                {/* Visual indicator if they already own it */}
                {plan.isPurchased ? (
                  <span className="text-green-600 font-bold text-sm">
                    ✓ Purchased
                  </span>
                ) : (
                  <span className="text-gray-700 font-bold">${plan.price}</span>
                )}
              </div>

              <Link
                to={`/plan/${plan._id}`}
                className="block w-full text-center mt-4 bg-gray-800 text-white py-2 rounded hover:bg-black"
              >
                {plan.isPurchased ? "View Plan" : "View Details"}
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Feed;
