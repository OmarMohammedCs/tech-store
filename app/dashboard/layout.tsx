"use client";

import MainLayout from "../mainLayout";


 

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout >

 
        <main>{children}</main>
 
    </MainLayout>
  );
}
