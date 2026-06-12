/*
    Sales Visit Management System
    Database Structure
    Without Schema
    SQL Server
*/

------------------------------------------------------------
-- 1. Master Tables
------------------------------------------------------------

if object_id('TargetTypeMaster', 'U') is null
begin
    create table TargetTypeMaster (
        TargetTypeID int identity(1,1) not null primary key,
        TargetTypeCode nvarchar(30) not null unique,
        TargetTypeName nvarchar(100) not null,
        IsActive bit not null default 1,
        CreatedDate datetime not null default getdate(),
        CreatedBy nvarchar(50) not null,
        LastMaintDate datetime null,
        LastMaintBy nvarchar(50) null
    )
end
go

if object_id('VisitPurposeMaster', 'U') is null
begin
    create table VisitPurposeMaster (
        PurposeID int identity(1,1) not null primary key,
        PurposeCode nvarchar(30) not null unique,
        PurposeName nvarchar(150) not null,
        RequiresSurvey bit not null default 0,
        IsActive bit not null default 1,
        CreatedDate datetime not null default getdate(),
        CreatedBy nvarchar(50) not null,
        LastMaintDate datetime null,
        LastMaintBy nvarchar(50) null
    )
end
go

if object_id('VisitStatusMaster', 'U') is null
begin
    create table VisitStatusMaster (
        StatusID int identity(1,1) not null primary key,
        StatusCode nvarchar(30) not null unique,
        StatusName nvarchar(100) not null,
        StatusOrder int not null,
        IsFinal bit not null default 0,
        IsActive bit not null default 1
    )
end
go

if object_id('VisitCancellationReason', 'U') is null
begin
    create table VisitCancellationReason (
        CancellationReasonID int identity(1,1) not null primary key,
        ReasonCode nvarchar(30) not null unique,
        ReasonName nvarchar(150) not null,
        IsActive bit not null default 1
    )
end
go

if object_id('VisitMissedReason', 'U') is null
begin
    create table VisitMissedReason (
        MissedReasonID int identity(1,1) not null primary key,
        ReasonCode nvarchar(30) not null unique,
        ReasonName nvarchar(150) not null,
        IsActive bit not null default 1
    )
end
go

------------------------------------------------------------
-- 2. Target Master
------------------------------------------------------------

if object_id('VisitTargetMaster', 'U') is null
begin
    create table VisitTargetMaster (
        TargetID int identity(1,1) not null primary key,
        TargetCode nvarchar(50) not null unique,
        TargetName nvarchar(200) not null,
        TargetTypeID int not null,
        Governorate nvarchar(100) null,
        Area nvarchar(100) null,
        City nvarchar(100) null,
        Address nvarchar(300) null,
        GPSLatitude decimal(18,10) null,
        GPSLongitude decimal(18,10) null,
        ContactPerson nvarchar(150) null,
        MobileNumber nvarchar(50) null,
        AssignedSalespersonID int null,
        AssignedManagerID int null,
        RelatedCustomerID int null,
        RelatedProjectID int null,
        TargetStatus nvarchar(20) not null default 'Active',
        IsActive bit not null default 1,
        CreatedDate datetime not null default getdate(),
        CreatedBy nvarchar(50) not null,
        LastMaintDate datetime null,
        LastMaintBy nvarchar(50) null,

        constraint FK_VisitTargetMaster_TargetType foreign key (TargetTypeID) references TargetTypeMaster(TargetTypeID)
    )
end
go

------------------------------------------------------------
-- 3. Visit Header
------------------------------------------------------------

if object_id('VisitHeader', 'U') is null
begin
    create table VisitHeader (
        VisitID int identity(1,1) not null primary key,
        VisitNo nvarchar(50) not null unique,

        VisitDate date not null,
        TargetID int not null,
        TargetTypeID int not null,
        PurposeID int not null,
        StatusID int not null,

        SalespersonID int not null,
        ManagerID int null,
        UserTeam nvarchar(50) not null,

        PlannedNotes nvarchar(max) null,
        VisitNotes nvarchar(max) null,
        FinalNotes nvarchar(max) null,

        IsSurveyRequired bit not null default 0,
        IsSurveySubmitted bit not null default 0,

        CheckInDateTime datetime null,
        CheckInLatitude decimal(18,10) null,
        CheckInLongitude decimal(18,10) null,
        CheckInDistanceMeter decimal(18,2) null,

        CheckOutDateTime datetime null,
        CheckOutLatitude decimal(18,10) null,
        CheckOutLongitude decimal(18,10) null,
        CheckOutDistanceMeter decimal(18,2) null,

        VisitDurationMinutes int null,

        CancellationReasonID int null,
        CancellationNotes nvarchar(max) null,

        MissedReasonID int null,
        MissedNotes nvarchar(max) null,

        CreatedDate datetime not null default getdate(),
        CreatedBy nvarchar(50) not null,
        LastMaintDate datetime null,
        LastMaintBy nvarchar(50) null,

        constraint FK_VisitHeader_Target foreign key (TargetID) references VisitTargetMaster(TargetID),
        constraint FK_VisitHeader_TargetType foreign key (TargetTypeID) references TargetTypeMaster(TargetTypeID),
        constraint FK_VisitHeader_Purpose foreign key (PurposeID) references VisitPurposeMaster(PurposeID),
        constraint FK_VisitHeader_Status foreign key (StatusID) references VisitStatusMaster(StatusID),
        constraint FK_VisitHeader_CancellationReason foreign key (CancellationReasonID) references VisitCancellationReason(CancellationReasonID),
        constraint FK_VisitHeader_MissedReason foreign key (MissedReasonID) references VisitMissedReason(MissedReasonID)
    )
