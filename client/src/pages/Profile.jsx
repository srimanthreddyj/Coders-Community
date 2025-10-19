import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import { useAuth } from "../auth/AuthContext"; // Assuming this hook provides current user info
import styles from "./Profile.module.css";

const Profile = () => {
  const { username } = useParams();
  const { user: currentUser } = useAuth(); // Assuming useAuth() returns { user, ... }

  const [profile, setProfile] = useState(null);
  const [originalHandles, setOriginalHandles] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [handles, setHandles] = useState({
    leetcode: "",
    codeforces: "",
    codechef: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");

  const isOwnProfile = currentUser && currentUser.username === username;

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/users/${username}`);
      setProfile(response.data);
      setOriginalHandles(response.data.codingHandles || {});
      setHandles(response.data.codingHandles || {});
    } catch (err) {
      setError("User not found or failed to fetch profile.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleHandleChange = (platform, value) => {
    setHandles((prev) => ({ ...prev, [platform]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess("");
    try {
      const response = await api.put("/users/me", { codingHandles: handles });
      setProfile(response.data);
      setIsEditing(false);
      setSuccess("Profile updated successfully!");
    } catch (err) {
      setError("Failed to update profile.");
      console.error(err);
    }
  };

  const handleCancel = () => {
    setHandles(originalHandles);
    setIsEditing(false);
  };

  if (loading) {
    return <div className={styles.message}>Loading profile...</div>;
  }

  if (error) {
    return <div className={`${styles.message} ${styles.error}`}>{error}</div>;
  }

  if (!profile) {
    return null;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>{profile.username}'s Profile</h1>
      {success && <div className={styles.successMessage}>{success}</div>}

      <div className={styles.profileCard}>
        <div className={styles.infoSection}>
          <p><strong>Email:</strong> {profile.email}</p>
        </div>

        <h2 className={styles.subHeader}>Coding Handles</h2>
        {isEditing ? (
          <form onSubmit={handleSave}>
            <div className={styles.formGroup}>
              <label>LeetCode</label>
              <input
                type="text"
                className={styles.formControl}
                value={handles.leetcode || ""}
                onChange={(e) => handleHandleChange("leetcode", e.target.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Codeforces</label>
              <input
                type="text"
                className={styles.formControl}
                value={handles.codeforces || ""}
                onChange={(e) => handleHandleChange("codeforces", e.target.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <label>CodeChef</label>
              <input
                type="text"
                className={styles.formControl}
                value={handles.codechef || ""}
                onChange={(e) => handleHandleChange("codechef", e.target.value)}
              />
            </div>
            <div className={styles.buttonGroup}>
              <button type="submit" className={styles.button}>Save Changes</button>
              <button type="button" className={`${styles.button} ${styles.secondaryButton}`} onClick={handleCancel}>Cancel</button>
            </div>
          </form>
        ) : (
          <div className={styles.handlesSection}>
            <p><strong>LeetCode:</strong> {handles.leetcode || "Not set"}</p>
            <p><strong>Codeforces:</strong> {handles.codeforces || "Not set"}</p>
            <p><strong>CodeChef:</strong> {handles.codechef || "Not set"}</p>
            {isOwnProfile && (
              <button className={styles.button} onClick={() => setIsEditing(true)}>Edit Profile</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;