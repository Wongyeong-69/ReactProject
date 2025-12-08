import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import { useEffect, useReducer, useRef, useState } from "react";

import Home from "./pages_temp/Home.jsx";
import TripDetail from "./pages_temp/TripDetail.jsx";
import Stats from "./pages_temp/Stats.jsx";
import "./styles/common.css";

const STORAGE_KEY = "travel-planner-trips";

function loadInitialTrips() {
  if (typeof window === "undefined") return [];

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch {
    return [];
  }
}

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
              schedules: (t.schedules || []).filter(
                (s) => s.id !== scheduleId
              ),
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
              checklist: (t.checklist || []).filter(
                (c) => c.id !== itemId
              ),
            }
          : t
      );
    }

    case "SET_MEMO": {
      const { tripId, memo } = action;
      return state.map((t) =>
        t.id === tripId ? { ...t, memo } : t
      );
    }

    default:
      return state;
  }
}

function App() {
  const [trips, dispatch] = useReducer(
    tripReducer,
    [],
    loadInitialTrips
  );
  const [isLoading] = useState(false);

  const nextTripId = useRef(1);
  const nextScheduleId = useRef(1);
  const nextCheckId = useRef(1);

  if (trips.length > 0) {
    const maxTripId = Math.max(...trips.map((t) => t.id || 0));
    nextTripId.current = maxTripId + 1;

    const allSchedules = trips.flatMap((t) => t.schedules || []);
    if (allSchedules.length > 0) {
      const maxScheduleId = Math.max(
        ...allSchedules.map((s) => s.id || 0)
      );
      nextScheduleId.current = maxScheduleId + 1;
    }

    const allChecks = trips.flatMap((t) => t.checklist || []);
    if (allChecks.length > 0) {
      const maxCheckId = Math.max(...allChecks.map((c) => c.id || 0));
      nextCheckId.current = maxCheckId + 1;
    }
  }

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
    } catch {}
  }, [trips]);

  const addTrip = ({ name, startDate, endDate, budget, image }) => {
    const newTrip = {
      id: nextTripId.current++,
      name,
      startDate,
      endDate,
      budget: Number(budget) || 0,
      status: "planned",
      schedules: [],
      checklist: [],
      memo: "",
      image: image || null,
    };
    dispatch({ type: "ADD_TRIP", trip: newTrip });
  };

  const deleteTrip = (id) => {
    dispatch({ type: "DELETE_TRIP", id });
  };

  const repeatTrip = (originalTripId, newStartDate, newEndDate) => {
    const original = trips.find((t) => t.id === originalTripId);
    if (!original) return;

    const newId = Date.now();

    const newTrip = {
      ...original,
      id: newId,
      startDate: newStartDate,
      endDate: newEndDate,
      schedules: original.schedules
        ? original.schedules.map((s) => ({ ...s }))
        : [],
      checklist: original.checklist
        ? original.checklist.map((c) => ({ ...c }))
        : [],
    };

    dispatch({ type: "ADD_TRIP", trip: newTrip });
  };

  const addSchedule = ({ tripId, date, time, place, type }) => {
    const schedule = {
      id: nextScheduleId.current++,
      date,
      time,
      place,
      type,
    };
    dispatch({ type: "ADD_SCHEDULE", tripId, schedule });
  };

  const deleteSchedule = ({ tripId, scheduleId }) => {
    dispatch({ type: "DELETE_SCHEDULE", tripId, scheduleId });
  };

  const addCheckItem = ({ tripId, text }) => {
    const item = {
      id: nextCheckId.current++,
      text,
      done: false,
    };
    dispatch({ type: "ADD_CHECK_ITEM", tripId, item });
  };

  const toggleCheckItem = ({ tripId, itemId }) => {
    dispatch({ type: "TOGGLE_CHECK_ITEM", tripId, itemId });
  };

  const deleteCheckItem = ({ tripId, itemId }) => {
    dispatch({ type: "DELETE_CHECK_ITEM", tripId, itemId });
  };

  const setMemo = ({ tripId, memo }) => {
    dispatch({ type: "SET_MEMO", tripId, memo });
  };

  const updateTrip = ({ id, patch }) => {
    dispatch({ type: "UPDATE_TRIP", id, patch });
  };

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route
            path="/"
            element={
              <Home
                trips={trips}
                isLoading={isLoading}
                addTrip={addTrip}
                deleteTrip={deleteTrip}
              />
            }
          />

          <Route
            path="/trip/:tripId"
            element={
              <TripDetail
                trips={trips}
                isLoading={isLoading}
                addSchedule={addSchedule}
                deleteSchedule={deleteSchedule}
                addCheckItem={addCheckItem}
                toggleCheckItem={toggleCheckItem}
                deleteCheckItem={deleteCheckItem}
                setMemo={setMemo}
                updateTrip={updateTrip}
              />
            }
          />

          <Route
            path="/stats"
            element={
              <Stats
                trips={trips}
                isLoading={isLoading}
                onRepeatTrip={repeatTrip}
              />
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
