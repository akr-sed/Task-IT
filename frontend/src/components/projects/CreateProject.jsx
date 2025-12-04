import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { projectService } from '../../api';

const CreateProject = () => {
  const [formData, setFormData] = useState({
    name: "",
    displayName: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [focusedField, setFocusedField] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await projectService.createProject(formData);
      

      setTimeout(() => {
        navigate(`/projects/${data.data.project._id}`);
      }, 1500);
    } catch (err) {
      console.error("Error creating project:", err);
      setError(err.response?.data?.message || err.response?.data?.error || "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/projects")}
            className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all group"
          >
            <svg
              className="w-5 h-5 text-gray-600 group-hover:-translate-x-0.5 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Create New Project
            </h1>
            <p className="text-sm text-gray-600">Fill in the details below</p>
          </div>
        </div>
      </div>

      {/* Compact Card Layout */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
        {/* Error Message */}
        {error && (
          <div className="p-4 m-6 mb-0 bg-red-50 border-l-4 border-red-500 rounded-lg animate-shake">
            <div className="flex items-center gap-3">
              <svg
                className="w-5 h-5 text-red-500 flex-shrink-0"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-5">
              {/* Project Name Field */}
              <div>
                <label
                  htmlFor="name"
                  className="text-gray-700 font-semibold text-sm mb-2 flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4 text-[#E31B54]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                  Project Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  onFocus={() => setFocusedField("name")}
                  onBlur={() => setFocusedField("")}
                  className={`border-2 rounded-xl w-full h-12 px-4 focus:outline-none text-gray-900 transition-all ${
                    focusedField === "name"
                      ? "border-[#E31B54] shadow-sm"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  placeholder="my-awesome-project"
                  value={formData.name}
                  onChange={handleChange}
                />
                <p className="text-xs text-gray-500 mt-1.5">
                  Use lowercase, numbers, and hyphens
                </p>
              </div>

              {/* Display Name Field */}
              <div>
                <label
                  htmlFor="displayName"
                  className="text-gray-700 font-semibold text-sm mb-2 flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4 text-[#E31B54]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                    />
                  </svg>
                  Display Name
                </label>
                <input
                  type="text"
                  name="displayName"
                  id="displayName"
                  onFocus={() => setFocusedField("displayName")}
                  onBlur={() => setFocusedField("")}
                  className={`border-2 rounded-xl w-full h-12 px-4 focus:outline-none text-gray-900 transition-all ${
                    focusedField === "displayName"
                      ? "border-[#E31B54] shadow-sm"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  placeholder="My Awesome Project"
                  value={formData.displayName}
                  onChange={handleChange}
                />
                <p className="text-xs text-gray-500 mt-1.5">
                  A friendly name shown everywhere
                </p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-5">
              {/* Description Field */}
              <div>
                <label
                  htmlFor="description"
                  className=" text-gray-700 font-semibold text-sm mb-2 flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4 text-[#E31B54]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h7"
                    />
                  </svg>
                  Description
                </label>
                <textarea
                  name="description"
                  id="description"
                  rows="6"
                  onFocus={() => setFocusedField("description")}
                  onBlur={() => setFocusedField("")}
                  className={`border-2 rounded-xl w-full px-4 py-3 focus:outline-none text-gray-900 transition-all resize-none ${
                    focusedField === "description"
                      ? "border-[#E31B54] shadow-sm"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  placeholder="What's this project about? What are the goals?"
                  value={formData.description}
                  onChange={handleChange}
                />
                <p className="text-xs text-gray-500 mt-1.5">
                  Help your team understand the purpose
                </p>
              </div>
            </div>
          </div>

          {/* Pro Tip Banner */}
          <div className="mt-6 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-200">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[#E31B54] to-[#E91E63] rounded-lg flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">
                  💡 Quick Tip
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  After creating, you can add team members, create tasks, and
                  set up workflows
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={() => navigate("/projects")}
              className="flex-1 h-12 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all flex items-center justify-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 h-12 bg-gradient-to-r from-[#E31B54] to-[#E91E63] text-white font-bold rounded-xl hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 relative overflow-hidden group"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 group-hover:translate-x-full transition-all duration-700"></span>

              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating...
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Create Project
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
        }

        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default CreateProject;