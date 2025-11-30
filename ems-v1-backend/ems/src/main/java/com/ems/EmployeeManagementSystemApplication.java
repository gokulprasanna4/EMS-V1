package com.ems;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.webmvc.autoconfigure.WebMvcProperties.Apiversion.Use;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.ems.modal.User;
import com.ems.repo.UserRepo;

@SpringBootApplication
public class EmployeeManagementSystemApplication {

	public static void main(String[] args) {
		SpringApplication.run(EmployeeManagementSystemApplication.class, args);
	}

	@Bean
	public CommandLineRunner initUsers(UserRepo userRepo, PasswordEncoder passwordEncoder) {
		return args -> {
			// 1. Create ADMIN
			if (userRepo.findByUsername("admin").isEmpty()) {
				User admin = new User();
				admin.setUsername("admin");
				admin.setPassword(passwordEncoder.encode("admin123")); // Password: admin
				admin.setRole(User.Role.ADMIN);
				admin.setActive(true);
				userRepo.save(admin);
				System.out.println("✅ ADMIN Created (admin/admin)");
			}

			// 2. Create MANAGER
			if (userRepo.findByUsername("manager").isEmpty()) {
				User manager = new User();
				manager.setUsername("manager");
				manager.setPassword(passwordEncoder.encode("manager123")); // Password: manager
				manager.setRole(User.Role.MANAGER);
				manager.setActive(true);
				userRepo.save(manager);
				System.out.println("✅ MANAGER Created (manager/manager)");
			}

			// 3. Create EMPLOYEE
			if (userRepo.findByUsername("employee").isEmpty()) {
				User employee = new User();
				employee.setUsername("employee");
				employee.setPassword(passwordEncoder.encode("employee123")); // Password: employee
				employee.setRole(User.Role.EMPLOYEE);
				employee.setReportingId(2L); // Assuming Manager has ID 2
				employee.setActive(true);
				userRepo.save(employee);
				System.out.println("✅ EMPLOYEE Created (employee/employee)");
			}
		};
	}
}
