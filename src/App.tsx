import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/providers/AuthProvider";
import Index from "./pages/Index.tsx";
import Sports from "./pages/Sports.tsx";
import Live from "./pages/Live.tsx";
import Slots from "./pages/Slots.tsx";
import CandyMultiverse from "./pages/CandyMultiverse.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const router = createBrowserRouter(
  [
    { path: "/", element: <Index /> },
    { path: "/sports", element: <Sports /> },
    { path: "/live", element: <Live /> },
    { path: "/slots", element: <Slots /> },
    { path: "/candy-multiverse", element: <CandyMultiverse /> },
    { path: "*", element: <NotFound /> },
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  },
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
