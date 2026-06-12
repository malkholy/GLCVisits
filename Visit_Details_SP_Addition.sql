/*
    Sales Visit Management System
    Stored Procedure Addition: Get Single Visit Details
    
    Instructions:
    1. Append this block to your main APIVisitOperation (or APIVisitHeaderOperation) stored procedure.
*/

-- ==========================================
-- Get Single Visit Details
-- ==========================================
IF @operation = 'Get Single'
BEGIN
    -- Detect TargetVisitID from direct SP parameter (@VisitID)
    DECLARE @TargetVisitID INT = @VisitID;
    
    -- Fallback if VisitID is sent inside @LineData JSON array
    IF @TargetVisitID IS NULL AND @LineData IS NOT NULL AND @LineData <> ''
    BEGIN
        SELECT @TargetVisitID = VisitID 
        FROM OPENJSON(@LineData) 
        WITH (VisitID INT);
    END

    -- List0: Visit Header Details
    SELECT 
        vh.VisitID,
        vh.VisitNo,
        vh.VisitDate,
        vh.TargetID,
        vh.TargetTypeID,
        tt.TargetTypeName,
        vh.PurposeID,
        vp.PurposeName,
        vh.StatusID,
        vs.StatusName,
        vh.SalespersonID,
        u.FullName AS SalespersonName,
        vh.ManagerID,
        vh.UserTeam,
        vh.PlannedNotes,
        vh.VisitNotes,
        vh.FinalNotes,
        vh.IsSurveyRequired,
        vh.IsSurveySubmitted,
        vh.CheckInDateTime,
        vh.CheckInLatitude,
        vh.CheckInLongitude,
        vh.CheckInDistanceMeter,
        vh.CheckOutDateTime,
        vh.CheckOutLatitude,
        vh.CheckOutLongitude,
        vh.CheckOutDistanceMeter,
        vh.VisitDurationMinutes,
        vh.CancellationReasonID,
        vh.CancellationNotes,
        vh.MissedReasonID,
        vh.MissedNotes,
        vt.ContactPerson,
        vt.MobileNumber,
        vt.Area,
        vt.Governorate,
        vt.TargetName
    FROM dbo.VisitHeader vh
    LEFT JOIN dbo.VisitTargetMaster vt ON vh.TargetID = vt.TargetID
    LEFT JOIN dbo.TargetTypeMaster tt ON vh.TargetTypeID = tt.TargetTypeID
    LEFT JOIN dbo.VisitPurposeMaster vp ON vh.PurposeID = vp.PurposeID
    LEFT JOIN dbo.VisitStatusMaster vs ON vh.StatusID = vs.StatusID
    LEFT JOIN dbo.UserMaster u ON vh.SalespersonID = u.UserID
    WHERE vh.VisitID = @TargetVisitID;

    -- List1: Status History
    SELECT 
        h.HistoryID,
        h.VisitID,
        h.FromStatusID,
        fs.StatusName AS FromStatusName,
        h.ToStatusID,
        ts.StatusName AS ToStatusName,
        h.ActionName,
        h.ActionDateTime,
        h.Latitude,
        h.Longitude,
        h.DistanceMeter,
        h.Notes,
        h.CreatedBy
    FROM dbo.VisitStatusHistory h
    LEFT JOIN dbo.VisitStatusMaster fs ON h.FromStatusID = fs.StatusID
    LEFT JOIN dbo.VisitStatusMaster ts ON h.ToStatusID = ts.StatusID
    WHERE h.VisitID = @TargetVisitID
    ORDER BY h.ActionDateTime ASC;

    SET @state = 0;
    SET @message = 'Success';
    RETURN;
END
GO