end
go

------------------------------------------------------------
-- 4. Visit Status History
------------------------------------------------------------

if object_id('VisitStatusHistory', 'U') is null
begin
    create table VisitStatusHistory (
        HistoryID bigint identity(1,1) not null primary key,
        VisitID int not null,
        FromStatusID int null,
        ToStatusID int not null,
        ActionName nvarchar(100) not null,
        ActionDateTime datetime not null default getdate(),
        Latitude decimal(18,10) null,
        Longitude decimal(18,10) null,
        DistanceMeter decimal(18,2) null,
        Notes nvarchar(max) null,
        CreatedBy nvarchar(50) not null,

        constraint FK_VisitStatusHistory_Visit foreign key (VisitID) references VisitHeader(VisitID),
        constraint FK_VisitStatusHistory_FromStatus foreign key (FromStatusID) references VisitStatusMaster(StatusID),
        constraint FK_VisitStatusHistory_ToStatus foreign key (ToStatusID) references VisitStatusMaster(StatusID)
    )
end
go

------------------------------------------------------------
-- 5. Survey Tables
------------------------------------------------------------

if object_id('SurveyTemplateHeader', 'U') is null
begin
    create table SurveyTemplateHeader (
        SurveyTemplateID int identity(1,1) not null primary key,
        SurveyCode nvarchar(50) not null unique,
        SurveyName nvarchar(200) not null,
        TargetTypeID int null,
        PurposeID int null,
        UserTeam nvarchar(50) null,
        IsActive bit not null default 1,
        CreatedDate datetime not null default getdate(),
        CreatedBy nvarchar(50) not null,
        LastMaintDate datetime null,
        LastMaintBy nvarchar(50) null,

        constraint FK_SurveyTemplateHeader_TargetType foreign key (TargetTypeID) references TargetTypeMaster(TargetTypeID),
        constraint FK_SurveyTemplateHeader_Purpose foreign key (PurposeID) references VisitPurposeMaster(PurposeID)
    )
end
go

if object_id('SurveyGroup', 'U') is null
begin
    create table SurveyGroup (
        SurveyGroupID int identity(1,1) not null primary key,
        SurveyTemplateID int not null,
        GroupCode nvarchar(50) not null,
        GroupName nvarchar(150) not null,
        DisplayOrder int not null default 0,
        IsActive bit not null default 1,

        constraint FK_SurveyGroup_Template foreign key (SurveyTemplateID) references SurveyTemplateHeader(SurveyTemplateID),
        constraint UQ_SurveyGroup_Code unique (SurveyTemplateID, GroupCode)
    )
end
go

if object_id('SurveyQuestion', 'U') is null
begin
    create table SurveyQuestion (
        QuestionID int identity(1,1) not null primary key,
        SurveyTemplateID int not null,
        SurveyGroupID int null,
        QuestionCode nvarchar(50) null,
        QuestionText nvarchar(500) not null,
        QuestionType nvarchar(50) not null,
        IsRequired bit not null default 0,
        DisplayOrder int not null default 0,
        IsActive bit not null default 1,

        constraint FK_SurveyQuestion_Template foreign key (SurveyTemplateID) references SurveyTemplateHeader(SurveyTemplateID),
        constraint FK_SurveyQuestion_Group foreign key (SurveyGroupID) references SurveyGroup(SurveyGroupID)
    )
end
go

if object_id('SurveyQuestionOption', 'U') is null
begin
    create table SurveyQuestionOption (
        OptionID int identity(1,1) not null primary key,
        QuestionID int not null,
        OptionText nvarchar(200) not null,
        OptionValue nvarchar(100) null,
        DisplayOrder int not null default 0,
        IsActive bit not null default 1,

        constraint FK_SurveyQuestionOption_Question foreign key (QuestionID) references SurveyQuestion(QuestionID)
    )
end
go

