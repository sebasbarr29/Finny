import Link from "next/link";
import { logout } from "@/app/(auth)/actions";
import type { User } from "@/lib/auth";
import { LogoMark } from "./icons";

export default function AppHeader({ user }: { user: User }) {
  return (
    <header className="nav">
      <div className="wrap">
        <Link className="logo" href="/dashboard"><LogoMark />Finny</Link>
        <div className="nav-right">
          <span className="user-email" title={user.email}>{user.email}</span>
          <form action={logout}>
            <button className="btn btn-secondary" type="submit">Log out</button>
          </form>
        </div>
      </div>
    </header>
  );
}
