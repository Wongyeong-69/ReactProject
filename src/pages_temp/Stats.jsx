import { Link } from "react-router-dom";
import "./Stats.css";
import { useMemo } from "react";

function Stats({ trips, isLoading }) {
 
  const totalTrips = trips.length;

  const totalSchedules = useMemo(() => {
    return trips.reduce((acc, t) => acc + (t.schedules?.length || 0), 0);
  }, [trips]);

  const avgSchedules = useMemo(() => {
    if (trips.length === 0) return 0;
    return Math.round(totalSchedules / trips.length);
  }, [totalSchedules, trips.length]);

  const mostSchedulesTrip = useMemo(() => {
    if (trips.length === 0) return null;
    return [...trips].sort(
      (a, b) => (b.schedules?.length || 0) - (a.schedules?.length || 0)
    )[0];
  }, [trips]);

  const calcDays = (start, end) => {
    const s = new Date(start);
    const e = new Date(end);
    const diff = (e - s) / (1000 * 60 * 60 * 24) + 1;
    return diff;
  };

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
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

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