if object_id('VisitSurveyHeader', 'U') is null
begin
    create table VisitSurveyHeader (
        VisitSurveyID int identity(1,1) not null primary key,
        VisitID int not null,
        SurveyTemplateID int not null,
        SurveyStatus nvarchar(30) not null default 'Draft',
        AnsweredQuestions int not null default 0,
        TotalQuestions int not null default 0,
        SubmittedDate datetime null,
        SubmittedBy nvarchar(50) null,
        CreatedDate datetime not null default getdate(),
        CreatedBy nvarchar(50) not null,

        constraint FK_VisitSurveyHeader_Visit foreign key (VisitID) references VisitHeader(VisitID),
        constraint FK_VisitSurveyHeader_Template foreign key (SurveyTemplateID) references SurveyTemplateHeader(SurveyTemplateID),
        constraint UQ_VisitSurveyHeader unique (VisitID, SurveyTemplateID)
    )
end
go

if object_id('VisitSurveyAnswer', 'U') is null
begin
    create table VisitSurveyAnswer (
        AnswerID bigint identity(1,1) not null primary key,
        VisitSurveyID int not null,
        QuestionID int not null,
        AnswerText nvarchar(max) null,
        AnswerNumber decimal(18,4) null,
        AnswerDate date null,
        OptionID int null,
        IsAnswered bit not null default 0,
        CreatedDate datetime not null default getdate(),
        CreatedBy nvarchar(50) not null,
        LastMaintDate datetime null,
        LastMaintBy nvarchar(50) null,

        constraint FK_VisitSurveyAnswer_Header foreign key (VisitSurveyID) references VisitSurveyHeader(VisitSurveyID),
        constraint FK_VisitSurveyAnswer_Question foreign key (QuestionID) references SurveyQuestion(QuestionID),
        constraint FK_VisitSurveyAnswer_Option foreign key (OptionID) references SurveyQuestionOption(OptionID)
    )
end
go

------------------------------------------------------------
-- 6. Visit Attachments
------------------------------------------------------------

if object_id('VisitAttachment', 'U') is null
begin
    create table VisitAttachment (
        AttachmentID bigint identity(1,1) not null primary key,
        VisitID int not null,
        AttachmentType nvarchar(50) not null,
        FileName nvarchar(300) not null,
        FilePath nvarchar(1000) not null,
        FileExtension nvarchar(20) null,
        FileSizeKB decimal(18,2) null,
        Latitude decimal(18,10) null,
        Longitude decimal(18,10) null,
        AttachmentNotes nvarchar(max) null,
        FileURL nvarchar(max) null,
        CreatedDate datetime not null default getdate(),
        CreatedBy nvarchar(50) not null,

        constraint FK_VisitAttachment_Visit foreign key (VisitID) references VisitHeader(VisitID)
    )
end
go

------------------------------------------------------------
-- 7. Competitor Info
------------------------------------------------------------

if object_id('VisitCompetitorInfo', 'U') is null
begin
    create table VisitCompetitorInfo (
        CompetitorInfoID bigint identity(1,1) not null primary key,
        VisitID int not null,
        CompetitorName nvarchar(200) null,
        ProductName nvarchar(200) null,
        OfferDescription nvarchar(max) null,
        Price decimal(18,2) null,
        Notes nvarchar(max) null,
        CreatedDate datetime not null default getdate(),
        CreatedBy nvarchar(50) not null,

        constraint FK_VisitCompetitorInfo_Visit foreign key (VisitID) references VisitHeader(VisitID)
    )
end
go

------------------------------------------------------------
-- 8. Display Inspection
------------------------------------------------------------

if object_id('VisitDisplayInspection', 'U') is null
begin
    create table VisitDisplayInspection (
        InspectionID bigint identity(1,1) not null primary key,
        VisitID int not null,
        DisplayStatus nvarchar(50) not null,
        IsDisplayClean bit null,
        IsColorCardAvailable bit null,
        IsStandAvailable bit null,
        MissingMaterials nvarchar(max) null,
        RequiredAction nvarchar(max) null,
        Notes nvarchar(max) null,
        CreatedDate datetime not null default getdate(),
        CreatedBy nvarchar(50) not null,
        LastMaintDate datetime null,
        LastMaintBy nvarchar(50) null,

        constraint FK_VisitDisplayInspection_Visit foreign key (VisitID) references VisitHeader(VisitID)
    )
end
go

------------------------------------------------------------
-- 9. Follow-up Tasks
------------------------------------------------------------

if object_id('VisitFollowUpTask', 'U') is null
begin
    create table VisitFollowUpTask (
        FollowUpTaskID bigint identity(1,1) not null primary key,
        VisitID int not null,
        TaskTitle nvarchar(200) not null,
        TaskDescription nvarchar(max) null,
        AssignedToUser nvarchar(50) null,
        DueDate date null,
        Priority nvarchar(30) not null default 'Normal',
        TaskStatus nvarchar(30) not null default 'Open',
        CompletedDate datetime null,
        CreatedDate datetime not null default getdate(),
        CreatedBy nvarchar(50) not null,
        LastMaintDate datetime null,
        LastMaintBy nvarchar(50) null,

        constraint FK_VisitFollowUpTask_Visit foreign key (VisitID) references VisitHeader(VisitID)
    )
