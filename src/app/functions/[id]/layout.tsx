import FunctionHeader from "@/components/project/FunctionHeader";
import { SSEProvider } from "@/contexts/sse-context";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SSEProvider
      endpoint="http://localhost:8000/api/v1/sse/events"
      token="test-token"
      autoConnect={true}
    >
      <div className="">
        <FunctionHeader />
        {children}
      </div>
    </SSEProvider>
  );
}
