import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import { AuthContext } from "../context/AuthContext";

const PlanDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("user: ", user);
    if (!user) return; // Wait for auth
    fetchPlan();
  }, [id, user]);

  const fetchPlan = async () => {
    try {
      console.log("fetching plan");
      const res = await api.get(`http://localhost:3000/plan/${id}`);
      setData(res.data);
    } catch (err) {
      alert("Error loading plan");
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    try {
      await api.post(`http://localhost:3000/plan/subscribe/${id}`);
      alert("Subscription Successful! You now have access.");
      fetchPlan(); // Reload to get full access data
    } catch (err) {
      alert("Subscription failed.");
    }
  };

  const handleFollow = async () => {
    try {
      await api.put(
        `http://localhost:3000/user/follow/${data.plan.trainer._id}`
      );
      alert("Followed Trainer!");
    } catch (err) {
      alert("Already following or error");
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!user)
    return (
      <div className="p-8">
        Please{" "}
        <a href="/login" className="text-blue-500">
          Login
        </a>{" "}
        to view details.
      </div>
    );

  const { plan, access } = data;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gray-800 p-6 text-white flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">{plan.title}</h1>
            <p className="opacity-80">By {plan.trainer.name}</p>
          </div>
          <div className="text-right">
            <button
              onClick={handleFollow}
              className="text-sm bg-gray-600 px-2 py-1 rounded hover:bg-gray-500 mb-2"
            >
              Follow Trainer
            </button>
            <p className="text-2xl font-bold text-green-400">${plan.price}</p>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-8">
          <div className="mb-6 flex gap-4">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
              Duration: {plan.duration}
            </span>
            {access ? (
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                ✓ Access Unlocked
              </span>
            ) : (
              <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
                Locked Content
              </span>
            )}
          </div>

          {access ? (
            <div className="prose max-w-none">
              <h3 className="text-xl font-bold mb-4">Full Plan Details</h3>
              <p className="whitespace-pre-wrap text-gray-700">
                {plan.description}
              </p>
              {/* Real app would render videos/files here */}
            </div>
          ) : (
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-10 text-center">
              <h3 className="text-2xl font-bold text-gray-400 mb-2">
                Content Locked
              </h3>
              <p className="text-gray-500 mb-6">{plan.description}</p>{" "}
              {/* Shows preview text */}
              <button
                onClick={handleSubscribe}
                className="bg-green-600 text-white text-lg px-8 py-3 rounded hover:bg-green-700 transition shadow-lg"
              >
                Unlock Full Access for ${plan.price}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlanDetails;