end
go

------------------------------------------------------------
-- 10. Route Planning Optional Tables
------------------------------------------------------------

if object_id('VisitRoutePlan', 'U') is null
begin
    create table VisitRoutePlan (
        RoutePlanID int identity(1,1) not null primary key,
        RouteDate date not null,
        SalespersonID int not null,
        RouteName nvarchar(150) null,
        StartLatitude decimal(18,10) null,
        StartLongitude decimal(18,10) null,
        RouteStatus nvarchar(30) not null default 'Open',
        CreatedDate datetime not null default getdate(),
        CreatedBy nvarchar(50) not null
    )
end
go

if object_id('VisitRoutePlanLine', 'U') is null
begin
    create table VisitRoutePlanLine (
        RoutePlanLineID bigint identity(1,1) not null primary key,
        RoutePlanID int not null,
        TargetID int not null,
        PlannedVisitID int null,
        SequenceNo int not null,
        EstimatedDistanceKM decimal(18,2) null,
        EstimatedDurationMinutes int null,

        constraint FK_VisitRoutePlanLine_Header foreign key (RoutePlanID) references VisitRoutePlan(RoutePlanID),
        constraint FK_VisitRoutePlanLine_Target foreign key (TargetID) references VisitTargetMaster(TargetID),
        constraint FK_VisitRoutePlanLine_PlannedVisit foreign key (PlannedVisitID) references VisitHeader(VisitID)
    )
end
go

------------------------------------------------------------
-- 11. Main Master Inserts
------------------------------------------------------------

-- Target Types
if not exists (select 1 from TargetTypeMaster where TargetTypeCode = 'ERP_CUSTOMER')
    insert into TargetTypeMaster (TargetTypeCode, TargetTypeName, CreatedBy) values ('ERP_CUSTOMER', 'ERP Customer', 'system')

if not exists (select 1 from TargetTypeMaster where TargetTypeCode = 'SHOWROOM')
    insert into TargetTypeMaster (TargetTypeCode, TargetTypeName, CreatedBy) values ('SHOWROOM', 'Showroom', 'system')

if not exists (select 1 from TargetTypeMaster where TargetTypeCode = 'PROSPECT')
    insert into TargetTypeMaster (TargetTypeCode, TargetTypeName, CreatedBy) values ('PROSPECT', 'Non-GLC Customer / Prospect', 'system')

if not exists (select 1 from TargetTypeMaster where TargetTypeCode = 'PROJECT')
    insert into TargetTypeMaster (TargetTypeCode, TargetTypeName, CreatedBy) values ('PROJECT', 'Project', 'system')

if not exists (select 1 from TargetTypeMaster where TargetTypeCode = 'EVENT')
    insert into TargetTypeMaster (TargetTypeCode, TargetTypeName, CreatedBy) values ('EVENT', 'Event', 'system')
go

-- Visit Statuses
if not exists (select 1 from VisitStatusMaster where StatusCode = 'DRAFT')
    insert into VisitStatusMaster (StatusCode, StatusName, StatusOrder, IsFinal) values ('DRAFT', 'Draft', 1, 0)

if not exists (select 1 from VisitStatusMaster where StatusCode = 'PLANNED')
    insert into VisitStatusMaster (StatusCode, StatusName, StatusOrder, IsFinal) values ('PLANNED', 'Planned', 2, 0)

if not exists (select 1 from VisitStatusMaster where StatusCode = 'CHECKED_IN')
    insert into VisitStatusMaster (StatusCode, StatusName, StatusOrder, IsFinal) values ('CHECKED_IN', 'Checked-In', 3, 0)

if not exists (select 1 from VisitStatusMaster where StatusCode = 'CHECKED_OUT')
    insert into VisitStatusMaster (StatusCode, StatusName, StatusOrder, IsFinal) values ('CHECKED_OUT', 'Checked-Out', 4, 0)

if not exists (select 1 from VisitStatusMaster where StatusCode = 'COMPLETED')
    insert into VisitStatusMaster (StatusCode, StatusName, StatusOrder, IsFinal) values ('COMPLETED', 'Completed', 5, 1)

if not exists (select 1 from VisitStatusMaster where StatusCode = 'CANCELLED')
    insert into VisitStatusMaster (StatusCode, StatusName, StatusOrder, IsFinal) values ('CANCELLED', 'Cancelled', 6, 1)

if not exists (select 1 from VisitStatusMaster where StatusCode = 'MISSED')
    insert into VisitStatusMaster (StatusCode, StatusName, StatusOrder, IsFinal) values ('MISSED', 'Missed', 7, 1)
go

