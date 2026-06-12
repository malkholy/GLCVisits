import { HashRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard    from './pages/visits/Dashboard'
import VisitList    from './pages/visits/VisitList'
import VisitNew     from './pages/visits/VisitNew'
import VisitDetails from './pages/visits/VisitDetails'
import Targets      from './pages/targets/Targets'
import Settings     from './pages/settings/Settings'
import UserMaster   from './pages/settings/UserMaster'
import TeamMaster   from './pages/settings/TeamMaster'
import UserPermissions from './pages/settings/UserPermissions'
import SurveyBuilder   from './pages/settings/SurveyBuilder'
import MergedSurveyDashboard from './pages/visits/MergedSurveyDashboard'
import './App.css'

export default function App() {
  return (
    <HashRouter>
      <div className="app-shell">
        <Sidebar/>
        <main className="main">
          <Routes>
            <Route path="/"               element={<Dashboard/>}/>
            <Route path="/visits"         element={<VisitList/>}/>
            <Route path="/visits/new"     element={<VisitNew/>}/>
            <Route path="/visits/:id"     element={<VisitDetails/>}/>
            <Route path="/targets"        element={<Targets/>}/>
            <Route path="/reports/dashboard" element={<MergedSurveyDashboard/>}/>
            <Route path="/settings"       element={<Settings/>}/>
            <Route path="/settings/users" element={<UserMaster/>}/>
            <Route path="/settings/teams" element={<TeamMaster/>}/>
            <Route path="/settings/permissions" element={<UserPermissions/>}/>
            <Route path="/settings/surveys"     element={<SurveyBuilder/>}/>
          </Routes>
        </main>
      </div>
    </HashRouter>
  )
}

