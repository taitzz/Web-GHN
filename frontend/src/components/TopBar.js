import { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faBell } from "@fortawesome/free-solid-svg-icons";
import "../assets/styles/TopBar.css"; // Đảm bảo đã tạo một file CSS cho TopBar

const TopBar = () => {
  const [fullName, setFullName] = useState("");  // Lưu tên người dùng
  const [searchQuery, setSearchQuery] = useState(""); // Lưu truy vấn tìm kiếm
  const [notifications, setNotifications] = useState([]); // Lưu thông báo
  const [notificationCount, setNotificationCount] = useState(0); // Lưu số lượng thông báo chưa đọc

  // Lấy thông tin người dùng
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/users/profile", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`, // Đảm bảo có token JWT
          },
        });
        setFullName(response.data.fullName);  // Lưu tên người dùng
      } catch (error) {
        console.error("Lỗi khi lấy thông tin người dùng", error);
      }
    };

    fetchUserProfile();
  }, []);

  // Xử lý tìm kiếm
  const handleSearch = () => {
    console.log("Tìm kiếm:", searchQuery);
    // Bạn có thể thực hiện tìm kiếm hoặc điều hướng trang kết quả tại đây
  };

  // Lấy thông báo
  useEffect(() => {
    // Giả lập lấy thông báo từ server
    const newNotifications = [
      "Thông báo 1",
      "Thông báo 2",
      "Thông báo 3",
    ];
    setNotifications(newNotifications);
    setNotificationCount(newNotifications.length);
  }, []);

  return (
    <div className="topbar">
      <div className="topbar-left">
        <input
          type="text"
          placeholder="Tìm kiếm..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        <button onClick={handleSearch} className="search-btn">
          <FontAwesomeIcon icon={faSearch} />
        </button>
      </div>

      <div className="topbar-right">
        <div className="notifications">
          <FontAwesomeIcon icon={faBell} className="notification-icon" />
          <span className="notification-count">{notificationCount}</span>
        </div>
        <div className="user-info">
          <span className="welcome-message">Xin chào, {fullName}</span>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