-- Visit Purposes
if not exists (select 1 from VisitPurposeMaster where PurposeCode = 'SALES_FOLLOWUP')
    insert into VisitPurposeMaster (PurposeCode, PurposeName, RequiresSurvey, CreatedBy) values ('SALES_FOLLOWUP', 'Sales Follow-up', 1, 'system')

if not exists (select 1 from VisitPurposeMaster where PurposeCode = 'COLLECTION_FOLLOWUP')
    insert into VisitPurposeMaster (PurposeCode, PurposeName, RequiresSurvey, CreatedBy) values ('COLLECTION_FOLLOWUP', 'Collection Follow-up', 0, 'system')

if not exists (select 1 from VisitPurposeMaster where PurposeCode = 'DISPLAY_INSPECTION')
    insert into VisitPurposeMaster (PurposeCode, PurposeName, RequiresSurvey, CreatedBy) values ('DISPLAY_INSPECTION', 'Display Inspection', 1, 'system')

if not exists (select 1 from VisitPurposeMaster where PurposeCode = 'COMPETITOR_INFO')
    insert into VisitPurposeMaster (PurposeCode, PurposeName, RequiresSurvey, CreatedBy) values ('COMPETITOR_INFO', 'Competitor Information', 1, 'system')

if not exists (select 1 from VisitPurposeMaster where PurposeCode = 'MERCHANT_SURVEY')
    insert into VisitPurposeMaster (PurposeCode, PurposeName, RequiresSurvey, CreatedBy) values ('MERCHANT_SURVEY', 'Merchant Survey', 1, 'system')

if not exists (select 1 from VisitPurposeMaster where PurposeCode = 'PROJECT_FOLLOWUP')
    insert into VisitPurposeMaster (PurposeCode, PurposeName, RequiresSurvey, CreatedBy) values ('PROJECT_FOLLOWUP', 'Project Follow-up', 0, 'system')

if not exists (select 1 from VisitPurposeMaster where PurposeCode = 'EVENT_VISIT')
    insert into VisitPurposeMaster (PurposeCode, PurposeName, RequiresSurvey, CreatedBy) values ('EVENT_VISIT', 'Event Visit', 1, 'system')

if not exists (select 1 from VisitPurposeMaster where PurposeCode = 'NEW_PROSPECT')
    insert into VisitPurposeMaster (PurposeCode, PurposeName, RequiresSurvey, CreatedBy) values ('NEW_PROSPECT', 'New Prospect', 0, 'system')
go

-- Cancellation Reasons
if not exists (select 1 from VisitCancellationReason where ReasonCode = 'CUSTOMER_UNAVAILABLE')
    insert into VisitCancellationReason (ReasonCode, ReasonName) values ('CUSTOMER_UNAVAILABLE', 'Customer unavailable')

if not exists (select 1 from VisitCancellationReason where ReasonCode = 'WRONG_LOCATION')
    insert into VisitCancellationReason (ReasonCode, ReasonName) values ('WRONG_LOCATION', 'Wrong location')

if not exists (select 1 from VisitCancellationReason where ReasonCode = 'SCHEDULE_CONFLICT')
    insert into VisitCancellationReason (ReasonCode, ReasonName) values ('SCHEDULE_CONFLICT', 'Schedule conflict')

if not exists (select 1 from VisitCancellationReason where ReasonCode = 'EMERGENCY')
    insert into VisitCancellationReason (ReasonCode, ReasonName) values ('EMERGENCY', 'Emergency')
go

-- Missed Reasons
if not exists (select 1 from VisitMissedReason where ReasonCode = 'COULD_NOT_REACH')
    insert into VisitMissedReason (ReasonCode, ReasonName) values ('COULD_NOT_REACH', 'Could not reach target')

if not exists (select 1 from VisitMissedReason where ReasonCode = 'PREVIOUS_VISIT_DELAY')
    insert into VisitMissedReason (ReasonCode, ReasonName) values ('PREVIOUS_VISIT_DELAY', 'Delayed by previous visits')

if not exists (select 1 from VisitMissedReason where ReasonCode = 'PERMISSION_ISSUE')
    insert into VisitMissedReason (ReasonCode, ReasonName) values ('PERMISSION_ISSUE', 'Permission issue')

if not exists (select 1 from VisitMissedReason where ReasonCode = 'NO_SHOW')
    insert into VisitMissedReason (ReasonCode, ReasonName) values ('NO_SHOW', 'User did not visit')
go

------------------------------------------------------------
-- 12. Sample Survey Template Inserts
------------------------------------------------------------

declare @SurveyTemplateID int

if not exists (select 1 from SurveyTemplateHeader where SurveyCode = 'SHOWROOM_STANDARD')
begin
    insert into SurveyTemplateHeader (SurveyCode, SurveyName, TargetTypeID, PurposeID, UserTeam, CreatedBy)
    select 'SHOWROOM_STANDARD', 'Showroom Standard Survey', tt.TargetTypeID, null, null, 'system'
    from TargetTypeMaster tt
    where tt.TargetTypeCode = 'SHOWROOM'
