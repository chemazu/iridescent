import { useEffect, useState } from "react";
import axios from "axios";
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
  const [appLoading, setAppLoading] = useState(true);
  const [appSubdomainState, setAppSubdomainState] = useState(null);

  const getSchoolInfoByDomainName = async (domain_name) => {
    try {
      if (
        window.location.hostname.includes("tuturly.com") ||
        window.location.hostname.includes("localhost")
      ) {
        return setAppLoading(false);
      }
      const schoolDetails = await axios.get(
        `/api/v1/domain?domain_name=${domain_name}`
      );
      store.dispatch({
        type: LOAD_SUBDOMAIN_IN_STATE,
        payload: schoolDetails.data.name, // load found school info/name in state.
      });
      setAppLoading(false);
    } catch (error) {
      console.log(error);
      setAppLoading(false);
    }
  };

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
    const hostname = window.location.hostname.startsWith("www.")
      ? window.location.hostname.slice(4)
      : window.location.hostname;
    console.log(hostname, "hostname");
    getSchoolInfoByDomainName(hostname);
    store.dispatch(fetchCurrencyData());
  }, []);

  return (
    <>
      {appLoading ? (
        <div
          style={{
            width: "50%",
            margin: "20px auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <i
            style={{ fontSize: "22px" }}
            className="fas fa-circle-notch fa-spin"
          ></i>
        </div>
      ) : (
        <>
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
                <>
                  {window.location.hostname.includes("tuturly.com") ||
                  window.location.hostname.includes("localhost") ? (
                    <Route component={MainAppViews} />
                  ) : (
                    <Route component={SubdomainViews} />
                  )}
                </>
              )}
            </Router>
          </Provider>
        </>
      )}
    </>
  );
}

export default App;
