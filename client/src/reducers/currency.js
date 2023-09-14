import {
    SET_CURRENCY_AND_EXCHANGE_RATE,
    SET_CURRENCY_AND_EXCHANGE_RATE_FAIL,
  } from "../actions/types";
  
  const initialState = {
    currency: "USD",
    exchangeRate: 1,
    countryCode: "US",
    htmlCurrencySymbol: "&#36;",
    loading: true,
  };
  
  const currencyReducer = (state = initialState, action) => {
    const { type, payload } = action;
    switch (type) {
      case SET_CURRENCY_AND_EXCHANGE_RATE:
        return {
          ...state,
          currency: payload.currency,
          exchangeRate: payload.exchangeRate,
          countryCode: payload.country,
          htmlCurrencySymbol: payload.htmlCurrencySymbol,
          loading: false,
        };
      case SET_CURRENCY_AND_EXCHANGE_RATE_FAIL:
        return { ...state, loading: false };
      default:
        return { ...state, loading: false };
    }
  };
  
  export default currencyReducer;