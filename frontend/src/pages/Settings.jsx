import React, { useState, useEffect } from "react";
import authService from "../api/authService";
import { useNavigate } from "react-router-dom";
import {
  SettingsHeader,
  MessageAlert,
  PersonalInfoCard,
  SecurityCard,
  NotificationsCard,
  PreferencesCard,
  DangerZoneCard,
  EmailChangeModal,
  AccountDeletionModal,
} from "../components/settings";

const Settings = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [showEmailChangeModal, setShowEmailChangeModal] = useState(false);
  const [emailChangeData, setEmailChangeData] = useState({
    newEmail: "",
    verificationCode: "",
  });
  const [emailChangeStep, setEmailChangeStep] = useState(1); // 1: enter email, 2: verify code
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteVerificationCode, setDeleteVerificationCode] = useState("");

  // Profile form state
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Notification preferences
  const [notifications, setNotifications] = useState({
    email: true,
    taskReminders: true,
    teamUpdates: true,
  });

  // Load user data
  useEffect(() => {
    const loadUser = () => {
      const userData = localStorage.getItem("user");
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setProfileData({
          name: parsedUser.name || "",
          email: parsedUser.email || "",
        });
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  // Auto-dismiss messages after 5 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ type: "", text: "" });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Handle profile update (name only)
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const result = await authService.updateProfile({
        name: profileData.name,
      });

      // Update local storage
      const updatedUser = { ...user, name: result.user.name };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to update profile",
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" });
      setSaving(false);
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setMessage({
        type: "error",
        text: "Password must be at least 8 characters long",
      });
      setSaving(false);
      return;
    }

    try {
      await authService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setMessage({ type: "success", text: "Password changed successfully!" });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswordFields(false);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to change password",
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle notification toggle
  const handleNotificationToggle = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
    // TODO: Save to backend
  };

  // Handle email change request
  const handleRequestEmailChange = async () => {
    // Open modal to collect new email
    setEmailChangeStep(1);
    setShowEmailChangeModal(true);
    setEmailChangeData({ newEmail: "", verificationCode: "" });
  };

  // Handle sending verification code
  const handleSendVerificationCode = async (e) => {
    e.preventDefault();
    
    if (!emailChangeData.newEmail || emailChangeData.newEmail === user?.email) {
      setMessage({
        type: "error",
        text: "Please enter a different email address",
      });
      return;
    }

    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      await authService.requestEmailChange(emailChangeData.newEmail);
      setEmailChangeStep(2);
      setMessage({
        type: "success",
        text: "Verification code sent to new email!",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error.response?.data?.message || "Failed to send verification code",
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle email change verification
  const handleVerifyEmailChange = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const result = await authService.verifyEmailChange({
        verificationCode: parseInt(emailChangeData.verificationCode),
        newEmail: emailChangeData.newEmail,
      });

      // Update local storage
      const updatedUser = { ...user, email: result.user.email };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setProfileData({ ...profileData, email: result.user.email });

      setMessage({ type: "success", text: "Email updated successfully!" });
      setShowEmailChangeModal(false);
      setEmailChangeStep(1);
      setEmailChangeData({ newEmail: "", verificationCode: "" });
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to verify email change",
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle account deletion request
  const handleRequestAccountDeletion = async () => {
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      await authService.requestAccountDeletion();
      setShowDeleteModal(true);
      setMessage({
        type: "success",
        text: "Verification code sent to your email!",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error.response?.data?.message || "Failed to request account deletion",
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle account deletion verification
  const handleVerifyAndDeleteAccount = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      await authService.verifyAndDeleteAccount(
        parseInt(deleteVerificationCode)
      );

      // Clear all data and redirect to login
      localStorage.clear();
      sessionStorage.clear();
      navigate("/login");
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to delete account",
      });
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#E31B54] mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header with User Profile */}
      <SettingsHeader user={user} />

      {/* Message Alert */}
      {message.text && (
        <MessageAlert
          message={message}
          onClose={() => setMessage({ type: "", text: "" })}
        />
      )}

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information Card */}
        <PersonalInfoCard
          profileData={profileData}
          setProfileData={setProfileData}
          saving={saving}
          onSubmit={handleProfileUpdate}
          onRequestEmailChange={handleRequestEmailChange}
        />

        {/* Security Card */}
        <SecurityCard
          passwordData={passwordData}
          setPasswordData={setPasswordData}
          showPasswordFields={showPasswordFields}
          setShowPasswordFields={setShowPasswordFields}
          saving={saving}
          onSubmit={handlePasswordChange}
        />

        {/* Notifications Card */}
        <NotificationsCard
          notifications={notifications}
          onToggle={handleNotificationToggle}
        />

        {/* Preferences Card */}
        <PreferencesCard />

        {/* Danger Zone Card */}
        <DangerZoneCard
          saving={saving}
          onRequestAccountDeletion={handleRequestAccountDeletion}
        />
      </div>

      {/* Email Change Verification Modal */}
      <EmailChangeModal
        show={showEmailChangeModal}
        step={emailChangeStep}
        emailChangeData={emailChangeData}
        setEmailChangeData={setEmailChangeData}
        saving={saving}
        onClose={() => {
          setShowEmailChangeModal(false);
          setEmailChangeStep(1);
          setEmailChangeData({ newEmail: "", verificationCode: "" });
        }}
        onSendCode={handleSendVerificationCode}
        onVerify={handleVerifyEmailChange}
      />

      {/* Account Deletion Verification Modal */}
      <AccountDeletionModal
        show={showDeleteModal}
        user={user}
        verificationCode={deleteVerificationCode}
        setVerificationCode={setDeleteVerificationCode}
        saving={saving}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteVerificationCode("");
        }}
        onSubmit={handleVerifyAndDeleteAccount}
      />
    </div>
  );
};

export default Settings;
