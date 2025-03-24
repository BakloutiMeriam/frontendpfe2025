import React from "react";
import UserList from "../components/UserList";
import Layout from "../components/Layout";
const UserListPage = () => {
  return (
    <>
      <div>
        <Layout>
          <UserList />
        </Layout>
      </div>
    </>
  );
};
export const metadata = { title: "UserList" };
export default UserListPage;