end

select @SurveyTemplateID = SurveyTemplateID from SurveyTemplateHeader where SurveyCode = 'SHOWROOM_STANDARD'

if @SurveyTemplateID is not null
begin
    if not exists (select 1 from SurveyGroup where SurveyTemplateID = @SurveyTemplateID and GroupCode = 'DISPLAY')
        insert into SurveyGroup (SurveyTemplateID, GroupCode, GroupName, DisplayOrder) values (@SurveyTemplateID, 'DISPLAY', 'Display', 1)

    if not exists (select 1 from SurveyGroup where SurveyTemplateID = @SurveyTemplateID and GroupCode = 'COMPETITOR')
        insert into SurveyGroup (SurveyTemplateID, GroupCode, GroupName, DisplayOrder) values (@SurveyTemplateID, 'COMPETITOR', 'Competitor', 2)

    if not exists (select 1 from SurveyGroup where SurveyTemplateID = @SurveyTemplateID and GroupCode = 'CUSTOMER')
        insert into SurveyGroup (SurveyTemplateID, GroupCode, GroupName, DisplayOrder) values (@SurveyTemplateID, 'CUSTOMER', 'Customer', 3)

    if not exists (select 1 from SurveyGroup where SurveyTemplateID = @SurveyTemplateID and GroupCode = 'NOTES')
        insert into SurveyGroup (SurveyTemplateID, GroupCode, GroupName, DisplayOrder) values (@SurveyTemplateID, 'NOTES', 'Notes', 4)
end
go

declare @SurveyTemplateID2 int, @DisplayGroupID int, @CompetitorGroupID int, @CustomerGroupID int, @NotesGroupID int

select @SurveyTemplateID2 = SurveyTemplateID from SurveyTemplateHeader where SurveyCode = 'SHOWROOM_STANDARD'
select @DisplayGroupID = SurveyGroupID from SurveyGroup where SurveyTemplateID = @SurveyTemplateID2 and GroupCode = 'DISPLAY'
select @CompetitorGroupID = SurveyGroupID from SurveyGroup where SurveyTemplateID = @SurveyTemplateID2 and GroupCode = 'COMPETITOR'
select @CustomerGroupID = SurveyGroupID from SurveyGroup where SurveyTemplateID = @SurveyTemplateID2 and GroupCode = 'CUSTOMER'
select @NotesGroupID = SurveyGroupID from SurveyGroup where SurveyTemplateID = @SurveyTemplateID2 and GroupCode = 'NOTES'

if @SurveyTemplateID2 is not null
begin
    if not exists (select 1 from SurveyQuestion where SurveyTemplateID = @SurveyTemplateID2 and QuestionCode = 'DISPLAY_CLEAN')
        insert into SurveyQuestion (SurveyTemplateID, SurveyGroupID, QuestionCode, QuestionText, QuestionType, IsRequired, DisplayOrder)
        values (@SurveyTemplateID2, @DisplayGroupID, 'DISPLAY_CLEAN', 'How would you rate the cleanliness of the product display?', 'SingleChoice', 1, 1)

    if not exists (select 1 from SurveyQuestion where SurveyTemplateID = @SurveyTemplateID2 and QuestionCode = 'COLOR_CARDS_AVAILABLE')
        insert into SurveyQuestion (SurveyTemplateID, SurveyGroupID, QuestionCode, QuestionText, QuestionType, IsRequired, DisplayOrder)
        values (@SurveyTemplateID2, @DisplayGroupID, 'COLOR_CARDS_AVAILABLE', 'Are all required color cards available?', 'SingleChoice', 0, 2)

    if not exists (select 1 from SurveyQuestion where SurveyTemplateID = @SurveyTemplateID2 and QuestionCode = 'DISPLAY_STAND_STATUS')
        insert into SurveyQuestion (SurveyTemplateID, SurveyGroupID, QuestionCode, QuestionText, QuestionType, IsRequired, DisplayOrder)
        values (@SurveyTemplateID2, @DisplayGroupID, 'DISPLAY_STAND_STATUS', 'Is the GLC display stand in good condition?', 'SingleChoice', 0, 3)

    if not exists (select 1 from SurveyQuestion where SurveyTemplateID = @SurveyTemplateID2 and QuestionCode = 'COMPETITOR_AVAILABLE')
        insert into SurveyQuestion (SurveyTemplateID, SurveyGroupID, QuestionCode, QuestionText, QuestionType, IsRequired, DisplayOrder)
        values (@SurveyTemplateID2, @CompetitorGroupID, 'COMPETITOR_AVAILABLE', 'Are competitor products available and visible in the store?', 'YesNo', 1, 4)

    if not exists (select 1 from SurveyQuestion where SurveyTemplateID = @SurveyTemplateID2 and QuestionCode = 'COMPETITOR_BRAND')
        insert into SurveyQuestion (SurveyTemplateID, SurveyGroupID, QuestionCode, QuestionText, QuestionType, IsRequired, DisplayOrder)
        values (@SurveyTemplateID2, @CompetitorGroupID, 'COMPETITOR_BRAND', 'Main competitor brand observed', 'Text', 0, 5)

    if not exists (select 1 from SurveyQuestion where SurveyTemplateID = @SurveyTemplateID2 and QuestionCode = 'CUSTOMER_SATISFACTION')
        insert into SurveyQuestion (SurveyTemplateID, SurveyGroupID, QuestionCode, QuestionText, QuestionType, IsRequired, DisplayOrder)
        values (@SurveyTemplateID2, @CustomerGroupID, 'CUSTOMER_SATISFACTION', 'How would you rate customer satisfaction level?', 'SingleChoice', 1, 6)

    if not exists (select 1 from SurveyQuestion where SurveyTemplateID = @SurveyTemplateID2 and QuestionCode = 'FOLLOWUP_REQUIRED')
        insert into SurveyQuestion (SurveyTemplateID, SurveyGroupID, QuestionCode, QuestionText, QuestionType, IsRequired, DisplayOrder)
        values (@SurveyTemplateID2, @NotesGroupID, 'FOLLOWUP_REQUIRED', 'Is follow-up required?', 'YesNo', 0, 7)
