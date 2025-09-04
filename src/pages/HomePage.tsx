

export const HomePage: React.FC = () => {
  // Lấy thông tin user từ localStorage
  const username = typeof window !== 'undefined' ? localStorage.getItem('username') : null;


  return (
    <div className="home-page">
      <div className="home-container">
        {/* Hero Section */}
        <div className="hero-section">
          <h1 className="hero-title">
            Chào mừng đến với <span className="highlight">Cario</span>
          </h1>
          <p className="hero-subtitle">
            Hệ thống hướng nghiệp qua trắc nghiệm tính cách
          </p>
          {/* Bỏ phần xin chào và username */}
        </div>

        {/* Features Grid */}
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📚</div>
            <h3>Câu hỏi</h3>
            <p>Làm bài trắc nghiệm tính cách để định hướng nghề nghiệp</p>
            <a href="/quiz" className="feature-link">Bắt đầu</a>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <h3>Chatbot</h3>
            <p>Trao đổi với AI để hiểu sâu hơn về kết quả và nghề nghiệp phù hợp</p>
            <a href="/chatbot" className="feature-link">Trò chuyện</a>
          </div>

          <div className="feature-card">
            <div className="feature-icon">💬</div>
            <h3>Forum</h3>
            <p>Thảo luận, chia sẻ định hướng nghề nghiệp cùng cộng đồng</p>
            <a href="/forum" className="feature-link">Vào forum</a>
          </div>

          {/* Bỏ thẻ tính năng Theo dõi tiến độ */}
        </div>
        {/* Bỏ phần Thống kê nhanh */}

        {/* Footer / Attribution */}
        <div className="cta-section">
          <h2>Made by NVQ</h2>
        </div>
      </div>
    </div>
  );
};
