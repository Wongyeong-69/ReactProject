import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";

const TripStateContext = createContext(null);
const TripDispatchContext = createContext(null);
const TripLoadingContext = createContext(false); // 초기부터 false로 둘 거라 기본값 false

const STORAGE_KEY = "travel-planner-trips";

// 🔹 localStorage에서 초기값 읽어오는 함수
function loadInitialTrips() {
  if (typeof window === "undefined") return [];

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (e) {
    console.error("localStorage parsing error", e);
    return [];
  }
}

// 🔹 리듀서
function tripReducer(state, action) {
  switch (action.type) {
    case "INIT":
      return action.trips;

    case "ADD_TRIP":
      return [action.trip, ...state];

    case "DELETE_TRIP":
      return state.filter((t) => t.id !== action.id);

    case "ADD_SCHEDULE": {
      const { tripId, schedule } = action;
      return state.map((t) =>
        t.id === tripId
          ? { ...t, schedules: [...(t.schedules || []), schedule] }
          : t
      );
    }

    case "UPDATE_TRIP": {
      const { id, patch } = action;
      return state.map((t) => (t.id === id ? { ...t, ...patch } : t));
    }

    case "DELETE_SCHEDULE": {
      const { tripId, scheduleId } = action;
      return state.map((t) =>
        t.id === tripId
          ? {
              ...t,
              schedules: (t.schedules || []).filter((s) => s.id !== scheduleId),
            }
          : t
      );
    }

    case "ADD_CHECK_ITEM": {
      const { tripId, item } = action;
      return state.map((t) =>
        t.id === tripId
          ? { ...t, checklist: [...(t.checklist || []), item] }
          : t
      );
    }

    case "TOGGLE_CHECK_ITEM": {
      const { tripId, itemId } = action;
      return state.map((t) =>
        t.id === tripId
          ? {
              ...t,
              checklist: (t.checklist || []).map((c) =>
                c.id === itemId ? { ...c, done: !c.done } : c
              ),
            }
          : t
      );
    }

    case "DELETE_CHECK_ITEM": {
      const { tripId, itemId } = action;
      return state.map((t) =>
        t.id === tripId
          ? {
              ...t,
              checklist: (t.checklist || []).filter((c) => c.id !== itemId),
            }
          : t
      );
    }

    case "SET_MEMO": {
      const { tripId, memo } = action;
      return state.map((t) => (t.id === tripId ? { ...t, memo } : t));
    }

    default:
      return state;
  }
}

// 🔹 Provider
export function TripProvider({ children }) {
  // ✅ 처음부터 localStorage 값으로 초기화
  const [trips, dispatch] = useReducer(tripReducer, [], loadInitialTrips);
  const [isLoading] = useState(false); // 이제 비동기 로딩 안 해서 항상 false

  // 🔹 id 초기값 계산 (localStorage에 있는 값 기준)
  const nextTripId = useRef(1);
  const nextScheduleId = useRef(1);
  const nextCheckId = useRef(1);

  if (trips.length > 0) {
    const maxTripId = Math.max(...trips.map((t) => t.id || 0));
    nextTripId.current = maxTripId + 1;

    const allSchedules = trips.flatMap((t) => t.schedules || []);
    if (allSchedules.length > 0) {
      const maxScheduleId = Math.max(...allSchedules.map((s) => s.id || 0));
      nextScheduleId.current = maxScheduleId + 1;
    }

    const allChecks = trips.flatMap((t) => t.checklist || []);
    if (allChecks.length > 0) {
      const maxCheckId = Math.max(...allChecks.map((c) => c.id || 0));
      nextCheckId.current = maxCheckId + 1;
    }
  }

  // 🔥 trips 바뀔 때마다 localStorage에 저장
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
    } catch (e) {
      console.error("localStorage setItem error", e);
    }
  }, [trips]);

  // 🔹 액션 모음
  const actions = {
    addTrip: ({ name, startDate, endDate, budget, image }) => {
      const newTrip = {
        id: nextTripId.current++,
        name,
        startDate,
        endDate,
        budget: Number(budget) || 0,
        spent: 0,
        status: "planned",
        schedules: [],
        checklist: [],
        memo: "",
        image: image || null,
      };
      dispatch({ type: "ADD_TRIP", trip: newTrip });
    },

    deleteTrip: (id) => {
      dispatch({ type: "DELETE_TRIP", id });
    },

    addSchedule: ({ tripId, date, time, place, type }) => {
      const schedule = {
        id: nextScheduleId.current++,
        date,
        time,
        place,
        type,
      };
      dispatch({ type: "ADD_SCHEDULE", tripId, schedule });
    },

    deleteSchedule: ({ tripId, scheduleId }) => {
      dispatch({ type: "DELETE_SCHEDULE", tripId, scheduleId });
    },

    addCheckItem: ({ tripId, text }) => {
      const item = {
        id: nextCheckId.current++,
        text,
        done: false,
      };
      dispatch({ type: "ADD_CHECK_ITEM", tripId, item });
    },

    toggleCheckItem: ({ tripId, itemId }) => {
      dispatch({ type: "TOGGLE_CHECK_ITEM", tripId, itemId });
    },

    deleteCheckItem: ({ tripId, itemId }) => {
      dispatch({ type: "DELETE_CHECK_ITEM", tripId, itemId });
    },

    setMemo: ({ tripId, memo }) => {
      dispatch({ type: "SET_MEMO", tripId, memo });
    },

    updateTrip: ({ id, patch }) => {
      dispatch({ type: "UPDATE_TRIP", id, patch });
    },
  };

  return (
    <TripStateContext.Provider value={trips}>
      <TripLoadingContext.Provider value={isLoading}>
        <TripDispatchContext.Provider value={actions}>
          {children}
        </TripDispatchContext.Provider>
      </TripLoadingContext.Provider>
    </TripStateContext.Provider>
  );
}

export function useTrips() {
  const ctx = useContext(TripStateContext);
  if (ctx === null) {
    throw new Error("useTrips는 TripProvider 안에서만 사용 가능합니다.");
  }
  return ctx;
}

export function useTripActions() {
  const ctx = useContext(TripDispatchContext);
  if (ctx === null) {
    throw new Error("useTripActions는 TripProvider 안에서만 사용 가능합니다.");
  }
  return ctx;
}

export function useTripsLoading() {
  const ctx = useContext(TripLoadingContext);
  if (ctx === null) {
    throw new Error("useTripsLoading은 TripProvider 안에서만 사용 가능합니다.");
  }
  return ctx;
}