end
go

------------------------------------------------------------
-- 13. Survey Question Options
------------------------------------------------------------

declare @QuestionID int

select @QuestionID = QuestionID from SurveyQuestion where QuestionCode = 'DISPLAY_CLEAN'
if @QuestionID is not null
begin
    if not exists (select 1 from SurveyQuestionOption where QuestionID = @QuestionID and OptionText = 'Excellent')
        insert into SurveyQuestionOption (QuestionID, OptionText, OptionValue, DisplayOrder) values (@QuestionID, 'Excellent', 'Excellent', 1)
    if not exists (select 1 from SurveyQuestionOption where QuestionID = @QuestionID and OptionText = 'Good')
        insert into SurveyQuestionOption (QuestionID, OptionText, OptionValue, DisplayOrder) values (@QuestionID, 'Good', 'Good', 2)
    if not exists (select 1 from SurveyQuestionOption where QuestionID = @QuestionID and OptionText = 'Needs improvement')
        insert into SurveyQuestionOption (QuestionID, OptionText, OptionValue, DisplayOrder) values (@QuestionID, 'Needs improvement', 'Needs improvement', 3)
end

select @QuestionID = QuestionID from SurveyQuestion where QuestionCode = 'COLOR_CARDS_AVAILABLE'
if @QuestionID is not null
begin
    if not exists (select 1 from SurveyQuestionOption where QuestionID = @QuestionID and OptionText = 'Yes')
        insert into SurveyQuestionOption (QuestionID, OptionText, OptionValue, DisplayOrder) values (@QuestionID, 'Yes', 'Yes', 1)
    if not exists (select 1 from SurveyQuestionOption where QuestionID = @QuestionID and OptionText = 'No')
        insert into SurveyQuestionOption (QuestionID, OptionText, OptionValue, DisplayOrder) values (@QuestionID, 'No', 'No', 2)
    if not exists (select 1 from SurveyQuestionOption where QuestionID = @QuestionID and OptionText = 'Partially')
        insert into SurveyQuestionOption (QuestionID, OptionText, OptionValue, DisplayOrder) values (@QuestionID, 'Partially', 'Partially', 3)
end

select @QuestionID = QuestionID from SurveyQuestion where QuestionCode = 'DISPLAY_STAND_STATUS'
if @QuestionID is not null
begin
    if not exists (select 1 from SurveyQuestionOption where QuestionID = @QuestionID and OptionText = 'Good')
        insert into SurveyQuestionOption (QuestionID, OptionText, OptionValue, DisplayOrder) values (@QuestionID, 'Good', 'Good', 1)
    if not exists (select 1 from SurveyQuestionOption where QuestionID = @QuestionID and OptionText = 'Average')
        insert into SurveyQuestionOption (QuestionID, OptionText, OptionValue, DisplayOrder) values (@QuestionID, 'Average', 'Average', 2)
    if not exists (select 1 from SurveyQuestionOption where QuestionID = @QuestionID and OptionText = 'Damaged')
        insert into SurveyQuestionOption (QuestionID, OptionText, OptionValue, DisplayOrder) values (@QuestionID, 'Damaged', 'Damaged', 3)
end

