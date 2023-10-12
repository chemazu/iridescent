import axios from "axios";
import {
  SET_CURRENCY_AND_EXCHANGE_RATE,
  SET_CURRENCY_AND_EXCHANGE_RATE_FAIL,
} from "./types";
import getHtlmSymbolFromCurrencyCode from "../utilities/currencyCodeToHTMLSymbol";

export const fetchCurrencyData = () => {
  return async (dispatch) => {
    try {
      delete axios.defaults.headers.common["x-auth-token"];
      const locationResponse = await axios.get("https://ipapi.co/json");
      const countryCode = locationResponse.data.country;
      const currency = locationResponse.data.currency;

      const exchangeRateResponse = await axios.get(
        `https://v6.exchangerate-api.com/v6/${process.env.REACT_APP_EXCHANGE_RATE_API}/latest/USD`
      );
      const exchangeRate = exchangeRateResponse.data.conversion_rates[currency];

      dispatch({
        type: SET_CURRENCY_AND_EXCHANGE_RATE,
        payload: {
          currency: currency,
          exchangeRate: exchangeRate,
          country: countryCode,
          htmlCurrencySymbol: getHtlmSymbolFromCurrencyCode(currency),
        },
      });
    } catch (error) {
      console.log(error);
      dispatch({
        type: SET_CURRENCY_AND_EXCHANGE_RATE_FAIL,
      });
    }
  };
};
