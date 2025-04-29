import FunctionHeader from "@/components/project/FunctionHeader";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
        <div className="">
          <FunctionHeader />
          {children}
        </div>
  );
}
