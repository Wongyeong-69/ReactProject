import { Link, useParams, useNavigate } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import "./TripDetail.css";
import {
  useTrips,
  useTripActions,
  useTripsLoading,
} from "../context/TripContext.jsx";

function TripDetail() {
  const { tripId } = useParams();
  const navigate = useNavigate();

  const trips = useTrips();
  const isLoading = useTripsLoading();

  const {
    addSchedule,
    deleteSchedule,
    addCheckItem,
    toggleCheckItem,
    deleteCheckItem,
    setMemo,
    updateTrip,
  } = useTripActions();

  // ---- 공통 상태들 ----
  const [activeTab, setActiveTab] = useState("schedule");
  const [checkInput, setCheckInput] = useState("");

  // 여행 찾기 (isLoading이 끝나면 값이 잡힘)
  const id = Number(tripId);
  const trip = trips.find((t) => t.id === id);

  // 로딩 중
  if (isLoading) {
    return (
      <div className="detail-container">
        <div className="loading-state">
          <div className="loading-spinner" />
          <span>여행 정보를 불러오는 중입니다...</span>
        </div>
      </div>
    );
  }

  // 여행 못 찾았을 때
  if (!trip) {
    return (
      <div className="detail-container">
        <header className="detail-header">
          <div className="detail-breadcrumb">
            <Link to="/" className="link-back">
              ← 여행 목록으로
            </Link>
          </div>
          <h1 className="detail-title">여행을 찾을 수 없습니다.</h1>
          <p className="detail-subtitle">
            잘못된 주소이거나 삭제된 여행일 수 있습니다.
          </p>
        </header>
      </div>
    );
  }

  // ---- 날짜 / 일정 관련 상태 ----
  const [selectedDate, setSelectedDate] = useState(trip.startDate || "");

  useEffect(() => {
    // 다른 여행으로 이동했을 때 초기 날짜 다시 세팅
    setSelectedDate(trip.startDate || "");
  }, [trip.id, trip.startDate]);

  const [scheduleForm, setScheduleForm] = useState({
    time: "",
    place: "",
    type: "이동",
  });

  const onChangeScheduleField = (e) => {
    const { name, value } = e.target;
    setScheduleForm((prev) => ({ ...prev, [name]: value }));
  };

  // 날짜 이동
  const shiftDate = (dateStr, offset) => {
    if (!dateStr) return;
    const d = new Date(dateStr);
    d.setDate(d.getDate() + offset);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const next = `${year}-${month}-${day}`;

    if (next < trip.startDate || next > trip.endDate) return;
    setSelectedDate(next);
  };

  // 선택 날짜 일정만 보여주기
  const schedulesForDate = useMemo(() => {
    const list = (trip.schedules || []).filter(
      (s) => s.date === selectedDate
    );
    return list.sort((a, b) => (a.time || "").localeCompare(b.time || ""));
  }, [trip.schedules, selectedDate]);

  // 일정 추가
  const onAddSchedule = (e) => {
    e.preventDefault();

    if (!selectedDate) {
      alert("날짜가 선택되지 않았습니다.");
      return;
    }

    if (!scheduleForm.time || !scheduleForm.place) {
      alert("시간과 장소를 입력해 주세요.");
      return;
    }

    addSchedule({
      tripId: trip.id,
      date: selectedDate,
      time: scheduleForm.time,
      place: scheduleForm.place,
      type: scheduleForm.type,
    });

    setScheduleForm({
      time: "",
      place: "",
      type: "이동",
    });
  };

  const onDeleteScheduleClick = (scheduleId) => {
    if (window.confirm("일정을 삭제할까요?")) {
      deleteSchedule({ tripId: trip.id, scheduleId });
    }
  };

  const formatDateLabel = (d) => {
    if (!d) return "";
    const [y, m, day] = d.split("-");
    return `${y}.${m}.${day}`;
  };

  // ---- 메모 상태 ----
  const [memo, setMemoState] = useState(trip.memo || "");

  useEffect(() => {
    setMemoState(trip.memo || "");
  }, [trip.id, trip.memo]);

  const onChangeMemo = (e) => {
    const value = e.target.value;
    setMemoState(value);
    setMemo({ tripId: trip.id, memo: value });
  };

  // ---- 여행 정보 수정용 상태 ----
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    name: trip.name,
    startDate: trip.startDate,
    endDate: trip.endDate,
    budget: trip.budget,
  });

  // trip 바뀌면 수정 폼도 초기화
  useEffect(() => {
    setEditForm({
      name: trip.name,
      startDate: trip.startDate,
      endDate: trip.endDate,
      budget: trip.budget,
    });
  }, [trip.id, trip.name, trip.startDate, trip.endDate, trip.budget]);

  const onChangeEditField = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSaveEdit = () => {
    if (!editForm.name || !editForm.startDate || !editForm.endDate) {
      alert("여행 이름과 날짜를 모두 입력해 주세요.");
      return;
    }

    if (editForm.startDate > editForm.endDate) {
      alert("출발일이 도착일보다 늦을 수 없습니다.");
      return;
    }

    updateTrip({
      id: trip.id,
      patch: {
        name: editForm.name,
        startDate: editForm.startDate,
        endDate: editForm.endDate,
        budget: Number(editForm.budget) || 0,
      },
    });

    setEditMode(false);
  };

  return (
    <div className="detail-container">
      {/* 헤더 */}
      <header className="detail-header">
        <div className="detail-breadcrumb">
          <button
            type="button"
            className="btn ghost"
            onClick={() => navigate(-1)}
          >
            ← 뒤로가기
          </button>
          <span style={{ marginLeft: 8, fontSize: 13, color: "#6b7280" }}>
            / 여행 상세
          </span>
        </div>

        <div className="detail-title-block">
          <h1 className="detail-title">{trip.name}</h1>
          <p className="detail-subtitle">
            {trip.startDate} ~ {trip.endDate} · 예산{" "}
            {trip.budget.toLocaleString()}원
          </p>

          {/* 여행 정보 수정 토글 버튼 */}
          <div style={{ marginTop: 8 }}>
            {!editMode && (
              <button
                type="button"
                className="btn secondary small"
                onClick={() => setEditMode(true)}
              >
                여행 정보 수정
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 여행 정보 수정 폼 */}
      {editMode && (
        <section className="edit-trip-section">
          <h2 className="section-title">여행 정보 수정</h2>
          <div className="edit-trip-grid">
            <div className="edit-trip-field">
              <label>여행 이름</label>
              <input
                type="text"
                name="name"
                value={editForm.name}
                onChange={onChangeEditField}
              />
            </div>

            <div className="edit-trip-field">
              <label>출발일</label>
              <input
                type="date"
                name="startDate"
                value={editForm.startDate}
                onChange={onChangeEditField}
              />
            </div>

            <div className="edit-trip-field">
              <label>도착일</label>
              <input
                type="date"
                name="endDate"
                value={editForm.endDate}
                onChange={onChangeEditField}
              />
            </div>

            <div className="edit-trip-field">
              <label>예산(원)</label>
              <input
                type="number"
                name="budget"
                value={editForm.budget}
                onChange={onChangeEditField}
              />
            </div>
          </div>

          <div className="edit-trip-actions">
            <button type="button" className="btn primary" onClick={onSaveEdit}>
              저장
            </button>
            <button
              type="button"
              className="btn ghost"
              onClick={() => setEditMode(false)}
            >
              취소
            </button>
          </div>
        </section>
      )}

      {/* 탭 */}
      <nav className="detail-tabs">
        <button
          className={`detail-tab ${
            activeTab === "schedule" ? "detail-tab--active" : ""
          }`}
          onClick={() => setActiveTab("schedule")}
        >
          일정
        </button>

        <button
          className={`detail-tab ${
            activeTab === "checklist" ? "detail-tab--active" : ""
          }`}
          onClick={() => setActiveTab("checklist")}
        >
          체크리스트
        </button>

        <button
          className={`detail-tab ${
            activeTab === "memo" ? "detail-tab--active" : ""
          }`}
          onClick={() => setActiveTab("memo")}
        >
          메모
        </button>
      </nav>

      {/* 일정 탭 */}
      {activeTab === "schedule" && (
        <section className="schedule-section">
          <div className="date-nav">
            <button
              type="button"
              className="btn ghost"
              onClick={() => shiftDate(selectedDate, -1)}
            >
              &lt;
            </button>

            <div>
              <div className="date-nav-label">
                {formatDateLabel(selectedDate)}
              </div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>
                여행 기간: {trip.startDate} ~ {trip.endDate}
              </div>
            </div>

            <button
              type="button"
              className="btn ghost"
              onClick={() => shiftDate(selectedDate, 1)}
            >
              &gt;
            </button>
          </div>

          {/* 일정 리스트 */}
          <div className="schedule-list">
            {schedulesForDate.length === 0 ? (
              <div className="empty-state">
                아직 일정이 없습니다. 아래에서 새 일정을 추가하세요.
              </div>
            ) : (
              schedulesForDate.map((s) => (
                <div key={s.id} className="schedule-row">
                  <div className="schedule-time">{s.time}</div>
                  <div className="schedule-main">
                    <div className="schedule-place">{s.place}</div>
                    <div className="schedule-tag">{s.type}</div>
                  </div>
                  <div className="schedule-actions">
                    <button
                      type="button"
                      className="btn small danger"
                      onClick={() => onDeleteScheduleClick(s.id)}
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 일정 추가 */}
          <div className="schedule-form">
            <h2 className="section-title">새 일정 추가</h2>
            <form onSubmit={onAddSchedule}>
              <div className="schedule-form-row">
                <div className="schedule-form-field">
                  <label>시간</label>
                  <input
                    type="time"
                    name="time"
                    value={scheduleForm.time}
                    onChange={onChangeScheduleField}
                  />
                </div>

                <div className="schedule-form-field schedule-form-field--grow">
                  <label>장소</label>
                  <input
                    type="text"
                    name="place"
                    placeholder="예) 해동 용궁사"
                    value={scheduleForm.place}
                    onChange={onChangeScheduleField}
                  />
                </div>

                <div className="schedule-form-field">
                  <label>유형</label>
                  <select
                    name="type"
                    value={scheduleForm.type}
                    onChange={onChangeScheduleField}
                  >
                    <option value="이동">이동</option>
                    <option value="숙박">숙박</option>
                    <option value="관광">관광</option>
                    <option value="식사">식사</option>
                    <option value="기타">기타</option>
                  </select>
                </div>

                <button type="submit" className="btn primary">
                  추가
                </button>
              </div>
            </form>
          </div>
        </section>
      )}

      {/* 체크리스트 탭 */}
      {activeTab === "checklist" && (
        <section className="schedule-section">
          <h2 className="section-title">여행 체크리스트</h2>

          <div className="checklist-list">
            {trip.checklist?.length === 0 ? (
              <p className="checklist-empty">
                아직 체크리스트가 없습니다. 아래에서 추가해보세요.
              </p>
            ) : (
              trip.checklist.map((item) => (
                <div key={item.id} className="checklist-item">
                  <label className="checklist-label">
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={() =>
                        toggleCheckItem({
                          tripId: trip.id,
                          itemId: item.id,
                        })
                      }
                    />
                    <span
                      className={
                        "checklist-text " +
                        (item.done ? "checklist-text--done" : "")
                      }
                    >
                      {item.text}
                    </span>
                  </label>

                  <button
                    type="button"
                    className="btn small ghost"
                    onClick={() =>
                      deleteCheckItem({
                        tripId: trip.id,
                        itemId: item.id,
                      })
                    }
                  >
                    삭제
                  </button>
                </div>
              ))
            )}
          </div>

          <form
            className="checklist-input-row"
            onSubmit={(e) => {
              e.preventDefault();
              if (!checkInput.trim()) return;
              addCheckItem({ tripId: trip.id, text: checkInput.trim() });
              setCheckInput("");
            }}
          >
            <input
              type="text"
              className="checklist-input"
              placeholder="예) 여권 챙기기"
              value={checkInput}
              onChange={(e) => setCheckInput(e.target.value)}
            />

            <button type="submit" className="btn primary">
              추가
            </button>
          </form>
        </section>
      )}

      {/* 메모 탭 */}
      {activeTab === "memo" && (
        <section className="schedule-section">
          <h2 className="section-title">여행 메모</h2>
          <p className="memo-helper">
            여행 준비할 때 느낀 점, 가고 싶은 장소, 짐 리스트 등을 자유롭게
            적어보세요. 내용은 자동으로 저장됩니다 ✨
          </p>
          <textarea
            className="memo-textarea"
            placeholder="예) 1일차에 꼭 일출 보러 가고 싶다..."
            value={memo}
            onChange={onChangeMemo}
          />
        </section>
      )}
    </div>
  );
}

export default TripDetail;
