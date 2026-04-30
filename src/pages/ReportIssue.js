import { useNavigate } from "react-router-dom";
import UserDashboardHeader from "../components/UserDashboardHeader";
import ComplaintForm from "../components/ComplaintForm";

export default function ReportIssue() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate("/user/dashboard");
  };

  const handleCancel = () => {
    navigate("/user/dashboard");
  };

  return (
    <div>
      <UserDashboardHeader />
      <div style={styles.container}>
        <ComplaintForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "20px"
  }
};

