import { Link } from "react-router-dom";
import { useState, useRef } from "react";
import "./Home.css";

function Home({ trips, addTrip, deleteTrip, isLoading }) {
  const [form, setForm] = useState({
    name: "",
    startDate: "",
    endDate: "",
    budget: "",
  });

  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const onChangeField = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectFile = () => {
    fileInputRef.current?.click();
  };

  const onChangeImage = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) {
      setImagePreview(null);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result); 
    };
    reader.readAsDataURL(file);
  };

  const formatDateRange = (start, end) => {
    if (!start || !end) return "";
    const s = start.replaceAll("-", ".");
    const e = end.replaceAll("-", ".");
    return `${s} ~ ${e}`;
  };

  const getStatusLabel = (trip) => {
    const today = new Date().toISOString().slice(0, 10); 

    if (trip.endDate < today) {
      return "완료";
    }

    return "진행 예정";
  };

  const onSubmit = (e) => {
    e.preventDefault();

    if (!form.name || !form.startDate || !form.endDate) {
      alert("여행 이름과 날짜를 입력해 주세요.");
      return;
    }

    if (form.startDate > form.endDate) {
      alert("출발일이 도착일보다 늦을 수 없습니다.");
      return;
    }

    addTrip({
      name: form.name,
      startDate: form.startDate,
      endDate: form.endDate,
      budget: form.budget,
      image: imagePreview, 
    });

    setForm({
      name: "",
      startDate: "",
      endDate: "",
      budget: "",
    });
    setImagePreview(null);
    if (e.target && typeof e.target.reset === "function") {
      e.target.reset();
    }
  };

  const onDeleteTrip = (id) => {
    if (window.confirm("이 여행을 삭제할까요?")) {
      deleteTrip(id);
    }
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="home-header-top">
          <div>
            <h1 className="home-title">여행 일정 플래너 📅</h1>
            <p className="home-subtitle">
              가고 싶은 도시와 일정을 한 곳에서 관리해보세요 ✨
            </p>
          </div>
          <div className="home-header-actions">
            <Link to="/stats" className="btn secondary">
              통계 보기
            </Link>
          </div>
        </div>
      </header>

      <main className="home-main-grid">
        <section className="trip-form-card">
          <h2 className="section-title">새 여행 만들기</h2>

          <form onSubmit={onSubmit}>
            <div className="trip-form-row">
              <label>여행 이름</label>
              <input
                type="text"
                name="name"
                placeholder="예) 일본 봄 여행"
                value={form.name}
                onChange={onChangeField}
              />
            </div>

            <div className="trip-form-row trip-form-row--inline">
              <div className="trip-form-field">
                <label>출발일</label>
                <input
                  type="date"
                  name="startDate"
                  value={form.startDate}
                  onChange={onChangeField}
                />
              </div>
              <div className="trip-form-field">
                <label>도착일</label>
                <input
                  type="date"
                  name="endDate"
                  value={form.endDate}
                  onChange={onChangeField}
                />
              </div>
            </div>

            <div className="trip-form-row trip-form-row--inline">
              <div className="trip-form-field">
                <label>예산(원)</label>
                <input
                  type="number"
                  name="budget"
                  placeholder="1200000"
                  value={form.budget}
                  onChange={onChangeField}
                />
              </div>
            </div>

            <div className="trip-form-row">
              <label>여행 사진 (선택)</label>
              <div
                className={
                  "image-dropzone" +
                  (imagePreview ? " image-dropzone--filled" : "")
                }
                onClick={handleSelectFile}
              >
                {imagePreview ? (
                  <>
                    <div className="image-dropzone-thumb">
                      <img src={imagePreview} alt="여행 미리보기" />
                    </div>
                    <div className="image-dropzone-text">
                      <div className="image-dropzone-title">
                        선택한 사진이 카드 썸네일로 사용됩니다.
                      </div>
                      <div className="image-dropzone-sub">
                        다른 사진을 사용하려면 이 영역을 다시 클릭하세요.
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="image-dropzone-icon">📷</div>
                    <div className="image-dropzone-text">
                      <div className="image-dropzone-title">
                        여행 분위기가 느껴지는 사진을 추가해보세요
                      </div>
                      <div className="image-dropzone-sub">
                        클릭해서 파일을 선택하면 카드 썸네일로 사용됩니다.
                      </div>
                    </div>
                  </>
                )}

                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={onChangeImage}
                  style={{ display: "none" }} 
                />
              </div>
            </div>

            <div className="trip-form-footer">
              <button type="submit" className="btn primary" disabled={isLoading}>
                {isLoading ? "로딩 중..." : "여행 추가"}
              </button>
            </div>
          </form>
        </section>

        <section className="trip-list-section">
          <div className="trip-list-header">
            <h2 className="section-title">나의 여행 목록 ✈️</h2>
            <span className="trip-list-subtitle">
              {isLoading
                ? "여행 데이터를 불러오는 중..."
                : `총 ${trips.length}개의 여행`}
            </span>
          </div>

          <div className="trip-list">
            {isLoading ? (
              <div className="loading-state">
                <div className="loading-spinner" />
                <span>여행 정보를 불러오는 중입니다...</span>
              </div>
            ) : trips.length === 0 ? (
              <div className="empty-state">
                아직 등록된 여행이 없습니다. 왼쪽에서 첫 여행을 추가해보세요 ✨
              </div>
            ) : (
              trips.map((trip) => (
                <article key={trip.id} className="trip-card modern-card">
                  <div className="trip-card-image">
                    {trip.image ? (
                      <img src={trip.image} alt={trip.name} />
                    ) : (
                      <div className="trip-card-image-placeholder">📸</div>
                    )}

                    <span className="trip-status-badge">
                      {getStatusLabel(trip)}
                    </span>
                  </div>

                  <div className="trip-card-body">
                    <h3 className="trip-title">{trip.name}</h3>
                    <p className="trip-date">
                      {formatDateRange(trip.startDate, trip.endDate)}
                    </p>
                    <p className="trip-budget">
                      예산 {Number(trip.budget || 0).toLocaleString()}원

                    </p>

                    <div className="trip-actions wide">
                      <Link
                        to={`/trip/${trip.id}`}
                        className="btn small primary"
                      >
                        상세보기
                      </Link>
                      <button
                        className="btn small danger-line"
                        onClick={() => onDeleteTrip(trip.id)}
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Home;
