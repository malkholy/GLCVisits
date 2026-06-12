/*
    Sales Visit Management System
    Stored Procedure Additions: Operations for Visit Tabs
    (Attachments, Follow-ups, Competitor Info, Display Inspection)
    
    Instructions:
    1. Run Part 0 to ensure the DB has the new FileURL column.
    2. Run Part 1 to append the new operations to your APIVisitOperation stored procedure.
    3. Replace your existing 'Get Single' operation block with Part 2 so that it returns the new lists.
*/

-- ============================================================
-- PART 0: Database Schema Update (Run this first)
-- ============================================================
IF COL_LENGTH('dbo.VisitAttachment', 'FileURL') IS NULL
BEGIN
    ALTER TABLE dbo.VisitAttachment ADD FileURL NVARCHAR(MAX) NULL;
END
GO

-- ============================================================
-- PART 1: Stored Procedure Operations Additions
-- Add these blocks inside the body of your dbo.APIVisitOperation stored procedure.
-- ============================================================

-- ── 1. Save Attachment ──
IF @operation = 'Save Attachment'
BEGIN
    INSERT INTO dbo.VisitAttachment (
        VisitID, 
        AttachmentType, 
        FileName, 
        FilePath, 
        FileExtension, 
        FileSizeKB, 
        Latitude, 
        Longitude, 
        AttachmentNotes, 
        FileURL,
        CreatedBy,
        CreatedDate
    )
    SELECT 
        VisitID, 
        AttachmentType, 
        FileName, 
        FilePath, 
        FileExtension, 
        FileSizeKB, 
        Latitude, 
        Longitude, 
        AttachmentNotes, 
        FileURL,
        @User,
        GETDATE()
    FROM OPENJSON(@LineData)
    WITH (
        VisitID INT,
        AttachmentType NVARCHAR(50),
        FileName NVARCHAR(300),
        FilePath NVARCHAR(1000),
        FileExtension NVARCHAR(20),
        FileSizeKB DECIMAL(18,2),
        Latitude DECIMAL(18,10),
        Longitude DECIMAL(18,10),
        AttachmentNotes NVARCHAR(MAX),
        FileURL NVARCHAR(MAX)
    );

    SET @state = 0;
    SET @message = 'Attachment saved successfully';
    RETURN;
END

-- ── 2. Delete Attachment ──
IF @operation = 'Delete Attachment'
BEGIN
    DECLARE @TargetAttachmentID BIGINT;
    SELECT @TargetAttachmentID = AttachmentID 
    FROM OPENJSON(@LineData) 
    WITH (AttachmentID BIGINT);

    DELETE FROM dbo.VisitAttachment WHERE AttachmentID = @TargetAttachmentID;

    SET @state = 0;
    SET @message = 'Attachment deleted successfully';
    RETURN;
END

-- ── 3. Save Follow-up Task ──
IF @operation = 'Save Follow-up Task'
BEGIN
    DECLARE @FollowUpTaskID BIGINT, 
            @TVisitID INT, 
            @TaskTitle NVARCHAR(200), 
            @TaskDescription NVARCHAR(MAX), 
            @AssignedToUser NVARCHAR(50), 
            @DueDate DATE, 
            @Priority NVARCHAR(30), 
            @TaskStatus NVARCHAR(30);

    SELECT 
        @FollowUpTaskID = FollowUpTaskID,
        @TVisitID = VisitID,
        @TaskTitle = TaskTitle,
        @TaskDescription = TaskDescription,
        @AssignedToUser = AssignedToUser,
        @DueDate = DueDate,
        @Priority = Priority,
        @TaskStatus = TaskStatus
    FROM OPENJSON(@LineData)
    WITH (
        FollowUpTaskID BIGINT,
        VisitID INT,
        TaskTitle NVARCHAR(200),
        TaskDescription NVARCHAR(MAX),
        AssignedToUser NVARCHAR(50),
        DueDate DATE,
        Priority NVARCHAR(30),
        TaskStatus NVARCHAR(30)
    );

    IF EXISTS (SELECT 1 FROM dbo.VisitFollowUpTask WHERE FollowUpTaskID = @FollowUpTaskID)
    BEGIN
        UPDATE dbo.VisitFollowUpTask
        SET TaskTitle = @TaskTitle,
            TaskDescription = @TaskDescription,
            AssignedToUser = @AssignedToUser,
            DueDate = @DueDate,
            Priority = ISNULL(@Priority, 'Normal'),
            TaskStatus = ISNULL(@TaskStatus, 'Open'),
            LastMaintDate = GETDATE(),
            LastMaintBy = @User,
            CompletedDate = CASE WHEN ISNULL(@TaskStatus, 'Open') = 'Completed' AND TaskStatus <> 'Completed' THEN GETDATE() ELSE CompletedDate END
        WHERE FollowUpTaskID = @FollowUpTaskID;
    END
    ELSE
    BEGIN
        INSERT INTO dbo.VisitFollowUpTask (
            VisitID, 
            TaskTitle, 
            TaskDescription, 
            AssignedToUser, 
            DueDate, 
            Priority, 
            TaskStatus, 
            CreatedBy,
            CreatedDate
        ) VALUES (
            @TVisitID, 
            @TaskTitle, 
            @TaskDescription, 
            @AssignedToUser, 
            @DueDate, 
            ISNULL(@Priority, 'Normal'), 
            ISNULL(@TaskStatus, 'Open'), 
            @User,
            GETDATE()
        );
    END

    SET @state = 0;
    SET @message = 'Task saved successfully';
    RETURN;
