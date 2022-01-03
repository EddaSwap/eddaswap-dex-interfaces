import useMediaQuery from "@material-ui/core/useMediaQuery";

export const MD_MEDIA_QUERY = "(min-width:600px)";
export const MDL_MEDIA_QUERY = "(min-width:1024px)";
export const L_MEDIA_QUERY = "(min-width:1280px)";
export const XL_MEDIA_QUERY = "(min-width:1600px)";
export const MOBILE_QUERY = "(max-width:960px)";
export const DESKTOP_QUERY = "(min-width:961px)";

export const Desktop = ({ children }) => {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  return isDesktop ? children : null;
};
export const Mobile = ({ children }) => {
  const isMobile = useMediaQuery(MOBILE_QUERY);
  return isMobile ? children : null;
};
