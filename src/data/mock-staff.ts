import { User } from "@/types";

export const mockStaff: User[] = [
  { id: "user-1", name: "Dr. Anika Patel", email: "apatel@sunnybrookheart.ca", role: "physician", isActive: true, initials: "AP" },
  { id: "user-2", name: "Dr. Marcus Chen", email: "mchen@sunnybrookheart.ca", role: "physician", isActive: true, initials: "MC" },
  { id: "user-3", name: "Sarah Mitchell", email: "smitchell@sunnybrookheart.ca", role: "clerk", isActive: true, initials: "SM" },
  { id: "user-4", name: "Jennifer Okafor", email: "jokafor@sunnybrookheart.ca", role: "clerk", isActive: true, initials: "JO" },
  { id: "user-5", name: "Priya Dhaliwal", email: "pdhaliwal@sunnybrookheart.ca", role: "nurse", isActive: true, initials: "PD" },
  { id: "user-6", name: "Lisa Park", email: "lpark@sunnybrookheart.ca", role: "admin", isActive: true, initials: "LP" },
];

export const currentUser: User = mockStaff[2]; // Sarah Mitchell is our demo user