END

-- ── 4. Delete Follow-up Task ──
IF @operation = 'Delete Follow-up Task'
BEGIN
    DECLARE @TargetTaskID BIGINT;
    SELECT @TargetTaskID = FollowUpTaskID 
    FROM OPENJSON(@LineData) 
    WITH (FollowUpTaskID BIGINT);

    DELETE FROM dbo.VisitFollowUpTask WHERE FollowUpTaskID = @TargetTaskID;

    SET @state = 0;
    SET @message = 'Task deleted successfully';
    RETURN;
END

-- ── 5. Save Competitor Info ──
IF @operation = 'Save Competitor Info'
BEGIN
    DECLARE @CompetitorInfoID BIGINT, 
            @CVisitID INT, 
            @CompetitorName NVARCHAR(200), 
            @ProductName NVARCHAR(200),
            @OfferDescription NVARCHAR(MAX), 
            @Price DECIMAL(18,2), 
            @Notes NVARCHAR(MAX);

    SELECT 
        @CompetitorInfoID = CompetitorInfoID,
        @CVisitID = VisitID,
        @CompetitorName = CompetitorName,
        @ProductName = ProductName,
        @OfferDescription = OfferDescription,
        @Price = Price,
        @Notes = Notes
    FROM OPENJSON(@LineData)
    WITH (
        CompetitorInfoID BIGINT,
        VisitID INT,
        CompetitorName NVARCHAR(200),
        ProductName NVARCHAR(200),
        OfferDescription NVARCHAR(MAX),
        Price DECIMAL(18,2),
        Notes NVARCHAR(MAX)
    );

    IF EXISTS (SELECT 1 FROM dbo.VisitCompetitorInfo WHERE CompetitorInfoID = @CompetitorInfoID)
    BEGIN
        UPDATE dbo.VisitCompetitorInfo
        SET CompetitorName = @CompetitorName,
            ProductName = @ProductName,
            OfferDescription = @OfferDescription,
            Price = @Price,
            Notes = @Notes
        WHERE CompetitorInfoID = @CompetitorInfoID;
    END
    ELSE
    BEGIN
        INSERT INTO dbo.VisitCompetitorInfo (
            VisitID, 
            CompetitorName, 
            ProductName, 
            OfferDescription, 
            Price, 
            Notes, 
            CreatedBy,
            CreatedDate
        ) VALUES (
            @CVisitID, 
            @CompetitorName, 
            @ProductName, 
            @OfferDescription, 
            @Price, 
            @Notes, 
            @User,
            GETDATE()
        );
    END

    SET @state = 0;
    SET @message = 'Competitor info saved successfully';
    RETURN;
END

-- ── 6. Delete Competitor Info ──
IF @operation = 'Delete Competitor Info'
BEGIN
    DECLARE @TargetCompetitorInfoID BIGINT;
    SELECT @TargetCompetitorInfoID = CompetitorInfoID 
    FROM OPENJSON(@LineData) 
    WITH (CompetitorInfoID BIGINT);

    DELETE FROM dbo.VisitCompetitorInfo WHERE CompetitorInfoID = @TargetCompetitorInfoID;

    SET @state = 0;
    SET @message = 'Competitor info deleted successfully';
    RETURN;
END

