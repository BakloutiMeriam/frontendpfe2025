import React from "react";
import UserList from "../components/UserList";
import Navbar from "../components/Navbar";
const UserListPage = () => {
  return (
    <>
      <div>
        <Navbar />
        <UserList />
      </div>
    </>
  );
};
export const metadata = { title: "UserList" };
export default UserListPage;
