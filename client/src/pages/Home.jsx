import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

const Home = () => {
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    api.get("http://localhost:3000/plan/all").then((res) => setPlans(res.data));
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Find Your Fitness Plan
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan._id}
            className="border rounded-lg shadow-sm hover:shadow-md transition bg-white p-5"
          >
            <h2 className="text-xl font-bold mb-2">{plan.title}</h2>
            <p className="text-gray-500 text-sm mb-4">
              Trainer: {plan.trainer.name}
            </p>

            <div className="flex justify-between items-center mt-4">
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                {plan.duration}
              </span>
              <span className="text-green-600 font-bold text-lg">
                ${plan.price}
              </span>
            </div>

            <Link
              to={`/plan/${plan._id}`}
              className="block w-full text-center mt-4 bg-gray-800 text-white py-2 rounded hover:bg-black"
            >
              View Details
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
