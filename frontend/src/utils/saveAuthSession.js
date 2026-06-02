import Cookies from "js-cookie";
import { setToken } from "@services/httpServices";
import { buildUserInfoFromAuth } from "@utils/profileAuth";

export default function saveAuthSession(response, dispatch) {
  const userInfo = buildUserInfoFromAuth(response);
  setToken(response.token);
  Cookies.set("userInfo", JSON.stringify(userInfo), { expires: 1 });
  if (dispatch) {
    dispatch({ type: "USER_LOGIN", payload: userInfo });
  }
  return userInfo;
}
