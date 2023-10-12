const formCoutries = [
  {
    key: "AL",
    name: "Albania",
  },
  {
    key: "DZ",
    name: "Algeria",
  },
  {
    key: "AS",
    name: "American Samoa",
  },
  {
    key: "AD",
    name: "Andorra",
  },
  {
    key: "AO",
    name: "Angola",
  },
  {
    key: "AI",
    name: "Anguilla",
  },
  {
    key: "AQ",
    name: "Antarctica",
  },
  {
    key: "AG",
    name: "Antigua and Barbuda",
  },
  {
    key: "AR",
    name: "Argentina",
  },
  {
    key: "AM",
    name: "Armenia",
  },
  {
    key: "AW",
    name: "Aruba",
  },
  {
    key: "AU",
    name: "Australia",
  },
  {
    key: "AT",
    name: "Austria",
  },
  {
    key: "AZ",
    name: "Azerbaijan",
  },
  {
    key: "BS",
    name: "Bahamas",
  },
  {
    key: "BH",
    name: "Bahrain",
  },
  {
    key: "BD",
    name: "Bangladesh",
  },
  {
    key: "BB",
    name: "Barbados",
  },
  {
    key: "BE",
    name: "Belgium",
  },
  {
    key: "BZ",
    name: "Belize",
  },
  {
    key: "BJ",
    name: "Benin",
  },
  {
    key: "BM",
    name: "Bermuda",
  },
  {
    key: "BT",
    name: "Bhutan",
  },
  {
    key: "BO",
    name: "Bolivia",
  },
  {
    key: "BQ",
    name: "Bonaire",
  },
  {
    key: "BA",
    name: "Bosnia and Herzegovina",
  },
  {
    key: "BW",
    name: "Botswana",
  },
  {
    key: "BV",
    name: "Bouvet Island",
  },
  {
    key: "BR",
    name: "Brazil",
  },
  {
    key: "IO",
    name: "British Indian Ocean Territory",
  },
  {
    key: "VG",
    name: "British Virgin Islands",
  },
  {
    key: "BN",
    name: "Brunei Darussalam",
  },
  {
    key: "BG",
    name: "Bulgaria",
  },
  {
    key: "BF",
    name: "Burkina Faso",
  },
  {
    key: "KH",
    name: "Cambodia",
  },
  {
    key: "CM",
    name: "Cameroon",
  },
  {
    key: "CA",
    name: "Canada",
  },
  {
    key: "CV",
    name: "Cape Verde",
  },
  {
    key: "KY",
    name: "Cayman Islands",
  },
  {
    key: "CL",
    name: "Chile",
  },
  {
    key: "CN",
    name: "China",
  },
  {
    key: "CX",
    name: "Christmas Island",
  },
  {
    key: "CC",
    name: "Cocos (Keeling) Islands",
  },
  {
    key: "CO",
    name: "Colombia",
  },
  {
    key: "KM",
    name: "Comoros",
  },
  {
    key: "CK",
    name: "Cook Islands",
  },
  {
    key: "CR",
    name: "Costa Rica",
  },
  {
    key: "HR",
    name: "Croatia",
  },
  {
    key: "CW",
    name: "Curaçao",
  },
  {
    key: "CY",
    name: "Cyprus",
  },
  {
    key: "CZ",
    name: "Czech Republic",
  },
  {
    key: "CI",
    name: "Côte d'Ivoire",
  },
  {
    key: "DK",
    name: "Denmark",
  },
  {
    key: "DJ",
    name: "Djibouti",
  },
  {
    key: "DM",
    name: "Dominica",
  },
  {
    key: "DO",
    name: "Dominican Republic",
  },
  {
    key: "EC",
    name: "Ecuador",
  },
  {
    key: "EG",
    name: "Egypt",
  },
  {
    key: "SV",
    name: "El Salvador",
  },
  {
    key: "GQ",
    name: "Equatorial Guinea",
  },
  {
    key: "EE",
    name: "Estonia",
  },
  {
    key: "ET",
    name: "Ethiopia",
  },
  {
    key: "FK",
    name: "Falkland Islands",
  },
  {
    key: "FO",
    name: "Faroe Islands",
  },
  {
    key: "FJ",
    name: "Fiji",
  },
  {
    key: "FI",
    name: "Finland",
  },
  {
    key: "FR",
    name: "France",
  },
  {
    key: "GF",
    name: "French Guiana",
  },
  {
    key: "PF",
    name: "French Polynesia",
  },
  {
    key: "TF",
    name: "French Southern Territories",
  },
  {
    key: "GA",
    name: "Gabon",
  },
  {
    key: "GM",
    name: "Gambia",
  },
  {
    key: "GE",
    name: "Georgia",
  },
  {
    key: "DE",
    name: "Germany",
  },
  {
    key: "GH",
    name: "Ghana",
  },
  {
    key: "GI",
    name: "Gibraltar",
  },
  {
    key: "GR",
    name: "Greece",
  },
  {
    key: "GL",
    name: "Greenland",
  },
  {
    key: "GD",
    name: "Grenada",
  },
  {
    key: "GP",
    name: "Guadeloupe",
  },
  {
    key: "GU",
    name: "Guam",
  },
  {
    key: "GT",
    name: "Guatemala",
  },
  {
    key: "GG",
    name: "Guernsey",
  },
  {
    key: "GN",
    name: "Guinea",
  },
  {
    key: "GW",
    name: "Guinea-Bissau",
  },
  {
    key: "GY",
    name: "Guyana",
  },
  {
    key: "HT",
    name: "Haiti",
  },
  {
    key: "HM",
    name: "Heard Island and McDonald Islands",
  },
  {
    key: "HN",
    name: "Honduras",
  },
  {
    key: "HK",
    name: "Hong Kong",
  },
  {
    key: "HU",
    name: "Hungary",
  },
  {
    key: "IS",
    name: "Iceland",
  },
  {
    key: "IN",
    name: "India",
  },
  {
    key: "ID",
    name: "Indonesia",
  },
  {
    key: "IE",
    name: "Ireland",
  },
  {
    key: "IM",
    name: "Isle of Man",
  },
  {
    key: "IL",
    name: "Israel",
  },
  {
    key: "IT",
    name: "Italy",
  },
  {
    key: "JM",
    name: "Jamaica",
  },
  {
    key: "JP",
    name: "Japan",
  },
  {
    key: "JE",
    name: "Jersey",
  },
  {
    key: "JO",
    name: "Jordan",
  },
  {
    key: "KZ",
    name: "Kazakhstan",
  },
  {
    key: "KE",
    name: "Kenya",
  },
  {
    key: "KI",
    name: "Kiribati",
  },
  {
    key: "XK",
    name: "Kosovo",
  },
  {
    key: "KW",
    name: "Kuwait",
  },
  {
    key: "KG",
    name: "Kyrgyzstan",
  },
  {
    key: "LA",
    name: "Laos",
  },
  {
    key: "LV",
    name: "Latvia",
  },
  {
    key: "LB",
    name: "Lebanon",
  },
  {
    key: "LS",
    name: "Lesotho",
  },
  {
    key: "LR",
    name: "Liberia",
  },
  {
    key: "LI",
    name: "Liechtenstein",
  },
  {
    key: "LT",
    name: "Lithuania",
  },
  {
    key: "LU",
    name: "Luxembourg",
  },
  {
    key: "MO",
    name: "Macao",
  },
  {
    key: "MK",
    name: "Macedonia, Former Yugoslav Republic of",
  },
  {
    key: "MG",
    name: "Madagascar",
  },
  {
    key: "MW",
    name: "Malawi",
  },
  {
    key: "MY",
    name: "Malaysia",
  },
  {
    key: "MV",
    name: "Maldives",
  },
  {
    key: "ML",
    name: "Mali",
  },
  {
    key: "MT",
    name: "Malta",
  },
  {
    key: "MH",
    name: "Marshall Islands",
  },
  {
    key: "MQ",
    name: "Martinique",
  },
  {
    key: "MR",
    name: "Mauritania",
  },
  {
    key: "MU",
    name: "Mauritius",
  },
  {
    key: "YT",
    name: "Mayotte",
  },
  {
    key: "MX",
    name: "Mexico",
  },
  {
    key: "FM",
    name: "Micronesia, Federated States of",
  },
  {
    key: "MD",
    name: "Moldova",
  },
  {
    key: "MC",
    name: "Monaco",
  },
  {
    key: "MN",
    name: "Mongolia",
  },
  {
    key: "ME",
    name: "Montenegro",
  },
  {
    key: "MS",
    name: "Montserrat",
  },
  {
    key: "MA",
    name: "Morocco",
  },
  {
    key: "MZ",
    name: "Mozambique",
  },
  {
    key: "NA",
    name: "Namibia",
  },
  {
    key: "NR",
    name: "Nauru",
  },
  {
    key: "NP",
    name: "Nepal",
  },
  {
    key: "NL",
    name: "Netherlands",
  },
  {
    key: "AN",
    name: "Netherlands Antilles",
  },
  {
    key: "NC",
    name: "New Caledonia",
  },
  {
    key: "NZ",
    name: "New Zealand",
  },
  {
    key: "NI",
    name: "Nicaragua",
  },
  {
    key: "NE",
    name: "Niger",
  },
  {
    key: "NG",
    name: "Nigeria",
  },
  {
    key: "NU",
    name: "Niue",
  },
  {
    key: "NF",
    name: "Norfolk Island",
  },
  {
    key: "MP",
    name: "Northern Mariana Islands",
  },
  {
    key: "NO",
    name: "Norway",
  },
  {
    key: "OM",
    name: "Oman",
  },
  {
    key: "PK",
    name: "Pakistan",
  },
  {
    key: "PW",
    name: "Palau",
  },
  {
    key: "PS",
    name: "Palestine",
  },
  {
    key: "PA",
    name: "Panama",
  },
  {
    key: "PG",
    name: "Papua New Guinea",
  },
  {
    key: "PY",
    name: "Paraguay",
  },
  {
    key: "PE",
    name: "Peru",
  },
  {
    key: "PH",
    name: "Philippines",
  },
  {
    key: "PN",
    name: "Pitcairn Islands",
  },
  {
    key: "PL",
    name: "Poland",
  },
  {
    key: "PT",
    name: "Portugal",
  },
  {
    key: "PR",
    name: "Puerto Rico",
  },
  {
    key: "QA",
    name: "Qatar",
  },
  {
    key: "RO",
    name: "Romania",
  },
  {
    key: "RW",
    name: "Rwanda",
  },
  {
    key: "RE",
    name: "Réunion",
  },
  {
    key: "BL",
    name: "Saint Barthélemy",
  },
  {
    key: "SH",
    name: "Saint Helena",
  },
  {
    key: "KN",
    name: "Saint Kitts and Nevis",
  },
  {
    key: "LC",
    name: "Saint Lucia",
  },
  {
    key: "MF",
    name: "Saint Martin (French part)",
  },
  {
    key: "PM",
    name: "Saint Pierre and Miquelon",
  },
  {
    key: "VC",
    name: "Saint Vincent and the Grenadines",
  },
  {
    key: "WS",
    name: "Samoa",
  },
  {
    key: "SM",
    name: "San Marino",
  },
  {
    key: "ST",
    name: "Sao Tome and Principe",
  },
  {
    key: "SA",
    name: "Saudi Arabia",
  },
  {
    key: "SN",
    name: "Senegal",
  },
  {
    key: "RS",
    name: "Serbia",
  },
  {
    key: "SC",
    name: "Seychelles",
  },
  {
    key: "SL",
    name: "Sierra Leone",
  },
  {
    key: "SG",
    name: "Singapore",
  },
  {
    key: "SX",
    name: "Sint Maarten (Dutch part)",
  },
  {
    key: "SK",
    name: "Slovakia",
  },
  {
    key: "SI",
    name: "Slovenia",
  },
  {
    key: "SB",
    name: "Solomon Islands",
  },
  {
    key: "ZA",
    name: "South Africa",
  },
  {
    key: "GS",
    name: "South Georgia and the South Sandwich Islands",
  },
  {
    key: "KR",
    name: "South Korea",
  },
  {
    key: "ES",
    name: "Spain",
  },
  {
    key: "LK",
    name: "Sri Lanka",
  },
  {
    key: "SR",
    name: "Suriname",
  },
  {
    key: "SJ",
    name: "Svalbard and Jan Mayen",
  },
  {
    key: "SZ",
    name: "Swaziland",
  },
  {
    key: "SE",
    name: "Sweden",
  },
  {
    key: "CH",
    name: "Switzerland",
  },
  {
    key: "TW",
    name: "Taiwan",
  },
  {
    key: "TJ",
    name: "Tajikistan",
  },
  {
    key: "TZ",
    name: "Tanzania",
  },
  {
    key: "TH",
    name: "Thailand",
  },
  {
    key: "TL",
    name: "Timor-Leste",
  },
  {
    key: "TG",
    name: "Togo",
  },
  {
    key: "TK",
    name: "Tokelau",
  },
  {
    key: "TO",
    name: "Tonga",
  },
  {
    key: "TT",
    name: "Trinidad and Tobago",
  },
  {
    key: "TN",
    name: "Tunisia",
  },
  {
    key: "TR",
    name: "Turkey",
  },
  {
    key: "TM",
    name: "Turkmenistan",
  },
  {
    key: "TC",
    name: "Turks and Caicos Islands",
  },
  {
    key: "TV",
    name: "Tuvalu",
  },
  {
    key: "UG",
    name: "Uganda",
  },
  {
    key: "UA",
    name: "Ukraine",
  },
  {
    key: "AE",
    name: "United Arab Emirates",
  },
  {
    key: "GB",
    name: "United Kingdom",
  },
  {
    key: "US",
    name: "United States",
  },
  {
    key: "UM",
    name: "United States Minor Outlying Islands",
  },
  {
    key: "VI",
    name: "United States Virgin Islands",
  },
  {
    key: "UY",
    name: "Uruguay",
  },
  {
    key: "UZ",
    name: "Uzbekistan",
  },
  {
    key: "VU",
    name: "Vanuatu",
  },
  {
    key: "VA",
    name: "Vatican City",
  },
  {
    key: "VN",
    name: "Vietnam",
  },
  {
    key: "WF",
    name: "Wallis and Futuna",
  },
  {
    key: "EH",
    name: "Western Sahara",
  },
  {
    key: "ZM",
    name: "Zambia",
  },
  {
    key: "ZW",
    name: "Zimbabwe",
  },
  {
    key: "AX",
    name: "Åland Islands",
  },
];

export default formCoutries;
