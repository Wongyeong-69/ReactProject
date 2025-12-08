// src/pages_temp/Stats.jsx
import { Link } from "react-router-dom";
import "./Stats.css";
import { useMemo } from "react";

function Stats({ trips, isLoading, onRepeatTrip }) {
  // 전체 여행 수
  const totalTrips = trips.length;

  // 전체 일정 수
  const totalSchedules = useMemo(() => {
    return trips.reduce((acc, t) => acc + (t.schedules?.length || 0), 0);
  }, [trips]);

  // 여행당 평균 일정 수
  const avgSchedules = useMemo(() => {
    if (trips.length === 0) return 0;
    return Math.round(totalSchedules / trips.length);
  }, [totalSchedules, trips.length]);

  // 가장 일정 많은 여행
  const mostSchedulesTrip = useMemo(() => {
    if (trips.length === 0) return null;
    return [...trips].sort(
      (a, b) => (b.schedules?.length || 0) - (a.schedules?.length || 0)
    )[0];
  }, [trips]);

  // 기간 계산
  const calcDays = (start, end) => {
    const s = new Date(start);
    const e = new Date(end);
    const diff = (e - s) / (1000 * 60 * 60 * 24) + 1;
    return diff;
  };

  // ✅ 여행이 "완료" 되었는지 (endDate < 오늘)
  const isFinishedTrip = (trip) => {
    if (!trip.endDate) return false;
    const today = new Date();
    const end = new Date(trip.endDate);
    // 같은 날까지 포함시키고 싶으면 <= 로 바꿔도 됨
    return end < today;
  };

  // 가장 오래 머문 여행
  const longestTrip = useMemo(() => {
    if (trips.length === 0) return null;
    return [...trips].sort(
      (a, b) =>
        calcDays(b.startDate, b.endDate) - calcDays(a.startDate, a.endDate)
    )[0];
  }, [trips]);

  if (isLoading) {
    return (
      <div className="stats-container">
        <header className="stats-header">
          <h1 className="stats-title">여행 통계</h1>
          <Link to="/" className="btn secondary">
            ← 홈으로
          </Link>
        </header>
        <div className="loading-state">
          <div className="loading-spinner" />
          <span>통계를 계산하는 중입니다...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="stats-container">
      <header className="stats-header">
        <h1 className="stats-title">여행 통계</h1>
        <Link to="/" className="btn secondary">
          ← 홈으로
        </Link>
      </header>

      {/* 상단 카드 요약 */}
      <section className="stats-grid">
        <div className="stats-card">
          <h2 className="stats-card-title">전체 여행 수</h2>
          <p className="stats-card-value">{totalTrips}</p>
        </div>

        <div className="stats-card">
          <h2 className="stats-card-title">전체 일정 수</h2>
          <p className="stats-card-value">{totalSchedules}</p>
        </div>

        <div className="stats-card">
          <h2 className="stats-card-title">평균 일정 수</h2>
          <p className="stats-card-value">{avgSchedules}</p>
        </div>

        <div className="stats-card">
          <h2 className="stats-card-title">가장 일정 많은 여행</h2>
          <p className="stats-card-value">
            {mostSchedulesTrip ? mostSchedulesTrip.name : "-"}
          </p>
        </div>
      </section>

      {/* 여행별 요약 + 다시 가기 버튼 */}
      <section className="stats-table-section">
        <h2 className="section-title">여행별 요약</h2>

        {trips.length === 0 ? (
          <div className="empty-state">
            아직 등록된 여행이 없어서 통계를 표시할 수 없습니다.
            홈에서 여행을 추가해보세요.
          </div>
        ) : (
          <table className="stats-table">
            <thead>
              <tr>
                <th>여행 이름</th>
                <th>기간</th>
                <th>일정 수</th>
                <th>다시 가기</th> {/* ✅ 새 컬럼 */}
              </tr>
            </thead>

            <tbody>
              {trips.map((t) => (
                <tr key={t.id}>
                  <td>{t.name}</td>
                  <td>
                    {t.startDate} ~ {t.endDate} (
                    {calcDays(t.startDate, t.endDate)}일)
                  </td>
                  <td>{t.schedules?.length || 0}</td>
                  <td>
                    {isFinishedTrip(t) ? (
                      <button
                        type="button"
                        className="btn small"
                        onClick={() => {
                          if (!onRepeatTrip) {
                            alert("복사 기능이 아직 연결되지 않았습니다.");
                            return;
                          }

                          const newStart = prompt(
                            "새 출발일을 입력하세요 (예: 2025-05-01)"
                          );
                          if (!newStart) return;

                          const newEnd = prompt(
                            "새 도착일을 입력하세요 (예: 2025-05-05)"
                          );
                          if (!newEnd) return;

                          if (new Date(newEnd) < new Date(newStart)) {
                            alert("도착일은 출발일보다 이후여야 합니다.");
                            return;
                          }

                          // ✅ App에서 내려준 함수 호출
                          onRepeatTrip(t.id, newStart, newEnd);
                        }}
                      >
                        다시 가기
                      </button>
                    ) : (
                      <span style={{ color: "#9ca3af", fontSize: 12 }}>
                        진행 중
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* 가장 오래 머문 여행 */}
      <section className="stats-table-section" style={{ marginTop: "24px" }}>
        <h2 className="section-title">가장 오래 머문 여행</h2>
        {longestTrip ? (
          <p style={{ fontSize: 16 }}>
            <strong>{longestTrip.name}</strong> —{" "}
            {calcDays(longestTrip.startDate, longestTrip.endDate)}일
          </p>
        ) : (
          <p style={{ color: "#6b7280" }}>데이터 없음</p>
        )}
      </section>
    </div>
  );
}

export default Stats;