-- ── 7. Save Display Inspection ──
IF @operation = 'Save Display Inspection'
BEGIN
    DECLARE @InspectionID BIGINT, 
            @IVisitID INT, 
            @DisplayStatus NVARCHAR(50), 
            @IsDisplayClean BIT,
            @IsColorCardAvailable BIT, 
            @IsStandAvailable BIT, 
            @MissingMaterials NVARCHAR(MAX),
            @RequiredAction NVARCHAR(MAX), 
            @INotes NVARCHAR(MAX);

    SELECT 
        @InspectionID = InspectionID,
        @IVisitID = VisitID,
        @DisplayStatus = DisplayStatus,
        @IsDisplayClean = IsDisplayClean,
        @IsColorCardAvailable = IsColorCardAvailable,
        @IsStandAvailable = IsStandAvailable,
        @MissingMaterials = MissingMaterials,
        @RequiredAction = RequiredAction,
        @INotes = Notes
    FROM OPENJSON(@LineData)
    WITH (
        InspectionID BIGINT,
        VisitID INT,
        DisplayStatus NVARCHAR(50),
        IsDisplayClean BIT,
        IsColorCardAvailable BIT,
        IsStandAvailable BIT,
        MissingMaterials NVARCHAR(MAX),
        RequiredAction NVARCHAR(MAX),
        Notes NVARCHAR(MAX)
    );

    IF EXISTS (SELECT 1 FROM dbo.VisitDisplayInspection WHERE VisitID = @IVisitID)
    BEGIN
        UPDATE dbo.VisitDisplayInspection
        SET DisplayStatus = ISNULL(@DisplayStatus, 'Inspected'),
            IsDisplayClean = @IsDisplayClean,
            IsColorCardAvailable = @IsColorCardAvailable,
            IsStandAvailable = @IsStandAvailable,
            MissingMaterials = @MissingMaterials,
            RequiredAction = @RequiredAction,
            Notes = @INotes,
            LastMaintDate = GETDATE(),
            LastMaintBy = @User
        WHERE VisitID = @IVisitID;
    END
    ELSE
    BEGIN
        INSERT INTO dbo.VisitDisplayInspection (
            VisitID, 
            DisplayStatus, 
            IsDisplayClean, 
            IsColorCardAvailable, 
            IsStandAvailable, 
            MissingMaterials, 
            RequiredAction, 
            Notes, 
            CreatedBy,
            CreatedDate
        ) VALUES (
            @IVisitID, 
            ISNULL(@DisplayStatus, 'Inspected'), 
            @IsDisplayClean, 
            @IsColorCardAvailable, 
            @IsStandAvailable, 
            @MissingMaterials, 
            @RequiredAction, 
            @INotes, 
            @User,
            GETDATE()
        );
    END

    SET @state = 0;
    SET @message = 'Display inspection saved successfully';
    RETURN;
END


-- ============================================================
-- PART 2: Update 'Get Single' Stored Procedure Operation
-- Replace your existing 'Get Single' block (inside APIVisitOperation) with this.
-- ============================================================
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

    -- List2: Visit Attachments
    SELECT 
        AttachmentID, 
        VisitID, 
        AttachmentType, 
        FileName, 
        FilePath, 
        FileExtension, 
        FileSizeKB, 
        Latitude, 
        Longitude, 
        AttachmentNotes, 
        FileURL,
        CreatedDate, 
        CreatedBy
    FROM dbo.VisitAttachment
    WHERE VisitID = @TargetVisitID
    ORDER BY CreatedDate DESC;

    -- List3: Visit Follow-up Tasks
    SELECT 
        FollowUpTaskID, 
        VisitID, 
        TaskTitle, 
        TaskDescription, 
        AssignedToUser, 
        DueDate, 
        Priority, 
        TaskStatus, 
        CompletedDate, 
        CreatedDate, 
        CreatedBy
    FROM dbo.VisitFollowUpTask
    WHERE VisitID = @TargetVisitID
    ORDER BY DueDate ASC, CreatedDate DESC;

    -- List4: Visit Competitor Information
    SELECT 
        CompetitorInfoID, 
        VisitID, 
        CompetitorName, 
        ProductName, 
        OfferDescription, 
        Price, 
        Notes, 
        CreatedDate, 
        CreatedBy
    FROM dbo.VisitCompetitorInfo
    WHERE VisitID = @TargetVisitID
    ORDER BY CreatedDate DESC;

    -- List5: Visit Display Inspection
    SELECT 
        InspectionID, 
        VisitID, 
        DisplayStatus, 
        IsDisplayClean, 
        IsColorCardAvailable, 
        IsStandAvailable, 
        MissingMaterials, 
        RequiredAction, 
        Notes, 
        CreatedDate, 
        CreatedBy
    FROM dbo.VisitDisplayInspection
    WHERE VisitID = @TargetVisitID;

    SET @state = 0;
    SET @message = 'Success';
    RETURN;
END
GO
