import { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        alert("Invalid or expired recovery link.");
        navigate("/login");
      }
      setLoading(false);
    });
  }, [navigate]);

  const handleReset = async (e) => {
    e.preventDefault();

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Password updated successfully!");
      navigate("/login");
    }
  };

  if (loading) return <p>Verifying reset link...</p>;

  return (
    <form onSubmit={handleReset}>
      <h2>Set New Password</h2>
      <input
        type="password"
        placeholder="New password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Update Password</button>
    </form>
  );
}

