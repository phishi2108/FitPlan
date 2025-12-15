import { useEffect, useState } from "react";
import api from "../api";

const TrainerDashboard = () => {
  const [plans, setPlans] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    duration: "",
  });
  const [isCreating, setIsCreating] = useState(false);

  // Helper function: Assuming backend has a route to get MY plans.
  // If not, we filter client side or add `router.get('/myplans')` to backend
  // For this demo, we'll fetch ALL and filter by current user logic or just use feed.
  // Ideally, Backend should have: router.get('/myplans', auth, ...)
  const fetchMyPlans = async () => {
    // Note: You might need to add a "Get My Plans" route to backend for perfect filtering
    // Reusing "/all" for simplicity in this demo, but strictly should be filtered
    const res = await api.get("/plans/all");
    setPlans(res.data);
  };

  useEffect(() => {
    fetchMyPlans();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/plans/createplan", form);
      alert("Plan Created!");
      setIsCreating(false);
      fetchMyPlans();
    } catch (err) {
      alert("Error creating plan");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this plan?")) return;
    try {
      await api.delete(`/plans/deleteplan/${id}`);
      fetchMyPlans();
    } catch (err) {
      alert("Error deleting plan");
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Trainer Dashboard</h1>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {isCreating ? "Cancel" : "+ Create New Plan"}
        </button>
      </div>

      {isCreating && (
        <form
          onSubmit={handleSubmit}
          className="bg-gray-100 p-6 rounded mb-8 shadow-inner"
        >
          <div className="grid grid-cols-2 gap-4 mb-4">
            <input
              placeholder="Title"
              className="p-2 border rounded"
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
            <input
              placeholder="Price"
              type="number"
              className="p-2 border rounded"
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
            />
            <input
              placeholder="Duration (e.g. 30 Days)"
              className="p-2 border rounded"
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
              required
            />
          </div>
          <textarea
            placeholder="Description"
            className="w-full p-2 border rounded mb-4"
            rows="4"
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          ></textarea>
          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-2 rounded"
          >
            Publish Plan
          </button>
        </form>
      )}

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-4 text-left">Title</th>
              <th className="p-4 text-left">Price</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((plan) => (
              <tr key={plan._id} className="border-t">
                <td className="p-4">{plan.title}</td>
                <td className="p-4">${plan.price}</td>
                <td className="p-4">
                  <button
                    onClick={() => handleDelete(plan._id)}
                    className="text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TrainerDashboard;
