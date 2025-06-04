// scripts/createAdmin.ts
import { authService } from "@/features/auth/auth.service"; // Adjust the path as needed

export async function createDefaultUser() {

  const normalUserData = {
    name: "Normal User",
    tel: "13800138001",
    password: "userpassword",
  }

  try {
    const newNormalUser = await authService.register(normalUserData);
    console.log("Normal user created successfully:", newNormalUser);
  } catch (error) {
    console.error("Failed to create normal user:", error instanceof Error ? error.message : error);
  }

  const adminData = {
    name: "Admin User",
    tel: "13800138000", // example phone number
    password: "adminpassword", // use a strong password
  };

  try {
    const newAdmin = await authService.createAdminUser(adminData);
    console.log("Admin user created successfully:", newAdmin);
  } catch (error) {
    console.error(
      "Failed to create admin user:",
      error instanceof Error ? error.message : error,
    );
  }
}
