import "./App.css";
import { BrowserRouter as Router } from "react-router-dom";
import AppRoute from "./routes/AppRoute";
import { NotificationProvider } from "./Contexts/NotificationContext";

function App() {
  return (
    // <NotificationProvider>
    <Router>
      <AppRoute />
    </Router>
    // </NotificationProvider>
  );
}

export default App;
