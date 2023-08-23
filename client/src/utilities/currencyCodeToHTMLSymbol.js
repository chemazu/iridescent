const currencyToHtmlObjectMapping = {
    ANG: "&#402;",
    AOA: "&#122;",
    ARS: "&#36;",
    AUD: "&#36;",
    AWG: "&#402;",
    AFN: "&#x60B;",
    ALL: "&#8704;",
    BMD: "&#36;",
    BND: "&#36;",
    BSD: "&#36;",
    BWP: "&#80;",
    USD: "&#36;",
    NGN: "&#8358;",
    GBP: "&#163;",
    NZD: "&#36;",
    EUR: "&#8364;",
    HKD: "&#36;",
    CAD: "&#36;",
    CLP: "&#36;",
    CNY: "&#165;",
    COP: "&#36;",
    CRC: "&#8353;",
    CUP: "&#8396;",
    CVE: "&#36;",
    JPY: "&#165;",
    BBD: "&#36;",
    BDT: "&#2547;",
    GTQ: "&#81;",
    GYD: "&#36;",
    HNL: "&#76;",
    DZD: "&#1580;",
    EGP: "&#163;",
    FJD: "&#36;",
    FKP: "&#163;",
    GEL: "&#4314;",
    GHS: "&#162;",
    GIP: "&#163;",
    GMD: "&#68;",
    HTG: "&#71;",
    ILS: "&#8362;",
    INR: "&#8377;",
    JEP: "&#163;",
    KHR: "&#6107;",
    KPW: "&#8361;",
    KYD: "&#36;",
    KRW: "&#8361;",
    LBP: "&#163;",
    LAK: "&#8365;",
    LKR: "&#8360;",
    LRD: "&#36;",
    LSL: "&#76;",
    MDL: "&#76;",
    MNT: "&#8366;",
    MMK: "&#75;",
    MUR: "&#8360;",
    MVR: ".&#1923;",
    MWK: "&#77;&#75;",
    MXN: "&#36;",
    MYR: "&#82;&#77;",
    MZN: "&#77;&#84;",
    NAD: "&#36;",
    IRR: "&#65020;",
    NPR: "&#8360;",
    OMR: "&#65020;",
    PGK: "&#75;",
    PHP: "&#8369;",
    PKR: "&#8360;",
    SAR: "&#65020;",
    SBD: "&#36;",
    SCR: "&#8360;",
    SDG: "&#163;",
    SGD: "&#36;",
    SHP: "&#163;",
    SOS: "&#83;",
    SRD: "&#36;",
    SVC: "&#36;",
    SYP: "&#163;",
    SZL: "&#76;",
    THB: "&#3647;",
    TMT: "&#109;",
    UAH: "&#8372;",
    PLN: "&#122;&#322;",
    PYG: "&#71;&#115;",
    QAR: "&#65020;",
    TRY: "&#8356;",
    TTD: "&#36;",
    VND: "&#8363;",
    XCD: "&#36;",
    XPF: "&#70;",
    YER: "&#65020;",
    ZWL: "&#36;",
    ZAR: "&#82;",
  };
  
  // 'AED' : '&#1583;.&#1573;',
  // 	'AFN' : '&#65;&#102;',
  // 	'ALL' : '&#76;&#101;&#107;',
  // 	'AZN' : '&#1084;&#1072;&#1085;',
  // 	'BAM' : '&#75;&#77;',
  // 	'BGN' : '&#1083;&#1074;',
  // 	'BHD' : '.&#1583;.&#1576;',
  // 	'BIF' : '&#70;&#66;&#117;',
  // 	'BOB' : '&#36;&#98;',
  // 	'BRL' : '&#82;&#36;',
  // 	'BTN' : '&#78;&#117;&#46;',
  // 		'BYR' : '&#112;&#46;',
  // 	'BZD' : '&#66;&#90;&#36;',
  // 	'CDF' : '&#70;&#67;',
  // 	'CHF' : '&#67;&#72;&#70;',
  // 	'CZK' : '&#75;&#269;',
  // 	'DJF' : '&#70;&#100;&#106;',
  // 	'DKK' : '&#107;&#114;',
  // 	'DOP' : '&#82;&#68;&#36;',
  // 	'ETB' : '&#66;&#114;',
  // 	'GNF' : '&#70;&#71;',
  // 	'HRK' : '&#107;&#110;',
  // 	'HUF' : '&#70;&#116;',
  // 	'IDR' : '&#82;&#112;',
  // 	'IQD' : '&#1593;.&#1583;',
  // 	'ISK' : '&#107;&#114;',
  // 	'JMD' : '&#74;&#36;',
  // 	'JOD' : '&#74;&#68;',
  // 	'KES' : '&#75;&#83;&#104;',
  // 	'KGS' : '&#1083;&#1074;',
  // 	'KMF' : '&#67;&#70;',
  // 	'KWD' : '&#1583;.&#1603;',
  // 	'KZT' : '&#1083;&#1074;',
  // 	'LTL' : '&#76;&#116;',
  // 	'LVL' : '&#76;&#115;',
  // 	'LYD' : '&#1604;.&#1583;',
  // 	'MAD' : '&#1583;.&#1605;.',
  // 	'MGA' : '&#65;&#114;',
  // 	'MKD' : '&#1076;&#1077;&#1085;',
  // 	'MOP' : '&#77;&#79;&#80;&#36;',
  // 	'MRO' : '&#85;&#77;',
  // 	'NIO' : '&#67;&#36;',
  // 	'NOK' : '&#107;&#114;',
  // 	'PAB' : '&#66;&#47;&#46;',
  // 	'PEN' : '&#83;&#47;&#46;',
  // 	'RON' : '&#108;&#101;&#105;',
  // 	'RSD' : '&#1044;&#1080;&#1085;&#46;',
  // 	'RUB' : '&#1088;&#1091;&#1073;',
  // 	'RWF' : '&#1585;.&#1587;',
  // 	'SEK' : '&#107;&#114;',
  // 	'SLL' : '&#76;&#101;',
  // 	'STD' : '&#68;&#98;',
  // 	'TJS' : '&#84;&#74;&#83;',
  // 	'TND' : '&#1583;.&#1578;',
  // 	'TOP' : '&#84;&#36;',
  // 	'TWD' : '&#78;&#84;&#36;',
  // 	'UGX' : '&#85;&#83;&#104;',
  // 	'UYU' : '&#36;&#85;',
  // 	'UZS' : '&#1083;&#1074;',
  // 	'VEF' : '&#66;&#115;',
  // 	'VUV' : '&#86;&#84;',
  // 	'WST' : '&#87;&#83;&#36;',
  // 	'XAF' : '&#70;&#67;&#70;&#65;',
  // 	'ZMK' : '&#90;&#75;',
  
  const getHtlmSymbolFromCurrencyCode = (currencyCode) => {
    return currencyToHtmlObjectMapping[currencyCode];
  };
  
  export default getHtlmSymbolFromCurrencyCode;