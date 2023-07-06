export const siteUrl =
  process.env.NODE_ENV === "production"
    ? "https://www.tuturly.com"
    : "http://localhost:3000";

export const subdomainSiteUrl = (schoolname) => {
  return process.env.NODE_ENV === "production"
    ? `https://${schoolname}.tuturly.com`
    : `http://${schoolname}.localhost:3000`;
};
