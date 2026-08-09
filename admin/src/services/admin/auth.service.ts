import adminApi from "../../apis/adminApi";

class AuthService {
  checkIdentity() {
    return adminApi.get("/identity");
  }

  login(email: string, password: string) {
    return adminApi.post("/login", { email, password });
  }

  logout() {
    return adminApi.post("/logout");
  }
}

export default new AuthService();
