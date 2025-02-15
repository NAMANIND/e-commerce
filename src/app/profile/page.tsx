import { Metadata } from "next";
import ProfileWrapper from "@/components/profile/profile-wrapper";

export const metadata: Metadata = {
  title: "My Profile",
  description: "Manage your account settings and preferences.",
};

export default function ProfilePage() {
  return <ProfileWrapper />;
}
