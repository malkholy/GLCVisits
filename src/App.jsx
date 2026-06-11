import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard    from './pages/visits/Dashboard'
import VisitList    from './pages/visits/VisitList'
import VisitNew     from './pages/visits/VisitNew'
import VisitDetails from './pages/visits/VisitDetails'
import Targets      from './pages/targets/Targets'
import Settings     from './pages/settings/Settings'
import './App.css'

export default function App() {
  return (
    <BrowserRouter basename="/GLCVisits">
      <div className="app-shell">
        <Sidebar/>
        <main className="main">
          <Routes>
            <Route path="/"               element={<Dashboard/>}/>
            <Route path="/visits"         element={<VisitList/>}/>
            <Route path="/visits/new"     element={<VisitNew/>}/>
            <Route path="/visits/:id"     element={<VisitDetails/>}/>
            <Route path="/targets"        element={<Targets/>}/>
            <Route path="/settings"       element={<Settings/>}/>
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
