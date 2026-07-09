import { Routes, Route } from "react-router-dom";
import { Providers } from "@/components/providers";
import { AppFrame } from "@/components/app-frame";

import LandingPage from "@/app/page";
import LoginPage from "@/app/login/page";
import DashboardPage from "@/app/dashboard/page";
import ProgrammesPage from "@/app/programmes/page";
import NewProgrammePage from "@/app/programmes/new/page";
import ProgrammeDetailPage from "@/app/programmes/detail/page";
import UploadPage from "@/app/upload/page";
import AnalysisPage from "@/app/analysis/page";
import PersonasPage from "@/app/personas/page";
import ControlRoomPage from "@/app/control-room/page";
import SimulationPage from "@/app/simulation/page";
import InterventionsPage from "@/app/interventions/page";
import QuestionBankPage from "@/app/question-bank/page";
import ActivitiesPage from "@/app/activities/page";
import ReportsPage from "@/app/reports/page";
import AdminPage from "@/app/admin/page";
import UsersPage from "@/app/users/page";
import HelpPage from "@/app/help/page";

export default function App() {
  return (
    <Providers>
      <AppFrame>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/programmes" element={<ProgrammesPage />} />
          <Route path="/programmes/new" element={<NewProgrammePage />} />
          <Route path="/programmes/:id" element={<ProgrammeDetailPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/analysis" element={<AnalysisPage />} />
          <Route path="/personas" element={<PersonasPage />} />
          <Route path="/control-room" element={<ControlRoomPage />} />
          <Route path="/simulation" element={<SimulationPage />} />
          <Route path="/interventions" element={<InterventionsPage />} />
          <Route path="/question-bank" element={<QuestionBankPage />} />
          <Route path="/activities" element={<ActivitiesPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/help" element={<HelpPage />} />
        </Routes>
      </AppFrame>
    </Providers>
  );
}
