export const mockVisits = [
  {
    VisitID: 1, VisitNo: 'VIS-2026-000148', VisitDate: '2026-06-11',
    TargetName: 'Al Madina Paint Center', Governorate: 'Cairo', Area: 'Nasr City',
    TargetTypeName: 'ERP Customer', PurposeName: 'Sales Follow-up',
    StatusCode: 'CHECKED_IN', StatusName: 'Checked-In',
    SalespersonName: 'Omar Samir', UserTeam: 'Sales Team A',
    CheckInDateTime: '2026-06-11T10:30:00', VisitDurationMinutes: null,
    IsSurveyRequired: 1, IsSurveySubmitted: 0,
  },
  {
    VisitID: 2, VisitNo: 'VIS-2026-000147', VisitDate: '2026-06-11',
    TargetName: 'Delta Showroom', Governorate: 'Cairo', Area: 'Heliopolis',
    TargetTypeName: 'Showroom', PurposeName: 'Display Inspection',
    StatusCode: 'PLANNED', StatusName: 'Planned',
    SalespersonName: 'Mohammad Ali', UserTeam: 'Sales Team B',
    CheckInDateTime: null, VisitDurationMinutes: null,
    IsSurveyRequired: 1, IsSurveySubmitted: 0,
  },
  {
    VisitID: 3, VisitNo: 'VIS-2026-000146', VisitDate: '2026-06-10',
    TargetName: 'New Capital Project', Governorate: 'Cairo', Area: 'New Cairo',
    TargetTypeName: 'Project', PurposeName: 'Project Follow-up',
    StatusCode: 'COMPLETED', StatusName: 'Completed',
    SalespersonName: 'Omar Samir', UserTeam: 'Sales Team A',
    CheckInDateTime: '2026-06-10T09:00:00', VisitDurationMinutes: 75,
    IsSurveyRequired: 0, IsSurveySubmitted: 0,
  },
  {
    VisitID: 4, VisitNo: 'VIS-2026-000144', VisitDate: '2026-06-09',
    TargetName: 'Future Paint Prospect', Governorate: 'Cairo', Area: 'Maadi',
    TargetTypeName: 'Prospect', PurposeName: 'New Prospect',
    StatusCode: 'CANCELLED', StatusName: 'Cancelled',
    SalespersonName: 'Ahmad Hassan', UserTeam: 'Sales Team B',
    CheckInDateTime: null, VisitDurationMinutes: null,
    IsSurveyRequired: 0, IsSurveySubmitted: 0,
  },
  {
    VisitID: 5, VisitNo: 'VIS-2026-000143', VisitDate: '2026-06-09',
    TargetName: 'City Paints', Governorate: 'Giza', Area: 'Dokki',
    TargetTypeName: 'ERP Customer', PurposeName: 'Collection Follow-up',
    StatusCode: 'MISSED', StatusName: 'Missed',
    SalespersonName: 'Mohammad Ali', UserTeam: 'Sales Team A',
    CheckInDateTime: null, VisitDurationMinutes: null,
    IsSurveyRequired: 0, IsSurveySubmitted: 0,
  },
]

export const mockTargetTypes = [
  { TargetTypeID: 1, TargetTypeCode: 'ERP_CUSTOMER', TargetTypeName: 'ERP Customer' },
  { TargetTypeID: 2, TargetTypeCode: 'SHOWROOM',     TargetTypeName: 'Showroom' },
  { TargetTypeID: 3, TargetTypeCode: 'PROSPECT',     TargetTypeName: 'Non-GLC / Prospect' },
  { TargetTypeID: 4, TargetTypeCode: 'PROJECT',      TargetTypeName: 'Project' },
  { TargetTypeID: 5, TargetTypeCode: 'EVENT',        TargetTypeName: 'Event' },
]

export const mockStatuses = [
  { StatusCode: 'DRAFT',       StatusName: 'Draft' },
  { StatusCode: 'PLANNED',     StatusName: 'Planned' },
  { StatusCode: 'CHECKED_IN',  StatusName: 'Checked-In' },
  { StatusCode: 'CHECKED_OUT', StatusName: 'Checked-Out' },
  { StatusCode: 'COMPLETED',   StatusName: 'Completed' },
  { StatusCode: 'CANCELLED',   StatusName: 'Cancelled' },
  { StatusCode: 'MISSED',      StatusName: 'Missed' },
]

export const mockGovernorates = [
  'Cairo','Giza','Alexandria','Dakahlia','Sharqia','Qalyubia','Kafr El Sheikh',
  'Gharbia','Monufia','Beheira','Ismailia','Port Said','Suez','Damietta',
  'Faiyum','Beni Suef','Minya','Asyut','Sohag','Qena','Aswan','Luxor',
  'Red Sea','New Valley','Matrouh','North Sinai','South Sinai',
]