select @QuestionID = QuestionID from SurveyQuestion where QuestionCode = 'COMPETITOR_AVAILABLE'
if @QuestionID is not null
begin
    if not exists (select 1 from SurveyQuestionOption where QuestionID = @QuestionID and OptionText = 'Yes')
        insert into SurveyQuestionOption (QuestionID, OptionText, OptionValue, DisplayOrder) values (@QuestionID, 'Yes', 'Yes', 1)
    if not exists (select 1 from SurveyQuestionOption where QuestionID = @QuestionID and OptionText = 'No')
        insert into SurveyQuestionOption (QuestionID, OptionText, OptionValue, DisplayOrder) values (@QuestionID, 'No', 'No', 2)
end

select @QuestionID = QuestionID from SurveyQuestion where QuestionCode = 'CUSTOMER_SATISFACTION'
if @QuestionID is not null
begin
    if not exists (select 1 from SurveyQuestionOption where QuestionID = @QuestionID and OptionText = 'Excellent')
        insert into SurveyQuestionOption (QuestionID, OptionText, OptionValue, DisplayOrder) values (@QuestionID, 'Excellent', 'Excellent', 1)
    if not exists (select 1 from SurveyQuestionOption where QuestionID = @QuestionID and OptionText = 'Good')
        insert into SurveyQuestionOption (QuestionID, OptionText, OptionValue, DisplayOrder) values (@QuestionID, 'Good', 'Good', 2)
    if not exists (select 1 from SurveyQuestionOption where QuestionID = @QuestionID and OptionText = 'Average')
        insert into SurveyQuestionOption (QuestionID, OptionText, OptionValue, DisplayOrder) values (@QuestionID, 'Average', 'Average', 3)
    if not exists (select 1 from SurveyQuestionOption where QuestionID = @QuestionID and OptionText = 'Poor')
        insert into SurveyQuestionOption (QuestionID, OptionText, OptionValue, DisplayOrder) values (@QuestionID, 'Poor', 'Poor', 4)
end

select @QuestionID = QuestionID from SurveyQuestion where QuestionCode = 'FOLLOWUP_REQUIRED'
if @QuestionID is not null
begin
    if not exists (select 1 from SurveyQuestionOption where QuestionID = @QuestionID and OptionText = 'Yes')
        insert into SurveyQuestionOption (QuestionID, OptionText, OptionValue, DisplayOrder) values (@QuestionID, 'Yes', 'Yes', 1)
    if not exists (select 1 from SurveyQuestionOption where QuestionID = @QuestionID and OptionText = 'No')
        insert into SurveyQuestionOption (QuestionID, OptionText, OptionValue, DisplayOrder) values (@QuestionID, 'No', 'No', 2)
end
go

------------------------------------------------------------
-- 14. Indexes
------------------------------------------------------------

if not exists (select 1 from sys.indexes where name = 'IX_VisitHeader_VisitDate' and object_id = object_id('VisitHeader'))
    create index IX_VisitHeader_VisitDate on VisitHeader (VisitDate)
go

if not exists (select 1 from sys.indexes where name = 'IX_VisitHeader_Salesperson_Status' and object_id = object_id('VisitHeader'))
    create index IX_VisitHeader_Salesperson_Status on VisitHeader (SalespersonID, StatusID, VisitDate)
go

if not exists (select 1 from sys.indexes where name = 'IX_VisitHeader_Target' and object_id = object_id('VisitHeader'))
    create index IX_VisitHeader_Target on VisitHeader (TargetID)
go

if not exists (select 1 from sys.indexes where name = 'IX_VisitTargetMaster_Location' and object_id = object_id('VisitTargetMaster'))
    create index IX_VisitTargetMaster_Location on VisitTargetMaster (Governorate, Area, TargetTypeID)
go

if not exists (select 1 from sys.indexes where name = 'IX_VisitTargetMaster_GPS' and object_id = object_id('VisitTargetMaster'))
    create index IX_VisitTargetMaster_GPS on VisitTargetMaster (GPSLatitude, GPSLongitude)
go

if not exists (select 1 from sys.indexes where name = 'IX_VisitStatusHistory_Visit' and object_id = object_id('VisitStatusHistory'))
    create index IX_VisitStatusHistory_Visit on VisitStatusHistory (VisitID, ActionDateTime)
go

if not exists (select 1 from sys.indexes where name = 'IX_VisitSurveyAnswer_Header' and object_id = object_id('VisitSurveyAnswer'))
    create index IX_VisitSurveyAnswer_Header on VisitSurveyAnswer (VisitSurveyID, QuestionID)
go

if not exists (select 1 from sys.indexes where name = 'IX_VisitAttachment_Visit' and object_id = object_id('VisitAttachment'))
    create index IX_VisitAttachment_Visit on VisitAttachment (VisitID)
go

if not exists (select 1 from sys.indexes where name = 'IX_VisitFollowUpTask_Visit' and object_id = object_id('VisitFollowUpTask'))
    create index IX_VisitFollowUpTask_Visit on VisitFollowUpTask (VisitID, TaskStatus)
go

------------------------------------------------------------
-- End of File
------------------------------------------------------------
