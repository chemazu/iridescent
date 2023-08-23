import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  //  Route, Switch
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "./App.css";
import "./styles/assets/vendor/nucleo/css/nucleo.css";
import "./styles/assets/css/argon-design-system-react.css";

import "react-toastify/dist/ReactToastify.css";
import { LOAD_SUBDOMAIN_IN_STATE } from "./actions/types";
import { fetchCurrencyData } from "./actions/currency";

import AppLoader from "./components/layout/AppLoader";
import PaymentModal from "./components/layout/PaymentModal";

//
// routing
import { MainAppViews } from "./components/routers/MainAppViews";
import { SubdomainViews } from "./components/routers/SubdomainViews";
import { CoursesSubdomainViews } from "./components/routers/CoursesSubdomainViews";

// import PrivateRoute from "./components/routers/PrivateRoute"
// import PrivateRouteForToken from "./components/routers/PrivateRouteForToken"

// REDUX STORE CONFIG
import { Provider } from "react-redux";
import store from "./store";
// import { loadUser } from "./actions/auth"
import setAuthToken from "./utilities/setAuthToken";

if (localStorage.getItem("token")) {
  setAuthToken(localStorage.getItem("token"));
}

function App() {
  //  useEffect(() => {
  //   store.dispatch(loadUser()) // load user when app mounts, checks for authentication
  // }, [])

  const [appSubdomainState, setAppSubdomainState] = useState(null);

  useEffect(() => {
    const host = window.location.host;

    const arr = host.split(".").slice(0, host.includes("localhost") ? -1 : -2);
    if (arr.length > 0) {
      setAppSubdomainState(arr[0]);
      store.dispatch({
        type: LOAD_SUBDOMAIN_IN_STATE,
        payload: arr[0],
      });
    }
    if (arr.length === 0 || arr[0].toLowerCase() === "www") {
      // no subdomain is present or subdomain is www version load hubspot
      (function loadHubSpot() {
        const d = document;
        const s = d.createElement("script");

        s.src = "https://js-na1.hs-scripts.com/22270588.js";
        s.async = true;
        d.getElementsByTagName("body")[0].appendChild(s);
      })();
    }
  }, []);

   // useEffect call to load information on users currency based on
  // location

  useEffect(() => {
    store.dispatch(fetchCurrencyData());
  }, []);
  
  return (
    <Provider store={store}>
      <Router>
        <AppLoader />
        <PaymentModal />
        <ToastContainer
          position="bottom-right"
          autoClose={5000}
          hideProgressBar={true}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        {appSubdomainState ? (
          <>
            {appSubdomainState.toLowerCase() === "www" ? (
              <Route component={MainAppViews} />
            ) : appSubdomainState.toLowerCase() === "courses" ? (
              <Route component={CoursesSubdomainViews} />
            ) : (
              <Route component={SubdomainViews} />
            )}
          </>
        ) : (
          <Route component={MainAppViews} />
        )}
      </Router>
    </Provider>
  );
}

export default App;
