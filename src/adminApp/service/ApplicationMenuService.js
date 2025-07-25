import { httpClient as http } from "../../common/utils/httpClient";
import AdminMenuItem from "../ApplicationMenu/AdminMenuItem";

const menuItemEndpoint = "/web/menuItem";

class ApplicationMenuService {
  static getMenuItem(id) {
    return http.getData(`${menuItemEndpoint}/${id}`).then(result => AdminMenuItem.fromResource(result));
  }

  static getMenuList(queryParams = "") {
    return http.getPageData("menuItemWebResponses", `${menuItemEndpoint}${queryParams}`);
  }

  static put(menuItem) {
    return http.put(`${menuItemEndpoint}/${menuItem.id}`, menuItem);
  }

  static post(menuItem) {
    return http.post(menuItemEndpoint, menuItem);
  }

  static deleteMenu(id) {
    return http.delete(`${menuItemEndpoint}/${id}`);
  }
}

export default ApplicationMenuService;
