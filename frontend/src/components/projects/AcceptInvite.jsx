import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { projectService } from '../../api';
import { getInitials, getRandomColor } from "../../utils/avatarUtils";

const AcceptInvite = () => {
  const { projectId, inviteId, code } = useParams();
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState("");
  const [invitation, setInvitation] = useState(null);
  const [success, setSuccess] = useState(false);
  const [declined, setDeclined] = useState(false);
  const [forbidden, setForbidden] = useState(false);
  const [declineLoading, setDeclineLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const verifyInvitation = async () => {
      try {
        // First, try to fetch invitation details (works without auth)
        const response = await projectService.getInvitation(projectId, inviteId);
        const invitationData = response.data.invitation;
        setInvitation(invitationData);

        const token = localStorage.getItem("token");

        if (!token) {
          // Not logged in - show invitation preview
          // Store context for signup/login
          localStorage.setItem("pendingInvitation", JSON.stringify({
            projectId,
            inviteId,
            code,
            invitedEmail: invitationData.invitedEmail,
            projectName: invitationData.projectName
          }));
          setVerifying(false);
          return;
        }

        // User is logged in - verify authorization using userId priority matching
        const userResponse = JSON.parse(localStorage.getItem("user"));
        console.log(userResponse)
        const currentUserId = userResponse.id;
        const currentUserEmail = userResponse.email;

        // Priority 1: If invitedUserId is set, match by userId (handles email change)
        console.log(invitationData)
        console.log(currentUserId)
        if (invitationData.invitedUserId) {
          if (invitationData.invitedUserId !== currentUserId) {
            console.log("User not authorized - userId mismatch");
            setForbidden(true);
            setError(
              "You are not authorized to view this invitation. It was sent to a different account."
            );
            setVerifying(false);
            return;
          }
          // UserId matches - allow even if email changed
        } else {
          // Priority 2: If only email is set (non-registered user invited), check email
          if (invitationData.invitedEmail !== currentUserEmail) {
            console.log("User not authorized - email mismatch");
            setForbidden(true);
            setError(
              "You are not authorized to view this invitation. It was sent to a different email address."
            );
            setVerifying(false);
            return;
          }
        }

        setVerifying(false);
      } catch (error) {
        console.error("Error verifying invitation:", error);
        setError(
          error.response?.data?.message || "Invalid or expired invitation link"
        );
        setVerifying(false);
      }
    };

    const checkPostLogin = () => {
      const justLoggedIn = sessionStorage.getItem("justLoggedIn");
      if (justLoggedIn === "true") {
        sessionStorage.removeItem("justLoggedIn");
        verifyInvitation();
      } else {
        verifyInvitation();
      }
    };

    checkPostLogin();
  }, [projectId, inviteId, code, navigate, forbidden]);

  const handleAcceptInvite = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        const invitationUrl = `/projects/${projectId}/invite/${inviteId}/${code}`;
        localStorage.setItem("redirectAfterLogin", invitationUrl);
        navigate("/login", {
          state: { message: "Please log in to accept the invitation" },
        });
        return;
      }

      await projectService.acceptInvitation(projectId, inviteId, code);

      setSuccess(true);

      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to accept invitation");
    } finally {
      setLoading(false);
    }
  };

  const handleDeclineInvite = async () => {
    setDeclineLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login", {
          state: { message: "Please log in to decline this invitation" },
        });
        return;
      }

      await projectService.declineInvitation(projectId, inviteId, code);

      setDeclined(true);

      setTimeout(() => {
        navigate("/dashboard", {
          state: {
            message: `You have declined the invitation to join ${invitation?.projectName}`,
          },
        });
      }, 2000);
    } catch (error) {
      console.error("Error declining invitation:", error);
      setError(error.response?.data?.message || "Failed to decline invitation");
    } finally {
      setDeclineLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFF5F8] via-white to-[#FFF0F5] flex items-center justify-center p-4 relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#E31B54] rounded-full opacity-5 blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#E91E63] rounded-full opacity-5 blur-3xl"></div>

        <div className="bg-white rounded-[35px] shadow-2xl p-12 max-w-md w-full text-center border-2 border-gray-100 relative z-10">
          <div className="w-20 h-20 bg-gradient-to-br from-[#E31B54] to-[#E91E63] rounded-full flex items-center justify-center mx-auto mb-6 relative">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-white"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#E31B54] to-[#E91E63] animate-pulse opacity-50"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Verifying Invitation
          </h2>
          <p className="text-gray-600">
            Please wait while we verify your invitation...
          </p>
        </div>
      </div>
    );
  }

  // Not logged in but have invitation details - show preview and signup/login options
  if (!localStorage.getItem("token") && invitation && !error && !forbidden) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFF5F8] via-white to-[#FFF0F5] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#E31B54] rounded-full opacity-5 blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#E91E63] rounded-full opacity-5 blur-3xl"></div>

        <div className="bg-white rounded-[35px] shadow-2xl p-12 max-w-lg w-full border-2 border-[#E31B54]/20 relative z-10">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-[#E31B54] to-[#E91E63] rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              You've Been Invited!
            </h2>
            <p className="text-gray-600 mb-6">
              {invitation.inviterName} invited you to join
            </p>
            <div className="bg-[#FFF5F8] rounded-2xl p-6 mb-6">
              <h3 className="text-2xl font-bold text-[#E31B54] mb-2">
                {invitation.projectName}
              </h3>
              <p className="text-sm text-gray-600">
                Invitation sent to: <span className="font-semibold">{invitation.invitedEmail}</span>
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => {
                navigate("/signup", {
                  state: {
                    invitedEmail: invitation.invitedEmail,
                    projectName: invitation.projectName
                  }
                });
              }}
              className="w-full h-14 bg-gradient-to-r from-[#E31B54] to-[#E91E63] text-white rounded-full font-semibold hover:shadow-xl hover:scale-105 transition-all"
            >
              Sign Up to Accept
            </button>
            
            <button
              onClick={() => {
                const invitationUrl = `/projects/${projectId}/invite/${inviteId}/${code}`;
                localStorage.setItem("redirectAfterLogin", invitationUrl);
                navigate("/login", {
                  state: {
                    message: `Please log in with ${invitation.invitedEmail} to accept this invitation`
                  }
                });
              }}
              className="w-full h-14 border-2 border-[#E31B54] text-[#E31B54] rounded-full font-semibold hover:bg-[#E31B54] hover:text-white transition-all"
            >
              Already Have an Account? Log In
            </button>
          </div>

          <p className="text-sm text-gray-500 text-center mt-6">
            💡 Make sure to sign up or log in with <strong>{invitation.invitedEmail}</strong> to accept this invitation.
          </p>
        </div>
      </div>
    );
  }

  if (error || forbidden) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFF5F8] via-white to-[#FFF0F5] flex items-center justify-center p-4 relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-500 rounded-full opacity-5 blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-red-600 rounded-full opacity-5 blur-3xl"></div>

        <div className="bg-white rounded-[35px] shadow-2xl p-12 max-w-md w-full text-center border-2 border-red-200 relative z-10">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <svg
              className="w-10 h-10 text-red-600"
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
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            {forbidden ? "Access Forbidden" : "Invitation Error"}
          </h2>
          <p className="text-gray-600 mb-8">{error}</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full h-14 bg-gradient-to-r from-[#E31B54] to-[#E91E63] text-white rounded-full font-semibold hover:shadow-xl hover:scale-105 transition-all"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF5F8] via-white to-[#FFF0F5] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#E31B54] rounded-full opacity-5 blur-3xl animate-float"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#E91E63] rounded-full opacity-5 blur-3xl animate-float-delayed"></div>

      {/* Floating Icons */}
      <div className="absolute top-20 left-20 opacity-10 animate-float">
        <svg
          className="w-16 h-16 text-[#E31B54]"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
        </svg>
      </div>
      <div className="absolute bottom-20 right-20 opacity-10 animate-float-delayed">
        <svg
          className="w-20 h-20 text-[#E91E63]"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
        </svg>
      </div>

      <div className="max-w-lg w-full relative z-10">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-block">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-[#E31B54] to-[#E91E63] bg-clip-text text-transparent mb-2">
              TaskIT
            </h1>
            <div className="h-1 bg-gradient-to-r from-[#E31B54] to-[#E91E63] rounded-full"></div>
          </div>
          <p className="text-gray-600 mt-4 text-lg font-medium">
            Project Invitation
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-[35px] shadow-2xl border-2 border-gray-100 overflow-hidden">
          {success ? (
            <div className="p-12">
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-scale-in shadow-lg">
                <svg
                  className="w-12 h-12 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">
                Welcome Aboard! 🎉
              </h2>
              <p className="text-gray-600 text-center text-lg mb-2">
                You've successfully joined
              </p>
              <p className="text-2xl font-bold bg-gradient-to-r from-[#E31B54] to-[#E91E63] bg-clip-text text-transparent text-center mb-6">
                {invitation?.projectName}
              </p>
              <div className="flex items-center justify-center gap-2 text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[#E31B54]"></div>
                <span className="text-sm">Redirecting to dashboard...</span>
              </div>
            </div>
          ) : declined ? (
            <div className="p-12">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-scale-in shadow-lg">
                <svg
                  className="w-12 h-12 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">
                Invitation Declined
              </h2>
              <p className="text-gray-600 text-center text-lg mb-2">
                You've declined the invitation to join
              </p>
              <p className="text-xl font-bold text-gray-700 text-center mb-6">
                {invitation?.projectName}
              </p>
              <div className="flex items-center justify-center gap-2 text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-600"></div>
                <span className="text-sm">Redirecting to dashboard...</span>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="bg-gradient-to-r from-[#E31B54] to-[#E91E63] p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
                <div className="relative z-10 text-center">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-10 h-10 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    You're Invited!
                  </h3>
                </div>
              </div>

              {/* Body */}
              <div className="p-8">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 mb-6 border-2 border-gray-200">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br ${getRandomColor(
                        invitation?.inviterId
                      )} rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0`}
                    >
                      {getInitials(invitation?.inviterName)}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-600 text-sm mb-2">
                        <span className="font-bold text-gray-900">
                          {invitation?.inviterName}
                        </span>{" "}
                        invited you to join
                      </p>
                      <p className="text-xl font-bold text-gray-900 mb-1">
                        {invitation?.projectName}
                      </p>
                      <p className="text-sm text-gray-500">
                        Project Collaboration
                      </p>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg animate-shake">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <div className="space-y-3">
                  <button
                    onClick={handleAcceptInvite}
                    disabled={loading || declineLoading}
                    className="w-full h-14 bg-gradient-to-r from-[#E31B54] to-[#E91E63] text-white rounded-full font-bold hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative overflow-hidden group"
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
                        <span>Processing...</span>
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
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Accept Invitation
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleDeclineInvite}
                    disabled={loading || declineLoading}
                    className="w-full h-14 bg-white border-2 border-gray-300 text-gray-700 rounded-full font-bold hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {declineLoading ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5"
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
                        <span>Declining...</span>
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
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                        Decline Invitation
                      </>
                    )}
                  </button>
                </div>

                <p className="text-center text-xs text-gray-500 mt-6">
                  By accepting, you'll get access to project resources and
                  collaborate with the team
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-sm text-gray-600 hover:text-[#E31B54] font-medium transition-colors inline-flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
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
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes float-delayed {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-15px) rotate(5deg);
          }
        }

        @keyframes scale-in {
          0% {
            transform: scale(0);
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
          }
        }

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

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }

        .animate-scale-in {
          animation: scale-in 0.5s ease-out;
        }

        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default AcceptInvite;
