import { Card, Button } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="grid place-items-center py-24">
      <Card className="p-10 text-center max-w-md">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-navy-800 text-white grid place-items-center text-lg font-bold mb-4">404</div>
        <h1 className="text-lg font-semibold text-navy-900">Page not found</h1>
        <p className="text-sm text-navy-400 mt-2 mb-6">The record or module you requested does not exist, or you may not have access to it under your current role.</p>
        <div className="flex justify-center">
          <Button href="/">Return to dashboard</Button>
        </div>
      </Card>
    </div>
  );
}
